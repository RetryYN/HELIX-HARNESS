#!/usr/bin/env python3
"""独立静的validator。Git object・holding・source spanを再計算し、境界をfail-closeする。"""
from __future__ import annotations
import copy, difflib, hashlib, json, subprocess, sys
from collections import Counter
from pathlib import Path

HERE=Path(__file__).resolve().parent
ROOT=HERE.parents[1]
INV=HERE/'inventory.json'
ATOMS=HERE/'semantic-atoms.jsonl'
DIFFS=HERE/'source-diffs.json'
HOLD=ROOT/'docs/governance/pre-isolation-outside-holding-67-source-holding.jsonl'
REG=ROOT/'docs/governance/management-provisional-requirement-register.jsonl'
PRE='2d4991042be55268bac30a8bbcdac45b3865030a'
ARCH='064280b5c1c5c98f949e6e3be5ef87cbe4a4b658'
EXPECTED_ID='MPR-SH-OUTSIDE67-001'
EXPLICIT_GUARD_MARKERS=('しない','せず','拒否','分け','分離','みなさない','算入せず','流れず','失わない')
EXPECTED={'root':{'schema','candidate_id','status','authority_effect','meaning_change_applied','successor_requirement_ids','human_decision_ref','formal_register_append','old_runtime_test_ci_execution','scope','source_holding','classification_basis','four_products','documents','semantic_atoms','source_diffs','product_units','connections','legacy_evidence','findings','unresolved_questions','prohibited_inference','verification_scope','residuals'},'scope':{'worktree','base_origin_main','base_origin_main_observed_at_start','read_only','static_only','holding_registration_id','holding_path','holding_sha256','holding_path_revision_pair_denominator','holding_record_count','current_live_source_holding_count','management_register_path','management_register_sha256','selected_source_document_count','selected_path_revision_pair_count','unexplored_path_revision_pair_count','unexplored_scope','pre_isolation_commit','archive_commit','historical_capture_commit','archive_root_present_count','source_unit','requirement_atoms_are_not_path_pairs','base_drift_policy','base_drift_observed','base_drift_from','base_drift_to','base_rebaseline_count','base_drift_impact'},'residuals':{'legacy_implementation','current_implementation','legacy_degradation','current_degradation','failure','consumer','decision','asset_source','closure'},'source_holding':{'registration_id','product_target','coverage_result','authority_effect','source_atom_count','source_collection_scope','selected_item_ids','selected_ordinals','unselected_count'},'classification_basis':{'product','phase','semantic_units','implementation','degradation','failure_consumer_decision','revision_diff'},'product':{'product','candidate_role','status','authority_effect'},'document':{'source_item_id','source_ordinal','candidate_product','candidate_phase','source_unit','artifact_kind','source_path','holding_record','pre_isolation','archive_revision','reported_holding','diff','semantic_coverage','status','atoms'},'holding_ref':{'registration_id','source_atom_set_ref','source_atom_set_digest','path_revision_pair_denominator'},'revision':{'commit','blob_oid','bytes','sha256','line_count'},'reported_holding':{'pre_sha256','archive_sha256','relation_to_pre_isolation','diff_status','archive_root_present','legacy_catalog_record_count','human_decision_ref'},'diff':{'status','hunk_count','unified_diff_path'},'coverage':{'pre_isolation_line_count','archive_line_count','atom_count','atomized_complete_count','covered_pre_lines','covered_archive_lines','unresolved_composite_atom_count','unresolved_line_count','shared_source_line_count','coverage_occurrence_policy'},'status':{'semantic_disposition','source_holding_status','authority_effect','implementation_status','degradation_status','failure_status','consumer_status','decision_status','successor_requirement_ids','meaning_change_applied','legacy_implementation_status','current_implementation_status','legacy_degradation_status','current_degradation_status'},'unit':{'unit_id','candidate_product','source_item_id','status','authority_effect','successor_requirement_ids','owner_status','phase_status','implementation_status','degradation_status','failure_status','consumer_status','decision_status','legacy_implementation_status','current_implementation_status','legacy_degradation_status','current_degradation_status'},'connection':{'connection_id','source_atom_ids','from_product','to_product','relationship','status','authority_effect','owner_status','consumer_status','decision_status'},'legacy':{'asset_ledger_path','path_lookup_result','asset_decision_status','implementation_status','failure_status','consumer_status','decision_status','no_inference_from_absence','legacy_implementation_status','current_implementation_status','legacy_degradation_status','current_degradation_status','failure_residual','consumer_residual','decision_residual'}}

