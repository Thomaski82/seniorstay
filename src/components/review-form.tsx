import { createReviewAction } from "@/lib/actions";
import type { Locale } from "@/lib/locale";

export function ReviewForm({ careHomeId, locale = "en" }: { careHomeId: string; locale?: Locale }) {
  const copy =
    locale === "pl"
      ? {
          rating: "Ocena",
          stars: "gwiazdek",
          review: "Twoja opinia",
          placeholder: "Napisz, co wyroznilo ten dom opieki.",
          submit: "Dodaj opinie"
        }
      : {
          rating: "Rating",
          stars: "stars",
          review: "Your review",
          placeholder: "Share what stood out about this facility.",
          submit: "Submit review"
        };

  return (
    <form action={createReviewAction} className="review-form">
      <input type="hidden" name="careHomeId" value={careHomeId} />
      <label>
        <span>{copy.rating}</span>
        <select name="rating" defaultValue="5">
          {[5, 4, 3, 2, 1].map((value) => (
            <option key={value} value={value}>
              {value} {copy.stars}
            </option>
          ))}
        </select>
      </label>

      <label>
        <span>{copy.review}</span>
        <textarea name="comment" rows={4} placeholder={copy.placeholder} />
      </label>

      <button type="submit" className="button button-primary">
        {copy.submit}
      </button>
    </form>
  );
}
