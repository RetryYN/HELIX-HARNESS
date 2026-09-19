#!/usr/bin/env python3
"""新設のGUI通知hookだけを利用者設定へ接続／撤去する。trustは変更しない。"""
import argparse
import copy
from datetime import datetime
import json
import os
from pathlib import Path
import shlex
import tempfile
import uuid
import time

HERE = Path(__file__).resolve().parent
EXPIRES_AT = int(datetime.fromisoformat("2026-09-20T23:59:00+09:00").timestamp())
BOOT_ID = Path("/proc/sys/kernel/random/boot_id").read_text().strip()


def lifetime_guard(boot_id=BOOT_ID, expires_at=EXPIRES_AT):
    return ('[ "$(cat /proc/sys/kernel/random/boot_id 2>/dev/null)" = ' + shlex.quote(boot_id)
            + ' ] || exit 0; [ "$(date +%s)" -lt ' + str(expires_at) + ' ] || exit 0; ')



def entries(runtime):
    def command(wait):
        call = shlex.join(["python3", "-B", str(HERE / "gui_mailbox.py"), "hook", "--runtime", runtime, "--wait", str(wait)])
        # 通知専用42だけをClaudeの2に変換。不在・argparse・例外の2/1は常に0。
        return lifetime_guard() + call + '; helix_hook_rc=$?; if [ "$helix_hook_rc" -eq 42 ]; then exit 2; fi; exit 0'
    stop = dict(type="command", command=command(3600 if runtime == "claude" else 5), timeout=3660 if runtime == "claude" else 10)
    if runtime == "claude": stop["asyncRewake"] = True
    result = {
        "SessionStart": [{"hooks": [dict(type="command", command=command(0), timeout=10)]}],
        "Stop": [{"hooks": [stop]}],
    }
    if runtime == "claude":
        result["ConfigChange"] = [{"matcher": "user_settings", "hooks": [dict(stop)]}]
    return result


def owned(hook):
    command = hook.get("command", "")
    if not isinstance(command, str):
        return False
    try:
        tokens = shlex.split(command)
    except ValueError:
        return False
    # 別checkout・消失済みworktreeでも所有参照を撤去できる。
    for index, token in enumerate(tokens):
        if token.endswith("/scaffold/review-handoff/gui_mailbox.py"):
            if tokens[index + 1:index + 3] == ["hook", "--runtime"]:
                return index + 3 < len(tokens) and tokens[index + 3] in ("claude", "codex")
    return False


def count_owned(existing):
    return sum(owned(h) for records in existing.get("hooks", {}).values()
               for record in records for h in record.get("hooks", []))


def update(existing, runtime, remove=False, rearm_token=None):
    if rearm_token:
        if runtime != "claude" or remove:
            raise ValueError("rearmは既存Claude接続だけが対象")
        expected = entries("claude")
        actual = [(event, record, hook) for event, records in existing.get("hooks", {}).items()
                  for record in records for hook in record.get("hooks", []) if owned(hook)]
        if len(actual) != 3 or {event for event, _, _ in actual} != set(expected):
            raise ValueError("rearmは既存3 hookが必要。撤去済み接続を復活させない")
        for event, record, hook in actual:
            baseline = expected[event][0]
            if record.get("matcher", "") != baseline.get("matcher", "") or any(
                    hook.get(key) != value for key, value in baseline["hooks"][0].items()):
                raise ValueError("rearmは同じcheckout・現行commandの接続だけが対象")
        result = copy.deepcopy(existing)
        for record in result["hooks"]["ConfigChange"]:
            for hook in record.get("hooks", []):
                if owned(hook):
                    hook["statusMessage"] = "HELIX GUI recovery " + rearm_token
        return result
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
    parser.add_argument("--rearm", action="store_true", help="Claudeの所有ConfigChange hook metadataだけを更新して待受を再登録する")
    args = parser.parse_args()
    if args.rearm and (args.remove or args.audit):
        parser.error("rearmとremove/auditは同時指定不可")
    if args.apply and not args.remove and time.time() >= EXPIRES_AT:
        parser.error("接続期限切れ。追加・rearmせず撤去する")
    residual_count = 0
    paths = {"claude": Path.home() / ".claude/settings.json", "codex": Path.home() / ".codex/hooks.json"}
    for runtime, path in paths.items():
        if args.rearm and runtime != "claude":
            continue
        before = path.read_bytes() if path.exists() else None
        existing = json.loads(before) if before is not None else {}
        if args.audit:
            count = count_owned(existing)
            residual_count += count
            print(runtime + ": owned_hook_residuals=" + str(count))
            continue
        after = update(existing, runtime, args.remove, uuid.uuid4().hex if args.rearm else None)
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
        assert count_owned(after) == (0 if args.remove else (3 if runtime == "claude" else 2))
        print(runtime + ": hook設定read-after一致。GUI側のtrust／読込／受信ACKは別確認")

    if args.audit and residual_count:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
