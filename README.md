# Gabin Warung Umi

A responsive, premium snack storefront built with React, TypeScript, Vite,
Tailwind CSS v4, Motion, and Lucide. Product imagery and typography are hosted
locally. No external service is called during browsing.

## Run

```sh
npm install
npm run dev
npm run build
```

Deploy the generated `dist/` directory to any static host.

## Ordering

The bag persists on the customer's device. Checkout validates the customer's
details and generates an itemized WhatsApp request with quantities, subtotal,
delivery or pickup preference, and notes. It does not collect payment or claim
that an order is confirmed. Customer details remain in memory until the customer
chooses to share the request through WhatsApp.

Copy `.env.example` to `.env.local` and set `VITE_ORDER_WHATSAPP` to the merchant's
WhatsApp number in international digits-only format. Rebuild after changing it.
Without a configured number, WhatsApp opens a recipient selector instead.

The integration follows the official WhatsApp click-to-chat format:
https://faq.whatsapp.com/5913398998672934/

## Before Launch

- Confirm the proposed flavor names, ingredients, allergen details, pack sizes,
  prices, bundle discounts, storage guidance, and business claims with the owner.
- Replace the illustrative customer quotes with authentic, approved testimonials.
- The five food photographs are AI-generated concept imagery. Replace them with
  verified product photography if the actual products differ.
- Configure the merchant WhatsApp number and test a real order on the merchant's
  phone. Availability, delivery charges, and payment are confirmed in chat.
- Set an absolute Open Graph image URL for the final deployment domain if needed.
- Online card payments, inventory, and an order-management backend are not included.

Brand and product content is in `src/App.tsx`; the visual system is in
`src/index.css`; images and fonts are in `public/`.

## Verification

```sh
npx tsc --noEmit
npx playwright install --with-deps chromium
npx playwright test
npm run build && TEST_PRODUCTION=1 npx playwright test
npm audit
```

The browser suite covers desktop and mobile layouts, filters and keyboard tabs,
product details, persistent bag and quantity controls, box selection, FAQs,
delivery and pickup checkout, modal focus management, mobile navigation, and
automated WCAG accessibility checks.

## Type Licenses

DM Sans, DM Serif Display, and Outfit are distributed under the SIL Open Font
License. Their license files are in `public/fonts/`.
