import db from '../lib/db';
import type { LeadData } from './aiProcessor';
import type { LeadStatus } from '@prisma/client';

export async function createLeads(scrapeJobId: string, leads: LeadData[]): Promise<void> {
  if (leads.length === 0) return;

  const leadData = leads.map(lead => ({
    scrapeJobId,
    platform: lead.platform,
    leadType: lead.leadType,
    content: lead.content,
    url: lead.url,
    author: lead.author,
    reasoning: lead.reasoning,
    status: 'NEW' as LeadStatus,
  }));

  // Use skipDuplicates to handle unique constraint violations
  await db.lead.createMany({
    data: leadData,
    skipDuplicates: true,
  });
}
