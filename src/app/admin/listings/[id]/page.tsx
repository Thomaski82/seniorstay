import { notFound } from "next/navigation";

import { AdminListingForm } from "@/components/admin-listing-form";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";

export default async function EditListingPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;

  const listing = await db.careHome.findUnique({
    where: { id }
  });

  if (!listing) notFound();

  return (
    <main className="container section stack-lg">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Admin panel</p>
          <h1>Edit listing</h1>
        </div>
      </div>

      <AdminListingForm listing={listing} />
    </main>
  );
}
