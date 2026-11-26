#!/usr/bin/env python3
"""从 v2 规划表生成篇/章骨架，避免手工复制导致目录漂移。"""
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path("/Users/main/agent-book/my-agent-flow")
PLAN = ROOT / "00-导论/07-Agent学习版v2-篇章节规划.md"
OUT = ROOT / "v2"


def clean_title(text: str) -> str:
    text = text.replace("/", "／").replace("\\", "＼")
    text = text.replace("：", "：").replace(":", "：")
    text = re.sub(r"[*`]", "", text)
    return text.strip()


parts: list[dict] = []
current: dict | None = None
for line in PLAN.read_text(encoding="utf-8").splitlines():
    m = re.match(r"### 第 (\d{2}) 篇　(.+)", line)
    if m:
        current = {"id": m.group(1), "title": clean_title(m.group(2)), "chapters": []}
        parts.append(current)
        continue
    if not current or not line.startswith("|"):
        continue
    m = re.match(r"\|\s*(\d{2})\.(\d+)\s*\|(.*)\|", line)
    if not m:
        continue
    cells = [c.strip() for c in line.strip().strip("|").split("|")]
    if len(cells) < 5:
        continue
    cid, title, knowledge, min_loop, complete = cells[:5]
    current["chapters"].append(
        {
            "id": cid,
            "num": f"{m.group(1)}.{m.group(2)}",
            "title": clean_title(title),
            "knowledge": knowledge,
            "min": min_loop,
            "complete": complete,
        }
    )

# 篇级闭环从「十一篇总览」读
overview: dict[str, str] = {}
for line in PLAN.read_text(encoding="utf-8").splitlines():
    m = re.match(r"\| (\d{2}) \| .* \| .* \| (\d+) \|", line)
    if m:
        overview[m.group(1)] = line.strip().strip("|").split("|")[2].strip()

if OUT.exists():
    raise SystemExit(f"{OUT} already exists; refusing to overwrite")

OUT.mkdir(parents=True)

index_lines = [
    "# Agent 学习版 v2",
    "",
    "> 状态：📋 篇/章骨架已生成；正文按章逐步填充。v1 的 13 部分保留为实现手册，不删除。",
    "",
    "## 怎么用",
    "",
    "每一章都是一个独立功能，先跑章级最小闭环，再补完整功能。章节正文固定六节：",
    "`功能与知识点 → 最小调用链 → 代码创建 → 测试 → 完整化 → 边界与验收`。",
    "",
    "## 篇",
    "",
]
overview_lines = [
    "# 十一篇总览",
    "",
    "| 篇 | 能力域 | 篇级最小闭环 | 章数 |",
    "|---|---|---|---:|",
]
for p in parts:
    pdir = OUT / f"{p['id']}-{p['title']}"
    pdir.mkdir()
    ch_lines = [
        f"# 第 {p['id']} 篇　{p['title']}",
        "",
        f"> 状态：📋 篇骨架；{len(p['chapters'])} 章。",
        "",
        "## 能力域",
        "",
        f"本篇负责「{p['title']}」这一层能力。每章先跑独立最小闭环，篇末再串成本篇闭环。",
        "",
        "## 篇级最小闭环",
        "",
        overview.get(p["id"], "待补。"),
        "",
        "## 章节",
        "",
        "| 章 | 功能 | 知识点 | 最小闭环 | 状态 |",
        "|---|---|---|---|---|",
    ]
    for c in p["chapters"]:
        cdir = pdir / f"{c['num'].split('.')[1].zfill(2)}-{c['title']}"
        cdir.mkdir()
        ch_lines.append(
            f"| [{c['num']}]({cdir.name}/README.md) | {c['title']} | {c['knowledge']} | {c['min']} | 📋 设计卡 |"
        )
        chapter = [
            f"# 第 {c['num']} 章　{c['title']}",
            "",
            f"> 状态：📋 章节设计卡；正文待按六节填充。  ",
            f"> 所属：第 {p['id']} 篇　{p['title']}",
            "",
            "## 1. 功能与知识点",
            "",
            f"**功能**：{c['title']}。",
            "",
            f"**知识点如何体现**：{c['knowledge']}。",
            "",
            f"**最小验收**：{c['min']}。",
            "",
            "## 2. 最小调用链",
            "",
            "按「入口 → 调用节点 → 状态变化 → 出口」画一条最小链路；只保留证明本功能所需的最少节点。",
            "",
            f"- 最小闭环：{c['min']}",
            "- 失败点：入口参数非法、依赖不可用、输出为空。",
            "",
            "## 3. 代码创建",
            "",
            "- 先按调用链确定文件，不按概念顺序建目录。",
            "- 每个新符号必须写出：谁调用它、它调用谁、输入输出是什么。",
            f"- 完整化方向：{c['complete']}。",
            "",
            "## 4. 测试",
            "",
            "- 先写失败用例，再补最小实现。",
            "- 至少三类：正常路径、边界输入、依赖失败。",
            "- 命令格式：`uv run pytest tests/chapters/<本章测试文件> -q`。",
            "",
            "## 5. 完整化",
            "",
            f"{c['complete']}。每加一项都要有独立测试；没有测试的扩展不算完成。",
            "",
            "## 6. 边界与验收",
            "",
            "- 明确写出本章不做什么，不能把组件测试写成端到端完成。",
            "- 验收必须包含：命令、预期输出、常见失败定位。",
        ]
        (cdir / "README.md").write_text("\n".join(chapter) + "\n", encoding="utf-8")
    (pdir / "README.md").write_text("\n".join(ch_lines) + "\n", encoding="utf-8")
    index_lines.append(f"- [第 {p['id']} 篇　{p['title']}]({p['id']}-{p['title']}/README.md)")
    overview_lines.append(
        f"| {p['id']} | {p['title']} | {overview.get(p['id'], '待补')} | {len(p['chapters'])} |"
    )

(OUT / "README.md").write_text("\n".join(index_lines) + "\n", encoding="utf-8")
(OUT / "00-总览.md").write_text("\n".join(overview_lines) + "\n", encoding="utf-8")
print(f"generated {len(parts)} parts / {sum(len(p['chapters']) for p in parts)} chapters")
