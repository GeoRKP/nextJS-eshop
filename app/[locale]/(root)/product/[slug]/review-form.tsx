"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { insertReviewSchema, createInsertReviewSchema } from "@/lib/validators";
import { zodResolver } from "@hookform/resolvers/zod";
import { StarIcon } from "lucide-react";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod/v3";
import { createUpdateReview, getReviewByProductId } from "@/lib/actions/review-actions";
import { reviewFormDefaultValues } from "@/lib/constants";
import { useTranslations } from "next-intl";

export default function ReviewForm({
  userId,
  productId,
  onReviewSubmitted,
}: {
  userId: string;
  productId: string;
  onReviewSubmitted: () => void;
}) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const t = useTranslations("Product");
  const tCommon = useTranslations("Common");
  const tV = useTranslations("Validation");

  const form = useForm<z.infer<typeof insertReviewSchema>>({
    resolver: zodResolver(createInsertReviewSchema(tV)),
    defaultValues: reviewFormDefaultValues,
  });

  const onSubmit: SubmitHandler<z.infer<typeof insertReviewSchema>> = async (values) => {
    const res = await createUpdateReview({...values, productId});

    if (!res.success) {
      return toast({
        variant: "destructive",
        description: res.message,
      });
    }

    setOpen(false);

    onReviewSubmitted();

    toast({
      description: res.message,
    });
  }

  const handleOpenForm = async () => {
    form.setValue("userId", userId);
    form.setValue("productId", productId);

    const review = await getReviewByProductId({productId});

    if (review) {
      form.setValue("title", review.title);
      form.setValue("description", review.description ? review.description : "");
      form.setValue("rating", review.rating);
    }

    setOpen(true);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button onClick={handleOpenForm} variant="default">
        {t("addReview")}
      </Button>
      <DialogContent className="sm:max-w-[425px]">
        <Form {...form}>
          <form method="POST" onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>{t("addReview")}</DialogTitle>
              <DialogDescription>
                {t("shareThoughts")}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("reviewTitle")}</FormLabel>
                    <FormControl>
                      <Input placeholder={t("enterTitle")} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("reviewDescription")}</FormLabel>
                    <FormControl>
                      <Textarea placeholder={t("enterDescription")} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="rating"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("reviewRating")}</FormLabel>
                    <FormControl>
                      <Select value={field.value?.toString() || undefined}  onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t("selectRating")} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Array.from({length: 5}, (_, i) => (
                              <SelectItem key={i} value={(i + 1).toString()}>
                                {i + 1} <StarIcon className="inline-block w-4 h-4" />
                              </SelectItem>
                            ))}
                          </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button type="submit" size='lg' className="w-full" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? tCommon("submitting") : tCommon("submit")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
