import { Job } from "./Job";
import { Task } from "../models/Task";
import { AppDataSource } from "../data-source";
import { Result } from "../models/Result";

interface ResultTable {
  resultId: string;
  taskId: string;
  data: string | null;
}
interface IResult {
  taskId: string;
  type: string;
  output: string | null;
}
interface ResultObject {
  workflowId: string | undefined;
  tasks: IResult[];
  finalReport: string;
}
export class ReportGenerationJob implements Job {
  resultJson: ResultObject;

  constructor() {
    this.resultJson = {
      workflowId: undefined,
      tasks: [],
      finalReport: "Aggregated data and results",
    };
  }

  async getTasks(task: Task): Promise<Task[]> {
    // GET TASKS
    const taskRepository = AppDataSource.getRepository(Task);
    const tasks = await taskRepository.find({
      where: [{ workflow: { workflowId: task.workflow.workflowId } }],
    });
    return tasks;
  }

  async getResults(task: Task): Promise<ResultTable> {
    const resultRepository = AppDataSource.getRepository(Result);
    const resultId = task.resultId;
    let result = await resultRepository.find({ where: { resultId: resultId } });
    return result[0];
  }

  async objectBuilder(task: Task): Promise<void> {
    this.resultJson.workflowId = task.workflow.workflowId;
    const tasks = await this.getTasks(task);

    const resultPromises = tasks.map(async (task) => {
      const result = await this.getResults(task);
      return {
        taskId: task.taskId,
        type: task.taskType,
        output: result.data,
      };
    });
    const results = await Promise.all(resultPromises);
    this.resultJson.tasks.push(...results);
    console.log(this.resultJson);
  }

  async run(task: Task) {
    console.log("Running report generation");
    try {
      await this.objectBuilder(task);
    } catch (err) {
      console.log(err);
    } finally {
      return JSON.stringify(this.resultJson);
    }
  }
}