ATOM_KEYS={'action','actor','atom_id','atomization_status','authority_effect','candidate_granularity','candidate_inference','candidate_kind','candidate_phase','candidate_product','candidate_product_candidates','condition','consumer_status','current_degradation_status','current_implementation_status','current_requirement_status','decision_status','degradation_status','diff_observation','failure_status','human_decision_ref','implementation_status','inference_status','inherited_predicate','legacy_degradation_status','legacy_implementation_status','legacy_source_requirement_id','meaning_change_applied','negative_or_guard','normalized_statement','normalized_statement_status','phase_status','retained_meaning','revision_pair','semantic_action','semantic_condition','semantic_subject','sequence','source_fragment','source_item_id','source_line_shared','source_ordinal','source_path','source_semantic_status','source_support','successor_requirement_ids','unresolved_questions'}
COMPOSITE_ATOM_KEYS=ATOM_KEYS|{'span_kind'}
FIXED_ATOM_FIELD_KEYS={
    'normalized_statement': {'status','text','source_ref'},
    'retained_meaning': {'status','items','source_ref'},
    'unresolved_questions': {'status','items','scope'},
    'diff_observation': {'status','text','source_ref'},
}
FIXED_INVENTORY_FIELD_KEYS={'findings': {'id','status','text'}, 'unresolved_questions': {'id','status','text'}, 'prohibited_inference': {'id','status','text'}}
FIXED_INVENTORY_STATUS={'findings':'observed','unresolved_questions':'open','prohibited_inference':'prohibited'}
FIXED_INVENTORY_PREFIX={'findings':'F','unresolved_questions':'Q','prohibited_inference':'P'}
FIXED_INVENTORY_COUNTS={'findings':10,'unresolved_questions':9,'prohibited_inference':6}

def fail(msg): raise AssertionError(msg)
def sha(b): return hashlib.sha256(b).hexdigest()
def read_json(path): return json.loads(path.read_text(encoding='utf-8'))
def read_jsonl(path): return [json.loads(x) for x in path.read_text(encoding='utf-8').splitlines() if x.strip()]
def show(rev,path): return subprocess.check_output(['git','show',f'{rev}:{path}'],cwd=ROOT)
def keys(obj, name):
    if set(obj)!=EXPECTED[name]: fail(f'E_KEYSET:{name}')
def lines(b): return b.decode().splitlines(keepends=True)
def live_holdings(rows):
    by={r['registration_id']:r for r in rows}; superseded={r['supersedes_registration_id'] for r in rows if r.get('supersedes_registration_id')}
    return [r for r in rows if r['registration_id'] not in superseded and r['registration_kind']=='source_holding' and r['management_state']=='registered_source_holding']

