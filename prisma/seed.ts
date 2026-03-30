import { PrismaClient } from "@prisma/client";
// Use require here so the seed script doesn't depend on external TS typings in CI builds.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const bcrypt: { hash(password: string, rounds: number): Promise<string> } = require("bcryptjs");

const prisma = new PrismaClient();

type SeedHome = {
  name: string;
  slug: string;
  city: string;
  country: string;
  address: string;
  pricePerMonth: number;
  shortDescription: string;
  description: string;
  photos: string[];
  services: string[];
  featured?: boolean;
  reviews: Array<{ rating: number; comment: string; userEmail: string }>;
};

const homes: SeedHome[] = [
  {
    name: "Silver Garden Residence",
    slug: "silver-garden-residence",
    city: "Barcelona",
    country: "Spain",
    address: "14 Carrer de la Marina",
    pricePerMonth: 3200,
    shortDescription: "Coastal assisted living with daily wellness support and memory care.",
    description:
      "Silver Garden Residence offers a calm seaside setting, on-site nursing, and a structured wellbeing program designed for seniors who want both independence and daily support. Families can track bookings and review care plans with transparent service information.",
    photos: [
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80"
    ],
    services: ["24/7 medical care", "Dementia care", "Rehabilitation", "Physiotherapy", "Garden access"],
    featured: true,
    reviews: [
      { rating: 5, comment: "Warm staff and excellent communication with our family.", userEmail: "olivia@example.com" },
      { rating: 4, comment: "Beautiful property and strong rehab services.", userEmail: "liam@example.com" }
    ]
  },
  {
    name: "Maple Harbor Care Suites",
    slug: "maple-harbor-care-suites",
    city: "Amsterdam",
    country: "Netherlands",
    address: "89 Keizersgracht",
    pricePerMonth: 4100,
    shortDescription: "Premium care suites with mobility assistance and nutrition programs.",
    description:
      "Maple Harbor Care Suites combines boutique-style accommodation with clinical oversight, rehabilitation specialists, and weekly family update summaries. It is suited for both short recovery stays and longer assisted living arrangements.",
    photos: [
      "https://images.unsplash.com/photo-1448630360428-65456885c650?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80"
    ],
    services: ["Medical care", "Nutrition planning", "Mobility assistance", "Rehabilitation", "Private rooms"],
    reviews: [
      { rating: 5, comment: "The booking process was smooth and the team was responsive.", userEmail: "olivia@example.com" },
      { rating: 5, comment: "Outstanding facility with thoughtful amenities.", userEmail: "liam@example.com" }
    ]
  },
  {
    name: "Willow Brook Living",
    slug: "willow-brook-living",
    city: "Lisbon",
    country: "Portugal",
    address: "33 Avenida da Liberdade",
    pricePerMonth: 2800,
    shortDescription: "Affordable assisted living with strong community activities.",
    description:
      "Willow Brook Living focuses on social engagement, medication support, and comfortable long-stay accommodation. Residents benefit from language-inclusive staff, wellness sessions, and easy access to central Lisbon healthcare providers.",
    photos: [
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=1200&q=80"
    ],
    services: ["Medication support", "Social activities", "Medical visits", "Accessible bathrooms"],
    reviews: [
      { rating: 4, comment: "Great value and a very kind activities team.", userEmail: "olivia@example.com" }
    ]
  },
  {
    name: "Oakview Memory Retreat",
    slug: "oakview-memory-retreat",
    city: "Munich",
    country: "Germany",
    address: "7 Lindwurmstrasse",
    pricePerMonth: 4700,
    shortDescription: "Specialized memory care with secure units and therapeutic activities.",
    description:
      "Oakview Memory Retreat is purpose-built for residents needing dementia and memory-focused support. The facility includes secure landscaped spaces, structured therapy, and strong family communication protocols.",
    photos: [
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80"
    ],
    services: ["Dementia care", "Secure memory unit", "Occupational therapy", "24/7 nursing"],
    reviews: [
      { rating: 5, comment: "A reassuring option for memory care needs.", userEmail: "liam@example.com" },
      { rating: 4, comment: "Very specialized staff and safe environment.", userEmail: "olivia@example.com" }
    ]
  },
  {
    name: "Sunny Vale Senior Lodge",
    slug: "sunny-vale-senior-lodge",
    city: "Prague",
    country: "Czech Republic",
    address: "52 Vinohradska",
    pricePerMonth: 2600,
    shortDescription: "Comfortable long-stay lodge with flexible monthly plans.",
    description:
      "Sunny Vale Senior Lodge supports families looking for flexible stays, predictable pricing, and practical daily care services. It works well for step-down stays after hospital treatment or permanent assisted living.",
    photos: [
      "https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1448630360428-65456885c650?auto=format&fit=crop&w=1200&q=80"
    ],
    services: ["Flexible stay", "Medical supervision", "Laundry", "Meal plans", "Transportation"],
    featured: true,
    reviews: [
      { rating: 4, comment: "Flexible booking made a stressful decision much easier.", userEmail: "liam@example.com" }
    ]
  }
];

