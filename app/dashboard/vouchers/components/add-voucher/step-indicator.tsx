import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Step } from "../../types/add-voucher-types";

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
}

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-2 px-4 pb-3 border-b bg-muted/10 shrink-0">
      {steps.map((step, index) => (
        <div
          key={step.id}
          className={cn(
            "flex items-center gap-2",
            index === steps.length - 1 ? "" : "flex-1"
          )}
        >
          <div className="flex items-center gap-2 flex-shrink-0">
            <div
              className={cn(
                "w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all text-xs font-semibold",
                currentStep >= step.id
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-muted-foreground/30 bg-background text-muted-foreground"
              )}
            >
              {currentStep > step.id ? <Check className="h-4 w-4" /> : step.id}
            </div>
            <div className="hidden sm:block">
              <p className="text-xs font-medium leading-none">{step.name}</p>
              <p className="text-[10px] text-muted-foreground leading-none mt-0.5">
                {step.description}
              </p>
            </div>
          </div>
          {index < steps.length - 1 && (
            <div
              className={cn(
                "h-px flex-1 min-w-4 transition-all",
                currentStep > step.id ? "bg-primary" : "bg-muted"
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
}
