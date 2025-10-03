import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export const formatCurrency = (value: number) => {
  // value is in cents, so divide by 100 for rupees
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(value / 100);
};
export const calculateSimpleInterestEmi = (principal: number, rate: number, tenure: number) => {
  if (principal <= 0 || rate <= 0 || tenure <= 0) return { emi: 0, totalInterest: 0, totalAmount: 0 };
  const totalInterest = (principal * rate * (tenure / 12)) / 100;
  const totalAmount = principal + totalInterest;
  const emi = totalAmount / tenure;
  return {
    emi: Math.round(emi),
    totalInterest: Math.round(totalInterest),
    totalAmount: Math.round(totalAmount),
  };
};
export const calculateCompoundInterestEmi = (principal: number, rate: number, tenure: number) => {
  if (principal <= 0 || rate <= 0 || tenure <= 0) return { emi: 0, totalInterest: 0, totalAmount: 0 };
  const monthlyRate = rate / 12 / 100;
  const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, tenure)) / (Math.pow(1 + monthlyRate, tenure) - 1);
  const totalAmount = emi * tenure;
  const totalInterest = totalAmount - principal;
  return {
    emi: Math.round(emi),
    totalInterest: Math.round(totalInterest),
    totalAmount: Math.round(totalAmount),
  };
};