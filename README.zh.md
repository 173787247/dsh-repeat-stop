# dsh-repeat-stop

DeepSeek Harness 插件：**硬拦截**连续相同的工具调用（同一工具 + 同一参数）。

与 [dsh-tool-budget](https://github.com/173787247/dsh-tool-budget) 搭配。属于 **[dsh-wsl-kit](https://github.com/173787247/dsh-wsl-kit)**。

[English → README.md](./README.md)

---
## 兼容性

| 项 | 值 |
|----|----|
| **插件** | `dsh-repeat-stop` **0.1.1** |
| **最低 dsh** | ≥ **0.1.2**（Windows 中继 `:3081` 一次性 `?token=`） |
| **最新验证** | 以 [dsh-wsl-kit 兼容性](https://github.com/173787247/dsh-wsl-kit#compatibility-2026-09) 为准（当前 **`0.1.5-rc.1`**）— 套件唯一真源 |
| **套件档位** | `daily`（亦含于 `github` / `full`；fetch+net 亦在 `llm`） |
| **云端 Flash** | settings / `llm-deepseek` 使用 **`deepseek-flash`**（V4.1 Flash）；本插件不配置模型 id |
| **Agent Teams** | 上游实验包；本插件不依赖 |

套件版本地板：[`check-plugin-versions.sh`](https://github.com/173787247/dsh-wsl-kit/blob/master/scripts/check-plugin-versions.sh)。故障树：[TROUBLESHOOTING.zh.md](https://github.com/173787247/dsh-wsl-kit/blob/master/docs/TROUBLESHOOTING.zh.md)。

## 为什么需要

官方 `repeat-tool-reminder` 只劝不停。Agent 仍可能对同一次失败调用空转。本插件在连续达到阈值后**拒绝**下一次调用。

默认连续 **6** 次可执行，第 **7** 次拦截。换参数、换工具，或用户再发一条真实消息，会清零计数。

## 安装

```sh
dsh plugin --profile web add github:173787247/dsh-repeat-stop
```

重启 `dsh web`。不会出现新工具。触发时 Trajectory 显示 `dsh-repeat-stop: blocked`。

## 配置

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
    # include: []   # 若设置，则只跟踪这些名称（可用通配符）
```

| 键 | 默认 | 含义 |
|----|------|------|
| `enabled` | `true` | 总开关 |
| `threshold` | `6` | 允许的连续次数；下一次拦截（整数 ≥ 2） |
| `exclude` | job_* | 永不计入的工具名 |
| `include` | （空） | 若设置，则只跟踪这些名称 |

## 与 dsh-tool-budget 的区别

| 插件 | 拦截对象 |
|------|----------|
| `dsh-repeat-stop` | 连续相同调用 |
| `dsh-tool-budget` | 整场会话工具总次数 |

## 测试

```sh
npm test
```

## 许可

MIT
