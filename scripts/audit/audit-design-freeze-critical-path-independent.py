#!/usr/bin/env python3
"""Independent source-rebound audit of the Design Freeze critical path."""
import argparse,hashlib,json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
CRITICAL=ROOT/'docs/governance/generated/design-freeze-critical-path-v1.json'
OUTPUT=ROOT/'docs/governance/generated/design-freeze-critical-path-source-rebound-independent-audit-v1.json'
def load(p):return json.loads(p.read_text())
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def main():
 ap=argparse.ArgumentParser();ap.add_argument('--check',action='store_true');args=ap.parse_args();d=load(CRITICAL);issues=[];source_reviews=[]
 design={x['blocker_id']:x for x in d['design_freeze_critical_path']};runtime={x['blocker_id']:x for x in d['runtime_acceptance_blockers_separated']}
 def check(cond,code,evidence=None):
  if not cond:issues.append({'code':code,'evidence':evidence})
 for axis,rows in [('design',d['design_freeze_critical_path']),('runtime',d['runtime_acceptance_blockers_separated'])]:
  for row in rows:
   src=ROOT/row['source_artifact']['path'];current=src.exists() and sha(src)==row['source_artifact']['sha256'];source_reviews.append({'axis':axis,'id':row['blocker_id'],'path':row['source_artifact']['path'],'digest_current':current,'status':row['status']});check(current,'source_digest_stale',row['blocker_id'])
 for row in d['current_nonblocking_review_sources']:
  src=ROOT/row['path'];current=src.exists() and sha(src)==row['sha256'];source_reviews.append({'axis':'nonblocking_design','id':row['role'],'path':row['path'],'digest_current':current,'status':row['status']});check(current,'nonblocking_digest_stale',row['role'])
 check(len(design)==8,'design_denominator',len(design));check(len(runtime)==5,'runtime_denominator',len(runtime));check(set(design).isdisjoint(runtime),'design_runtime_double_count',sorted(set(design)&set(runtime)))
 po=load(ROOT/design['DF-PO-001']['source_artifact']['path']);vm=load(ROOT/design['DF-PO-002']['source_artifact']['path']);po_ids={q for g in po['decision_groups'] for q in g['question_ids']};vm_ids={x['id'] for x in vm['missing_po_decisions']}
 check(len(po['decision_groups'])==6 and len(vm_ids)==1 and po_ids.isdisjoint(vm_ids) and d['summary']['po_authority_decision_units']==7,'po_units_not_exact_6_plus_1',{'groups':len(po['decision_groups']),'vm':sorted(vm_ids)})
 activation=load(ROOT/'docs/governance/generated/po7-activation-runtime-independent-audit-v1.json')
 activation_ok=activation['status']=='independent_audit_pass_authority_activated' and activation['projection']['decision_groups_activated']==6 and activation['projection']['question_receipts_activated']==22 and activation['projection']['vmodel_authority_events']==1 and activation['projection']['freeze_blocker_status']=='closed'
 check(activation_ok,'po_activation_audit_not_current')
 check(design['DF-PO-001']['status']=='closed' and design['DF-PO-002']['status']=='closed','po_design_rows_not_closed')
 bun1=load(ROOT/design['DF-BUN-001']['source_artifact']['path']);bun2=load(ROOT/design['DF-BUN-002']['source_artifact']['path']);exact=load(ROOT/design['DF-EXACT2-001']['source_artifact']['path']);layer=load(ROOT/design['DF-LAYER-SEM-001']['source_artifact']['path']);universal=load(ROOT/design['DF-UNIVERSAL-002']['source_artifact']['path']);chat=load(ROOT/design['DF-CHAT-001']['source_artifact']['path'])
 check(design['DF-BUN-001']['status']=='closed' and bun1['status'].startswith('independent_review_pass'),'bun1_not_status_derived')
 check(design['DF-BUN-002']['status']=='closed' and bun2['status']=='independent_review_pass_terminal_design_closed_runtime_open' and bun2['summary']['finding_count']==0,'bun2_not_status_derived')
 check(design['DF-EXACT2-001']['status']=='closed' and exact['status']=='design_closure_accepted_candidate_not_verified' and exact['decision']['pending_zero_recognized_as_design_closure'] and not exact['findings']['issue_counts'],'exact2_not_status_derived')
 check(design['DF-LAYER-SEM-001']['status']=='closed' and layer['status']=='independent_review_pass_design_closed_runtime_unchanged' and not layer['findings'] and all(layer['summary'][k]==0 for k in ('independent_open_backlog','producer_open_backlog','unresolved')),'layer_not_fail_closed')
 check(design['DF-UNIVERSAL-002']['status']=='closed' and universal['status']=='independent_review_pass' and universal['summary']['finding_count']==0,'universal_not_closed')
 check(design['DF-CHAT-001']['status']=='closed_source_limited' and chat['status']=='pass_with_source_limitation' and chat['verdicts']['raw_transcript_completeness']=='unproven','chat_source_limit_overclaimed')
 non={x['role']:x for x in d['current_nonblocking_review_sources']};save=load(ROOT/non['savepoint_layer_tag_design']['path']);check(save['status']=='independent_review_design_gaps_closed_not_executed' and save['summary']['open']==0 and save['summary']['executed']==0 and save['summary']['implemented']==0,'savepoint_closure_or_runtime_boundary_wrong')
 check(all(x['status']=='open' for x in runtime.values()),'runtime_row_not_open');check(d['summary']['runtime_acceptance_rows_separated']==5 and d['summary']['design_runtime_double_count_rows']==0,'runtime_separation_summary_wrong')
 check(d['summary']['design_freeze_open_rows']==0 and d['summary']['open_by_owner_class']=={} and not {x['blocker_id'] for x in design.values() if x['status']=='open'} and d['summary']['po_authority_activated_units']==7,'design_freeze_not_closed_by_activation')
 check(d['summary']['verified_true']==0 and d['summary']['coverage_credit_true']==0 and d['summary']['runtime_execution_credit_in_design_freeze']==0,'premature_credit')
 check(d['status']=='design_freeze_authority_activated_runtime_separated','critical_status_not_closed')
 result={'schema_version':'helix.design-freeze-critical-path-source-rebound-independent-audit.v1','status':'independent_audit_pass_design_freeze_closed_runtime_separated' if not issues else 'independent_audit_findings_open','source':{'path':str(CRITICAL.relative_to(ROOT)),'sha256':sha(CRITICAL)},'projection':{'design_rows':8,'design_open_rows':0,'open_ids':[],'po_decision_units':7,'po_activated_units':7,'runtime_rows_separated':5,'double_count':0,'bun_closed':True,'exact2_closed':True,'layer_closed':True,'universal_closed':True,'savepoint_closed_not_executed':True,'chat_closed_source_limited':True},'source_rebound':source_reviews,'findings':issues,'safety':{'authority_activation_credit':1,'unrelated_runtime_execution_credit':0,'verified':False,'coverage_credit':False}}
 encoded=(json.dumps(result,ensure_ascii=False,indent=2,sort_keys=True)+'\n').encode()
 if args.check:
  if not OUTPUT.exists() or OUTPUT.read_bytes()!=encoded:raise SystemExit('audit artifact stale')
 else:OUTPUT.write_bytes(encoded)
 if issues:raise SystemExit('independent audit findings remain')
if __name__=='__main__':main()
