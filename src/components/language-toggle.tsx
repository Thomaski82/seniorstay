"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

export function LanguageToggle() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = searchParams.get("lang") === "pl" ? "pl" : "en";

  function buildHref(lang: "en" | "pl") {
    const params = new URLSearchParams(searchParams.toString());

    if (lang === "pl") {
      params.set("lang", "pl");
    } else {
      params.delete("lang");
    }

    const query = params.toString();
    return query ? `${pathname}?${query}` : pathname;
  }

  return (
    <div className="lang-toggle" aria-label="Language switcher">
      <Link href={buildHref("en")} className={current === "en" ? "lang-pill active" : "lang-pill"}>
        EN
      </Link>
      <Link href={buildHref("pl")} className={current === "pl" ? "lang-pill active" : "lang-pill"}>
        PL
      </Link>
    </div>
  );
}
