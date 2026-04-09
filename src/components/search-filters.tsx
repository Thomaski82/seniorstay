import { getAllServices, translateService, type SearchParams } from "@/lib/care-homes";
import type { Locale } from "@/lib/locale";

type SearchFiltersProps = {
  params: SearchParams;
  locale?: Locale;
};

export async function SearchFilters({ params, locale = "en" }: SearchFiltersProps) {
  const services = await getAllServices();
  const copy =
    locale === "pl"
      ? {
          location: "Lokalizacja",
          locationPlaceholder: "Warszawa, Krakow...",
          minPrice: "Cena min.",
          maxPrice: "Cena max.",
          sortBy: "Sortuj",
          recommended: "Polecane",
          topRated: "Najlepiej oceniane",
          lowToHigh: "Cena: rosnaco",
          highToLow: "Cena: malejaco",
          availability: "Najwiecej wolnych pokoi",
          services: "Uslugi",
          anyServices: "Dowolne uslugi",
          availableOnly: "Pokaz tylko domy z wolnymi pokojami",
          search: "Szukaj domow"
        }
      : {
          location: "Location",
          locationPlaceholder: "Barcelona, Lisbon...",
          minPrice: "Min price",
          maxPrice: "Max price",
          sortBy: "Sort by",
          recommended: "Recommended",
          topRated: "Top rated",
          lowToHigh: "Price: low to high",
          highToLow: "Price: high to low",
          availability: "Most free rooms",
          services: "Services",
          anyServices: "Any services",
          availableOnly: "Show only homes with free rooms",
          search: "Search homes"
        };

  return (
    <form className="filter-panel" action="/">
      {locale === "pl" && <input type="hidden" name="lang" value="pl" />}
      <div className="filter-grid">
        <label>
          <span>{copy.location}</span>
          <input name="location" defaultValue={params.location} placeholder={copy.locationPlaceholder} />
        </label>

        <label>
          <span>{copy.minPrice}</span>
          <input name="minPrice" type="number" defaultValue={params.minPrice} placeholder="2000" />
        </label>

        <label>
          <span>{copy.maxPrice}</span>
          <input name="maxPrice" type="number" defaultValue={params.maxPrice} placeholder="5000" />
        </label>

        <label>
          <span>{copy.sortBy}</span>
          <select name="sort" defaultValue={params.sort ?? ""}>
            <option value="">{copy.recommended}</option>
            <option value="rating">{copy.topRated}</option>
            <option value="price-asc">{copy.lowToHigh}</option>
            <option value="price-desc">{copy.highToLow}</option>
            <option value="availability">{copy.availability}</option>
          </select>
        </label>

        <label className="full-width">
          <span>{copy.services}</span>
          <select name="services" defaultValue={params.services ?? ""}>
            <option value="">{copy.anyServices}</option>
            {services.map((service) => (
              <option key={service} value={service}>
                {translateService(service, locale)}
              </option>
            ))}
          </select>
        </label>

        <label className="full-width checkbox-card">
          <input type="checkbox" name="availableOnly" defaultChecked={params.availableOnly === "on"} />
          <span>{copy.availableOnly}</span>
        </label>
      </div>

      <div className="filter-actions">
        <button type="submit" className="button button-primary">
          {copy.search}
        </button>
      </div>
    </form>
  );
}
