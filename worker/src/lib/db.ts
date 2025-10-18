import { PrismaClient } from "@prisma/client";

let prisma: PrismaClient;

declare global {
  var prisma: PrismaClient;
}

if (typeof globalThis.prisma === "undefined") {
  prisma = new PrismaClient();
  globalThis.prisma = prisma;
} else {
  prisma = globalThis.prisma;
}
export default prisma;
