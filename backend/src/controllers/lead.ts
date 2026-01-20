import { Request, Response } from "express";
import logger from "../lib/logger";
import db from "../lib/db";
import {
  getLeadsQuerySchema,
  leadIdParamSchema,
  updateLeadSchema,
  getScrapeJobsQuerySchema,
  monitorIdParamSchema,
} from "../types/lead";

export const getLeads = async (req: Request, res: Response) => {
  try {
    const queryResult = getLeadsQuerySchema.safeParse(req.query);
    if (!queryResult.success) {
      return res.status(400).json({ error: "Invalid query parameters" });
    }

    const { monitorId, platform, leadType, status, search, page, limit } =
      queryResult.data;
    const skip = (page - 1) * limit;

    const whereClause: any = {
      scrapeJob: {
        monitor: {
          userId: req.userId!,
        },
      },
    };

    if (monitorId) {
      whereClause.scrapeJob.monitorId = monitorId;
    }

    if (platform) {
      whereClause.platform = platform;
    }

    if (leadType) {
      whereClause.leadType = leadType;
    }

    if (status) {
      whereClause.status = status;
    }

    if (search) {
      whereClause.content = {
        contains: search,
        mode: "insensitive",
      };
    }

    const [leads, total] = await Promise.all([
      db.lead.findMany({
        where: whereClause,
        select: {
          id: true,
          platform: true,
          leadType: true,
          content: true,
          url: true,
          author: true,
          status: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      db.lead.count({ where: whereClause }),
    ]);

    const totalPages = Math.ceil(total / limit);

    res.json({
      message: "Leads retrieved successfully.",
      payload: {
        data: leads,
        pagination: {
          total,
          page,
          limit,
          totalPages,
        },
      },
    });
  } catch (err) {
    logger.error("Failed to fetch leads:", err);
    res.status(500).json({ error: "Failed to fetch leads" });
  }
};

export const getLead = async (req: Request, res: Response) => {
  try {
    const idResult = leadIdParamSchema.safeParse(req.params);
    if (!idResult.success) {
      return res.status(400).json({ error: "Invalid lead id" });
    }

    const { id } = idResult.data;

    const lead = await db.lead.findFirst({
      where: {
        id,
        scrapeJob: {
          monitor: {
            userId: req.userId!,
          },
        },
      },
      select: {
        id: true,
        platform: true,
        leadType: true,
        content: true,
        url: true,
        author: true,
        status: true,
        reasoning: true,
        createdAt: true,
      },
    });

    if (!lead) {
      return res.status(404).json({ error: "Lead not found" });
    }

    let status = lead.status;

    if (status === "NEW") {
      const updated = await db.lead.update({
        where: { id },
        data: { status: "VIEWED" },
        select: { status: true },
      });
      status = updated.status;
    }

    res.json({
      message: "Lead details retrieved successfully.",
      payload: { ...lead, status },
    });
  } catch (err) {
    logger.error("Failed to fetch lead:", err);
    res.status(500).json({ error: "Failed to fetch lead" });
  }
};

export const updateLead = async (req: Request, res: Response) => {
  try {
    const idResult = leadIdParamSchema.safeParse(req.params);
    if (!idResult.success) {
      return res.status(400).json({ error: "Invalid lead id" });
    }

    const payload = updateLeadSchema.safeParse(req.body);
    if (!payload.success) {
      return res.status(400).json({ error: "Invalid request body" });
    }

    const { id } = idResult.data;
    const updatedLead = await db.lead.updateMany({
      where: {
        id,
        scrapeJob: {
          monitor: {
            userId: req.userId!,
          },
        },
      },
      data: {
        status: payload.data.status,
      },
    });

    if (updatedLead.count === 0) {
      return res.status(404).json({ error: "Lead not found" });
    }

    res.json({
      message: "Lead updated successfully.",
      payload: { id, status: payload.data.status },
    });
  } catch (err) {
    logger.error("Failed to update lead:", err);
    res.status(500).json({ error: "Failed to update lead" });
  }
};

export const deleteLead = async (req: Request, res: Response) => {
  try {
    const idResult = leadIdParamSchema.safeParse(req.params);
    if (!idResult.success) {
      return res.status(400).json({ error: "Invalid lead id" });
    }

    const { id } = idResult.data;

    const deleted = await db.lead.deleteMany({
      where: {
        id,
        scrapeJob: {
          monitor: {
            userId: req.userId!,
          },
        },
      },
    });

    if (deleted.count === 0) {
      return res.status(404).json({ error: "Lead not found" });
    }

    res.json({
      message: "Lead deleted successfully.",
      payload: {},
    });
  } catch (err) {
    logger.error("Failed to delete lead:", err);
    res.status(500).json({ error: "Failed to delete lead" });
  }
};

export const getScrapeJobs = async (req: Request, res: Response) => {
  try {
    const monitorIdResult = monitorIdParamSchema.safeParse(req.params);
    if (!monitorIdResult.success) {
      return res.status(400).json({ error: "Invalid monitor id" });
    }

    const queryResult = getScrapeJobsQuerySchema.safeParse(req.query);
    if (!queryResult.success) {
      return res.status(400).json({ error: "Invalid query parameters" });
    }

    const { monitorId } = monitorIdResult.data;
    const { page, limit } = queryResult.data;
    const skip = (page - 1) * limit;

    const monitor = await db.monitor.findUnique({
      where: { id: monitorId },
    });

    if (!monitor) {
      return res.status(404).json({ error: "Monitor not found" });
    }

    if (monitor.userId !== req.userId!) {
      return res.status(403).json({ error: "Not authorized" });
    }

    const [scrapeJobs, total] = await Promise.all([
      db.scrapeJob.findMany({
        where: { monitorId },
        select: {
          id: true,
          status: true,
          warmLeads: true,
          coldLeads: true,
          neutralLeads: true,
          startedAt: true,
          completedAt: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      db.scrapeJob.count({ where: { monitorId } }),
    ]);

    const jobsWithMetadata = scrapeJobs.map((job) => ({
      ...job,
      leadCount: job.warmLeads + job.coldLeads + job.neutralLeads,
    }));

    const totalPages = Math.ceil(total / limit);

    res.json({
      message: "Scrape jobs retrieved successfully.",
      payload: {
        data: jobsWithMetadata,
        pagination: {
          total,
          page,
          limit,
          totalPages,
        },
      },
    });
  } catch (err) {
    logger.error("Failed to fetch scrape jobs:", err);
    res.status(500).json({ error: "Failed to fetch scrape jobs" });
  }
};

export const exportLeads = async (req: Request, res: Response) => {
  try {
    const queryResult = getLeadsQuerySchema.safeParse(req.query);
    if (!queryResult.success) {
      return res.status(400).json({ error: "Invalid query parameters" });
    }

    const { monitorId, platform, leadType, status, search } = queryResult.data;

    const whereClause: any = {
      scrapeJob: {
        monitor: {
          userId: req.userId!,
        },
      },
    };

    if (monitorId) {
      whereClause.scrapeJob.monitorId = monitorId;
    }

    if (platform) {
      whereClause.platform = platform;
    }

    if (leadType) {
      whereClause.leadType = leadType;
    }

    if (status) {
      whereClause.status = status;
    }

    if (search) {
      whereClause.content = {
        contains: search,
        mode: "insensitive",
      };
    }

    const leads = await db.lead.findMany({
      where: whereClause,
      select: {
        id: true,
        platform: true,
        leadType: true,
        content: true,
        url: true,
        author: true,
        status: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: 1000, // Limit export to 1000 leads
    });

    // Build CSV
    const headers = [
      "ID",
      "Platform",
      "Lead Type",
      "Content",
      "URL",
      "Author",
      "Status",
      "Created At",
    ];

    const escapeCSV = (value: string | null) => {
      if (!value) return "";
      if (value.includes(",") || value.includes('"') || value.includes("\n")) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    };

    const rows = leads.map((lead) =>
      [
        lead.id,
        lead.platform,
        lead.leadType,
        escapeCSV(lead.content),
        lead.url,
        lead.author || "",
        lead.status,
        new Date(lead.createdAt).toISOString(),
      ].join(","),
    );

    const csv = [headers.join(","), ...rows].join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=leads.csv");
    res.send(csv);
  } catch (err) {
    logger.error("Failed to export leads:", err);
    res.status(500).json({ error: "Failed to export leads" });
  }
};
