# Art2Digi Bookings Dashboard

Private, login-protected dashboard for viewing Malmok and Capture & Pose™
bookings, and general contact form submissions — all in one place.

This repo is **art2digi-bookings** (deployed to bookings.art2digi.com).
Note: this is a different thing from the Supabase *project* also named
art2digi-bookings — this repo is the frontend code; the Supabase project
is the database it connects to. Same name, two different systems.

## Stack

- Plain HTML / CSS / vanilla JS (no build step), same pattern as
  `art2digi-hour-tracker`
- Backend: Supabase (the **art2digi-bookings** project — a separate
  Supabase project from the hour tracker's)
- Auth: Supabase Auth, single admin account, public sign-ups disabled

## Files

- `index.html` — page structure, login form + dashboard tables
- `app.js` — Supabase connection, auth, and all dashboard logic
- `css/style.css` — styling

## Setup

1. Push this repo (art2digi-bookings) to GitHub.
2. Create a new Netlify site from this repo (separate from the main
   art2digi.com site).
3. Point bookings.art2digi.com at it via DNS, same way
   tracker.art2digi.com is set up.
4. Log in with the one admin account created in Supabase Auth
   (Authentication → Users) for the art2digi-bookings Supabase project.

## Notes

- This dashboard's security comes from Supabase Row Level Security and
  Auth, not from the URL being secret. Only a logged-in authenticated
  user can read from the `bookings` and `contacts` tables.
- Changing a booking's payment status to "Cancelled" automatically frees
  up its slot — the booking system counts only active (non-cancelled)
  bookings against a slot's capacity.

