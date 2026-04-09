import { notFound } from "next/navigation";

import { AdminListingForm } from "@/components/admin-listing-form";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { getLocaleFromSearchParam } from "@/lib/locale";

export default async function EditListingPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ lang?: string }>;
}) {
  const query = await searchParams;
  const locale = getLocaleFromSearchParam(query.lang);
  await requireAdmin();
  const { id } = await params;

  const listing = await db.careHome.findUnique({
    where: { id }
  });

  if (!listing) notFound();

  const copy =
    locale === "pl"
      ? {
          panel: "Panel admina",
          edit: "Edytuj oferte"
        }
      : {
          panel: "Admin panel",
          edit: "Edit listing"
        };

  return (
    <main className="container section stack-lg">
      <div className="section-heading">
        <div>
          <p className="eyebrow">{copy.panel}</p>
          <h1>{copy.edit}</h1>
        </div>
      </div>

      <AdminListingForm listing={listing} />
    </main>
  );
}
