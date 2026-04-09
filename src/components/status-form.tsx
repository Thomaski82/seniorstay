import { updateBookingStatusAction } from "@/lib/actions";

const BOOKING_STATUSES = ["PENDING", "CONFIRMED", "CANCELLED"] as const;
const STATUS_LABELS: Record<string, string> = {
  PENDING: "OCZEKUJE",
  CONFIRMED: "POTWIERDZONA",
  CANCELLED: "ANULOWANA"
};

export function StatusForm({
  bookingId,
  currentStatus,
  locale = "en"
}: {
  bookingId: string;
  currentStatus: string;
  locale?: "en" | "pl";
}) {
  const buttonLabel = locale === "pl" ? "Zapisz" : "Save";
  return (
    <form action={updateBookingStatusAction} className="status-form">
      <input type="hidden" name="bookingId" value={bookingId} />
      <input type="hidden" name="locale" value={locale} />
      <select name="status" defaultValue={currentStatus}>
        {BOOKING_STATUSES.map((status) => (
          <option key={status} value={status}>
            {STATUS_LABELS[status] ?? status}
          </option>
        ))}
      </select>
      <button type="submit" className="button button-small">
        {buttonLabel}
      </button>
    </form>
  );
}
