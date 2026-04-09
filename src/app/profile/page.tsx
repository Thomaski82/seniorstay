import Link from "next/link";

import { HomeCard } from "@/components/home-card";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatCurrency, formatDate } from "@/lib/format";
import { getLocaleFromSearchParam } from "@/lib/locale";

function translateBookingStatus(status: string, locale: "en" | "pl") {
  if (locale === "pl") {
    if (status === "PENDING") return "OCZEKUJACA";
    if (status === "CONFIRMED") return "POTWIERDZONA";
    if (status === "CANCELLED") return "ANULOWANA";
  }

  return status;
}

export default async function ProfilePage({
  searchParams
}: {
  searchParams: Promise<{ lang?: string }>;
}) {
  const params = await searchParams;
  const locale = getLocaleFromSearchParam(params.lang);
  const user = await requireUser();
  const copy =
    locale === "pl"
      ? {
          account: "Twoje konto",
          continue: "Wroc do wyszukiwania",
          bookings: "Rezerwacje",
          stays: "Biezace i poprzednie pobyty",
          facility: "Placowka",
          resident: "Senior",
          startDate: "Data startu",
          duration: "Czas pobytu",
          total: "Lacznie",
          status: "Status",
          noBookings: "Brak rezerwacji.",
          savedHomes: "Zapisane domy",
          favorites: "Ulubione",
          noFavorites: "Nie zapisales jeszcze zadnych domow.",
          notifications: "Powiadomienia",
          updates: "Ostatnie aktualizacje",
          months: "miesiecy"
        }
      : {
          account: "Your account",
          continue: "Continue browsing",
          bookings: "Bookings",
          stays: "Current and past stays",
          facility: "Facility",
          resident: "Resident",
          startDate: "Start date",
          duration: "Duration",
          total: "Total",
          status: "Status",
          noBookings: "No bookings yet.",
          savedHomes: "Saved homes",
          favorites: "Favorites",
          noFavorites: "You have not saved any homes yet.",
          notifications: "Notifications",
          updates: "Recent updates",
          months: "months"
        };

  const [bookings, favorites, notifications] = await Promise.all([
    db.booking.findMany({
      where: { userId: user.id },
      include: { careHome: true },
      orderBy: { createdAt: "desc" }
    }),
    db.favorite.findMany({
      where: { userId: user.id },
      include: { careHome: true },
      orderBy: { createdAt: "desc" }
    }),
    db.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" }
    })
  ]);

  return (
    <main className="container section stack-xl">
      <section className="profile-hero">
        <div>
          <p className="eyebrow">{copy.account}</p>
          <h1>{user.name}</h1>
          <p className="muted">{user.email}</p>
        </div>
        <Link href="/" className="button button-primary">
          {copy.continue}
        </Link>
      </section>

      <section className="stack-md">
        <div className="section-heading">
          <div>
            <p className="eyebrow">{copy.bookings}</p>
            <h2>{copy.stays}</h2>
          </div>
        </div>

        <div className="table-card">
          <table>
            <thead>
              <tr>
                <th>{copy.facility}</th>
                <th>{copy.resident}</th>
                <th>{copy.startDate}</th>
                <th>{copy.duration}</th>
                <th>{copy.total}</th>
                <th>{copy.status}</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking.id}>
                  <td>{booking.careHome.name}</td>
                  <td>{booking.residentName}</td>
                  <td>{formatDate(booking.startDate)}</td>
                  <td>{booking.months} {copy.months}</td>
                  <td>{formatCurrency(booking.totalPrice)}</td>
                  <td>{translateBookingStatus(booking.status, locale)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!bookings.length && <p className="empty-state">{copy.noBookings}</p>}
        </div>
      </section>

      <section className="stack-md">
        <div className="section-heading">
          <div>
            <p className="eyebrow">{copy.savedHomes}</p>
            <h2>{copy.favorites}</h2>
          </div>
        </div>

        <div className="listing-grid">
          {favorites.map((favorite) => (
            <HomeCard key={favorite.id} home={favorite.careHome} locale={locale} />
          ))}
        </div>
        {!favorites.length && <p className="empty-state">{copy.noFavorites}</p>}
      </section>

      <section className="stack-md">
        <div className="section-heading">
          <div>
            <p className="eyebrow">{copy.notifications}</p>
            <h2>{copy.updates}</h2>
          </div>
        </div>

        <div className="notification-list">
          {notifications.map((notification) => (
            <article key={notification.id} className="card stack-sm">
              <div className="summary-row">
                <strong>{notification.title}</strong>
                <span className="muted">{formatDate(notification.createdAt)}</span>
              </div>
              <p>{notification.body}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
