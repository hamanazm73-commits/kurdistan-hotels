# Kurdistan Hotels — setup

Modern rebuild: **Next.js 16 + React 19 + TypeScript + Tailwind v4 + shadcn/ui + Firebase**.

## Run it

```bash
npm install      # first time only
npm run dev      # http://localhost:3000
```

Build for production:

```bash
npm run build
npm start
```

> Node is installed at `C:\Users\pc\AppData\Local\nodejs`. If `node`
> isn't found in a new terminal, open a fresh PowerShell (the installer
> added it to your profile) or run the app from the editor's terminal.

## Make yourself the OWNER 👑

1. In **`.env.local`** set `NEXT_PUBLIC_OWNER_EMAIL` to the email you log in with.
2. In **Firebase console → Authentication**, create that user (email/password).
3. In **`firestore.rules`**, change `ownerEmail()` to the same email, then
   publish the rules (Firebase console → Firestore → Rules).

Now log in at `/login` → you land on `/admin` as the owner. From the
**Admins** tab you can add other admins by email; they get access to
`/admin` (you can disable them anytime). Owner-only actions stay yours.

## Features

- **Animated public site** — hero, hotel grid, search / city filter / price /
  sort, 3 languages (Kurdish Sorani · English · Iraqi Arabic) with RTL/LTR,
  light & dark mode.
- **Hotels** with **Featured ⭐** and **Recommended 👍** badges, and
  **discounts** (old price struck through, new price shown, % off).
- **/admin** dashboard: add / edit / delete hotels, toggle featured &
  discounts, view bookings, and (owner) manage admins.
- **Security**: rate-limited + zod-validated booking API
  (`/api/bookings`), Firestore security rules, env-based secrets.

## Optional hardening

- **Bookings persistence + rate limiting end-to-end**: add a service
  account so the booking API can write securely. Firebase console →
  Project settings → Service accounts → *Generate new private key*, then
  set `FIREBASE_CLIENT_EMAIL` and `FIREBASE_PRIVATE_KEY` in `.env.local`
  (keep the `\n` escapes in the key, wrap in quotes). Without it, bookings
  are validated + rate-limited but not stored.
- **App Check** (`NEXT_PUBLIC_APPCHECK_SITE_KEY`) for bot protection.

## Old site

The previous vanilla HTML/CSS/JS version is preserved in **`/legacy`**.
