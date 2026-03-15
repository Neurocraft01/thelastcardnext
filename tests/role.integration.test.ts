import assert from "node:assert/strict";
import test from "node:test";
import { POST as superadminRolesPost } from "../app/api/superadmin/roles/route";

test("superadmin role assignment endpoint rejects unauthenticated requests", async () => {
  const request = new Request("http://localhost/api/superadmin/roles", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-forwarded-for": "127.0.0.1",
    },
    body: JSON.stringify({
      email: "user@example.com",
      role: "admin",
    }),
  });

  const response = await superadminRolesPost(request);
  assert.equal(response.status, 401);
  assert.equal(Boolean(response.headers.get("x-request-id")), true);
});
