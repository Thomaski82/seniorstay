import Link from "next/link";
import Image from "next/image";

import { getAvailabilitySnapshot, parseJsonArray } from "@/lib/care-homes";
import { formatCurrency } from "@/lib/format";
import type { Locale } from "@/lib/locale";

type HomeCardProps = {
  home: {
    slug: string;
    name: string;
    city: string;
    country: string;
    shortDescription: string;
    pricePerMonth: number;
    ratingCache: number;
    reviewCountCache: number;
    photos: string;
    services: string;
    availabilities?: Array<{ monthStart: Date; availableAll: number }>;
  };
  locale?: Locale;
};

export function HomeCard({ home, locale = "en" }: HomeCardProps) {
  const [cover] = parseJsonArray(home.photos);
  const services = parseJsonArray(home.services).slice(0, 3);
  const { freeRooms, occupiedRooms } = getAvailabilitySnapshot(home);
  const copy =
    locale === "pl"
      ? {
          reviews: "opinii",
          month: "/ miesiac",
          details: "Zobacz szczegoly",
          free: "wolne pokoje",
          occupied: "zajete",
          now: "Dostepnosc teraz"
        }
      : {
          reviews: "reviews",
          month: "/ month",
          details: "View details",
          free: "free rooms",
          occupied: "occupied",
          now: "Availability now"
        };

  return (
    <article className="listing-card">
      <div className="listing-image-wrap">
        <Image src={cover} alt={home.name} fill className="listing-image" />
      </div>
      <div className="listing-content">
        <div className="listing-header">
          <div>
            <p className="eyebrow">
              {home.city}, {home.country}
            </p>
            <h3>{home.name}</h3>
          </div>
          <div className="rating-badge">
            <strong>{home.ratingCache.toFixed(1)}</strong>
            <span>{home.reviewCountCache} {copy.reviews}</span>
          </div>
        </div>

        <p>{home.shortDescription}</p>

        <div className="availability-strip">
          <span className="availability-pill availability-open">
            {copy.now}: {freeRooms} {copy.free}
          </span>
          <span className="availability-pill">
            {occupiedRooms} {copy.occupied}
          </span>
        </div>

        <div className="chip-row">
          {services.map((service) => (
            <span key={service} className="chip">
              {service}
            </span>
          ))}
        </div>

        <div className="listing-footer">
          <div>
            <span className="price">{formatCurrency(home.pricePerMonth)}</span>
            <span className="muted"> {copy.month}</span>
          </div>
          <Link href={`/listings/${home.slug}${locale === "pl" ? "?lang=pl" : ""}`} className="button button-primary">
            {copy.details}
          </Link>
        </div>
      </div>
    </article>
  );
}
