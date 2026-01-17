import { Request, Response } from "express";
import db from "../lib/db";
import {
  getKeywordLeadsQuerySchema,
  keywordLeadIdParamSchema,
  updateKeywordLeadSchema,
} from "../types/keyword-lead";

export async function getKeywordLeads(req: Request, res: Response) {
  try {
    const queryResult = getKeywordLeadsQuerySchema.safeParse(req.query);
    if (!queryResult.success) {
      return res.status(400).json({ error: "Invalid query parameters" });
    }

    const { keywordMonitorId, platform, status, search, page, limit } =
      queryResult.data;
    const skip = (page - 1) * limit;

    const whereClause: any = {
      scrapeJob: {
        keywordMonitor: {
          userId: req.userId!,
        },
      },
    };

    if (keywordMonitorId) {
      whereClause.scrapeJob.keywordMonitorId = keywordMonitorId;
    }

    if (platform) {
      whereClause.platform = platform;
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
      db.keywordLead.findMany({
        where: whereClause,
        select: {
          id: true,
          platform: true,
          content: true,
          url: true,
          author: true,
          matchedKeywords: true,
          status: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      db.keywordLead.count({ where: whereClause }),
    ]);

    const totalPages = Math.ceil(total / limit);

    res.json({
      message: "Keyword leads retrieved successfully.",
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
    console.error(err);
    res.status(500).json({ error: "Failed to fetch keyword leads" });
  }
}

export async function getKeywordLead(req: Request, res: Response) {
  try {
    const idResult = keywordLeadIdParamSchema.safeParse(req.params);
    if (!idResult.success) {
      return res.status(400).json({ error: "Invalid lead id" });
    }

    const { id } = idResult.data;

    const lead = await db.keywordLead.findFirst({
      where: {
        id,
        scrapeJob: {
          keywordMonitor: {
            userId: req.userId!,
          },
        },
      },
      select: {
        id: true,
        platform: true,
        content: true,
        url: true,
        author: true,
        matchedKeywords: true,
        status: true,
        createdAt: true,
      },
    });

    if (!lead) {
      return res.status(404).json({ error: "Lead not found" });
    }

    let status = lead.status;

    if (status === "NEW") {
      const updated = await db.keywordLead.update({
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
    console.error(err);
    res.status(500).json({ error: "Failed to fetch lead" });
  }
}

export async function updateKeywordLead(req: Request, res: Response) {
  try {
    const idResult = keywordLeadIdParamSchema.safeParse(req.params);
    if (!idResult.success) {
      return res.status(400).json({ error: "Invalid lead id" });
    }

    const payload = updateKeywordLeadSchema.safeParse(req.body);
    if (!payload.success) {
      return res.status(400).json({ error: "Invalid request body" });
    }

    const { id } = idResult.data;
    const updatedLead = await db.keywordLead.updateMany({
      where: {
        id,
        scrapeJob: {
          keywordMonitor: {
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
    console.error(err);
    res.status(500).json({ error: "Failed to update lead" });
  }
}

export async function deleteKeywordLead(req: Request, res: Response) {
  try {
    const idResult = keywordLeadIdParamSchema.safeParse(req.params);
    if (!idResult.success) {
      return res.status(400).json({ error: "Invalid lead id" });
    }

    const { id } = idResult.data;

    const deleted = await db.keywordLead.deleteMany({
      where: {
        id,
        scrapeJob: {
          keywordMonitor: {
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
    console.error(err);
    res.status(500).json({ error: "Failed to delete lead" });
  }
}

export async function exportKeywordLeads(req: Request, res: Response) {
  try {
    const queryResult = getKeywordLeadsQuerySchema.safeParse(req.query);
    if (!queryResult.success) {
      return res.status(400).json({ error: "Invalid query parameters" });
    }

    const { keywordMonitorId, platform, status, search } = queryResult.data;

    const whereClause: any = {
      scrapeJob: {
        keywordMonitor: {
          userId: req.userId!,
        },
      },
    };

    if (keywordMonitorId) {
      whereClause.scrapeJob.keywordMonitorId = keywordMonitorId;
    }

    if (platform) {
      whereClause.platform = platform;
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

    const leads = await db.keywordLead.findMany({
      where: whereClause,
      select: {
        id: true,
        platform: true,
        content: true,
        url: true,
        author: true,
        matchedKeywords: true,
        status: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: 1000,
    });

    const headers = [
      "ID",
      "Platform",
      "Content",
      "URL",
      "Author",
      "Matched Keywords",
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
        escapeCSV(lead.content),
        lead.url,
        lead.author || "",
        lead.matchedKeywords.join("; "),
        lead.status,
        new Date(lead.createdAt).toISOString(),
      ].join(",")
    );

    const csv = [headers.join(","), ...rows].join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=keyword-leads.csv"
    );
    res.send(csv);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to export keyword leads" });
  }
}
