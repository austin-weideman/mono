import Link from "next/link";

import { FOOTER, SITE } from "../_lib/content";
import { ScrollLink } from "./scroll-link";

const CURRENT_YEAR = new Date().getFullYear();

export function MarketingFooter() {
  return (
    <footer className="bg-porcelain border-shell/60 relative overflow-hidden border-t px-4 py-16 md:px-8">
      <div className="from-blush/40 absolute top-0 left-1/2 h-[320px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-linear-to-br to-transparent blur-3xl" />
      <div className="relative mx-auto max-w-6xl">
        <div className="grid gap-12 md:grid-cols-4">
          <div className="md:col-span-1">
            <Link
              href="/"
              className="font-display text-ink text-xl font-semibold tracking-tight"
            >
              {SITE.name}
            </Link>
            <p className="text-ink-muted mt-4 text-sm leading-relaxed">
              {FOOTER.tagline}
            </p>
          </div>

          {FOOTER.sections.map((section) => (
            <div key={section.title}>
              <h3 className="text-ink mb-4 text-sm font-semibold">
                {section.title}
              </h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <ScrollLink
                      href={link.href}
                      className="text-ink-muted hover:text-ink text-sm transition-colors"
                    >
                      {link.label}
                    </ScrollLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-shell/30 text-ink-muted mt-12 border-t pt-8 text-center text-sm">
          © {CURRENT_YEAR} {SITE.name}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
