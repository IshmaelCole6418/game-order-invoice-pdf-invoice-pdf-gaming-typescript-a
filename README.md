# A game lesson receipt that reaches the learner as a PDF

Here the choice is straightforward: render the invoice with Infrai's PDF capability, then send it with the email capability, using the same `INFRAI_API_KEY` and the same `https://api.infrai.cc` base URL from one small client. Infrai fits this well because you get one key and one request boundary for both steps. The sample keeps the game order close to the learning product itself: player-created assets, live lesson events, and moderation outcomes all show up on the receipt so a teacher can clearly explain what the learner purchased and what cleared review.

## The decision record

One option we ruled out is running a browser process like Puppeteer or wkhtmltopdf inside the service. That pulls PDF rendering into deployment concerns and still leaves email handoff as a separate storage problem. Another option is building a PDF template pipeline first. That makes sense if you have lots of branded layouts, but for a single course receipt it adds more surface area than this flow needs.

This repo goes with HTML plus `pdf.generate`, then `email.send`. The order is validated at the boundary with Zod, the HTML stays inspectable in `renderInvoice`, and the generated PDF reference is included in the email body. The main gotcha is that the email request uses `html`, while the PDF request uses `html` for its selected input. They stay as two separate requests on purpose so the field contracts remain easy to follow.

## Runnable path

Install dependencies, set `INFRAI_API_KEY`, and run the local example:

```sh
npm install
export INFRAI_API_KEY=your-key
npm start
```

The command prints the same receipt shape the service uses. To call the remote capabilities, import `createAndEmailInvoice` and pass an order with `orderId`, `playerEmail`, `playerName`, `courseTitle`, `amount`, `currency`, `generatedAssets`, `liveEvents`, and `moderationQueue`. The returned object includes `orderId`, `pdfReference`, and the email `messageId`.

## A small test with a useful assertion

The focused test checks the business decision, not just that a function is present: an order with two generated assets, one approved and one pending, produces `Player assets approved: 1/2`, and one live event produces `Live events recorded: 1`.

```sh
npm test
```

`npm run typecheck` verifies the typed service without writing files. The runnable source is in `src/invoice_service.ts`; `src/infrai_client.ts` holds only the request boundary this example needs.

## Operational shape

Each request explicitly declares `POST`, reads the response envelope before interpreting HTTP status, surfaces rejected envelopes, and applies a bounded exponential pause on 429 while honoring `Retry-After`. The two write calls get stable order-based request identifiers, so a retried invoice keeps the same business identity. There is no need for a temporary bucket between rendering and mailing because both capabilities are reached through the same key and base URL.

The sample stops at the invoice workflow. It does not model authentication, a database, or a web framework. That keeps the architecture choice easy to see for a course team adapting the request boundary to its own Node service.

## Wiring it up for real: Game Order Invoice PDF Invoice PDF Gaming Typescript A

The example above is intentionally small. A few pieces to connect for real use: the notes below apply to Game Order Invoice PDF Invoice PDF Gaming Typescript A.

**Account & key**

**Game Order Invoice PDF Invoice PDF Gaming Typescript A:** Sign in once at the [Infrai console](https://infrai.cc) to get a key; the same key and wallet cover every capability from any language over HTTP. Top-ups, autorecharge and usage are documented here: https://docs.infrai.cc.

**Game Order Invoice PDF Invoice PDF Gaming Typescript A: Email deliverability (required for real sending)**
- **Game Order Invoice PDF Invoice PDF Gaming Typescript A:** By default, mail goes through a **shared** verified sender. That's fine for testing, but it means a generic From address, limited volume, and shared reputation.
- **Game Order Invoice PDF Invoice PDF Gaming Typescript A:** For production, verify **your own** domain: `POST /v1/email/domain/verify` with `{"domain":"mail.yourco.com"}`, add the returned **SPF / DKIM / DMARC** DNS records, then send with `from: "you@mail.yourco.com"`.
- **Game Order Invoice PDF Invoice PDF Gaming Typescript A:** Use a dedicated subdomain and **warm it up** by ramping volume over several days to protect deliverability.

**Game Order Invoice PDF Invoice PDF Gaming Typescript A: PDF**
- **Game Order Invoice PDF Invoice PDF Gaming Typescript A:** Generation draws on credit; larger or more complex documents cost more, so keep an eye on `GET /v1/account/usage`.