import express from "express";
import { Request } from "express";
import { AppDataSource } from "../data-source";
import { Workflow } from "../models/Workflow";
import { Task } from "../models/Task";

interface Params {
  id: string;
}

const router = express.Router({ mergeParams: true });

async function getTasks(workflowId: string) {
  const workflowRepository = AppDataSource.getRepository(Workflow);
  const query = await workflowRepository.findOne({
    where: { workflowId },
    relations: ["tasks"],
  });

  return query?.tasks || [];
}

router.get("/", (req: Request<Params>, res) => {
  const { id } = req.params;

  const workflowRepository = AppDataSource.getRepository(Workflow);
  workflowRepository
    .findOne({ where: { workflowId: id } })
    .then(async (workflow) => {
      if (!workflow?.workflowId) {
        res.status(404).send("Workfow ID Does not exist");
      } else {
        const tasks = await getTasks(workflow.workflowId);
        const completed = tasks.filter((task) => task.status === "completed");
        res.json({
          workflowId: workflow.workflowId,
          status: workflow.status,
          completedTasks: completed.length,
          totalTasks: tasks.length,
        });
      }
    });
});

export default router;
