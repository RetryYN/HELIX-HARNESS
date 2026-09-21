#!/usr/bin/env python3
"""Wave10の要求・旧asset直接semantic reviewをarchive実行なしで静的検証する。"""
import hashlib
import json
import re
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
GOV = ROOT / "docs/governance"
AUDIT = GOV / "audits/source-rebaseline"
ARCH = ROOT / "archive/legacy-generation-2026-09-14/root"
REV = "49057f92c9738887624d5d083dcbc5cb39e7c71f"
BATCH = "LEGACY-SEMANTIC-WAVE10-2026-09-21"
LEDGER = GOV / "legacy-requirement-direct-semantic-review-wave10.jsonl"
META = GOV / "legacy-requirement-direct-semantic-review-wave10.meta.json"
STATUS = AUDIT / "legacy-requirement-direct-semantic-review-wave10-status-2026-09-21.md"
METHOD = AUDIT / "legacy-requirement-direct-semantic-review-wave10-method-2026-09-21.md"
PREMISE = AUDIT / "legacy-requirement-direct-semantic-review-wave10-premise-packet-2026-09-21.md"
RESPONSE = AUDIT / "legacy-requirement-direct-semantic-review-wave10-review-response-2026-09-21.md"
CATALOG = GOV / "legacy-asset-phase-product-classification-bootstrap.jsonl"
CROSS = GOV / "legacy-requirement-implementation-crosswalk-bootstrap.jsonl"
DECOMP = GOV / "legacy-ir-product-unit-decomposition-bootstrap.jsonl"
MANIFEST = ROOT / "archive/legacy-generation-2026-09-14/MANIFEST.sha256"
PHASE = GOV / "phase-capability-inventory.json"
PRIOR = [(GOV / f"legacy-requirement-direct-semantic-review-wave{n}.jsonl",
          GOV / f"legacy-requirement-direct-semantic-review-wave{n}.meta.json")
         for n in range(1, 10)]

