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

  function tracked(toolName) {
    if (includePatterns.length > 0 && !includePatterns.some((re) => re.test(toolName))) {
      return false;
    }
    return !excludePatterns.some((re) => re.test(toolName));
  }

  function observe(exec) {
    if (!exec.agent || !tracked(exec.name)) return undefined;
    if (counted.has(exec)) return chains.get(exec.agent);
    counted.add(exec);
    const key = callKey(exec);
    const chain = chains.get(exec.agent);
    const count = chain !== undefined && chain.key === key ? chain.count + 1 : 1;
    const nextChain = { key, count };
    chains.set(exec.agent, nextChain);
    return nextChain;
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

function readThreshold(value) {
  const n = Number(value);
  if (!Number.isInteger(n) || n < 2) {
    throw new Error("dsh-repeat-stop: threshold must be an integer >= 2");
  }
  return n;
}

function toPatterns(list) {
  if (!Array.isArray(list)) return [];
  return list.map((pattern) => wildcardToRegExp(String(pattern)));
}

function wildcardToRegExp(pattern) {
  const escaped = pattern.replace(/[|\\{}()[\]^$+?.]/g, "\\$&");
  return new RegExp(`^${escaped.replaceAll("*", ".*")}$`);
}

function callKey(exec) {
  return JSON.stringify([exec.name, canonicalize(exec.arguments)]);
}

function canonicalize(argumentsValue) {
  return JSON.stringify(sortJsonValue(argumentsValue));
}

function sortJsonValue(value) {
  if (Array.isArray(value)) return value.map(sortJsonValue);
  if (value !== null && typeof value === "object") {
    const sorted = {};
    for (const key of Object.keys(value).sort()) {
      sorted[key] = sortJsonValue(value[key]);
    }
    return sorted;
  }
  return value;
}
