---
title: "Nexo Barber"
tagline: "A multi-tenant SaaS for independent barbershops in Costa Rica. Public booking, live queue tracking, owner dashboard, and PWA, designed and shipped end-to-end."
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
toc:
  - { id: "at-a-glance", label: "At a glance" }
  - { id: "the-problem", label: "The problem" }
  - { id: "the-approach", label: "The approach" }
  - { id: "architecture", label: "Architecture" }
  - { id: "selected-features", label: "Selected features" }
  - { id: "decisions-worth-sharing", label: "Decisions worth sharing" }
  - { id: "what-i-optimize-for", label: "What I optimize for" }
  - { id: "stack", label: "Stack" }
description: "Case study, Nexo Barber, a multi-tenant booking and operations SaaS for independent barbershops in Costa Rica."
---

## At a glance

Nexo Barber is a mobile-first SaaS that helps independent barbershops replace the
"paper notebook + WhatsApp" workflow with a single platform: clients book online,
walk-ins join a live queue, barbers see their day, and owners run the business
from one dashboard. Every shop has its own subdomain, branding, schedule, and
loyalty program, all powered by a multi-tenant Supabase backend.

I designed the product, built the codebase, set up the infrastructure, write the
roadmap, and run customer support. The work spans the full stack: UI, design
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
2. **Barbers** see their day on a mobile-first "Mi día" timeline: appointments,
   walk-ins, and gaps, all in one column.
3. **Owners** get a dashboard for the day, week, and month, covering revenue,
   no-show tracking, services, team, clients, loyalty programs, announcements,
   and subscription management.

Everything is mobile-first. The web app is a PWA: installable on home screens,
works offline for the data already cached, and pushes notifications when a slot
opens up or a turn arrives.

## Architecture

A short tour of the parts that took the most thinking:

- **Multi-tenant data with Row-Level Security.** A single Postgres schema isolates
  every shop's data at the row level via Supabase RLS. Policies are written to
  avoid self-referencing patterns, which cause infinite recursion the first time
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
- **Observability without noise.** Errors are categorized at capture time:
  validation failures, RPC failures, expected business outcomes
  (rate-limited, subscription expired), and truly unexpected errors. Only the
  last category alerts; the rest stay in structured logs. This was the
  difference between "200 Sentry pings a day" and "one alert that actually
  matters."
- **Timezone discipline.** Vercel runs in UTC. Costa Rica doesn't. Every API
  route that filters by day or month computes its range using half-open UTC
  intervals derived from the business's local time zone, never the server's.
  CI lints for the dangerous patterns. This eliminated a class of "the 7pm
  appointment disappeared" bugs.

## Selected features

The product is built around two audiences with very different needs: the
client booking from a barbershop's public site, and the owner running their
business from one dashboard. Both views share a mobile-first design system,
dark default, and the same Supabase backend.

### Public booking flow

Four steps, no account required to reach the end. Designed to feel as
effortless as ordering food.

<div class="cs-shots cs-shots--3">
  <figure class="shot shot--mobile">
    <img src="{{ '/assets/img/projects/barberapp/booking-1-services.png' | relative_url }}" alt="Booking step one: a list of services with prices, with the business name and open status at the top." width="375" height="812" loading="lazy" decoding="async">
    <figcaption class="mono">01. Pick a service</figcaption>
  </figure>
  <figure class="shot shot--mobile">
    <img src="{{ '/assets/img/projects/barberapp/booking-2-datetime.png' | relative_url }}" alt="Booking step two: barber picker on top, date carousel below, time slots in a Mañana/Tarde split." width="375" height="812" loading="lazy" decoding="async">
    <figcaption class="mono">02. Pick a barber, day, and time</figcaption>
  </figure>
  <figure class="shot shot--mobile">
    <img src="{{ '/assets/img/projects/barberapp/booking-3-info.png' | relative_url }}" alt="Booking step three: a clean contact form with phone placeholder using safe demo numbers, and a Google OAuth option." width="375" height="812" loading="lazy" decoding="async">
    <figcaption class="mono">03. Drop name and phone</figcaption>
  </figure>
</div>

### Owner workspace

Day, week, and month appointments, revenue, no-show tracking, team
management, services, clients, loyalty, announcements, and subscription:
all on a mobile-first layout that runs from any phone.

<div class="cs-shots cs-shots--2">
  <figure class="shot shot--mobile">
    <img src="{{ '/assets/img/projects/barberapp/owner-dashboard.png' | relative_url }}" alt="Owner dashboard with today's appointments and revenue KPIs, plus a share link to the booking page." width="375" height="812" loading="lazy" decoding="async">
    <figcaption class="mono">Owner home</figcaption>
  </figure>
  <figure class="shot shot--mobile">
    <img src="{{ '/assets/img/projects/barberapp/owner-week.png' | relative_url }}" alt="Owner appointments calendar in week mode, with day-by-day breakdown and filter pills." width="375" height="812" loading="lazy" decoding="async">
    <figcaption class="mono">Week calendar</figcaption>
  </figure>
  <figure class="shot shot--mobile">
    <img src="{{ '/assets/img/projects/barberapp/owner-menu.png' | relative_url }}" alt="Side navigation with Operación and Crecimiento sections: services, appointments, team, clients, blocks, expenses, analytics, loyalty, announcements." width="375" height="812" loading="lazy" decoding="async">
    <figcaption class="mono">Full feature breadth</figcaption>
  </figure>
  <figure class="shot shot--mobile">
    <img src="{{ '/assets/img/projects/barberapp/owner-services.png' | relative_url }}" alt="Services management view with categories, search, and a list of services showing price, duration, and booking counts." width="375" height="812" loading="lazy" decoding="async">
    <figcaption class="mono">Services management</figcaption>
  </figure>
</div>

## Decisions worth sharing

A few choices that aren't visible from the screenshots.

<div class="decisions">
  <article class="decision">
    <p class="decision__num mono">01</p>
    <h3 class="decision__title">Apple-HIG mobile baseline</h3>
    <p class="decision__body">
      44 px touch targets, bottom sheets for any overlay-like context, swipeable
      rows for destructive actions, a sticky two-row header on calendar views,
      and inline KPI text rather than card-like KPI containers. The product
      feels native because it picked one platform's conventions and committed.
    </p>
  </article>

  <article class="decision">
    <p class="decision__num mono">02</p>
    <h3 class="decision__title">Booking state restoration after OAuth</h3>
    <p class="decision__body">
      A subtle but high-traffic bug: when a user signs in mid-booking, restoring
      the flow has to downgrade the step if the time slot is no longer valid.
      The page now ships with a runtime invariant that auto-corrects mismatched
      state instead of rendering a blank screen.
    </p>
  </article>

  <article class="decision">
    <p class="decision__num mono">03</p>
    <h3 class="decision__title">Server-side enforcement of operational rules</h3>
    <p class="decision__body">
      UI-level guards aren't enough. Booking, closures, expired offers: every
      state transition runs through a server-side check, written assuming a
      hostile client.
    </p>
  </article>

  <article class="decision">
    <p class="decision__num mono">04</p>
    <h3 class="decision__title">CI gates for the patterns that bite</h3>
    <p class="decision__body">
      <code>lint:tz</code> blocks any new code that treats day/month boundaries
      in server time. <code>lint:adapter</code> catches JSONB columns being
      read without the canonical adapter. Both rules were added the day after
      the bug they prevent.
    </p>
  </article>
</div>

## What I optimize for

The product is on a budget (both money and design entropy). The constraints I
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
