/**
 * Resolves the parent cookie domain shared by the frontend and API hosts.
 * Production defaults to the configured frontend hostname and can be
 * overridden for topologies where the frontend is not the desired scope.
 */
export function resolveCookieDomain(
  frontendUrl: string,
  nodeEnv: string,
  configuredDomain?: string,
) {
  if (nodeEnv !== "production") {
    return undefined;
  }

  const domain = configuredDomain ?? new URL(frontendUrl).hostname;
  return domain.startsWith(".") ? domain : `.${domain}`;
}
