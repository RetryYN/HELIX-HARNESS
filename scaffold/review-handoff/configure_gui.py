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
    def command(wait):
        call = shlex.join(["python3", "-B", str(HERE / "gui_mailbox.py"), "hook", "--runtime", runtime, "--wait", str(wait)])
        # 通知専用42だけをClaudeの2に変換。不在・argparse・例外の2/1は常に0。
        return call + '; helix_hook_rc=$?; if [ "$helix_hook_rc" -eq 42 ]; then exit 2; fi; exit 0'
    stop = dict(type="command", command=command(3600 if runtime == "claude" else 5), timeout=3660 if runtime == "claude" else 10)
    if runtime == "claude": stop["asyncRewake"] = True
    return {
        "SessionStart": [{"hooks": [dict(type="command", command=command(0), timeout=10)]}],
        "Stop": [{"hooks": [stop]}],
    }


def owned(hook):
    command = hook.get("command", "")
    prefix = shlex.join(["python3", "-B", str(HERE / "gui_mailbox.py"), "hook", "--runtime"])
    return isinstance(command, str) and command.startswith(prefix + " ")


def count_owned(existing):
    return sum(owned(h) for records in existing.get("hooks", {}).values()
               for record in records for h in record.get("hooks", []))


def update(existing, runtime, remove=False):
    result = copy.deepcopy(existing)
    hooks = result.setdefault("hooks", {})
    for event in list(hooks):
        retained = []
        for record in hooks[event]:
            children = record.get("hooks", [])
            remaining = [h for h in children if not owned(h)]
            if len(remaining) == len(children):
                retained.append(record)
            elif remaining:
                record["hooks"] = remaining
                retained.append(record)
        if retained: hooks[event] = retained
        else: del hooks[event]
    if not remove:
        for event, records in entries(runtime).items():
            hooks.setdefault(event, []).extend(records)
    if not hooks: result.pop("hooks", None)
    return result


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--apply", action="store_true")
    parser.add_argument("--remove", action="store_true")
    parser.add_argument("--audit", action="store_true", help="所有hookの残留件数。残留ありはexit 1")
    args = parser.parse_args()
    residual_count = 0
    paths = {"claude": Path.home() / ".claude/settings.json", "codex": Path.home() / ".codex/hooks.json"}
    for runtime, path in paths.items():
        before = path.read_bytes() if path.exists() else None
        existing = json.loads(before) if before is not None else {}
        if args.audit:
            count = count_owned(existing)
            residual_count += count
            print(runtime + ": owned_hook_residuals=" + str(count))
            continue
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
        assert count_owned(after) == (0 if args.remove else 2)
        print(runtime + ": hook設定read-after一致。GUI側のtrust／読込／受信ACKは別確認")

    if args.audit and residual_count:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
