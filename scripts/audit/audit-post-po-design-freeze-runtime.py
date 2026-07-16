#!/usr/bin/env python3
"""Independently audit the exported nine-boundary Design Freeze transition."""
import hashlib,json,subprocess
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2];GEN=ROOT/'docs/governance/generated'
RECEIPT=GEN/'post-po-design-freeze-transition-command-receipt-v1.json';OUTPUT=GEN/'post-po-design-freeze-transition-runtime-independent-audit-v1.json'
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def load(p):return json.loads(p.read_text())
def main():
 d=load(RECEIPT);e=d.get('evidence',{});issues=[]
 def check(c,code,actual=None):
  if not c:issues.append({'code':code,'actual':actual})
 expected=['design_freeze_transition_operations','design_freeze_authority_link_events','design_freeze_receipts','design_freeze_projections','design_freeze_progress_projections','design_freeze_l01_candidates','design_freeze_l01_handoffs','design_freeze_transition_outbox','design_freeze_transition_terminal_receipts']
 check(d.get('executed') is True,'not_executed');check(d.get('replay') is True,'replay_not_observed');check(set(e)==set(expected),'write_boundary_set',sorted(e))
 check(all(e.get(t,{}).get('operation_id')==d.get('operationId') for t in expected),'operation_binding')
 terminal=e.get('design_freeze_transition_terminal_receipts',{});freeze=e.get('design_freeze_receipts',{});fp=e.get('design_freeze_projections',{});progress=e.get('design_freeze_progress_projections',{});candidate=e.get('design_freeze_l01_candidates',{});handoff=e.get('design_freeze_l01_handoffs',{});outbox=e.get('design_freeze_transition_outbox',{})
 for top,row in [('payloadDigest','payload_digest'),('freezeReceiptDigest','freeze_receipt_digest'),('candidateDigest','candidate_digest'),('writeSetDigest','write_set_digest')]:check(d.get(top)==terminal.get(row),f'terminal_{row}')
 check(freeze.get('status')=='current' and freeze.get('denominator_count')==8,'freeze_not_current',freeze)
 check(fp.get('design_rows')==8 and fp.get('design_open_rows')==0 and fp.get('runtime_rows_separated')==5,'freeze_projection_wrong',fp)
 check(progress.get('implementation_credit')==progress.get('verification_credit')==progress.get('coverage_credit')==0,'progress_credit_nonzero',progress)
 check(candidate.get('local_state')=='proposed' and candidate.get('pair_state')=='pending_pair' and candidate.get('freeze_state')=='not_frozen' and candidate.get('counted')==0 and candidate.get('remote_creation_state')=='not_created','candidate_state_wrong',candidate)
 check(handoff.get('remote_authority')=='not_granted','remote_authority_granted',handoff);check(outbox.get('delivery_class')=='local_reconcile_only' and outbox.get('status')=='pending','outbox_not_local_only',outbox)
 # v1 receiptはatomic insertの証拠に限定する。authority currentを主張するには以下の
 # v2 custody/CAS/preimageが必須で、欠落中は必ずfail-closeする。
 required_operation_fields=['expected_authority_head','expected_freeze_head','expected_progress_head','expected_l01_candidate_head','design_denominator_set_digest','reviewer_identity','reviewer_model','reviewer_runtime','remote_observation_digest','expires_at']
 missing_operation_fields=[name for name in required_operation_fields if not op.get(name)] if 'op' in locals() else required_operation_fields
 current={'critical':'design-freeze-critical-path-v1.json','review':'design-freeze-critical-path-independent-review-v1.json','audit':'design-freeze-critical-path-source-rebound-independent-audit-v1.json','activation_audit':'po7-activation-runtime-independent-audit-v1.json'}
 operation_fields={'critical':'critical_digest','review':'critical_review_digest','audit':'critical_audit_digest','activation_audit':'activation_audit_digest'}
 op=e.get('design_freeze_transition_operations',{})
 missing_operation_fields=[name for name in required_operation_fields if not op.get(name)]
 check(not missing_operation_fields,'v2_authority_cas_preimage_fields_missing',missing_operation_fields)
 check(False,'latest_po7_head_and_lifecycle_not_independently_recomputed')
 check(False,'db_rows_and_ordered_write_set_not_independently_recomputed')
 check(False,'design_task_evidence_denominator_not_independently_recomputed')
 for key,name in current.items():check(op.get(operation_fields[key])==sha(GEN/name),f'{key}_source_stale')
 tags=subprocess.run(['git','-C',str(ROOT),'for-each-ref','--format=%(refname)%00%(objectname)','refs/tags/helix/layer/'],capture_output=True,check=True).stdout
 tag_digest=hashlib.sha256(tags).hexdigest()
 result={'schema_version':'helix.post-po-design-freeze-transition-runtime-independent-audit.v1','status':'provisional_atomic_insert_only_authority_hardening_required' if issues else 'independent_audit_pass_freeze_current_l01_pending_pair_remote_tag_zero','sources':{'receipt':{'path':str(RECEIPT.relative_to(ROOT)),'sha256':sha(RECEIPT)},**{k:{'path':f'docs/governance/generated/{v}','sha256':sha(GEN/v)} for k,v in current.items()}},'projection':{'write_boundaries':9,'freeze_current_claim_supported':not issues,'design_open_rows':fp.get('design_open_rows'),'runtime_rows_separated':fp.get('runtime_rows_separated'),'l01_local_state':candidate.get('local_state'),'l01_pair_state':candidate.get('pair_state'),'l01_counted':candidate.get('counted'),'remote_creation_state':candidate.get('remote_creation_state'),'remote_layer_tag_count':0 if not tags else len(tags.splitlines()),'remote_layer_tag_observation_digest':tag_digest,'idempotent_replay_observed':d.get('replay')},'findings':issues,'safety':{'design_freeze_transition_credit':0,'runtime_implementation_credit':0,'verified':False,'coverage_credit':False}}
 OUTPUT.write_text(json.dumps(result,ensure_ascii=False,indent=2,sort_keys=True)+'\n')
 if issues:print('PROVISIONAL: Design Freeze authority hardening required')
if __name__=='__main__':main()
