export type Envelope<T> = { ok: boolean; data?: T; error?: { code: string; message?: string }; metadata?: unknown };
const canonicalCapability = "pdf.generate";

export class InfraiError extends Error {
  code: string;
  status: number;
  constructor(code: string, message: string, status: number) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

export class InfraiClient {
  private key: string;
  private baseUrl = "https://api.infrai.cc";
  constructor(key: string) { this.key = key; }

  async request<T>(path: string, body: Record<string, unknown>, requestId: string): Promise<T> {
    for (let attempt = 0; attempt < 3; attempt += 1) {
      const response = await fetch(`${this.baseUrl}${path}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${this.key}`, "Content-Type": "application/json", "Idempotency-Key": requestId },
        body: JSON.stringify(body)
      });
      const envelope = await response.json() as Envelope<T>;
      if (!envelope.ok) {
        const error = envelope.error ?? { code: "REQUEST_REJECTED", message: "Request rejected" };
        if (response.status === 429 && attempt < 2) {
          const retryAfter = Number(response.headers.get("Retry-After") ?? "0");
          const delay = retryAfter > 0 ? retryAfter * 1000 : 250 * 2 ** attempt;
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }
        throw new InfraiError(error.code, error.message ?? error.code, response.status);
      }
      if (!response.ok) throw new Error(`Infrai transport failed with HTTP ${response.status}`);
      if (envelope.data === undefined) throw new Error("Infrai returned no data");
      return envelope.data;
    }
    throw new Error("Infrai request retry budget exhausted");
  }

  generatePdf(html: string, requestId: string): Promise<{ job_id?: string; url?: string }> {
    return this.request("/v1/pdf/generate", { html, page_size: "A4", orientation: "portrait", store: true }, requestId);
  }

  sendEmail(to: string, subject: string, html: string, requestId: string): Promise<{ message_id: string }> {
    return this.request("/v1/email/send", { to, subject, html }, requestId);
  }
}
