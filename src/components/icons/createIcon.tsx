import { ReactNode, SVGProps } from "react";

export default function createIcon(name: string, glyph: ReactNode) {
  const icon = (props: SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" focusable="false" aria-hidden {...props}>
      {glyph}
    </svg>
  );
  icon.displayName = name;
  return icon;
}
