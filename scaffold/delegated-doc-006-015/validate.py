#!/usr/bin/env python3
"""DELEGATED-DOC-006/015 + REF-0308/0424/0425/0765 のread-only静的確認。"""
from __future__ import annotations
import argparse, hashlib, json, re, subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
DEFAULT_CANDIDATE = ROOT / 'scaffold/delegated-doc-006-015/inventory.json'
FIXED_SOURCE_COMMIT = '17ce6830d2d4c684c96d55705cdc65790a4fdaa4'
SOURCE_LEDGER = ROOT / 'docs/governance/delegated-requirement-document-source-holding.jsonl'
REFERENCE_LEDGER = ROOT / 'docs/governance/delegated-requirement-document-reference-holding.jsonl'
ASSET_LEDGER = ROOT / 'docs/governance/legacy-asset-disposition.jsonl'
PHASE_LEDGER = ROOT / 'docs/governance/legacy-asset-phase-product-classification-bootstrap.jsonl'
EXPECTED_SOURCE_IDS = {'DELEGATED-DOC-006', 'DELEGATED-DOC-015'}
EXPECTED_SOURCE_PATHS = {
    'DELEGATED-DOC-006': 'docs/design/helix/L3-requirements/github-security-admission-requirements.md',
    'DELEGATED-DOC-015': 'docs/test-design/helix/github-security-admission-system-test-design.md',
}
EXPECTED_REF_IDS = {'DELEGATED-REF-0308', 'DELEGATED-REF-0424', 'DELEGATED-REF-0425', 'DELEGATED-REF-0765'}
PRIOR_DOC_IDS = {'DELEGATED-DOC-003', 'DELEGATED-DOC-028', 'DELEGATED-DOC-008', 'DELEGATED-DOC-017'}
PRIOR_REF_IDS = {'DELEGATED-REF-0303', 'DELEGATED-REF-0759', 'DELEGATED-REF-0760', 'DELEGATED-REF-0341', 'DELEGATED-REF-0342', 'DELEGATED-REF-0414', 'DELEGATED-REF-0415', 'DELEGATED-REF-0772'}
EXPECTED_PRODUCT_SOURCES = {
    ('docs/concept/product-boundary.md', '097f27311060c56e387cf49fe6ec75731e5fd9dc04ac1a4be987d285e02ee038'),
    ('docs/helix-harness/L1-planning/product-intent.md', 'a49da594e9593557eb42cbfe54edc7e9751ce40fea95d1fe9367f5780184ee04'),
    ('docs/helix-os/L1-planning/system-intent.md', '0f7f30d9d6984578f09c31ed1ef4e826d7c360bf752297982bde5201e7e99ca8'),
}
EXPECTED_ATOMS = {
    'SCF006-SEM-DOC-006-METADATA': ('DELEGATED-DOC-006', 'DOC-006-METADATA', 1, 25),
    'SCF006-SEM-GH-FR-029': ('DELEGATED-DOC-006', 'GH-FR-029', 26, 59),
    'SCF006-SEM-GH-NFR-019': ('DELEGATED-DOC-006', 'GH-NFR-019', 60, 63),
    'SCF006-SEM-GH-NFR-020': ('DELEGATED-DOC-006', 'GH-NFR-020', 64, 65),
    'SCF006-SEM-GH-NFR-021': ('DELEGATED-DOC-006', 'GH-NFR-021', 66, 67),
    'SCF006-SEM-GH-NFR-022': ('DELEGATED-DOC-006', 'GH-NFR-022', 68, 70),
    'SCF006-SEM-GH-AC-041': ('DELEGATED-DOC-006', 'GH-AC-041', 71, 76),
    'SCF006-SEM-DOC-006-EXTERNAL': ('DELEGATED-DOC-006', 'DOC-006-EXTERNAL-SPECS', 77, 83),
    'SCF006-SEM-DOC-015-METADATA': ('DELEGATED-DOC-015', 'DOC-015-METADATA', 1, 17),
    'SCF006-SEM-GH-T-041': ('DELEGATED-DOC-015', 'GH-T-041', 18, 18),
    'SCF006-SEM-DOC-015-EVIDENCE': ('DELEGATED-DOC-015', 'DOC-015-EVIDENCE', 19, 28),
}
EXPECTED_KINDS = {'GH-FR-029': 'requirement', 'GH-NFR-019': 'constraint', 'GH-NFR-020': 'constraint', 'GH-NFR-021': 'constraint', 'GH-NFR-022': 'constraint', 'GH-AC-041': 'acceptance', 'GH-T-041': 'acceptance'}
EXPECTED_TARGETS = {'GH-FR-029': 'unresolved', 'GH-NFR-019': 'HELIX-HARNESS', 'GH-NFR-020': 'HELIX-OS', 'GH-NFR-021': 'HELIX-HARNESS', 'GH-NFR-022': 'HELIX-OS', 'GH-AC-041': 'unresolved', 'GH-T-041': 'unresolved'}
EXPECTED_NEGATIVE_IDS = {f'SCF006-NEG-{i:03d}' for i in range(1, 8)}
EXPECTED_COVERAGE = {
    'DELEGATED-DOC-006': [(1, 25), (26, 59), (60, 70), (71, 76), (77, 83)],
    'DELEGATED-DOC-015': [(1, 17), (18, 18), (19, 28)],
}
EXPECTED_LINKAGE = {
    'DELEGATED-REF-0308': {'SCF006-SEM-DOC-006-METADATA', 'SCF006-SEM-GH-FR-029', 'SCF006-SEM-DOC-015-METADATA'},
    'DELEGATED-REF-0765': {'SCF006-SEM-DOC-015-METADATA', 'SCF006-SEM-GH-T-041', 'SCF006-SEM-DOC-006-METADATA'},
    'DELEGATED-REF-0424': {'SCF006-SEM-DOC-006-METADATA'},
    'DELEGATED-REF-0425': {'SCF006-SEM-DOC-015-METADATA'},
}
EXPECTED_NEGATIVE_FRAGMENTS = {
    'SCF006-NEG-001': ('SCF006-SEM-GH-FR-029', '`partial`／`unknown`'),
    'SCF006-NEG-002': ('SCF006-SEM-GH-FR-029', 'Codex Security実行済み'),
    'SCF006-NEG-003': ('SCF006-SEM-GH-FR-029', 'production credentialをscannerへ渡さない'),
    'SCF006-NEG-004': ('SCF006-SEM-GH-NFR-019', 'receipt staleをgreenにしない'),
    'SCF006-NEG-005': ('SCF006-SEM-GH-AC-041', '期限切れwaiver'),
    'SCF006-NEG-006': ('SCF006-SEM-DOC-015-EVIDENCE', '別scannerのPASSで'),
    'SCF006-NEG-007': ('SCF006-SEM-DOC-015-EVIDENCE', 'GitHub UIのenabled表示だけを'),
}

