#!/usr/bin/env python3
"""PHCAP-08/09 static research premise validator; never executes legacy assets."""
from __future__ import annotations
import hashlib
from functools import lru_cache
import json
import re
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
INV = HERE / "inventory.json"
ARCHIVE = ROOT / "archive/legacy-generation-2026-09-14/root"
DISP = ROOT / "docs/governance/legacy-asset-disposition.jsonl"
PHASE = ROOT / "docs/governance/legacy-asset-phase-product-classification-bootstrap.jsonl"
DECISIONS = ROOT / "docs/governance/legacy-asset-decisions.jsonl"
PHASE_INV = ROOT / "docs/governance/phase-capability-inventory.json"
BINDING = ROOT / "scaffold/bindings/SCF-B-0041.json"
ARCHIVE_PREFIX = "archive/legacy-generation-2026-09-14/root/"
WBS_RE = re.compile(r"(?i)\bWBS\b|work[- ]breakdown")

EXPECTED_BASE = "b27e61f079edf64eeddc43eb8095159b19730b94"
EXPECTED_WBS_INTERPRETATION = "同名WBS assetは0。archive本文45ファイルの語彙ヒットと等価能力候補は、WBS identity・実装・authority・semantic equivalenceを証明しない。"
EXPECTED_WBS_INTERPRETATION_DIGEST = "9f92e27c2c6e6f2b16c2feea54b92198603e31bb2621994bd3541470104619b7"
EXPECTED_TICKET_INTERPRETATION = "ticket path 9件はcandidate source catalog。代表3件だけ本文exact spanを展開し、残り6件はsource path/hashとphase/ledger stateの範囲に留める。"
EXPECTED_TICKET_INTERPRETATION_DIGEST = "345e32b2408dcf5323dc2a388d80583b2a000e2a30dcc6df76f200b68593e05c"
EXPECTED_PRODUCTS = ["HELIX-HARNESS", "HELIX-OS", "HELIX-Web", "HELIX-Web-OS"]
EXPECTED_TICKET_PATHS = {
    "docs/governance/candidates/execution-ticket-acceptance.md",
    "docs/governance/candidates/execution-ticket-intake.md",
    "docs/governance/candidates/execution-ticket-recognition.md",
    "docs/governance/candidates/execution-ticket-requests.md",
    "docs/governance/candidates/execution-ticket-requirements.md",
    "docs/governance/candidates/execution-ticket-trace.md",
    "docs/governance/candidates/execution-ticket-validation.md",
    "docs/governance/candidates/execution-ticket-vision.md",
    "docs/plans/PLAN-L3-88-execution-ticket-bench-authority.md",
}
EXPECTED_SELECTED_IDS = {
    "LEGACY-ASSET-D27D4A1511BFD43623A9",
    "LEGACY-ASSET-78D55762187C612C93C4",
    "LEGACY-ASSET-DE68E15724FB6EC258AB",
    "LEGACY-ASSET-B1B5271C3933B1F0F345",
    "LEGACY-ASSET-3A15E5645D2D2A59DFF5",
    "LEGACY-ASSET-BE8B151A0094B754FF20",
    "LEGACY-ASSET-06C7FAF2A0981A4778AC",
}

