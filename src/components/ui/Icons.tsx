import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement>;

const base = {
  width: 18,
  height: 18,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
  focusable: false,
};

export function XIcon(props: P) {
  return (
    <svg {...base} fill="currentColor" stroke="none" {...props}>
      <path d="M17.7 3h3.1l-6.8 7.8L22 21h-6.3l-4.9-6.4L5.2 21H2.1l7.3-8.3L1.7 3h6.4l4.4 5.9L17.7 3Zm-1.1 16.2h1.7L7.2 4.7H5.4l11.2 14.5Z" />
    </svg>
  );
}

export function TwitchIcon(props: P) {
  return (
    <svg {...base} fill="currentColor" stroke="none" {...props}>
      <path d="M4.3 2 2.5 6.6v14.1h4.8V23h2.7l2.3-2.3h3.8l5.4-5.4V2H4.3Zm15.4 12.3-3 3h-4.9l-2.3 2.3v-2.3H5.5V3.9h14.2v10.4ZM16 7.3h-1.8v5.3H16V7.3Zm-4.9 0H9.3v5.3h1.8V7.3Z" />
    </svg>
  );
}

export function YouTubeIcon(props: P) {
  return (
    <svg {...base} fill="currentColor" stroke="none" {...props}>
      <path d="M23 7.2a2.9 2.9 0 0 0-2-2C19.2 4.7 12 4.7 12 4.7s-7.2 0-9 .5a2.9 2.9 0 0 0-2 2C.5 9 .5 12 .5 12s0 3 .5 4.8a2.9 2.9 0 0 0 2 2c1.8.5 9 .5 9 .5s7.2 0 9-.5a2.9 2.9 0 0 0 2-2c.5-1.8.5-4.8.5-4.8s0-3-.5-4.8ZM9.7 15.1V8.9l6 3.1-6 3.1Z" />
    </svg>
  );
}

export function LinkIcon(props: P) {
  return (
    <svg {...base} {...props}>
      <path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1" />
      <path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" />
    </svg>
  );
}

export function ArrowIcon(props: P) {
  return (
    <svg {...base} {...props}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export function ArrowUpRightIcon(props: P) {
  return (
    <svg {...base} {...props}>
      <path d="M7 17 17 7M8 7h9v9" />
    </svg>
  );
}

export function MailIcon(props: P) {
  return (
    <svg {...base} {...props}>
      <rect x="3" y="5" width="18" height="14" rx="1" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  );
}

export function SocialIcon({ service, ...props }: P & { service: string }) {
  switch (service) {
    case "x":
      return <XIcon {...props} />;
    case "twitch":
      return <TwitchIcon {...props} />;
    case "youtube":
      return <YouTubeIcon {...props} />;
    default:
      return <LinkIcon {...props} />;
  }
}
