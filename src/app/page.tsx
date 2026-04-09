import Link from "next/link";

import { HomeCard } from "@/components/home-card";
import { SearchFilters } from "@/components/search-filters";
import { getCareHomes, getFeaturedHomes, type SearchParams } from "@/lib/care-homes";
import { formatCurrency } from "@/lib/format";
import { getLocaleFromSearchParam } from "@/lib/locale";

export default async function Home({
  searchParams
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const locale = getLocaleFromSearchParam(params.lang);
  const [homes, featured] = await Promise.all([getCareHomes(params), getFeaturedHomes()]);
  const copy =
    locale === "pl"
      ? {
          eyebrow: "Rezerwacja opieki senioralnej bez chaosu",
          title: "Bezpieczny dom seniora zaczyna sie tutaj.",
          text: "Porownuj ceny, uslugi, dostepnosc i opinie rodzin w jednym nowoczesnym marketplace.",
          seededHomes: "przykladowych obiektow",
          careOptions: "opcji opieki",
          onePlace: "jedno miejsce",
          onePlaceLabel: "do wyszukiwania i rezerwacji",
          featured: "Polecane pobyty",
          rating: "ocena",
          browse: "Przegladaj domy",
          available: "dostepnych placowek"
        }
      : {
          eyebrow: "Senior care booking, simplified",
          title: "A safer senior home starts here.",
          text: "Compare pricing, care services, availability, and family reviews in one mobile-friendly marketplace.",
          seededHomes: "seeded homes",
          careOptions: "care options",
          onePlace: "1 place",
          onePlaceLabel: "for search and booking",
          featured: "Featured stays",
          rating: "rating",
          browse: "Browse homes",
          available: "care homes available"
        };

  return (
    <main>
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">{copy.eyebrow}</p>
            <h1>{copy.title}</h1>
            <p className="hero-text">{copy.text}</p>
            <div className="hero-metrics">
              <div>
                <strong>5+</strong>
                <span>{copy.seededHomes}</span>
              </div>
              <div>
                <strong>24/7</strong>
                <span>{copy.careOptions}</span>
              </div>
              <div>
                <strong>{copy.onePlace}</strong>
                <span>{copy.onePlaceLabel}</span>
              </div>
            </div>
          </div>

          <div className="hero-card">
            <p className="eyebrow">{copy.featured}</p>
            <div className="stack-md">
              {featured.map((home) => (
                <Link href={`/listings/${home.slug}${locale === "pl" ? "?lang=pl" : ""}`} key={home.id} className="hero-feature">
                  <div>
                    <strong>{home.name}</strong>
                    <span>
                      {home.city}, {home.country}
                    </span>
                  </div>
                  <div>
                    <strong>{formatCurrency(home.pricePerMonth)}</strong>
                    <span>{home.ratingCache.toFixed(1)} {copy.rating}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="container section">
        <SearchFilters params={params} locale={locale} />
      </section>

      <section className="container section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">{copy.browse}</p>
            <h2>{homes.length} {copy.available}</h2>
          </div>
        </div>

        <div className="listing-grid">
          {homes.map((home) => (
            <HomeCard key={home.id} home={home} locale={locale} />
          ))}
        </div>
      </section>
    </main>
  );
}