# Independent fail-closed pins. These literals deliberately duplicate the reviewed candidate
# contract; they are not derived from inventory at validation time. Source/ledger bytes remain
# independently re-read below.
INVENTORY_KEYSETS = {
    'root': frozenset(['authority_effect', 'base', 'candidate_connections', 'candidate_phase_joins', 'candidate_transition', 'counts', 'current_refs', 'equivalence_claim', 'failure_consumer_boundary', 'human_decision_ref', 'ledger_provenance', 'legacy_assets', 'meaning_change_applied', 'old_runtime_test_ci_execution', 'product_units', 'schema', 'scope', 'status', 'successor_requirement_ids', 'tasks', 'ticket_path_audit', 'unresolved', 'wbs_name_audit']),
    'candidate_transition': frozenset(['authority_effect', 'current_gap_status', 'degradation', 'from', 'meaning', 'to']),
    'base': frozenset(['branch', 'captured_at', 'commit', 'origin', 'rebaseline_rule', 'repository', 'worktree']),
    'ledger_provenance': frozenset(['asset_ledger_path', 'asset_ledger_sha256', 'asset_record_count', 'decision_ledger_path', 'decision_ledger_sha256', 'decision_record_count', 'matching_decision_record_count', 'phase_classification_path', 'phase_classification_sha256', 'phase_inventory_path', 'phase_inventory_sha256', 'phase_record_count', 'selected_asset_count', 'ticket_path_asset_count']),
    'tasks[]': frozenset(['inventory_record', 'task_id']),
    'tasks[].inventory_record': frozenset(['authority_effect', 'current', 'gaps', 'legacy', 'new_build_allowed', 'phase', 'product_targets', 'scaffold', 'task_id', 'title', 'transition_assessment']),
    'tasks[].inventory_record.current': frozenset(['evidence_products', 'refs', 'status']),
    'tasks[].inventory_record.legacy': frozenset(['assessment', 'capability_status', 'exists', 'layers_evidenced', 'maximum_layer_evidenced', 'representative_assets']),
    'tasks[].inventory_record.legacy.representative_assets[]': frozenset(['asset_id', 'implementation_status', 'source_path']),
    'scope': frozenset(['bounded_source_asset_count', 'closure_rule', 'product_units', 'selected_legacy_asset_ids', 'source_span_count', 'ticket_path_asset_ids']),
    'product_units[]': frozenset(['acceptance_status', 'authority_status', 'current_refs', 'implementation_status', 'legacy_asset_ids', 'phase_evidence', 'product', 'status', 'unit_boundary']),
    'candidate_connections[]': frozenset(['connection_id', 'from', 'kind', 'meaning', 'status', 'to']),
    'candidate_phase_joins[]': frozenset(['catalog_asset_ids', 'interpretation', 'phase_id', 'selected_asset_ids']),
    'wbs_name_audit': frozenset(['archive_content_term_match_count', 'archive_content_term_match_paths', 'archive_file_count', 'archive_hidden_component_file_count', 'archive_filename_match_count', 'exact_basename_matches', 'interpretation', 'interpretation_sha256', 'legacy_disposition_source_path_wbs_matches', 'legacy_disposition_source_path_work_breakdown_matches', 'near_equivalent_candidates', 'representative_near_capability_candidates', 'same_name_asset_count', 'same_name_asset_ids', 'search_regex']),
    'wbs_name_audit.near_equivalent_candidates[]': frozenset(['asset_id', 'reason', 'same_name_identity', 'semantic_equivalence', 'source_path', 'source_span_ids']),
    'wbs_name_audit.representative_near_capability_candidates[]': frozenset(['asset_id', 'capability', 'same_name_identity']),
    'ticket_path_audit': frozenset(['asset_catalog', 'interpretation', 'interpretation_sha256', 'match_rule', 'path_match_asset_ids', 'path_match_count', 'selected_representative_asset_ids']),
    'ticket_path_audit.asset_catalog[]': frozenset(['asset_id', 'ledger_state', 'phase_classification_record', 'source_expanded', 'source_line_count', 'source_path', 'source_sha256']),
    'ticket_path_audit.asset_catalog[].ledger_state': frozenset(['asset_class', 'authority_status', 'consumer_refs', 'decision_record_ref', 'disposition', 'executability_status', 'external_effect_status', 'implementation_status', 'product_target', 'reuse_exclusion_class', 'revision']),
    'ticket_path_audit.asset_catalog[].phase_classification_record': frozenset(['archive_manifest_digest_match', 'artifact_evidence_kind', 'asset_id', 'authority_effect', 'candidate_phase_targets', 'candidate_product_targets', 'classification_id', 'consumer_closure_status', 'consumer_refs', 'implementation_evidence_state', 'legacy_execution_performed', 'legacy_implementation_status', 'phase_assessments', 'phase_classification_status', 'product_assessments', 'product_classification_status', 'source_path', 'source_revision', 'source_sha256', 'unresolved']),
    'ticket_path_audit.asset_catalog[].phase_classification_record.phase_assessments[]': frozenset(['confidence', 'evidence', 'phase', 'source_batches']),
    'ticket_path_audit.asset_catalog[].phase_classification_record.product_assessments[]': frozenset(['confidence', 'evidence_status', 'product', 'rationale', 'source_batches']),
    'legacy_assets[]': frozenset(['archive_path', 'asset_id', 'consumer_evidence', 'decision_history', 'evidence_kind', 'failure_evidence', 'implementation_evidence_state', 'implementation_status_scope', 'ledger_record', 'legacy_reached_layers', 'phase_classification_record', 'source_line_count', 'source_path', 'source_sha256', 'source_spans']),
    'legacy_assets[].source_spans[]': frozenset(['end_line', 'exact_text', 'role', 'sha256', 'span_id', 'start_line']),
    'legacy_assets[].ledger_record': frozenset(['asset_class', 'authority_status', 'consumer_refs', 'decision_record_ref', 'disposition', 'executability_status', 'external_effect_status', 'implementation_status', 'product_target', 'reuse_exclusion_class', 'revision']),
    'legacy_assets[].phase_classification_record': frozenset(['archive_manifest_digest_match', 'artifact_evidence_kind', 'asset_id', 'authority_effect', 'candidate_phase_targets', 'candidate_product_targets', 'classification_id', 'consumer_closure_status', 'consumer_refs', 'implementation_evidence_state', 'legacy_execution_performed', 'legacy_implementation_status', 'phase_assessments', 'phase_classification_status', 'product_assessments', 'product_classification_status', 'source_path', 'source_revision', 'source_sha256', 'unresolved']),
    'legacy_assets[].phase_classification_record.phase_assessments[]': frozenset(['confidence', 'evidence', 'phase', 'source_batches']),
    'legacy_assets[].phase_classification_record.product_assessments[]': frozenset(['confidence', 'evidence_status', 'product', 'rationale', 'source_batches']),
    'legacy_assets[].decision_history': frozenset(['interpretation', 'matching_decision_record_count', 'matching_decision_records', 'status']),
    'legacy_assets[].failure_evidence[]': frozenset(['execution_status', 'finding', 'kind', 'span_id']),
    'legacy_assets[].consumer_evidence[]': frozenset(['closure_status', 'finding', 'kind', 'span_id']),
    'current_refs[]': frozenset(['classification', 'end_line', 'exact_text', 'execution_status', 'implementation_status', 'layer', 'line_sha256', 'path', 'product', 'ref_id', 'role', 'sha256', 'start_line']),
    'failure_consumer_boundary': frozenset(['consumer_closure_observed', 'current_l2_l11_execution', 'failure_receipts_observed', 'interpretation', 'legacy_execution_flags_all_false', 'selected_asset_ledger_consumer_refs_observed', 'selected_asset_phase_consumer_refs_observed']),
    'counts': frozenset(['candidate_connections', 'candidate_phase_joins', 'current_refs', 'decision_records_found', 'failure_receipts_observed', 'legacy_consumer_refs_observed', 'product_units', 'selected_legacy_assets', 'semantic_atoms', 'source_spans', 'ticket_path_assets', 'wbs_archive_content_term_matches', 'wbs_archive_filename_matches', 'wbs_same_name_assets']),
}
BINDING_KEYSETS = {
    'root': frozenset(['artifacts', 'connections', 'created', 'id', 'kind', 'obligations', 'operations', 'owner_candidate', 'product', 'reason', 'replacement', 'role', 'schema_revision', 'state', 'title', 'updated', 'upstream', 'verification']),
    'upstream[]': frozenset(['note', 'path', 'sha256']),
    'connections': frozenset(['boundary', 'consumers', 'dependencies']),
    'operations': frozenset(['allowed', 'forbidden']),
    'verification': frozenset(['evidence_kind', 'negative_cases', 'oracles', 'scope']),
    'replacement': frozenset(['confirmation_digest', 'confirmation_ref', 'formal_artifacts', 'issue', 'role_target', 'status', 'target_revisions', 'transfer']),
    'replacement.target_revisions': frozenset([]),
}
EXPECTED_UNRESOLVED = ['WBS語彙と旧PLAN/current-location/roadmap/stateのsemantic equivalence',
 'HARNESS WBS normative shapeとOS ledger/progression/acceptanceの正式owner・接続',
 'PHCAP-08 WBSとPHCAP-09 ticket derivationのL2採否、L1 parent束縛、L11受入',
 'ticket contractとOS issuer、GitHub projection、Issueの非authority境界の正式化',
 '四製品のunit/connection/composite分割とWeb/Web-OSの直接evidence',
 '旧sourceに記載されたimplementation/design/test presenceと現行implementation statusの差分',
 '旧failure/consumer relationから現行failure receipt・consumer closureを導出できるか',
 '正式owner、successor requirement、human decision、replacement/retirement']
