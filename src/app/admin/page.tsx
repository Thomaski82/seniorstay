import Link from "next/link";

import { deleteListingAction } from "@/lib/actions";
import { requireAdmin } from "@/lib/auth";
import { AdminListingForm } from "@/components/admin-listing-form";
import { StatusForm } from "@/components/status-form";
import { db } from "@/lib/db";
import { formatCurrency, formatDate } from "@/lib/format";

export default async function AdminPage() {
  await requireAdmin();

  const [listings, bookings] = await Promise.all([
    db.careHome.findMany({
      orderBy: { createdAt: "desc" }
    }),
    db.booking.findMany({
      include: {
        user: true,
        careHome: true
      },
      orderBy: { createdAt: "desc" }
    })
  ]);

  return (
    <main className="container section stack-xl">
      <section className="section-heading">
        <div>
          <p className="eyebrow">Admin panel</p>
          <h1>Manage listings and bookings</h1>
        </div>
      </section>

      <section className="admin-grid">
        <div className="stack-lg">
          <div className="section-heading">
            <h2>Create or update listing</h2>
          </div>
          <AdminListingForm />
        </div>

        <div className="card stack-md">
          <div className="section-heading">
            <h2>Existing listings</h2>
          </div>
          <div className="stack-md">
            {listings.map((listing) => (
              <article key={listing.id} className="admin-listing-item">
                <div>
                  <strong>{listing.name}</strong>
                  <p className="muted">
                    {listing.city}, {listing.country}
                  </p>
                  <p className="muted">{formatCurrency(listing.pricePerMonth)} / month</p>
                </div>
                <div className="inline-actions">
                  <Link href={`/admin/listings/${listing.id}`} className="button button-small">
                    Edit
                  </Link>
                  <form action={deleteListingAction}>
                    <input type="hidden" name="id" value={listing.id} />
                    <button type="submit" className="button button-danger button-small">
                      Delete
                    </button>
                  </form>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="stack-md">
        <div className="section-heading">
          <h2>Manage bookings</h2>
        </div>

        <div className="table-card">
          <table>
            <thead>
              <tr>
                <th>Guest</th>
                <th>Facility</th>
                <th>Resident</th>
                <th>Start</th>
                <th>Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking.id}>
                  <td>
                    <strong>{booking.user.name}</strong>
                    <div className="muted">{booking.user.email}</div>
                  </td>
                  <td>{booking.careHome.name}</td>
                  <td>{booking.residentName}</td>
                  <td>{formatDate(booking.startDate)}</td>
                  <td>{formatCurrency(booking.totalPrice)}</td>
                  <td>
                    <StatusForm bookingId={booking.id} currentStatus={booking.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
