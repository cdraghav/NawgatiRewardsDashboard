import { toast } from "sonner";

const VALID_TYPES = ["image/png", "image/svg+xml"];
const MAX_BYTES = 5 * 1024 * 1024;

function checkPngTransparency(file: File): Promise<boolean> {
  return new Promise((resolve) => {
    if (file.type === "image/svg+xml") return resolve(true);
    if (file.type !== "image/png") return resolve(false);

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return resolve(false);
        ctx.drawImage(img, 0, 0);
        const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
        for (let i = 3; i < data.length; i += 4) {
          if (data[i] < 255) return resolve(true);
        }
        resolve(false);
      };
      img.onerror = () => resolve(false);
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export type ValidateOptions = {
  requireTransparency?: boolean;
  maxBytes?: number;
};

export async function validateImageFile(
  file: File,
  opts: ValidateOptions = {},
): Promise<{ ok: true } | { ok: false; reason: string }> {
  if (!VALID_TYPES.includes(file.type)) {
    return { ok: false, reason: "Only PNG or SVG images are allowed." };
  }
  if (file.size > (opts.maxBytes ?? MAX_BYTES)) {
    return { ok: false, reason: "Image must be under 5MB." };
  }
  if (opts.requireTransparency) {
    const ok = await checkPngTransparency(file);
    if (!ok) return { ok: false, reason: "Image needs a transparent background." };
  }
  return { ok: true };
}

export async function validateOrToast(
  file: File,
  opts?: ValidateOptions,
): Promise<boolean> {
  const result = await validateImageFile(file, opts);
  if (!result.ok) {
    toast.error(result.reason);
    return false;
  }
  return true;
}
