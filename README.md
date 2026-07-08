# TIFO Landing

Landing page for **TIFO**, a peer-to-peer living terrace for football fans.

The site presents the product story, Echo replay concept, local-first architecture, QVAC on-device translation, Pear-powered peer-to-peer networking, and links to the open-source desktop app.

## Links

- TIFO app repo: https://github.com/hicksonhaziel/tifo
- Latest app release: https://github.com/hicksonhaziel/tifo/releases/latest
- Pear documentation: https://docs.pears.com/
- QVAC documentation: https://docs.qvac.tether.io/

## Stack

- Next.js
- React
- Tailwind CSS/PostCSS
- Static image assets in `public/assets`

## Local Development

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open http://localhost:3000.

## Build

Create a production build:

```bash
npm run build
```

Run the production server locally:

```bash
npm start
```

## Project Structure

- `app/page.js` - main landing page experience and link targets.
- `app/globals.css` - global styling, responsive layout, and animation styles.
- `app/layout.js` - metadata, fonts, favicon, and root layout.
- `public/assets` - TIFO, Pear, QVAC, hero, mesh, and atmosphere assets.

## Link Targets

The external URLs used by the page are centralized at the top of `app/page.js`:

```js
const APP_REPO_URL = "https://github.com/hicksonhaziel/tifo";
const APP_CLONE_URL = "https://github.com/hicksonhaziel/tifo.git";
const RELEASES_URL = "https://github.com/hicksonhaziel/tifo/releases/latest";
const PEARS_DOCS_URL = "https://docs.pears.com/";
const QVAC_DOCS_URL = "https://docs.qvac.tether.io/";
```
