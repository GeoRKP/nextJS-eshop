"use client";

import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { useRouter } from "@/i18n/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import slugify from "slugify";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createCategory, updateCategory } from "@/lib/actions/category.actions";
import { insertCategorySchema, createInsertCategorySchema } from "@/lib/validators";
import { useTranslations } from "next-intl";
import { Category } from "@/types";
import { Loader2 } from "lucide-react";

export default function CategoryForm({
  type = "Create",
  category,
  categoryId,
  categories = [],
}: {
  type?: "Create" | "Update";
  category?: Category;
  categoryId?: string;
  categories?: Category[];
}) {
  const router = useRouter();
  const { toast } = useToast();
  const t = useTranslations("AdminCategories");
  const tCommon = useTranslations("Common");
  const tV = useTranslations("Validation");

  const localizedSchema = createInsertCategorySchema(tV);
  type FormValues = z.input<typeof insertCategorySchema>;
  const form = useForm<FormValues>({
    resolver: zodResolver(localizedSchema) as never,
    defaultValues:
      category && type === "Update"
        ? {
            name: category.name,
            slug: category.slug,
            description: category.description ?? "",
            image: category.image ?? "",
            parentId: category.parentId ?? null,
            sortOrder: category.sortOrder ?? 0,
            isActive: category.isActive ?? true,
          }
        : {
            name: "",
            slug: "",
            description: "",
            image: "",
            parentId: null,
            sortOrder: 0,
            isActive: true,
          },
  });

  const onSubmit = async (values: FormValues) => {
    const data = {
      ...values,
      sortOrder: values.sortOrder ?? 0,
      isActive: values.isActive ?? true,
    };
    if (type === "Create") {
      const res = await createCategory(data);
      if (!res.success) {
        toast({ description: res.message, variant: "destructive" });
      } else {
        toast({ description: res.message });
        router.push("/admin/categories");
      }
    } else if (type === "Update") {
      if (!categoryId) {
        router.push("/admin/categories");
        return;
      }
      const res = await updateCategory({ ...data, id: categoryId });
      if (!res.success) {
        toast({ description: res.message, variant: "destructive" });
      } else {
        toast({ description: res.message });
        router.push("/admin/categories");
      }
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <h1 className="h2-bold">
          {type === "Create" ? t("createCategory") : t("updateCategory")}
        </h1>

        <div className="flex flex-col md:flex-row gap-5">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>{t("name")}</FormLabel>
                <FormControl>
                  <Input placeholder={t("enterName")} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="slug"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>{t("slug")}</FormLabel>
                <FormControl>
                  <div>
                    <Input placeholder={t("enterSlug")} {...field} />
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      className="mt-2"
                      onClick={() => {
                        form.setValue(
                          "slug",
                          slugify(form.getValues("name"), { lower: true })
                        );
                      }}
                    >
                      {tCommon("generate")}
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="parentId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("parent")}</FormLabel>
              <Select
                onValueChange={(value) =>
                  field.onChange(value === "none" ? null : value)
                }
                defaultValue={field.value ?? "none"}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t("noParent")} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="none">{t("noParent")}</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("description")}</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={t("enterDescription")}
                  className="resize-none"
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex flex-col md:flex-row gap-5">
          <FormField
            control={form.control}
            name="sortOrder"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>{t("sortOrder")}</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder={t("enterSortOrder")}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex items-center space-x-2 p-4 rounded-lg border border-border/60 bg-muted/20">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormLabel>{t("isActive")}</FormLabel>
            </FormItem>
          )}
        />

        <Button
          type="submit"
          variant="accent"
          size="lg"
          disabled={form.formState.isSubmitting}
          className="w-full"
        >
          {form.formState.isSubmitting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : type === "Create" ? (
            t("createButton")
          ) : (
            t("updateButton")
          )}
        </Button>
      </form>
    </Form>
  );
}
