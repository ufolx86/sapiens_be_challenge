import express from "express";
import { Request } from "express";
import { Workflow } from "../models/Workflow";
import { AppDataSource } from "../data-source";

interface Params {
  id: string;
}

const router = express.Router({ mergeParams: true });

router.get("/", (req: Request<Params>, res) => {
  const { id } = req.params;

  const workflowRepository = AppDataSource.getRepository(Workflow);
  workflowRepository.findOne({ where: { workflowId: id } }).then((workflow) => {
    if (!workflow?.workflowId) {
      res.status(404).send("Workfow ID Does not exist");
    } else if (workflow.status !== "completed") {
      res.status(400).send("Workflow not yet completed");
    } else {
      res.json({
        workflowId: workflow.workflowId,
        status: "completed",
        finalResult: JSON.parse(workflow.finalResult),
      });
    }
  });
});

export default router;
