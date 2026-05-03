import Link from "next/link";

import { FOOTER, SITE } from "../_lib/content";
import { ScrollLink } from "./scroll-link";

const CURRENT_YEAR = new Date().getFullYear();

export function MarketingFooter() {
  return (
    <footer className="border-chalk border-t px-6 py-16">
      <div className="mx-auto max-w-[1200px]">
        <div className="grid gap-12 md:grid-cols-[1.5fr_repeat(3,1fr)]">
          <div>
            <Link
              href="/"
              className="text-obsidian flex items-center gap-2 text-[15px] font-medium tracking-tight"
            >
              <span
                aria-hidden
                className="bg-obsidian inline-flex size-5 items-center justify-center rounded-full"
              >
                <span className="bg-eggshell size-1.5 rounded-full" />
              </span>
              {SITE.name}
            </Link>
            <p className="text-gravel mt-4 max-w-[260px] text-[14px] leading-[1.55]">
              {FOOTER.tagline}
            </p>
          </div>

          {FOOTER.sections.map((section) => (
            <div key={section.title}>
              <h3 className="text-obsidian mb-4 text-[13px] font-medium tracking-[0.3px] uppercase">
                {section.title}
              </h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <ScrollLink
                      href={link.href}
                      className="text-gravel hover:text-obsidian text-[14px] transition-colors"
                    >
                      {link.label}
                    </ScrollLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-chalk text-slate mt-14 flex flex-col items-start justify-between gap-3 border-t pt-6 text-[13px] sm:flex-row sm:items-center">
          <span>
            © {CURRENT_YEAR} {SITE.name}. All rights reserved.
          </span>
        </div>
      </div>
    </footer>
  );
}
