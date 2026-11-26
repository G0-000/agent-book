#!/usr/bin/env python3
"""把 evoflow-学习规划 的全部子文档合并成一份总文档。

用法：
    python scripts/build_evoflow_master.py            # 输出到 agent-book/my-agent-flow
    python scripts/build_evoflow_master.py --stdout   # 只打印，不写文件

设计要点：
1. 顺序由目录前缀决定（00-导论 → 01 → ... → 13），每个目录内 README 排最前；
2. 相对 .md 链接改成「文字（路径）」——合订本里链接会全断，改成可读文本；
3. 溯源/ 是历史归档，不并入总文档；
4. 每篇前面留一行 HTML 注释标明来源文件，方便回查。
"""
from __future__ import annotations

import argparse
import datetime as dt
import re
import subprocess
import sys
from pathlib import Path

SRC = Path("/Users/main/agent-book/my-agent-flow")
OUT = Path("/Users/main/agent-book/my-agent-flow/EvoFlow-学习规划-总文档.md")
LINK = re.compile(r"\[([^\]]+)\]\(([^)]+)\)")


def git_commit() -> str:
    try:
        return subprocess.run(
            ["git", "-C", str(SRC), "rev-parse", "--short", "HEAD"],
            capture_output=True, text=True, check=True,
        ).stdout.strip()
    except Exception:
        return "unknown"


def rewrite_links(text: str) -> str:
    """相对 .md 链接与页内锚点改成可读文本，外链原样保留。"""

    def repl(m: re.Match[str]) -> str:
        label, target = m.group(1), m.group(2)
        if target.startswith("#"):
            return label          # 合订本里页内锚点会失效
        if target.startswith(("http://", "https://", "mailto:")):
            return m.group(0)
        if target.endswith(".md") or ".md#" in target:
            return f"{label}（{target}）"
        return m.group(0)

    return LINK.sub(repl, text)


def ordered_files() -> list[Path]:
    files: list[Path] = []
    for part_dir in sorted(p for p in SRC.iterdir() if p.is_dir()):
        if part_dir.name == "溯源":
            continue
        readme = part_dir / "README.md"
        if readme.exists():
            files.append(readme)
        files.extend(sorted(p for p in part_dir.glob("*.md") if p.name != "README.md"))
    return files


def demote_headings(text: str, shift: int = 2) -> str:
    """整体降级标题，让合订本只有一条 H1 主线。代码块里的 # 不动。"""
    out: list[str] = []
    fence = False
    for line in text.splitlines():
        if line.startswith(("```", "~~~")):
            fence = not fence
        if not fence:
            m = re.match(r"^(#{1,6}) ", line)
            if m:
                level = len(m.group(1))
                line = "#" * min(6, level + shift) + line[level:]
        out.append(line)
    return "\n".join(out)


def chapter_title(text: str, fallback: str) -> str:
    for line in text.splitlines():
        if line.startswith("# "):
            return line[2:].strip()
    return fallback


def build() -> str:
    files = ordered_files()
    parts: list[str] = []
    toc: list[str] = []
    now = dt.datetime.now().strftime("%Y-%m-%d %H:%M")
    commit = git_commit()

    header = [
        "# EvoFlow 学习规划 · 总文档（合订本）",
        "",
        "> 这份文件由子文档自动合并生成，**不要直接编辑**；改子文档后重跑 "
        "`agent-book/scripts/build_evoflow_master.py`。",
        f"> 子文档目录：`agent-book/my-agent-flow/`　"
        f"篇数：{len(files)}　生成：{now}　源提交：`{commit}`",
        "> 内容定位：每个功能点都给出「建哪个文件 → 写什么代码 → 怎么验证」，"
        "事实以本机 EvoFlow 源码为准。",
        "",
        "## 目录",
        "",
        "| # | 部分 | 章节 |",
        "|---|---|---|",
    ]

    current_part = ""
    for idx, path in enumerate(files, 1):
        text = path.read_text(encoding="utf-8")
        part = path.parent.name
        title = chapter_title(text, path.stem)
        if part != current_part:
            current_part = part
            header.append(f"| {idx} | **{part}** | {title} |")
        else:
            header.append(f"| {idx} | | {title} |")
        toc.append(f"{idx}. {part} / {title}")

    header += ["", "---", ""]

    body_parts = ["\n".join(header)]
    current_part = ""
    for path in files:
        rel = path.relative_to(SRC).as_posix()
        raw = rewrite_links(path.read_text(encoding="utf-8")).strip()
        part = path.parent.name
        title = chapter_title(raw, path.stem)

        chunks: list[str] = []
        if part != current_part:
            current_part = part
            chunks.append(f"## {part}\n")
        chunks.append(f"<!-- ===== {rel} ===== -->\n")
        chunks.append(f"### {title}\n")

        body_lines = raw.splitlines()
        if body_lines and body_lines[0].startswith("# "):
            body_lines = body_lines[1:]          # 原标题已提到 H3
        body = demote_headings("\n".join(body_lines).strip(), shift=2)
        chunks.append(body)
        body_parts.append("\n\n".join(chunks) + "\n")

    return "\n\n".join(body_parts)


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--stdout", action="store_true")
    ap.add_argument("--out", default=str(OUT))
    args = ap.parse_args()

    doc = build()
    if args.stdout:
        print(doc)
        return 0

    out = Path(args.out)
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(doc, encoding="utf-8")
    print(f"wrote {out}  {len(doc):,} chars  {doc.count(chr(10)):,} lines")
    return 0


if __name__ == "__main__":
    sys.exit(main())
