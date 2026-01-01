import dns from "dns";
import { promisify } from "util";

const resolveMx = promisify(dns.resolveMx);

const DISPOSABLE_DOMAINS = new Set([
  "tempmail.com",
  "throwaway.email",
  "guerrillamail.com",
  "mailinator.com",
  "10minutemail.com",
  "temp-mail.org",
  "fakeinbox.com",
  "getnada.com",
  "maildrop.cc",
  "dispostable.com",
  "mailnesia.com",
  "trashmail.com",
  "yopmail.com",
  "sharklasers.com",
  "guerrillamailblock.com",
  "pokemail.net",
  "spam4.me",
  "grr.la",
  "getairmail.com",
  "mohmal.com",
  "tempail.com",
  "minuteinbox.com",
  "emailondeck.com",
  "tempr.email",
  "discard.email",
  "tmpmail.org",
  "tmpmail.net",
  "emailfake.com",
  "crazymailing.com",
  "gay.com",
  "cock.li",
  "waifu.club",
  "420blaze.it",
  "horsefucker.org",
]);

export async function validateEmail(
  email: string
): Promise<{ valid: boolean; reason?: string }> {
  const domain = email.split("@")[1]?.toLowerCase();

  if (!domain) {
    return { valid: false, reason: "Invalid email format" };
  }

  if (DISPOSABLE_DOMAINS.has(domain)) {
    return { valid: false, reason: "Please use a valid work email address" };
  }

  try {
    const mxRecords = await resolveMx(domain);
    if (!mxRecords || mxRecords.length === 0) {
      return { valid: false, reason: "This email domain does not exist" };
    }
  } catch (error: unknown) {
    const dnsError = error as { code?: string };
    if (dnsError.code === "ENOTFOUND" || dnsError.code === "ENODATA") {
      return { valid: false, reason: "This email domain does not exist" };
    }
  }

  return { valid: true };
}
