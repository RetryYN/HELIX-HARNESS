"""B02（受領は消込でない）の fn6 compare_dependencies_and_handoff 垂直スライス。

根拠:
- L4-basic-design/template-semantic-supply.json#/dependency_semantic_ports
- L5-detail-design/template-semantic-supply.json#/functions/6
- L5-detail-design/template-semantic-supply.json#/failure_rules/1..2
- L5-detail-design/template-semantic-supply.json#/dependency_incoming_detail
- L5-detail-design/template-semantic-supply.json#/canonical_dependency_detail
- L5-detail-design/template-semantic-supply.json#/claim_intent_detail
"""

from __future__ import annotations

from typing import Any

_BACKFLOW_ID = "HELIXBRAIN-L6-032-B02-FN6-PATH"


def _unsupported(contract: str, branch: str, detail: str) -> NotImplementedError:
    error = NotImplementedError(f"{contract}/{branch}: {detail}; Backflow {_BACKFLOW_ID}")
    error._b02_branch_tagged = True
    return error


def read_claim_intent(claim: dict[str, Any], claim_locator: str) -> dict[str, Any]:
    raise _unsupported("B02/D32", "fn6_unimplemented", "read_claim_intent is not yet implemented")


def read_receipt_claim_origin(supply_input: dict[str, Any], request: dict[str, Any]) -> dict[str, Any]:
    raise _unsupported("B02/DP1", "fn6_unimplemented", "read_receipt_claim_origin is not yet implemented")


def read_os_obligation_incoming(
    validated: dict[str, Any],
    claim: dict[str, Any],
    source_index: int,
) -> dict[str, Any]:
    raise _unsupported("B02/DP1", "fn6_unimplemented", "read_os_obligation_incoming is not yet implemented")


def read_canonical_dependency_body(validated: dict[str, Any], request: dict[str, Any]) -> dict[str, Any]:
    raise _unsupported("F09/B02", "fn6_unimplemented", "read_canonical_dependency_body is not yet implemented")


def compare_dependencies_and_handoff(context: dict[str, object]) -> dict[str, object]:
    raise _unsupported("B02/F09", "fn6_unimplemented", "compare_dependencies_and_handoff is not yet implemented")
