# dsh-repeat-stop

DeepSeek Harness plugin: **hard-stop** consecutive identical tool calls (same tool + same arguments).

Pairs with [dsh-tool-budget](https://github.com/173787247/dsh-tool-budget). Part of **[dsh-wsl-kit](https://github.com/173787247/dsh-wsl-kit)**.

[中文说明 → README.zh.md](./README.zh.md)

---
## Compatibility

| Field | Value |
|-------|-------|
| **Plugin** | `dsh-repeat-stop` **0.1.1** |
| **Minimum dsh** | ≥ **0.1.2** (web UI one-shot `?token=` on Windows relay `:3081`) |
| **Latest verified** | See [dsh-wsl-kit Compatibility](https://github.com/173787247/dsh-wsl-kit#compatibility-2026-09) (currently **`0.1.5-rc.1`**) — single source of truth for the suite |
| **Kit set** | `daily` (also in `github` / `full`; fetch+net also in `llm`) |
| **Cloud Flash** | Use model id **`deepseek-flash`** (V4.1 Flash) in `~/.dsh/settings.yaml` / `llm-deepseek` — not configured by this plugin |
| **Agent Teams** | Upstream experimental; not required here |

Suite floor versions: kit [`check-plugin-versions.sh`](https://github.com/173787247/dsh-wsl-kit/blob/master/scripts/check-plugin-versions.sh). Fault tree: [TROUBLESHOOTING.md](https://github.com/173787247/dsh-wsl-kit/blob/master/docs/TROUBLESHOOTING.md).

## Why

Official `repeat-tool-reminder` only advises and never blocks. Agents can still spin on the same failing call. This plugin **denies** the next call after a streak.

Default: **6** identical calls may run; the **7th** is blocked. Changing args/tool or a real user message resets the streak.

## Install

```sh
dsh plugin --profile web add github:173787247/dsh-repeat-stop
```

Restart `dsh web`. No new tool appears. When it fires, Trajectory shows `dsh-repeat-stop: blocked`.

## Config

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
    # include: []   # if set, only these names (wildcards ok) are tracked
```

| Key | Default | Meaning |
|-----|---------|---------|
| `enabled` | `true` | Master switch |
| `threshold` | `6` | Allowed streak; next call blocked (integer ≥ 2) |
| `exclude` | job_* | Names that never count |
| `include` | (empty) | If set, only these names are tracked |

## vs dsh-tool-budget

| Plugin | What it blocks |
|--------|----------------|
| `dsh-repeat-stop` | Consecutive identical calls |
| `dsh-tool-budget` | Total tool calls in the whole session |

## Test

```sh
npm test
```

## License

MIT
