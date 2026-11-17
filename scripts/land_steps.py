#!/usr/bin/env python3
"""从手把手文档里把代码落地到 my-agent-flow/backend。

改完任何一章的 Step 代码后，跑这个脚本让代码与文档一致：
    python3 scripts/land_steps.py                # 全量
    python3 scripts/land_steps.py --parts 01,02  # 只某几个 Part
再 cd ../my-agent-flow/backend && uv run pytest tests/chapters -q


文档的 Step 结构固定：
    ### Step N　标题
    **文件**：`<路径>`（新建/...）
    **代码**
    ```python
    ...
    ```
所以可以机械抽取。同一文件被多个 Step 写到时，后写覆盖（手册本身就是增量式）。
"""
from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path

DOC = Path("/Users/main/agent-book/work-agent-harness/doc/evoflow-学习规划")
BACKEND = Path("/Users/main/my-agent-flow/backend")

HEAD = re.compile(r"^### Step .*$", re.M)
FILE_LINE = re.compile(r"^\*\*文件\*\*：(`([^`]+)`|同上[^\n]*)", re.M)
FENCE = re.compile(r"```(\w+)\n(.*?)```", re.S)


def steps(text: str):
    blocks = re.split(r"^### Step ", text, flags=re.M)[1:]
    for b in blocks:
        m = FILE_LINE.search(b)
        if not m:
            continue
        path = m.group(1).strip()
        if path.startswith("`"):
            path = path.strip("`")
        # Only treat fences beneath the explicit **代码** label as source.
        # Explanatory/verification snippets earlier in a Step must never be
        # mistaken for the implementation and written over the target file.
        code_section = re.search(r"\*\*代码\*\*[^\n]*\n(.*)", b, re.S)
        lang_codes = FENCE.findall(code_section.group(1)) if code_section else []
        if not lang_codes:
            continue
        yield path, lang_codes


def target(path: str) -> Path | None:
    p = path.strip()
    if p in (".", "") or p.startswith(("src-tauri", "docs/", "./")):
        return None
    # 去掉说明性后缀
    p = p.split("（")[0].strip().rstrip("/")
    if p.startswith("backend/"):
        p = p[len("backend/"):]
    return BACKEND / p


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--parts", default="", help="只落地这些前缀，如 01,02")
    ap.add_argument("--dry", action="store_true")
    ap.add_argument("--force", action="store_true", help="允许覆盖已存在文件；默认只写新文件")
    args = ap.parse_args()

    written: list[Path] = []
    last_dest: Path | None = None
    skipped: list[str] = []
    for md in sorted(DOC.glob("*/*.md")):
        part = md.parent.name[:2]
        if args.parts and part not in args.parts.split(","):
            continue
        if md.name == "README.md":
            continue
        for path, blocks in steps(md.read_text(encoding="utf-8")):
            if "同上" in path:
                dest = last_dest
            else:
                dest = target(path)
            if dest is not None and dest.is_dir():
                dest = None
            if dest is None:
                skipped.append(f"{md.name}: {path}")
                continue
            # 只落 python 代码；bash/json/html 块不是模块源码
            py = [c for lang, c in blocks if lang in ("python", "py")]
            if not py:
                skipped.append(f"{md.name}: {path}（无 python 块）")
                continue
            if args.dry:
                print(f"{md.parent.name}/{md.name} -> {dest.relative_to(BACKEND)}")
                continue
            mode = "a" if ("追加" in path or "同上" in path or "接着往下写" in path) else "w"
            if dest.exists() and mode == "w" and not args.force:
                skipped.append(f"{md.name}: {path}（目标已存在；如确认覆盖请加 --force）")
                continue
            dest.parent.mkdir(parents=True, exist_ok=True)
            if mode == "a":
                dest.touch(exist_ok=True)
                with dest.open("a", encoding="utf-8") as f:
                    f.write("\n\n" + py[0].rstrip() + "\n")
            else:
                dest.write_text(py[0].rstrip() + "\n", encoding="utf-8")
            written.append(dest)
            last_dest = dest

    if args.dry:
        print(f"共 {len(skipped)+0} 跳过")
        return 0

    # 补齐包 __init__
    for d in {p.parent for p in written}:
        if str(d).startswith(str(BACKEND / "packages")) or str(d).startswith(str(BACKEND / "tests")):
            init = d / "__init__.py"
            init.parent.mkdir(parents=True, exist_ok=True)
            init.touch(exist_ok=True)
    print(f"写入 {len(written)} 个文件")
    for p in written:
        print("  ", p.relative_to(BACKEND))
    if skipped:
        print(f"跳过 {len(skipped)}：")
        for s in skipped[:20]:
            print("  ", s)
    return 0


if __name__ == "__main__":
    sys.exit(main())
