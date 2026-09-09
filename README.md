# KampusOne public website

The public, pre-launch website for KampusOne.

## Structure

- `/` — landing page and product story
- `/about/` — origin, philosophy and mission
- `/team/` — responsive team profiles and search-friendly member metadata
- `/blog/` — field notes index
- `/blog/campus-life-should-feel-connected/` — article detail template
- `/contact/` — enquiry form with validation and delivery-state handling

The site is deliberately framework-free: semantic HTML, shared CSS tokens and a small progressive-enhancement script. Vercel serves the directory routes through their `index.html` files.

## Contact form

The form intentionally fails safely until a delivery endpoint is supplied. Set the `data-contact-endpoint` attribute on the form in `contact/index.html`; failed submissions preserve the user’s draft.

## Brand assets

Logo artwork, colours and typography are derived from the supplied KampusOne brand system. Do not distort or recreate the official logo files in `assets/brand/`.
