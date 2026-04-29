import { useRef, useState } from "react";
import { Upload, X, Loader2 } from "lucide-react";
import Image from "next/image";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import api from "@/lib/axios";

interface ImageUploadProps {
  id: string;
  label: string;
  preview: string | null;
  required?: boolean;
  optional?: boolean;
  guidelines?: string[];
  aspectRatio?: "square" | "wide";
  requireTransparency?: boolean;
  onColorDetected?: (color: string) => void; 
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: () => void;
}

const checkImageTransparency = (file: File): Promise<boolean> => {
  return new Promise((resolve) => {
    if (file.type === 'image/svg+xml') {
      resolve(true);
      return;
    }

    if (file.type !== 'image/png') {
      resolve(false);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          resolve(false);
          return;
        }

        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        let hasTransparency = false;
        for (let i = 3; i < data.length; i += 4) {
          if (data[i] < 255) {
            hasTransparency = true;
            break;
          }
        }

        resolve(hasTransparency);
      };
      img.onerror = () => resolve(false);
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
};

const detectColorFromImage = async (file: File): Promise<string | null> => {
  try {
    const formData = new FormData();
    formData.append('image', file);

    const response = await api.post('/api/utils/detect-color', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data.data.dominantColor;
  } catch (err: any) {
    console.error('Error detecting color:', err);
    if (err.response?.status === 400) {
      const errorMessage = err.response?.data?.message || '';
      if (errorMessage.includes('Invalid') || errorMessage.includes('only') || errorMessage.includes('SVG')) {
        throw new Error('Invalid file type. Images can only be SVG or PNG.');
      }
    }
    
    return null;
  }
};

export function ImageUpload({
  id,
  label,
  preview,
  required = false,
  optional = false,
  guidelines,
  aspectRatio = "square",
  requireTransparency = false,
  onColorDetected,
  onChange,
  onRemove,
}: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [isDetectingColor, setIsDetectingColor] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const dimensions = aspectRatio === "square" ? "w-48 h-48" : "w-full h-80";

  const clearImage = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onRemove();
  };

  const handleColorDetection = async (file: File) => {
    if (!id.includes("cover") || !onColorDetected) return;

    setIsDetectingColor(true);
    try {
      const dominantColor = await detectColorFromImage(file);
      setIsDetectingColor(false);

      if (dominantColor) {
        onColorDetected(dominantColor);
        toast.success("Color detected", {
          description: `Suggested color: ${dominantColor}`,
        });
      }
    } catch (err: any) {
      setIsDetectingColor(false);
      clearImage();
      toast.error(err.message || "Invalid file type. Images can only be SVG or PNG.");
    }
  };

  const handleFileValidation = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return
    const validTypes = ['image/png', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      toast.error("Invalid file type. Images can only be SVG or PNG.");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    if (requireTransparency) {
      setIsChecking(true);
      const hasTransparency = await checkImageTransparency(file);
      setIsChecking(false);

      if (!hasTransparency) {
        toast.error("Image must have transparent background. Please upload a PNG or SVG with transparency.");
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        return;
      }
    }

    onChange(e)
    if (id.includes("cover")) {
      await handleColorDetection(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0 && fileInputRef.current) {
      const file = files[0];

      const validTypes = ['image/png', 'image/svg+xml'];
      if (!validTypes.includes(file.type)) {
        toast.error("Images can only be SVG or PNG.");
        return;
      }

      if (requireTransparency) {
        setIsChecking(true);
        const hasTransparency = await checkImageTransparency(file);
        setIsChecking(false);

        if (!hasTransparency) {
          toast.error("Image must have transparent background. Please upload a PNG or SVG with transparency.");
          return;
        }
      }

      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      fileInputRef.current.files = dataTransfer.files;
      onChange({ target: fileInputRef.current } as any)
      if (id.includes("cover")) {
        await handleColorDetection(file);
      }
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleRemoveClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    onRemove();
  };

  return (
    <div className="space-y-4">
      <Label className="text-xl font-semibold">
        {label}
        {required && !preview && <span className="text-red-500 ml-1">*</span>}
        {optional && (
          <span className="text-muted-foreground text-base font-normal ml-2">(Optional)</span>
        )}
        {requireTransparency && (
          <span className="text-blue-500 text-sm font-normal ml-2">(Transparent background required)</span>
        )}
      </Label>
      <div className={`flex ${aspectRatio === "square" ? "flex-col md:flex-row" : "flex-col"} items-start gap-8`}>
        {preview ? (
          <div
            className={`relative ${dimensions} rounded-xl border-2 border-dashed border-primary overflow-hidden ${
              aspectRatio === "square" ? "bg-white" : "bg-muted/10"
            } group shadow-lg ${aspectRatio === "square" ? "flex-shrink-0" : ""} ${
              isDetectingColor ? "opacity-50" : ""
            }`}
          >
            <div className="relative w-full h-full pointer-events-none">
              <Image
                src={preview}
                alt={`${label} preview`}
                fill
                className={aspectRatio === "square" ? "object-contain p-4" : "object-cover"}
              />
            </div>
            {isDetectingColor && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                <div className="animate-spin">
                  <Loader2 className="h-6 w-6 text-white" />
                </div>
              </div>
            )}
            <button
              type="button"
              onClick={handleRemoveClick}
              disabled={isDetectingColor}
              className={`absolute ${
                aspectRatio === "square" ? "top-3 right-3" : "top-4 right-4"
              } p-2 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90 shadow-lg transition-all z-50 pointer-events-auto disabled:opacity-50`}
              style={{ pointerEvents: 'auto' }}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        ) : (
          <label
            htmlFor={id}
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`${dimensions} rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all ${
              aspectRatio === "square" ? "flex-shrink-0" : ""
            } ${isDragging ? "border-primary bg-primary/10" : "border-muted hover:border-primary hover:bg-primary/5"} ${
              isChecking || isDetectingColor ? "opacity-50 cursor-wait" : ""
            }`}
          >
            <Upload 
              className={`${aspectRatio === "square" ? "h-12 w-12" : "h-14 w-14"} ${
                aspectRatio === "square" ? "mb-3" : "mb-4"
              } ${isDragging ? "text-primary" : "text-muted-foreground"} transition-all ${
                isChecking || isDetectingColor ? "animate-pulse" : ""
              }`}
            />
            <span className={`${aspectRatio === "square" ? "text-sm" : "text-base"} ${
              aspectRatio === "square" ? "font-medium" : "font-semibold"
            } ${isDragging ? "text-primary" : "text-muted-foreground"} text-center px-4 transition-all`}>
              {isChecking ? "Validating image..." : isDetectingColor ? "Detecting color..." : isDragging ? "Drop image here" : `Click to Upload ${label}`}
            </span>
            {aspectRatio === "wide" && (
              <span className={`text-sm ${isDragging ? "text-primary" : "text-muted-foreground"} mt-2 transition-all`}>
                Supported: SVG, PNG • Max 5MB
              </span>
            )}
            <input 
              ref={fileInputRef}
              id={id} 
              type="file" 
              accept="image/png,image/svg+xml"
              className="hidden" 
              onChange={handleFileValidation}
              disabled={isChecking || isDetectingColor}
            />
          </label>
        )}
        {guidelines && aspectRatio === "square" && (
          <div className="flex-1 space-y-2 text-base text-muted-foreground">
            <p className="font-semibold text-foreground mb-3">{label} Guidelines:</p>
            {guidelines.map((guideline, index) => (
              <p key={index}>• {guideline}</p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
