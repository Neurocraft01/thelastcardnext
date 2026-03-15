import assert from "node:assert/strict";
import test from "node:test";
import { ACCESS_COOKIE, REFRESH_COOKIE } from "../lib/auth";
import { DELETE, POST } from "../app/api/auth/session/route";

test("auth session POST sets access and refresh cookies", async () => {
  const request = new Request("http://localhost/api/auth/session", {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": "127.0.0.1" },
    body: JSON.stringify({
      accessToken: "a".repeat(24),
      refreshToken: "b".repeat(24),
    }),
  });

  const response = await POST(request);
  assert.equal(response.status, 200);

  const setCookie = response.headers.get("set-cookie") ?? "";
  assert.equal(setCookie.includes(ACCESS_COOKIE), true);
  assert.equal(setCookie.includes(REFRESH_COOKIE), true);
});

test("auth session DELETE clears cookies", async () => {
  const response = await DELETE();
  assert.equal(response.status, 200);

  const setCookie = response.headers.get("set-cookie") ?? "";
  assert.equal(setCookie.includes(`${ACCESS_COOKIE}=`), true);
  assert.equal(setCookie.includes(`${REFRESH_COOKIE}=`), true);
});
