"""BRAIN032 F08（知識stateとpromotion）の fn5 compare_knowledge_promotion 垂直スライス。

根拠:
- docs/helix-brain/L4-basic-design/template-semantic-supply.json#/knowledge_promotion_contract
- docs/helix-brain/L5-detail-design/template-semantic-supply.json#/functions/5
- docs/helix-brain/L5-detail-design/template-semantic-supply.json#/failure_rules/80..83
- docs/helix-brain/L5-detail-design/template-semantic-supply.json#/knowledge_promotion_detail
- docs/helix-brain/L5-detail-design/template-semantic-supply.json#/knowledge_promotion_claim_detail
"""

from __future__ import annotations

F08_BACKFLOW_ID = "HELIXBRAIN-L6-032-F08-FN5-PATH"


def _f08_stop(branch: str, detail: str) -> NotImplementedError:
    return NotImplementedError(f"F08/{branch}: {detail}; Backflow {F08_BACKFLOW_ID}")


def compare_knowledge_promotion(context: dict[str, object]) -> dict[str, object]:
    raise _f08_stop("fn5_unimplemented", "compare_knowledge_promotion is not yet implemented")
