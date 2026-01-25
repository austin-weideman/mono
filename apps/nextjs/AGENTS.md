# Next.js Agent Guidelines

## Mobile Horizontal Scroll Fix

If mobile can scroll horizontally (revealing blank space), add `overflow-hidden` to the parent of any large absolute-positioned decorative elements (gradient blobs, etc.).

## Anchor Links

Use absolute paths (`/#features` not `#features`) and the `ScrollLink` component from `(marketing)/_components/scroll-link.tsx` for anchor navigation. This ensures links work across pages and repeat clicks still scroll.
