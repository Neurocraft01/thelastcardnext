import crypto from "node:crypto";

type LogLevel = "info" | "warn" | "error";

type LogPayload = {
  requestId: string;
  route: string;
  level: LogLevel;
  message: string;
  data?: unknown;
};

export function getRequestId(request: Request) {
  return request.headers.get("x-request-id") ?? crypto.randomUUID();
}

export function logEvent(payload: LogPayload) {
  const event = {
    ts: new Date().toISOString(),
    requestId: payload.requestId,
    route: payload.route,
    level: payload.level,
    message: payload.message,
    data: payload.data,
  };

  const serialized = JSON.stringify(event);
  if (payload.level === "error") {
    console.error(serialized);
    return;
  }
  if (payload.level === "warn") {
    console.warn(serialized);
    return;
  }
  console.log(serialized);
}

export async function alertCritical(input: {
  requestId: string;
  route: string;
  message: string;
  data?: unknown;
}) {
  const webhookUrl = process.env.ALERT_WEBHOOK_URL;
  if (!webhookUrl) {
    return;
  }

  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        severity: "critical",
        ts: new Date().toISOString(),
        requestId: input.requestId,
        route: input.route,
        message: input.message,
        data: input.data,
      }),
    });
  } catch (error) {
    console.error(
      JSON.stringify({
        ts: new Date().toISOString(),
        level: "error",
        route: input.route,
        requestId: input.requestId,
        message: "Critical alert webhook failed",
        data: String(error),
      }),
    );
  }
}
