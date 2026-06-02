import { headers } from "next/headers";
import { resolveBrand, type Brand } from "@/lib/brand";

/**
 * Resolve the active brand from the request host in a Server Component.
 * Use this where the host is available at render time (e.g. `generateMetadata`).
 */
export async function getServerBrand(): Promise<Brand> {
  const headerList = await headers();
  const host =
    headerList.get("x-forwarded-host") ?? headerList.get("host");
  return resolveBrand(host);
}
