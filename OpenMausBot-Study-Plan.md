# OpenMausBot 源码学习计划 / Structured Study Plan

> 仓库：https://github.com/milind-soni/OpenMausBot
> 目标：读懂源码，并能按章节从零重写一个最小可运行版本。

## 证据等级（每章都标注）

- ✅ **已确认（来自公开 README / 发布说明 / PR 摘要）**：目录名、端口、技术栈、模块职责。
- 🟡 **推断（从命名与文档摘要推出）**：具体函数与数据结构。
- ⬜ **待读源码**：所有具体实现细节。需要你提供文件后才能确认。

## 已确认的整体结构 ✅

| 层 | 路径 | 职责 |
|---|---|---|
| 服务端（harness） | `server/` | 拥有所有 agent 进程；把各 provider 的原生协议统一成一套运行时事件流 |
| 驱动（drivers） | `server/drivers/` | 每个 provider 一个文件：Claude、Codex、Grok Build（分别走 stream-JSON / JSON-RPC / ACP），以及云端电脑 agent |
| 注册表与事件总线 | `server/harness/` | 把配置变成运行中的实例；扇入（fan-in）事件总线 |
| 协议契约 | `server/contracts.ts` | 驱动 SPI，刻意保持很小 |
| HTTP/SSE API | `server/index.ts` | bot、回合、审批、模型目录、云端电脑生命周期、连接器、配置 |
| 语音 | `server/tts/` | ElevenLabs、Fish Audio、Grok、本机 Mac 语音、Chatterbox |
| 浏览器引擎 | `server/browser-engine.ts`、`browser-engine-release.ts` | 固定版本的 agent-browser（0.36.0，逐平台 SHA-256 校验） |
| 前端 | `src/` | 聊天外壳；服务端持有状态，一个 reducer，客户端没有自己的传输层 |
| 桌面 | `electron/` | macOS 外壳：听写、屏幕捕获、CUA 桥 |
| CLI | `cli.js`，`skills/`，`enterprise/` | `openmausbot` 命令（run、wait、send、export、events、team、engine、connect、mcp、doctor） |
| 打包 | `scripts/build-npm-package.mjs`，`deploy/` | 组装 npm 包（要求 Node 24+）；Docker、VPS 安装与升级脚本 |

**运行方式 ✅：** 两个进程。`pnpm dev:server` 监听 `127.0.0.1:8799`，`pnpm dev` 在 `127.0.0.1:5199` 提供前端。应用不直接与 agent 通信，只通过 HTTP 发命令、通过 SSE 接收一条事件流。

**核心设计 ✅：** 每个 provider 的协议不同，harness 把它们全部归一成「规范运行时事件」（canonical runtime event），并按线程写成 NDJSON 日志。

---

## 第一部分　地基

### 第 1 章　仓库布局与本地运行
- **目标：** 能启动两个进程，并在界面里看到一个 bot 的状态。
- **关键概念：** 服务端与前端分离；仅绑定 loopback；Node 24+、pnpm。
- **最小闭环：** `pnpm install` → `pnpm dev:server` → `pnpm dev` → 浏览器打开 5199 → 能看到服务端返回的 bot 列表（哪怕是空的）。
- **要读：** ⬜ `package.json` 的 scripts、`server/index.ts` 的启动段、`src/` 的入口。
- **重写步骤：** 写一个 50 行左右的服务端，只提供 `GET /health`；前端只请求它并显示结果。
- **自测：** 服务端挂掉时前端显示明确的离线状态，而不是空白。

### 第 2 章　协议契约与驱动 SPI（`server/contracts.ts`）
- **目标：** 弄清「驱动必须实现什么」和「界面能收到什么」，这是全项目最重要的一份文件。
- **关键概念：** 命令（客户端 → 服务端）、运行时事件（服务端 → 客户端）、驱动接口（启动、发送、中断、关闭）。两端只通过这份契约通信。
- **最小闭环：** 定义三个类型：`Command`（send_message）、`RuntimeEvent`（text_delta、done、error）、`Driver`（`start(botId)`、`send(turn)`、`stop()`）。写一个假驱动，回显输入。
- **要读：** ⬜ `contracts.ts` 全文；⬜ 每个事件的字段与版本号。
- **重写步骤：** 用 TypeScript 写出契约文件，并用假驱动做类型检查。
- **自测：** 新增一个假驱动，不改任何其他文件，就能被注册并被调用。

