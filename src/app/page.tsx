import Link from "next/link";

import { HomeCard } from "@/components/home-card";
import { SearchFilters } from "@/components/search-filters";
import { getCareHomes, getFeaturedHomes, type SearchParams } from "@/lib/care-homes";
import { formatCurrency } from "@/lib/format";

export default async function Home({
  searchParams
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const [homes, featured] = await Promise.all([getCareHomes(params), getFeaturedHomes()]);

  return (
    <main>
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">Senior care booking, simplified</p>
            <h1>Find trusted assisted living and senior care homes with clarity.</h1>
            <p className="hero-text">
              Compare pricing, care services, availability, and family reviews in one
              mobile-friendly marketplace.
            </p>
            <div className="hero-metrics">
              <div>
                <strong>5+</strong>
                <span>seeded homes</span>
              </div>
              <div>
                <strong>24/7</strong>
                <span>care options</span>
              </div>
              <div>
                <strong>1 place</strong>
                <span>for search and booking</span>
              </div>
            </div>
          </div>

          <div className="hero-card">
            <p className="eyebrow">Featured stays</p>
            <div className="stack-md">
              {featured.map((home) => (
                <Link href={`/listings/${home.slug}`} key={home.id} className="hero-feature">
                  <div>
                    <strong>{home.name}</strong>
                    <span>
                      {home.city}, {home.country}
                    </span>
                  </div>
                  <div>
                    <strong>{formatCurrency(home.pricePerMonth)}</strong>
                    <span>{home.ratingCache.toFixed(1)} rating</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="container section">
        <SearchFilters params={params} />
      </section>

      <section className="container section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Browse homes</p>
            <h2>{homes.length} care homes available</h2>
          </div>
        </div>

        <div className="listing-grid">
          {homes.map((home) => (
            <HomeCard key={home.id} home={home} />
          ))}
        </div>
      </section>
    </main>
  );
}
