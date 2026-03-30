import { Prisma } from "@prisma/client";

import { db } from "@/lib/db";
import { demoHomes } from "@/lib/demo-data";

export type SearchParams = {
  location?: string;
  minPrice?: string;
  maxPrice?: string;
  services?: string;
  sort?: string;
};

export function parseJsonArray(value: string) {
  try {
    return JSON.parse(value) as string[];
  } catch {
    return [];
  }
}

function filterDemoHomes(params: SearchParams = {}) {
  const selectedServices = params.services
    ?.split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  const filtered = demoHomes.filter((home) => {
    const matchesLocation =
      !params.location ||
      home.city.toLowerCase().includes(params.location.toLowerCase()) ||
      home.country.toLowerCase().includes(params.location.toLowerCase());

    const matchesMin = !params.minPrice || home.pricePerMonth >= Number(params.minPrice);
    const matchesMax = !params.maxPrice || home.pricePerMonth <= Number(params.maxPrice);
    const services = parseJsonArray(home.services);
    const matchesServices =
      !selectedServices?.length ||
      selectedServices.every((service) => services.some((item) => item.toLowerCase().includes(service.toLowerCase())));

    return matchesLocation && matchesMin && matchesMax && matchesServices;
  });

  if (params.sort === "price-asc") {
    filtered.sort((a, b) => a.pricePerMonth - b.pricePerMonth);
  } else if (params.sort === "price-desc") {
    filtered.sort((a, b) => b.pricePerMonth - a.pricePerMonth);
  } else if (params.sort === "rating") {
    filtered.sort((a, b) => b.ratingCache - a.ratingCache);
  } else {
    filtered.sort((a, b) => Number(b.featured) - Number(a.featured) || b.ratingCache - a.ratingCache);
  }

  return filtered;
}

export async function getCareHomes(params: SearchParams = {}) {
  const where: Prisma.CareHomeWhereInput = {};
  const orderBy: Prisma.CareHomeOrderByWithRelationInput[] = [];

  if (params.location) {
    where.OR = [
      { city: { contains: params.location, mode: "insensitive" } },
      { country: { contains: params.location, mode: "insensitive" } }
    ];
  }

  if (params.minPrice || params.maxPrice) {
    where.pricePerMonth = {};

    if (params.minPrice) {
      where.pricePerMonth.gte = Number(params.minPrice);
    }

    if (params.maxPrice) {
      where.pricePerMonth.lte = Number(params.maxPrice);
    }
  }

  if (params.services) {
    const selected = params.services
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    if (selected.length) {
      where.AND = selected.map((service) => ({
        services: { contains: service }
      }));
    }
  }

  if (params.sort === "price-asc") orderBy.push({ pricePerMonth: "asc" });
  if (params.sort === "price-desc") orderBy.push({ pricePerMonth: "desc" });
  if (params.sort === "rating") orderBy.push({ ratingCache: "desc" });
  if (!orderBy.length) orderBy.push({ featured: "desc" }, { ratingCache: "desc" });

  try {
    return await db.careHome.findMany({
      where,
      orderBy,
      include: {
        availabilities: {
          orderBy: { monthStart: "asc" },
          take: 6
        },
        reviews: {
          include: {
            user: {
              select: { name: true }
            }
          },
          orderBy: { createdAt: "desc" },
          take: 3
        }
      }
    });
  } catch {
    return filterDemoHomes(params);
  }
}

export async function getFeaturedHomes() {
  try {
    return await db.careHome.findMany({
      where: { featured: true },
      orderBy: { ratingCache: "desc" },
      take: 3
    });
  } catch {
    return demoHomes.filter((home) => home.featured).slice(0, 3);
  }
}

export async function getCareHomeBySlug(slug: string) {
  try {
    return await db.careHome.findUnique({
      where: { slug },
      include: {
        availabilities: {
          orderBy: { monthStart: "asc" }
        },
        reviews: {
          include: {
            user: { select: { name: true } }
          },
          orderBy: { createdAt: "desc" }
        }
      }
    });
  } catch {
    return demoHomes.find((home) => home.slug === slug) ?? null;
  }
}

export async function getAllServices() {
  try {
    const homes = await db.careHome.findMany({
      select: { services: true }
    });

    return [...new Set(homes.flatMap((home) => parseJsonArray(home.services)))].sort();
  } catch {
    return [...new Set(demoHomes.flatMap((home) => parseJsonArray(home.services)))].sort();
  }
}
