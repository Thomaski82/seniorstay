// @ts-nocheck
import { PrismaClient } from "@prisma/client";
import * as cheerio from "cheerio";
import iconv from "iconv-lite";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const prisma = new PrismaClient();
const DEFAULT_URL = "https://www.domyseniora.pl/prywatne_domy_opieki.html";
const DEFAULT_OUTPUT = "data/domyseniora-private-care-homes.json";

type ListingSeed = {
  name: string;
  sourceUrl: string;
  imageUrl: string;
  summaryText: string;
  city: string;
  address: string;
  category: string;
  rating: number | null;
  hasFreeRooms: boolean;
};

type ListingRecord = {
  sourceName: string;
  sourceUrl: string;
  externalId: string;
  name: string;
  slugCandidate: string;
  city: string;
  country: string;
  address: string;
  pricePerMonth: number | null;
  category: string;
  description: string;
  shortDescription: string;
  photos: string[];
  services: string[];
  rating: number | null;
  reviewCount: number | null;
  freeRooms: number | null;
  occupiedRooms: number | null;
  hasFreeRooms: boolean;
  rawData: Record<string, unknown>;
};

function parseArgs() {
  const args = process.argv.slice(2);
  const result: Record<string, string | boolean> = {
    url: DEFAULT_URL,
    output: DEFAULT_OUTPUT,
    import: false
  };

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--import") result.import = true;
    if (arg === "--url" && args[index + 1]) result.url = args[index + 1];
    if (arg === "--output" && args[index + 1]) result.output = args[index + 1];
  }

  return {
    url: String(result.url),
    output: String(result.output),
    shouldImport: Boolean(result.import)
  };
}

