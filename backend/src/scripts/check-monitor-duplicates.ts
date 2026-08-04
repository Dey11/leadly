import db from "../lib/db";
import { getMonitorDuplicateDiagnostics } from "../services/monitor-diagnostics";

const email = process.argv[2]?.trim().toLowerCase();

if (!email) {
  console.error("Usage: bun src/scripts/check-monitor-duplicates.ts <email>");
  process.exit(2);
}

async function main() {
  try {
    const result = await getMonitorDuplicateDiagnostics(email);

    if (!result) {
      console.error(`Account not found: ${email}`);
      process.exitCode = 2;
    } else {
      console.log(JSON.stringify(result, null, 2));
      process.exitCode = result.duplicateGroupCount > 0 ? 1 : 0;
    }
  } finally {
    await db.$disconnect();
  }
}

void main();