function monthStart(offset: number) {
  const date = new Date();
  date.setUTCDate(1);
  date.setUTCHours(0, 0, 0, 0);
  date.setUTCMonth(date.getUTCMonth() + offset);
  return date;
}

async function main() {
  await prisma.notification.deleteMany();
  await prisma.review.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.availability.deleteMany();
  await prisma.careHome.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("password123", 10);

  const admin = await prisma.user.create({
    data: {
      name: "Admin User",
      email: "admin@seniorstay.com",
      passwordHash,
      role: "ADMIN"
    }
  });

  const seedUsers = await Promise.all(
    [
      { name: "Olivia Carter", email: "olivia@example.com" },
      { name: "Liam Becker", email: "liam@example.com" },
      { name: "Emma Dawson", email: "emma@example.com" }
    ].map((user) =>
      prisma.user.create({
        data: {
          ...user,
          passwordHash
        }
      })
    )
  );

  for (const home of homes) {
    const created = await prisma.careHome.create({
      data: {
        name: home.name,
        slug: home.slug,
        city: home.city,
        country: home.country,
        address: home.address,
        pricePerMonth: home.pricePerMonth,
        shortDescription: home.shortDescription,
        description: home.description,
        photos: JSON.stringify(home.photos),
        services: JSON.stringify(home.services),
        featured: Boolean(home.featured)
      }
    });

    for (let index = 0; index < 6; index += 1) {
      await prisma.availability.create({
        data: {
          careHomeId: created.id,
          monthStart: monthStart(index),
          availableAll: index === 1 ? 2 : 4
        }
      });
    }

    for (const review of home.reviews) {
      const author = seedUsers.find((user) => user.email === review.userEmail);
      if (!author) continue;
      await prisma.review.create({
        data: {
          careHomeId: created.id,
          userId: author.id,
          rating: review.rating,
          comment: review.comment
        }
      });
    }

    const stats = await prisma.review.aggregate({
      where: { careHomeId: created.id },
      _avg: { rating: true },
      _count: { rating: true }
    });

    await prisma.careHome.update({
      where: { id: created.id },
      data: {
        ratingCache: stats._avg.rating ?? 0,
        reviewCountCache: stats._count.rating
      }
    });
  }

  const favoriteHome = await prisma.careHome.findFirst({ where: { featured: true } });

  if (favoriteHome) {
    await prisma.favorite.create({
      data: {
        userId: seedUsers[0].id,
        careHomeId: favoriteHome.id
      }
    });

    await prisma.booking.create({
      data: {
        userId: seedUsers[0].id,
        careHomeId: favoriteHome.id,
        residentName: "Margaret Carter",
        startDate: monthStart(0),
        months: 3,
        totalPrice: favoriteHome.pricePerMonth * 3
      }
    });

    await prisma.notification.create({
      data: {
        userId: seedUsers[0].id,
        title: "Booking confirmed",
        body: `Your stay at ${favoriteHome.name} has been confirmed.`
      }
    });
  }

  console.log("Seed complete");
  console.log({
    admin: admin.email,
    user: seedUsers[0].email,
    password: "password123"
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
