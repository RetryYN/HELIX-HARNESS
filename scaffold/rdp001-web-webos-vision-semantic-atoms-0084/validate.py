#!/usr/bin/env python3
"""Validate the next bounded, source-bound Web/Web-OS semantic atom subset."""
from __future__ import annotations
import hashlib, json, subprocess, sys
from pathlib import Path
HERE=Path(__file__).resolve().parent
ROOT=HERE.parents[1]
BASE='ee03352d8fc36c4e16d65f861ac9f0262b47fe87'
VISION='archive/legacy-generation-2026-09-14/root/docs/archive/intake/2026-09-06-concept-vision/vision/HELIX_VISION_v0.1.md'
PARENT='scaffold/rdp001-web-webos-vision-semantic-atoms-0081'
PARENT_INV=PARENT+'/inventory.json'; PARENT_ATOMS=PARENT+'/semantic-atoms.jsonl'
PARENT_SPAN='scaffold/rdp001-web-webos-vision-source-0080/vision-spans.jsonl'
INV_KEYS={'schema','candidate_id','status','authority_effect','meaning_change_applied','formal_requirement_unit_count','successor_requirement_ids','human_decision_ref','formal_register_append','old_runtime_test_ci_execution','scope','candidate_products','source','findings','unresolved_questions','prohibited_inference','verification_contract','residuals','created','updated'}
SCOPE_KEYS={'worktree','base_origin_main','read_only','static_only','old_archive_execution','parent_binding_id','parent_scaffold_path','parent_inventory_sha256','parent_span_file_sha256','parent_span_count','selected_parent_span_ids','selected_parent_span_count','unprocessed_parent_span_ids','unprocessed_parent_span_count','vision_source_path','vision_source_sha256','vision_source_line_count','selected_candidate_source_line_count','unprocessed_candidate_source_line_count','semantic_atom_record_count','atomized_candidate_count','composite_unresolved_count','web_user_atom_count','webos_runtime_atom_count','selected_legacy_asset_count','legacy_asset_unreviewed_count','selection_rule'}
PRODUCT_KEYS={'product','candidate_role','atom_count','owner_status','authority_status','implementation_status','degradation_status'}
SOURCE_KEYS={'path','sha256','parent_span_file','parent_span_file_sha256','semantic_atoms_path','semantic_atoms_sha256','legacy_links_path','legacy_links_sha256'}
ATOM_KEYS={'atom_id','parent_span_id','related_open_decision_ids','source_path','source_line_start','source_line_end','exact_source_text','source_span_sha256','candidate_text','candidate_product','candidate_role','candidate_kind','atomization_status','connective_tokens','semantic_status','semantic_equivalence','owner_status','authority_status','adoption_status','legacy_implementation_status','current_implementation_status','legacy_degradation_status','current_degradation_status','failure_status','consumer_status','decision_status','meaning_change_applied','unresolved_questions','composite_reason'}
CONTRACT_KEYS={'required_commands','negative_cases','archive_rule'}
RESIDUAL_KEYS={'formal_requirement_unit','semantic_equivalence','owner_authority','legacy_failure','legacy_consumer_closure','legacy_implementation','current_implementation','degradation'}
SELECTED_PARENT=['VISION-SEC-4','VISION-SEC-6.3','VISION-SEC-8','VISION-U10','VISION-U11','VISION-U12','VISION-U13','VISION-U14','VISION-U15','VISION-U16']
GROUPS=set(SELECTED_PARENT)
ORDER=['WEB-NEXT-COMPOSITE-001','WEBOS-NEXT-COMPOSITE-002','WEB-NEXT-COMPOSITE-003','WEB-NEXT-ATOM-004','WEB-NEXT-ATOM-005','WEBOS-NEXT-ATOM-006','WEBOS-NEXT-ATOM-007','WEBOS-NEXT-ATOM-008','WEB-NEXT-ATOM-009','WEB-NEXT-ATOM-010']
ATOM_EXPECTED={
 'WEB-NEXT-COMPOSITE-001':('VISION-SEC-4','HELIX-Web','web_parallel_delivery_and_growth_axes','vision_direction',124,124,['と','・'],'composite_unresolved'),
 'WEBOS-NEXT-COMPOSITE-002':('VISION-SEC-6.3','HELIX-Web-OS','hda_model_serving_and_assistance','service_runtime',275,275,['/','：'],'composite_unresolved'),
 'WEB-NEXT-COMPOSITE-003':('VISION-SEC-8','HELIX-Web','factory_parallel_business_direction','vision_direction',320,320,['は','や','、'],'composite_unresolved'),
 'WEB-NEXT-ATOM-004':('VISION-U10','HELIX-Web-OS','growth_evidence_feedback_route','service_runtime',539,539,['と','、'],'atomized_candidate'),
 'WEB-NEXT-ATOM-005':('VISION-U11','HELIX-Web','parallel_web_delivery_direction','vision_direction',540,540,['と','の'],'atomized_candidate'),
 'WEBOS-NEXT-ATOM-006':('VISION-U12','HELIX-Web-OS','intelligence_dynamic_flow_direction','service_runtime',541,541,['自体が','に'],'atomized_candidate'),
 'WEBOS-NEXT-ATOM-007':('VISION-U13','HELIX-Web-OS','model_tuning_direction','service_runtime',542,542,['と','の'],'atomized_candidate'),
 'WEBOS-NEXT-ATOM-008':('VISION-U14','HELIX-Web-OS','hda_distributed_serving_direction','service_runtime',543,543,['から','へ'],'atomized_candidate'),
 'WEB-NEXT-ATOM-009':('VISION-U15','HELIX-Web','system_compiler_delivery_direction','vision_direction',544,544,['まで','、'],'atomized_candidate'),
 'WEB-NEXT-ATOM-010':('VISION-U16','HELIX-Web','screen_to_specification_direction','user_duty',545,545,['だけ','へ'],'atomized_candidate'),
}
COMPOSITE_REASONS={
 'WEB-NEXT-COMPOSITE-001':'section line couples three growth axes, parallel Web delivery, and a non-commitment boundary',
 'WEBOS-NEXT-COMPOSITE-002':'HDA line couples model serving, evidence, and user/developer assistance',
 'WEB-NEXT-COMPOSITE-003':'factory line couples Web, other products, parallel business, and non-guarantee boundary',
}

