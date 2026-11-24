import { getStrapiBaseUrl } from "@/lib/constants";

type StrapiFormat = { url: string; width: number; height?: number };

/** Minimal shape of a Strapi media object that these helpers need. */
export interface StrapiImageLike {
  url?: string;
  width?: number;
  formats?: Partial<
    Record<"thumbnail" | "small" | "medium" | "large", StrapiFormat | undefined>
  > | null;
}

/** Turns a Strapi media URL (often a relative "/uploads/...") into an absolute one. */
export function resolveStrapiUrl(url?: string | null): string {
  if (!url) return "";
  if (/^(https?:)?\/\//.test(url) || url.startsWith("data:")) return url;
  return `${getStrapiBaseUrl()}${url}`;
}

/** Resized versions Strapi generated, smallest first (original excluded). */
function sortedFormats(img?: StrapiImageLike | null): StrapiFormat[] {
  if (!img?.formats) return [];
  return Object.values(img.formats)
    .filter((f): f is StrapiFormat => !!f?.url && !!f.width)
    .sort((a, b) => a.width - b.width);
}

/**
 * Returns the URL of the smallest version at least `targetWidth` px wide.
 * Falls back to the largest generated format, then to the original upload.
 */
export function pickStrapiImage(
  img: StrapiImageLike | null | undefined,
  targetWidth: number,
): string {
  const formats = sortedFormats(img);
  const match =
    formats.find((f) => f.width >= targetWidth) ?? formats[formats.length - 1];
  return resolveStrapiUrl(match?.url ?? img?.url);
}

/**
 * Builds a `srcset` from the generated formats so the browser can choose the
 * right size for the card. The original is left out on purpose: uploads can
 * be several MB and are never needed for a grid card. Returns "" when the
 * image has no generated formats.
 */
export function strapiSrcSet(img: StrapiImageLike | null | undefined): string {
  return sortedFormats(img)
    .map((f) => `${resolveStrapiUrl(f.url)} ${f.width}w`)
    .join(", ");
}