UNITS = {
    "IRUNIT-HIL-BR-04-HELIX-HARNESS": {
        "atoms": [
            {"atom_id":"BR04-HARNESS-A01","kind":"orthogonal_issue_fields","text":"development style、case-driven activation、specialist capability、runtime modeをIssueの別fieldで保持する","source_fragments":["全Issueはdevelopment style、case-driven activation、specialist capability、runtime modeを別fieldで持つ"],"shared_with_units":[],"boundary_review_state":"product_boundary_pending_human_decision"},
            {"atom_id":"BR04-HARNESS-A02","kind":"reverse_preimplementation_task","text":"Reverse R0–R4が適用されるIssueでは実装前の先行taskとする","source_fragments":["Reverse R0–R4が適用されるIssueでは実装前の先行taskとし"],"shared_with_units":[],"boundary_review_state":"product_boundary_pending_human_decision"},
            {"atom_id":"BR04-HARNESS-A03","kind":"no_omitted_default","text":"省略値を持たない","source_fragments":["省略値を持たない"],"shared_with_units":[],"boundary_review_state":"product_boundary_pending_human_decision"},
        ],
        "anchors":["HIL-BR-04","development style","case-driven activation","specialist capability","runtime mode","Reverse R0–R4","省略値を持たない","development_style","case_driven_model","specialist_capability","execution_mode"],
        "assets":{"requirement":"LEGACY-ASSET-A60CF91DD2AF6693E6F9","design":"LEGACY-ASSET-8B4A62AA38386CC475BA","implementation":"LEGACY-ASSET-C49354AF8D8E8DFE5B1D"},
    },
    "IRUNIT-HIL-BR-13-HELIX-HARNESS": {
        "atoms": [
            {"atom_id":"BR13-HARNESS-A01","kind":"screen_route_classification","text":"全PLANをprototype_requiredまたはnot_applicableへ明示分類する","source_fragments":["全PLANは画面工程を`prototype_required`または`not_applicable`へ明示分類する"],"shared_with_units":[],"boundary_review_state":"product_boundary_pending_human_decision"},
            {"atom_id":"BR13-HARNESS-A02","kind":"ui_freeze_sequence","text":"画面対象はprototype、walkthrough、要求back-propagation、agreement後に要件をfreezeする","source_fragments":["画面対象はprototype→walkthrough→要求back-propagation→agreement後に要件をfreezeし"],"shared_with_units":[],"boundary_review_state":"product_boundary_pending_human_decision"},
            {"atom_id":"BR13-HARNESS-A03","kind":"non_ui_skip_receipt","text":"画面非対象は証拠付きskip receiptでのみ通過する","source_fragments":["画面非対象は証拠付きskip receiptでのみ通過する"],"shared_with_units":[],"boundary_review_state":"product_boundary_pending_human_decision"},
        ],
        "anchors":["HIL-BR-13","prototype_required","not_applicable","画面工程","walkthrough","back-propagation","skip receipt","HIL_SCREEN_APPLICABILITY_INVALID","HIL_SCREEN_SKIP_EVIDENCE_MISSING"],
        "assets":{"requirement":"LEGACY-ASSET-A60CF91DD2AF6693E6F9","design":"LEGACY-ASSET-A65B5C20721DD2149886","implementation":"LEGACY-ASSET-35B6DB08FC6E6881DA37"},
    },
    "IRUNIT-HIL-FR-43-HELIX-HARNESS": {
        "atoms": [
            {"atom_id":"FR43-HARNESS-A01","kind":"acceptance_constraint_atomization","text":"入力を1 acceptance outcomeまたは1 constraint単位のatomへ分解する","source_fragments":["Requirement Translatorは入力を1 acceptance outcomeまたは1 constraint単位のatomへ分解し"],"shared_with_units":[],"boundary_review_state":"product_boundary_pending_human_decision"},
            {"atom_id":"FR43-HARNESS-A02","kind":"translation_metadata","text":"authority、source span、ambiguity、service候補、domain term、design obligation候補を出力する","source_fragments":["authority、source span、ambiguity、service候補、domain term、design obligation候補を出力する"],"shared_with_units":[],"boundary_review_state":"product_boundary_pending_human_decision"},
            {"atom_id":"FR43-HARNESS-A03","kind":"challenge_routing","text":"複合要求、意味衝突、根拠欠落は自動確定せずchallenge queueへ送る","source_fragments":["複合要求、意味衝突、根拠欠落は自動確定せずchallenge queueへ送る"],"shared_with_units":[],"boundary_review_state":"product_boundary_pending_human_decision"},
            {"atom_id":"FR43-HARNESS-A04","kind":"translation_evidence_artifacts","text":"requirement atom、translation receipt、ambiguity/challenge finding","source_fragments":["requirement atom、translation receipt、ambiguity/challenge finding"],"shared_with_units":[],"boundary_review_state":"product_boundary_pending_human_decision"},
        ],
        "anchors":["HIL-FR-43","Requirement Translator","acceptance outcome","source span","ambiguity","challenge queue","translation receipt","design obligation","REFINEMENT_SOURCE_PROJECTION_DRIFT","REFINEMENT_TRACE_INCOMPLETE"],
        "assets":{"requirement":"LEGACY-ASSET-A60CF91DD2AF6693E6F9","design":"LEGACY-ASSET-65AD8D5F8D976121F583","implementation":"LEGACY-ASSET-F70E61EEE69BB49DCC2B"},
    },
}

NEGATIVE_MUTATION_CLASSES = (
    "parent_revision", "catalog_digest", "archive_manifest_digest", "asset_id", "source_line_range", "excerpt_digest",
    "artifact_kind", "semantic_status", "phase_copy", "atom_deletion", "shared_boundary", "search_receipt",
    "prior_overlap", "status_count",
)

def fail(message):
    raise AssertionError(message)

def require(value, message):
    if not value:
        fail(message)

def load_jsonl(path):
    return [json.loads(line) for line in path.read_text().splitlines() if line.strip()]

def digest_bytes(value):
    return "sha256:" + hashlib.sha256(value).hexdigest()

