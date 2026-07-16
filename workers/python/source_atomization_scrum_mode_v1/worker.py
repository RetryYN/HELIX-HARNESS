#!/usr/bin/env python3
"""Proposal-only source atomizer for Scrum-mode Markdown.

The worker owns no filesystem, database, repository, state, or network authority.
It reads exactly one bounded JSONL request from stdin and emits one proposal plus
one completion record. Node must independently rederive every atom and digest.
"""

from __future__ import annotations

import hashlib
import json
import re
import sys
from typing import Any, NoReturn

CAPABILITY_ID = "source_atomization.scrum_mode.v1"
MAX_LINE_BYTES = 1_048_576
REQUEST_KEYS = {
    "schema_version", "capability_class", "capability_id", "request_id",
    "source_id", "source_digest", "markdown", "proposal_only",
}
IDENTIFIER = re.compile(r"^[A-Za-z0-9._:-]{1,128}$")
DIGEST = re.compile(r"^sha256:[0-9a-f]{64}$")
AUTHORITY_FIELD = re.compile(
    r"^(?:db|database|repository|repo|credential|credentials|secret|secrets|helix|state|current)(?:_|$)",
    re.IGNORECASE,
)


class ContractError(Exception):
    pass


def _deny_external_io_audit(event: str, _args: tuple[Any, ...]) -> None:
    if event.startswith("socket."):
        raise PermissionError("network is disabled for HELIX proposal workers")
    if event == "open" or event.startswith(("os.", "subprocess.", "_posixsubprocess.", "pty.")):
        raise PermissionError("filesystem and child processes are disabled for this pure HELIX worker")


def install_external_io_default_deny() -> None:
    sys.addaudithook(_deny_external_io_audit)


def canonical_json(value: Any) -> str:
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":"))


def sha256_digest(value: str) -> str:
    return "sha256:" + hashlib.sha256(value.encode("utf-8")).hexdigest()


def strict_object(pairs: list[tuple[str, Any]]) -> dict[str, Any]:
    result: dict[str, Any] = {}
    for key, value in pairs:
        if key in result:
            raise ContractError("duplicate JSON key")
        result[key] = value
    return result


def contains_authority_field(value: Any) -> bool:
    if isinstance(value, list):
        return any(contains_authority_field(item) for item in value)
    if not isinstance(value, dict):
        return False
    return any(AUTHORITY_FIELD.match(key) or contains_authority_field(child) for key, child in value.items())


def parse_request(raw: bytes) -> dict[str, Any]:
    if len(raw) > MAX_LINE_BYTES + 1:
        raise ContractError("request line exceeds limit")
    if not raw.endswith(b"\n") or b"\r" in raw or raw.startswith(b"\xef\xbb\xbf"):
        raise ContractError("request is not strict LF JSONL")
    line = raw[:-1]
    if not line or b"\n" in line:
        raise ContractError("exactly one request line is required")
    try:
        request = json.loads(line.decode("utf-8"), object_pairs_hook=strict_object)
    except (UnicodeDecodeError, json.JSONDecodeError) as exc:
        raise ContractError("invalid JSON") from exc
    if not isinstance(request, dict) or set(request) != REQUEST_KEYS or contains_authority_field(request):
        raise ContractError("request schema or authority boundary invalid")
    if request.get("schema_version") != "helix-source-atomization-request.v1":
        raise ContractError("schema version invalid")
    if request.get("capability_class") != "source_atomization" or request.get("capability_id") != CAPABILITY_ID:
        raise ContractError("capability invalid")
    if request.get("proposal_only") is not True:
        raise ContractError("proposal-only marker missing")
    if not isinstance(request.get("request_id"), str) or not IDENTIFIER.fullmatch(request["request_id"]):
        raise ContractError("request id invalid")
    if not isinstance(request.get("source_id"), str) or not IDENTIFIER.fullmatch(request["source_id"]):
        raise ContractError("source id invalid")
    if not isinstance(request.get("markdown"), str):
        raise ContractError("markdown invalid")
    if not isinstance(request.get("source_digest"), str) or not DIGEST.fullmatch(request["source_digest"]):
        raise ContractError("source digest invalid")
    if request["source_digest"] != sha256_digest(request["markdown"]):
        raise ContractError("source digest mismatch")
    return request


def is_table_delimiter(value: str) -> bool:
    cells = value.removeprefix("|").removesuffix("|").split("|")
    return bool(cells) and all(re.fullmatch(r"\s*:?-{3,}:?\s*", cell) for cell in cells)


def atomize(request: dict[str, Any]) -> list[dict[str, Any]]:
    atoms: list[dict[str, Any]] = []
    for index, line in enumerate(request["markdown"].split("\n"), start=1):
        kind: str | None = None
        text = ""
        heading = re.fullmatch(r"(#{1,6})\s+(.+?)\s*", line)
        list_item = re.fullmatch(r"\s*(?:[-+*]|\d+[.)])\s+(.+?)\s*", line)
        if heading:
            kind, text = "heading", heading.group(2)
        elif list_item:
            kind, text = "list_item", list_item.group(1)
        elif re.fullmatch(r"\s*\|.*\|\s*", line) and not is_table_delimiter(line):
            kind, text = "table_row", line.strip()
        if kind is None or not text:
            continue
        identity = {"kind": kind, "source_id": request["source_id"], "source_line": index, "text": text}
        atoms.append({
            "ordinal": len(atoms) + 1,
            "kind": kind,
            "source_line": index,
            "text": text,
            "semantic_digest": sha256_digest(canonical_json(identity)),
        })
    return atoms


def build_records(request: dict[str, Any]) -> tuple[dict[str, Any], dict[str, Any]]:
    proposal = {
        "schema_version": "helix-source-atomization-proposal.v1",
        "capability_class": "source_atomization",
        "capability_id": CAPABILITY_ID,
        "request_id": request["request_id"],
        "source_id": request["source_id"],
        "source_digest": request["source_digest"],
        "atoms": atomize(request),
        "proposal_only": True,
    }
    proposal["proposal_digest"] = sha256_digest(canonical_json(proposal))
    complete = {
        "schema_version": "helix-source-atomization-complete.v1",
        "capability_id": CAPABILITY_ID,
        "request_id": request["request_id"],
        "atom_count": len(proposal["atoms"]),
        "proposal_digest": proposal["proposal_digest"],
        "proposal_only": True,
    }
    return proposal, complete


def fail(message: str) -> NoReturn:
    print(canonical_json({"code": "HIL_PYTHON_PLANE_BOUNDARY_INVALID", "message": message}), file=sys.stderr)
    raise SystemExit(2)


def main() -> None:
    if sys.argv != [sys.argv[0]]:
        fail("arguments are forbidden")
    install_external_io_default_deny()
    raw = sys.stdin.buffer.readline(MAX_LINE_BYTES + 2)
    if sys.stdin.buffer.read(1):
        fail("exactly one request line is required")
    try:
        request = parse_request(raw)
        proposal, complete = build_records(request)
    except ContractError as exc:
        fail(str(exc))
    proposal_line = canonical_json(proposal)
    complete_line = canonical_json(complete)
    if len(proposal_line.encode("utf-8")) > MAX_LINE_BYTES or len(complete_line.encode("utf-8")) > MAX_LINE_BYTES:
        fail("result line exceeds limit")
    sys.stdout.write(proposal_line + "\n")
    sys.stdout.write(complete_line + "\n")


if __name__ == "__main__":
    main()