def fail(errors: list[str], msg: str) -> None:
    errors.append(msg)

def digest_bytes(value: bytes) -> str:
    return hashlib.sha256(value).hexdigest()

def digest_file(path: Path) -> str:
    return digest_bytes(path.read_bytes())

def load_jsonl(path: Path, errors: list[str]) -> list[dict]:
    try:
        lines = path.read_text(encoding='utf-8').splitlines()
    except OSError as exc:
        fail(errors, f'台帳を読めない: {path}: {exc}')
        return []
    records=[]
    for n,line in enumerate(lines,1):
        if not line.strip(): continue
        try: value=json.loads(line)
        except json.JSONDecodeError as exc:
            fail(errors, f'台帳JSON不正: {path}:{n}: {exc}'); continue
        if not isinstance(value,dict): fail(errors, f'台帳recordがobjectではない: {path}:{n}'); continue
        records.append(value)
    return records

def git_blob(commit: str, path: str, label: str, errors: list[str]) -> bytes | None:
    result=subprocess.run(['git','cat-file','blob',f'{commit}:{path}'],capture_output=True)
    if result.returncode != 0:
        fail(errors, f'{label} fixed Git blobを読めない: {commit}:{path}')
        return None
    return result.stdout

def source_span(blob: bytes, start: int, end: int) -> dict:
    text=''.join(blob.decode('utf-8').splitlines(keepends=True)[start-1:end])
    return {'start_line':start,'end_line':end,'sha256':'sha256:'+digest_bytes(text.encode()),'exact_source_text':text}

