"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment } from "react";

import { navigation } from "@/components/navigation/menu-items";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

/* =========================
   MAP DES ROUTES
========================= */

const routeLabels = new Map<string, string>(
  navigation.flatMap((section) =>
    section.items.map((item) => [item.href, item.label] as const),
  ),
);

/* =========================
   FORMAT LABEL FALLBACK
========================= */

const formatSegmentLabel = (segment: string) => {
  const decoded = decodeURIComponent(segment);

  return decoded
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

/* =========================
   COMPONENT
========================= */

export default function SiteBreadcrumb() {
  const pathname = usePathname();

  if (pathname === "/") return null;

  const segments = pathname.split("/").filter(Boolean);

  const items = segments.map((segment, index) => {
    const href = "/" + segments.slice(0, index + 1).join("/");

    return {
      href,
      label: routeLabels.get(href) ?? formatSegmentLabel(segment),
      isLast: index === segments.length - 1,
    };
  });

  return (
    <div className="border-b bg-background/60 backdrop-blur">
      <div className="px-4 py-3 md:px-6">
        <Breadcrumb>
          <BreadcrumbList>
            {/* HOME */}
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/">Accueil</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>

            {/* ITEMS */}
            {items.map((item) => (
              <Fragment key={item.href}>
                <BreadcrumbSeparator />

                <BreadcrumbItem>
                  {item.isLast ? (
                    <BreadcrumbPage>{item.label}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <Link href={item.href}>{item.label}</Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </div>
  );
}
