export function readThreshold(value) {
  const n = Number(value);
  if (!Number.isInteger(n) || n < 2) {
    throw new Error("dsh-repeat-stop: threshold must be an integer >= 2");
  }
  return n;
}

export function toPatterns(list) {
  if (!Array.isArray(list)) return [];
  return list.map((pattern) => wildcardToRegExp(String(pattern)));
}

export function wildcardToRegExp(pattern) {
  const escaped = pattern.replace(/[|\\{}()[\]^$+?.]/g, "\\$&");
  return new RegExp(`^${escaped.replaceAll("*", ".*")}$`);
}

export function callKey(exec) {
  return JSON.stringify([exec.name, canonicalize(exec.arguments)]);
}

export function canonicalize(argumentsValue) {
  return JSON.stringify(sortJsonValue(argumentsValue));
}

export function sortJsonValue(value) {
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

export function nextChain(chain, key) {
  const count = chain !== undefined && chain.key === key ? chain.count + 1 : 1;
  return { key, count };
}

export function tracked(toolName, includePatterns, excludePatterns) {
  if (includePatterns.length > 0 && !includePatterns.some((re) => re.test(toolName))) {
    return false;
  }
  return !excludePatterns.some((re) => re.test(toolName));
}
