import {
  callKey,
  nextChain,
  readThreshold,
  toPatterns,
  tracked,
} from "./lib/repeat.js";

export const name = "dsh-repeat-stop";
export const inject = ["tools"];

export function apply(ctx, config = {}) {
  const enabled = config.enabled !== false;
  const threshold = readThreshold(config.threshold);
  const excludePatterns = toPatterns(config.exclude ?? ["job_output", "job_list", "job_kill"]);
  const includePatterns = toPatterns(config.include ?? []);
  const chains = new WeakMap();
  const counted = new WeakSet();

  if (!enabled) {
    console.log("[dsh-repeat-stop] disabled");
    return;
  }

  console.log(`[dsh-repeat-stop] loaded threshold=${threshold}`);

  function observe(exec) {
    if (!exec.agent || !tracked(exec.name, includePatterns, excludePatterns)) return undefined;
    if (counted.has(exec)) return chains.get(exec.agent);
    counted.add(exec);
    const key = callKey(exec);
    const next = nextChain(chains.get(exec.agent), key);
    chains.set(exec.agent, next);
    return next;
  }

  ctx.tools.guard((exec) => {
    const chain = observe(exec);
    if (!chain || chain.count <= threshold) return undefined;
    return [
      `dsh-repeat-stop: blocked ${exec.name} after ${threshold} consecutive identical calls.`,
      "Change the arguments, use a different tool, or finish the task.",
      `count=${chain.count} threshold=${threshold}`,
    ].join(" ");
  });

  ctx.on("tools/post-execute", async (exec, _result, next) => {
    observe(exec);
    return next();
  });

  ctx.on("agent/pre-step", ({ agent, messages }, next) => {
    if (messages.some((message) => message.source?.kind === "user")) {
      chains.delete(agent);
    }
    return next();
  });
}
