import assert from "node:assert/strict";
import test from "node:test";
import { POST as uploadSignaturePost } from "../app/api/upload/signature/route";

test("upload signature endpoint rejects unauthenticated requests", async () => {
  const request = new Request("http://localhost/api/upload/signature", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-forwarded-for": "127.0.0.1",
    },
    body: JSON.stringify({
      assetType: "profile",
      filename: "avatar.png",
      fileSize: 1024,
      mimeType: "image/png",
    }),
  });

  const response = await uploadSignaturePost(request);
  assert.equal(response.status, 401);
  assert.equal(Boolean(response.headers.get("x-request-id")), true);
});
