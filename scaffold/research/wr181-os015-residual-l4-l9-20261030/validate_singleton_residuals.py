#!/usr/bin/env python3
"""Static structure checks for WR181 OS015 L4/L9 singleton residual candidate."""
import json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[3]
L4=json.loads((ROOT/'docs/helix-os/L4-basic-design/management-authority-source-record.json').read_text())
L9=json.loads((ROOT/'docs/helix-os/L9-integration-verification/management-authority-source-record.json').read_text())
removed={
 'OS015-NEG-source_unresolved-original_event','OS015-NEG-source_conflict-original_event',
 'OS015-NEG-original_event_mutated','OS015-NEG-unresolved_promoted_to_current',
 'OS015-NEG-first_classification_prior_present','OS015-NEG-first_classification_prior_unresolved'}
new={'OS015-NEG-COMPOSITE-62fb66a6e279702c28b1aa4f8ee9380369f59c8322c999587e174c6c4992b558','OS015-NEG-COMPOSITE-deac8ce9011311dc91b808f2f94e7d2dcd7320bd68b2b820d7eeef6ac092e7f9'}
ids={x['class_id'] for x in L4['failure_classifications']}
assert len(ids)==47 and not ids.intersection(removed) and new <= ids
res=L4['diagnostic_contract']['composite_class_formation']['non_occurring_singleton_residuals']
assert len(res)==6 and {x['class_id'] for x in res}==removed and all(x['member_count']==0 for x in res)
assert len(L9['integration_cases'])==585 and L9['completion']['synthetic_case_count']==585
assert len(L9['negative_equivalence_classes'])==47
cases={x['id']:x for x in L9['integration_cases']}
for cid,axis,codes,pointers in [
 ('HELIXOS-L9-015-C0584','original_event',['original_event_mutated','source_unresolved','unresolved_promoted_to_current'],['/records/target_a/original_event','/records/target_a/original_event/event_id','/records/target_a/current_material_claim']),
 ('HELIXOS-L9-015-C0585','authority',['authority_state_unresolved','unresolved_promoted_to_current'],['/records/target_a/authority_state','/records/target_a/current_material_claim'])]:
 c=cases[cid]
 assert c['material_ref']=={'path':'docs/helix-os/L7-function-verification/management-authority-source-record.json','pointer':'/connection_materials/OS015/case/fixture_inputs/inspect'}
 assert c['condition']=='management_material_violation' and c['expected']['finding_codes']==codes
 assert [f['pointer'] for f in c['compact_whole_observation']['ordered_findings']]==pointers
 assert c['compact_whole_observation']['target_facets']['target_a'][axis]=='violation'
 assert c['compact_whole_observation']['ordered_findings'][-1]['return_owner']=='management-authority-owner'
 suite=next(x for x in L9['cases'] if x['id']=='HELIXOS-L9-015-P-F03')
assert suite['source_case_count']==31
assert [x for x in suite['source_case_refs'][-2:]]==[{'id':'HELIXOS-L9-015-C0584','index':583},{'id':'HELIXOS-L9-015-C0585','index':584}]
print('PASS: L4/L9 structure, residual registry, two hand-derived promotion stimuli, F03 refs')