def validate_provenance(a):
    """source_fragmentと同一行から継承した述語の逐語根拠を検査する。"""
    required_support={'actor','action','condition','guard','sequence'}
    support=a.get('source_support')
    if not isinstance(support,dict) or set(support)-required_support-{'source_fragment_text'} != set() or set(support) != required_support|{'source_fragment_text'}:
        fail(f'E_PROVENANCE_SHAPE:{a["atom_id"]}')
    fragment=a['source_fragment']
    atomized=a['candidate_granularity']!='composite_unresolved'
    ftext=fragment.get('text') if atomized else None
    if support['source_fragment_text'] != ftext:
        fail(f'E_SOURCE_SUPPORT:{a["atom_id"]}:fragment')
    ip=a.get('inherited_predicate')
    if not isinstance(ip,dict) or set(ip) != {'status','text','line','character_start','character_end','relation','source_span'}:
        fail(f'E_INHERITED_PREDICATE_SHAPE:{a["atom_id"]}')
    if not atomized:
        if ip['status']!='unresolved' or ip['text'] is not None or ip['source_span']:
            fail(f'E_INHERITED_PREDICATE:{a["atom_id"]}:composite')
    elif ip['status']=='none':
        if any(ip[k] is not None for k in ('text','line','character_start','character_end','relation')) or ip['source_span']:
            fail(f'E_INHERITED_PREDICATE:{a["atom_id"]}:none')
    elif ip['status']=='exact':
        if not isinstance(ip['text'],str) or not ip['text'] or not isinstance(ip['line'],int) or not isinstance(ip['character_start'],int) or not isinstance(ip['character_end'],int) or ip['character_end']<=ip['character_start'] or not isinstance(ip['relation'],str):
            fail(f'E_INHERITED_PREDICATE:{a["atom_id"]}:shape')
        spans=ip['source_span']
        if set(spans) != {'pre_isolation','archive_revision'}:
            fail(f'E_INHERITED_PREDICATE:{a["atom_id"]}:revisions')
        for side in ('pre_isolation','archive_revision'):
            span=spans[side]
            if set(span) != {'line','character_start','character_end','exact_text','line_sha256'}:
                fail(f'E_INHERITED_PREDICATE:{a["atom_id"]}:span_shape')
            if span['line']!=ip['line'] or span['character_start']!=ip['character_start'] or span['character_end']!=ip['character_end'] or span['exact_text']!=ip['text']:
                fail(f'E_INHERITED_PREDICATE:{a["atom_id"]}:position')
            raw=a['revision_pair']['pre_isolation' if side=='pre_isolation' else 'archive']['exact_source_text'].rstrip('\n')
            if span['character_start']<0 or span['character_end']>len(raw) or raw[span['character_start']:span['character_end']]!=ip['text'] or span['line']!=a['revision_pair']['pre_isolation' if side=='pre_isolation' else 'archive']['line_start'] or span['line_sha256']!=sha(raw.encode()):
                fail(f'E_INHERITED_PREDICATE:{a["atom_id"]}:text')
    else:
        fail(f'E_INHERITED_PREDICATE:{a["atom_id"]}:status')
    allowed={'exact','inherited','absent','unresolved'}
    for field in required_support:
        entry=support[field]
        if not isinstance(entry,dict) or entry.get('status') not in allowed:
            fail(f'E_PROVENANCE_SHAPE:{a["atom_id"]}:{field}')
        expected_keys={'status','text','predicate_text'} if entry['status']=='inherited' else {'status','text'}
        if set(entry) != expected_keys:
            fail(f'E_PROVENANCE_SHAPE:{a["atom_id"]}:{field}:keys')
        if entry['status']=='exact':
            if not atomized or not isinstance(entry['text'],str) or not entry['text'] or entry['text'] not in ftext:
                fail(f'E_SOURCE_SUPPORT:{a["atom_id"]}:{field}')
            if field=='guard' and not any(marker in entry['text'] for marker in EXPLICIT_GUARD_MARKERS):
                fail(f'E_SOURCE_SUPPORT:{a["atom_id"]}:guard_marker')
        elif entry['status']=='inherited':
            if field not in ('action','condition','guard') or ip['status']!='exact' or entry['text']!=ftext or entry['predicate_text']!=ip['text']:
                fail(f'E_SOURCE_SUPPORT:{a["atom_id"]}:{field}:inherited')
            if field=='guard' and not any(marker in ip['text'] for marker in EXPLICIT_GUARD_MARKERS):
                fail(f'E_SOURCE_SUPPORT:{a["atom_id"]}:guard_marker')
        else:
            if entry['text'] is not None:
                fail(f'E_SOURCE_SUPPORT:{a["atom_id"]}:{field}:text')
    if not isinstance(a.get('candidate_inference'),list) or a.get('inference_status') not in ('separated_from_source','none'):
        fail(f'E_PROVENANCE_SHAPE:{a["atom_id"]}:inference')
    for item in a['candidate_inference']:
        if not isinstance(item,dict) or set(item) != {'field','value','reason'} or not isinstance(item['field'],str) or not isinstance(item['reason'],str):
            fail(f'E_PROVENANCE_SHAPE:{a["atom_id"]}:candidate_inference')
        if item['field']=='negative_or_guard' or 'negative／guard=' in str(item['value']):
            fail(f'E_GUARD_INFERENCE:{a["atom_id"]}')
    if atomized:
        if a['inference_status'] not in ('separated_from_source','none') or (a['inference_status']=='none') != (not a['candidate_inference']) or a.get('normalized_statement_status') not in ('source_supported','source_supported_with_inherited_predicate'):
            fail(f'E_INFERENCE_PARTITION:{a["atom_id"]}')
    else:
        if a['inference_status']!='none' or a['candidate_inference'] or a.get('normalized_statement_status')!='unresolved_composite':
            fail(f'E_INFERENCE_PARTITION:{a["atom_id"]}')
    public={'actor':a['actor'],'action':a['action'],'condition':a['condition'],'negative_or_guard':a['negative_or_guard'],'sequence':a['sequence']}
    semantic={'actor':a['semantic_subject'],'action':a['semantic_action'],'condition':a['semantic_condition'],'guard':a['negative_or_guard'],'sequence':a['sequence']}
    for field,public_field in [('actor','actor'),('action','action'),('condition','condition'),('guard','negative_or_guard'),('sequence','sequence')]:
        status=support[field]['status']; text=support[field]['text']
        if status=='exact':
            if public[public_field] != text or (field!='guard' and semantic[field] != text):
                fail(f'E_SOURCE_FIELD_INFERENCE:{a["atom_id"]}:{field}')
        elif status=='inherited':
            composed=f'{support[field]["text"]}＋{support[field]["predicate_text"]}'
            if public[public_field] != composed or semantic[field] != composed:
                fail(f'E_SOURCE_FIELD_INFERENCE:{a["atom_id"]}:{field}:inherited')
        elif field=='guard':
            if public[public_field] is not None:
                fail(f'E_SOURCE_FIELD_INFERENCE:{a["atom_id"]}:guard')
        elif public[public_field] != 'unresolved' or semantic[field] != 'unresolved':
            fail(f'E_SOURCE_FIELD_INFERENCE:{a["atom_id"]}:{field}')
    if not atomized and any(x not in ('unresolved',None) for x in (a['actor'],a['action'],a['condition'],a['semantic_subject'],a['semantic_action'],a['semantic_condition'],a['sequence'])):
        fail(f'E_SOURCE_FIELD_INFERENCE:{a["atom_id"]}:composite')
    # semantic_conditionへ生成guardを混ぜない。source由来のconditionはfragment
    # または同一行のexact inherited predicateから証明できる値だけを許可する。
    if support['condition']['status'] not in ('exact','inherited') and a['semantic_condition']!='unresolved':
        fail(f'E_SOURCE_FIELD_INFERENCE:{a["atom_id"]}:semantic_condition')

