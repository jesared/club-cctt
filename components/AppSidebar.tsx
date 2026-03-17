"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { navigation, Role } from "./navigation/menu-items";

export default function AppSidebar({ role }: { role: Role }) {
  const pathname = usePathname();

  return (
    <nav className="flex h-full flex-col p-4">
      {navigation
        .filter((section) => section.roles.includes(role))
        .map((section) => (
          <div key={section.title} className="mb-6">
            <p className="mb-2 text-xs font-semibold text-muted-foreground uppercase">
              {section.title}
            </p>

            <div className="flex flex-col gap-1">
              {section.items.map((item) => {
                const active =
                  pathname === item.href ||
                  pathname.startsWith(item.href + "/");

                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2 rounded-md px-3 py-2 text-sm",
                      active
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground hover:bg-muted",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
    </nav>
  );
}
