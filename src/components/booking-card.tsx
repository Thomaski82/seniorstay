"use client";

import { useMemo, useState } from "react";

import { createBookingAction } from "@/lib/actions";
import { formatCurrency } from "@/lib/format";

type BookingCardProps = {
  careHomeId: string;
  pricePerMonth: number;
  firstAvailableDate: string;
  disabled?: boolean;
};

export function BookingCard({
  careHomeId,
  pricePerMonth,
  firstAvailableDate,
  disabled = false
}: BookingCardProps) {
  const [months, setMonths] = useState(3);
  const total = useMemo(() => months * pricePerMonth, [months, pricePerMonth]);

  return (
    <div className="booking-card">
      <div>
        <p className="eyebrow">Book this stay</p>
        <h3>{formatCurrency(pricePerMonth)} / month</h3>
      </div>

      <form action={createBookingAction} className="stack-md">
        <input type="hidden" name="careHomeId" value={careHomeId} />

        <label>
          <span>Resident name</span>
          <input name="residentName" placeholder="Enter resident name" required />
        </label>

        <label>
          <span>Start month</span>
          <input type="date" name="startDate" defaultValue={firstAvailableDate} required />
        </label>

        <label>
          <span>Length of stay</span>
          <select
            name="months"
            value={months}
            onChange={(event) => setMonths(Number(event.target.value))}
          >
            {Array.from({ length: 12 }, (_, index) => index + 1).map((value) => (
              <option key={value} value={value}>
                {value} {value === 1 ? "month" : "months"}
              </option>
            ))}
          </select>
        </label>

        <div className="summary-row">
          <span>Total estimate</span>
          <strong>{formatCurrency(total)}</strong>
        </div>

        <button type="submit" className="button button-primary" disabled={disabled}>
          Book now
        </button>
      </form>
    </div>
  );
}
