import { Request, Response } from "express";
import db from "../lib/db";
import {
  createServiceSchema,
  serviceIdParamSchema,
  updateServiceSchema,
} from "../types/service";

export const createService = async (req: Request, res: Response) => {
  try {
    const payload = createServiceSchema.safeParse(req.body);

    if (!payload.success) {
      return res.status(400).json({ error: "Invalid request body" });
    }

    const service = await db.service.create({
      data: {
        ...payload.data,
        userId: req.userId!,
      },
    });

    res.status(201).json(service);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create service" });
  }
};

export const getServices = async (req: Request, res: Response) => {
  try {
    const services = await db.service.findMany({
      where: { userId: req.userId },
      include: {
        monitors: {
          include: {
            scrapeJobs: {
              orderBy: { createdAt: "desc" },
            },
          },
        },
      },
    });

    res.json(services);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch services" });
  }
};

export const getService = async (req: Request, res: Response) => {
  try {
    const idResult = serviceIdParamSchema.safeParse(req.params);
    if (!idResult.success) {
      return res.status(400).json({ error: "Invalid service id" });
    }

    const { id } = idResult.data;

    const service = await db.service.findUnique({
      where: { id },
      include: {
        monitors: {
          include: {
            scrapeJobs: {
              orderBy: { createdAt: "desc" },
            },
          },
        },
      },
    });

    if (!service) return res.status(404).json({ error: "Service not found" });
    if (service.userId !== req.userId)
      return res.status(403).json({ error: "Not authorized" });

    res.json(service);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch service" });
  }
};

export const updateService = async (req: Request, res: Response) => {
  try {
    const idResult = serviceIdParamSchema.safeParse(req.params);
    if (!idResult.success) {
      return res.status(400).json({ error: "Invalid service id" });
    }

    const payload = updateServiceSchema.safeParse(req.body);
    if (!payload.success) {
      return res.status(400).json({ error: "Invalid request body" });
    }

    const { id } = idResult.data;

    const service = await db.service.findUnique({ where: { id } });

    if (!service) return res.status(404).json({ error: "Service not found" });
    if (service.userId !== req.userId)
      return res.status(403).json({ error: "Not authorized" });

    const updatedService = await db.service.update({
      where: { id },
      data: {
        ...payload.data,
      },
    });

    res.json(updatedService);
  } catch (err) {
    res.status(500).json({ error: "Failed to update service" });
  }
};

export const deleteService = async (req: Request, res: Response) => {
  try {
    const idResult = serviceIdParamSchema.safeParse(req.params);
    if (!idResult.success) {
      return res.status(400).json({ error: "Invalid service id" });
    }

    const { id } = idResult.data;

    const service = await db.service.findUnique({ where: { id } });

    if (!service) return res.status(404).json({ error: "Service not found" });
    if (service.userId !== req.userId)
      return res.status(403).json({ error: "Not authorized" });

    const monitorCount = await db.monitor.count({
      where: { serviceId: id },
    });

    if (monitorCount > 0) {
      return res.status(400).json({
        error:
          "Cannot delete service with active monitors. Delete monitors first.",
      });
    }

    await db.service.delete({ where: { id } });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete service" });
  }
};