---

## 第二部分　服务端 harness

### 第 3 章　HTTP 与 SSE API（`server/index.ts`）
- **目标：** 列出所有路由，理解命令如何进入系统、事件如何流出。
- **关键概念：** 命令用 HTTP POST；事件用 SSE 单向推送；审批（approval）是一个阻塞点。
- **最小闭环：** `POST /bots` 建 bot → `POST /bots/:id/turns` 发消息 → `GET /events`（SSE）收到 text_delta 与 done。
- **要读：** ⬜ 路由表；⬜ 审批请求的数据结构与超时。
- **重写步骤：** 用 Node 原生 http 实现上面三个路由，内存存储即可。
- **自测：** 断开 SSE 后重连，不会丢失当前回合的 done 事件（或明确告知丢失）。

### 第 4 章　注册表与事件总线（`server/harness/`）
- **目标：** 理解「配置 → 运行中实例」的映射，以及多个客户端如何同时订阅同一个 bot。
- **关键概念：** Registry（配置与实例的生命周期）；fan-in bus（多个驱动的事件汇入一条总线）；按线程的订阅。
- **最小闭环：** 注册两个假 bot，各自发消息，两个订阅者各自只收到自己 bot 的事件。
- **要读：** ⬜ registry 的增删改与实例回收；⬜ 总线的订阅与取消订阅。
- **重写步骤：** 实现一个 `Registry` 和一个按 botId 分发的 `Bus`。
- **自测：** 删除一个 bot 后，它的订阅者收到关闭信号，且它的驱动实例被停止。

### 第 5 章　事件日志、脱敏与重放缓冲
- **目标：** 理解 NDJSON 日志、敏感字段脱敏，以及有界重放缓冲。
- **关键概念：** 每个事件在写日志前脱敏；缓冲区同时按数量与字节限制；超限时丢弃旧事件，并且让客户端知道有缺口。
- **最小闭环：** 发送一个含 API key 的事件，检查日志文件：key 已被替换；缓冲超限后，重连的客户端收到「gap」标记。
- **要读：** ⬜ 脱敏函数的规则；⬜ 缓冲的淘汰策略；⬜ 内联 base64 载荷如何被移出日志。
- **重写步骤：** 实现 `appendLog(thread, event)`（先脱敏再写）和 `ReplayBuffer`（数量 + 字节双限，返回 `{gap: true}`）。
- **自测：** 缓冲超限的测试：旧事件被丢弃，新事件完整保留，gap 标记只出现一次。

---

## 第三部分　驱动（drivers）

### 第 6 章　第一个真实驱动：Claude（stream-JSON）
- **目标：** 理解如何 spawn 一个 CLI 子进程，并把它的 stream-JSON 输出转成规范事件。
- **关键概念：** 子进程生命周期（启动、超时、强杀）；按行解析 JSON；把 provider 事件映射到规范事件。
- **最小闭环：** spawn 一个会输出 JSON 行的假 CLI（一个 Node 脚本）→ 解析 → 产生 text_delta → done。
- **要读：** ⬜ `server/drivers/` 中 Claude 的文件；⬜ 映射表。
- **重写步骤：** 先用假 CLI 实现，再换成真实 CLI。
- **自测：** 子进程非零退出时产生 error 事件；回合超时时进程被杀掉，且没有残留。

### 第 7 章　Codex（JSON-RPC）与 Grok Build（ACP）
- **目标：** 比较两种协议，并理解为什么它们都要归一化。
- **关键概念：** JSON-RPC 的请求 id 与通知；ACP 的会话模型；同一规范事件的两种来源。
- **最小闭环：** 用同一个假 bot 分别接两个假协议服务，两者都产生相同形状的事件。
- **要读：** ⬜ 两个驱动文件的协议处理部分。
- **自测：** 两个驱动的事件通过同一个断言函数（不关心协议细节）。

