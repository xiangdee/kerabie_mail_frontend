# Project Instructions

Before making any design, UI, or visual decision in this repo — layout, color, spacing, component choices, styling conventions, iconography — read `Design.md` in the repo root first. It documents this project's design system and conventions.

When creating or updating a feature that already exists — especially one that shares data with another page — always check the existing implementation first, so changes don't ship as breaking changes.

## Scope boundary: this app owns account/plan/feature configuration

Kerabie Mail is three separate apps. This one (`kerabie_mail_frontend`, Next.js) is the account portal: marketing site, account management, billing, and plan/feature configuration — see `src/app/(app)/app/settings/` (aliases, api-keys, billing, domains, forwarding, mailboxes, notifications, security, shared-inbox, templates, unsubscribes, webhooks, branding) and `src/app/(app)/app/campaigns/`. `kerabie-mail-webmail` (Vite/React, a separate repo) is the actual email client — inbox, compose, contacts, calendar — plus settings that control mail *behavior* (signatures, vacation responder). Auth is shared (httpOnly cookies against the same backend); this app hands off to webmail via an SSO token exchange (see `AppSidebar.tsx`'s `handleOpenWebmail`).

**Before adding a new feature page, ask: is this "how does my mail behave" (webmail) or "how is my account/plan configured" (here)?** If it's the former, it likely belongs in `kerabie-mail-webmail` instead.

Custom Branding and the full Campaigns feature (list/create/segments/drip steps/A-B testing/analytics) were originally built in webmail by mistake in an earlier session and had to be torn out and rebuilt here — that's why they exist as a working example of the pattern (`settings/branding/`, `campaigns/`) to follow for anything similar.
