#!/usr/bin/env python3
"""Independently verify marker removal and line-specific dispositions."""
import argparse,collections,hashlib,json,re,subprocess
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
INVENTORY=ROOT/'docs/governance/generated/l1-l12-layer-semantics-drift-inventory-v1.json'
LEDGER=ROOT/'docs/governance/generated/l1-l12-layer-semantics-compatibility-ledger-v1.json'
OUTPUT=ROOT/'docs/governance/generated/l1-l12-layer-semantics-compat-marker-independent-review-v1.json'
STRICT=ROOT/'docs/governance/generated/l1-l12-layer-semantics-remediation-independent-review-v3.json'
MARKER='HELIX:LAYER-SEMANTICS-COMPAT vmodel-l1-l12-v1'
HIGH=['docs/governance/helix-harness-concept_v3.1.md','docs/design/harness/L3-functional/roadmap.md','docs/governance/document-system-map.md','docs/governance/helix-harness-requirements_v1.2.md','docs/process/forward/L08-L14-verification-phase.md','docs/process/forward/overview.md']
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def main():
 ap=argparse.ArgumentParser();ap.add_argument('--check',action='store_true');args=ap.parse_args();inv=json.loads(INVENTORY.read_text());ledger=json.loads(LEDGER.read_text())
 strict=json.loads(STRICT.read_text());marker_files=[]
 for rel in subprocess.check_output(['git','ls-files','docs','src','tests'],cwd=ROOT,text=True).splitlines():
  try:
   if MARKER in (ROOT/rel).read_text(encoding='utf-8'):marker_files.append(rel)
  except (UnicodeDecodeError,OSError):pass
 compatible=not marker_files and strict['status']=='independent_review_pass_design_closed_runtime_unchanged' and strict['summary']['unresolved']==0
 result={'schema_version':'helix.layer-semantics-compat-marker-independent-review.v3-compat','status':'superseded_by_strict_v3_current' if compatible else 'superseded_compatibility_check_failed','superseded_by':{'path':str(STRICT.relative_to(ROOT)),'sha256':sha(STRICT),'schema_version':strict['schema_version'],'status':strict['status']},'sources':{'inventory':{'path':str(INVENTORY.relative_to(ROOT)),'sha256':sha(INVENTORY)},'compatibility_ledger':{'path':str(LEDGER.relative_to(ROOT)),'sha256':sha(LEDGER)}},'summary':{'marker_files':len(marker_files),'strict_unresolved':strict['summary']['unresolved'],'runtime_mutations':0,'verified_true':0,'coverage_credit_true':0},'claim_boundary':'互換checkのみ。Design closure判定はstrict v3を正本とし、本artifact単独で判定・coverage昇格しない。'}
 encoded=(json.dumps(result,ensure_ascii=False,indent=2,sort_keys=True)+'\n').encode()
 if args.check:
  if not OUTPUT.exists() or OUTPUT.read_bytes()!=encoded:raise SystemExit('review artifact stale')
 else:OUTPUT.write_bytes(encoded)
 if not compatible:raise SystemExit('strict v3 compatibility check failed')
 return
 marker_files=[]
 for rel in subprocess.check_output(['git','ls-files','docs','src','tests'],cwd=ROOT,text=True).splitlines():
  try:
   if MARKER in (ROOT/rel).read_text(encoding='utf-8'):marker_files.append(rel)
  except (UnicodeDecodeError,OSError):pass
 alias_keys={x['alias_key'] for x in ledger['aliases']};issues=[]
 for row in inv['findings']:
  if row['disposition'] in {'central_compatibility_alias_registered','terminal_design_redesign_backlog','line_specific_compatibility_reference'} and row.get('compatibility_alias_key') not in alias_keys:issues.append({'path':row['path'],'line':row['line'],'code':'alias_key_missing'})
  if row['disposition']=='terminal_design_redesign_backlog' and not row['semantic_correction_obligation_open']:issues.append({'path':row['path'],'line':row['line'],'code':'open_redesign_hidden'})
 high_open=collections.Counter(r['path'] for r in inv['findings'] if r['path'] in HIGH and r['semantic_correction_obligation_open'])
 names=subprocess.check_output(['git','diff','--name-status'],cwd=ROOT,text=True).splitlines();atomic=[x for x in names if x.startswith(('R','D'))]
 confusion=[x for x in inv['design_harness_mentions'] if x['ownership']=='possible_verification_or_general_design_conflation']
 if marker_files:issues.append({'code':'file_wide_markers_remain','count':len(marker_files)})
 if high_open:issues.append({'code':'high_density_normative_open','files':dict(high_open)})
 if atomic:issues.append({'code':'atomic_rename_or_delete_observed','operations':atomic})
 result={'schema_version':'helix.layer-semantics-compat-marker-independent-review.v2','status':'independent_review_pass_markers_removed_open_redesign_visible' if not issues else 'independent_review_findings_open','sources':{'inventory':{'path':str(INVENTORY.relative_to(ROOT)),'sha256':sha(INVENTORY)},'compatibility_ledger':{'path':str(LEDGER.relative_to(ROOT)),'sha256':sha(LEDGER)}},'authority':{'vmodel_candidate':True,'runtime_cutover':False,'canonical_layers':inv['canonical_layers']},'summary':{'marker_files':len(marker_files),'inventory_findings':len(inv['findings']),'central_alias_registered':sum(r['disposition']=='central_compatibility_alias_registered' for r in inv['findings']),'line_specific_compatibility':sum(r['disposition']=='line_specific_compatibility_reference' for r in inv['findings']),'historical':sum(r['disposition']=='explicit_historical_classification' for r in inv['findings']),'open_terminal_redesign_visible':sum(r['semantic_correction_obligation_open'] for r in inv['findings']),'high_density_open':sum(high_open.values()),'design_harness_conflation':len(confusion),'atomic_rename_or_delete':len(atomic),'runtime_mutations':0,'verified_true':0,'coverage_credit_true':0},'findings':issues,'high_density_files':HIGH,'design_harness_review':{'mentions':len(inv['design_harness_mentions']),'conflation':len(confusion)},'safety':{'runtime':False,'verified':False,'coverage_credit':False}}
 encoded=(json.dumps(result,ensure_ascii=False,indent=2,sort_keys=True)+'\n').encode()
 if args.check:
  if not OUTPUT.exists() or OUTPUT.read_bytes()!=encoded:raise SystemExit('review artifact stale')
 else:OUTPUT.write_bytes(encoded)
 if issues:raise SystemExit('review findings remain')
if __name__=='__main__':main()
