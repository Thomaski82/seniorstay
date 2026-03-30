import Link from "next/link";
import Image from "next/image";

import { formatCurrency } from "@/lib/format";
import { parseJsonArray } from "@/lib/care-homes";

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
  };
};

export function HomeCard({ home }: HomeCardProps) {
  const [cover] = parseJsonArray(home.photos);
  const services = parseJsonArray(home.services).slice(0, 3);

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
            <span>{home.reviewCountCache} reviews</span>
          </div>
        </div>

        <p>{home.shortDescription}</p>

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
            <span className="muted"> / month</span>
          </div>
          <Link href={`/listings/${home.slug}`} className="button button-primary">
            View details
          </Link>
        </div>
      </div>
    </article>
  );
}
