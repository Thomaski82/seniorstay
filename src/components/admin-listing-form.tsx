import { upsertListingAction } from "@/lib/actions";
import { parseJsonArray } from "@/lib/care-homes";
import type { Locale } from "@/lib/locale";

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
  const locale: Locale = "pl";
  const copy =
    locale === "pl"
      ? {
          name: "Nazwa",
          city: "Miasto",
          country: "Kraj",
          price: "Cena miesieczna",
          address: "Adres",
          shortDescription: "Krotki opis",
          description: "Pelny opis",
          services: "Uslugi",
          servicesPlaceholder: "Opieka medyczna, Opieka demencyjna, Rehabilitacja",
          photos: "Adresy URL zdjec",
          photosPlaceholder: "https://..., https://...",
          featured: "Pokaz te oferte na stronie glownej",
          create: "Utworz oferte",
          update: "Zaktualizuj oferte"
        }
      : {
          name: "Name",
          city: "City",
          country: "Country",
          price: "Monthly price",
          address: "Address",
          shortDescription: "Short description",
          description: "Full description",
          services: "Services",
          servicesPlaceholder: "Medical care, Dementia care, Rehabilitation",
          photos: "Photo URLs",
          photosPlaceholder: "https://..., https://...",
          featured: "Feature this listing on the homepage",
          create: "Create listing",
          update: "Update listing"
        };

  return (
    <form action={upsertListingAction} className="admin-form card stack-md">
      <input type="hidden" name="id" value={listing?.id ?? ""} />

      <div className="form-grid">
        <label>
          <span>{copy.name}</span>
          <input name="name" defaultValue={listing?.name} required />
        </label>
        <label>
          <span>{copy.city}</span>
          <input name="city" defaultValue={listing?.city} required />
        </label>
        <label>
          <span>{copy.country}</span>
          <input name="country" defaultValue={listing?.country} required />
        </label>
        <label>
          <span>{copy.price}</span>
          <input name="pricePerMonth" type="number" defaultValue={listing?.pricePerMonth} required />
        </label>
      </div>

      <label>
        <span>{copy.address}</span>
        <input name="address" defaultValue={listing?.address} required />
      </label>

      <label>
        <span>{copy.shortDescription}</span>
        <textarea name="shortDescription" rows={2} defaultValue={listing?.shortDescription} required />
      </label>

      <label>
        <span>{copy.description}</span>
        <textarea name="description" rows={5} defaultValue={listing?.description} required />
      </label>

      <label>
        <span>{copy.services}</span>
        <input
          name="services"
          defaultValue={listing ? parseJsonArray(listing.services).join(", ") : ""}
          placeholder={copy.servicesPlaceholder}
          required
        />
      </label>

      <label>
        <span>{copy.photos}</span>
        <textarea
          name="photos"
          rows={3}
          defaultValue={listing ? parseJsonArray(listing.photos).join(", ") : ""}
          placeholder={copy.photosPlaceholder}
          required
        />
      </label>

      <label className="checkbox-row">
        <input type="checkbox" name="featured" defaultChecked={listing?.featured} />
        <span>{copy.featured}</span>
      </label>

      <button type="submit" className="button button-primary">
        {listing ? copy.update : copy.create}
      </button>
    </form>
  );
}