def canon(value):
    return digest_bytes(json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode())

def git_blob(revision, path):
    return subprocess.run(["git", "show", f"{revision}:{path}"], cwd=ROOT, check=True, capture_output=True).stdout

def exact_anchor(anchor, text):
    if re.fullmatch(r"[A-Za-z0-9_/-]+", anchor):
        require(len(anchor) >= 3, "短い英数字anchor")
        return any((m.start() == 0 or not text[m.start() - 1].isalnum())
                   and (m.end() == len(text) or not text[m.end()].isalnum())
                   for m in re.finditer(re.escape(anchor), text))
    return len(anchor) >= 2 and anchor in text

def binding_anchor(anchor, text):
    """source fragmentの日本語隣接を許容するcontrolled token照合。"""
    if re.fullmatch(r"[A-Za-z0-9_/-]+", anchor):
        require(len(anchor) >= 3, "短いbinding anchor")
        return any((m.start() == 0 or not re.fullmatch(r"[A-Za-z0-9]", text[m.start() - 1]))
                   and (m.end() == len(text) or not re.fullmatch(r"[A-Za-z0-9]", text[m.end()]))
                   for m in re.finditer(re.escape(anchor), text))
    return len(anchor) >= 2 and anchor in text

def meaningful_uncovered(text, fragments):
    covered = [False] * len(text)
    for fragment in fragments:
        start = 0
        while (index := text.find(fragment, start)) >= 0:
            covered[index:index + len(fragment)] = [True] * len(fragment)
            start = index + 1
    ignored = set(" \t\r\n。、・|`")
    remaining = "".join(" " if covered[i] or char in ignored else char for i, char in enumerate(text))
    return re.findall(r"\S+", remaining)

def archive_file(asset, catalog):
    return ARCH / catalog[asset]["source_path"]

def excerpt(asset, start, end, catalog):
    lines = archive_file(asset, catalog).read_text(errors="replace").splitlines()
    require(1 <= start <= end <= len(lines), f"line range: {asset}:{start}-{end}")
    return "\n".join(lines[start - 1:end]) + "\n"

def manifest_map():
    result = {}
    for line in MANIFEST.read_text().splitlines():
        if line.strip():
            file_digest, path = line.split("  ", 1)
            result[path] = file_digest
    return result

def search(unit, catalog):
    return sorted(asset for asset, record in catalog.items()
                  if any(exact_anchor(anchor, archive_file(asset, catalog).read_text(errors="replace"))
                         for anchor in UNITS[unit]["anchors"]))

def expected_role(unit, asset):
    for role, selected in UNITS[unit]["assets"].items():
        if asset == selected:
            return role
    fail(f"unknown edge asset: {unit}/{asset}")

def expected_coverage(unit, records):
    inventory = UNITS[unit]["atoms"]
    ids = [atom["atom_id"] for atom in inventory]
    unit_records = [row for row in records if row["unit_candidate_id"] == unit]
    contract = sorted({atom for row in unit_records if row["semantic_relation"] == "same_requirement_id_exact_source_contract_not_implementation" for atom in row["covered_requirement_atom_ids"]})
    pending_kind_assets = {"LEGACY-ASSET-65AD8D5F8D976121F583"}
    design = sorted({atom for row in unit_records if row["semantic_relation"] == "design_contract_evidence" and row["asset_id"] not in pending_kind_assets for atom in row["covered_requirement_atom_ids"]})
    design_pending_kind = sorted({atom for row in unit_records if row["semantic_relation"] == "design_contract_evidence" and row["asset_id"] in pending_kind_assets for atom in row["covered_requirement_atom_ids"]})
    confirmed = sorted({atom for row in unit_records if row["artifact_evidence_kind"] == "implementation_source" and row["semantic_link_status"] == "confirmed" for atom in row["covered_requirement_atom_ids"]})
    unresolved = sorted({atom for row in unit_records if row["artifact_evidence_kind"] == "implementation_source" and row["semantic_link_status"] == "unresolved" for atom in row["covered_requirement_atom_ids"]} - set(confirmed))
    shared = sorted(atom["atom_id"] for atom in inventory if atom["shared_with_units"])
    exclusive = sorted(set(ids) - set(shared))
    uncovered = sorted(set(ids) - set(confirmed) - set(unresolved))
    no_evidence = sorted(set(ids) - set(design) - set(confirmed) - set(unresolved))
    result = {"atom_inventory": inventory, "connective_fragments": [], "contract_confirmed_atom_ids": contract, "design_partial_atom_ids": design, "design_partial_pending_kind_atom_ids": design_pending_kind, "implementation_confirmed_atom_ids": confirmed, "implementation_unresolved_atom_ids": unresolved, "implementation_uncovered_atom_ids": uncovered, "no_evidence_atom_ids": no_evidence, "shared_atom_ids": shared, "product_exclusive_atom_ids": exclusive}
    for key in list(result):
        result[key + "_sha256"] = canon(result[key])
    result.update({"contract_semantic_edge_coverage_complete": set(contract) == set(ids), "semantic_edge_coverage_complete": not unresolved and not uncovered, "no_shared_source_span": not shared, "product_boundary_decision_complete": False, "product_exclusive_contract_coverage_complete": bool(exclusive) and set(exclusive) <= set(contract)})
    return result

