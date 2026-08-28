# TAKEO — Agent Instructions

## Project

TAKEO is a modern ordering platform for food businesses.

## Architecture

The project has two separate experiences:

- Public customer web
- Business dashboard PWA

The customer-facing application MUST NOT be a PWA.

The dashboard MUST be implemented as a PWA.

## Tech Stack

- Next.js
- React
- TypeScript
- Tailwind CSS
- Supabase
- WhatsApp Business Cloud API

## Design

- Modern
- Minimalist
- Mobile-first
- Light and dark themes
- Warm orange as primary color
- Avoid red-heavy designs
- Avoid excessive gradients
- Use rounded cards and subtle shadows

## Important Rules

- Never expose API credentials in the client.
- Prices must always be validated server-side.
- Orders must be stored before attempting WhatsApp delivery.
- WhatsApp failures must not delete or invalidate orders.
- Do not implement Mercado Pago yet.
- Do not implement push notifications yet.
- Do not convert the public customer web into a PWA.

## Development

Before implementing a feature:

1. Check the existing architecture.
2. Reuse existing components.
3. Avoid unnecessary dependencies.
4. Keep the application responsive.
5. Maintain the existing design system.