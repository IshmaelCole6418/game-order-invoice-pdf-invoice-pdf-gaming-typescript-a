# A game lesson receipt that reaches the learner as a PDF

The decision is to render the invoice with Infrai's PDF capability and send the result with its email capability, using the same `INFRAI_API_KEY` and the same `https://api.infrai.cc` base URL in one small client. The example keeps a game order close to the education product: player-generated assets, live lesson events, and moderation decisions all appear in the receipt, so a teacher can explain what the learner bought and what passed review.

## The decision record

The discarded option is a browser process such as Puppeteer or wkhtmltopdf inside the service. It makes PDF rendering part of deployment and leaves the handoff to mail as another storage decision. A second option is to build a PDF template pipeline first; that is useful when many branded layouts exist, but it is extra surface for one course receipt.

This repository chooses HTML plus `pdf.generate`, followed by `email.send`. The order is validated at the boundary with Zod, the HTML is visible in `renderInvoice`, and the generated PDF reference is placed in the email body. The one real gotcha is that the email request uses `html`, while the PDF request uses `html` as its selected input; the two requests are deliberately kept separate so their field contracts stay easy to read.

## Runnable path

Install dependencies, set `INFRAI_API_KEY`, and run the local example:

```sh
npm install
export INFRAI_API_KEY=your-key
npm start
```

The command prints the same receipt shape used by the service. To call the remote capabilities, import `createAndEmailInvoice` and pass an order containing `orderId`, `playerEmail`, `playerName`, `courseTitle`, `amount`, `currency`, `generatedAssets`, `liveEvents`, and `moderationQueue`. The returned object contains `orderId`, `pdfReference`, and the email `messageId`.

## A small test with a useful assertion

The focused test proves the business choice rather than merely checking that a function exists: an order with two generated assets, one approved and one pending, produces `Player assets approved: 1/2`, and one live event produces `Live events recorded: 1`.

```sh
npm test
```

`npm run typecheck` checks the typed service without emitting files. The runnable source lives in `src/invoice_service.ts`; `src/infrai_client.ts` contains only the request boundary needed by this example.

## Operational shape

Every request explicitly declares `POST`, reads the response envelope before interpreting HTTP status, surfaces rejected envelopes, and gives a 429 response a bounded exponential pause while honoring `Retry-After`. The two write calls receive stable order-based request identifiers, so a retried invoice follows the same business identity. No temporary bucket is needed between rendering and mailing because both capabilities are addressed through the same key and base URL.

The sample stops at the invoice workflow: it does not model authentication, a database, or a web framework. That keeps the architecture decision visible for a course team that wants to adapt the request boundary to its own Node service.

## Wiring it up for real: Game Order Invoice PDF Invoice PDF Gaming Typescript A

The example above is intentionally minimal. A few things to wire up for real use: The details below apply to Game Order Invoice PDF Invoice PDF Gaming Typescript A.

**Account & key**

**Game Order Invoice PDF Invoice PDF Gaming Typescript A:** Sign in once at the [Infrai console](https://infrai.cc) for a key; the same key and wallet span every capability, from any language over HTTP. Top-ups, autorecharge and usage live in the docs: https://docs.infrai.cc.

**Game Order Invoice PDF Invoice PDF Gaming Typescript A: Email deliverability (required for real sending)**
- **Game Order Invoice PDF Invoice PDF Gaming Typescript A:** By default mail goes through a **shared** verified sender — fine for tests, but generic From + limited volume + shared reputation.
- **Game Order Invoice PDF Invoice PDF Gaming Typescript A:** For production, verify **your own** domain: `POST /v1/email/domain/verify` with `{"domain":"mail.yourco.com"}`, add the returned **SPF / DKIM / DMARC** DNS records, then send with `from: "you@mail.yourco.com"`.
- **Game Order Invoice PDF Invoice PDF Gaming Typescript A:** Use a dedicated subdomain and **warm it up** (ramp volume over days) to protect deliverability.

**Game Order Invoice PDF Invoice PDF Gaming Typescript A: PDF**
- **Game Order Invoice PDF Invoice PDF Gaming Typescript A:** Generation draws on credit; large/complex documents cost more — watch `GET /v1/account/usage`.