EXPECTED_UNRESOLVED_PIN = 'aa840b134ddd664a9604df9c368f5be8551622d6451cbe8bf7f9dbf5e3f8ea42'
EXPECTED_SPAN_IDS = {'LEGACY-ASSET-D27D4A1511BFD43623A9': ['D27-01', 'D27-02', 'D27-03', 'D27-04'],
 'LEGACY-ASSET-78D55762187C612C93C4': ['78-01', '78-02', '78-03'],
 'LEGACY-ASSET-DE68E15724FB6EC258AB': ['DE68-01', 'DE68-02'],
 'LEGACY-ASSET-B1B5271C3933B1F0F345': ['B1-01', 'B1-02', 'B1-03'],
 'LEGACY-ASSET-3A15E5645D2D2A59DFF5': ['3A-01', '3A-02', '3A-03', '3A-04', '3A-05'],
 'LEGACY-ASSET-BE8B151A0094B754FF20': ['BE8-01', 'BE8-02', 'BE8-03'],
 'LEGACY-ASSET-06C7FAF2A0981A4778AC': ['06C-01', '06C-02', '06C-03']}
EXPECTED_SPAN_ROLES = {'LEGACY-ASSET-D27D4A1511BFD43623A9': {'D27-01': 'historical authority and V-model pair boundary',
                                       'D27-02': 'stage exit contract and required evidence',
                                       'D27-03': 'L3 requirement and failure/trace obligations',
                                       'D27-04': 'implementation trace and verification obligations'},
 'LEGACY-ASSET-78D55762187C612C93C4': {'78-01': 'project model and operation status vocabulary',
                                       '78-02': 'acceptance traceability data model',
                                       '78-03': 'current location, roadmap and closure snapshot data model'},
 'LEGACY-ASSET-DE68E15724FB6EC258AB': {'DE68-01': 'historical plan baseline metadata and plan identifiers',
                                       'DE68-02': 'historical plan set tail and operational plan candidates'},
 'LEGACY-ASSET-B1B5271C3933B1F0F345': {'B1-01': 'historical plan metadata and approval fields',
                                       'B1-02': 'function design scope with WBS textual mention',
                                       'B1-03': 'WBS checklist and explicit unfinished items'},
 'LEGACY-ASSET-3A15E5645D2D2A59DFF5': {'3A-01': 'ticket candidate metadata and authority boundary',
                                       '3A-02': 'ticket/assignment/measurement responsibility separation',
                                       '3A-03': 'ExecutionTicket and Assignment data contract',
                                       '3A-04': 'ticket functional requirements and deterministic compiler candidate',
                                       '3A-05': 'closure, projection and legacy transition candidate boundaries'},
 'LEGACY-ASSET-BE8B151A0094B754FF20': {'BE8-01': 'acceptance candidate metadata and explicit unexecuted oracle '
                                                 'boundary',
                                       'BE8-02': 'ticket acceptance and negative cases',
                                       'BE8-03': 'end-to-end failure, retry and later finding candidate'},
 'LEGACY-ASSET-06C7FAF2A0981A4778AC': {'06C-01': 'plan candidate metadata, authority and contract boundary',
                                       '06C-02': 'generated ticket candidate artifacts and non-runtime scope',
                                       '06C-03': 'candidate-only transition and runtime non-goal'}}
EXPECTED_EVIDENCE_FINDINGS = {'LEGACY-ASSET-D27D4A1511BFD43623A9': {'failure': 'historical completion/failure/trace obligation; no current oracle '
                                                  'or pass is inferred',
                                       'consumer': 'historical completion/failure/trace obligation; no current oracle '
                                                   'or pass is inferred'},
 'LEGACY-ASSET-78D55762187C612C93C4': {'failure': 'historical state/roadmap data model; source execution and current '
                                                  'implementation remain unknown',
                                       'consumer': 'historical state/roadmap data model; source execution and current '
                                                   'implementation remain unknown'},
 'LEGACY-ASSET-DE68E15724FB6EC258AB': {'failure': 'historical plan/roadmap candidate; no plan execution or completion '
                                                  'is inferred',
                                       'consumer': 'historical plan/roadmap candidate; no plan execution or completion '
                                                   'is inferred'},
 'LEGACY-ASSET-B1B5271C3933B1F0F345': {'failure': 'textual WBS near-equivalent candidate; exact WBS artifact identity '
                                                  'is not established',
                                       'consumer': 'textual WBS near-equivalent candidate; exact WBS artifact identity '
                                                   'is not established'},
 'LEGACY-ASSET-3A15E5645D2D2A59DFF5': {'failure': 'historical ticket contract/failure boundary candidate; no compiler, '
                                                  'admission or close execution is inferred',
                                       'consumer': 'historical ticket contract/failure boundary candidate; no '
                                                   'compiler, admission or close execution is inferred'},
 'LEGACY-ASSET-BE8B151A0094B754FF20': {'failure': 'historical acceptance/test design only; all oracle execution and '
                                                  'closure remain unknown',
                                       'consumer': 'historical acceptance/test design only; all oracle execution and '
                                                   'closure remain unknown'},
 'LEGACY-ASSET-06C7FAF2A0981A4778AC': {'failure': 'historical plan/contract candidate; explicit non-runtime scope does '
                                                  'not prove current implementation',
                                       'consumer': 'historical plan/contract candidate; explicit non-runtime scope '
                                                   'does not prove current implementation'}}
