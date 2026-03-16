"use client";

import { Fragment } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  clubAdminMenuItems,
  mainMenuItems,
  tournamentAdminMenuItems,
  userMenuItems,
  tournamentMenuItems,
} from "@/components/navigation/menu-items";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const routeLabels = new Map<string, string>([
  ...mainMenuItems,
  ...tournamentMenuItems,
  ...clubAdminMenuItems,
  ...tournamentAdminMenuItems,
  ...userMenuItems,
].map((item) => [item.href, item.label]));

const formatSegmentLabel = (segment: string) => {
  const decodedSegment = decodeURIComponent(segment);
  return decodedSegment
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
};

export default function SiteBreadcrumb() {
  const pathname = usePathname();

  if (pathname === "/") {
    return null;
  }

  const segments = pathname.split("/").filter(Boolean);
  const breadcrumbItems = segments.map((segment, index) => {
    const href = `/${segments.slice(0, index + 1).join("/")}`;
    return {
      href,
      label: routeLabels.get(href) ?? formatSegmentLabel(segment),
      isLast: index === segments.length - 1,
    };
  });

  return (
    <div className="border-b bg-background/70">
      <div className="mx-auto w-full max-w-6xl px-4 py-3">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/">Accueil</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            {breadcrumbItems.map((item) => (
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
