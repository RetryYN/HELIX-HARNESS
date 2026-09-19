#!/usr/bin/env python3
"""仮設reviewパケットの版・参照・応答対応を静的確認する。外部送信・file書込なし。"""
import argparse
import hashlib
import json
from pathlib import Path
import re
import subprocess

ROOT = Path(__file__).resolve().parents[2]
REFERENCES = {
    "AGENTS.md": "project_rule",
    "CLAUDE.md": "project_context",
    "docs/governance/new-generation-start-here.md": "work_entry",
    "docs/governance/github-upstream-operating-model.md": "operation_contract",
    "docs/governance/decisions/concept-v4.1-and-four-l1-approval-2026-09-17.md": "decision_record",
    "docs/governance/decisions/l2d-s0-approval-and-s1-01-defer-2026-09-19.md": "decision_record",
    "docs/helix-os/L1-planning/system-intent.md": "upstream_reference",
    "docs/governance/candidates/legacy-rule-derived-requirements.md": "candidate_reference_only",
    "scaffold/governance/index.md": "scaffold_reference_only",
}


def require(ok, message):
    if not ok:
        raise ValueError(message)


def sha(data):
    return hashlib.sha256(data).hexdigest()


def encode(value):
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode()


def git(*args):
    return subprocess.check_output(["git", "-C", str(ROOT), *args], stderr=subprocess.DEVNULL)


def commit(value):
    require(isinstance(value, str) and re.fullmatch(r"[0-9a-f]{40}", value), "full SHAが必要")
    require(git("rev-parse", value + "^{commit}").decode().strip() == value, "commit不一致")
    return value


def references(head):
    return [{"path": path, "kind": kind, "sha256": sha(git("show", head + ":" + path))}
            for path, kind in REFERENCES.items()]


def text(value):
    return isinstance(value, str) and bool(value.strip())


def validate(packet, base, head):
    fields = {"schema", "evidence_kind", "authority_effect", "request_id", "repository", "pr",
              "base_sha", "content_sha", "author", "reviewer", "purpose", "scope",
              "route", "references", "payload_sha256"}
    require(isinstance(packet, dict) and set(packet) == fields, "依頼のfield不一致")
    require(packet["schema"] == "scaffold-review-request.v1", "schema不一致")
    require(packet["evidence_kind"] == "scaffold" and packet["authority_effect"] == "none", "authority不一致")
    require(packet["repository"] == "RetryYN/HELIX-HARNESS", "repository不一致")
    require(type(packet["pr"]) is int and packet["pr"] > 0, "PR番号が必要")
    require(text(packet["request_id"]) and text(packet["purpose"]), "依頼identity・目的が必要")
    require(isinstance(packet["scope"], list) and packet["scope"] and all(text(s) for s in packet["scope"]), "scopeが必要")
    require({packet["author"], packet["reviewer"]} == {"claude", "codex"}, "異なるruntimeを指定")
    require(packet["route"] in ("manual_handoff_no_launch", "vscode_gui_mailbox"), "未対応の配送経路")
    require(packet["base_sha"] == commit(base) and packet["content_sha"] == commit(head), "staleなbase/content")
    require(packet["references"] == references(head), "参照集合・種別・bytesが不一致")
    core = {k: v for k, v in packet.items() if k != "payload_sha256"}
    require(packet["payload_sha256"] == sha(encode(core)), "payload不一致")


def validate_response(response, request):
    fields = {"schema", "evidence_kind", "authority_effect", "request_id", "request_payload_sha256",
              "base_sha", "content_sha", "reviewer", "result", "findings", "unreviewed"}
    require(isinstance(response, dict) and set(response) == fields, "応答のfield不一致")
    require(response["schema"] == "scaffold-review-response.v1", "応答schema不一致")
    require(response["evidence_kind"] == "scaffold" and response["authority_effect"] == "none", "応答authority不一致")
    for field in ("request_id", "base_sha", "content_sha", "reviewer"):
        require(response[field] == request[field], "応答binding不一致: " + field)
    require(response["request_payload_sha256"] == request["payload_sha256"], "応答payload不一致")
    require(response["result"] in ("findings", "no_findings", "incomplete"), "応答result不正")
    require(isinstance(response["findings"], list), "findingsが必要")
    ids = set()
    for finding in response["findings"]:
        require(isinstance(finding, dict) and set(finding) == {"id", "severity", "evidence", "change"}, "finding形式不正")
        require(all(text(v) for v in finding.values()), "findingに空欄")
        require(finding["severity"] in ("Blocker", "Major", "Minor", "Info"), "severity不正")
        require(finding["id"] not in ids, "finding ID重複")
        ids.add(finding["id"])
    require(isinstance(response["unreviewed"], list) and all(text(v) for v in response["unreviewed"]), "未確認範囲の形式不正")
    if response["result"] == "no_findings":
        require(not response["findings"] and not response["unreviewed"], "未確認・指摘ありをno_findingsにできない")
    if response["result"] == "findings":
        require(bool(response["findings"]) and not response["unreviewed"], "指摘または未確認範囲とresultが不整合")
    if response["result"] == "incomplete":
        require(bool(response["unreviewed"]), "incompleteの理由が必要")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    sub = parser.add_subparsers(dest="command", required=True)
    build = sub.add_parser("build")
    for name in ("base", "head", "request-id", "purpose"):
        build.add_argument("--" + name, required=True)
    build.add_argument("--pr", type=int, required=True)
    build.add_argument("--author", choices=("claude", "codex"), required=True)
    build.add_argument("--scope", action="append", required=True)
    build.add_argument("--route", choices=("manual_handoff_no_launch", "vscode_gui_mailbox"), default="vscode_gui_mailbox")
    check = sub.add_parser("check")
    check.add_argument("request")
    check.add_argument("--base", required=True)
    check.add_argument("--head", required=True)
    check.add_argument("--response")
    args = parser.parse_args()
    try:
        if args.command == "build":
            packet = dict(schema="scaffold-review-request.v1", evidence_kind="scaffold", authority_effect="none",
                          request_id=args.request_id, repository="RetryYN/HELIX-HARNESS", pr=args.pr,
                          base_sha=commit(args.base), content_sha=commit(args.head), author=args.author,
                          reviewer="claude" if args.author == "codex" else "codex", purpose=args.purpose,
                          scope=args.scope, route=args.route, references=references(args.head))
            packet["payload_sha256"] = sha(encode(packet))
            validate(packet, args.base, args.head)
            print(json.dumps(packet, ensure_ascii=False, indent=2))
        else:
            packet = json.loads(Path(args.request).read_text())
            validate(packet, args.base, args.head)
            if args.response:
                validate_response(json.loads(Path(args.response).read_text()), packet)
            print("scaffold: packet_consistent（配送・本人性・意味review・merge admissionは未判定）")
    except (ValueError, TypeError, KeyError, OSError, subprocess.SubprocessError) as error:
        parser.exit(1, "scaffold: 拒否: " + str(error) + "\n")


if __name__ == "__main__":
    main()