function normalizeWhitespace(value: string) {
  return value.replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim();
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function absoluteUrl(href?: string | null) {
  if (!href) return "";
  if (href.startsWith("http://") || href.startsWith("https://")) return href;
  return new URL(href, DEFAULT_URL).toString();
}

async function fetchHtml(url: string) {
  const response = await fetch(url, {
    headers: {
      "user-agent": "SeniorStayBot/1.0 (+https://seniorstay.example)"
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
  }

  const contentType = response.headers.get("content-type") || "";
  const buffer = Buffer.from(await response.arrayBuffer());
  const headerCharset = contentType.match(/charset=([^;]+)/i)?.[1]?.toLowerCase();

  if (headerCharset && headerCharset !== "utf-8" && headerCharset !== "utf8") {
    return iconv.decode(buffer, headerCharset);
  }

  const utf8Html = buffer.toString("utf8");
  const metaCharset = utf8Html.match(/charset=([a-zA-Z0-9\-_]+)/i)?.[1]?.toLowerCase();

  if (metaCharset && metaCharset !== "utf-8" && metaCharset !== "utf8") {
    return iconv.decode(buffer, metaCharset);
  }

  return utf8Html;
}

function parseAddressLine(blockText: string) {
  const lines = blockText
    .split("\n")
    .map((line) => normalizeWhitespace(line))
    .filter(Boolean);

  const candidate = lines.find(
    (line) =>
      line.includes(",") &&
      !line.startsWith("Kategoria:") &&
      !line.startsWith("Ocena") &&
      !line.includes("Zobacz ofertę") &&
      !line.includes("Zapytaj o ofertę") &&
      !line.toLowerCase().includes("wolne pokoje")
  );

  if (!candidate) {
    return { city: "Unknown", address: "Unknown" };
  }

  const [city, ...rest] = candidate.split(",");
  return {
    city: normalizeWhitespace(city),
    address: normalizeWhitespace(rest.join(","))
  };
}

function parseCategory(blockText: string) {
  const match = blockText.match(/Kategoria:\s*(.+)/i);
  return normalizeWhitespace(match?.[1] ?? "Prywatne Domy Opieki");
}

function parseRating(blockText: string) {
  const match = blockText.match(/Ocena\s+([0-9]+(?:[.,][0-9]+)?)/i);
  if (!match) return null;
  return Number(match[1].replace(",", "."));
}

function parseSummary(blockText: string) {
  const lines = blockText
    .split("\n")
    .map((line) => normalizeWhitespace(line))
    .filter(Boolean);

  const filtered = lines.filter(
    (line) =>
      !line.startsWith("Kategoria:") &&
      !line.startsWith("Ocena") &&
      !line.includes("Zobacz ofertę") &&
      !line.includes("Zapytaj o ofertę") &&
      !line.toLowerCase().includes("wolne pokoje")
  );

  return filtered.join(" ").trim();
}

function inferServices(text: string) {
  const services: string[] = [];
  const normalized = text.toLowerCase();

  if (normalized.includes("rehabilit")) services.push("Rehabilitation");
  if (normalized.includes("opieka medyczna") || normalized.includes("medyczn")) services.push("Medical care");
  if (normalized.includes("demenc") || normalized.includes("alzheimer")) services.push("Dementia care");
  if (normalized.includes("piel")) services.push("24/7 nursing");
  if (normalized.includes("fizjoter")) services.push("Physiotherapy");
  if (normalized.includes("transport")) services.push("Transportation");
  if (normalized.includes("wyżyw") || normalized.includes("wyzyw")) services.push("Meal plans");

  return [...new Set(services)];
}

function extractListingSeeds($: cheerio.CheerioAPI) {
  const seeds: ListingSeed[] = [];

  $("h2").each((_, element) => {
    const heading = normalizeWhitespace($(element).text());
    if (!heading) return;

    const siblingTexts: string[] = [];
    let cursor = $(element).next();
    let guard = 0;

    while (cursor.length && cursor.get(0)?.tagName !== "h2" && guard < 20) {
      const text = normalizeWhitespace(cursor.text());
      if (text) siblingTexts.push(text);
      cursor = cursor.next();
      guard += 1;
    }

    const blockText = siblingTexts.join("\n");
    if (!blockText.includes("Kategoria:") || !blockText.includes("Zobacz ofertę")) return;

    const href = absoluteUrl($(element).find("a").attr("href"));
    const previousImage = $(element).prevAll("img").first();

    const { city, address } = parseAddressLine(blockText);
    seeds.push({
      name: heading,
      sourceUrl: href || DEFAULT_URL,
      imageUrl: absoluteUrl(previousImage.attr("src")),
      summaryText: parseSummary(blockText),
      city,
      address,
      category: parseCategory(blockText),
      rating: parseRating(blockText),
      hasFreeRooms: /wolne pokoje/i.test(blockText)
    });
  });

  return seeds;
}

function extractTextBlocks($: cheerio.CheerioAPI) {
  return $("p, li")
    .map((_, element) => normalizeWhitespace($(element).text()))
    .get()
    .filter((text) => text.length > 30);
}

function extractPhotos($: cheerio.CheerioAPI) {
  const photoUrls = $("img")
    .map((_, element) => absoluteUrl($(element).attr("src")))
    .get()
    .filter((url) => url && !url.includes("logo") && !url.includes("icon"));

  return [...new Set(photoUrls)].slice(0, 8);
}

function extractAddress($: cheerio.CheerioAPI, fallback: string) {
  const bodyText = normalizeWhitespace($("body").text());
  const match = bodyText.match(/Adres[:\s]+([^|]+?)(?:Telefon|WWW|E-mail|Mapa|$)/i);
  return normalizeWhitespace(match?.[1] ?? fallback);
}

function extractReviewCount($: cheerio.CheerioAPI) {
  const bodyText = normalizeWhitespace($("body").text());
  const match = bodyText.match(/([0-9]+)\s+opini/i);
  return match ? Number(match[1]) : null;
}

function extractFreeRooms($: cheerio.CheerioAPI, hasFreeRooms: boolean) {
  const bodyText = normalizeWhitespace($("body").text());
  const freeMatch = bodyText.match(/([0-9]+)\s+woln(?:e|ych)\s+pokoi/i);

  if (freeMatch) return Number(freeMatch[1]);
  if (hasFreeRooms) return 1;
  return 0;
}

async function enrichListing(seed: ListingSeed): Promise<ListingRecord> {
  let detailHtml = "";
  let detailTextBlocks: string[] = [];
  let photos = seed.imageUrl ? [seed.imageUrl] : [];
  let address = seed.address;
  let reviewCount: number | null = null;

  try {
    detailHtml = await fetchHtml(seed.sourceUrl);
    const $detail = cheerio.load(detailHtml);
    detailTextBlocks = extractTextBlocks($detail);
    const detailPhotos = extractPhotos($detail);
    photos = [...new Set([...photos, ...detailPhotos])].slice(0, 8);
    address = extractAddress($detail, seed.address);
    reviewCount = extractReviewCount($detail);
  } catch (error) {
    console.warn(`Failed to enrich ${seed.sourceUrl}:`, error);
  }

  const descriptionBlocks = [seed.summaryText, ...detailTextBlocks].filter(Boolean);
  const description = normalizeWhitespace(descriptionBlocks.join(" ").slice(0, 5000));
  const freeRooms = extractFreeRooms(cheerio.load(detailHtml || "<html></html>"), seed.hasFreeRooms);

  return {
    sourceName: "domyseniora.pl",
    sourceUrl: seed.sourceUrl,
    externalId: slugify(seed.sourceUrl),
    name: seed.name,
    slugCandidate: slugify(`${seed.name}-${seed.city}`),
    city: seed.city,
    country: "Poland",
    address,
    pricePerMonth: null,
    category: seed.category,
    description: description || seed.summaryText || "Brak opisu zrodla.",
    shortDescription: (description || seed.summaryText || "Brak opisu zrodla.").slice(0, 220),
    photos,
    services: inferServices(`${seed.summaryText} ${description}`),
    rating: seed.rating,
    reviewCount,
    freeRooms,
    occupiedRooms: null,
    hasFreeRooms: freeRooms > 0,
    rawData: {
      listingSummary: seed.summaryText,
      detailPreview: detailTextBlocks.slice(0, 10),
      category: seed.category
    }
  };
}

async function scrape(url: string) {
  const html = await fetchHtml(url);
  const $ = cheerio.load(html);
  const seeds = extractListingSeeds($);
  const records: ListingRecord[] = [];

  for (const seed of seeds) {
    records.push(await enrichListing(seed));
  }

  return records;
}

async function writeJson(outputPath: string, listings: ListingRecord[]) {
  const absolute = resolve(outputPath);
  await mkdir(dirname(absolute), { recursive: true });
  await writeFile(absolute, JSON.stringify(listings, null, 2), "utf8");
  return absolute;
}

async function importToStaging(listings: ListingRecord[]) {
  for (const listing of listings) {
    const payload = {
      sourceName: listing.sourceName,
      sourceUrl: listing.sourceUrl,
      externalId: listing.externalId,
      name: listing.name,
      slugCandidate: listing.slugCandidate,
      city: listing.city,
      country: listing.country,
      address: listing.address,
      pricePerMonth: listing.pricePerMonth,
      description: listing.description,
      shortDescription: listing.shortDescription,
      photos: JSON.stringify(listing.photos),
      services: JSON.stringify(listing.services),
      rating: listing.rating,
      reviewCount: listing.reviewCount,
      freeRooms: listing.freeRooms,
      occupiedRooms: listing.occupiedRooms,
      hasFreeRooms: listing.hasFreeRooms,
      rawData: JSON.stringify(listing.rawData),
      status: "PENDING",
      rejectionReason: null
    };

    const existing = await prisma.importedCareHome.findUnique({
      where: { externalId: listing.externalId }
    });

    if (existing) {
      await prisma.importedCareHome.update({
        where: { id: existing.id },
        data: payload
      });
    } else {
      await prisma.importedCareHome.create({ data: payload });
    }
  }
}

async function main() {
  const { url, output, shouldImport } = parseArgs();
  const listings = await scrape(url);
  const outputPath = await writeJson(output, listings);

  console.log(`Scraped ${listings.length} listings from ${url}`);
  console.log(`Saved JSON to ${outputPath}`);

  if (shouldImport) {
    await importToStaging(listings);
    console.log("Imported listings into ImportedCareHome staging table.");
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
