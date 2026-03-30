import Image from "next/image";
import { notFound } from "next/navigation";

import { BookingCard } from "@/components/booking-card";
import { FavoriteButton } from "@/components/favorite-button";
import { ReviewForm } from "@/components/review-form";
import { getCurrentUser } from "@/lib/auth";
import { getCareHomeBySlug, parseJsonArray } from "@/lib/care-homes";
import { db } from "@/lib/db";
import { formatCurrency, formatDate } from "@/lib/format";

export default async function ListingPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [home, user] = await Promise.all([getCareHomeBySlug(slug), getCurrentUser()]);

  if (!home) notFound();

  const photos = parseJsonArray(home.photos);
  const services = parseJsonArray(home.services);
  const favorite = user
    ? await db.favorite
        .findUnique({
          where: {
            userId_careHomeId: {
              userId: user.id,
              careHomeId: home.id
            }
          }
        })
        .catch(() => null)
    : null;
  const firstAvailable = home.availabilities.find((slot) => slot.availableAll > 0)?.monthStart;

  return (
    <main className="container section">
      <div className="listing-detail-header">
        <div>
          <p className="eyebrow">
            {home.city}, {home.country}
          </p>
          <h1>{home.name}</h1>
          <p className="lead">{home.shortDescription}</p>
        </div>

        <div className="detail-actions">
          {user && <FavoriteButton careHomeId={home.id} isFavorite={Boolean(favorite)} />}
          <div className="rating-badge rating-large">
            <strong>{home.ratingCache.toFixed(1)}</strong>
            <span>{home.reviewCountCache} reviews</span>
          </div>
        </div>
      </div>

      <section className="gallery-grid">
        {photos.map((photo, index) => (
          <div key={photo + index} className={index === 0 ? "gallery-main" : "gallery-side"}>
            <Image src={photo} alt={`${home.name} photo ${index + 1}`} fill className="listing-image" />
          </div>
        ))}
      </section>

      <section className="detail-grid">
        <div className="stack-lg">
          <article className="card stack-md">
            <h2>About this home</h2>
            <p>{home.description}</p>
            <div className="chip-row">
              {services.map((service) => (
                <span key={service} className="chip">
                  {service}
                </span>
              ))}
            </div>
          </article>

          <article className="card stack-md">
            <h2>Availability calendar</h2>
            <div className="availability-grid">
              {home.availabilities.map((slot) => (
                <div className="availability-cell" key={slot.id}>
                  <strong>{formatDate(slot.monthStart)}</strong>
                  <span>{slot.availableAll > 0 ? `${slot.availableAll} rooms left` : "Waitlist"}</span>
                </div>
              ))}
            </div>
          </article>

          <article className="card stack-md">
            <h2>Reviews</h2>
            <div className="stack-md">
              {home.reviews.map((review) => (
                <div key={review.id} className="review-card">
                  <div className="review-head">
                    <strong>{review.user.name}</strong>
                    <span>{review.rating}/5</span>
                  </div>
                  <p>{review.comment}</p>
                </div>
              ))}
            </div>

            {user && user.role !== "ADMIN" ? (
              <ReviewForm careHomeId={home.id} />
            ) : (
              <p className="muted">Sign in as a user account to leave a review.</p>
            )}
          </article>
        </div>

        <aside>
          <BookingCard
            careHomeId={home.id}
            pricePerMonth={home.pricePerMonth}
            firstAvailableDate={
              firstAvailable ? new Date(firstAvailable).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10)
            }
            disabled={!Boolean(firstAvailable) || !user}
          />
          {!user && <p className="helper-text">Create an account or sign in to confirm a booking.</p>}
          <div className="card stack-sm">
            <p className="eyebrow">At a glance</p>
            <div className="summary-row">
              <span>Address</span>
              <strong>{home.address}</strong>
            </div>
            <div className="summary-row">
              <span>Monthly price</span>
              <strong>{formatCurrency(home.pricePerMonth)}</strong>
            </div>
            <div className="summary-row">
              <span>Care model</span>
              <strong>Assisted living</strong>
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}
