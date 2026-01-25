import Link from "next/link";

import { FOOTER, SITE } from "../_lib/content";
import { ScrollLink } from "./scroll-link";

const CURRENT_YEAR = new Date().getFullYear();

export function MarketingFooter() {
  return (
    <footer className="bg-warm-cream-dark border-warm-tan/50 border-t px-4 py-16 md:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-12 md:grid-cols-4">
          <div className="md:col-span-1">
            <Link
              href="/"
              className="font-display text-warm-brown text-xl font-semibold tracking-tight"
            >
              {SITE.name}
            </Link>
            <p className="text-warm-brown-muted mt-4 text-sm leading-relaxed">
              {FOOTER.tagline}
            </p>
          </div>

          {FOOTER.sections.map((section) => (
            <div key={section.title}>
              <h3 className="text-warm-brown mb-4 text-sm font-semibold">
                {section.title}
              </h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <ScrollLink
                      href={link.href}
                      className="text-warm-brown-muted hover:text-warm-brown text-sm transition-colors"
                    >
                      {link.label}
                    </ScrollLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-warm-tan/30 text-warm-brown-muted mt-12 border-t pt-8 text-center text-sm">
          © {CURRENT_YEAR} {SITE.name}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
