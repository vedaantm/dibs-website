/** Site-level config. Change the production URL here once a custom domain is set. */
export const SITE = {
  name: "Dibs",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://dibs-website.vercel.app",
  contactEmail: "hello@dibs.example",
} as const;
