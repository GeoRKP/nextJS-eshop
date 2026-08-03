import type { MetadataRoute } from "next";
import { SERVER_URL } from "@/lib/constants";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || SERVER_URL;

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/user/", "/api/"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
