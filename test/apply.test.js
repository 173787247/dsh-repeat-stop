import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { apply } from "../index.js";

function mockCtx() {
  const guards = [];
  const handlers = {};
  return {
    tools: {
      guard(fn) {
        guards.push(fn);
      },
    },
    on(name, fn) {
      handlers[name] = fn;
    },
    guards,
    handlers,
  };
}

function call(agent, name, args) {
  return { agent, name, arguments: args };
}

describe("apply", () => {
  it("blocks the call after the threshold of identical tools", () => {
    const ctx = mockCtx();
    apply(ctx, { threshold: 2, exclude: [] });
    const agent = {};
    const guard = ctx.guards[0];
    assert.equal(guard(call(agent, "bash", { command: "ls" })), undefined);
    assert.equal(guard(call(agent, "bash", { command: "ls" })), undefined);
    assert.match(guard(call(agent, "bash", { command: "ls" })), /blocked bash after 2/);
  });

  it("resets the streak after a real user message", () => {
    const ctx = mockCtx();
    apply(ctx, { threshold: 2, exclude: [] });
    const agent = {};
    const guard = ctx.guards[0];
    assert.equal(guard(call(agent, "bash", { command: "ls" })), undefined);
    assert.equal(guard(call(agent, "bash", { command: "ls" })), undefined);
    ctx.handlers["agent/pre-step"]({
      agent,
      messages: [{ source: { kind: "user" } }],
    }, () => {});
    assert.equal(guard(call(agent, "bash", { command: "ls" })), undefined);
  });

  it("does not install a guard when disabled", () => {
    const ctx = mockCtx();
    apply(ctx, { enabled: false, threshold: 6 });
    assert.equal(ctx.guards.length, 0);
  });

  it("loads with the default threshold when config omits it", () => {
    const ctx = mockCtx();
    apply(ctx, { exclude: [] });
    assert.equal(ctx.guards.length, 1);
  });
});
