# Project Instructions

Before making any design, UI, or visual decision in this repo — layout, color, spacing, component choices, styling conventions, iconography — (re-)read `Design.md` in the repo root. It documents this project's design system and conventions. Do this every time, even if you already read it earlier in the same session — a rule read once and then forgotten mid-session is as good as never read.

When creating or updating a feature that already exists — especially one that shares data with another page — always check the existing implementation first, so changes don't ship as breaking changes.

## Scope boundary: this app owns account/plan/feature configuration

Kerabie Mail is three separate apps. This one (`kerabie_mail_frontend`, Next.js) is the account portal: marketing site, account management, billing, and plan/feature configuration — see `src/app/(app)/app/settings/` (aliases, api-keys, billing, domains, forwarding, mailboxes, notifications, security, shared-inbox, templates, unsubscribes, webhooks, branding) and `src/app/(app)/app/campaigns/`. `kerabie-mail-webmail` (Vite/React, a separate repo) is the actual email client — inbox, compose, contacts, calendar — plus settings that control mail *behavior* (signatures, vacation responder). Auth is shared (httpOnly cookies against the same backend); this app hands off to webmail via an SSO token exchange (see `AppSidebar.tsx`'s `handleOpenWebmail`).

**Before adding a new feature page, ask: is this "how does my mail behave" (webmail) or "how is my account/plan configured" (here)?** If it's the former, it likely belongs in `kerabie-mail-webmail` instead.

Custom Branding and the full Campaigns feature (list/create/segments/drip steps/A-B testing/analytics) were originally built in webmail by mistake in an earlier session and had to be torn out and rebuilt here — that's why they exist as a working example of the pattern (`settings/branding/`, `campaigns/`) to follow for anything similar.

**`POST /mail/connect` boundary — read carefully, it's narrower than "mobile-only":** this endpoint is a login/signup primitive, not an "add a mailbox to my current account" one — it never attaches to the currently-authenticated user, it always either logs into or *creates* a separate account for whatever email address you give it (`MailConnectionCreate.user_id` exists in the schema but is never actually read in `connect_mailbox`). What varies by `connection_type` is whether that's appropriate for this app:
- `connection_type='imap'` (log in via an *existing* external provider — personal Gmail/Yahoo/etc., with its own IMAP credentials) — **mobile-only.** This is mobile's personal multi-inbox aggregator model: each connected mailbox is its own independent account in a local switcher (Redux `accounts` slice, separate keychain tokens per account). Doesn't fit this app.
- Multi-account switching itself — **mobile-only.** This app is single-session, one account per login, standard web pattern.
- `connection_type='dns'` (register or log in by proving ownership of your own domain via DNS) — **legitimately belongs here too.** It's a real alternative to `/auth/register`'s `username@kerabie.email` path ("I want my account to be admin@mycompany.com instead"), not a mailbox-aggregation feature. If you build this, it's a signup/login flow (parallel to the existing login/register pages), not a Settings > Mailboxes feature — there's no logged-in user to attach anything to yet.

This app's *existing*, logged-in-only mailbox model is still different on purpose: one `User` owning multiple `UserEmail` rows via `POST /mail/mailbox/add`, which requires already owning a verified domain — a domain-owner ("I run mycompany.com, I'm adding sales@/support@ under my one account") pattern. That one still doesn't take IMAP credentials for an external provider — don't conflate it with the `connection_type='dns'` registration path above.


- Study how established products solve the problem before designing a solution. Adopt their proven patterns and conventions rather than inventing an approach from scratch.


-always close all process you work on whenever you are  done
-always test for edge cases
-when working on another project in this ecosystem always read the Design.md, Agents.md, Claude.md when it is availaible
-if working on the mobile app at kerabie_mail\apps\kerabie_mail make sure these changes reflect the frontend at kerabie_mail\kerabie_mail_frontend,kerabie_mail\kerabie-mail-webmail(where this is mostly maoling features) and vice versa

-make sure the admin reflects the ability to manage features you create at kerabie_mail\kerabie_mail_admin