EXPECTED_CURRENT_REF_IDS = frozenset(['BOUNDARY-IDENTITY-LOOP', 'BOUNDARY-UNIT-CONNECTION', 'HARNESS-L11', 'HARNESS-L2', 'OS-L11', 'OS-L2', 'WEB-L11', 'WEB-L2', 'WEBOS-L11', 'WEBOS-L2'])
EXPECTED_CURRENT_REF_META = {'BOUNDARY-UNIT-CONNECTION': {'product': 'ALL',
                              'classification': 'boundary_current_ref',
                              'layer': 'Concept',
                              'start_line': 12,
                              'end_line': 29,
                              'role': 'four-product unit/connection responsibility statements'},
 'BOUNDARY-IDENTITY-LOOP': {'product': 'ALL',
                            'classification': 'boundary_current_ref',
                            'layer': 'Concept',
                            'start_line': 32,
                            'end_line': 44,
                            'role': 'four product entrances and unit/connection separation'},
 'HARNESS-L2': {'product': 'HELIX-HARNESS',
                'classification': 'direct_current_ref',
                'layer': 'L2',
                'start_line': 1,
                'end_line': 36,
                'role': 'HARNESS normative V-model and OS separation candidate'},
 'OS-L2': {'product': 'HELIX-OS',
           'classification': 'direct_current_ref',
           'layer': 'L2',
           'start_line': 1,
           'end_line': 35,
           'role': 'OS management/trace and no-implementation candidate'},
 'WEB-L2': {'product': 'HELIX-Web',
            'classification': 'adjacent_current_ref',
            'layer': 'L2',
            'start_line': 1,
            'end_line': 31,
            'role': 'Web user-facing product boundary candidate'},
 'WEBOS-L2': {'product': 'HELIX-Web-OS',
              'classification': 'adjacent_current_ref',
              'layer': 'L2',
              'start_line': 1,
              'end_line': 34,
              'role': 'Web-OS service runtime boundary candidate'},
 'HARNESS-L11': {'product': 'HELIX-HARNESS',
                 'classification': 'direct_current_ref',
                 'layer': 'L11',
                 'start_line': 1,
                 'end_line': 38,
                 'role': 'HARNESS acceptance remains draft/unexecuted'},
 'OS-L11': {'product': 'HELIX-OS',
            'classification': 'direct_current_ref',
            'layer': 'L11',
            'start_line': 1,
            'end_line': 42,
            'role': 'OS acceptance remains draft/unexecuted'},
 'WEB-L11': {'product': 'HELIX-Web',
             'classification': 'adjacent_current_ref',
             'layer': 'L11',
             'start_line': 1,
             'end_line': 31,
             'role': 'Web acceptance remains draft/unexecuted'},
 'WEBOS-L11': {'product': 'HELIX-Web-OS',
               'classification': 'adjacent_current_ref',
               'layer': 'L11',
               'start_line': 1,
               'end_line': 24,
               'role': 'Web-OS acceptance remains draft/unexecuted'}}
EXPECTED_UNIT_BOUNDARIES = {'HELIX-HARNESS': 'V-model、workflow vocabulary、WBS normative shape、ticket '
                  'contract候補を所有する提供product。OSのWorker/CI/log/管理運転は所有しない。',
 'HELIX-OS': 'project群のWBS ledger、progression、ticket生成・登録・統制、Worker/CI/log/改善の管理候補。HARNESSの規範語彙を独自上書きしない。',
 'HELIX-Web': '利用者向けdashboard・操作・成果表示の個別product。PHCAP-08/09のdirect current evidence、ticket/WBS owner、実装・受入は未確定。',
 'HELIX-Web-OS': 'Web展開先のtenant・job・service state・配備・監視・復旧を担う独立service runtime。WBS/ticket authorityを吸収しない。'}
EXPECTED_CONNECTION_MEANINGS = {'CONN-WBS-HARNESS-OS': 'HARNESSのWBS normative shapeをOSのmanagement ledger/progressionへ接続する候補。単体完了から接続成立を推定しない。',
 'CONN-TICKET-HARNESS-OS': 'HARNESSのticket '
                           'vocabulary/contractとOSのissuer/registration/projectionを分離接続する候補。Issueはauthorityでない。',
 'CONN-OS-WEB-PROJECT': 'OSがWeb projectを管理する候補。Web固有の利用者体験とticket/WBS authorityは混同しない。',
 'CONN-WEBOS-OS-IMPROVEMENT': '許可されたservice log/telemetryを改善候補へ投影する接続候補。service runtimeのwriter/state/credentialは共有しない。'}
EXPECTED_BINDING_NEGATIVE_CASES = ['WBS本文語彙を同名assetまたはsemantic equivalentへ昇格する',
 'ticket path 9件の一部欠落またはsource／phase stateの改変',
 'legacy implementation／acceptance／failure／consumer closureをcurrentへ昇格する',
 'Web／Web-OSをPHCAP-08/09 direct evidenceまたはownerへ昇格する',
 'candidate connectionをapproved authorityへ昇格する',
 'origin/main変更後にrebaselineなしでcurrent扱いする']
EXPECTED_BINDING_NEGATIVE_CASE_PIN = 'f4e7023245c0d9d189250b2e61e3a2bc3516a53f1315a1d0c21c136091bfd8f5'



