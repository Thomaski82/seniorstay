import { getAllServices, type SearchParams } from "@/lib/care-homes";

type SearchFiltersProps = {
  params: SearchParams;
};

export async function SearchFilters({ params }: SearchFiltersProps) {
  const services = await getAllServices();

  return (
    <form className="filter-panel" action="/">
      <div className="filter-grid">
        <label>
          <span>Location</span>
          <input name="location" defaultValue={params.location} placeholder="Barcelona, Lisbon..." />
        </label>

        <label>
          <span>Min price</span>
          <input name="minPrice" type="number" defaultValue={params.minPrice} placeholder="2000" />
        </label>

        <label>
          <span>Max price</span>
          <input name="maxPrice" type="number" defaultValue={params.maxPrice} placeholder="5000" />
        </label>

        <label>
          <span>Sort by</span>
          <select name="sort" defaultValue={params.sort ?? ""}>
            <option value="">Recommended</option>
            <option value="rating">Top rated</option>
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
          </select>
        </label>

        <label className="full-width">
          <span>Services</span>
          <select name="services" defaultValue={params.services ?? ""}>
            <option value="">Any services</option>
            {services.map((service) => (
              <option key={service} value={service}>
                {service}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="filter-actions">
        <button type="submit" className="button button-primary">
          Search homes
        </button>
      </div>
    </form>
  );
}
