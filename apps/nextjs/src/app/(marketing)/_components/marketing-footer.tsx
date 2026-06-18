import Link from "next/link";

import { FOOTER, SITE } from "../_lib/content";
import { Logomark } from "./logomark";
import { ScrollLink } from "./scroll-link";

const CURRENT_YEAR = new Date().getFullYear();

// Pure black (void) closure, a deeper note than the abyssal-ink content
// sections. Signals the absolute end of the site.
export function MarketingFooter() {
  return (
    <footer className="bg-void text-paper px-6 py-16">
      <div className="mx-auto max-w-[1200px]">
        <div className="grid gap-12 md:grid-cols-[2fr_repeat(2,1fr)]">
          <div>
            <Link
              href="/"
              className="text-paper group flex items-center gap-2.5 text-[17px] tracking-[-0.01em]"
            >
              <Logomark />
              {SITE.name}
            </Link>
            <p className="text-graphite mt-4 max-w-[260px] text-[15px] leading-[1.5]">
              {FOOTER.tagline}
            </p>
          </div>

          {FOOTER.sections.map((section) => (
            <div key={section.title}>
              <h3 className="font-roboto-mono text-lichen mb-4 text-[13px] tracking-[-0.02em] uppercase">
                {section.title}
              </h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <ScrollLink
                      href={link.href}
                      className="font-roboto-mono text-graphite hover:text-paper text-[14px] tracking-[-0.008em] transition-colors"
                    >
                      {link.label}
                    </ScrollLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-graphite/50 text-graphite font-roboto-mono mt-14 flex flex-col items-start justify-between gap-3 border-t pt-6 text-[13px] tracking-[-0.02em] sm:flex-row sm:items-center">
          <span>
            © {CURRENT_YEAR} {SITE.name}
          </span>
          <span className="text-graphite/70 uppercase">
            Propose. Predict. Measure. Learn.
          </span>
        </div>
      </div>
    </footer>
  );
}
