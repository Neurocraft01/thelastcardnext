import assert from "node:assert/strict";
import test from "node:test";
import { hasRequiredRole } from "../lib/auth";

test("role hierarchy allows superadmin over admin and customer", () => {
  assert.equal(hasRequiredRole("superadmin", "admin"), true);
  assert.equal(hasRequiredRole("superadmin", "customer"), true);
});

test("role hierarchy blocks customer from admin", () => {
  assert.equal(hasRequiredRole("customer", "admin"), false);
});

test("role hierarchy allows exact role", () => {
  assert.equal(hasRequiredRole("admin", "admin"), true);
});
