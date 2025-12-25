import { useState } from "react";
import { Camera, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { parseReceiptImage, type OCRResult } from "@/utils/ocr";

interface ReceiptScannerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onExtract: (data: {
    merchant?: string;
    amount?: number;
    date?: string;
    description?: string;
  }) => void;
}

export default function ReceiptScanner({
  open,
  onOpenChange,
  onExtract,
}: ReceiptScannerProps) {
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [ocrResult, setOcrResult] = useState<OCRResult | null>(null);

  // Edit state for manual adjustment
  const [merchant, setMerchant] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview
    const reader = new FileReader();
    reader.onload = (ev) => {
      setPreview(ev.target?.result as string);
    };
    reader.readAsDataURL(file);

    setImage(file);
    setIsProcessing(true);

    try {
      const result = await parseReceiptImage(file);
      setOcrResult(result);

      // Populate fields with OCR results
      setMerchant(result.merchant || "");
      setAmount(result.amount?.toString() || "");
      setDate(result.date || new Date().toISOString().split("T")[0]);
      setDescription(result.rawText?.substring(0, 200) || "");
    } catch (error) {
      console.error("OCR parsing failed:", error);
      setOcrResult(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = () => {
    onExtract({
      merchant: merchant || undefined,
      amount: amount ? parseFloat(amount) : undefined,
      date: date || undefined,
      description: description || undefined,
    });

    // Reset
    setImage(null);
    setPreview("");
    setOcrResult(null);
    setMerchant("");
    setAmount("");
    setDate(new Date().toISOString().split("T")[0]);
    setDescription("");
    onOpenChange(false);
  };

  const handleReset = () => {
    setImage(null);
    setPreview("");
    setOcrResult(null);
    setMerchant("");
    setAmount("");
    setDate(new Date().toISOString().split("T")[0]);
    setDescription("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Scan Receipt with OCR</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Image Upload */}
          {!preview && (
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              <Camera className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Upload Receipt Image</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Take a photo or upload an image of your receipt
              </p>
              <Label htmlFor="receipt-image" className="cursor-pointer">
                <Button asChild variant="outline">
                  <span className="gap-2">
                    <Upload className="w-4 h-4" />
                    Choose Image
                  </span>
                </Button>
              </Label>
              <Input
                id="receipt-image"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageSelect}
              />
            </div>
          )}

          {/* Image Preview */}
          {preview && (
            <div className="space-y-3">
              <div className="relative rounded-lg overflow-hidden bg-muted">
                <img
                  src={preview}
                  alt="Receipt preview"
                  className="w-full h-auto max-h-80 object-cover"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setPreview("");
                    setImage(null);
                  }}
                  className="absolute top-2 right-2"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {isProcessing && (
                <div className="text-center py-4">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Processing receipt with OCR...
                  </p>
                </div>
              )}

              {/* OCR Results */}
              {!isProcessing && ocrResult && (
                <div className="space-y-3">
                  <div className="bg-muted p-3 rounded-lg text-sm">
                    <p className="font-semibold mb-2">Extracted Information:</p>
                    <p className="text-muted-foreground">
                      Confidence: {((ocrResult.confidence || 0) * 100).toFixed(0)}%
                    </p>
                  </div>

                  {/* Edit Fields */}
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="merchant-name">Merchant</Label>
                      <Input
                        id="merchant-name"
                        value={merchant}
                        onChange={(e) => setMerchant(e.target.value)}
                        placeholder="Shop or restaurant name"
                      />
                    </div>

                    <div>
                      <Label htmlFor="receipt-amount">Amount</Label>
                      <Input
                        id="receipt-amount"
                        type="number"
                        step="0.01"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.00"
                      />
                    </div>

                    <div>
                      <Label htmlFor="receipt-date">Date</Label>
                      <Input
                        id="receipt-date"
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="receipt-description">Notes</Label>
                      <Textarea
                        id="receipt-description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Additional details from receipt"
                        rows={3}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          {preview && (
            <>
              <Button
                variant="outline"
                onClick={handleReset}
                disabled={isProcessing}
              >
                Choose Different
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isProcessing || !merchant || !amount}
              >
                Use Receipt Data
              </Button>
            </>
          )}
          {!preview && (
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
