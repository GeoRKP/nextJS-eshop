"use client";

import { insertProductSchema, updateProductSchema, createInsertProductSchema } from "@/lib/validators";
import { useToast } from "@/hooks/use-toast";
import { ControllerRenderProps, useForm } from "react-hook-form";
import { Product } from "@/types";
import { useRouter } from "@/i18n/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { productDefaultValues } from "@/lib/constants";
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
import { createProduct, updateProduct } from "@/lib/actions/product.actions";
import { UploadButton } from "@/lib/uploadthing";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
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
          description: "Product created successfully",
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
          description: "Product updated successfully",
        });
        router.push("/admin/products");
      }
    }
  };

  const images = form.watch("images");
  const banner = form.watch("banner");
  const isFeatured = form.watch("isFeatured");

  return (
    <Form {...form}>
      <form
        method="POST"
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8"
      >
        <div className="flex flex-col md:flex-row gap-5">
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
                <FormLabel>{t("name")}</FormLabel>
                <FormControl>
                  <Input placeholder={t("enterProductName")} {...field} />
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
                      className="bg-gray-500 hover:bg-gray-600 text-white px-4 mt-2"
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
        <div className="flex flex-col md:flex-row gap-5">
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
        <div className="flex flex-col md:flex-row gap-5">
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
        </div>
        <div className="flex flex-col md:flex-row gap-5"></div>
        <div className=" upload-field flex flex-col md:flex-row gap-5"></div>
        <div className=" upload-field flex flex-col md:flex-row gap-5"></div>
        <div className=" upload-field flex flex-col md:flex-row gap-5">
          <FormField
            control={form.control}
            name="images"
            render={() => (
              <FormItem className="w-full">
                <FormLabel>{t("images")}</FormLabel>
                <Card>
                  <CardContent className="space-y-2 mt-2 min-h-48">
                    <div className="flex-start space-x-2">
                      {images.map((image: string) => (
                        <Image
                          key={image}
                          src={image}
                          alt="Product image"
                          className="w-20 h-20 object-cover object-center rounded-sm"
                          width={100}
                          height={100}
                        />
                      ))}
                      <FormControl>
                        <UploadButton
                          endpoint="imageUploader"
                          onClientUploadComplete={(res: { url: string }[]) => {
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
                  </CardContent>
                </Card>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="upload-field">
          {t("featuredProduct")}
          <Card>
            <CardContent className="space-y-2 mt-2">
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
                <Image
                  src={banner}
                  alt="Banner"
                  width={1920}
                  height={1080}
                  className="w-full object-cover object-center rounded-sm"
                />
              )}
              {isFeatured && !banner && (
                <UploadButton
                  endpoint="imageUploader"
                  onClientUploadComplete={(res: { url: string }[]) => {
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
            </CardContent>
          </Card>
        </div>
        <div>
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
                <FormLabel>{t("description")}</FormLabel>
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
        </div>
        <div>
          <Button
            type="submit"
            size="lg"
            disabled={form.formState.isSubmitting}
            className="button col-span-2 w-full"
          >
            {form.formState.isSubmitting ? tCommon("submitting") : type === "Create" ? t("createButton") : t("updateButton")}
          </Button>
        </div>
      </form>
    </Form>
  );
}
