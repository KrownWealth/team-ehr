/**
 * Domain-based branding (white-labeling).
 *
 * The app is served under more than one domain. Branding (display name and
 * whether the public auth buttons are shown) is resolved from the request
 * host so the same build can power multiple brands.
 *
 * This file is pure (no `next/headers`, no `window`) so it is safe to import
 * from both client and server code. Read the host with `useBrand()` on the
 * client or `getServerBrand()` on the server, then pass it here.
 */

export interface Brand {
  /** Display name shown in copy, alt text and document title. */
  name: string;
  /** Hide the public "Login" / "Get Started" buttons on the landing pages. */
  hideAuthButtons: boolean;
}

export const DEFAULT_BRAND: Brand = {
  name: "Lifeven Health",
  hideAuthButtons: false,
};

/** Host (bare domain, no `www.` / port) -> brand overrides. */
const BRANDS_BY_HOST: Record<string, Brand> = {
  "lifevenhealth.com": {
    name: "Lifeven Health",
    hideAuthButtons: true,
  },
};

/** Strip protocol, `www.` and any port so lookups are exact. */
function normalizeHost(host?: string | null): string {
  if (!host) return "";
  return host
    .replace(/^https?:\/\//, "")
    .split("/")[0]
    .split(":")[0]
    .replace(/^www\./, "")
    .toLowerCase();
}

export function resolveBrand(host?: string | null): Brand {
  return BRANDS_BY_HOST[normalizeHost(host)] ?? DEFAULT_BRAND;
}
