import type { LeadType } from '@prisma/client';

interface ScrapedItem {
  id: string;
  content: string;
  url: string;
  author?: string;
}

export interface LeadData {
  platform: 'REDDIT';
  leadType: LeadType;
  content: string;
  url: string;
  author?: string;
  reasoning: string;
}

// random dummy ai function
export async function processLeads(items: ScrapedItem[], leadDescription: string): Promise<LeadData[]> {
  const leads: LeadData[] = [];

  for (const item of items) {
    if (Math.random() < 0.15) {
      const leadTypes: LeadType[] = ['WARM', 'COLD', 'NEUTRAL'];
      const weights = [0.4, 0.3, 0.3];
      const random = Math.random();
      let leadType: LeadType;
      if (random < 0.4) {
        leadType = 'WARM';
      } else if (random < 0.7) {
        leadType = 'COLD';
      } else {
        leadType = 'NEUTRAL';
      }

      const reasoning = `Dummy reasoning: Content matches lead description "${leadDescription.substring(0, 50)}..." with type ${leadType}.`;

      leads.push({
        platform: 'REDDIT',
        leadType,
        content: item.content,
        url: item.url,
        author: item.author,
        reasoning,
      });
    }
  }

  return leads;
}
