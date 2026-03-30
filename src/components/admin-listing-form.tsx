import { upsertListingAction } from "@/lib/actions";
import { parseJsonArray } from "@/lib/care-homes";

type AdminListingFormProps = {
  listing?: {
    id: string;
    name: string;
    city: string;
    country: string;
    address: string;
    pricePerMonth: number;
    shortDescription: string;
    description: string;
    services: string;
    photos: string;
    featured: boolean;
  };
};

export function AdminListingForm({ listing }: AdminListingFormProps) {
  return (
    <form action={upsertListingAction} className="admin-form card stack-md">
      <input type="hidden" name="id" value={listing?.id ?? ""} />

      <div className="form-grid">
        <label>
          <span>Name</span>
          <input name="name" defaultValue={listing?.name} required />
        </label>
        <label>
          <span>City</span>
          <input name="city" defaultValue={listing?.city} required />
        </label>
        <label>
          <span>Country</span>
          <input name="country" defaultValue={listing?.country} required />
        </label>
        <label>
          <span>Monthly price</span>
          <input name="pricePerMonth" type="number" defaultValue={listing?.pricePerMonth} required />
        </label>
      </div>

      <label>
        <span>Address</span>
        <input name="address" defaultValue={listing?.address} required />
      </label>

      <label>
        <span>Short description</span>
        <textarea name="shortDescription" rows={2} defaultValue={listing?.shortDescription} required />
      </label>

      <label>
        <span>Full description</span>
        <textarea name="description" rows={5} defaultValue={listing?.description} required />
      </label>

      <label>
        <span>Services</span>
        <input
          name="services"
          defaultValue={listing ? parseJsonArray(listing.services).join(", ") : ""}
          placeholder="Medical care, Dementia care, Rehabilitation"
          required
        />
      </label>

      <label>
        <span>Photo URLs</span>
        <textarea
          name="photos"
          rows={3}
          defaultValue={listing ? parseJsonArray(listing.photos).join(", ") : ""}
          placeholder="https://..., https://..."
          required
        />
      </label>

      <label className="checkbox-row">
        <input type="checkbox" name="featured" defaultChecked={listing?.featured} />
        <span>Feature this listing on the homepage</span>
      </label>

      <button type="submit" className="button button-primary">
        {listing ? "Update listing" : "Create listing"}
      </button>
    </form>
  );
}
