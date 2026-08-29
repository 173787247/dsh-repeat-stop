# dsh-repeat-stop

DeepSeek Harness plugin: **hard-stop** consecutive identical tool calls (same tool + same arguments).

Pairs with [dsh-tool-budget](https://github.com/173787247/dsh-tool-budget). Part of **[dsh-wsl-kit](https://github.com/173787247/dsh-wsl-kit)**.

[中文说明 ↓](#中文)

---

## English

### Why

Official `repeat-tool-reminder` only advises and never blocks. Agents can still spin on the same failing call. This plugin **denies** the next call after a streak.

Default: **6** identical calls may run; the **7th** is blocked. Changing args/tool or a real user message resets the streak.

### Install

```sh
dsh plugin --profile web add github:173787247/dsh-repeat-stop
```

Restart `dsh web`. No new tool appears. When it fires, Trajectory shows `dsh-repeat-stop: blocked`.

### Config

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

### Test

```sh
npm test
```

### License

MIT

---

## 中文

### 为什么需要

官方重复提醒只劝不停。本插件在「同一工具 + 同一参数」连续达到阈值后**硬拦截**，避免 Agent 原地空转。

默认连续 6 次可执行，第 7 次拒绝。换参数、换工具或用户再发消息会清零。

### 安装

```sh
dsh plugin --profile web add github:173787247/dsh-repeat-stop
```

触发时 Trajectory 出现 `dsh-repeat-stop: blocked`。

### 与 tool-budget 的区别

| 插件 | 拦截对象 |
|------|----------|
| `dsh-repeat-stop` | 连续相同调用 |
| `dsh-tool-budget` | 整场会话工具总次数 |

### 许可

MIT
