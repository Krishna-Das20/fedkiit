This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

The home page is `app/(main)/page.tsx`; pages update as you edit them.

## Project structure

Everything is TypeScript: components are `.tsx`, everything else `.ts`. The
only JavaScript left is the Node tooling in `scripts/` and `eslint.config.mjs`.

```
app/            Next.js App Router
  (auth)/         sign-in, sign-up and password reset pages
  (main)/         every other page, including /profile
  api/            route handlers (the backend), one folder per endpoint
  components/     the navbar and other app-wide pieces
components/     components written for the Next.js app (chat widget, SEO)
lib/            server-side code: Prisma client, auth, services, email
  types/          types shared by the server and the UI (events, posts)
prisma/         database schema
src/            the site UI, ported from FED-Frontend
  views/          one component per page, mounted by app/**/page.tsx
  sections/       the parts a page is built from (home sections, profile tabs)
  components/     reusable UI (cards, form fields, the Core inputs)
  features/       modals
  layouts/        footer, profile shell, skeletons
  context/        auth and recovery context providers
  services/       the axios client every request goes through
  types/          front-end types: forms, members, teams, blogs, certificates
  utils/, data/, assets/, microInteraction/ (toasts and loaders)
scripts/        dev and audit scripts run with node
```

## Contributing

- Write new files in TypeScript: `.tsx` for components, `.ts` otherwise.
- Give every component a props type, and type state that starts out as `null`
  or `[]` (`useState<FormRecord[]>([])`). Put a shape used by more than one file
  in `src/types/` (or `lib/types/` if the server uses it too). Avoid `any`.
- Before opening a pull request, run `npm run typecheck` and `npm run lint`.
  The typecheck runs in strict mode and has to pass with no errors.
- Open pull requests against `beta`; `beta` is released to `main`.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
