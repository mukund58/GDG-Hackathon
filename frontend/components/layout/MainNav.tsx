import Link from "next/link";

const navItems = [
  { href: "/", label: "Foundation" },
  { href: "/#api-status", label: "API Setup" },
  { href: "/#ui-kit", label: "UI Kit" },
];

export function MainNav() {
  return (
    <nav className="flex flex-wrap items-center gap-2 md:justify-end">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-sm font-medium text-[var(--color-foreground)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}