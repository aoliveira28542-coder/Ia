import { Router, type IRouter } from "express";
import healthRouter from "./health";
import jobsRouter from "./jobs";
import webhooksRouter from "./webhooks";
import systemRouter from "./system";
import presetsRouter from "./presets";
import charactersRouter from "./characters";
import uploadsRouter from "./uploads";

const router: IRouter = Router();

router.use(healthRouter);
router.use(jobsRouter);
router.use(webhooksRouter);
router.use(systemRouter);
router.use(presetsRouter);
router.use(charactersRouter);
router.use(uploadsRouter);

export default router;
