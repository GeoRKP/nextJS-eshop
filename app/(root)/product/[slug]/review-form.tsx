"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { insertReviewSchema } from "@/lib/validators";
import { zodResolver } from "@hookform/resolvers/zod";
import { StarIcon } from "lucide-react";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { createUpdateReview } from "@/lib/actions/review-actions";
import { reviewFormDefaultValues } from "@/lib/constants";

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

  const form = useForm<z.infer<typeof insertReviewSchema>>({
    resolver: zodResolver(insertReviewSchema),
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

  const handleOpenForm = () => {
    form.setValue("userId", userId);
    form.setValue("productId", productId);
    setOpen(true);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button onClick={handleOpenForm} variant="default">
        Add a review
      </Button>
      <DialogContent className="sm:max-w-[425px]">
        <Form {...form}>
          <form method="POST" onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>Add a review</DialogTitle>
              <DialogDescription>
                Share your thoughts with other customers
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter title" {...field} />
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
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Enter description" {...field} />
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
                    <FormLabel>Rating</FormLabel>
                    <FormControl>
                      <Select value={field.value?.toString() || undefined}  onValueChange={field.onChange}>                        
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a rating" />
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
                {form.formState.isSubmitting ? "Submitting..." : "Submit"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
