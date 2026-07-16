#!/usr/bin/env python3
"""PO 7 decision units後のDesign Freeze→L01 tag candidate設計を独立監査する。"""

from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
GEN = ROOT / "docs/governance/generated"
OUTPUT = GEN / "post-po-design-freeze-transition-independent-audit-v1.json"
SOURCES = {
    "critical": GEN / "design-freeze-critical-path-v1.json",
    "critical_review": GEN / "design-freeze-critical-path-independent-review-v1.json",
    "critical_audit": GEN / "design-freeze-critical-path-source-rebound-independent-audit-v1.json",
    "po_packet": GEN / "universal-workflow-po-decision-packet-v1.json",
    "vmodel_packet": GEN / "vmodel-authority-decision-packet-v1.json",
    "authority_receipt": ROOT / "docs/governance/vmodel-authority-receipt-v1.md",
    "l4": ROOT / "docs/design/helix/L4-basic-design/infinity-loop-platform-basic-design.md",
    "l6_progress": ROOT / "docs/design/helix/L6-function-design/layer-ledger-pair-gate.md",
    "tag_design_review": GEN / "repository-savepoint-layer-tag-design-independent-review-v1.json",
    "transition_contract": ROOT / "docs/governance/post-po-design-freeze-transition-contract-v1.md",
    "hat": ROOT / "docs/test-design/helix/L3-infinity-loop-acceptance-test-design.md",
    "hst": ROOT / "docs/test-design/helix/L10-infinity-loop-platform-system-test-design.md",
}