def digest(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def jsonl(path: Path):
    return [json.loads(line) for line in path.read_text(encoding="utf-8").splitlines() if line.strip()]


def line_text(path: Path, start: int, end: int):
    lines = path.read_text(encoding="utf-8").splitlines()
    if not isinstance(start, int) or not isinstance(end, int) or not (1 <= start <= end <= len(lines)):
        return None
    return "\n".join(lines[start - 1 : end]) + "\n"


def fail(errors, condition, code):
    if not condition:
        errors.append(code)


def ledger_state(row):
    return {key: row.get(key) for key in [
        "revision", "asset_class", "reuse_exclusion_class", "product_target", "authority_status",
        "disposition", "implementation_status", "consumer_refs", "decision_record_ref",
        "executability_status", "external_effect_status",
    ]}


def phase_state(row):
    return row


def archive_files():
    # The WBS audit covers every archive file, including dot-component paths.
    return sorted(p for p in ARCHIVE.rglob("*") if p.is_file())


def validate_keysets(value, expected, root_name="root"):
    """Reject unknown/missing keys at every pinned dictionary hierarchy."""
    errors = []

    def walk(node, path):
        if isinstance(node, dict):
            wanted = expected.get(path)
            if wanted is None:
                errors.append("E_KEYSET_UNPINNED:" + path)
                return
            actual = frozenset(node)
            if actual != wanted:
                errors.append("E_KEYSET:" + path + ":expected=" + repr(sorted(wanted)) + ":actual=" + repr(sorted(actual)))
            for key, child in node.items():
                walk(child, key if path == "root" else path + "." + key)
        elif isinstance(node, list):
            dict_items = [item for item in node if isinstance(item, dict)]
            if dict_items and len(dict_items) != len(node):
                errors.append("E_ARRAY_MIXED:" + path)
            for item in dict_items:
                walk(item, path + "[]")

    walk(value, root_name if root_name != "root" else "root")
    return errors


@lru_cache(maxsize=1)
def archive_wbs_audit():
    archive = archive_files()
    filename_matches = tuple(sorted(
        str(path.relative_to(ROOT)) for path in archive if re.search(r"(?i)wbs|work[- ]breakdown", path.name)
    ))
    exact_basename = tuple(sorted(
        str(path.relative_to(ROOT)) for path in archive
        if path.name.lower() in {"wbs.md", "wbs.json", "wbs.yaml", "wbs.yml", "wbs.ts", "wbs.js"}
    ))
    content_matches = []
    for path in archive:
        try:
            text = path.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            continue
        if WBS_RE.search(text):
            content_matches.append(str(path.relative_to(ROOT)))
    hidden_component_count = sum(
        any(part.startswith(".") for part in path.relative_to(ARCHIVE).parts)
        for path in archive
    )
    return list(filename_matches), list(exact_basename), content_matches, len(archive), hidden_component_count


def validate_binding(binding):
    errors = validate_keysets(binding, BINDING_KEYSETS)
    fail(errors, binding.get("id") == "SCF-B-0041", "E_BINDING_ID")
    fail(errors, binding.get("kind") == "scaffold", "E_BINDING_KIND")
    fail(errors, binding.get("state") == "registered", "E_BINDING_STATE")
    fail(errors, binding.get("product") == "HELIX-HARNESS", "E_BINDING_PRODUCT")
    verification = binding.get("verification", {})
    negatives = verification.get("negative_cases")
    fail(errors, negatives == EXPECTED_BINDING_NEGATIVE_CASES, "E_BINDING_NEGATIVE_CASES")
    if negatives == EXPECTED_BINDING_NEGATIVE_CASES:
        fail(errors, digest(json.dumps(negatives, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode()) == EXPECTED_BINDING_NEGATIVE_CASE_PIN, "E_BINDING_NEGATIVE_PIN")
    else:
        fail(errors, digest(json.dumps(negatives, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode()) == EXPECTED_BINDING_NEGATIVE_CASE_PIN, "E_BINDING_NEGATIVE_PIN")
    for upstream in binding.get("upstream", []):
        path = ROOT / upstream.get("path", "")
        fail(errors, path.is_file(), "E_BINDING_UPSTREAM_MISSING:" + str(upstream.get("path")))
        if path.is_file():
            fail(errors, digest(path.read_bytes()) == upstream.get("sha256"), "E_BINDING_UPSTREAM_SHA:" + str(upstream.get("path")))
    for artifact in binding.get("artifacts", []):
        fail(errors, (ROOT / artifact).is_file(), "E_BINDING_ARTIFACT_MISSING:" + str(artifact))
    return errors


def validate(inv, check_binding=True):
    errors = validate_keysets(inv, INVENTORY_KEYSETS)
    if check_binding:
        try:
            binding = json.loads(BINDING.read_text(encoding="utf-8"))
            errors.extend("E_BINDING:" + error for error in validate_binding(binding))
        except Exception as exc:
            errors.append("E_BINDING_READ:" + str(exc))
    fail(errors, inv.get("schema") == "phcap08-09-wbs-ticket-research/v1", "E_SCHEMA")
    fail(errors, inv.get("status") == "research_premise_candidate", "E_STATUS")
    fail(errors, inv.get("authority_effect") == "none", "E_AUTHORITY")
    fail(errors, inv.get("meaning_change_applied") is False, "E_MEANING_CHANGE")
    fail(errors, inv.get("successor_requirement_ids") == [] and inv.get("human_decision_ref") is None, "E_DECISION_FIELDS")
    fail(errors, inv.get("equivalence_claim") is None, "E_EQUIVALENCE")
    fail(errors, inv.get("old_runtime_test_ci_execution") is False, "E_OLD_EXECUTION")
    unresolved = inv.get("unresolved")
    fail(errors, unresolved == EXPECTED_UNRESOLVED, "E_UNRESOLVED_BODY")
    fail(errors, digest(json.dumps(unresolved, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode()) == EXPECTED_UNRESOLVED_PIN, "E_UNRESOLVED_PIN")
    base = inv.get("base", {})
    fail(errors, base.get("commit") == EXPECTED_BASE, "E_BASE")
    fail(errors, base.get("origin") == "origin/main", "E_ORIGIN")
    fail(errors, base.get("branch") == "audit/phcap08-09-wbs-ticket-static", "E_BRANCH")

    disp_rows = jsonl(DISP)
    phase_rows = jsonl(PHASE)
    decision_rows = jsonl(DECISIONS)
    phase_inventory = json.loads(PHASE_INV.read_text(encoding="utf-8"))
    disp = {row.get("asset_id"): row for row in disp_rows}
    phase = {row.get("asset_id"): row for row in phase_rows}
    current_phase = {row.get("task_id"): row for row in phase_inventory.get("records", [])}

    prov = inv.get("ledger_provenance", {})
    for key, path in {
        "phase_inventory_path": PHASE_INV,
        "asset_ledger_path": DISP,
        "phase_classification_path": PHASE,
        "decision_ledger_path": DECISIONS,
    }.items():
        fail(errors, prov.get(key) == str(path.relative_to(ROOT)), "E_PROVENANCE_PATH:" + key)
    for key, path in {
        "phase_inventory_sha256": PHASE_INV,
        "asset_ledger_sha256": DISP,
        "phase_classification_sha256": PHASE,
        "decision_ledger_sha256": DECISIONS,
    }.items():
        fail(errors, prov.get(key) == digest(path.read_bytes()), "E_PROVENANCE_SHA:" + key)
    fail(errors, prov.get("asset_record_count") == len(disp_rows) == 4020, "E_ASSET_RECORD_COUNT")
    fail(errors, prov.get("phase_record_count") == len(phase_rows) == 4020, "E_PHASE_RECORD_COUNT")
    fail(errors, prov.get("decision_record_count") == len(decision_rows) == 58, "E_DECISION_RECORD_COUNT")
    fail(errors, prov.get("matching_decision_record_count") == 0, "E_MATCHING_DECISION_COUNT")

    tasks = inv.get("tasks", [])
    fail(errors, {task.get("task_id") for task in tasks} == {"PHCAP-08", "PHCAP-09"}, "E_TASK_SET")
    for task in tasks:
        fail(errors, task.get("inventory_record") == current_phase.get(task.get("task_id")), "E_TASK_SNAPSHOT:" + str(task.get("task_id")))
        record = task.get("inventory_record", {})
        fail(errors, record.get("new_build_allowed") is False, "E_TASK_NEW_BUILD:" + str(task.get("task_id")))
        fail(errors, record.get("authority_effect") == "inventory_and_work_projection_only", "E_TASK_AUTHORITY:" + str(task.get("task_id")))

    selected = inv.get("legacy_assets", [])
    selected_ids = {item.get("asset_id") for item in selected}
    fail(errors, selected_ids == EXPECTED_SELECTED_IDS, "E_SELECTED_SCOPE")
    fail(errors, len(selected) == 7 and prov.get("selected_asset_count") == 7, "E_SELECTED_COUNT")
    all_span_ids = set()
    for item in selected:
        aid = item.get("asset_id")
        old = disp.get(aid)
        ph = phase.get(aid)
        fail(errors, old is not None and ph is not None, "E_LEDGER_MISSING:" + str(aid))
        if old is None or ph is None:
            continue
        fail(errors, item.get("ledger_record") == ledger_state(old), "E_LEDGER_SNAPSHOT:" + str(aid))
        fail(errors, item.get("phase_classification_record") == phase_state(ph), "E_PHASE_SNAPSHOT:" + str(aid))
        fail(errors, item.get("source_sha256") == old.get("source_sha256"), "E_SOURCE_LEDGER_SHA:" + str(aid))
        fail(errors, old.get("asset_class") == "Historical", "E_ASSET_CLASS:" + str(aid))
        fail(errors, old.get("authority_status") == "historical", "E_ASSET_AUTHORITY:" + str(aid))
        fail(errors, old.get("disposition") == "unresolved", "E_ASSET_DISPOSITION:" + str(aid))
        fail(errors, old.get("implementation_status") == "unknown", "E_ASSET_IMPLEMENTATION:" + str(aid))
        fail(errors, old.get("consumer_refs") == [], "E_ASSET_CONSUMER:" + str(aid))
        fail(errors, old.get("decision_record_ref") is None, "E_ASSET_DECISION_REF:" + str(aid))
        fail(errors, ph.get("consumer_refs") == [] and ph.get("consumer_closure_status") == "pending", "E_PHASE_CONSUMER:" + str(aid))
        fail(errors, ph.get("legacy_implementation_status") == "unknown", "E_PHASE_IMPLEMENTATION:" + str(aid))
        fail(errors, ph.get("legacy_execution_performed") is False and ph.get("authority_effect") == "none", "E_PHASE_EXECUTION:" + str(aid))
        fail(errors, item.get("decision_history", {}).get("matching_decision_record_count") == 0, "E_DECISION_HISTORY_COUNT:" + str(aid))
        fail(errors, item.get("decision_history", {}).get("matching_decision_records") == [], "E_DECISION_HISTORY_ROWS:" + str(aid))
        fail(errors, item.get("decision_history", {}).get("status") == "no_matching_append_only_decision_record", "E_DECISION_HISTORY_STATUS:" + str(aid))
        fail(errors, not [row for row in decision_rows if aid in json.dumps(row, ensure_ascii=False)], "E_DECISION_MATCH:" + str(aid))

        archive_path = item.get("archive_path", "")
        fail(errors, archive_path == ARCHIVE_PREFIX + item.get("source_path", ""), "E_ARCHIVE_PATH:" + str(aid))
        source = ROOT / archive_path
        fail(errors, source.is_file(), "E_ARCHIVE_MISSING:" + str(aid))
        if not source.is_file():
            continue
        fail(errors, digest(source.read_bytes()) == item.get("source_sha256"), "E_SOURCE_SHA:" + str(aid))
        fail(errors, len(source.read_text(encoding="utf-8").splitlines()) == item.get("source_line_count"), "E_SOURCE_LINES:" + str(aid))
        local_spans = item.get("source_spans", [])
        expected_span_ids = set(EXPECTED_SPAN_IDS.get(aid, []))
        actual_span_ids = {span.get("span_id") for span in local_spans}
        fail(errors, actual_span_ids == expected_span_ids, "E_SPAN_ID_PIN:" + str(aid))
        for span in local_spans:
            sid = span.get("span_id")
            fail(errors, sid not in all_span_ids, "E_SPAN_DUP:" + str(sid))
            all_span_ids.add(sid)
            text = line_text(source, span.get("start_line"), span.get("end_line"))
            fail(errors, text is not None, "E_SPAN_BOUNDS:" + str(sid))
            if text is not None:
                fail(errors, text == span.get("exact_text"), "E_SPAN_TEXT:" + str(sid))
                fail(errors, digest(text.encode("utf-8")) == span.get("sha256"), "E_SPAN_SHA:" + str(sid))
                fail(errors, isinstance(span.get("role"), str) and bool(span.get("role")), "E_SPAN_ROLE:" + str(sid))
                fail(errors, span.get("role") == EXPECTED_SPAN_ROLES.get(aid, {}).get(sid), "E_SPAN_MEANING_PIN:" + str(sid))
        local_ids = {span.get("span_id") for span in local_spans}
        for key, required in (("failure_evidence", True), ("consumer_evidence", True)):
            entries = item.get(key, [])
            fail(errors, bool(entries) if required else True, "E_EVIDENCE_EMPTY:" + key + ":" + str(aid))
            for entry in entries:
                fail(errors, entry.get("span_id") in local_ids, "E_EVIDENCE_SPAN:" + key + ":" + str(aid))
                expected_finding = EXPECTED_EVIDENCE_FINDINGS.get(aid, {}).get("failure" if key == "failure_evidence" else "consumer")
                fail(errors, entry.get("finding") == expected_finding, "E_EVIDENCE_MEANING_PIN:" + key + ":" + str(aid))
        fail(errors, all(entry.get("execution_status") == "not_executed" for entry in item.get("failure_evidence", [])), "E_FAILURE_EXECUTION:" + str(aid))
        fail(errors, all(entry.get("closure_status") == "pending" for entry in item.get("consumer_evidence", [])), "E_CONSUMER_CLOSURE:" + str(aid))

    counts = inv.get("counts", {})
    fail(errors, counts.get("selected_legacy_assets") == len(selected) == 7, "E_COUNT_SELECTED")
    fail(errors, counts.get("source_spans") == len(all_span_ids), "E_COUNT_SPANS")
    fail(errors, counts.get("decision_records_found") == 0, "E_COUNT_DECISIONS")
    fail(errors, counts.get("legacy_consumer_refs_observed") == 0, "E_COUNT_CONSUMERS")
    fail(errors, counts.get("failure_receipts_observed") == 0, "E_COUNT_FAILURES")

    wbs = inv.get("wbs_name_audit", {})
    filename_matches, exact_basename, content_matches, archive_file_count, hidden_component_count = archive_wbs_audit()
    legacy_wbs = sorted(row.get("source_path") for row in disp_rows if "wbs" in row.get("source_path", "").lower())
    legacy_wb = sorted(row.get("source_path") for row in disp_rows if "work-breakdown" in row.get("source_path", "").lower())
    fail(errors, wbs.get("legacy_disposition_source_path_wbs_matches") == legacy_wbs == [], "E_WBS_LEDGER_PATH")
    fail(errors, wbs.get("legacy_disposition_source_path_work_breakdown_matches") == legacy_wb == [], "E_WBS_LEDGER_WORK_BREAKDOWN")
    fail(errors, wbs.get("exact_basename_matches") == exact_basename == [], "E_WBS_EXACT_BASENAME")
    fail(errors, wbs.get("archive_file_count") == archive_file_count == 4020, "E_WBS_ARCHIVE_FILE_COUNT")
    fail(errors, wbs.get("archive_hidden_component_file_count") == hidden_component_count == 248, "E_WBS_ARCHIVE_HIDDEN_COMPONENT_COUNT")
    fail(errors, wbs.get("archive_filename_match_count") == len(filename_matches) == 0, "E_WBS_FILENAME_COUNT")
    fail(errors, wbs.get("archive_content_term_match_count") == len(content_matches) == 45, "E_WBS_CONTENT_COUNT")
    fail(errors, wbs.get("archive_content_term_match_paths") == content_matches, "E_WBS_CONTENT_PATHS")
    fail(errors, wbs.get("interpretation") == EXPECTED_WBS_INTERPRETATION, "E_WBS_INTERPRETATION")
    fail(errors, wbs.get("interpretation_sha256") == EXPECTED_WBS_INTERPRETATION_DIGEST, "E_WBS_INTERPRETATION_DIGEST")
    fail(errors, digest(str(wbs.get("interpretation", "")).encode("utf-8")) == wbs.get("interpretation_sha256"), "E_WBS_INTERPRETATION_DIGEST_MATCH")
    fail(errors, wbs.get("same_name_asset_ids") == [] and wbs.get("same_name_asset_count") == 0, "E_WBS_SAME_NAME")
    near = wbs.get("near_equivalent_candidates", [])
    fail(errors, len(near) == 1 and near[0].get("asset_id") == "LEGACY-ASSET-B1B5271C3933B1F0F345", "E_WBS_NEAR_CANDIDATE")
    if near:
        fail(errors, near[0].get("same_name_identity") is False and near[0].get("semantic_equivalence") == "unresolved", "E_WBS_NEAR_IDENTITY")
    fail(errors, len(wbs.get("representative_near_capability_candidates", [])) == 3, "E_WBS_REPRESENTATIVES")
    fail(errors, counts.get("wbs_same_name_assets") == 0, "E_WBS_COUNT_FIELD")
    fail(errors, counts.get("wbs_archive_filename_matches") == 0, "E_WBS_FILENAME_FIELD")
    fail(errors, counts.get("wbs_archive_content_term_matches") == 45, "E_WBS_CONTENT_FIELD")

    ticket = inv.get("ticket_path_audit", {})
    matching_paths = sorted(row.get("source_path") for row in disp_rows if "ticket" in row.get("source_path", "").lower())
    catalog = ticket.get("asset_catalog", [])
    fail(errors, matching_paths == sorted(EXPECTED_TICKET_PATHS), "E_TICKET_PATHS")
    fail(errors, ticket.get("path_match_count") == len(matching_paths) == 9, "E_TICKET_PATH_COUNT")
    fail(errors, len(catalog) == 9 and sorted(row.get("source_path") for row in catalog) == matching_paths, "E_TICKET_CATALOG_SET")
    fail(errors, sorted(ticket.get("path_match_asset_ids", [])) == sorted(row.get("asset_id") for row in catalog), "E_TICKET_CATALOG_IDS")
    fail(errors, prov.get("ticket_path_asset_count") == 9 and counts.get("ticket_path_assets") == 9, "E_TICKET_COUNT_FIELD")
    for row in catalog:
        aid = row.get("asset_id")
        old = disp.get(aid)
        ph = phase.get(aid)
        fail(errors, old is not None and ph is not None, "E_TICKET_CATALOG_LEDGER:" + str(aid))
        if old is not None and ph is not None:
            fail(errors, row.get("source_sha256") == old.get("source_sha256"), "E_TICKET_CATALOG_SHA:" + str(aid))
            source = ARCHIVE / row.get("source_path", "")
            fail(errors, source.is_file(), "E_TICKET_CATALOG_SOURCE:" + str(aid))
            if source.is_file():
                fail(errors, row.get("source_line_count") == len(source.read_text(encoding="utf-8").splitlines()), "E_TICKET_CATALOG_LINES:" + str(aid))
            fail(errors, row.get("ledger_state") == ledger_state(old), "E_TICKET_CATALOG_LEDGER_STATE:" + str(aid))
            fail(errors, row.get("phase_classification_record") == ph, "E_TICKET_CATALOG_PHASE_STATE:" + str(aid))
            fail(errors, old.get("implementation_status") == "unknown" and old.get("consumer_refs") == [], "E_TICKET_CATALOG_UNKNOWN:" + str(aid))
    fail(errors, sorted(ticket.get("selected_representative_asset_ids", [])) == sorted([
        "LEGACY-ASSET-3A15E5645D2D2A59DFF5", "LEGACY-ASSET-BE8B151A0094B754FF20", "LEGACY-ASSET-06C7FAF2A0981A4778AC"
    ]), "E_TICKET_SELECTED_REPS")
    fail(errors, ticket.get("interpretation") == EXPECTED_TICKET_INTERPRETATION, "E_TICKET_INTERPRETATION")
    fail(errors, ticket.get("interpretation_sha256") == EXPECTED_TICKET_INTERPRETATION_DIGEST, "E_TICKET_INTERPRETATION_DIGEST")
    fail(errors, digest(str(ticket.get("interpretation", "")).encode("utf-8")) == ticket.get("interpretation_sha256"), "E_TICKET_INTERPRETATION_DIGEST_MATCH")

    units = inv.get("product_units", [])
    fail(errors, len(units) == 4 and sorted(unit.get("product") for unit in units) == EXPECTED_PRODUCTS, "E_PRODUCT_UNITS")
    by_product = {unit.get("product"): unit for unit in units}
    for product in EXPECTED_PRODUCTS:
        unit = by_product.get(product, {})
        fail(errors, unit.get("implementation_status") == "unknown", "E_PRODUCT_IMPLEMENTATION:" + product)
        fail(errors, unit.get("unit_boundary") == EXPECTED_UNIT_BOUNDARIES.get(product), "E_PRODUCT_BOUNDARY_PIN:" + product)
        fail(errors, unit.get("authority_status") in {"candidate_only", "adjacent_candidate_only"}, "E_PRODUCT_AUTHORITY:" + product)
        fail(errors, unit.get("acceptance_status") == "draft_unexecuted", "E_PRODUCT_ACCEPTANCE:" + product)
    for product in ("HELIX-Web", "HELIX-Web-OS"):
        unit = by_product.get(product, {})
        fail(errors, unit.get("status") == "adjacent_boundary_only", "E_WEB_DIRECT_PROMOTION:" + product)
        fail(errors, unit.get("phase_evidence") == [], "E_WEB_PHASE_PROMOTION:" + product)
    edges = inv.get("candidate_connections", [])
    fail(errors, len(edges) == 4, "E_CONNECTION_COUNT")
    edge_ids = set()
    for edge in edges:
        edge_id = edge.get("connection_id")
        edge_ids.add(edge_id)
        fail(errors, edge.get("status") in {"candidate", "adjacent_candidate"}, "E_CONNECTION_AUTHORITY:" + str(edge_id))
        fail(errors, edge.get("from") in EXPECTED_PRODUCTS and edge.get("to") in EXPECTED_PRODUCTS, "E_CONNECTION_PRODUCT:" + str(edge_id))
        fail(errors, edge.get("meaning") == EXPECTED_CONNECTION_MEANINGS.get(edge_id), "E_CONNECTION_MEANING_PIN:" + str(edge_id))
    fail(errors, edge_ids == set(EXPECTED_CONNECTION_MEANINGS), "E_CONNECTION_ID_SET")

    joins = inv.get("candidate_phase_joins", [])
    fail(errors, {join.get("phase_id") for join in joins} == {"PHCAP-08", "PHCAP-09"}, "E_PHASE_JOIN_SET")
    for join in joins:
        phase_id = join.get("phase_id")
        expected_selected = sorted(aid for aid in selected_ids if phase_id in phase.get(aid, {}).get("candidate_phase_targets", []))
        fail(errors, sorted(join.get("selected_asset_ids", [])) == expected_selected, "E_PHASE_JOIN_SELECTED:" + str(phase_id))
        expected_catalog = expected_selected
        if phase_id == "PHCAP-09":
            expected_catalog = sorted(row.get("asset_id") for row in catalog if phase_id in row.get("phase_classification_record", {}).get("candidate_phase_targets", []))
        fail(errors, sorted(join.get("catalog_asset_ids", [])) == expected_catalog, "E_PHASE_JOIN_CATALOG:" + str(phase_id))

    refs = inv.get("current_refs", [])
    fail(errors, len(refs) == counts.get("current_refs") == 10, "E_CURRENT_REF_COUNT")
    ref_ids = set()
    for ref in refs:
        rid = ref.get("ref_id")
        fail(errors, rid not in ref_ids, "E_CURRENT_REF_DUP:" + str(rid))
        ref_ids.add(rid)
        fail(errors, rid in EXPECTED_CURRENT_REF_IDS, "E_CURRENT_REF_ID_PIN:" + str(rid))
        expected_meta = EXPECTED_CURRENT_REF_META.get(rid, {})
        for meta_key, expected_value in expected_meta.items():
            fail(errors, ref.get(meta_key) == expected_value, "E_CURRENT_REF_META_PIN:" + str(rid) + ":" + meta_key)
        path = ROOT / ref.get("path", "")
        fail(errors, path.is_file(), "E_CURRENT_MISSING:" + str(rid))
        if not path.is_file():
            continue
        fail(errors, digest(path.read_bytes()) == ref.get("sha256"), "E_CURRENT_SHA:" + str(rid))
        text = line_text(path, ref.get("start_line"), ref.get("end_line"))
        fail(errors, text is not None and text == ref.get("exact_text"), "E_CURRENT_TEXT:" + str(rid))
        if text is not None:
            fail(errors, digest(text.encode("utf-8")) == ref.get("line_sha256"), "E_CURRENT_LINE_SHA:" + str(rid))
        fail(errors, ref.get("implementation_status") == "not_evidence" and ref.get("execution_status") == "not_run", "E_CURRENT_PROMOTION:" + str(rid))
    fail(errors, ref_ids == EXPECTED_CURRENT_REF_IDS, "E_CURRENT_REF_ID_SET")
    direct = sum(ref.get("classification") == "direct_current_ref" for ref in refs)
    adjacent = sum(ref.get("classification") == "adjacent_current_ref" for ref in refs)
    boundary = sum(ref.get("classification") == "boundary_current_ref" for ref in refs)
    fail(errors, direct == 4, "E_CURRENT_DIRECT_COUNT")
    fail(errors, adjacent == 4, "E_CURRENT_ADJACENT_COUNT")
    fail(errors, boundary == 2, "E_CURRENT_BOUNDARY_COUNT")

    boundary_state = inv.get("failure_consumer_boundary", {})
    for key in ("selected_asset_ledger_consumer_refs_observed", "selected_asset_phase_consumer_refs_observed", "failure_receipts_observed", "consumer_closure_observed"):
        fail(errors, boundary_state.get(key) == 0, "E_BOUNDARY_COUNT:" + key)
    fail(errors, boundary_state.get("legacy_execution_flags_all_false") is True, "E_BOUNDARY_EXECUTION")
    fail(errors, inv.get("unresolved") == EXPECTED_UNRESOLVED, "E_UNRESOLVED_FINAL")
    fail(errors, counts.get("product_units") == 4 and counts.get("candidate_connections") == 4, "E_COUNT_PRODUCTS_CONNECTIONS")
    return errors


if __name__ == "__main__":
    try:
        inventory = json.loads(INV.read_text(encoding="utf-8"))
    except Exception as exc:
        print("FAIL PHCAP-08/09 validator: inventory parse", exc)
        raise SystemExit(1)
    errors = validate(inventory)
    if errors:
        print("FAIL PHCAP-08/09 validator")
        print("\n".join(errors))
        raise SystemExit(1)
    print("PASS PHCAP-08/09 validator: static source/phase/product/WBS/ticket/unknown checks")
