import { cookies } from "next/headers";

export type Locale = "en" | "pl";

export function normalizeLocale(value?: string | null): Locale {
  return value === "pl" ? "pl" : "en";
}

export async function getLocaleFromCookie() {
  const cookieStore = await cookies();
  return normalizeLocale(cookieStore.get("site_locale")?.value);
}

export function getLocaleFromSearchParam(value?: string) {
  return normalizeLocale(value);
}
