#!/usr/bin/env python3
"""新設のGUI通知hookだけを利用者設定へ接続／撤去する。trustは変更しない。"""
import argparse
import copy
import json
import os
from pathlib import Path
import shlex
import tempfile

HERE = Path(__file__).resolve().parent


def entries(runtime):
    command = shlex.join(["python3", "-B", str(HERE / "gui_mailbox.py"), "hook", "--runtime", runtime])
    stop = dict(type="command", command=command + " --wait 3600", timeout=3660)
    if runtime == "claude": stop["asyncRewake"] = True
    return {
        "SessionStart": [{"hooks": [dict(type="command", command=command + " --wait 0", timeout=10)]}],
        "Stop": [{"hooks": [stop]}],
    }


def update(existing, runtime, remove=False):
    result = copy.deepcopy(existing)
    hooks = result.setdefault("hooks", {})
    for event, records in entries(runtime).items():
        current = hooks.setdefault(event, [])
        for record in records:
            if remove:
                current[:] = [item for item in current if item != record]
            elif record not in current:
                current.append(record)
        if not current: hooks.pop(event)
    if not hooks: result.pop("hooks", None)
    return result


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--apply", action="store_true")
    parser.add_argument("--remove", action="store_true")
    args = parser.parse_args()
    paths = {"claude": Path.home() / ".claude/settings.json", "codex": Path.home() / ".codex/hooks.json"}
    for runtime, path in paths.items():
        before = path.read_bytes() if path.exists() else None
        existing = json.loads(before) if before is not None else {}
        after = update(existing, runtime, args.remove)
        # 設定値やcredentialsを表示しない。今回のhookだけをpreviewする。
        if not args.apply:
            print(json.dumps(dict(runtime=runtime, action="remove" if args.remove else "add", hooks=entries(runtime)), ensure_ascii=False, indent=2))
            continue
        path.parent.mkdir(parents=True, exist_ok=True)
        if (path.read_bytes() if path.exists() else None) != before:
            raise RuntimeError("設定の同時更新を検出。再読してやり直す")
        fd, temp = tempfile.mkstemp(dir=path.parent, prefix=".helix-gui-")
        try:
            with os.fdopen(fd, "w") as stream:
                json.dump(after, stream, ensure_ascii=False, indent=2)
                stream.write("\n")
            os.replace(temp, path)
        finally:
            if os.path.exists(temp): os.unlink(temp)
        assert json.loads(path.read_bytes()) == after
        print(runtime + ": hook設定read-after一致。GUI側のtrust／読込／受信ACKは別確認")


if __name__ == "__main__":
    main()
