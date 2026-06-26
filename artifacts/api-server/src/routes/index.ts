import { Router, type IRouter } from "express";
import healthRouter from "./health";
import jobsRouter from "./jobs";
import webhooksRouter from "./webhooks";
import systemRouter from "./system";

const router: IRouter = Router();

router.use(healthRouter);
router.use(jobsRouter);
router.use(webhooksRouter);
router.use(systemRouter);

export default router;
