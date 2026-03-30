import { createReviewAction } from "@/lib/actions";

export function ReviewForm({ careHomeId }: { careHomeId: string }) {
  return (
    <form action={createReviewAction} className="review-form">
      <input type="hidden" name="careHomeId" value={careHomeId} />
      <label>
        <span>Rating</span>
        <select name="rating" defaultValue="5">
          {[5, 4, 3, 2, 1].map((value) => (
            <option key={value} value={value}>
              {value} stars
            </option>
          ))}
        </select>
      </label>

      <label>
        <span>Your review</span>
        <textarea name="comment" rows={4} placeholder="Share what stood out about this facility." />
      </label>

      <button type="submit" className="button button-primary">
        Submit review
      </button>
    </form>
  );
}
