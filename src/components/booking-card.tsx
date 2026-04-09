"use client";

import { useMemo, useState } from "react";

import { createBookingAction } from "@/lib/actions";
import { formatCurrency } from "@/lib/format";
import type { Locale } from "@/lib/locale";

type BookingCardProps = {
  careHomeId: string;
  pricePerMonth: number;
  firstAvailableDate: string;
  disabled?: boolean;
  locale?: Locale;
};

export function BookingCard({
  careHomeId,
  pricePerMonth,
  firstAvailableDate,
  disabled = false,
  locale = "en"
}: BookingCardProps) {
  const [months, setMonths] = useState(3);
  const total = useMemo(() => months * pricePerMonth, [months, pricePerMonth]);
  const copy =
    locale === "pl"
      ? {
          book: "Zarezerwuj pobyt",
          month: "/ miesiac",
          resident: "Imie i nazwisko seniora",
          residentPlaceholder: "Wpisz imie i nazwisko seniora",
          start: "Miesiac rozpoczecia",
          stayLength: "Dlugosc pobytu",
          monthSingle: "miesiac",
          monthPlural: "miesiecy",
          total: "Szacunkowy koszt",
          button: "Rezerwuj teraz"
        }
      : {
          book: "Book this stay",
          month: "/ month",
          resident: "Resident name",
          residentPlaceholder: "Enter resident name",
          start: "Start month",
          stayLength: "Length of stay",
          monthSingle: "month",
          monthPlural: "months",
          total: "Total estimate",
          button: "Book now"
        };

  return (
    <div className="booking-card">
      <div>
        <p className="eyebrow">{copy.book}</p>
        <h3>{formatCurrency(pricePerMonth)} {copy.month}</h3>
      </div>

      <form action={createBookingAction} className="stack-md">
        <input type="hidden" name="careHomeId" value={careHomeId} />
        <input type="hidden" name="locale" value={locale} />

        <label>
          <span>{copy.resident}</span>
          <input name="residentName" placeholder={copy.residentPlaceholder} required />
        </label>

        <label>
          <span>{copy.start}</span>
          <input type="date" name="startDate" defaultValue={firstAvailableDate} required />
        </label>

        <label>
          <span>{copy.stayLength}</span>
          <select
            name="months"
            value={months}
            onChange={(event) => setMonths(Number(event.target.value))}
          >
            {Array.from({ length: 12 }, (_, index) => index + 1).map((value) => (
              <option key={value} value={value}>
                {value} {value === 1 ? copy.monthSingle : copy.monthPlural}
              </option>
            ))}
          </select>
        </label>

        <div className="summary-row">
          <span>{copy.total}</span>
          <strong>{formatCurrency(total)}</strong>
        </div>

        <button type="submit" className="button button-primary" disabled={disabled}>
          {copy.button}
        </button>
      </form>
    </div>
  );
}
