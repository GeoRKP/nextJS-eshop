"use client";

import { Button } from "@/components/ui/button";
import { resolveReviewReport } from "@/lib/actions/review-report.actions";
import { useToast } from "@/hooks/use-toast";
import { useTransition } from "react";
import { Eye, EyeOff, Check } from "lucide-react";

export default function ReviewReportActions({ reportId }: { reportId: string }) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const handle = (action: "dismiss" | "hide-review") => {
    startTransition(async () => {
      const res = await resolveReviewReport(reportId, action);
      toast({
        description: res.message,
        variant: res.success ? "default" : "destructive",
      });
    });
  };

  return (
    <div className="flex gap-2 mt-4 pt-3 border-t border-border">
      <Button
        size="sm"
        variant="outline"
        disabled={isPending}
        onClick={() => handle("dismiss")}
      >
        <Check className="w-4 h-4 mr-1.5" />
        Dismiss
      </Button>
      <Button
        size="sm"
        variant="destructive"
        disabled={isPending}
        onClick={() => handle("hide-review")}
      >
        <EyeOff className="w-4 h-4 mr-1.5" />
        Hide Review
      </Button>
    </div>
  );
}
