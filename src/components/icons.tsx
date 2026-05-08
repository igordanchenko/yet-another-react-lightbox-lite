import type { ReactNode, SVGProps } from "react";

function createIcon(name: string, glyph: ReactNode) {
  const icon = (props: SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" focusable="false" aria-hidden {...props}>
      {glyph}
    </svg>
  );
  icon.displayName = name;
  return icon;
}

export const Close = createIcon(
  "Close",
  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />,
);

export const Next = createIcon("Next", <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />);

export const Previous = createIcon("Previous", <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />);
