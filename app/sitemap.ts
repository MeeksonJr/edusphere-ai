import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://edusphere.ai";

  const routes = [
    "",
    "/about",
    "/pricing",
    "/features",
    "/contact",
    "/blog",
    "/documentation",
    "/support",
    "/roadmap",
    "/testimonials",
    "/faq",
    "/privacy",
    "/terms",
    "/cookies",
    "/licenses",
    "/careers",
    "/login",
    "/signup",
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "daily" : "weekly",
    priority: route === "" ? 1 : 0.8,
  }));
}