def check_span(errors: list[str], label: str, blob: bytes | None, declaration: dict, expected: tuple[int,int] | None = None) -> None:
    if not isinstance(declaration,dict): fail(errors,f'{label} source_spanがobjectではない'); return
    start,end=declaration.get('start_line'),declaration.get('end_line')
    if expected and (start,end) != expected: fail(errors,f'{label} span範囲不一致: expected={expected} actual={(start,end)}')
    if not isinstance(start,int) or not isinstance(end,int) or start<1 or end<start: fail(errors,f'{label} span範囲不正'); return
    if blob is None: return
    actual=source_span(blob,start,end)
    if declaration.get('sha256') != actual['sha256']: fail(errors,f'{label} span SHA-256不一致')
    if declaration.get('exact_source_text') != actual['exact_source_text']: fail(errors,f'{label} exact source text不一致')

def fixed_ac_definition_ids(blob: bytes | None) -> list[str]:
    if blob is None: return []
    return sorted(set(re.findall(r'^\|\s*`?(GH-AC-\d{3})`?\s*\|',blob.decode('utf-8'),re.M)))

def fixed_ac_reference_ids(blob: bytes | None) -> list[str]:
    if blob is None: return []
    return sorted(set(m.group(1) for m in re.finditer(r'^\|\s*`?GH-T-\d{3}`?\s*\|\s*`?(GH-AC-\d{3})`?\s*\|',blob.decode('utf-8'),re.M)))

