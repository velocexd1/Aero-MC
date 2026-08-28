# AeroMC Store

The official AeroMC rank & coins store. Sky blue themed Minecraft store for **play.aeromc.fun**.

## Features
- Browse & purchase Ranks and Coin packs
- Register / Login system
- Payment via GPay, bKash, Nagad, UPI
- Orders saved to shared localStorage DB (syncs with dashboard on same browser)

## Deploy
Deploy this folder to any static host (Vercel, Netlify, GitHub Pages).

## Add Logo
Replace the `nav-logo-placeholder` div in `index.html` with:
```html
<img src="your-logo.png" alt="AeroMC" />
```

## Prices
Set prices from the **AeroMC Dashboard** → Settings → Rank/Coin Prices.
Prices sync automatically via localStorage (same browser) or you can wire both to a real backend later.

## Admin Credentials (default)
- Email: `admin@aeromc.fun`
- Password: `admin123`
> Change this immediately from Dashboard → Settings → Change Admin Password
