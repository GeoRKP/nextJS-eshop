"use client";

import { insertProductSchema, updateProductSchema, createInsertProductSchema } from "@/lib/validators";
import { useToast } from "@/hooks/use-toast";
import { ControllerRenderProps, useForm, useWatch } from "react-hook-form";
import { Product } from "@/types";
import { useRouter } from "@/i18n/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v3";
import { productDefaultValues } from "@/lib/constants";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { greekSlugify } from "@/lib/slugify";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { createProduct, updateProduct } from "@/lib/actions/product.actions";
import { ImageUploadButton } from "@/components/shared/image-upload";
import Image from "next/image";
import { Loader2, X } from "lucide-react";
import { Checkbox } from "../ui/checkbox";
import { useTranslations } from "next-intl";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Category } from "@/types";

export default function ProductForm({
  type = "Create",
  product,
  productId,
  categories = [],
}: {
  type?: "Create" | "Update";
  product?: Product;
  productId?: string;
  categories?: Category[];
}) {
  const router = useRouter();
  const { toast } = useToast();
  const t = useTranslations("ProductForm");
  const tCommon = useTranslations("Common");
  const tV = useTranslations("Validation");

  const form = useForm<
    z.infer<typeof insertProductSchema> | z.infer<typeof updateProductSchema>
  >({
    resolver: zodResolver(createInsertProductSchema(tV)),
    defaultValues:
      product && type === "Update" ? product : productDefaultValues,
  });

  const onSubmit = async (
    values:
      | z.infer<typeof insertProductSchema>
      | z.infer<typeof updateProductSchema>
  ) => {
    if (type === "Create") {
      const res = await createProduct(values);
      if (!res.success) {
        toast({
          description: res.message,
          variant: "destructive",
        });
      } else {
        toast({
          description: res.message,
        });
        router.push("/admin/products");
      }
    } else if (type === "Update") {
      if (!productId) {
        router.push("/admin/products");
        return;
      }

      const res = await updateProduct({ ...values, id: productId });
      if (!res.success) {
        toast({
          description: res.message,
          variant: "destructive",
        });
      } else {
        toast({
          description: res.message,
        });
        router.push("/admin/products");
      }
    }
  };

  const images = useWatch({ control: form.control, name: "images" });
  const banner = useWatch({ control: form.control, name: "banner" });
  const isFeatured = useWatch({ control: form.control, name: "isFeatured" });

  return (
    <Form {...form}>
      <form
        method="POST"
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8"
      >
        <div className="flex flex-col md:flex-row gap-3 md:gap-5">
          <FormField
            control={form.control}
            name="name"
            render={({
              field,
            }: {
              field: ControllerRenderProps<
                z.infer<typeof insertProductSchema>,
                "name"
              >;
            }) => (
              <FormItem className="w-full">
                <FormLabel>{t("name")} (EL)</FormLabel>
                <FormControl>
                  <Input placeholder={t("enterProductName")} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="nameEn"
            render={({
              field,
            }: {
              field: ControllerRenderProps<
                z.infer<typeof insertProductSchema>,
                "nameEn"
              >;
            }) => (
              <FormItem className="w-full">
                <FormLabel>{t("name")} (EN)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Product name in English"
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="slug"
            render={({
              field,
            }: {
              field: ControllerRenderProps<
                z.infer<typeof insertProductSchema>,
                "slug"
              >;
            }) => (
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
                          greekSlugify(form.getValues("name"))
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
        <div className="flex flex-col md:flex-row gap-3 md:gap-5">
          <FormField
            control={form.control}
            name="category"
            render={({
              field,
            }: {
              field: ControllerRenderProps<
                z.infer<typeof insertProductSchema>,
                "category"
              >;
            }) => (
              <FormItem className="w-full">
                <FormLabel>{t("category")}</FormLabel>
                {categories.length > 0 ? (
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      const cat = categories.find((c) => c.name === value);
                      if (cat) {
                        form.setValue("categoryId", cat.id);
                      }
                    }}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t("selectCategory")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.name}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <FormControl>
                    <Input placeholder={t("enterCategory")} {...field} />
                  </FormControl>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="brand"
            render={({
              field,
            }: {
              field: ControllerRenderProps<
                z.infer<typeof insertProductSchema>,
                "brand"
              >;
            }) => (
              <FormItem className="w-full">
                <FormLabel>{t("brand")}</FormLabel>
                <FormControl>
                  <Input placeholder={t("enterBrand")} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex flex-col md:flex-row gap-3 md:gap-5">
          <FormField
            control={form.control}
            name="price"
            render={({
              field,
            }: {
              field: ControllerRenderProps<
                z.infer<typeof insertProductSchema>,
                "price"
              >;
            }) => (
              <FormItem className="w-full">
                <FormLabel>{t("price")}</FormLabel>
                <FormControl>
                  <Input placeholder={t("enterPrice")} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="stock"
            render={({
              field,
            }: {
              field: ControllerRenderProps<
                z.infer<typeof insertProductSchema>,
                "stock"
              >;
            }) => (
              <FormItem className="w-full">
                <FormLabel>{t("stock")}</FormLabel>
                <FormControl>
                  <Input placeholder={t("enterStock")} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lowStockThreshold"
            render={({
              field,
            }: {
              field: ControllerRenderProps<
                z.infer<typeof insertProductSchema>,
                "lowStockThreshold"
              >;
            }) => (
              <FormItem className="w-full">
                <FormLabel>{t("lowStockThreshold")}</FormLabel>
                <FormControl>
                  <Input placeholder={t("enterLowStockThreshold")} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="upload-field">
          {t("availability")}
          <div className="card-premium p-4 space-y-2 mt-2">
            <FormField
              control={form.control}
              name="allowBackorder"
              render={({ field }) => (
                <FormItem className="space-x-2 items-center">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel>{t("allowBackorder")}</FormLabel>
                </FormItem>
              )}
            />
            <p className="text-sm text-muted-foreground">
              {t("allowBackorderHint")}
            </p>
          </div>
        </div>
        <div className="upload-field flex flex-col md:flex-row gap-3 md:gap-5">
          <FormField
            control={form.control}
            name="images"
            render={() => (
              <FormItem className="w-full">
                <FormLabel>{t("images")}</FormLabel>
                <div className="card-premium p-4 space-y-2 min-h-48">
                  <div className="flex-start space-x-2 flex-wrap gap-2">
                    {images.map((image: string, idx: number) => (
                      <div key={image} className="relative group">
                        <Image
                          src={image}
                          alt={tCommon("productImage")}
                          className="w-20 h-20 object-cover object-center rounded-sm"
                          width={100}
                          height={100}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            form.setValue(
                              "images",
                              images.filter((_: string, i: number) => i !== idx)
                            );
                          }}
                          className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    <FormControl>
                      <ImageUploadButton
                        onUploadComplete={(res: { url: string }[]) => {
                          form.setValue("images", [...images, res[0].url]);
                        }}
                        onUploadError={(error: Error) => {
                          toast({
                            description: error.message,
                            variant: "destructive",
                          });
                        }}
                      />
                    </FormControl>
                  </div>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="upload-field">
          {t("featuredProduct")}
          <div className="card-premium p-4 space-y-2 mt-2">
              <FormField
                control={form.control}
                name="isFeatured"
                render={({ field }) => (
                  <FormItem className="space-x-2 items-center">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel>{t("isFeatured")}</FormLabel>
                  </FormItem>
                )}
              />
              {isFeatured && banner && (
                <div className="relative group">
                  <Image
                    src={banner}
                    alt={tCommon("bannerAlt")}
                    width={1920}
                    height={1080}
                    className="w-full object-cover object-center rounded-sm"
                  />
                  <button
                    type="button"
                    onClick={() => form.setValue("banner", "")}
                    className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
              {isFeatured && !banner && (
                <ImageUploadButton
                  onUploadComplete={(res: { url: string }[]) => {
                    form.setValue("banner", res[0].url);
                  }}
                  onUploadError={(error: Error) => {
                    toast({
                      description: error.message,
                      variant: "destructive",
                    });
                  }}
                />
              )}
          </div>
        </div>
        <div className="flex flex-col md:flex-row gap-3 md:gap-5">
          <FormField
            control={form.control}
            name="description"
            render={({
              field,
            }: {
              field: ControllerRenderProps<
                z.infer<typeof insertProductSchema>,
                "description"
              >;
            }) => (
              <FormItem className="w-full">
                <FormLabel>{t("description")} (EL)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder={t("enterDescription")}
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="descriptionEn"
            render={({
              field,
            }: {
              field: ControllerRenderProps<
                z.infer<typeof insertProductSchema>,
                "descriptionEn"
              >;
            }) => (
              <FormItem className="w-full">
                <FormLabel>{t("description")} (EN)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Description in English"
                    className="resize-none"
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div>
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
        </div>
      </form>
    </Form>
  );
}
