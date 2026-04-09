"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import {
  clearSession,
  createSession,
  hashPassword,
  requireAdmin,
  requireUser,
  verifyPassword
} from "@/lib/auth";
import { db } from "@/lib/db";

const BOOKING_STATUSES = ["PENDING", "CONFIRMED", "CANCELLED"] as const;
type BookingStatus = (typeof BOOKING_STATUSES)[number];
type UserRole = "USER" | "ADMIN";

const STATUS_LABELS_PL: Record<BookingStatus, string> = {
  PENDING: "oczekujaca",
  CONFIRMED: "potwierdzona",
  CANCELLED: "anulowana"
};

const authSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email(),
  password: z.string().min(8)
});

const listingSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(3),
  city: z.string().min(2),
  country: z.string().min(2),
  address: z.string().min(5),
  pricePerMonth: z.coerce.number().int().min(1),
  shortDescription: z.string().min(12),
  description: z.string().min(40),
  services: z.string().min(3),
  photos: z.string().min(10),
  featured: z.coerce.boolean().optional()
});

const bookingSchema = z.object({
  careHomeId: z.string(),
  residentName: z.string().min(2),
  startDate: z.string().min(1),
  months: z.coerce.number().int().min(1).max(24)
});

async function createUniqueSlug(name: string, currentId?: string) {
  const baseSlug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  let slug = baseSlug;
  let suffix = 1;

  while (true) {
    const existing = await db.careHome.findUnique({
      where: { slug },
      select: { id: true }
    });

    if (!existing || existing.id === currentId) {
      return slug;
    }

    suffix += 1;
    slug = `${baseSlug}-${suffix}`;
  }
}

function monthKey(date: Date) {
  const copy = new Date(date);
  copy.setUTCDate(1);
  copy.setUTCHours(0, 0, 0, 0);
  return copy;
}

function monthSequence(start: Date, months: number) {
  return Array.from({ length: months }, (_, index) => {
    const month = monthKey(start);
    month.setUTCMonth(month.getUTCMonth() + index);
    return month;
  });
}

async function refreshRating(careHomeId: string) {
  const stats = await db.review.aggregate({
    where: { careHomeId },
    _avg: { rating: true },
    _count: { rating: true }
  });

  await db.careHome.update({
    where: { id: careHomeId },
    data: {
      ratingCache: stats._avg.rating ?? 0,
      reviewCountCache: stats._count.rating
    }
  });
}

export async function registerAction(formData: FormData) {
  const parsed = authSchema.extend({ name: z.string().min(2) }).safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password")
  });

  if (!parsed.success) {
    throw new Error("Please provide a valid name, email, and password.");
  }

  const existing = await db.user.findUnique({
    where: { email: parsed.data.email }
  });

  if (existing) {
    throw new Error("An account with this email already exists.");
  }

  const user = await db.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      passwordHash: await hashPassword(parsed.data.password)
    }
  });

  await createSession({ userId: user.id, role: "USER" });
  redirect("/");
}

export async function loginAction(formData: FormData) {
  const parsed = authSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password")
  });

  if (!parsed.success) {
    throw new Error("Please use a valid email and password.");
  }

  const user = await db.user.findUnique({
    where: { email: parsed.data.email }
  });

  if (!user || !(await verifyPassword(parsed.data.password, user.passwordHash))) {
    throw new Error("Incorrect email or password.");
  }

  const role: UserRole = user.role === "ADMIN" ? "ADMIN" : "USER";
  await createSession({ userId: user.id, role });
  redirect(role === "ADMIN" ? "/admin" : "/");
}

export async function logoutAction() {
  await clearSession();
  redirect("/");
}

export async function toggleFavoriteAction(formData: FormData) {
  const user = await requireUser();
  const careHomeId = String(formData.get("careHomeId"));

  const existing = await db.favorite.findUnique({
    where: {
      userId_careHomeId: {
        userId: user.id,
        careHomeId
      }
    }
  });

  if (existing) {
    await db.favorite.delete({ where: { id: existing.id } });
  } else {
    await db.favorite.create({
      data: {
        userId: user.id,
        careHomeId
      }
    });
  }

  revalidatePath("/");
  revalidatePath("/profile");
  revalidatePath("/listings/[slug]", "page");
}

