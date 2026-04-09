import { Prisma } from "@prisma/client";

import { db } from "@/lib/db";
import { demoHomes } from "@/lib/demo-data";
import type { Locale } from "@/lib/locale";

export type SearchParams = {
  location?: string;
  minPrice?: string;
  maxPrice?: string;
  services?: string;
  sort?: string;
  availableOnly?: string;
  lang?: string;
};

export function parseJsonArray(value: string) {
  try {
    return JSON.parse(value) as string[];
  } catch {
    return [];
  }
}

const serviceLabels: Record<string, { en: string; pl: string }> = {
  "24/7 medical care": { en: "24/7 medical care", pl: "Opieka medyczna 24/7" },
  "Dementia care": { en: "Dementia care", pl: "Opieka demencyjna" },
  Rehabilitation: { en: "Rehabilitation", pl: "Rehabilitacja" },
  Physiotherapy: { en: "Physiotherapy", pl: "Fizjoterapia" },
  "Garden access": { en: "Garden access", pl: "Dostep do ogrodu" },
  "Medical care": { en: "Medical care", pl: "Opieka medyczna" },
  "Nutrition planning": { en: "Nutrition planning", pl: "Plan zywieniowy" },
  "Mobility assistance": { en: "Mobility assistance", pl: "Wsparcie mobilnosci" },
  "Private rooms": { en: "Private rooms", pl: "Prywatne pokoje" },
  "Medication support": { en: "Medication support", pl: "Wsparcie lekowe" },
  "Social activities": { en: "Social activities", pl: "Aktywnosci spoleczne" },
  "Medical visits": { en: "Medical visits", pl: "Wizyty medyczne" },
  "Accessible bathrooms": { en: "Accessible bathrooms", pl: "Dostepne lazienki" },
  "Secure memory unit": { en: "Secure memory unit", pl: "Bezpieczny oddzial pamieciowy" },
  "Occupational therapy": { en: "Occupational therapy", pl: "Terapia zajeciowa" },
  "24/7 nursing": { en: "24/7 nursing", pl: "Pielegniarstwo 24/7" },
  "Flexible stay": { en: "Flexible stay", pl: "Elastyczny pobyt" },
  "Medical supervision": { en: "Medical supervision", pl: "Nadzor medyczny" },
  Laundry: { en: "Laundry", pl: "Pralnia" },
  "Meal plans": { en: "Meal plans", pl: "Plany posilkow" },
  Transportation: { en: "Transportation", pl: "Transport" }
};

export function translateService(service: string, locale: Locale) {
  const entry = serviceLabels[service];
  if (!entry) return service;
  return locale === "pl" ? entry.pl : entry.en;
}

export function getAvailabilitySnapshot(home: { availabilities?: Array<{ availableAll: number }> }) {
  const availabilities = home.availabilities ?? [];
  const firstSlot = availabilities[0];
  const freeRooms = firstSlot?.availableAll ?? 0;
  const totalRooms = availabilities.length ? Math.max(...availabilities.map((slot) => slot.availableAll)) : 0;

  return {
    freeRooms,
    occupiedRooms: Math.max(totalRooms - freeRooms, 0),
    totalRooms
  };
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
    const matchesAvailability = params.availableOnly !== "on" || home.availabilities.some((slot) => slot.availableAll > 0);

    return matchesLocation && matchesMin && matchesMax && matchesServices && matchesAvailability;
  });

  if (params.sort === "price-asc") {
    filtered.sort((a, b) => a.pricePerMonth - b.pricePerMonth);
  } else if (params.sort === "price-desc") {
    filtered.sort((a, b) => b.pricePerMonth - a.pricePerMonth);
  } else if (params.sort === "rating") {
    filtered.sort((a, b) => b.ratingCache - a.ratingCache);
  } else if (params.sort === "availability") {
    filtered.sort((a, b) => getAvailabilitySnapshot(b).freeRooms - getAvailabilitySnapshot(a).freeRooms);
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

  if (params.availableOnly === "on") {
    where.availabilities = {
      some: {
        availableAll: {
          gt: 0
        }
      }
    };
  }

  if (params.sort === "price-asc") orderBy.push({ pricePerMonth: "asc" });
  if (params.sort === "price-desc") orderBy.push({ pricePerMonth: "desc" });
  if (params.sort === "rating") orderBy.push({ ratingCache: "desc" });
  if (!orderBy.length || params.sort === "availability") {
    orderBy.push({ featured: "desc" }, { ratingCache: "desc" });
  }

  try {
    const homes = await db.careHome.findMany({
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

    if (params.sort === "availability") {
      homes.sort((a, b) => getAvailabilitySnapshot(b).freeRooms - getAvailabilitySnapshot(a).freeRooms);
    }

    return homes;
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
