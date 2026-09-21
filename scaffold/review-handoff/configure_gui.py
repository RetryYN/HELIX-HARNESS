#!/usr/bin/env python3
"""GUI通知hookとHELIX所有Claude instructionをconsumerへ接続／撤去する。"""
import argparse
import copy
import hashlib
import json
import os
from pathlib import Path
import shlex
import stat
import tempfile
import uuid

HERE = Path(__file__).resolve().parent
POLICY_SOURCE = HERE / "claude-current-loader.md"
POLICY_START = "<!-- HELIX:current-loader:start -->"
POLICY_END = "<!-- HELIX:current-loader:end -->"
POLICY_SHA256 = "cf2c9b0d0806684bb760d25ddb611ffe814845849f64ab93b53b8154306e9d49"
FORBIDDEN_POLICY_TEXT = ("許可している", "承認済み", "権限を与える", "authorized", "#1888")



def entries(runtime):
    def command(wait):
        call = shlex.join(["python3", "-B", str(HERE / "gui_mailbox.py"), "hook", "--runtime", runtime, "--wait", str(wait)])
        # 通知専用42だけをClaudeの2に変換。不在・argparse・例外の2/1は常に0。
        return call + '; helix_hook_rc=$?; if [ "$helix_hook_rc" -eq 42 ]; then exit 2; fi; exit 0'
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


def update_policy(existing, remove=False, source=None):
    """HELIX所有blockだけを同期し、利用者所有の前後本文を保持する。"""
    supplied = source is not None
    source = (POLICY_SOURCE.read_text() if source is None else source).strip()
    if not supplied and hashlib.sha256(POLICY_SOURCE.read_bytes()).hexdigest() != POLICY_SHA256:
        raise ValueError("HELIX policy source revision未固定")
    if source.count(POLICY_START) != 1 or source.count(POLICY_END) != 1:
        raise ValueError("HELIX policy sourceのmarkerが不正")
    if any(term in source for term in FORBIDDEN_POLICY_TEXT):
        raise ValueError("HELIX policy sourceに操作許可の成立宣言を含めない")
    starts, ends = existing.count(POLICY_START), existing.count(POLICY_END)
    if starts != ends or starts > 1:
        raise ValueError("Claude instructionのHELIX markerが不正")
    if starts:
        begin = existing.index(POLICY_START)
        finish = existing.index(POLICY_END, begin) + len(POLICY_END)
        # HELIX sourceを書いた際の終端改行も所有範囲に含める。前後本文はbyte単位で保持する。
        ending = ""
        if existing[finish:finish + 2] == "\r\n":
            ending = "\r\n"
        elif existing[finish:finish + 1] in ("\n", "\r"):
            ending = existing[finish:finish + 1]
        finish += len(ending)
        if remove:
            return existing[:begin] + existing[finish:]
        return existing[:begin] + source + (ending or "\n") + existing[finish:]
    if remove:
        return existing
    if existing and not existing.endswith(("\n", "\r")):
        raise ValueError("Claude instructionは改行終端が必要。markerを本文行へ連結しない")
    ending = "\r\n" if existing.endswith("\r\n") else "\r" if existing.endswith("\r") else "\n"
    return existing + source + ending


def atomic_write(path, before, after):
    path.parent.mkdir(parents=True, exist_ok=True)
    if (path.read_bytes() if path.exists() else None) != before:
        raise RuntimeError("設定の同時更新を検出。再読してやり直す")
    fd, temp = tempfile.mkstemp(dir=path.parent, prefix=".helix-gui-")
    try:
        with os.fdopen(fd, "wb") as stream:
            stream.write(after)
        if before is not None:
            os.chmod(temp, stat.S_IMODE(path.stat().st_mode))
        os.replace(temp, path)
    finally:
        if os.path.exists(temp): os.unlink(temp)


def atomic_write_all(changes):
    """複数consumer fileを更新し、途中失敗時は変更済みfileを元bytesへ戻す。"""
    written = []
    try:
        for path, before, after in changes:
            if before == after:
                continue
            atomic_write(path, before, after)
            written.append((path, before, after))
    except Exception as error:
        rollback_errors = []
        for path, before, after in reversed(written):
            try:
                current = path.read_bytes() if path.exists() else None
                if current != after:
                    raise RuntimeError("rollback前に別更新を検出")
                if before is None:
                    path.unlink()
                else:
                    atomic_write(path, after, before)
            except Exception as rollback_error:
                rollback_errors.append(f"{path}: {rollback_error}")
        if rollback_errors:
            raise RuntimeError("consumer設定更新失敗かつrollback不完了: " + "; ".join(rollback_errors)) from error
        raise


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
    parser.add_argument("--audit", action="store_true", help="所有hook／instructionの残留件数。残留ありはexit 1")
    parser.add_argument("--rearm", action="store_true", help="Claudeの所有ConfigChange hook metadataだけを更新して待受を再登録する")
    args = parser.parse_args()
    if args.rearm and (args.remove or args.audit):
        parser.error("rearmとremove/auditは同時指定不可")
    if args.audit and args.apply:
        parser.error("auditとapplyは同時指定不可")
    residual_count = 0
    policy_path = Path.home() / ".claude/CLAUDE.md"
    policy_before = policy_path.read_bytes() if policy_path.exists() else None
    policy_text = policy_before.decode() if policy_before is not None else ""
    # instruction marker異常時にhookだけを先に変更しないよう、全書込より前に検証する。
    policy_after = None if (args.audit or args.rearm) else update_policy(policy_text, args.remove).encode()
    paths = {"claude": Path.home() / ".claude/settings.json", "codex": Path.home() / ".codex/hooks.json"}
    changes = []
    read_after = []
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
        encoded = (json.dumps(after, ensure_ascii=False, indent=2) + "\n").encode()
        changes.append((path, before, encoded))
        read_after.append((runtime, path, after))

    if args.audit:
        starts, ends = policy_text.count(POLICY_START), policy_text.count(POLICY_END)
        count = starts if starts == ends else max(starts, ends, 1)
        residual_count += count
        print("claude_policy: managed_block_residuals=" + str(count))
    elif not args.rearm:
        if not args.apply:
            print(json.dumps(dict(runtime="claude", action="remove" if args.remove else "sync",
                                  instruction_source=str(POLICY_SOURCE), target="~/.claude/CLAUDE.md"),
                             ensure_ascii=False, indent=2))
        else:
            if policy_before is not None or policy_after:
                changes.append((policy_path, policy_before, policy_after))

    if args.apply:
        atomic_write_all(changes)
        for runtime, path, after in read_after:
            assert json.loads(path.read_bytes()) == after
            assert count_owned(after) == (0 if args.remove else (3 if runtime == "claude" else 2))
            print(runtime + ": hook設定read-after一致。GUI側のtrust／読込／受信ACKは別確認")
        if not args.rearm and (policy_before is not None or policy_after):
            assert policy_path.read_bytes() == policy_after
            print("claude: HELIX managed instruction read-after一致")

    if args.audit and residual_count:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
