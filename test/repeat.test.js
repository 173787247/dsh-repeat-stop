import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  callKey,
  canonicalize,
  nextChain,
  readThreshold,
  toPatterns,
  tracked,
  wildcardToRegExp,
} from "../lib/repeat.js";

describe("readThreshold", () => {
  it("accepts integers >= 2", () => {
    assert.equal(readThreshold(6), 6);
    assert.equal(readThreshold("8"), 8);
  });

  it("rejects values below 2", () => {
    assert.throws(() => readThreshold(1), /threshold/);
    assert.throws(() => readThreshold(1.5), /threshold/);
  });
});

describe("wildcardToRegExp", () => {
  it("matches a literal tool name", () => {
    assert.equal(wildcardToRegExp("bash").test("bash"), true);
    assert.equal(wildcardToRegExp("bash").test("bash2"), false);
  });

  it("treats * as a glob", () => {
    const re = wildcardToRegExp("job_*");
    assert.equal(re.test("job_output"), true);
    assert.equal(re.test("net_doctor"), false);
  });
});

describe("tracked", () => {
  it("skips excluded names", () => {
    const exclude = toPatterns(["job_output", "job_*"]);
    assert.equal(tracked("job_list", [], exclude), false);
    assert.equal(tracked("bash", [], exclude), true);
  });

  it("limits tracking to include when set", () => {
    const include = toPatterns(["bash", "read_*"]);
    assert.equal(tracked("bash", include, []), true);
    assert.equal(tracked("read_file", include, []), true);
    assert.equal(tracked("net_doctor", include, []), false);
  });
});

describe("canonicalize", () => {
  it("sorts object keys so argument order does not reset the streak", () => {
    assert.equal(
      canonicalize({ b: 1, a: 2 }),
      canonicalize({ a: 2, b: 1 }),
    );
  });
});

describe("callKey", () => {
  it("includes the tool name and canonical arguments", () => {
    const a = callKey({ name: "bash", arguments: { command: "ls", cwd: "." } });
    const b = callKey({ name: "bash", arguments: { cwd: ".", command: "ls" } });
    const c = callKey({ name: "bash", arguments: { command: "pwd" } });
    assert.equal(a, b);
    assert.notEqual(a, c);
  });
});

describe("nextChain", () => {
  it("increments only while the key stays the same", () => {
    const first = nextChain(undefined, "a");
    const second = nextChain(first, "a");
    const reset = nextChain(second, "b");
    assert.deepEqual(first, { key: "a", count: 1 });
    assert.deepEqual(second, { key: "a", count: 2 });
    assert.deepEqual(reset, { key: "b", count: 1 });
  });
});
