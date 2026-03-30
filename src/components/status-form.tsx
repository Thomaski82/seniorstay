import { updateBookingStatusAction } from "@/lib/actions";

const BOOKING_STATUSES = ["PENDING", "CONFIRMED", "CANCELLED"] as const;

export function StatusForm({
  bookingId,
  currentStatus
}: {
  bookingId: string;
  currentStatus: string;
}) {
  return (
    <form action={updateBookingStatusAction} className="status-form">
      <input type="hidden" name="bookingId" value={bookingId} />
      <select name="status" defaultValue={currentStatus}>
        {BOOKING_STATUSES.map((status) => (
          <option key={status} value={status}>
            {status}
          </option>
        ))}
      </select>
      <button type="submit" className="button button-small">
        Save
      </button>
    </form>
  );
}
