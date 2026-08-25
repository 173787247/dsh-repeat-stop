# dsh-repeat-stop

DeepSeek Harness plugin: **hard-stop** consecutive identical tool calls.

Official `repeat-tool-reminder` only advises (default at 3 / 5 / 8) and never blocks. After a streak of the same tool with the same arguments, this plugin **denies the next call** so the agent cannot spin in place.

默认：连续 **6** 次相同调用可以执行，**第 7 次**被拦。换参数、换工具、或用户再发一条消息都会清零计数。

## Install

```sh
dsh plugin --profile web add github:173787247/dsh-repeat-stop
# or a local checkout:
dsh plugin --profile web add /absolute/path/to/dsh-repeat-stop
```

Restart `dsh web`. No new tool appears. When it fires, Trajectory shows a tool error starting with `dsh-repeat-stop: blocked`.

Counting happens in the synchronous tool guard, so a single turn that fires the same concurrent-safe call many times (for example `net_doctor`) is still capped.

## Topics

On GitHub, add `dsh-plugin`.

## Config

Override the whole row in the profile `cordis.patch.yml`:

```yaml
- id: dsh-repeat-stop
  name: dsh-repeat-stop
  config:
    enabled: true
    threshold: 6
    exclude:
      - job_output
      - job_list
      - job_kill
```

| Key | Default | Meaning |
|---|---|---|
| `enabled` | `true` | Set `false` to disable. |
| `threshold` | `6` | How many identical calls may run; the next one is blocked. Integer >= 2; invalid values fall back to 6. |
| `exclude` | `job_output`, `job_list`, `job_kill` | Tool-name wildcards that never count or block. |
| `include` | (empty) | If set, only these names are tracked. |

A real user message resets the streak (same as the official reminder). Denied repeats still count, so hammering the same call stays blocked until the arguments change or the user speaks. Missing tool arguments count as `{}`.

## Test

```sh
npm test
```

## Changelog

- **0.1.1** — unit tests; invalid threshold no longer crashes load; missing arguments match `{}`.
- **0.1.0** — first release: deny after a streak of identical tool calls.
