---
title: "Nexo Barber"
tagline: "A multi-tenant SaaS for independent barbershops in Costa Rica. Public booking, live queue tracking, owner dashboard, and PWA — designed and shipped end-to-end."
role: "Founder · Product engineer · Designer · Operator"
year: "2024 – present"
live: "https://barberapp.nexocr.pro"
stack:
  - Next.js 16
  - React 19
  - TypeScript
  - Supabase (Postgres, Auth, Storage, Realtime)
  - TailwindCSS v4
  - Framer Motion
  - Vercel
  - Sentry
description: "Case study — Nexo Barber, a multi-tenant booking and operations SaaS for independent barbershops in Costa Rica."
---

## At a glance

Nexo Barber is a mobile-first SaaS that helps independent barbershops replace the
"paper notebook + WhatsApp" workflow with a single platform: clients book online,
walk-ins join a live queue, barbers see their day, and owners run the business
from one dashboard. Every shop has its own subdomain, branding, schedule, and
loyalty program — all powered by a multi-tenant Supabase backend.

I designed the product, built the codebase, set up the infrastructure, write the
roadmap, and run customer support. The work spans the full stack — UI, design
system, API, database, RLS policies, push notifications, observability, billing,
and DevOps.

## The problem

Independent barbershops run on a patchwork: a paper notebook for appointments,
a WhatsApp group for the team, Google Calendar for the owner, and nothing at all
for the client side. Bookings get double-stacked. Walk-ins get lost. Owners can't
see today's revenue without doing math on the back of an envelope. Off-the-shelf
tools (Calendly, Square) are either too expensive, too generic, or built for a
different market entirely.

The bet behind Nexo: a focused product, designed for one country's market and
operating reality, that costs less than what shops already lose to a single
missed booking per week.

## The approach

Three audiences, one product:

1. **Clients** book a service from a public site at `<shop>.nexocr.pro`, follow a
   six-state live queue (countdown → "you're next" → "your turn" → completed),
   and keep a profile with their history and loyalty progress.
2. **Barbers** see their day on a mobile-first "Mi día" timeline — appointments,
   walk-ins, and gaps, all in one column.
3. **Owners** get a dashboard for the day, week, and month — revenue, no-show
   tracking, services, team, clients, loyalty programs, announcements, and
   subscription management.

Everything is mobile-first. The web app is a PWA — installable on home screens,
works offline for the data already cached, and pushes notifications when a slot
opens up or a turn arrives.

## Architecture

A short tour of the parts that took the most thinking:

- **Multi-tenant data with Row-Level Security.** A single Postgres schema isolates
  every shop's data at the row level via Supabase RLS. Policies are written to
  avoid self-referencing patterns — those cause infinite recursion the first time
  you `JOIN` your own check table. Each request runs under the user's JWT;
  there is no superuser path from the client.
- **Subdomain routing.** A Next.js middleware reads the request's host header,
  resolves it to a business, and rewrites the URL so the same App Router serves
  every shop. Reserved paths (`/api`, `/auth`, `/_next`, `/track`) bypass the
  subdomain rewrite to avoid breaking SSE, OAuth, and Next internals.
- **Real-time queue.** Live tracking and the owner's "today" view subscribe to
  Supabase Realtime channels filtered by `business_id`. State transitions
  (booked → arrived → in-service → completed) propagate to every active client
  in under a second.
- **PWA with push.** A service worker manages the install prompt, offline
  fallbacks for the booking page, and Web Push for queue updates and reminders.
- **Observability without noise.** Errors are categorized at capture time —
  validation failures, RPC failures, expected business outcomes
  (rate-limited, subscription expired), and truly unexpected errors. Only the
  last category alerts; the rest stay in structured logs. This was the
  difference between "200 Sentry pings a day" and "one alert that actually
  matters."
- **Timezone discipline.** Vercel runs in UTC. Costa Rica doesn't. Every API
  route that filters by day or month computes its range using half-open UTC
  intervals derived from the business's local time zone — never the server's.
  CI lints for the dangerous patterns. This eliminated a class of "the 7pm
  appointment disappeared" bugs.

## Selected features

The product is built around three flows, each designed for a different audience:

