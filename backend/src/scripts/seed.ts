import prisma from "../lib/db";
import bcrypt from "bcrypt";

/**
 * Seed script for development/testing environments
 * Creates test users with pre-verified emails (no email confirmation needed)
 *
 * Usage: bun run seed
 */

const SALT_ROUNDS = 10;

interface SeedUser {
  email: string;
  password: string;
  name: string;
  tier: "FREE" | "PRO" | "PREMIUM";
}

const seedUsers: SeedUser[] = [
  {
    email: "free@test.leadly.live",
    password: "TestPass123!",
    name: "Free Test User",
    tier: "FREE",
  },
  {
    email: "pro@test.leadly.live",
    password: "TestPass123!",
    name: "Pro Test User",
    tier: "PRO",
  },
  {
    email: "premium@test.leadly.live",
    password: "TestPass123!",
    name: "Premium Test User",
    tier: "PREMIUM",
  },
];

async function seed() {
  console.log("🌱 Starting database seed...\n");

  for (const userData of seedUsers) {
    const existingUser = await prisma.user.findUnique({
      where: { email: userData.email },
    });

    if (existingUser) {
      console.log(`⏭️  User ${userData.email} already exists, skipping...`);
      continue;
    }

    const passwordHash = await bcrypt.hash(userData.password, SALT_ROUNDS);

    // Calculate subscription dates
    const now = new Date();
    const periodEnd = new Date();
    periodEnd.setFullYear(periodEnd.getFullYear() + 1); // 1 year from now

    const periodStart = new Date(now);
    periodStart.setDate(1); // First of current month

    const periodEndMonth = new Date(now);
    periodEndMonth.setMonth(periodEndMonth.getMonth() + 1);
    periodEndMonth.setDate(0); // Last day of current month

    const user = await prisma.user.create({
      data: {
        email: userData.email,
        passwordHash,
        name: userData.name,
        emailVerified: true, // Auto-confirm email for test users
        subscription: {
          create: {
            status: userData.tier === "FREE" ? "ACTIVE" : "ACTIVE",
            tier: userData.tier,
            currentPeriodEnd: periodEnd,
          },
        },
        usage: {
          create: {
            periodStart,
            periodEnd: periodEndMonth,
            scrapesUsed: 0,
            dailyDate: now,
            dailyCount: 0,
            keywordScrapesUsed: 0,
            keywordDailyCount: 0,
          },
        },
      },
      include: {
        subscription: true,
      },
    });

    console.log(`✅ Created ${userData.tier} user: ${user.email}`);
  }

  console.log("\n🎉 Seed completed successfully!");
  console.log("\nTest accounts created:");
  console.log("┌─────────────────────────────┬───────────────┬──────────┐");
  console.log("│ Email                       │ Password      │ Tier     │");
  console.log("├─────────────────────────────┼───────────────┼──────────┤");
  for (const user of seedUsers) {
    console.log(
      `│ ${user.email.padEnd(27)} │ ${user.password.padEnd(13)} │ ${user.tier.padEnd(8)} │`,
    );
  }
  console.log("└─────────────────────────────┴───────────────┴──────────┘");
}

seed()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
