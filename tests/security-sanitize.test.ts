import assert from "node:assert/strict";
import test from "node:test";
import { sanitizeText } from "../lib/security";

test("sanitizeText strips angle brackets", () => {
  assert.equal(sanitizeText("<script>alert(1)</script>"), "scriptalert(1)/script");
});

test("sanitizeText trims spaces", () => {
  assert.equal(sanitizeText("  hello  "), "hello");
});
