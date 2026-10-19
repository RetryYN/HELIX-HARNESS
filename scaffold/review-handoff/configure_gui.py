#!/usr/bin/env python3
"""GUI通知hook（Claude／Codex／Devin／Antigravity）とHELIX所有instruction（Claude／Codex）をconsumerへ接続／撤去する。"""
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
POLICY_SHA256 = "c11d90db93c373cfb4213ccdc8db4a65d98f7813e6ceac2265ca0cc18d3666b5"
# 同じHELIX管理区間を両runtimeの利用者instructionへ同期する。marker外の利用者本文は保持する。
POLICY_PATHS = {"claude": "~/.claude/CLAUDE.md", "codex": "~/.codex/AGENTS.md"}
FORBIDDEN_POLICY_TEXT = ("許可している", "承認済み", "権限を与える", "authorized", "#1888")
RUNTIMES = ("claude", "codex", "devin", "antigravity")
SETTINGS_PATHS = {"claude": "~/.claude/settings.json", "codex": "~/.codex/hooks.json",
                  "devin": "~/.config/devin/config.json", "antigravity": "~/.gemini/config/hooks.json"}
# 所有hookの件数。Claudeは回復用ConfigChangeを含む。
OWNED_COUNTS = {"claude": 3, "codex": 2, "devin": 2, "antigravity": 2}
# Antigravityのhooks.jsonはhook名→event設定の写像。HELIXの所有はこの名前の項目だけ。
ANTIGRAVITY_GROUP = "helix-gui-mailbox"



