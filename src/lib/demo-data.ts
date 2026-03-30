const baseDate = new Date("2026-04-01T00:00:00.000Z");

function month(offset: number) {
  const date = new Date(baseDate);
  date.setUTCMonth(date.getUTCMonth() + offset);
  return date;
}

function stringify(value: string[]) {
  return JSON.stringify(value);
}

export const demoHomes = [
  {
    id: "demo-silver-garden",
    name: "Silver Garden Residence",
    slug: "silver-garden-residence",
    city: "Barcelona",
    country: "Spain",
    address: "14 Carrer de la Marina",
    pricePerMonth: 3200,
    description:
      "Silver Garden Residence offers a calm seaside setting, on-site nursing, and a structured wellbeing program designed for seniors who want both independence and daily support.",
    shortDescription: "Coastal assisted living with daily wellness support and memory care.",
    photos: stringify([
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1448630360428-65456885c650?auto=format&fit=crop&w=1200&q=80"
    ]),
    services: stringify(["24/7 medical care", "Dementia care", "Rehabilitation", "Physiotherapy"]),
    ratingCache: 4.8,
    reviewCountCache: 12,
    featured: true,
    createdAt: baseDate,
    updatedAt: baseDate,
    availabilities: [0, 1, 2, 3, 4, 5].map((index) => ({
      id: `silver-slot-${index}`,
      careHomeId: "demo-silver-garden",
      monthStart: month(index),
      availableAll: index === 1 ? 2 : 4
    })),
    reviews: [
      {
        id: "silver-review-1",
        userId: "demo-user-1",
        careHomeId: "demo-silver-garden",
        rating: 5,
        comment: "Warm staff and excellent communication with our family.",
        createdAt: baseDate,
        user: { name: "Olivia Carter" }
      },
      {
        id: "silver-review-2",
        userId: "demo-user-2",
        careHomeId: "demo-silver-garden",
        rating: 4,
        comment: "Beautiful property and strong rehab services.",
        createdAt: baseDate,
        user: { name: "Liam Becker" }
      }
    ]
  },
  {
    id: "demo-maple-harbor",
    name: "Maple Harbor Care Suites",
    slug: "maple-harbor-care-suites",
    city: "Amsterdam",
    country: "Netherlands",
    address: "89 Keizersgracht",
    pricePerMonth: 4100,
    description:
      "Maple Harbor Care Suites combines boutique-style accommodation with clinical oversight, rehabilitation specialists, and weekly family update summaries.",
    shortDescription: "Premium care suites with mobility assistance and nutrition programs.",
    photos: stringify([
      "https://images.unsplash.com/photo-1448630360428-65456885c650?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80"
    ]),
    services: stringify(["Medical care", "Nutrition planning", "Mobility assistance", "Rehabilitation"]),
    ratingCache: 4.9,
    reviewCountCache: 18,
    featured: false,
    createdAt: baseDate,
    updatedAt: baseDate,
    availabilities: [0, 1, 2, 3, 4, 5].map((index) => ({
      id: `maple-slot-${index}`,
      careHomeId: "demo-maple-harbor",
      monthStart: month(index),
      availableAll: 3
    })),
    reviews: [
      {
        id: "maple-review-1",
        userId: "demo-user-1",
        careHomeId: "demo-maple-harbor",
        rating: 5,
        comment: "The booking process was smooth and the team was responsive.",
        createdAt: baseDate,
        user: { name: "Olivia Carter" }
      }
    ]
  },
  {
    id: "demo-willow-brook",
    name: "Willow Brook Living",
    slug: "willow-brook-living",
    city: "Lisbon",
    country: "Portugal",
    address: "33 Avenida da Liberdade",
    pricePerMonth: 2800,
    description:
      "Willow Brook Living focuses on social engagement, medication support, and comfortable long-stay accommodation with easy access to central healthcare providers.",
    shortDescription: "Affordable assisted living with strong community activities.",
    photos: stringify([
      "https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80"
    ]),
    services: stringify(["Medication support", "Social activities", "Medical visits"]),
    ratingCache: 4.3,
    reviewCountCache: 9,
    featured: false,
    createdAt: baseDate,
    updatedAt: baseDate,
    availabilities: [0, 1, 2, 3, 4, 5].map((index) => ({
      id: `willow-slot-${index}`,
      careHomeId: "demo-willow-brook",
      monthStart: month(index),
      availableAll: 5
    })),
    reviews: []
  },
  {
    id: "demo-oakview",
    name: "Oakview Memory Retreat",
    slug: "oakview-memory-retreat",
    city: "Munich",
    country: "Germany",
    address: "7 Lindwurmstrasse",
    pricePerMonth: 4700,
    description:
      "Oakview Memory Retreat is purpose-built for residents needing dementia and memory-focused support, with secure landscaped spaces and structured therapy.",
    shortDescription: "Specialized memory care with secure units and therapeutic activities.",
    photos: stringify([
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80"
    ]),
    services: stringify(["Dementia care", "Secure memory unit", "Occupational therapy", "24/7 nursing"]),
    ratingCache: 4.7,
    reviewCountCache: 15,
    featured: false,
    createdAt: baseDate,
    updatedAt: baseDate,
    availabilities: [0, 1, 2, 3, 4, 5].map((index) => ({
      id: `oak-slot-${index}`,
      careHomeId: "demo-oakview",
      monthStart: month(index),
      availableAll: index === 0 ? 1 : 2
    })),
    reviews: []
  },
  {
    id: "demo-sunny-vale",
    name: "Sunny Vale Senior Lodge",
    slug: "sunny-vale-senior-lodge",
    city: "Prague",
    country: "Czech Republic",
    address: "52 Vinohradska",
    pricePerMonth: 2600,
    description:
      "Sunny Vale Senior Lodge supports families looking for flexible stays, predictable pricing, and practical daily care services.",
    shortDescription: "Comfortable long-stay lodge with flexible monthly plans.",
    photos: stringify([
      "https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1448630360428-65456885c650?auto=format&fit=crop&w=1200&q=80"
    ]),
    services: stringify(["Flexible stay", "Medical supervision", "Laundry", "Transportation"]),
    ratingCache: 4.4,
    reviewCountCache: 11,
    featured: true,
    createdAt: baseDate,
    updatedAt: baseDate,
    availabilities: [0, 1, 2, 3, 4, 5].map((index) => ({
      id: `sunny-slot-${index}`,
      careHomeId: "demo-sunny-vale",
      monthStart: month(index),
      availableAll: 4
    })),
    reviews: []
  }
];

export const demoUser = {
  id: "demo-user-1",
  name: "Olivia Carter",
  email: "olivia@example.com",
  role: "USER" as const,
  createdAt: baseDate
};