def fail(code,detail=''): raise AssertionError(code+((':'+detail) if detail else ''))
def sha(b): return hashlib.sha256(b).hexdigest()
def keys(o,expected,code):
    if not isinstance(o,dict) or set(o)!=set(expected): fail(code,','.join(sorted(set(o)^set(expected))) if isinstance(o,dict) else 'not-object')
def git_show(path):
    r=subprocess.run(['git','show',f'HEAD:{path}'],cwd=ROOT,capture_output=True)
    if r.returncode: fail('E_GIT_SOURCE',path)
    return r.stdout
def read_json(p):
    try:return json.loads(p.read_text(encoding='utf-8'))
    except Exception as e:fail('E_JSON',str(e))
def read_jsonl(p):
    out=[]
    for n,l in enumerate(p.read_text(encoding='utf-8').splitlines(),1):
        if l.strip():
            try:out.append(json.loads(l))
            except Exception as e:fail('E_JSONL',f'{p}:{n}:{e}')
    return out
def git_jsonl(path): return [json.loads(x) for x in git_show(path).decode().splitlines() if x.strip()]
def validate(inv,atoms,legacy):
    keys(inv,INV_KEYS,'E_INV_KEYS')
    if inv['schema']!='rdp001-web-webos-vision-semantic-atoms/v1' or inv['candidate_id']!='RDP-001-WEB-WEBOS-VISION-SEMANTIC-ATOMS-0084':fail('E_IDENTITY')
    if inv['status']!='findings_only' or inv['authority_effect']!='none' or inv['meaning_change_applied'] or inv['formal_requirement_unit_count']!='not_generated':fail('E_BOUNDARY')
    if inv['successor_requirement_ids'] or inv['human_decision_ref'] is not None or inv['formal_register_append'] or inv['old_runtime_test_ci_execution']:fail('E_PROMOTION')
    s=inv['scope'];keys(s,SCOPE_KEYS,'E_SCOPE_KEYS')
    current_head=subprocess.run(['git','rev-parse','HEAD'],cwd=ROOT,text=True,capture_output=True).stdout.strip()
    if s['base_origin_main']!=BASE or subprocess.run(['git','merge-base','--is-ancestor',BASE,current_head],cwd=ROOT).returncode!=0:fail('E_BASE')
    if not s['read_only'] or not s['static_only'] or s['old_archive_execution']:fail('E_SCOPE_BOUNDARY')
    p_inv_bytes=git_show(PARENT_INV); p_atoms_bytes=git_show(PARENT_ATOMS); p_inv=json.loads(p_inv_bytes); p_atoms=[json.loads(x) for x in p_atoms_bytes.decode().splitlines() if x.strip()]
    if s['parent_binding_id']!='SCF-B-0081' or s['parent_scaffold_path']!=PARENT:fail('E_PARENT_ID')
    if s['parent_inventory_sha256']!=sha(p_inv_bytes):fail('E_PARENT_DIGEST')
    if p_inv['candidate_id']!='RDP-001-WEB-WEBOS-VISION-SEMANTIC-ATOMS-0081' or p_inv['scope']['selected_parent_span_count']!=10 or p_inv['scope']['unprocessed_parent_span_count']!=19:fail('E_PARENT_STATE')
    prior_parent=set(p_inv['scope']['selected_parent_span_ids']); prior_unprocessed=set(p_inv['scope']['unprocessed_parent_span_ids'])
    if prior_parent & GROUPS or set(s['selected_parent_span_ids'])!=GROUPS or s['selected_parent_span_count']!=10 or s['parent_span_count']!=19:fail('E_PARENT_COUNTS')
    if set(s['unprocessed_parent_span_ids'])!=prior_unprocessed-GROUPS or s['unprocessed_parent_span_count']!=9:fail('E_PARENT_DENOM')
    vb=git_show(VISION); vl=vb.decode().splitlines(keepends=True); span_bytes=git_show(PARENT_SPAN); parent_spans=git_jsonl(PARENT_SPAN); parent_by={x['span_id']:x for x in parent_spans}
    if s['vision_source_path']!=VISION or s['vision_source_sha256']!=sha(vb) or s['vision_source_line_count']!=583:fail('E_VISION_SOURCE')
    if s['parent_span_file_sha256']!=sha(span_bytes):fail('E_PARENT_SPAN_DIGEST')
    if s['semantic_atom_record_count']!=10 or s['atomized_candidate_count']!=7 or s['composite_unresolved_count']!=3 or s['web_user_atom_count']!=5 or s['webos_runtime_atom_count']!=5:fail('E_COUNTS')
    products=inv['candidate_products']
    if len(products)!=2:fail('E_PRODUCT_COUNT')
    for product in products:
        keys(product,PRODUCT_KEYS,'E_PRODUCT_KEYS')
        if product['product'] not in ('HELIX-Web','HELIX-Web-OS') or product['candidate_role'] not in ('web_user_responsibility','service_runtime') or product['owner_status']!='unknown' or product['authority_status']!='none' or product['implementation_status']!='unknown' or product['degradation_status']!='unknown':fail('E_PRODUCT_BOUNDARY')
    source=inv['source'];keys(source,SOURCE_KEYS,'E_SOURCE_KEYS')
    if source['path']!=VISION or source['sha256']!=sha(vb) or source['parent_span_file']!=PARENT_SPAN or source['parent_span_file_sha256']!=sha(span_bytes) or source['semantic_atoms_path']!='scaffold/rdp001-web-webos-vision-semantic-atoms-0084/semantic-atoms.jsonl' or source['semantic_atoms_sha256']!=sha((HERE/'semantic-atoms.jsonl').read_bytes()) or source['legacy_links_path']!='scaffold/rdp001-web-webos-vision-semantic-atoms-0084/legacy-links.jsonl' or source['legacy_links_sha256']!=sha((HERE/'legacy-links.jsonl').read_bytes()):fail('E_SOURCE_METADATA')
    if len(atoms)!=10 or [x.get('atom_id') for x in atoms]!=ORDER:fail('E_ATOM_ORDER')
    if legacy:fail('E_LEGACY_BOUNDARY')
    prior_lines=set()
    for old in p_atoms:
        prior_lines.update(range(old['source_line_start'],old['source_line_end']+1))
        if old['parent_span_id'] not in prior_parent:fail('E_PARENT_ATOM_STATE',old.get('atom_id',''))
    seen=set(); referenced=set()
    for a in atoms:
        keys(a,ATOM_KEYS,'E_ATOM_KEYS');aid=a['atom_id']
        if aid not in ATOM_EXPECTED:fail('E_ATOM_ID',aid)
        parent,prod,role,kind,start,end,conn,status=ATOM_EXPECTED[aid]
        actual=a['parent_span_id']
        if actual not in GROUPS or actual not in parent_by or a['source_path']!=VISION:fail('E_PARENT_CONTAINMENT',aid)
        span=parent_by[actual]
        if span['source_path']!=VISION or not isinstance(a['source_line_start'],int) or not isinstance(a['source_line_end'],int) or not (span['line_start']<=a['source_line_start']<=a['source_line_end']<=span['line_end']):fail('E_PARENT_CONTAINMENT',aid)
        if set(range(a['source_line_start'],a['source_line_end']+1)) & prior_lines:fail('E_PRIOR_OVERLAP',aid)
        referenced.add(actual)
        if (a['parent_span_id'],a['candidate_product'],a['candidate_role'],a['candidate_kind'],a['source_line_start'],a['source_line_end'],a['connective_tokens'],a['atomization_status'])!=(parent,prod,role,kind,start,end,conn,status):fail('E_ATOM_META',aid)
        if a['related_open_decision_ids']!=[]:fail('E_ATOM_RELATION',aid)
        exact=''.join(vl[start-1:end])
        if a['exact_source_text']!=exact or a['candidate_text']!=exact.rstrip('\n') or a['source_span_sha256']!=sha(exact.encode()):fail('E_ATOM_TEXT',aid)
        if a['semantic_status']!=('source_bound_candidate' if status=='atomized_candidate' else 'composite_unresolved') or a['semantic_equivalence']!='unknown' or a['owner_status']!='unknown' or a['authority_status']!='none' or a['adoption_status']!='unknown' or a['meaning_change_applied']:fail('E_ATOM_BOUNDARY',aid)
        for st in ('legacy_implementation_status','current_implementation_status','legacy_degradation_status','current_degradation_status','failure_status','consumer_status','decision_status'):
            if a[st]!='unknown':fail('E_ATOM_UNKNOWN',aid+':'+st)
        if not isinstance(a['unresolved_questions'],list) or not a['unresolved_questions']:fail('E_ATOM_UNRESOLVED',aid)
        if status=='composite_unresolved' and a['composite_reason']!=COMPOSITE_REASONS[aid]:fail('E_COMPOSITE_REASON',aid)
        if status=='atomized_candidate' and a['composite_reason'] is not None:fail('E_ATOM_COMPOSITE_REASON',aid)
        seen.update(range(start,end+1))
    if referenced!=GROUPS:fail('E_PARENT_COVERAGE',','.join(sorted(GROUPS-referenced)))
    if s['selected_candidate_source_line_count']!=len(seen) or s['unprocessed_candidate_source_line_count']!=583-len(seen):fail('E_SOURCE_LINE_COUNTS')
    if s['selected_legacy_asset_count']!=0 or s['legacy_asset_unreviewed_count']!=4020:fail('E_LEGACY_COUNTS')
    for name,items in (('findings',inv['findings']),('unresolved_questions',inv['unresolved_questions']),('prohibited_inference',inv['prohibited_inference'])):
        if not isinstance(items,list) or not items:fail('E_INV_RECORDS',name)
        for x in items:
            expected={'id','status','text'} if name!='prohibited_inference' else {'id','text'};keys(x,expected,'E_INV_RECORD_KEYS')
            if not x.get('text'):fail('E_INV_RECORD_TEXT',name)
    keys(inv['verification_contract'],CONTRACT_KEYS,'E_CONTRACT_KEYS')
    if not inv['verification_contract']['required_commands'] or not inv['verification_contract']['negative_cases']:fail('E_CONTRACT')
    keys(inv['residuals'],RESIDUAL_KEYS,'E_RESIDUAL_KEYS')
    if any(v!='pending' for v in inv['residuals'].values()):fail('E_RESIDUAL_PROMOTION')
def main():
    inv=read_json(HERE/'inventory.json'); atoms=read_jsonl(HERE/'semantic-atoms.jsonl'); legacy=read_jsonl(HERE/'legacy-links.jsonl'); validate(inv,atoms,legacy); print('PASS validate: 10 next-span candidates (7 atoms + 3 composites), 10/19 unprocessed parent spans, prior overlap=0')
if __name__=='__main__':
    try: main()
    except AssertionError as e: print('FAIL '+str(e),file=sys.stderr); sys.exit(1)