### 第 8 章　自定义引擎（config 接入）
- **目标：** 理解用户如何在不写代码的情况下接入 ACP 命令行或 OpenAI 兼容端点。
- **关键概念：** 配置驱动的驱动实例；`Settings → Engines` 中指定自定义二进制路径。
- **要读：** ⬜ 自定义引擎的配置 schema（文档中提到 `docs/custom-engines.md`，尚未读到）。
- **自测：** 配置错误的自定义引擎在启动时报告，而不是等到发消息时才失败。

### 第 9 章　云端电脑 agent（cloud-computer driver）
- **目标：** 理解远程执行的驱动如何与本地驱动共享同一个 SPI。
- **关键概念：** 远程实例的生命周期（创建、暂停、销毁）；空闲回收。
- **要读：** ⬜ 云端驱动文件与生命周期 API。
- **自测：** 云端实例空闲超时后被回收，且 bot 的对话记录保留。

---

## 第四部分　能力扩展

### 第 10 章　工具、MCP 与审批
- **目标：** 工具调用如何经过审批，再交给 MCP server。
- **关键概念：** 审批是一个等待点（阻塞当前回合，直到用户允许或拒绝）；权限等级（如「Full access」默认值，发布说明提到 bots 默认全权限）。
- **最小闭环：** 模型请求一个工具 → 生成审批请求 → 用户允许 → 工具执行 → 结果回到回合；拒绝则返回拒绝结果。
- **要读：** ⬜ 审批队列；⬜ MCP 客户端；⬜ 默认权限的设置位置。
- **自测：** 审批请求超时（或界面关闭）时，回合以明确状态结束，且不会执行工具。

### 第 11 章　浏览器引擎（`browser-engine.ts`）
- **目标：** 理解固定版本的二进制如何下载、校验并启动。
- **关键概念：** 版本固定（0.36.0）；每个平台的 SHA-256 校验；查找顺序：环境变量 `OMB_AGENT_BROWSER_PATH` → 数据目录 → PATH；缺失时下载并校验，再安装 Chrome。
- **最小闭环：** 把一个假二进制放进数据目录 → 找到它 → 校验摘要 → 启动并返回版本号。摘要不符则拒绝启动。
- **要读：** ⬜ `browser-engine.ts`、`browser-engine-release.ts`（PR #844 中有对应片段）。
- **自测：** 篡改二进制一个字节后，校验失败，且不会执行该文件。
- **空闲回收：** 发布说明提到空闲 3 分钟后关闭浏览器，删除 bot 时关闭其浏览器，崩溃后不留残留进程。⬜ 具体实现待读。

### 第 12 章　语音（`server/tts/`）
- **目标：** 理解多个 TTS 提供方如何共用一个接口，以及云端密钥为什么只留在服务端。
- **关键概念：** 提供方注册表；Markdown 在朗读前改写；密钥不下发到前端。
- **最小闭环：** 两个假提供方（一个返回固定音频，一个报错）→ 注册表选择 → 失败时回退。
- **自测：** 前端请求中不包含任何 TTS 密钥。

### 第 13 章　连接器、密钥与保险库
- **目标：** 理解密钥存放的三层结构。
- **关键概念：** 桌面版用操作系统加密存储；`config.json` 仍可能以明文保存部分密钥（发布说明与 README 都有说明）；bot 通过 secret card 设置的密钥存放在 Vault，配置文件里只留指针。
- **最小闭环：** bot 设置一个密钥 → 密钥进入 Vault → `config.json` 只写入指针 → 日志中不出现明文。
- **要读：** ⬜ Vault 的实现；⬜ 1Password 集成（`@1password/sdk`）。
- **自测：** 扫描 `config.json` 与日志，断言不含 Vault 中的值。

---

