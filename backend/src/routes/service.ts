import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import * as serviceController from "../controllers/service";

const router = Router();

router.post("/", authMiddleware, serviceController.createService);
router.get("/", authMiddleware, serviceController.getServices);
router.get("/:id", authMiddleware, serviceController.getService);
router.patch("/:id", authMiddleware, serviceController.updateService);
router.delete("/:id", authMiddleware, serviceController.deleteService);

export default router;