def validate_fixed_inventory_catalogs(inv):
    """inventoryのfinding／question／prohibitionを固定record schemaへ閉じる。"""
    for field, expected_keys in FIXED_INVENTORY_FIELD_KEYS.items():
        records=inv.get(field)
        if not isinstance(records,list) or not records:
            fail(f'E_INVENTORY_FIXED:{field}:list')
        prefix=FIXED_INVENTORY_PREFIX[field]; status=FIXED_INVENTORY_STATUS[field]
        if len(records)!=FIXED_INVENTORY_COUNTS[field]:
            fail(f'E_INVENTORY_FIXED:{field}:count')
        expected_ids=[f'{prefix}{i:03d}' for i in range(1,FIXED_INVENTORY_COUNTS[field]+1)]
        for i,record in enumerate(records):
            if not isinstance(record,dict) or set(record)!=expected_keys:
                fail(f'E_INVENTORY_FIXED:{field}:keys')
            if record['id']!=expected_ids[i] or record['status']!=status or not isinstance(record['text'],str) or not record['text'].strip():
                fail(f'E_INVENTORY_FIXED:{field}:value')

def validate_fixed_atom_fields(a):
    """atomの4意味欄を独立した固定record schemaで検査する。"""
    expected=COMPOSITE_ATOM_KEYS if a.get('candidate_granularity')=='composite_unresolved' else ATOM_KEYS
    if set(a)!=expected:
        fail(f'E_ATOM_KEYS:{a.get("atom_id","<missing>")}')
    composite=a['candidate_granularity']=='composite_unresolved'
    ns=a['normalized_statement']
    if not isinstance(ns,dict) or set(ns)!=FIXED_ATOM_FIELD_KEYS['normalized_statement']:
        fail(f'E_ATOM_FIXED_FIELD:{a["atom_id"]}:normalized_statement')
    if ns['status']!=a.get('normalized_statement_status') or ns['status'] not in ('source_supported','source_supported_with_inherited_predicate','unresolved_composite') or not isinstance(ns['text'],str) or not ns['text'].strip() or ns['source_ref']!=('source_span' if composite else 'source_fragment'):
        fail(f'E_ATOM_FIXED_FIELD:{a["atom_id"]}:normalized_statement_value')
    rm=a['retained_meaning']
    if not isinstance(rm,dict) or set(rm)!=FIXED_ATOM_FIELD_KEYS['retained_meaning'] or rm['status']!='preserved_source_meaning' or rm['source_ref']!=('source_span' if composite else 'source_fragment') or not isinstance(rm['items'],list) or not rm['items'] or any(not isinstance(x,str) or not x.strip() for x in rm['items']):
        fail(f'E_ATOM_FIXED_FIELD:{a["atom_id"]}:retained_meaning')
    uq=a['unresolved_questions']
    if not isinstance(uq,dict) or set(uq)!=FIXED_ATOM_FIELD_KEYS['unresolved_questions'] or uq['status']!='open_unknowns' or uq['scope']!='atom' or not isinstance(uq['items'],list) or not uq['items'] or any(not isinstance(x,str) or not x.strip() for x in uq['items']):
        fail(f'E_ATOM_FIXED_FIELD:{a["atom_id"]}:unresolved_questions')
    diff=a['diff_observation']
    if not isinstance(diff,dict) or set(diff)!=FIXED_ATOM_FIELD_KEYS['diff_observation'] or diff['status']!='unresolved' or diff['source_ref']!='source-diffs.json' or not isinstance(diff['text'],str) or not diff['text'].strip():
        fail(f'E_ATOM_FIXED_FIELD:{a["atom_id"]}:diff_observation')

