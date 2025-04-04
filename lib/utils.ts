import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Convert a prisma object to a plain object
export function toPlainObject<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}


// Format number with decimal places

export function formatNumberWithDecimal(num: number) {
  const [int, decimal] = num.toString().split('.');
  return decimal ? `${int}.${decimal.padEnd(2, '0')}` : `${int}.00`;
}


// Format date to dd/mm/yyyy

