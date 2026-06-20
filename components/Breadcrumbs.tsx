import Link from "next/link";
import { ChevronRight } from "lucide-react";

export type Crumb = { label: string; href?: string };

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav className="mb-5 flex flex-wrap items-center gap-1 text-sm text-zinc-500">
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1">
          {i > 0 && <ChevronRight className="h-3.5 w-3.5 text-zinc-400" />}
          {item.href ? (
            <Link href={item.href} className="hover:text-zinc-800">
              {item.label}
            </Link>
          ) : (
            <span className="font-medium text-zinc-800">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