- **Public booking.** Four steps: pick a service, pick a barber + time, drop your name and phone, confirm. No account required to reach the end. Designed to feel as effortless as ordering food.
- **Live tracking.** Six states (booked → countdown → queue → "you're next" → "your turn" → completed), one URL, push notifications when the turn flips. Walk-ins join the same queue with one tap.
- **Owner dashboard.** Day / week / month appointments, revenue, no-show tracking, team management, services, clients, loyalty, announcements, subscription — all on a mobile-first layout that runs from any phone.

Plus a first-class **dark mode** with full token swap, not a "background toggle" afterthought.

<aside class="cs-figure" style="border: 1px dashed var(--border-strong); border-radius: var(--radius-3); padding: var(--space-5); text-align: center; background: var(--surface);">
  <p class="mono" style="color: var(--muted); font-size: var(--fs-sm); margin: 0;">
    Screenshot gallery being refreshed with the current branding.<br>
    See the product live at <a href="https://barberapp.nexocr.pro" rel="noopener">barberapp.nexocr.pro</a>.
  </p>
</aside>

## Decisions worth sharing

A few choices that aren't visible from the screenshots:

- **Apple-HIG mobile baseline.** 44 px touch targets, bottom sheets for any
  overlay-like context, swipeable rows for destructive actions, a sticky two-row
  header on calendar views, and inline KPI text rather than card-like KPI
  containers. The product feels native because it picked one platform's
  conventions and committed.
- **Booking state restoration after OAuth.** A subtle but high-traffic bug: when
  a user signs in mid-booking, restoring the flow has to downgrade the step if
  the time slot is no longer valid. The page now ships with a runtime invariant
  that auto-corrects mismatched state instead of rendering a blank screen.
- **Server-side enforcement of operational rules.** UI-level guards aren't
  enough. Booking, closures, expired offers — every state transition runs through
  a server-side check, written assuming a hostile client.
- **CI gates for the patterns that bite.** `lint:tz` blocks any new code that
  treats day/month boundaries in server time. `lint:adapter` catches JSONB
  columns being read without the canonical adapter. Both rules were added the
  day after the bug they prevent.

## What I optimize for

The product is on a budget — both money and design entropy. The constraints I
hold the line on, in order:

1. **Mobile speed.** Core Web Vitals first. The home screen and booking flow
   are the only routes I will accept regressions on under no circumstances.
2. **Multi-tenant safety.** Every new feature gets reviewed for impersonation
   and tenant isolation. I'd rather ship a feature a week late than ship one
   that leaks data.
3. **Operator clarity.** Owners are not engineers. Every screen has to make
   sense in three seconds, or it's wrong.
4. **Design rigor.** Apple-HIG is the floor, not the ceiling. The product
   competes with apps people already love.

## Stack

<ul class="chip-list" role="list" aria-label="Tools">
  <li><span class="chip">Next.js 16 (App Router)</span></li>
  <li><span class="chip">React 19</span></li>
  <li><span class="chip">TypeScript (strict)</span></li>
  <li><span class="chip">Supabase Postgres</span></li>
  <li><span class="chip">Supabase Auth</span></li>
  <li><span class="chip">Supabase Storage</span></li>
  <li><span class="chip">Supabase Realtime</span></li>
  <li><span class="chip">Row-Level Security</span></li>
  <li><span class="chip">TailwindCSS v4</span></li>
  <li><span class="chip">Framer Motion</span></li>
  <li><span class="chip">Resend (transactional email)</span></li>
  <li><span class="chip">Web Push (VAPID)</span></li>
  <li><span class="chip">Service Worker / PWA</span></li>
  <li><span class="chip">Vercel</span></li>
  <li><span class="chip">Sentry</span></li>
  <li><span class="chip">pino (structured logging)</span></li>
  <li><span class="chip">Vitest + Playwright</span></li>
  <li><span class="chip">Cloudflare DNS</span></li>
</ul>

## Where to look

Live product: <a href="https://barberapp.nexocr.pro" rel="noopener">barberapp.nexocr.pro</a>.
Want a walkthrough or deeper technical write-up? Drop me a line at
<a href="mailto:bryn.acuna7@gmail.com">bryn.acuna7@gmail.com</a>.