## 第五部分　应用与桌面

### 第 14 章　前端外壳（`src/`）
- **目标：** 理解「服务端持有状态、前端只折叠事件」的模式。
- **关键概念：** 单一 reducer；SSE 事件折叠成状态；前端没有直连 provider 的代码。
- **最小闭环：** 收到 text_delta 事件 → reducer 追加文本 → 界面更新；收到 done → 解除「思考中」。
- **要读：** ⬜ `src/` 中的 store 与 reducer。
- **重写步骤：** 用 React 或纯 DOM 实现 reducer，用录制的事件序列做回放测试。
- **自测：** 同一事件序列回放两次，最终状态相同（reducer 是纯函数）。

### 第 15 章　桌面外壳（`electron/`）
- **目标：** 理解 Electron 外壳只负责系统能力（听写、屏幕、CUA 桥），不负责业务。
- **关键概念：** 进程间桥接；权限请求；屏幕录制授权（发布说明 0.1.3 提到需要注册到系统设置）。
- **自测：** 外壳关闭时服务端仍可运行（外壳不是业务的前提）。

---

## 第六部分　分发与运维

### 第 16 章　无界面 CLI
- **目标：** 理解 CLI 如何复用服务端 API，实现脚本与 CI 用法。
- **关键概念：** CLI 是 HTTP 客户端；`run` 启动、`wait` 等待、`export` 导出、`team apply` 应用团队配置。
- **最小闭环：** `openmausbot run "bot" "prompt" --export ./out` → 服务端执行 → 结果写入 `./out`。
- **要读：** ⬜ `cli.js`；⬜ `docs/headless-cli.md`。
- **自测：** CLI 返回码：成功为 0，失败非 0，超时有单独的码。

### 第 17 章　打包与部署
- **目标：** 理解 npm 包、Docker 镜像和 VPS 安装脚本各包含什么。
- **关键概念：** npm 包只包含 `cli.js`、`dist-server`、`dist`、`skills` 等文件，并要求 Node 24+；Docker 镜像 `ghcr.io/milind-soni/openmausbot`；`install.sh` 与 `update.sh`。
- **最小闭环：** 运行 `build-npm-package.mjs` → 得到目录 → `node cli.js` 能启动服务。
- **自测：** 升级脚本运行后，原有数据目录内容不变。

### 第 18 章　分析统计与隐私
- **目标：** 理解统计事件的字段白名单。
- **关键概念：** 只统计安装、云端实例数、每日用量等计数，不含密钥与对话内容。
- **自测：** 含 key 的输入经过分析模块后，输出不含 key。

---

## 第七部分　综合重写

### 第 19 章　最小可运行版本（capstone）
- **目标：** 用你自己的代码重现一条完整链路，而不是复制原代码。
- **范围（建议）：** 一个 harness 服务（HTTP + SSE + 注册表 + 日志 + 重放缓冲）、一个假驱动（再加一个真实 CLI 驱动）、一个前端（reducer + 事件回放）。
- **通过标准：**
  - [ ] 从浏览器发消息，看到流式回复
  - [ ] 断线重连不丢 done
  - [ ] 日志脱敏
  - [ ] 换驱动只改一个文件
  - [ ] 删除 bot 后资源被回收
- **许可：** 复用任何代码前请先确认仓库 LICENSE（README 显示为 MIT，但需在仓库中核对）。原作者版权声明必须保留。

---

## 下一步：需要你提供的材料

按优先级排列：
1. `server/contracts.ts` 全文（第 2 章的基础）。
2. `server/index.ts` 与 `server/harness/` 的文件列表与内容。
3. `server/drivers/` 中 Claude 驱动一个文件。
4. `package.json` 与 `cli.js` 的 scripts 与入口。
5. 仓库根目录完整文件树：`find . -type f -not -path "*/node_modules/*" -not -path "*/.git/*" | sort`。

拿到这些后，我会把每章的 🟡/⬜ 替换为具体函数名、真实数据结构，并给出可运行的重写代码与测试。
