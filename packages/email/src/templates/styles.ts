import type { CSSProperties } from "react";

export const brand = {
  eggshell: "#fdfcfc",
  powder: "#f5f3f1",
  chalk: "#e5e5e5",
  fog: "#b1b0b0",
  gravel: "#777169",
  cinder: "#575347",
  obsidian: "#000000",
} as const;

const displayFontStack = '"Fraunces", Georgia, "Times New Roman", serif';
const bodyFontStack =
  '"Inter", -apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

export const styles = {
  body: {
    backgroundColor: brand.powder,
    fontFamily: bodyFontStack,
    margin: 0,
    padding: "32px 0",
  },
  container: {
    backgroundColor: brand.eggshell,
    border: `1px solid ${brand.chalk}`,
    borderRadius: "12px",
    margin: "0 auto",
    maxWidth: "560px",
    padding: "40px",
  },
  header: {
    marginBottom: "24px",
  },
  logo: {
    color: brand.obsidian,
    fontFamily: bodyFontStack,
    fontSize: "20px",
    fontWeight: 600,
    letterSpacing: "-0.01em",
    margin: 0,
  },
  heading: {
    color: brand.obsidian,
    fontFamily: displayFontStack,
    fontSize: "32px",
    fontWeight: 300,
    letterSpacing: "-0.64px",
    lineHeight: "1.1",
    margin: "0 0 20px",
  },
  paragraph: {
    color: brand.gravel,
    fontFamily: bodyFontStack,
    fontSize: "16px",
    lineHeight: "1.55",
    margin: "0 0 16px",
  },
  buttonContainer: {
    margin: "28px 0",
  },
  button: {
    backgroundColor: brand.obsidian,
    borderRadius: "999px",
    color: brand.eggshell,
    display: "inline-block",
    fontFamily: bodyFontStack,
    fontSize: "14px",
    fontWeight: 500,
    lineHeight: "1",
    padding: "14px 24px",
    textDecoration: "none",
  },
  fallbackLink: {
    color: brand.gravel,
    fontFamily: bodyFontStack,
    fontSize: "14px",
    wordBreak: "break-all" as const,
  },
  hr: {
    borderColor: brand.chalk,
    margin: "32px 0 20px",
  },
  footer: {
    color: brand.gravel,
    fontFamily: bodyFontStack,
    fontSize: "13px",
    lineHeight: "1.55",
    margin: "0 0 12px",
  },
  footerBrand: {
    color: brand.gravel,
    fontFamily: bodyFontStack,
    fontSize: "12px",
    margin: 0,
  },
} satisfies Record<string, CSSProperties>;
