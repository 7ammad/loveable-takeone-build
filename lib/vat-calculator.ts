/**
 * VAT Calculator for Saudi Arabia
 * 
 * Saudi Arabia VAT rate is 15% as of 2020.
 * All calculations are done in halalas (1 SAR = 100 halalas).
 */

export const VAT_RATE = 0.15; // 15% VAT for Saudi Arabia
export const HALALA_PER_SAR = 100;

export interface VATCalculation {
  amountBeforeVAT: number;  // Amount in halalas before VAT
  vatAmount: number;         // VAT amount in halalas
  totalAmount: number;       // Total amount in halalas (including VAT)
  vatRate: number;           // VAT rate used (0.15)
}

/**
 * Calculate VAT from a base amount (amount before VAT)
 * 
 * @param amountBeforeVAT - Amount in halalas before VAT
 * @param vatRate - VAT rate (default: 0.15 for 15%)
 * @returns VATCalculation object with all amounts in halalas
 * 
 * @example
 * // Calculate VAT for 100 SAR (10,000 halalas)
 * const result = calculateVAT(10000);
 * // result.amountBeforeVAT = 10000
 * // result.vatAmount = 1500
 * // result.totalAmount = 11500
 */
export function calculateVAT(
  amountBeforeVAT: number,
  vatRate: number = VAT_RATE
): VATCalculation {
  if (amountBeforeVAT < 0) {
    throw new Error('Amount before VAT cannot be negative');
  }
  if (vatRate < 0 || vatRate > 1) {
    throw new Error('VAT rate must be between 0 and 1');
  }

  const vatAmount = Math.round(amountBeforeVAT * vatRate);
  const totalAmount = amountBeforeVAT + vatAmount;

  return {
    amountBeforeVAT,
    vatAmount,
    totalAmount,
    vatRate,
  };
}

/**
 * Extract VAT from a total amount (amount including VAT)
 * 
 * @param totalAmount - Total amount in halalas (including VAT)
 * @param vatRate - VAT rate (default: 0.15 for 15%)
 * @returns VATCalculation object with all amounts in halalas
 * 
 * @example
 * // Extract VAT from 115 SAR (11,500 halalas)
 * const result = extractVAT(11500);
 * // result.amountBeforeVAT = 10000
 * // result.vatAmount = 1500
 * // result.totalAmount = 11500
 */
export function extractVAT(
  totalAmount: number,
  vatRate: number = VAT_RATE
): VATCalculation {
  if (totalAmount < 0) {
    throw new Error('Total amount cannot be negative');
  }
  if (vatRate < 0 || vatRate > 1) {
    throw new Error('VAT rate must be between 0 and 1');
  }

  // Formula: amountBeforeVAT = totalAmount / (1 + vatRate)
  const amountBeforeVAT = Math.round(totalAmount / (1 + vatRate));
  const vatAmount = totalAmount - amountBeforeVAT;

  return {
    amountBeforeVAT,
    vatAmount,
    totalAmount,
    vatRate,
  };
}

/**
 * Format amount in halalas to SAR string
 * 
 * @param halalas - Amount in halalas
 * @returns Formatted string (e.g., "10.00 SAR")
 * 
 * @example
 * formatSAR(10000) // "100.00 SAR"
 * formatSAR(1550)  // "15.50 SAR"
 */
export function formatSAR(halalas: number): string {
  const sar = halalas / HALALA_PER_SAR;
  return `${sar.toFixed(2)} SAR`;
}

/**
 * Convert SAR to halalas
 * 
 * @param sar - Amount in SAR
 * @returns Amount in halalas
 * 
 * @example
 * sarToHalalas(100) // 10000
 * sarToHalalas(15.50) // 1550
 */
export function sarToHalalas(sar: number): number {
  return Math.round(sar * HALALA_PER_SAR);
}

/**
 * Convert halalas to SAR
 * 
 * @param halalas - Amount in halalas
 * @returns Amount in SAR
 * 
 * @example
 * halalasToSAR(10000) // 100
 * halalasToSAR(1550) // 15.50
 */
export function halalasToSAR(halalas: number): number {
  return halalas / HALALA_PER_SAR;
}

/**
 * Validate amount constraints for Saudi payments
 * 
 * @param amountInHalalas - Amount in halalas
 * @throws Error if amount is invalid
 */
export function validatePaymentAmount(amountInHalalas: number): void {
  const MIN_AMOUNT_HALALAS = 100; // 1 SAR minimum
  const MAX_AMOUNT_HALALAS = 100000000; // 1,000,000 SAR maximum

  if (amountInHalalas < MIN_AMOUNT_HALALAS) {
    throw new Error(`Payment amount must be at least ${formatSAR(MIN_AMOUNT_HALALAS)}`);
  }

  if (amountInHalalas > MAX_AMOUNT_HALALAS) {
    throw new Error(`Payment amount cannot exceed ${formatSAR(MAX_AMOUNT_HALALAS)}`);
  }

  if (!Number.isInteger(amountInHalalas)) {
    throw new Error('Payment amount must be a whole number (in halalas)');
  }
}

/**
 * Create a receipt-ready VAT breakdown from a base amount
 * 
 * @param baseAmount - Base amount in halalas (before VAT)
 * @returns Object ready to be stored in Receipt model
 * 
 * @example
 * const receiptData = createReceiptVATData(10000);
 * // {
 * //   amountBeforeVAT: 10000,
 * //   vatAmount: 1500,
 * //   amount: 11500,
 * //   vatRate: 0.15
 * // }
 */
export function createReceiptVATData(baseAmount: number) {
  validatePaymentAmount(baseAmount);
  const vatCalc = calculateVAT(baseAmount);

  return {
    amountBeforeVAT: vatCalc.amountBeforeVAT,
    vatAmount: vatCalc.vatAmount,
    amount: vatCalc.totalAmount,
    vatRate: vatCalc.vatRate,
  };
}

