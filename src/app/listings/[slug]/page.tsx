import Image from "next/image";
import { notFound } from "next/navigation";

import { BookingCard } from "@/components/booking-card";
import { FavoriteButton } from "@/components/favorite-button";
import { ReviewForm } from "@/components/review-form";
import { getCurrentUser } from "@/lib/auth";
import { getAvailabilitySnapshot, getCareHomeBySlug, parseJsonArray } from "@/lib/care-homes";
import { db } from "@/lib/db";
import { formatCurrency, formatDate } from "@/lib/format";
import { getLocaleFromSearchParam } from "@/lib/locale";

export default async function ListingPage({
  params,
  searchParams
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ lang?: string }>;
}) {
  const { slug } = await params;
  const query = await searchParams;
  const locale = getLocaleFromSearchParam(query.lang);
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
  const { freeRooms, occupiedRooms } = getAvailabilitySnapshot(home);
  const copy =
    locale === "pl"
      ? {
          reviews: "opinii",
          about: "O tym domu",
          availability: "Kalendarz dostepnosci",
          roomsLeft: "wolnych pokoi",
          waitlist: "Lista oczekujacych",
          reviewTitle: "Opinie",
          signInToReview: "Zaloguj sie jako konto uzytkownika, aby dodac opinie.",
          signInToBook: "Utworz konto lub zaloguj sie, aby potwierdzic rezerwacje.",
          glance: "Najwazniejsze informacje",
          address: "Adres",
          monthly: "Cena miesieczna",
          careModel: "Model opieki",
          assisted: "Opieka wspomagana",
          liveAvailability: "Dostepnosc teraz",
          occupied: "zajete"
        }
      : {
          reviews: "reviews",
          about: "About this home",
          availability: "Availability calendar",
          roomsLeft: "rooms left",
          waitlist: "Waitlist",
          reviewTitle: "Reviews",
          signInToReview: "Sign in as a user account to leave a review.",
          signInToBook: "Create an account or sign in to confirm a booking.",
          glance: "At a glance",
          address: "Address",
          monthly: "Monthly price",
          careModel: "Care model",
          assisted: "Assisted living",
          liveAvailability: "Availability now",
          occupied: "occupied"
        };

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
            <span>{home.reviewCountCache} {copy.reviews}</span>
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
            <h2>{copy.about}</h2>
            <p>{home.description}</p>
            <div className="availability-strip">
              <span className="availability-pill availability-open">
                {copy.liveAvailability}: {freeRooms} {copy.roomsLeft}
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
          </article>

          <article className="card stack-md">
            <h2>{copy.availability}</h2>
            <div className="availability-grid">
              {home.availabilities.map((slot) => (
                <div className="availability-cell" key={slot.id}>
                  <strong>{formatDate(slot.monthStart)}</strong>
                  <span>{slot.availableAll > 0 ? `${slot.availableAll} ${copy.roomsLeft}` : copy.waitlist}</span>
                </div>
              ))}
            </div>
          </article>

          <article className="card stack-md">
            <h2>{copy.reviewTitle}</h2>
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
              <p className="muted">{copy.signInToReview}</p>
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
          {!user && <p className="helper-text">{copy.signInToBook}</p>}
          <div className="card stack-sm">
            <p className="eyebrow">{copy.glance}</p>
            <div className="summary-row">
              <span>{copy.address}</span>
              <strong>{home.address}</strong>
            </div>
            <div className="summary-row">
              <span>{copy.monthly}</span>
              <strong>{formatCurrency(home.pricePerMonth)}</strong>
            </div>
            <div className="summary-row">
              <span>{copy.careModel}</span>
              <strong>{copy.assisted}</strong>
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}
