import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Deterministic avatar background, ported from the Aura prototype. */
const AVATAR_HUES = [262, 292, 230, 200, 330, 160];

export function avatarColor(seed: number) {
  const len = AVATAR_HUES.length;
  const hue = AVATAR_HUES[((seed % len) + len) % len];
  return `oklch(0.62 0.16 ${hue})`;
}

/** First two initials of a name, uppercased. */
export function initials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}