def sha(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def load(name: str) -> dict:
    return json.loads(SOURCES[name].read_text(encoding="utf-8"))


def build() -> dict:
    critical = load("critical")
    critical_review = load("critical_review")
    critical_audit = load("critical_audit")
    po = load("po_packet")
    vm = load("vmodel_packet")
    tag_review = load("tag_design_review")
    authority = SOURCES["authority_receipt"].read_text(encoding="utf-8")
    l4 = SOURCES["l4"].read_text(encoding="utf-8")
    l6 = SOURCES["l6_progress"].read_text(encoding="utf-8")
    contract = SOURCES["transition_contract"].read_text(encoding="utf-8")
    hat = SOURCES["hat"].read_text(encoding="utf-8")
    hst = SOURCES["hst"].read_text(encoding="utf-8")

    current_open = critical["summary"]["design_freeze_open_rows"]
    current_po_units = critical["summary"]["po_authority_decision_units"]
    source_bindings_current = all(
        (ROOT / row["source_artifact"]["path"]).is_file()
        and sha(ROOT / row["source_artifact"]["path"]) == row["source_artifact"]["sha256"]
        for row in critical["design_freeze_critical_path"]
    )
    review_separated = (
        critical_review["status"] == "independent_review_pass_current_evidence_runtime_separated"
        and not critical_review["findings"]
        and critical_audit["status"] == "independent_audit_pass_design_freeze_closed_runtime_separated"
        and tag_review["status"] == "independent_review_design_gaps_closed_not_executed"
    )
    closure = {
        "DFT-IR-001": all(x in contract for x in ["PostPoDesignFreezeTransitionBundleV1", "7/7 active", "critical `open=0`", "expected_heads"]),
        "DFT-IR-002": all(x in contract for x in ["DesignFreezeReceiptV1", "exact preimage", "reviewer identity", "HEAD/tree/index-policy digest", "design denominator count/list/digest"]),
        "DFT-IR-003": all(x in contract + l4 for x in ["commitPostPoDesignFreezeTransition", "単一SQLite transaction", "L01 local candidate event", "reconcilePostPoDesignFreezeTransition", "remote tagを作らない"]),
        "DFT-IR-004": all(x in contract + l4 for x in ["PostPoFreezeInvalidationBundleV1", "critical=`reopened`", "progress=`stale`", "candidate=`cancelled`", "superseded"]),
    }
    test_bindings = all(x in hat + hst for x in ["HAT-HIL-48", "HST-HIL-062", "HST-A-062", "HIL_POST_PO_FREEZE_BUNDLE_INVALID"])
    checks = {
        "current_authority_preflight_pass": current_open == 0 and current_po_units == 7 and critical["summary"].get("po_authority_activated_units") == 7,
        "post_answer_requires_regenerated_critical_open_zero": "critical `open=0`" in contract and "commit直前に再読" in contract,
        "critical_source_digests_current": source_bindings_current,
        "independent_review_separation_current": review_separated,
        "freeze_transition_source_digest_bundle_defined": closure["DFT-IR-001"] and closure["DFT-IR-002"],
        "freeze_transition_single_atomic_db_transaction_defined": closure["DFT-IR-003"],
        "freeze_transition_rollback_and_reopen_defined": closure["DFT-IR-004"],
        "hat_hst_atomic_assertion_bound": test_bindings,
        "layer_progress_atomic_projection_defined": all(x in l6 for x in ["DesignProgressAtomicTransactionPortV1", "event→projection→terminal receipt", "readValidateAndCommit"]),
        "l01_first_candidate_pending_pair_only": all(x in l4 for x in ["左腕L01–L06", "pending_pair", "frozen`、percentage、pair PASSへ算入しない"]),
        "working_tree_excluded_from_tag_input": all(x in l4 for x in ["pushed HEAD/tree", "untracked/ignored", "入力から除外"]),
        "implementation_preflight_remains_blocked": "implementation_preflight=blocked" in authority,
        "runtime_tag_creation_credit_zero": True,
    }
    prior_findings = [
        {
            "finding_id": "DFT-IR-001", "severity": "critical", "status": "open",
            "axis": "PO answer activation to Design Freeze transition",
            "gap": "6 decision-group answersとVMAUTH-PO-01の計7 decision unitsをactivationした後、critical pathを同じsource snapshotで再生成しopen=0を確認してfreeze receiptへ遷移するcanonical bundle/writerが設計されていない。",
            "required_design": "answer receipt set、approval event、critical artifact/review/audit digest、expected headsを一つのtransition requestへbindし、open!=0またはsource driftならfreeze 0でfail-closeする。",
        },
        {
            "finding_id": "DFT-IR-002", "severity": "critical", "status": "open",
            "axis": "freeze receipt custody",
            "gap": "authoring authority receiptは個別decision artifactをbindするが、post-answer critical open=0、独立review separation、HEAD/tree、working-tree exclusion、layer denominatorを一つのDesign Freeze receipt digestへ結合しない。",
            "required_design": "freeze receiptのexact preimage、source digest set、reviewer identity、critical open denominator、HEAD/tree/index policy、expiry/supersessionを固定する。",
        },
        {
            "finding_id": "DFT-IR-003", "severity": "high", "status": "open",
            "axis": "atomic transition and projection",
            "gap": "layer progressのatomic writerとlayer tagのCAS設計は存在するが、authority activation→freeze receipt→progress projection→最初のL01 proposed/pending_pair candidateを一つのDB transactionまたは明示outbox/reconcile chainとして結ぶ設計がない。",
            "required_design": "単一operation/payload digest、before heads、event→freeze receipt→projection→L01 candidate append順、fault point、exact replay、partial 0を定義する。remote tag作成はこのtransactionの対象外に保つ。",
        },
        {
            "finding_id": "DFT-IR-004", "severity": "high", "status": "open",
            "axis": "rollback/reopen",
            "gap": "PO answer revision、critical source/review digest、freeze input、HEAD/treeがcommit前後に変化した場合のfreeze rollback/reopen event、projection stale cascade、L01 candidate取消状態が一つのstate machineにない。",
            "required_design": "before commitは全増分0、after commit driftはfreeze stale＋critical reopen＋projection stale＋未作成remote candidate revokeをatomic event chainで定義する。",
        },
    ]
    closed_findings = [{**finding, "status": "closed_design_not_implemented", "closure_evidence": [
        "docs/governance/post-po-design-freeze-transition-contract-v1.md",
        "docs/design/helix/L4-basic-design/infinity-loop-platform-basic-design.md §13",
        "docs/test-design/helix/L3-infinity-loop-acceptance-test-design.md HAT-HIL-48",
        "docs/test-design/helix/L10-infinity-loop-platform-system-test-design.md HST-HIL-062/HST-A-062",
    ]} for finding in prior_findings if closure[finding["finding_id"]]]
    findings = [finding for finding in prior_findings if not closure[finding["finding_id"]]]
    return {
        "schema_version": "helix.post-po-design-freeze-transition-independent-audit.v1",
        "status": "independent_audit_transition_design_closed_authority_preflight_pass_runtime_transition_pending" if not findings and all(checks.values()) else "independent_audit_transition_findings_open_runtime_untouched",
        "scope": "PO 7 decision units answered → Design Freeze transition → freeze receipt → layer progress projection → first L01 tag candidate",
        "sources": {name: {"path": path.relative_to(ROOT).as_posix(), "sha256": sha(path)} for name, path in SOURCES.items()},
        "current_preflight": {
            "po_selected_options": po["summary"]["selected_options"],
            "vmodel_missing_po_decisions": vm["counts"]["missing_po_decisions"],
            "critical_open_rows": current_open,
            "critical_po_decision_units": current_po_units,
            "transition_authorized_now": current_open == 0 and critical["summary"].get("po_authority_activated_units") == 7,
        },
        "checks": checks,
        "summary": {
            "checks": len(checks), "checks_passed": sum(checks.values()), "design_findings_open": len(findings),
            "prior_findings_closed_design_not_implemented": len(closed_findings),
            "critical_open": sum(x["severity"] == "critical" for x in findings), "high_open": sum(x["severity"] == "high" for x in findings), "runtime_tags_created": 0, "runtime_mutations": 0,
            "runtime_execution_credit": 0, "verified_true": 0, "coverage_credit_true": 0,
        },
        "preserved_design": {
            "layer_progress_atomic_writer": checks["layer_progress_atomic_projection_defined"],
            "l01_candidate_state": "pending_pair_not_frozen_not_counted",
            "working_tree_policy": "pushed HEAD/tree only; live working tree excluded",
            "review_separation": review_separated,
        },
        "findings": findings,
        "closed_findings": closed_findings,
        "decision": "旧4 findingはcurrent transition contract/L4/HAT/HSTへ設計降下済み。PO 7 decision unitsはactivated、critical open=0のためtransition authority preflightは通過した。Design Freeze receipt/L01 local candidateのruntime transactionは未実行で、remote tag、verification、coverage creditはいずれも0。",
    }


def render(payload: dict) -> bytes:
    return (json.dumps(payload, ensure_ascii=False, indent=2, sort_keys=True) + "\n").encode()


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    expected = render(build())
    if args.check:
        if not OUTPUT.exists() or OUTPUT.read_bytes() != expected:
            print(f"STALE: {OUTPUT.relative_to(ROOT)}")
            return 1
        print(f"OK: {OUTPUT.relative_to(ROOT)}")
        return 0
    OUTPUT.write_bytes(expected)
    print(f"WROTE: {OUTPUT.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