def main() -> int:
    parser=argparse.ArgumentParser(); parser.add_argument('--candidate',type=Path,default=DEFAULT_CANDIDATE); args=parser.parse_args(); errors=[]
    try: candidate=json.loads(args.candidate.read_text(encoding='utf-8'))
    except Exception as exc: print(f'FAIL: candidate JSONを読めない: {exc}'); return 1
    if not isinstance(candidate,dict): print('FAIL: candidateがobjectではない'); return 1
    for key,want in [('schema','rdp001-delegated-document-pair-scaffold/v1'),('candidate_id','RDP-001-SCF-B-0008-DOC-006-015'),('status','scaffold_candidate_pending_review'),('authority_effect','none')]:
        if candidate.get(key)!=want: fail(errors,f'{key}が固定値と不一致')
    for key,want in [('meaning_change_applied',False),('old_runtime_test_ci_execution',False)]:
        if candidate.get(key) is not want: fail(errors,f'{key}がfalseではない')
    if candidate.get('successor_requirement_ids') != [] or candidate.get('human_decision_ref') is not None or candidate.get('equivalence_claim') is not None: fail(errors,'successor／human decision／equivalence claimを生成している')
    ledgers={
      'source':load_jsonl(SOURCE_LEDGER,errors),'reference':load_jsonl(REFERENCE_LEDGER,errors),
      'asset':load_jsonl(ASSET_LEDGER,errors),'phase':load_jsonl(PHASE_LEDGER,errors)}
    source_ledger={x.get('source_document_id'):x for x in ledgers['source']}; ref_ledger={x.get('reference_id'):x for x in ledgers['reference']}; asset_ledger={x.get('source_path'):x for x in ledgers['asset']}; phase_ledger={x.get('source_path'):x for x in ledgers['phase']}
    prov=candidate.get('ledger_provenance',{})
    if len(ledgers['source']) != 114 or prov.get('source_holding_total') != 114: fail(errors,'source holding denominator 114が不一致')
    if len(ledgers['reference']) != 788 or prov.get('reference_holding_total') != 788: fail(errors,'reference holding denominator 788が不一致')
    for key,path,records in [('source_holding_path',SOURCE_LEDGER,ledgers['source']),('reference_holding_path',REFERENCE_LEDGER,ledgers['reference']),('asset_disposition_path',ASSET_LEDGER,ledgers['asset']),('phase_product_path',PHASE_LEDGER,ledgers['phase'])]:
        if prov.get(key) != str(path.relative_to(ROOT)): fail(errors,f'ledger provenance {key}不一致')
    for key,path in [('source_holding_sha256',SOURCE_LEDGER),('reference_holding_sha256',REFERENCE_LEDGER),('asset_disposition_sha256',ASSET_LEDGER),('phase_product_sha256',PHASE_LEDGER)]:
        if prov.get(key) != digest_file(path): fail(errors,f'ledger provenance {key} digest不一致')
    if prov.get('fixed_source_revision') != FIXED_SOURCE_COMMIT: fail(errors,'fixed source revision不一致')
    sources=candidate.get('source_documents'); source_ids=[x.get('source_document_id') for x in sources] if isinstance(sources,list) else []
    if len(source_ids)!=2 or len(set(source_ids))!=2 or set(source_ids)!=EXPECTED_SOURCE_IDS: fail(errors,'source document ID集合不一致')
    source_blobs={}
    for src in sources if isinstance(sources,list) else []:
        if not isinstance(src,dict): fail(errors,'source documentがobjectではない'); continue
        sid=src.get('source_document_id'); ledger=source_ledger.get(sid)
        if sid not in EXPECTED_SOURCE_PATHS or ledger is None: fail(errors,f'未知またはholding不在のsource: {sid}'); continue
        for field in ('source_path','archive_path','sha256','source_declared_status','source_relation','holding_granularity','carry_status','meaning_change_applied','successor_refs','human_decision_ref'):
            if src.get(field)!=ledger.get(field): fail(errors,f'{sid} candidate/ledger {field}不一致')
        if src.get('source_path')!=EXPECTED_SOURCE_PATHS[sid] or src.get('fixed_source_revision')!=FIXED_SOURCE_COMMIT: fail(errors,f'{sid} path/revision不一致')
        b=git_blob(FIXED_SOURCE_COMMIT,src.get('archive_path',''),sid,errors)
        if b is None: continue
        source_blobs[sid]=b
        if src.get('source_blob_sha256')!='sha256:'+digest_bytes(b): fail(errors,f'{sid} source blob SHA不一致')
        oid=subprocess.run(['git','rev-parse',f'{FIXED_SOURCE_COMMIT}:{src.get("archive_path","")}'],capture_output=True,text=True).stdout.strip()
        if src.get('source_blob_oid')!=oid: fail(errors,f'{sid} source blob OID不一致')
        if src.get('line_count')!=len(b.splitlines()): fail(errors,f'{sid} line_count不一致')
    refs=candidate.get('reference_edges'); ref_ids=[x.get('reference_id') for x in refs] if isinstance(refs,list) else []
    if len(ref_ids)!=4 or len(set(ref_ids))!=4 or set(ref_ids)!=EXPECTED_REF_IDS: fail(errors,'selected reference edge ID集合不一致')
    for ref in refs if isinstance(refs,list) else []:
        if not isinstance(ref,dict): fail(errors,'reference edgeがobjectではない'); continue
        rid=ref.get('reference_id'); ledger=ref_ledger.get(rid)
        if rid not in EXPECTED_REF_IDS or ledger is None: fail(errors,f'未知またはholding不在のreference: {rid}'); continue
        if ref != ledger: fail(errors,f'{rid} candidate/ledger不一致')
    comp=candidate.get('comparison',{}); denom=comp.get('holding_denominator',{})
    if set(comp.get('selected_document_ids',[])) != EXPECTED_SOURCE_IDS or set(comp.get('selected_reference_edge_ids',[])) != EXPECTED_REF_IDS: fail(errors,'comparison selected集合不一致')
    if set(denom.get('prior_candidate_source_documents',[])) != PRIOR_DOC_IDS or set(denom.get('prior_candidate_reference_edges',[])) != PRIOR_REF_IDS: fail(errors,'prior candidate集合不一致')
    if set(denom.get('prior_merged_bindings',[])) != {'SCF-B-0005','SCF-B-0006'}: fail(errors,'prior merged Binding集合不一致')
    for key,want in [('source_documents_total',114),('reference_edges_total',788),('prior_candidate_source_document_count',4),('prior_candidate_reference_edge_count',8),('selected_source_document_count',2),('selected_reference_edge_count',4),('remaining_source_documents_after_prior_and_selected',108),('remaining_reference_edges_after_prior_and_selected',776)]:
        if denom.get(key)!=want: fail(errors,f'holding denominator {key}不一致')
    if set(comp.get('id_overlap_check',{}).get('prior_candidate_original_id_overlap',[])) != set(): fail(errors,'prior candidate original ID overlapを生成している')
    if set(source_ids)&PRIOR_DOC_IDS or set(ref_ids)&PRIOR_REF_IDS: fail(errors,'prior candidate document/referenceと重複している')
    boundary=candidate.get('product_boundary',{}); product_sources={(x.get('path'),x.get('sha256')) for x in boundary.get('sources',[])} if isinstance(boundary.get('sources'),list) else set()
    if product_sources != EXPECTED_PRODUCT_SOURCES: fail(errors,'product boundary source集合不一致')
    if boundary.get('boundary_status')!='candidate_only' or set(boundary.get('product_owner_candidates',[])) != {'HELIX-HARNESS','HELIX-OS'}: fail(errors,'product boundary候補境界不一致')
    legacy=candidate.get('legacy_asset_status'); legacy_by_id={x.get('source_document_id'):x for x in legacy} if isinstance(legacy,list) else {}
    if set(legacy_by_id)!=EXPECTED_SOURCE_IDS: fail(errors,'legacy asset source ID集合不一致')
    for sid in EXPECTED_SOURCE_IDS:
        src=source_ledger[sid]; path=src['source_path']; item=legacy_by_id[sid]; a=asset_ledger.get(path); p=phase_ledger.get(path)
        if item.get('asset_id')!=a.get('asset_id') or item.get('asset_ledger',{}).get('asset_class')!='Historical' or item.get('asset_ledger',{}).get('authority_status')!='historical' or item.get('asset_ledger',{}).get('disposition')!='unresolved': fail(errors,f'{sid} legacy asset boundary不一致')
        ph=item.get('phase_product_bootstrap',{})
        for k in ('classification_id','artifact_evidence_kind','phase_classification_status','candidate_phase_targets','candidate_product_targets','product_classification_status','consumer_closure_status','implementation_evidence_state','legacy_execution_performed','legacy_implementation_status','unresolved'):
            if ph.get(k)!=p.get(k): fail(errors,f'{sid} phase field {k}不一致')
        if ph.get('consumer_closure_status')!='pending' or ph.get('legacy_execution_performed') is not False or ph.get('legacy_implementation_status')!='unknown': fail(errors,f'{sid} phase／implementation／consumer未確認境界がない')
    spans=candidate.get('coverage_spans'); span_pairs={sid:[] for sid in EXPECTED_SOURCE_IDS}
    if not isinstance(spans,list) or len(spans)!=8: fail(errors,'coverage span件数8不一致')
    for item in spans if isinstance(spans,list) else []:
        sid=item.get('source_document_id'); decl=item.get('source_span',{}); start,end=decl.get('start_line'),decl.get('end_line'); span_pairs.setdefault(sid,[]).append((start,end)); check_span(errors,item.get('coverage_span_id','coverage'),source_blobs.get(sid),decl)
    if span_pairs != EXPECTED_COVERAGE: fail(errors,f'coverage span集合不一致: {span_pairs}')
    atoms=candidate.get('atoms'); atom_map={x.get('semantic_atom_id'):x for x in atoms} if isinstance(atoms,list) else {}
    if len(atom_map)!=len(EXPECTED_ATOMS) or set(atom_map)!=set(EXPECTED_ATOMS): fail(errors,'semantic atom ID集合不一致')
    for aid,(sid,orig,start,end) in EXPECTED_ATOMS.items():
        a=atom_map.get(aid,{})
        if a.get('source_document_id')!=sid or a.get('original_id')!=orig: fail(errors,f'{aid} source/original ID不一致')
        check_span(errors,aid,source_blobs.get(sid),a.get('source_span',{}),(start,end))
        if a.get('source_revision')!=FIXED_SOURCE_COMMIT or a.get('legacy_status_ref')!=sid or a.get('legacy_status_unconfirmed') is not True: fail(errors,f'{aid} source/legacy revision境界不一致')
        if not isinstance(a.get('actors'),list) or not a.get('actors') or not isinstance(a.get('authority_conditions'),list) or not a.get('authority_conditions'): fail(errors,f'{aid} actor/authority条件欠落')
        if not isinstance(a.get('negative_conditions'),list): fail(errors,f'{aid} negative条件欄欠落')
        if a.get('candidate_granularity')!='unit' or not isinstance(a.get('questions'),list) or not a.get('questions'): fail(errors,f'{aid} review boundary欠落')
        if a.get('candidate_target') not in {'HELIX-HARNESS','HELIX-OS','HELIX-Web','HELIX-Web-OS','unresolved'}: fail(errors,f'{aid} target不正')
        if a.get('candidate_target')!='unresolved' and a.get('candidate_target') not in a.get('owner_candidates',[]): fail(errors,f'{aid} targetがowner候補にない')
        if a.get('original_id') in EXPECTED_KINDS and a.get('candidate_kind')!=EXPECTED_KINDS[a['original_id']]: fail(errors,f'{aid} candidate_kind不一致')
        if a.get('original_id') in EXPECTED_TARGETS and a.get('candidate_target')!=EXPECTED_TARGETS[a['original_id']]: fail(errors,f'{aid} candidate_target固定値不一致')
        text=a.get('source_span',{}).get('exact_source_text','')
        if not orig.startswith('DOC-') and orig not in text: fail(errors,f'{aid} original IDのsource groundingがない')
        state=a.get('legacy_state',{})
        if state.get('phase_authority_status')!='unconfirmed' or state.get('legacy_implementation_status')!='unknown' or state.get('consumer_status')!='pending' or state.get('unconfirmed') is not True: fail(errors,f'{aid} phase/implementation/consumer未確認欄がない')
    neg=candidate.get('negative_conditions'); neg_ids={x.get('negative_id') for x in neg} if isinstance(neg,list) else set()
    if neg_ids != EXPECTED_NEGATIVE_IDS or len(neg_ids)!=len(neg or []): fail(errors,'negative ID集合が不一致')
    for n in neg or []:
        want=EXPECTED_NEGATIVE_FRAGMENTS.get(n.get('negative_id'))
        if want is None or n.get('atom_id')!=want[0] or want[1] not in atom_map.get(want[0],{}).get('source_span',{}).get('exact_source_text',''): fail(errors,f'{n.get("negative_id")} source fragmentが固定blobと不一致')
    linkage=candidate.get('reference_edge_linkage',{})
    if {k:set(v) for k,v in linkage.items()} != EXPECTED_LINKAGE: fail(errors,'reference edge linkageが双方向固定集合と不一致')
    for aid, links in EXPECTED_LINKAGE.items():
        for atom_id in links:
            if aid not in atom_map.get(atom_id,{}).get('reference_edge_ids',[]): fail(errors,f'{aid} reverse linkageが{atom_id}にない')
    audit=candidate.get('pair_acceptance_reference_audit',{}); doc6=source_blobs.get('DELEGATED-DOC-006'); doc15=source_blobs.get('DELEGATED-DOC-015'); defined=fixed_ac_definition_ids(doc6); referenced=fixed_ac_reference_ids(doc15); missing=sorted(set(referenced)-set(defined)); expected={'method':'recompute exact GH-AC definitions from DOC-006 fixed archive blob and GH-T→GH-AC references from DOC-015 fixed archive blob','source_document_id':'DELEGATED-DOC-006','source_defined_acceptance_ids':defined,'reference_document_id':'DELEGATED-DOC-015','referenced_acceptance_ids':referenced,'missing_from_pair':missing,'unresolved_decision_ids':[f'RDP-UNRESOLVED-{x}' for x in missing],'admission':'fail-close if pair definitions/references drift or an undefined acceptance ID appears; no AC meaning, owner, authority, acceptance, or parity is inferred'}
    if audit != expected: fail(errors,'pair_acceptance_reference_auditが固定blob再計算結果と不一致')
    if candidate.get('unresolved_decisions') != []: fail(errors,'unresolved_decisionsは空集合でなければならない')
    if errors:
        print('FAIL:'); print('\n'.join(f'- {x}' for x in errors)); return 1
    print('PASS: DELEGATED-DOC-006/015 + REF-0308/0424/0425/0765 atom candidate')
    print('documents=2; references=4; coverage_spans=8; semantic_atoms=11; source_lines=111; negative_conditions=7')
    print('candidate_target_counts='+str({x:sum(1 for a in atoms if a.get('candidate_target')==x) for x in sorted({a.get('candidate_target') for a in atoms})}))
    print('authority_effect=none; atomization=unresolved; legacy_runtime_test_ci=forbidden; pair_missing_acceptance=[]')
    return 0
if __name__=='__main__': raise SystemExit(main())