def main():
    require(len(NEGATIVE_MUTATION_CLASSES) >= 12, "negative mutation想定不足")
    records = load_jsonl(LEDGER)
    meta = json.loads(META.read_text())
    catalog = {row["asset_id"]: row for row in load_jsonl(CATALOG)}
    cross = {row["unit_candidate_id"]: row for row in load_jsonl(CROSS)}
    decomp = {unit["unit_candidate_id"]: unit for row in load_jsonl(DECOMP) for unit in row["candidate_units"]}
    manifest = manifest_map()
    require(len(catalog) == 4020, "catalog件数")
    meta_fields = {"schema_revision","status","authority_effect","source_revision","batch_id","parent_revision","legacy_execution_performed","consumer_closure_status","new_build_allowed","record_count","output_sha256","inputs","prior_review_batches","reviewed_edges","reviewed_unit_ids","cumulative_reviewed_edge_count","cumulative_reviewed_unit_count","semantic_link_counts","bounded_search_receipts","unit_aggregates"}
    require(set(meta) == meta_fields, "meta field集合不一致")
    require(meta["schema_revision"] == 10 and meta["status"] == "research_premise_candidate", "meta schema/status")
    require(meta["parent_revision"] == REV and meta["batch_id"] == BATCH, "parent/batch")
    require(meta["authority_effect"] == "none" and not meta["legacy_execution_performed"] and meta["consumer_closure_status"] == "pending" and not meta["new_build_allowed"], "authority boundary")
    require(len(records) == meta["record_count"] == 9, "record count")
    require(digest_bytes(LEDGER.read_bytes()) == meta["output_sha256"], "ledger output digest")
    input_paths = [MANIFEST, CATALOG, CROSS, DECOMP, PHASE] + [path for pair in PRIOR for path in pair]
    expected_inputs = {str(path.relative_to(ROOT)): digest_bytes(path.read_bytes()) for path in input_paths}
    require(meta["inputs"] == expected_inputs, "全inputs digest")
    for path, value in expected_inputs.items():
        require(digest_bytes(git_blob(REV, path)) == value, f"parent git blob input: {path}")
    require(set(meta["reviewed_unit_ids"]) == set(UNITS), "review unit")
    amap = {unit: {atom["atom_id"]: atom for atom in data["atoms"]} for unit, data in UNITS.items()}
    edges = {(row["unit_candidate_id"], row["asset_id"]) for row in records}
    expected_edges = {(unit, asset) for unit, data in UNITS.items() for asset in data["assets"].values()}
    require(edges == expected_edges, "edge exact set")
    require(meta["reviewed_edges"] == [{"unit_candidate_id": row["unit_candidate_id"], "asset_id": row["asset_id"]} for row in records], "meta edge order")
    for unit, data in UNITS.items():
        require(unit in cross and unit in decomp, f"unit input: {unit}")
        require(cross[unit]["product_scope"] == ["HELIX-HARNESS"], f"product scope: {unit}")
        require(decomp[unit]["product_target"] == "HELIX-HARNESS" and decomp[unit].get("shared_source_overlaps", []) == [], f"boundary/shared span: {unit}")
        statement = " ".join(cross[unit]["source_text_spans"])
        fragments = [fragment for atom in data["atoms"] for fragment in atom["source_fragments"]]
        require(not meaningful_uncovered(statement, fragments), f"atom loss: {unit}: {meaningful_uncovered(statement, fragments)}")
        require(not any(a["source_fragments"][0] in b["source_fragments"][0] or b["source_fragments"][0] in a["source_fragments"][0] for i, a in enumerate(data["atoms"]) for b in data["atoms"][i + 1:]), f"atom overlap: {unit}")
        for atom in data["atoms"]:
            require(not atom["shared_with_units"], f"shared atom declaration: {unit}/{atom['atom_id']}")
        candidates = search(unit, catalog)
        selected = sorted(data["assets"].values())
        remaining = sorted(set(candidates) - set(selected))
        receipt = {"query":{"match_mode":"archive_file_contains_any_utf8_anchor","anchors":data["anchors"]}, "catalog_record_count":4020, "candidate_asset_count":len(candidates), "candidate_asset_ids_sha256":canon(candidates), "selected_asset_ids":selected, "unreviewed_asset_count":len(remaining), "unreviewed_asset_ids_sha256":canon(remaining)}
        require(meta["bounded_search_receipts"][unit] == receipt, f"bounded search receipt: {unit}")
        require(set(selected) <= set(candidates), f"selected outside search: {unit}")
    for row in records:
        unit = row["unit_candidate_id"]; asset = row["asset_id"]; data = UNITS[unit]; cat = catalog[asset]; unit_cross = cross[unit]; rid = row["review_id"]; role = expected_role(unit, asset); atoms = amap[unit]
        record_fields = {"artifact_evidence_kind","asset_id","authority_effect","batch_id","bounded_search_query","candidate_membership_semantics","candidate_phase_targets","candidate_product_targets","catalog_legacy_implementation_status","classification_id","consumer_closure_evidence","consumer_closure_status","counterevidence","coverage","covered_requirement_atom_ids","covered_requirement_atoms","current_requirement_implementation_status","evidence_atom_bindings","evidence_refs","legacy_asset_evidence_state","legacy_execution_status","legacy_requirement_implementation_contribution","new_build_allowed","observed_consumer_refs","phase_authority_status","phase_candidates","product_alignment_status","product_scope","review_id","review_scope","schema_revision","selection_route","semantic_link_status","semantic_relation","source_path","source_requirement_id","source_sha256","source_statement_semantic_digest","source_text_spans","unit_candidate_id","unresolved"}
        require(set(row) == record_fields, f"record field集合: {rid}")
        require(row["schema_revision"] == 10 and row["batch_id"] == BATCH and row["authority_effect"] == "none", f"record schema: {rid}")
        require(row["selection_route"] == "bounded_global_search" and row["candidate_membership_semantics"] == "bounded_global_search_candidate_only_not_semantic_evidence", f"search authority: {rid}")
        require(row["bounded_search_query"] == {"match_mode":"archive_file_contains_any_utf8_anchor","anchors":data["anchors"]}, f"query: {rid}")
        require(row["phase_authority_status"] == "candidate_unchanged" and row["phase_candidates"] == unit_cross["direct_phase_candidates"], f"phase exact: {rid}")
        for key in ("source_requirement_id","source_statement_semantic_digest","source_text_spans","product_scope"):
            require(row[key] == unit_cross[key], f"crosswalk {key}: {rid}")
        catalog_mapping = {"artifact_evidence_kind":"artifact_evidence_kind","classification_id":"classification_id","source_path":"source_path","source_sha256":"source_sha256","candidate_phase_targets":"candidate_phase_targets","candidate_product_targets":"candidate_product_targets","legacy_asset_evidence_state":"implementation_evidence_state","catalog_legacy_implementation_status":"legacy_implementation_status","observed_consumer_refs":"consumer_refs"}
        for output, source in catalog_mapping.items():
            require(row[output] == cat[source], f"catalog exact {output}: {rid}")
        require(hashlib.sha256(archive_file(asset, catalog).read_bytes()).hexdigest() == row["source_sha256"] == manifest[row["source_path"]], f"archive/manifest digest: {rid}")
        require(row["legacy_execution_status"] == "not_run" and row["current_requirement_implementation_status"] == "not_established" and row["consumer_closure_status"] == "pending" and not row["consumer_closure_evidence"] and not row["new_build_allowed"], f"status boundary: {rid}")
        ids = row["covered_requirement_atom_ids"]
        require(len(ids) == len(set(ids)) and row["covered_requirement_atoms"] == [atoms[x] for x in ids], f"atom object: {rid}")
        expected_relation = {"requirement":"same_requirement_id_exact_source_contract_not_implementation","design":"design_contract_evidence","implementation":"partial_implementation_behavior_evidence_unexecuted"}[role]
        expected_status = {"requirement":"confirmed","design":"unresolved","implementation":"unresolved"}[role]
        expected_contribution = {"requirement":"contract_only_no_implementation_claim","design":"design_contract_only_no_implementation_claim","implementation":"partial_static_implementation_candidate_unresolved_no_implementation_claim"}[role]
        require(row["semantic_relation"] == expected_relation and row["semantic_link_status"] == expected_status and row["legacy_requirement_implementation_contribution"] == expected_contribution, f"relation/contribution: {rid}")
        if role == "requirement":
            require(row["artifact_evidence_kind"] == "requirement", f"requirement artifact: {rid}")
        elif role == "implementation":
            require(row["artifact_evidence_kind"] == "implementation_source", f"implementation artifact: {rid}")
        elif asset == "LEGACY-ASSET-65AD8D5F8D976121F583":
            require(row["artifact_evidence_kind"] == "requirement" and row["source_path"].startswith("docs/design/"), f"FR43 design catalog kind/path mismatch: {rid}")
            require(any("catalog artifact_evidence_kind=requirement" in item and "design path" in item for item in row["counterevidence"]), f"FR43 mismatch counterevidence: {rid}")
            require("実装寄与を認めない" in " ".join(row["counterevidence"]), f"FR43 mismatch overclaim: {rid}")
        else:
            require(row["artifact_evidence_kind"] in {"design","plan"}, f"design artifact: {rid}")
        excerpts = []; relations = set()
        for evidence in row["evidence_refs"]:
            require(evidence["archive_path"] == str(archive_file(asset, catalog).relative_to(ROOT)), f"evidence path: {rid}")
            text = excerpt(asset, evidence["line_start"], evidence["line_end"], catalog)
            require(digest_bytes(text.encode()) == evidence["excerpt_sha256"], f"excerpt digest: {rid}")
            excerpts.append(text); relations.add(evidence["source_requirement_relation"])
        relation_evidence = "same_requirement_id_exact_restatement" if role == "requirement" else expected_relation
        require(relations == {relation_evidence}, f"evidence relation: {rid}")
        bound = []
        for binding in row["evidence_atom_bindings"]:
            aid = binding["atom_id"]
            require(aid in ids and binding["evidence_ref_indexes"] and all(0 <= i < len(excerpts) for i in binding["evidence_ref_indexes"]), f"binding index: {rid}")
            joined = "\n".join(excerpts[i] for i in binding["evidence_ref_indexes"])
            require(all(term in joined for term in binding["required_terms"]), f"binding required term: {rid}/{aid}")
            if binding["match_mode"] == "literal_source_fragment":
                require(all(fragment in joined for fragment in atoms[aid]["source_fragments"]), f"literal atom: {rid}/{aid}")
            else:
                anchors = binding.get("source_fragment_anchors", []); fragments = "".join(atoms[aid]["source_fragments"])
                require(binding["match_mode"] == "controlled_term_set_partial" and anchors, f"partial binding mode: {rid}/{aid}")
                require(all(binding_anchor(anchor, fragments) and any(binding_anchor(anchor, term) for term in binding["required_terms"]) for anchor in anchors), f"partial binding anchor: {rid}/{aid}")
            bound.append(aid)
        require(sorted(bound) == sorted(ids), f"binding coverage: {rid}")
    aggregates = {item["unit_candidate_id"]: item for item in meta["unit_aggregates"]}
    require(set(aggregates) == set(UNITS), "aggregate unit set")
    for unit, aggregate in aggregates.items():
        fields = {"unit_candidate_id","product_scope","reviewed_edge_count","semantic_link_counts","atom_coverage_receipt","phase_authority_status","phase_capability_assessments","current_requirement_implementation_status","legacy_requirement_implementation_status","degradation_assessment","direct_confirmed_implementation_asset_ids","consumer_closure_status","new_build_allowed"}
        require(set(aggregate) == fields, f"aggregate fields: {unit}")
        require(aggregate["product_scope"] == ["HELIX-HARNESS"] and aggregate["reviewed_edge_count"] == 3, f"aggregate scope/count: {unit}")
        require(aggregate["atom_coverage_receipt"] == expected_coverage(unit, records), f"coverage aggregate/digests: {unit}")
        expected_phase = [{key: item[key] for key in ("phase_id","current_status","legacy_capability_status","transition_assessment")} for item in cross[unit]["phase_capability_evidence"]]
        require(aggregate["phase_authority_status"] == "candidate_unchanged" and aggregate["phase_capability_assessments"] == expected_phase and {item["phase_id"] for item in expected_phase} == set(cross[unit]["direct_phase_candidates"]), f"phase aggregate: {unit}")
        receipt = aggregate["atom_coverage_receipt"]
        require(receipt["no_shared_source_span"] and not receipt["shared_atom_ids"] and not receipt["product_boundary_decision_complete"], f"shared/boundary aggregate: {unit}")
        unit_rows = [row for row in records if row["unit_candidate_id"] == unit]
        require(aggregate["semantic_link_counts"] == {state: sum(row["semantic_link_status"] == state for row in unit_rows) for state in ("confirmed","rejected","unresolved")}, f"aggregate status count: {unit}")
        require(aggregate["current_requirement_implementation_status"] == "not_established" and aggregate["legacy_requirement_implementation_status"] == "unknown_pending_direct_asset_semantic_review" and aggregate["degradation_assessment"] == "unresolved_legacy_implementation_unknown" and not aggregate["direct_confirmed_implementation_asset_ids"] and aggregate["consumer_closure_status"] == "pending" and not aggregate["new_build_allowed"], f"aggregate status boundary: {unit}")
    counts = {state: sum(row["semantic_link_status"] == state for row in records) for state in ("confirmed","rejected","unresolved")}
    require(meta["semantic_link_counts"] == counts == {"confirmed":3,"rejected":0,"unresolved":6}, "batch status counts")
    prior_edges = set(); prior_units = set(); prior_batches = []
    for ledger, meta_path in PRIOR:
        previous = json.loads(meta_path.read_text()); prior_edges |= {(item["unit_candidate_id"], item["asset_id"]) for item in previous["reviewed_edges"]}; prior_units |= set(previous["reviewed_unit_ids"])
        prior_batches.append({"batch_id":previous["batch_id"],"ledger_sha256":digest_bytes(ledger.read_bytes()),"meta_sha256":digest_bytes(meta_path.read_bytes())})
    require(not edges & prior_edges and meta["prior_review_batches"] == prior_batches, "prior wave overlap/digest")
    require(meta["cumulative_reviewed_edge_count"] == len(prior_edges | edges) == 87 and meta["cumulative_reviewed_unit_count"] == len(prior_units | set(UNITS)) == 29, "cumulative counts")
    total_units = sum(len(row["candidate_units"]) for row in load_jsonl(DECOMP))
    remaining_units = total_units - len(prior_units | set(UNITS))
    require(total_units == 218 and remaining_units == 189, "remaining unit arithmetic")
    status = STATUS.read_text()
    require(re.search(r"218要求unitのうち新たに3 unit、候補edge 9件", status) and re.search(r"wave 1〜9と合わせて29 unit、87 edge", status) and re.search(r"残る189 unitは未着手", status), "status counts")
    require("new_build_allowed:false" in status or "`new_build_allowed:false`" in status, "status build boundary")
    require("正規分解台帳にHELIX-Web／Web-OS unitは0件" in status, "status Web/Web-OS boundary")
    require(not any(product in {"HELIX-Web","HELIX-Web-OS"} for row in cross.values() for product in row["product_scope"]), "crosswalk Web/Web-OS boundary")
    require(not any(product in {"HELIX-Web","HELIX-Web-OS"} for unit in decomp.values() for product in ([unit.get("product_target")] if unit.get("product_target") else []) + list(unit.get("connected_product_targets") or [])), "decomposition Web/Web-OS boundary")
    require(not {"implemented","tested","operational"} & set(re.findall(r"`([^`\n]+)`", status)), "status過大主張")
    table = [[cell.strip().strip("`") for cell in line.strip("|").split("|")] for line in status.splitlines() if line.startswith("|")]
    observed_phase = {(row[0],row[1],row[2],row[3],row[4]) for row in table if len(row) == 5 and row[0] in UNITS and row[1].startswith("PHCAP-")}
    expected_phase = {(unit,item["phase_id"],item["current_status"],item["legacy_capability_status"],item["transition_assessment"]) for unit, aggregate in aggregates.items() for item in aggregate["phase_capability_assessments"]}
    require(observed_phase == expected_phase, "status phase table exact")
    for unit, aggregate in aggregates.items():
        state = [row for row in table if len(row) == 6 and row[1] == unit]
        require(len(state) == 1 and state[0][3:] == [aggregate["legacy_requirement_implementation_status"], aggregate["current_requirement_implementation_status"], aggregate["degradation_assessment"]], f"status unit row: {unit}")
        atom = [row for row in table if len(row) == 9 and row[0] == unit]
        require(len(atom) == 1, f"status atom row: {unit}")
        coverage = aggregate["atom_coverage_receipt"]
        expected = [len(coverage[key]) for key in ("atom_inventory","contract_confirmed_atom_ids","design_partial_atom_ids","design_partial_pending_kind_atom_ids","implementation_confirmed_atom_ids","implementation_unresolved_atom_ids","implementation_uncovered_atom_ids","no_evidence_atom_ids")]
        require([int(value) for value in atom[0][1:]] == expected, f"status atom counts: {unit}")
    require(METHOD.exists() and PREMISE.exists() and RESPONSE.exists(), "method/premise/response artifacts")
    method = METHOD.read_text(); premise = PREMISE.read_text(); response = RESPONSE.read_text()
    require(all(unit in method for unit in UNITS) and "mutation注入試験の実施を意味しない" in method and len(NEGATIVE_MUTATION_CLASSES) >= 12, "method scope/check-point boundary")
    require(all(asset in premise for data in UNITS.values() for asset in data["assets"].values()), "premise exact asset set")
    require(all(token in premise for token in ("29 unit", "87 edge", "残り189 unit", "authority_effect: none")) and "runtime、test、hook、CI、adapterを実行しない" in premise, "premise count/authority/execution boundary")
    require(all(token in response for token in ("BR04/BR13/FR43", "Blockerは0件", "218−29＝189", "未解消Blocker／Major／Minorは0件")), "review response scope/finding disposition")
    require("LEGACY-ASSET-65AD8D5F8D976121F583" in response and "正式なdesign evidenceとしての採否は人間判断待ち" in response, "review response catalog kind/path exception")
    print(f"legacy requirement direct semantic review wave10: schema10 / {len(records)} edges / {sum(len(data['atoms']) for data in UNITS.values())} atoms / bounded search + phase + coverage + archive digests verified")

if __name__ == "__main__":
    main()
