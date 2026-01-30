import { Transaction, TransactionType } from "@shared/api";

/**
 * OCR result from receipt image
 */
export interface OCRResult {
  date?: string;
  merchant?: string;
  amount?: number;
  items?: string[];
  confidence?: number;
  rawText?: string;
}

/**
 * Parse receipt image and extract transaction data
 * This is a basic implementation that uses regex patterns
 * For production, integrate with Tesseract.js or Google Vision API
 */
export async function parseReceiptImage(file: File): Promise<OCRResult> {
  // Convert image to base64
  const reader = new FileReader();

  return new Promise((resolve, reject) => {
    reader.onload = async (e) => {
      try {
        const imageData = e.target?.result as string;

        // Try to use Tesseract.js if available
        const result = await attemptTesseractOCR(imageData);

        if (result) {
          resolve(result);
        } else {
          // Fallback: return a template result for demo
          resolve({
            merchant: "Receipt from image",
            confidence: 0.5,
            rawText: "OCR processing - please fill in details manually",
          });
        }
      } catch (error) {
        console.error("OCR error:", error);
        reject(error);
      }
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Attempt to use Tesseract.js if available in window
 */
async function attemptTesseractOCR(imageData: string): Promise<OCRResult | null> {
  const Tesseract = (window as any).Tesseract;

  if (!Tesseract) {
    return null;
  }

  try {
    const worker = await Tesseract.createWorker();
    const result = await worker.recognize(imageData);
    await worker.terminate();

    const text = result.data.text;
    return parseReceiptText(text);
  } catch (error) {
    console.error("Tesseract.js error:", error);
    return null;
  }
}

/**
 * Parse receipt text to extract transaction details
 */
function parseReceiptText(text: string): OCRResult {
  const lines = text.split("\n").filter((line) => line.trim());

  const result: OCRResult = {
    rawText: text,
    confidence: 0.7,
  };

  // Try to find date (various formats)
  const datePatterns = [
    /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/,
    /(\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2})/,
  ];

  for (const pattern of datePatterns) {
    const match = text.match(pattern);
    if (match) {
      result.date = match[1];
      break;
    }
  }

  // Try to find amount (currency patterns)
  const amountPattern = /[\$£€]\s*(\d+[.,]\d{2})|(\d+[.,]\d{2})\s*(?:USD|EUR|GBP)?/i;
  const amountMatch = text.match(amountPattern);
  if (amountMatch) {
    const amountStr = amountMatch[1] || amountMatch[2];
    const amount = parseFloat(amountStr.replace(",", "."));
    result.amount = amount;
  }

  // Get merchant name (usually first lines)
  const merchantCandidates = lines.slice(0, 3);
  if (merchantCandidates.length > 0) {
    result.merchant = merchantCandidates[0].trim();
  }

  // Extract items
  result.items = lines
    .filter(
      (line) =>
        line.length > 5 &&
        !line.match(/^\d+/) &&
        !line.match(/total|subtotal|amount/i)
    )
    .slice(0, 5);

  return result;
}

/**
 * Convert OCR result to transaction
 */
export function ocrResultToTransaction(
  ocrResult: OCRResult,
  walletId: string,
  categoryId: string
): Partial<Transaction> {
  return {
    walletId: parseInt(walletId),
    categoryId: parseInt(categoryId),
    type: TransactionType.EXPENSE,
    amount: ocrResult.amount || 0,
    description: ocrResult.merchant || "Receipt from image",
    date: ocrResult.date || new Date().toISOString().split("T")[0],
  };
}

/**
 * Load Tesseract.js library
 */
export async function loadTesseractJS(): Promise<boolean> {
  if ((window as any).Tesseract) {
    return true;
  }

  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src =
      "https://cdn.jsdelivr.net/npm/tesseract.js@5.0.0/dist/tesseract.min.js";
    script.onload = () => {
      resolve(true);
    };
    script.onerror = () => {
      console.error("Failed to load Tesseract.js");
      resolve(false);
    };
    document.head.appendChild(script);
  });
}
