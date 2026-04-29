import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface UsageInstructionsInputProps {
  type: "ONLINE" | "OFFLINE";
  instructions: string[];
  onAdd: () => void;
  onUpdate: (index: number, value: string) => void;
  onRemove: (index: number) => void;
}

export function UsageInstructionsInput({
  type,
  instructions,
  onAdd,
  onUpdate,
  onRemove,
}: UsageInstructionsInputProps) {
  const color = type === "ONLINE" ? "bg-blue-500" : "bg-green-500";
  const placeholder =
    type === "ONLINE"
      ? "e.g., Apply in cart under 'Redeem voucher'"
      : "e.g., Show code to cashier";

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <Label className="text-base font-medium flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${color}`}></div>
          {type === "ONLINE" ? "Online" : "Offline"}
        </Label>
        <Button type="button" size="sm" variant="outline" onClick={onAdd}>
          <Plus className="h-4 w-4 mr-2" />
          Add
        </Button>
      </div>
      <div className="space-y-3">
        {instructions.map((instruction, index) => (
          <div key={index} className="flex gap-3">
            <Input
              placeholder={placeholder}
              className="flex-1 h-12"
              value={instruction}
              onChange={(e) => onUpdate(index, e.target.value)}
            />
            <Button
              type="button"
              size="icon"
              variant="ghost"
              onClick={() => onRemove(index)}
              className="h-12 w-12"
            >
              <Trash2 className="h-5 w-5 text-destructive" />
            </Button>
          </div>
        ))}
        {instructions.length === 0 && (
          <p className="text-sm text-muted-foreground italic py-3">
            No {type.toLowerCase()} instructions added yet.
          </p>
        )}
      </div>
    </div>
  );
}
