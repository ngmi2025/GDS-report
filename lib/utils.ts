import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatNumber(num: string | number): string {
  const value = typeof num === 'string' ? parseFloat(num) : num;
  return new Intl.NumberFormat('en-US').format(value);
}
