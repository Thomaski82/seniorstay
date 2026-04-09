import Link from "next/link";

import { deleteListingAction } from "@/lib/actions";
import { requireAdmin } from "@/lib/auth";
import { AdminListingForm } from "@/components/admin-listing-form";
import { StatusForm } from "@/components/status-form";
import { db } from "@/lib/db";
import { formatCurrency, formatDate } from "@/lib/format";
import { getLocaleFromSearchParam } from "@/lib/locale";

export default async function AdminPage({
  searchParams
}: {
  searchParams: Promise<{ lang?: string }>;
}) {
  const params = await searchParams;
  const locale = getLocaleFromSearchParam(params.lang);
  await requireAdmin();
  const copy =
    locale === "pl"
      ? {
          panel: "Panel admina",
          title: "Zarzadzaj ofertami i rezerwacjami",
          create: "Utworz lub edytuj oferte",
          existing: "Istniejace oferty",
          month: "/ miesiac",
          edit: "Edytuj",
          delete: "Usun",
          manageBookings: "Zarzadzaj rezerwacjami",
          guest: "Gosc",
          facility: "Placowka",
          resident: "Senior",
          start: "Start",
          total: "Lacznie",
          status: "Status"
        }
      : {
          panel: "Admin panel",
          title: "Manage listings and bookings",
          create: "Create or update listing",
          existing: "Existing listings",
          month: "/ month",
          edit: "Edit",
          delete: "Delete",
          manageBookings: "Manage bookings",
          guest: "Guest",
          facility: "Facility",
          resident: "Resident",
          start: "Start",
          total: "Total",
          status: "Status"
        };

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
          <p className="eyebrow">{copy.panel}</p>
          <h1>{copy.title}</h1>
        </div>
      </section>

      <section className="admin-grid">
        <div className="stack-lg">
          <div className="section-heading">
            <h2>{copy.create}</h2>
          </div>
          <AdminListingForm />
        </div>

        <div className="card stack-md">
          <div className="section-heading">
            <h2>{copy.existing}</h2>
          </div>
          <div className="stack-md">
            {listings.map((listing) => (
              <article key={listing.id} className="admin-listing-item">
                <div>
                  <strong>{listing.name}</strong>
                  <p className="muted">
                    {listing.city}, {listing.country}
                  </p>
                  <p className="muted">{formatCurrency(listing.pricePerMonth)} {copy.month}</p>
                </div>
                <div className="inline-actions">
                  <Link href={`/admin/listings/${listing.id}`} className="button button-small">
                    {copy.edit}
                  </Link>
                  <form action={deleteListingAction}>
                    <input type="hidden" name="id" value={listing.id} />
                    <button type="submit" className="button button-danger button-small">
                      {copy.delete}
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
          <h2>{copy.manageBookings}</h2>
        </div>

        <div className="table-card">
          <table>
            <thead>
              <tr>
                <th>{copy.guest}</th>
                <th>{copy.facility}</th>
                <th>{copy.resident}</th>
                <th>{copy.start}</th>
                <th>{copy.total}</th>
                <th>{copy.status}</th>
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
                    <StatusForm bookingId={booking.id} currentStatus={booking.status} locale={locale} />
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
