import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getHorseImage(
  horse:
    | {
        images?: string[];
        image?: string;
        imageUrl?: string;
        avatar?: string;
      }
    | null
    | undefined,
): string {
  if (!horse) return "";
  if (Array.isArray(horse.images) && horse.images.length > 0 && horse.images[0]) {
    return horse.images[0];
  }
  return horse.image || horse.imageUrl || horse.avatar || "";
}

export function getUserAvatar(
  user:
    | {
        avatar?: string;
        profileImage?: string;
      }
    | null
    | undefined,
): string {
  if (!user) return "";
  return user.avatar || user.profileImage || "";
}
