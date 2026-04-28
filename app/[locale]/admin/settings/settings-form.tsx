"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateSettings } from "@/lib/actions/settings.actions";
import { useToast } from "@/hooks/use-toast";
import { useState, useTransition } from "react";
import { Loader2, Save } from "lucide-react";

type Setting = {
  key: string;
  value: string;
  type: string;
  label: string | null;
  group: string;
};

export default function SettingsForm({
  groupedSettings,
}: {
  groupedSettings: Record<string, Setting[]>;
}) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries(
      Object.values(groupedSettings)
        .flat()
        .map((s) => [s.key, s.value])
    )
  );

  const onSave = () => {
    startTransition(async () => {
      const updates = Object.entries(values).map(([key, value]) => ({
        key,
        value,
      }));
      const res = await updateSettings(updates);
      toast({
        description: res.message,
        variant: res.success ? "default" : "destructive",
      });
    });
  };

  return (
    <div className="space-y-6">
      {Object.entries(groupedSettings).map(([group, settings]) => (
        <div key={group} className="card-premium p-6">
          <h2 className="font-heading font-bold uppercase tracking-wide text-sm text-accent mb-4 pb-2 border-b border-accent/30">
            {group}
          </h2>
          <div className="space-y-4">
            {settings.map((s) => (
              <div key={s.key} className="grid sm:grid-cols-[1fr_2fr] gap-3 items-center">
                <div>
                  <Label htmlFor={s.key} className="text-sm">
                    {s.label || s.key}
                  </Label>
                  <p className="text-[10px] font-mono text-muted-foreground/60 mt-0.5">
                    {s.key}
                  </p>
                </div>
                {s.type === "boolean" ? (
                  <select
                    id={s.key}
                    value={values[s.key]}
                    onChange={(e) =>
                      setValues({ ...values, [s.key]: e.target.value })
                    }
                    className="h-11 px-3 border border-input bg-background text-sm"
                  >
                    <option value="true">true</option>
                    <option value="false">false</option>
                  </select>
                ) : (
                  <Input
                    id={s.key}
                    type={s.type === "number" ? "number" : "text"}
                    value={values[s.key]}
                    onChange={(e) =>
                      setValues({ ...values, [s.key]: e.target.value })
                    }
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="flex justify-end">
        <Button
          variant="accent"
          size="lg"
          onClick={onSave}
          disabled={isPending}
        >
          {isPending ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          Save Settings
        </Button>
      </div>
    </div>
  );
}
