import { publishImportedCareHomeAction, rejectImportedCareHomeAction } from "@/lib/actions";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { getLocaleFromSearchParam } from "@/lib/locale";

export default async function AdminImportsPage({
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
          title: "Importy do weryfikacji",
          subtitle: "Sprawdz dane pobrane z zewnetrznych katalogow przed publikacja.",
          source: "Zrodlo",
          rating: "Ocena",
          freeRooms: "Wolne pokoje",
          status: "Status",
          publish: "Publikuj",
          reject: "Odrzuc",
          noItems: "Brak importow oczekujacych na weryfikacje.",
          raw: "Surowe dane"
        }
      : {
          panel: "Admin panel",
          title: "Imports to review",
          subtitle: "Review scraped records before publishing them to the marketplace.",
          source: "Source",
          rating: "Rating",
          freeRooms: "Free rooms",
          status: "Status",
          publish: "Publish",
          reject: "Reject",
          noItems: "No staged imports waiting for review.",
          raw: "Raw data"
        };

  const imports = await db.importedCareHome.findMany({
    orderBy: { createdAt: "desc" }
  });

  return (
    <main className="container section stack-xl">
      <section className="section-heading">
        <div>
          <p className="eyebrow">{copy.panel}</p>
          <h1>{copy.title}</h1>
          <p className="muted">{copy.subtitle}</p>
        </div>
      </section>

      {!imports.length && <p className="empty-state">{copy.noItems}</p>}

      <div className="stack-md">
        {imports.map((item) => (
          <article key={item.id} className="card stack-md">
            <div className="summary-row">
              <div>
                <h2>{item.name}</h2>
                <p className="muted">
                  {item.city}, {item.country}
                </p>
              </div>
              <div className="stack-sm">
                <span className="chip">{copy.status}: {item.status}</span>
                <span className="muted">
                  {copy.freeRooms}: {item.freeRooms ?? (item.hasFreeRooms ? 1 : 0)}
                </span>
              </div>
            </div>

            <p>{item.shortDescription}</p>

            <div className="chip-row">
              <span className="chip">{copy.source}: {item.sourceName}</span>
              <span className="chip">{copy.rating}: {item.rating ?? "-"}</span>
            </div>

            <div className="summary-row">
              <a href={item.sourceUrl} target="_blank" rel="noreferrer" className="button">
                {copy.source}
              </a>
              <div className="inline-actions">
                <form action={publishImportedCareHomeAction}>
                  <input type="hidden" name="importedId" value={item.id} />
                  <button type="submit" className="button button-primary">
                    {copy.publish}
                  </button>
                </form>
                <form action={rejectImportedCareHomeAction}>
                  <input type="hidden" name="importedId" value={item.id} />
                  <input type="hidden" name="reason" value="Rejected in admin review" />
                  <button type="submit" className="button button-danger">
                    {copy.reject}
                  </button>
                </form>
              </div>
            </div>

            <details>
              <summary>{copy.raw}</summary>
              <pre className="raw-import">{item.rawData}</pre>
            </details>
          </article>
        ))}
      </div>
    </main>
  );
}
