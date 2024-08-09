import { ReactNode, SVGProps } from "react";

function svgIcon(name: string, children: ReactNode) {
  const icon = (props: SVGProps<SVGSVGElement>) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="24"
      height="24"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  );
  icon.displayName = name;
  return icon;
}

export default function createIcon(name: string, glyph: ReactNode) {
  return svgIcon(
    name,
    <g fill="currentColor">
      <path d="M0 0h24v24H0z" fill="none" />
      {glyph}
    </g>,
  );
}
