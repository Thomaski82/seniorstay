import Link from "next/link";

import { HomeCard } from "@/components/home-card";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatCurrency, formatDate } from "@/lib/format";

export default async function ProfilePage() {
  const user = await requireUser();

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
          <p className="eyebrow">Your account</p>
          <h1>{user.name}</h1>
          <p className="muted">{user.email}</p>
        </div>
        <Link href="/" className="button button-primary">
          Continue browsing
        </Link>
      </section>

      <section className="stack-md">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Bookings</p>
            <h2>Current and past stays</h2>
          </div>
        </div>

        <div className="table-card">
          <table>
            <thead>
              <tr>
                <th>Facility</th>
                <th>Resident</th>
                <th>Start date</th>
                <th>Duration</th>
                <th>Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking.id}>
                  <td>{booking.careHome.name}</td>
                  <td>{booking.residentName}</td>
                  <td>{formatDate(booking.startDate)}</td>
                  <td>{booking.months} months</td>
                  <td>{formatCurrency(booking.totalPrice)}</td>
                  <td>{booking.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!bookings.length && <p className="empty-state">No bookings yet.</p>}
        </div>
      </section>

      <section className="stack-md">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Saved homes</p>
            <h2>Favorites</h2>
          </div>
        </div>

        <div className="listing-grid">
          {favorites.map((favorite) => (
            <HomeCard key={favorite.id} home={favorite.careHome} />
          ))}
        </div>
        {!favorites.length && <p className="empty-state">You have not saved any homes yet.</p>}
      </section>

      <section className="stack-md">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Notifications</p>
            <h2>Recent updates</h2>
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
