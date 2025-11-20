import {
  formatDate as formatDateX,
  formatDistanceToNow,
  isToday,
  isYesterday,
  parseISO,
} from "date-fns";

// export async function parseMdx(content: string) {
//   return serialize(content, {
//     mdxOptions: {
//       remarkPlugins: [],
//       rehypePlugins: [rehypeSlug],
//     },
//   });
// }

export function extractYouTubeId(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/.*v=|youtu\.be\/)([\w-]{11})/);
  return match ? match[1] : null;
}

export function getYoutubeEmbedUrl(url: string): string {
  const match = url.match(/(?:youtube\.com\/.*v=|youtu\.be\/)([\w-]{11})/);
  const id = match?.[1];
  return id ? `https://www.youtube.com/embed/${id}` : "";
}

export function buildStrapiQuery(
  filters: Record<string, string> = {},
  populateAll = true
) {
  const query = new URLSearchParams();

  for (const key in filters) {
    query.append(`filters[${key}][$eq]`, filters[key]);
  }

  if (populateAll) {
    query.append("populate", "*");
  }

  return query.toString();
}

export function timeAgo(dateString: string): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  return formatDistanceToNow(date, { addSuffix: true });
}

export function formatPrice(
  amount: number | string,
  currency: string = "NGN",
  locale: string = "en-NG"
): string {
  const value =
    typeof amount === "string" ? parseFloat(amount.replace(/,/g, "")) : amount;

  if (isNaN(value)) return "Invalid amount";

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatDateTime(isoString: string) {
  const dateObj = new Date(isoString);

  const date = formatDateX(dateObj, "dd/M/yyyy");
  const time = formatDateX(dateObj, "hh:mmaa").toLowerCase();

  return { date, time };
}

import { format } from "date-fns";
import { DateRange } from "react-day-picker";
import { ApiError } from "@/types";
import { AxiosError } from "axios";
import { toast } from "sonner";

export function formatDateRange(
  date?: DateRange,
  placeholder: string = "Custom"
): string {
  if (!date?.from) {
    return placeholder;
  }

  if (date.to) {
    return `${format(date.from, "LLL dd, y")} – ${format(
      date.to,
      "LLL dd, y"
    )}`;
  }

  return format(date.from, "LLL dd, y");
}

export function getErrorMessage(error: unknown, fallback?: string): string {
  if (!error) return "Something went wrong";

  if (error instanceof AxiosError) {
    const apiError = error as AxiosError<ApiError>;
    return (
      apiError.response?.data?.errors?.[0].message ||
      apiError.response?.data?.message ||
      fallback ||
      "Something went wrong"
    );
  }

  // Fallback if it's just a plain Error
  if (error instanceof Error) {
    return error.message || "Something went wrong";
  }

  return "Something went wrong";
}

export function groupByDate<T extends { createdAt: string }>(
  items: T[]
): { dateKey: string; dateLabel: string; items: T[] }[] {
  // 1. Group by dateKey
  const grouped = items.reduce<Record<string, T[]>>((acc, item) => {
    const dateKey = format(parseISO(item.createdAt), "yyyy-MM-dd");
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(item);
    return acc;
  }, {});

  // 2. Sort outer groups (newest first)
  const sortedDates = Object.keys(grouped).sort((a, b) => (a > b ? -1 : 1));

  // 3. Sort items in each group and generate labels
  return sortedDates.map((dateKey) => {
    const dateObj = new Date(dateKey);
    let dateLabel = format(dateObj, "MMMM d, yyyy");

    if (isToday(dateObj)) dateLabel = "Today";
    else if (isYesterday(dateObj)) dateLabel = "Yesterday";

    const sortedItems = grouped[dateKey].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return {
      dateKey,
      dateLabel,
      items: sortedItems,
    };
  });
}

export const copyToClipboard = async (text: string, label?: string) => {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(`${label || "Text"} copied to clipboard`);
  } catch (err) {
    toast.error("Failed to copy to clipboard");
    console.error("Failed to copy:", err);
  }
};

export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "numeric",
    day: "numeric",
    year: "numeric",
  });
};

export const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

export function abbreviateDirection(input: string): string {
  if (!input) return "";

  const normalized = input.trim().toLowerCase();

  const parts = normalized.split(/[\s-]+/);

  const abbreviation = parts
    .map((word) => word.charAt(0).toUpperCase())
    .join("");

  return abbreviation;
}

export function parseCookieValue<T>(
  value: string | undefined | null
): T | null {
  if (!value || typeof value !== "string") return null;

  try {
    const parsed = JSON.parse(value);
    return parsed as T;
  } catch {
    return null;
  }
}
