#!/usr/bin/env python3
"""Independent review of DF-BUN-002 terminal Design receipts."""

import argparse, collections, hashlib, json
from pathlib import Path

ROOT=Path(__file__).resolve().parents[2]
CANDIDATE=ROOT/'docs/governance/generated/helix-df-bun-002-terminal-design-receipts-v1.json'
READJ=ROOT/'docs/governance/generated/helix-bun-historical-retain-evidence-readjudication-v1.json'
OUTPUT=ROOT/'docs/governance/generated/helix-df-bun-002-terminal-design-receipts-independent-review-v1.json'
BASELINE='e00c35a2beff072328cfa3cd5215778fc7be902b308e9537a0c6dcfe7d023ce8'

def load(p): return json.loads(p.read_text())
def sha(b): return hashlib.sha256(b).hexdigest()
def digest(v): return sha(json.dumps(v,ensure_ascii=False,separators=(',',':'),sort_keys=True).encode())
def receipt_valid(row): return digest({k:v for k,v in row.items() if k not in {'design_obligation_receipt_sha256','design_disposition','design_pending','runtime_mutation','verified','coverage_credit'}})==row['design_obligation_receipt_sha256']

def main():
 ap=argparse.ArgumentParser();ap.add_argument('--check',action='store_true');args=ap.parse_args()
 c=load(CANDIDATE); rj=load(READJ); rj_by={r['atom_id']:r for r in rj['records']}; findings=[]; reviews=[]
 docs={p: (ROOT/p).read_text(errors='replace') for p in [
  'docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md',
  'docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md',
  'docs/design/helix/L4-basic-design/infinity-loop-platform-basic-design.md',
  'docs/test-design/helix/L3-infinity-loop-acceptance-test-design.md',
  'docs/test-design/helix/L10-infinity-loop-platform-system-test-design.md']}
 def add(kind,row,issues):
  reviews.append({'kind':kind,'atom_id':row['atom_id'],'findings':issues}); findings.extend({'kind':kind,'atom_id':row['atom_id'],'code':x} for x in issues)
 for row in c['active_exact_routes']:
  issues=[]
  if not receipt_valid(row): issues.append('receipt_digest_mismatch')
  routes=[('requirement_route','hil_ids'),('functional_route','hr_ids'),('functional_route','hac_ids'),('acceptance_route','hat_ids'),('system_route','hst_ids')]
  for route,key in routes:
   obj=row[route]; text=docs[obj['artifact_path']]
   if not obj[key] or any(x not in text for x in obj[key]): issues.append(f'{key}_route_not_exact_current')
  if any(x not in docs[row['component_route']['artifact_path']] for x in row['component_route']['symbols']): issues.append('component_route_not_exact_current')
  if row['route_authority']!='proposal_only': issues.append('active_route_authority_leak')
  add('active_exact_route',row,issues)
 required={'independent_replay','owner_confirmation','alias_expiry','generated_zero','tombstone','rollback'}
 for row in c['terminal_retirement_challenges']:
  issues=[]
  if not receipt_valid(row): issues.append('receipt_digest_mismatch')
  if {x['obligation'] for x in row['retirement_obligations']}!=required or any(x['status']!='required_at_runtime_retirement_gate' for x in row['retirement_obligations']): issues.append('six_evidence_challenge_incomplete')
  state={'atom_id':row['atom_id'],'source':row['source'],'obligations':[(x['obligation'],x['required_evidence']) for x in row['retirement_obligations']]}
  if digest(state)!=row.get('current_retirement_evidence_state_sha256'): issues.append('current_evidence_digest_mismatch')
  if row['deletion_authorized'] or row['supersede_authorized']: issues.append('retirement_authority_leak')
  if row['owner_component'] not in docs['docs/design/helix/L4-basic-design/infinity-loop-platform-basic-design.md']: issues.append('owner_not_current')
  add('terminal_retirement_challenge',row,issues)
 for row in c['terminal_unproven_custody_challenges']:
  issues=[]; upstream=rj_by.get(row['atom_id'])
  if not receipt_valid(row): issues.append('receipt_digest_mismatch')
  expected=digest({'atom_id':row['atom_id'],'source':row['source'],'issues':row['unproven_reasons'],'upstream':row['upstream_custody_receipt_sha256']})
  if expected!=row.get('current_unproven_evidence_sha256'): issues.append('reopen_evidence_digest_mismatch')
  if not row['unproven_reasons']: issues.append('unproven_reason_hidden')
  if not upstream or upstream['custody_receipt_candidate']['receipt_sha256']!=row['upstream_custody_receipt_sha256']: issues.append('upstream_custody_drift')
  if row['adoption_authorized'] or row['retirement_authorized']: issues.append('challenge_authority_leak')
  if 'different evidence digest' not in row['reopen_rule']: issues.append('reopen_trigger_not_digest_bound')
  if row['owner_component'] not in docs['docs/design/helix/L4-basic-design/infinity-loop-platform-basic-design.md']: issues.append('owner_not_current')
  add('terminal_unproven_custody_challenge',row,issues)
 classes=collections.Counter()
 for row in c['current_bun_string_overlap_transfer_receipts']:
  issues=[]; classes[row['classification']]+=1
  if not receipt_valid(row): issues.append('receipt_digest_mismatch')
  evidence={k:row[k] for k in ('atom_id','classification','authority_hits','fixture_hits','source_atom_sha256')}
  if digest(evidence)!=row['overlap_evidence_sha256']: issues.append('overlap_evidence_digest_mismatch')
  expected='mixed_authority_and_fixture' if row['authority_hits'] and row['fixture_hits'] else 'authority_surface' if row['authority_hits'] else 'fixture_surface' if row['fixture_hits'] else None
  if row['classification']!=expected: issues.append('overlap_classification_wrong')
  for hit in row['authority_hits']+row['fixture_hits']:
   path=ROOT/hit['path']
   if not path.exists() or hit['command'] not in path.read_text(errors='replace'): issues.append('current_bun_hit_not_current')
  if row['runtime_transfer_target']!='RA-BUN-001' or not row['runtime_remediation_pending']: issues.append('runtime_transfer_not_explicit')
  if 'hit-set digest' not in row['reopen_rule']: issues.append('overlap_reopen_trigger_missing')
  if row['owner_component'] not in docs['docs/design/helix/L4-basic-design/infinity-loop-platform-basic-design.md']: issues.append('owner_not_current')
  add('current_bun_overlap_transfer',row,sorted(set(issues)))
 allrows=c['active_exact_routes']+c['terminal_retirement_challenges']+c['terminal_unproven_custody_challenges']+c['current_bun_string_overlap_transfer_receipts']
 if any(x['runtime_mutation'] or x['verified'] or x['coverage_credit'] for x in allrows): findings.append({'kind':'global','atom_id':None,'code':'runtime_or_credit_leak'})
 if classes != {'mixed_authority_and_fixture':136,'fixture_surface':1}: findings.append({'kind':'global','atom_id':None,'code':'overlap_denominator_drift'})
 result={'schema_version':'helix.df-bun-002-terminal-design-receipts-independent-review.v1','status':'independent_review_pass_terminal_design_closed_runtime_open' if not findings else 'independent_review_findings_open','sources':{'baseline_candidate_sha256':BASELINE,'corrected_candidate':{'path':str(CANDIDATE.relative_to(ROOT)),'sha256':sha(CANDIDATE.read_bytes())},'producer_readjudication':{'path':str(READJ.relative_to(ROOT)),'sha256':sha(READJ.read_bytes())}},'decision':{'design_freeze':'closed_by_explicit_terminal_disposition_and_digest_bound_runtime_transfer','runtime_acceptance':'open_RA-BUN-001','unproven_hidden':False,'terminal_atom_receipts':88,'overlap_transfer_receipts':137,'overlap_classification':dict(classes)},'summary':{'active_routes':7,'retirement_challenges':8,'unproven_custody_challenges':73,'overlap_transfers':137,'records_with_findings':len({(x['kind'],x['atom_id']) for x in findings}),'finding_count':len(findings),'runtime_mutations':0,'verified_true':0,'coverage_credit_true':0},'findings':findings,'records':reviews,'safety':{'runtime':False,'verified':False,'coverage_credit':False}}
 encoded=(json.dumps(result,ensure_ascii=False,indent=2,sort_keys=True)+'\n').encode()
 if args.check:
  if not OUTPUT.exists() or OUTPUT.read_bytes()!=encoded: raise SystemExit('review artifact stale')
 else: OUTPUT.write_bytes(encoded)
 if findings: raise SystemExit('independent findings remain')
if __name__=='__main__': main()
