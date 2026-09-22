#!/usr/bin/env python3
"""Validate bounded, source-bound Web/Web-OS semantic atom candidates."""
from __future__ import annotations
import hashlib, json, subprocess, sys
from pathlib import Path
HERE=Path(__file__).resolve().parent
ROOT=HERE.parents[1]
BASE='1db1e9d78b9cb552394c647145343704efffe529'
VISION='archive/legacy-generation-2026-09-14/root/docs/archive/intake/2026-09-06-concept-vision/vision/HELIX_VISION_v0.1.md'
PARENT='scaffold/rdp001-web-webos-vision-source-0080'
PARENT_INV=PARENT+'/inventory.json'; PARENT_SPANS=PARENT+'/vision-spans.jsonl'; PARENT_LEGACY=PARENT+'/legacy-evidence.jsonl'
INV_KEYS={'schema','candidate_id','status','authority_effect','meaning_change_applied','formal_requirement_unit_count','successor_requirement_ids','human_decision_ref','formal_register_append','old_runtime_test_ci_execution','scope','candidate_products','source','findings','unresolved_questions','prohibited_inference','verification_contract','residuals','created','updated'}
SCOPE_KEYS={'worktree','base_origin_main','read_only','static_only','old_archive_execution','parent_binding_id','parent_scaffold_path','parent_inventory_sha256','parent_span_file_sha256','parent_span_count','selected_parent_span_ids','selected_parent_span_count','unprocessed_parent_span_ids','unprocessed_parent_span_count','vision_source_path','vision_source_sha256','vision_source_line_count','selected_candidate_source_line_count','unprocessed_candidate_source_line_count','semantic_atom_record_count','atomized_candidate_count','composite_unresolved_count','web_user_atom_count','webos_runtime_atom_count','selected_legacy_asset_count','legacy_asset_unreviewed_count','selection_rule'}
PRODUCT_KEYS={'product','candidate_role','atom_count','owner_status','authority_status','implementation_status','degradation_status'}
SOURCE_KEYS={'path','sha256','parent_span_file','parent_span_file_sha256','semantic_atoms_path','semantic_atoms_sha256','legacy_links_path','legacy_links_sha256'}
ATOM_KEYS={'atom_id','parent_span_id','related_open_decision_ids','source_path','source_line_start','source_line_end','exact_source_text','source_span_sha256','candidate_text','candidate_product','candidate_role','candidate_kind','atomization_status','connective_tokens','semantic_status','semantic_equivalence','owner_status','authority_status','adoption_status','legacy_implementation_status','current_implementation_status','legacy_degradation_status','current_degradation_status','failure_status','consumer_status','decision_status','meaning_change_applied','unresolved_questions','composite_reason'}
LEGACY_KEYS={'asset_id','source_path','source_sha256','source_snapshot','parent_evidence_path','parent_evidence_sha256','source_evidence','decision_evidence','failure_evidence','consumer_evidence','catalog_evidence','disposition_evidence','relation_status','legacy_implementation_status','current_implementation_status','legacy_degradation_status','current_degradation_status','authority_effect','meaning_change_applied'}
CONTRACT_KEYS={'required_commands','negative_cases','archive_rule'}
RESIDUAL_KEYS={'formal_requirement_unit','semantic_equivalence','owner_authority','legacy_failure','legacy_consumer_closure','legacy_implementation','current_implementation','degradation'}
SELECTED_PARENT=['VISION-SEC-3','VISION-SEC-6.1','VISION-SEC-6.2','VISION-SEC-7','VISION-SEC-12','VISION-U07','VISION-U08','VISION-U09','VISION-O03','VISION-O04']
GROUPS=set(SELECTED_PARENT)
ORDER=['WEB-ATOM-001','WEB-ATOM-002','WEB-ATOM-003','WEB-ATOM-004','WEB-ATOM-005','WEBOS-ATOM-001','WEBOS-ATOM-002','WEBOS-ATOM-003','WEBOS-ATOM-004','WEBOS-COMPOSITE-001','WEBOS-COMPOSITE-002','WEB-COMPOSITE-001','WEB-COMPOSITE-002','WEBOS-COMPOSITE-003','WEBOS-COMPOSITE-004','WEBOS-COMPOSITE-005']
ATOM_EXPECTED={
 'WEB-ATOM-001':('VISION-SEC-6.1','HELIX-Web','web_user_experience','user_duty',241,241,['・','と'],'atomized_candidate'),
 'WEB-ATOM-002':('VISION-SEC-6.1','HELIX-Web','web_service_surface','user_duty',246,246,['・'],'atomized_candidate'),
 'WEB-ATOM-003':('VISION-SEC-7','HELIX-Web','user_control_of_change_permission_acceptance','user_duty',289,289,['か','、'],'atomized_candidate'),
 'WEB-ATOM-004':('VISION-U07','HELIX-Web','web_expansion_band','vision_direction',536,536,['~'],'atomized_candidate'),
 'WEB-ATOM-005':('VISION-U08','HELIX-Web','web_access_to_development_experience','user_duty',537,537,['を'],'atomized_candidate'),
 'WEBOS-ATOM-001':('VISION-SEC-6.1','HELIX-Web-OS','connector_handoff_and_evidence','service_runtime',248,248,['、','・'],'atomized_candidate'),
 'WEBOS-ATOM-002':('VISION-SEC-6.1','HELIX-Web-OS','permitted_runtime_environment','service_runtime',250,250,['／'],'atomized_candidate'),
 'WEBOS-ATOM-003':('VISION-SEC-3','HELIX-Web-OS','release_pack_definition','service_runtime',102,102,['、','／','・'],'atomized_candidate'),
 'WEBOS-ATOM-004':('VISION-SEC-3','HELIX-Web-OS','connector_install_update_route','service_runtime',110,110,['→','／','・'],'atomized_candidate'),
 'WEBOS-COMPOSITE-001':('VISION-SEC-6.2','HELIX-Web-OS','provider_authentication_boundary','service_runtime',260,260,['と','。','・'],'composite_unresolved'),
 'WEBOS-COMPOSITE-002':('VISION-SEC-6.2','HELIX-Web-OS','connector_mcp_job_lifecycle','service_runtime',264,264,['、','・','、','・','も'],'composite_unresolved'),
 'WEB-COMPOSITE-001':('VISION-SEC-7','HELIX-Web','autonomy_stage_matrix','user_duty',293,297,['、','・','→'],'composite_unresolved'),
 'WEB-COMPOSITE-002':('VISION-U09','HELIX-Web','initial_service_release_pack_direction','vision_direction',538,538,['。','そして'],'composite_unresolved'),
 'WEBOS-COMPOSITE-003':('VISION-SEC-12','HELIX-Web-OS','connection_phase_gate','service_runtime',440,443,['、','→','・'],'composite_unresolved'),
 'WEBOS-COMPOSITE-004':('VISION-O03','HELIX-Web-OS','provider_connection_open_decision','service_runtime',478,478,['・','／','・'],'composite_unresolved'),
 'WEBOS-COMPOSITE-005':('VISION-O04','HELIX-Web-OS','connector_mcp_open_decision','service_runtime',479,479,['と','：','、','・','。'],'composite_unresolved'),
}
LEGACY_IDS=['LEGACY-ASSET-DD53551C74BB4939A325','LEGACY-ASSET-A297D67A1D8AD6EE6D6B','LEGACY-ASSET-0C5F0695490FA5D87419','LEGACY-ASSET-C3DE79BA9451172F3E43','LEGACY-ASSET-DD66C1B6B7BE234B37E6','LEGACY-ASSET-54330A68064B58B22259']

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
    if inv['schema']!='rdp001-web-webos-vision-semantic-atoms/v1' or inv['candidate_id']!='RDP-001-WEB-WEBOS-VISION-SEMANTIC-ATOMS-0081':fail('E_IDENTITY')
    if inv['status']!='findings_only' or inv['authority_effect']!='none' or inv['meaning_change_applied'] or inv['formal_requirement_unit_count']!='not_generated':fail('E_BOUNDARY')
    if inv['successor_requirement_ids'] or inv['human_decision_ref'] is not None or inv['formal_register_append'] or inv['old_runtime_test_ci_execution']:fail('E_PROMOTION')
    s=inv['scope'];keys(s,SCOPE_KEYS,'E_SCOPE_KEYS')
    current_head=subprocess.run(['git','rev-parse','HEAD'],cwd=ROOT,text=True,capture_output=True).stdout.strip()
    if s['base_origin_main']!=BASE or subprocess.run(['git','merge-base','--is-ancestor',BASE,current_head],cwd=ROOT).returncode!=0:fail('E_BASE')
    if not s['read_only'] or not s['static_only'] or s['old_archive_execution']:fail('E_SCOPE_BOUNDARY')
    if s['parent_binding_id']!='SCF-B-0080' or s['parent_scaffold_path']!=PARENT or s['parent_span_count']!=29 or s['selected_parent_span_count']!=10 or s['unprocessed_parent_span_count']!=19:fail('E_PARENT_COUNTS')
    if s['selected_parent_span_ids']!=SELECTED_PARENT or set(s['unprocessed_parent_span_ids'])!=set(x['span_id'] for x in git_jsonl(PARENT_SPANS))-GROUPS:fail('E_PARENT_DENOM')
    vb=git_show(VISION); vl=vb.decode().splitlines(keepends=True)
    if s['vision_source_path']!=VISION or s['vision_source_sha256']!=sha(vb) or s['vision_source_line_count']!=583:fail('E_VISION_SOURCE')
    p_inv=git_show(PARENT_INV); p_spans=git_show(PARENT_SPANS); p_leg=git_show(PARENT_LEGACY)
    if s['parent_inventory_sha256']!=sha(p_inv) or s['parent_span_file_sha256']!=sha(p_spans):fail('E_PARENT_DIGEST')
    if s['semantic_atom_record_count']!=16 or s['atomized_candidate_count']!=9 or s['composite_unresolved_count']!=7 or s['web_user_atom_count']!=7 or s['webos_runtime_atom_count']!=9:fail('E_COUNTS')
    # product counts are records by candidate product: Web 7, Web-OS 9.
    products=inv['candidate_products'];
    if len(products)!=2:fail('E_PRODUCT_COUNT')
    for p in products:
        keys(p,PRODUCT_KEYS,'E_PRODUCT_KEYS')
        if p['product'] not in ('HELIX-Web','HELIX-Web-OS') or p['candidate_role'] not in ('web_user_responsibility','service_runtime') or p['owner_status']!='unknown' or p['authority_status']!='none' or p['implementation_status']!='unknown' or p['degradation_status']!='unknown':fail('E_PRODUCT_BOUNDARY')
    source=inv['source'];keys(source,SOURCE_KEYS,'E_SOURCE_KEYS')
    if source['path']!=VISION or source['sha256']!=sha(vb) or source['parent_span_file']!=PARENT_SPANS or source['parent_span_file_sha256']!=sha(p_spans) or source['semantic_atoms_path']!='scaffold/rdp001-web-webos-vision-semantic-atoms-0081/semantic-atoms.jsonl' or source['semantic_atoms_sha256']!=sha((HERE/'semantic-atoms.jsonl').read_bytes()) or source['legacy_links_path']!='scaffold/rdp001-web-webos-vision-semantic-atoms-0081/legacy-links.jsonl' or source['legacy_links_sha256']!=sha((HERE/'legacy-links.jsonl').read_bytes()):fail('E_SOURCE_METADATA')
    if len(atoms)!=16 or [x.get('atom_id') for x in atoms]!=ORDER:fail('E_ATOM_ORDER')
    parent_spans=read_jsonl(ROOT/PARENT_SPANS); parent_by={x['span_id']:x for x in parent_spans}
    seen=set()
    referenced_parents=set()
    for a in atoms:
        keys(a,ATOM_KEYS,'E_ATOM_KEYS');aid=a['atom_id']
        if aid not in ATOM_EXPECTED:fail('E_ATOM_ID',aid)
        parent,prod,role,kind,start,end,conn,status=ATOM_EXPECTED[aid]
        actual_parent=a['parent_span_id']
        if actual_parent not in GROUPS or actual_parent not in parent_by or a['source_path']!=VISION:fail('E_ATOM_PARENT_CONTAINMENT',aid)
        parent_record=parent_by[actual_parent]
        if parent_record['source_path']!=VISION or not isinstance(a['source_line_start'],int) or not isinstance(a['source_line_end'],int) or not (parent_record['line_start']<=a['source_line_start']<=a['source_line_end']<=parent_record['line_end']):fail('E_ATOM_PARENT_CONTAINMENT',aid)
        referenced_parents.add(actual_parent)
        if (a['parent_span_id'],a['candidate_product'],a['candidate_role'],a['candidate_kind'],a['source_line_start'],a['source_line_end'],a['connective_tokens'],a['atomization_status'])!=(parent,prod,role,kind,start,end,conn,status):fail('E_ATOM_META',aid)
        expected_related=['VISION-O04'] if aid=='WEBOS-COMPOSITE-002' else []
        if a['related_open_decision_ids']!=expected_related:fail('E_ATOM_RELATION',aid)
        exact=''.join(vl[start-1:end])
        if a['exact_source_text']!=exact or a['candidate_text']!=exact.rstrip('\n') or a['source_span_sha256']!=sha(exact.encode()):fail('E_ATOM_TEXT',aid)
        if a['semantic_status']!=('source_bound_candidate' if status=='atomized_candidate' else 'composite_unresolved') or a['semantic_equivalence']!='unknown' or a['owner_status']!='unknown' or a['authority_status']!='none' or a['adoption_status']!='unknown' or a['meaning_change_applied']:fail('E_ATOM_BOUNDARY',aid)
        for st in ('legacy_implementation_status','current_implementation_status','legacy_degradation_status','current_degradation_status','failure_status','consumer_status','decision_status'):
            if a[st]!='unknown':fail('E_ATOM_UNKNOWN',aid+':'+st)
        if not isinstance(a['unresolved_questions'],list) or not a['unresolved_questions']:fail('E_ATOM_UNRESOLVED',aid)
        if status=='composite_unresolved' and not a['composite_reason']:fail('E_COMPOSITE_REASON',aid)
        if status=='atomized_candidate' and a['composite_reason'] is not None:fail('E_ATOM_COMPOSITE_REASON',aid)
        seen.update(range(start,end+1))
    if referenced_parents!=GROUPS:fail('E_PARENT_COVERAGE',','.join(sorted(GROUPS-referenced_parents)))
    if s['selected_candidate_source_line_count']!=len(seen) or s['unprocessed_candidate_source_line_count']!=583-len(seen):fail('E_SOURCE_LINE_COUNTS')
    if len(legacy)!=6 or [x.get('asset_id') for x in legacy]!=LEGACY_IDS:fail('E_LEGACY_ORDER')
    parent_legacy=read_jsonl(ROOT/PARENT_LEGACY);pb={x['asset_id']:x for x in parent_legacy};parent_digest=sha(p_leg)
    for x in legacy:
        keys(x,LEGACY_KEYS,'E_LEGACY_KEYS');aid=x['asset_id']
        if aid not in pb:fail('E_LEGACY_MISSING',aid)
        p=pb[aid]
        for k in ('source_path','source_sha256','source_snapshot'):
            if x[k]!=p[k]:fail('E_LEGACY_SOURCE',aid+':'+k)
        if x['parent_evidence_path']!=PARENT_LEGACY or x['parent_evidence_sha256']!=parent_digest or x['source_evidence']!='confirmed_from_parent_static_snapshot':fail('E_LEGACY_PARENT',aid)
        for k in ('decision_evidence','failure_evidence','consumer_evidence','catalog_evidence','disposition_evidence'):
            if x[k]!=p[k]:fail('E_LEGACY_EVIDENCE',aid+':'+k)
        if x['relation_status']!='candidate_only' or x['legacy_implementation_status']!='unknown' or x['current_implementation_status']!='unknown' or x['legacy_degradation_status']!='unknown' or x['current_degradation_status']!='unknown' or x['authority_effect']!='none' or x['meaning_change_applied']:fail('E_LEGACY_BOUNDARY',aid)
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
    inv=read_json(HERE/'inventory.json');atoms=read_jsonl(HERE/'semantic-atoms.jsonl');legacy=read_jsonl(HERE/'legacy-links.jsonl');validate(inv,atoms,legacy);print('PASS validate: 16 source-bound candidates (9 atoms + 7 composites), 10/29 parent spans, 6 legacy links')
if __name__=='__main__':
    try:main()
    except AssertionError as e:print('FAIL '+str(e),file=sys.stderr);sys.exit(1)