def entries(runtime):
    def command(wait, event=None):
        args = ["python3", "-B", str(HERE / "gui_mailbox.py"), "hook", "--runtime", runtime, "--wait", str(wait)]
        if runtime in ("devin", "antigravity"):
            # 両runtimeはhook入力のevent名が無い・保証されないため、設定側からeventを渡す。
            args += ["--event", event]
        # 通知専用42だけをClaudeの2に変換。不在・argparse・例外の2/1は常に0。
        return shlex.join(args) + '; helix_hook_rc=$?; if [ "$helix_hook_rc" -eq 42 ]; then exit 2; fi; exit 0'
    if runtime == "antigravity":
        # SessionStart・Stopは処理をevent直下に並べる（matcherは使わない）。Stopの既定timeoutは30秒。
        return {ANTIGRAVITY_GROUP: {
            "SessionStart": [dict(type="command", command=command(0, "SessionStart"), timeout=10)],
            "Stop": [dict(type="command", command=command(5, "Stop"), timeout=10)],
        }}
    stop = dict(type="command", command=command(3600 if runtime == "claude" else 5, "Stop"),
                timeout=3660 if runtime == "claude" else 10)
    if runtime == "claude": stop["asyncRewake"] = True
    result = {
        "SessionStart": [{"hooks": [dict(type="command", command=command(0, "SessionStart"), timeout=10)]}],
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
                return index + 3 < len(tokens) and tokens[index + 3] in RUNTIMES
    return False


def handlers(records):
    """event配下の処理。Claude形式（matcher＋hooks）とAntigravityのSessionStart／Stop形式（処理を直接並べる）を読む。"""
    for record in records if isinstance(records, list) else []:
        if not isinstance(record, dict):
            continue
        if "command" in record:
            yield record
        for hook in record.get("hooks", []) if isinstance(record.get("hooks"), list) else []:
            if isinstance(hook, dict):
                yield hook


def event_maps(existing, runtime):
    """hook設定のevent→records写像の一覧。Antigravityはhook名ごと、他はhooks key配下。"""
    if runtime == "antigravity":
        return [value for value in existing.values() if isinstance(value, dict)]
    return [existing.get("hooks", {})]


def count_owned(existing, runtime="claude"):
    return sum(owned(h) for events in event_maps(existing, runtime) for records in events.values()
               for h in handlers(records))


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
        raise ValueError("instructionのHELIX markerが不正")
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
        raise ValueError("instructionは改行終端が必要。markerを本文行へ連結しない")
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
    if runtime == "antigravity":
        # 所有hook名を除き、別名の項目に紛れた所有処理も外す。他の利用者hook（helix_guard等）は保持する。
        result.pop(ANTIGRAVITY_GROUP, None)
        for name in list(result):
            group = result[name]
            if not isinstance(group, dict):
                continue
            for event in [key for key, value in group.items() if isinstance(value, list)]:
                group[event] = strip_owned(group[event])
                if not group[event]: del group[event]
        if not remove:
            result.update(entries(runtime))
        return result
    hooks = result.setdefault("hooks", {})
    for event in list(hooks):
        retained = strip_owned(hooks[event])
        if retained: hooks[event] = retained
        else: del hooks[event]
    if not remove:
        for event, records in entries(runtime).items():
            hooks.setdefault(event, []).extend(records)
    if not hooks: result.pop("hooks", None)
    if runtime == "devin" and not remove:
        # DevinはClaudeの~/.claude/settings.json等も読み、Claude用hookやinstructionを二重に走らせる。
        # HELIXのruleは各repoのAGENTS.mdから読むため、Claude設定の取込みだけを止める。撤去時は利用者の値として残す。
        result.setdefault("read_config_from", {})["claude"] = False
    return result


def strip_owned(records):
    retained = []
    for record in records:
        if isinstance(record, dict) and owned(record):
            continue
        children = record.get("hooks", []) if isinstance(record, dict) else []
        if not isinstance(children, list) or not children:
            retained.append(record)
            continue
        remaining = [h for h in children if not owned(h)]
        if len(remaining) == len(children):
            retained.append(record)
        elif remaining:
            record["hooks"] = remaining
            retained.append(record)
    return retained


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
    policies = []
    for runtime, relative in POLICY_PATHS.items():
        policy_path = Path.home() / relative[2:]
        policy_before = policy_path.read_bytes() if policy_path.exists() else None
        policy_text = policy_before.decode() if policy_before is not None else ""
        # instruction marker異常時にhookだけを先に変更しないよう、全書込より前に検証する。
        policy_after = None if (args.audit or args.rearm) else update_policy(policy_text, args.remove).encode()
        policies.append((runtime, relative, policy_path, policy_before, policy_text, policy_after))
    paths = {runtime: Path.home() / relative[2:] for runtime, relative in SETTINGS_PATHS.items()}
    changes = []
    read_after = []
    for runtime, path in paths.items():
        if args.rearm and runtime != "claude":
            continue
        before = path.read_bytes() if path.exists() else None
        existing = json.loads(before) if before is not None else {}
        if args.audit:
            count = count_owned(existing, runtime)
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

    for runtime, relative, policy_path, policy_before, policy_text, policy_after in policies:
        if args.audit:
            starts, ends = policy_text.count(POLICY_START), policy_text.count(POLICY_END)
            count = starts if starts == ends else max(starts, ends, 1)
            residual_count += count
            print(runtime + "_policy: managed_block_residuals=" + str(count))
        elif not args.rearm:
            if not args.apply:
                print(json.dumps(dict(runtime=runtime, action="remove" if args.remove else "sync",
                                      instruction_source=str(POLICY_SOURCE), target=relative),
                                 ensure_ascii=False, indent=2))
            elif policy_before is not None or policy_after:
                changes.append((policy_path, policy_before, policy_after))

    if args.apply:
        atomic_write_all(changes)
        for runtime, path, after in read_after:
            assert json.loads(path.read_bytes()) == after
            assert count_owned(after, runtime) == (0 if args.remove else OWNED_COUNTS[runtime])
            print(runtime + ": hook設定read-after一致。GUI側のtrust／読込／受信ACKは別確認")
        if not args.rearm:
            for runtime, relative, policy_path, policy_before, policy_text, policy_after in policies:
                if policy_before is not None or policy_after:
                    assert policy_path.read_bytes() == policy_after
                    print(runtime + ": HELIX managed instruction read-after一致")

    if args.audit and residual_count:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