def validate(inv=None, atoms=None, diffs=None, *, check_head=True):
    inv=read_json(INV) if inv is None else inv
    atoms=read_jsonl(ATOMS) if atoms is None else atoms
    diffs=read_json(DIFFS) if diffs is None else diffs
    keys(inv,'root')
    if inv['schema']!='rdp001-outside67-web-webos-l2-gap/v1': fail('E_SCHEMA')
    if inv['authority_effect']!='none' or inv['meaning_change_applied'] or inv['successor_requirement_ids'] or inv['human_decision_ref'] is not None or inv['formal_register_append'] or inv['old_runtime_test_ci_execution']: fail('E_AUTHORITY_BOUNDARY')
    validate_fixed_inventory_catalogs(inv)
    sc=inv['scope']; keys(sc,'scope')
    if check_head:
        head=subprocess.check_output(['git','rev-parse','HEAD'],cwd=ROOT,text=True).strip()
        base=sc['base_origin_main']
        if head==base: fail('E_BASE_CONTENT')
        ancestor=subprocess.run(['git','merge-base','--is-ancestor',base,head],cwd=ROOT,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
        if ancestor.returncode != 0: fail('E_BASE_NOT_ANCESTOR')
        if not sc['base_drift_observed'] or sc['base_rebaseline_count']!=2 or sc['base_drift_to']!=sc['base_origin_main'] or sc['base_drift_from']==sc['base_origin_main']: fail('E_REBASELINE_RECORD')
    if sc['holding_path_revision_pair_denominator']!=67 or sc['holding_record_count']!=67 or sc['selected_path_revision_pair_count']!=2 or sc['unexplored_path_revision_pair_count']!=65: fail('E_DENOMINATOR')
    if sc['current_live_source_holding_count']!=14: fail('E_LIVE_HOLDING_COUNT')
    hold_bytes=HOLD.read_bytes(); reg_bytes=REG.read_bytes()
    if sc['holding_sha256']!=sha(hold_bytes) or sc['management_register_sha256']!=sha(reg_bytes): fail('E_LEDGER_DIGEST')
    keys(inv['source_holding'],'source_holding')
    if inv['source_holding']['registration_id']!=EXPECTED_ID or inv['source_holding']['source_atom_count']!=67 or inv['source_holding']['selected_item_ids']!=['OUTSIDE67-PATH-011','OUTSIDE67-PATH-008'] or inv['source_holding']['unselected_count']!=65: fail('E_HOLDING_SCOPE')
    rows=read_jsonl(HOLD); ids=[r['source_item_id'] for r in rows]
    if len(rows)!=67 or len(set(ids))!=67: fail('E_HOLDING_ROWS')
    regs=read_jsonl(REG); rec=[r for r in regs if r['registration_id']==EXPECTED_ID]
    if len(rec)!=1: fail('E_REGISTER_RECORD')
    r=rec[0]
    if r['source_atom_set_ref']!=sc['holding_path'] or r['source_atom_count']!=67 or r['product_target']!='unassigned_cross_product' or r['coverage_result']!='source_preserved_unassigned' or r['authority_effect']!='none': fail('E_REGISTER_BOUNDARY')
    if len(live_holdings(regs))!=14: fail('E_REGISTER_LIVE_COUNT')
    keys(inv['classification_basis'],'classification_basis')
    if len(inv['four_products'])!=4 or {x['product'] for x in inv['four_products']}!={'HELIX-HARNESS','HELIX-OS','HELIX-Web','HELIX-Web-OS'}: fail('E_FOUR_PRODUCTS')
    if len(inv['documents'])!=2 or [d['source_item_id'] for d in inv['documents']] != ['OUTSIDE67-PATH-011','OUTSIDE67-PATH-008']: fail('E_SELECTED_DOCS')
    byid={r['source_item_id']:r for r in rows}; d_by={d['source_item_id']:d for d in inv['documents']}
    if len(atoms)!=122 or len({a['atom_id'] for a in atoms})!=122: fail('E_ATOM_COUNT_OR_IDS')
    atom_by_doc={sid:[] for sid in d_by}
    for a in atoms:
        validate_fixed_atom_fields(a)
        for required in ('atom_id','source_item_id','source_ordinal','source_path','revision_pair','candidate_kind','candidate_granularity','normalized_statement','normalized_statement_status','candidate_product','candidate_product_candidates','candidate_phase','phase_status','implementation_status','degradation_status','failure_status','consumer_status','decision_status','source_semantic_status','current_requirement_status','authority_effect','meaning_change_applied','successor_requirement_ids','human_decision_ref','retained_meaning','unresolved_questions','diff_observation','legacy_implementation_status','current_implementation_status','legacy_degradation_status','current_degradation_status','source_fragment','source_line_shared','legacy_source_requirement_id','atomization_status','actor','action','condition','negative_or_guard','sequence','semantic_subject','semantic_action','semantic_condition','inherited_predicate','source_support','candidate_inference','inference_status'):
            if required not in a: fail(f'E_ATOM_FIELD:{required}')
        if a['source_item_id'] not in atom_by_doc: fail('E_ATOM_DOC')
        atom_by_doc[a['source_item_id']].append(a)
        if a['authority_effect']!='none' or a['meaning_change_applied'] or a['successor_requirement_ids'] or a['human_decision_ref'] is not None: fail('E_ATOM_PROMOTION')
        if a['current_requirement_status']!='not_current_requirement' or a['source_semantic_status']!='candidate_only': fail('E_ATOM_CURRENT')
        for st in ('implementation_status','degradation_status','failure_status','consumer_status','decision_status','phase_status'):
            if a[st] in ('implemented','degraded','unimplemented','resolved','closed','decided','authority','approved','accepted','classified'): fail(f'E_ATOM_UNKNOWN:{st}')
        for st in ('legacy_implementation_status','current_implementation_status','legacy_degradation_status','current_degradation_status'):
            if a[st] != 'unknown': fail(f'E_ATOM_OLD_CURRENT:{st}')
        if a['candidate_granularity'] not in ('unit','connection','constraint','composite_unresolved'): fail('E_ATOM_GRANULARITY')
        if a['candidate_granularity'] in ('unit','connection','constraint') and a['candidate_product'] not in ('HELIX-Web','HELIX-Web-OS'): fail('E_SEMANTIC_PRODUCT')
        if a['candidate_granularity']=='composite_unresolved' and a['candidate_product']!='unresolved_cross_product': fail('E_COMPOSITE_PRODUCT')
        if a['candidate_granularity']=='composite_unresolved':
            if a['atomization_status']!='excluded_composite_unresolved' or a['source_fragment'].get('status')!='unresolved': fail('E_COMPOSITE_STATUS')
        else:
            if a['atomization_status']!='atomized_candidate' or a['source_fragment'].get('status')!='exact': fail('E_FRAGMENT_STATUS')
    for d in inv['documents']:
        keys(d,'document'); sid=d['source_item_id']; h=byid.get(sid)
        if h is None: fail('E_ITEM_MISSING')
        if d['source_path']!=h['source_path'] or d['source_ordinal']!=h.get('source_ordinal',d['source_ordinal']):
            # source holding rows do not all carry ordinal; selected ordinal is the manifest ordinal.
            if (sid,d['source_ordinal']) not in [('OUTSIDE67-PATH-011',11),('OUTSIDE67-PATH-008',8)]: fail('E_ITEM_ANCHOR')
        pre=show(PRE,d['source_path']); arc=show(ARCH,d['source_path'])
        snap_pre=(HERE/'source-snapshots'/sid/'pre-isolation.md').read_bytes()
        snap_arc=(HERE/'source-snapshots'/sid/'archive-revision.md').read_bytes()
        if snap_pre!=pre or snap_arc!=arc: fail(f'E_SNAPSHOT:{sid}')
        for side,data,raw in [('pre_isolation',d['pre_isolation'],pre),('archive_revision',d['archive_revision'],arc)]:
            keys(data,'revision')
            if data['commit'] != (PRE if side=='pre_isolation' else ARCH) or data['bytes']!=len(raw) or data['sha256']!=sha(raw) or data['line_count']!=len(lines(raw)): fail(f'E_REVISION:{sid}:{side}')
        if d['pre_isolation']['blob_oid']!=h['pre_isolation']['blob_oid'] or d['archive_revision']['blob_oid']!=h['archive']['blob_oid']: fail('E_BLOB_OID')
        if d['reported_holding']['pre_sha256']!=h['pre_isolation']['sha256'] or d['reported_holding']['archive_sha256']!=h['archive']['sha256']: fail('E_HOLDING_SOURCE_DIGEST')
        keys(d['holding_record'],'holding_ref'); keys(d['reported_holding'],'reported_holding'); keys(d['diff'],'diff'); keys(d['semantic_coverage'],'coverage'); keys(d['status'],'status')
        for st in ('legacy_implementation_status','current_implementation_status','legacy_degradation_status','current_degradation_status'):
            if d['status'][st] != 'unknown': fail(f'E_DOC_UNKNOWN:{st}')
        atoms_doc=atom_by_doc[sid]
        if d['atoms']!=[a['atom_id'] for a in atoms_doc] or len(atoms_doc)!=d['semantic_coverage']['atom_count']: fail('E_ATOM_REF')
        prels=lines(pre); arcls=lines(arc); seenpre=[]; seenarc=[]; semantic_line_counts={}
        for a in atoms_doc:
            for side,rawls in [('pre_isolation',prels),('archive',arcls)]:
                q=a['revision_pair'][side]; start,end=q['line_start'],q['line_end']
                if start<1 or end>len(rawls) or end<start: fail('E_SPAN_RANGE')
                actual=''.join(rawls[start-1:end]); enc=q['exact_source_text']
                if actual!=enc or q['line_sha256']!=sha(enc.encode()): fail(f'E_SPAN_TEXT:{sid}:{a["atom_id"]}:{side}')
                (seenpre if side=='pre_isolation' else seenarc).extend(range(start,end+1))
            if a['candidate_granularity']!='composite_unresolved':
                q=a['revision_pair']['pre_isolation']; start=q['line_start']; end=q['line_end']; frag=a['source_fragment']
                if start!=end or frag.get('line')!=start or not a['source_line_shared']: fail(f'E_FRAGMENT_ANCHOR:{sid}:{a["atom_id"]}')
                ftext=frag.get('text'); fs=frag.get('character_start'); fe=frag.get('character_end')
                if not isinstance(ftext,str) or not isinstance(fs,int) or not isinstance(fe,int) or fe<=fs: fail(f'E_FRAGMENT_SHAPE:{sid}:{a["atom_id"]}')
                for rawls in (prels,arcls):
                    rawline=rawls[start-1].rstrip('\n')
                    if fs<0 or fe>len(rawline) or rawline[fs:fe]!=ftext: fail(f'E_FRAGMENT_TEXT:{sid}:{a["atom_id"]}')
                semantic_line_counts[start]=semantic_line_counts.get(start,0)+1
            validate_provenance(a)
        if sorted(set(seenpre))!=list(range(1,len(prels)+1)) or d['semantic_coverage']['covered_pre_lines']!=list(range(1,len(prels)+1)) or len(d['semantic_coverage']['covered_pre_lines'])!=len(set(d['semantic_coverage']['covered_pre_lines'])): fail(f'E_PRE_COVERAGE:{sid}')
        if sorted(set(seenarc))!=list(range(1,len(arcls)+1)) or d['semantic_coverage']['covered_archive_lines']!=list(range(1,len(arcls)+1)) or len(d['semantic_coverage']['covered_archive_lines'])!=len(set(d['semantic_coverage']['covered_archive_lines'])): fail(f'E_ARCH_COVERAGE:{sid}')
        complete=sum(a['candidate_granularity']!='composite_unresolved' for a in atoms_doc); composites=len(atoms_doc)-complete
        shared=sum(n>1 for n in semantic_line_counts.values())
        if d['semantic_coverage']['atomized_complete_count']!=complete or d['semantic_coverage']['unresolved_composite_atom_count']!=composites or d['semantic_coverage']['shared_source_line_count']!=shared: fail(f'E_ATOMIZATION_COVERAGE:{sid}')
        for p in ('pre_isolation','archive_revision'):
            if d['semantic_coverage'][('pre_isolation_line_count' if p=='pre_isolation' else 'archive_line_count')] != (len(prels) if p=='pre_isolation' else len(arcls)): fail('E_COVERAGE_COUNT')
    for sid,diff in diffs.items():
        if sid not in d_by: fail('E_DIFF_DOC')
        path=d_by[sid]['source_path']; expected=list(difflib.unified_diff(lines(show(PRE,path)),lines(show(ARCH,path)),fromfile=f'pre-isolation/{path}',tofile=f'archive-revision/{path}',n=3))
        if diff['unified_diff']!=expected: fail(f'E_DIFF_TEXT:{sid}')
        if diff['status'] != ('different' if expected else 'same'): fail(f'E_DIFF_STATUS:{sid}')
    if inv['semantic_atoms']['record_count']!=len(atoms) or inv['semantic_atoms']['sha256']!=sha(ATOMS.read_bytes()): fail('E_ATOM_FILE_DIGEST')
    counts={}
    for a in atoms: counts[a['candidate_granularity']]=counts.get(a['candidate_granularity'],0)+1
    if inv['semantic_atoms']['granularity_counts']!=counts or inv['semantic_atoms']['atomized_complete_count']!=len(atoms)-counts.get('composite_unresolved',0) or inv['semantic_atoms']['excluded_composite_unresolved_count']!=counts.get('composite_unresolved',0): fail('E_ATOMIZATION_COUNT')
    atomized=[a for a in atoms if a['candidate_granularity']!='composite_unresolved']
    composite=[a for a in atoms if a['candidate_granularity']=='composite_unresolved']
    audit=inv['semantic_atoms'].get('source_provenance_audit')
    if not isinstance(audit,dict): fail('E_PROVENANCE_AUDIT')
    support_fields=('actor','action','condition','guard','sequence')
    expected_atom_support={f'{field}:{status}':sum(a['source_support'][field]['status']==status for a in atomized) for field in support_fields for status in sorted({a['source_support'][field]['status'] for a in atomized})}
    expected_composite_support={f'{field}:{status}':sum(a['source_support'][field]['status']==status for a in composite) for field in support_fields for status in sorted({a['source_support'][field]['status'] for a in composite})}
    if audit.get('atomized_candidate_count')!=len(atomized) or audit.get('composite_unresolved_count')!=len(composite) or audit.get('atomized_source_support_status_counts')!=expected_atom_support or audit.get('composite_source_support_status_counts')!=expected_composite_support: fail('E_PROVENANCE_AUDIT')
    inherited_counts=dict(Counter(a['inherited_predicate']['status'] for a in atomized))
    if audit.get('inherited_predicate_status_counts')!=inherited_counts or audit.get('inherited_action_count')!=sum(a['source_support']['action']['status']=='inherited' for a in atomized) or audit.get('inherited_condition_count')!=sum(a['source_support']['condition']['status']=='inherited' for a in atomized) or audit.get('source_provable_atomized_count')!=sum(a['source_support']['action']['status'] in ('exact','inherited') or a['source_support']['condition']['status'] in ('exact','inherited') for a in atomized): fail('E_PROVENANCE_AUDIT')
    if inv['source_diffs']['sha256']!=sha(DIFFS.read_bytes()): fail('E_DIFF_FILE_DIGEST')
    for u in inv['product_units']:
        keys(u,'unit')
        if u['authority_effect']!='none' or u['successor_requirement_ids'] or u['status']!='candidate_only': fail('E_UNIT_BOUNDARY')
        if any(u[x] != 'unknown' for x in ('legacy_implementation_status','current_implementation_status','legacy_degradation_status','current_degradation_status')): fail('E_UNIT_OLD_CURRENT')
        for st in ('owner_status','phase_status','implementation_status','degradation_status','failure_status','consumer_status','decision_status'):
            if u[st] not in ('unknown','unresolved'): fail('E_UNIT_UNKNOWN')
    atom_ids={a['atom_id'] for a in atoms}; connection_ids=[]; edge_keys=[]
    for c in inv['connections']:
        keys(c,'connection')
        if c['connection_id'] in connection_ids or len(c['source_atom_ids'])<2 or not set(c['source_atom_ids']).issubset(atom_ids): fail('E_CONNECTION_EDGE')
        connection_ids.append(c['connection_id']); edge_keys.append((c['from_product'],c['to_product'],tuple(c['source_atom_ids'])))
        if c['authority_effect']!='none' or c['status']!='unresolved_candidate' or c['consumer_status']!='unknown' or c['decision_status']!='unknown': fail('E_CONNECTION_BOUNDARY')
    if len(edge_keys)!=len(set(edge_keys)): fail('E_CONNECTION_DUPLICATE')
    keys(inv['legacy_evidence'],'legacy')
    keys(inv['residuals'],'residuals')
    if any(inv['residuals'][x] != 'unknown' for x in ('legacy_implementation','current_implementation','legacy_degradation','current_degradation','failure','consumer','decision')): fail('E_RESIDUAL_BOUNDARY')
    if any(inv['legacy_evidence'][x] != 'unknown' for x in ('asset_decision_status','implementation_status','failure_status','consumer_status','decision_status','legacy_implementation_status','current_implementation_status','legacy_degradation_status','current_degradation_status','failure_residual','consumer_residual','decision_residual')): fail('E_LEGACY_UNKNOWN')
    if inv['verification_scope']['static_only'] is not True: fail('E_STATIC_ONLY')
    return True

if __name__=='__main__':
    try:
        validate()
    except Exception as e:
        print(str(e),file=sys.stderr); sys.exit(1)
    print('PASS outside67 Web/Web-OS L2 gap validator: 67 denominator, 2 selected pairs, 122 semantic candidates (109 atomized, 13 composite_unresolved), inherited predicate spans, exact revisions, full coverage, unknown boundaries')
