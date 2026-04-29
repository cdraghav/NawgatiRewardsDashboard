import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2 } from "lucide-react";
import { useState } from "react";
import api from "@/lib/axios";
import { toast } from "sonner";

interface ColorPickerProps {
  value: string;
  onChange: (value: string) => void;
  register: any;
  required?: boolean;
  fieldName?: string;
  coverImagePreview?: string | null;
}

export function ColorPicker({ 
  value, 
  onChange, 
  register, 
  required = false,
  fieldName = "brandColor",
  coverImagePreview,
}: ColorPickerProps) {
  const [isDetecting, setIsDetecting] = useState(false);

  const handleManualDetection = async () => {
    if (!coverImagePreview) {
      toast.error("Please upload cover image first", {
        description: "Upload a cover image to detect its dominant color.",
      });
      return;
    }

    try {
      setIsDetecting(true);
      
      const response = await fetch(coverImagePreview);
      const blob = await response.blob();
      const file = new File([blob], 'cover.jpg', { type: blob.type });

      const formData = new FormData();
      formData.append('image', file);

      const result = await api.post('/api/utils/detect-color', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const dominantColor = result.data.data.dominantColor;
      onChange(dominantColor);
      
      toast.success("Color detected", {
        description: `Detected color: ${dominantColor}`,
      });
    } catch (err) {
      console.error('Error detecting color:', err);
      toast.error("Failed to detect color", {
        description: "Please try again or select color manually.",
      });
    } finally {
      setIsDetecting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label htmlFor={fieldName} className="text-xl font-semibold">
          Brand Color {required && <span className="text-red-500">*</span>}
        </Label>
        {coverImagePreview && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleManualDetection}
            disabled={isDetecting}
            className="gap-2"
          >
            {isDetecting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Detecting...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                AI Detect
              </>
            )}
          </Button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row items-start gap-8">
        <div className="relative">
          <input
            id={fieldName}
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-32 h-32 rounded-xl cursor-pointer border-2 border-muted hover:border-primary transition-colors shadow-lg"
          />
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-sm text-muted-foreground whitespace-nowrap font-medium">
            Click to pick color
          </div>
        </div>
        <div className="flex-1 space-y-3">
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="#000000"
            className="font-mono text-lg h-14"
          />
          <p className="text-base text-muted-foreground">
            This color will be used for voucher related elements.
          </p>
        </div>
      </div>
    </div>
  );
}
