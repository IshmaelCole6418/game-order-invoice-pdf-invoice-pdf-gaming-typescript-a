import assert from "node:assert/strict";
import test from "node:test";
import { renderInvoice, orderSchema } from "./invoice_service.ts";

test("invoice makes the moderation decision visible", () => {
  const order = orderSchema.parse({ orderId: "o-1", playerEmail: "student@example.com", playerName: "Ari", courseTitle: "Design Quest", amount: 10, currency: "USD", generatedAssets: [{ name: "map", kind: "image" }, { name: "badge", kind: "image" }], liveEvents: [{ name: "quiz-passed", occurredAt: "2026-01-01" }], moderationQueue: [{ assetName: "map", state: "approved" }, { assetName: "badge", state: "pending" }] });
  const html = renderInvoice(order);
  assert.match(html, /Player assets approved: 1\/2/);
  assert.match(html, /Live events recorded: 1/);
});
