import { ImageUpload } from "./image-upload";
import { ColorPicker } from "./color-picker";
import { AlertCircle } from "lucide-react";

interface StepTwoBrandingProps {
  logoPreview: string | null;
  coverPreview: string | null;
  brandColor: string;
  register: any;
  setValue: any;
  handleLogoChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleCoverChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  removeLogo: () => void;
  removeCover: () => void;
}

export function StepTwoBranding({
  logoPreview,
  coverPreview,
  brandColor,
  register,
  setValue,
  handleLogoChange,
  handleCoverChange,
  removeLogo,
  removeCover,
}: StepTwoBrandingProps) {
  const allFieldsFilled = logoPreview !== null && coverPreview !== null && brandColor !== "";

  return (
    <div className="space-y-10">
      {!allFieldsFilled && (
        <div className="rounded-lg bg-amber-50 border border-amber-200 p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-amber-900 text-sm">Required Fields</h4>
            <p className="text-sm text-amber-800 mt-1">
              All branding fields are required. Please upload both logo and cover image, and select a brand color to proceed.
            </p>
          </div>
        </div>
      )}

      <ImageUpload
        id="logo-upload"
        label="Brand Logo"
        preview={logoPreview}
        required
        aspectRatio="square"
        requireTransparency={true}
        guidelines={[
          "Square image recommended (1:1 aspect ratio)",
          "Maximum file size: 5MB",
          "Supported formats: PNG, SVG, WebP",
          "Transparent background required",
          "Minimum resolution: 512×512 pixels",
        ]}
        onChange={handleLogoChange}
        onRemove={removeLogo}
      />

      <ImageUpload
        id="cover-upload"
        label="Cover Image"
        preview={coverPreview}
        required
        aspectRatio="wide"
        guidelines={[
          "Wide image recommended (16:9 or 2:1 aspect ratio)",
          "Maximum file size: 5MB",
          "Supported formats: SVG, PNG, WebP",
          "Minimum resolution: 1920×1080 pixels",
        ]}
        onChange={handleCoverChange}
        onRemove={removeCover}
      />

      <ColorPicker
        value={brandColor}
        onChange={(value) => setValue("brandColor", value)}
        register={register}
        required
        fieldName="brandColor"
        coverImagePreview={coverPreview}
      />
    </div>
  );
}
