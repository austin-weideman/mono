"use client";

import { useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface ScrollLinkProps {
  href: string;
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
}

export function ScrollLink({
  href,
  className,
  children,
  onClick,
}: ScrollLinkProps) {
  const pathname = usePathname();

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      const hashIndex = href.indexOf("#");
      if (hashIndex === -1) {
        onClick?.();
        return;
      }

      const targetPath = href.slice(0, hashIndex) || "/";
      const hash = href.slice(hashIndex + 1);

      if (pathname === targetPath) {
        e.preventDefault();
        const element = document.getElementById(hash);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
          window.history.pushState(null, "", href);
        }
      }

      onClick?.();
    },
    [href, pathname, onClick],
  );

  return (
    <Link href={href} className={className} onClick={handleClick}>
      {children}
    </Link>
  );
}