export async function createBookingAction(formData: FormData) {
  const user = await requireUser();
  const locale = String(formData.get("locale") || "en") === "pl" ? "pl" : "en";
  const parsed = bookingSchema.safeParse({
    careHomeId: formData.get("careHomeId"),
    residentName: formData.get("residentName"),
    startDate: formData.get("startDate"),
    months: formData.get("months")
  });

  if (!parsed.success) {
    throw new Error("Please complete all booking fields.");
  }

  const home = await db.careHome.findUnique({
    where: { id: parsed.data.careHomeId },
    include: { availabilities: true }
  });

  if (!home) {
    throw new Error("This care home is no longer available.");
  }

  const startDate = monthKey(new Date(parsed.data.startDate));
  const months = monthSequence(startDate, parsed.data.months);

  await db.$transaction(async (tx) => {
    const slots = await tx.availability.findMany({
      where: {
        careHomeId: home.id,
        monthStart: { in: months }
      }
    });

    if (slots.length !== months.length || slots.some((slot) => slot.availableAll < 1)) {
      throw new Error("Selected dates are not fully available.");
    }

    for (const slot of slots) {
      await tx.availability.update({
        where: { id: slot.id },
        data: { availableAll: slot.availableAll - 1 }
      });
    }

    await tx.booking.create({
      data: {
        userId: user.id,
        careHomeId: home.id,
        residentName: parsed.data.residentName,
        startDate,
        months: parsed.data.months,
        totalPrice: parsed.data.months * home.pricePerMonth
      }
    });

    await tx.notification.create({
      data: {
        userId: user.id,
        title: locale === "pl" ? "Rezerwacja potwierdzona" : "Booking confirmed",
        body:
          locale === "pl"
            ? `${home.name} jest zarezerwowany od ${startDate.toLocaleDateString("pl-PL")}.`
            : `${home.name} is reserved starting ${startDate.toLocaleDateString()}.`
      }
    });
  });

  revalidatePath("/profile");
  redirect("/profile");
}

export async function createReviewAction(formData: FormData) {
  const user = await requireUser();
  const careHomeId = String(formData.get("careHomeId"));
  const rating = Number(formData.get("rating"));
  const comment = String(formData.get("comment"));

  if (!careHomeId || !comment || rating < 1 || rating > 5) {
    throw new Error("Please include a rating and review comment.");
  }

  await db.review.create({
    data: {
      userId: user.id,
      careHomeId,
      rating,
      comment
    }
  });

  await refreshRating(careHomeId);
  revalidatePath("/listings/[slug]", "page");
}

export async function upsertListingAction(formData: FormData) {
  await requireAdmin();
  const parsed = listingSchema.safeParse({
    id: formData.get("id") || undefined,
    name: formData.get("name"),
    city: formData.get("city"),
    country: formData.get("country"),
    address: formData.get("address"),
    pricePerMonth: formData.get("pricePerMonth"),
    shortDescription: formData.get("shortDescription"),
    description: formData.get("description"),
    services: formData.get("services"),
    photos: formData.get("photos"),
    featured: formData.get("featured") === "on"
  });

  if (!parsed.success) {
    throw new Error(
      `Invalid listing fields: ${parsed.error.issues
        .map((issue) => issue.path.join(".") || "unknown")
        .join(", ")}`
    );
  }

  const slug = await createUniqueSlug(parsed.data.name, parsed.data.id);

  const payload = {
    name: parsed.data.name,
    slug,
    city: parsed.data.city,
    country: parsed.data.country,
    address: parsed.data.address,
    pricePerMonth: parsed.data.pricePerMonth,
    shortDescription: parsed.data.shortDescription,
    description: parsed.data.description,
    services: JSON.stringify(
      parsed.data.services
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
    ),
    photos: JSON.stringify(
      parsed.data.photos
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
    ),
    featured: Boolean(parsed.data.featured)
  };

  if (parsed.data.id) {
    await db.careHome.update({
      where: { id: parsed.data.id },
      data: payload
    });
  } else {
    const created = await db.careHome.create({ data: payload });

    const today = new Date();
    for (let index = 0; index < 6; index += 1) {
      const monthStart = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() + index, 1));
      await db.availability.create({
        data: {
          careHomeId: created.id,
          monthStart,
          availableAll: 3
        }
      });
    }
  }

  revalidatePath("/");
  revalidatePath("/admin");
  redirect("/admin");
}

export async function deleteListingAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));

  await db.careHome.delete({ where: { id } });
  revalidatePath("/admin");
  revalidatePath("/");
}

export async function updateBookingStatusAction(formData: FormData) {
  await requireAdmin();
  const locale = String(formData.get("locale") || "en") === "pl" ? "pl" : "en";
  const bookingId = String(formData.get("bookingId"));
  const status = String(formData.get("status")) as BookingStatus;

  if (!BOOKING_STATUSES.includes(status)) {
    throw new Error("Invalid booking status.");
  }

  const booking = await db.booking.update({
    where: { id: bookingId },
    data: { status },
    include: {
      user: true,
      careHome: true
    }
  });

  await db.notification.create({
    data: {
      userId: booking.userId,
      title: locale === "pl" ? `Rezerwacja ${STATUS_LABELS_PL[status]}` : `Booking ${status.toLowerCase()}`,
      body:
        locale === "pl"
          ? `Twoja rezerwacja w ${booking.careHome.name} ma teraz status ${STATUS_LABELS_PL[status]}.`
          : `Your booking for ${booking.careHome.name} is now ${status.toLowerCase()}.`
    }
  });

  revalidatePath("/admin");
  revalidatePath("/profile");
}
