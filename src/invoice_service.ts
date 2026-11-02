import { z } from "zod";
import { InfraiClient } from "./infrai_client.ts";

export const orderSchema = z.object({
  orderId: z.string().min(1), playerEmail: z.string().email(), playerName: z.string().min(1),
  courseTitle: z.string().min(1), amount: z.number().nonnegative(), currency: z.string().length(3),
  generatedAssets: z.array(z.object({ name: z.string(), kind: z.string() })),
  liveEvents: z.array(z.object({ name: z.string(), occurredAt: z.string() })),
  moderationQueue: z.array(z.object({ assetName: z.string(), state: z.enum(["approved", "pending", "rejected"]) }))
});
export type GameOrder = z.infer<typeof orderSchema>;

export function renderInvoice(order: GameOrder): string {
  const approved = order.moderationQueue.filter((item) => item.state === "approved").length;
  return `<h1>Learning game receipt</h1><p>Order ${order.orderId}</p><p>Player: ${order.playerName}</p><p>Course: ${order.courseTitle}</p><p>Total: ${order.currency} ${order.amount.toFixed(2)}</p><p>Player assets approved: ${approved}/${order.generatedAssets.length}</p><p>Live events recorded: ${order.liveEvents.length}</p>`;
}

export async function createAndEmailInvoice(orderInput: unknown, client = new InfraiClient(process.env.INFRAI_API_KEY ?? "")) {
  const order = orderSchema.parse(orderInput);
  const html = renderInvoice(order);
  const pdf = await client.generatePdf(html, `invoice-${order.orderId}`);
  const pdfReference = pdf.url ?? pdf.job_id ?? "generated-pdf";
  const email = await client.sendEmail(order.playerEmail, `Invoice ${order.orderId}`, `${html}<p>PDF: ${pdfReference}</p>`, `invoice-email-${order.orderId}`);
  return { orderId: order.orderId, pdfReference, messageId: email.message_id };
}

if (process.argv[1]?.endsWith("invoice_service.ts")) {
  const sample: GameOrder = { orderId: "order-204", playerEmail: "learner@example.com", playerName: "Mina", courseTitle: "World Building 101", amount: 24, currency: "USD", generatedAssets: [{ name: "castle", kind: "image" }], liveEvents: [{ name: "lesson-finished", occurredAt: "2026-01-01T10:00:00Z" }], moderationQueue: [{ assetName: "castle", state: "approved" }] };
  console.log(renderInvoice(orderSchema.parse(sample)));
}
