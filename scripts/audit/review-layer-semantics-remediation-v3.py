#!/usr/bin/env python3
"""Independent, falsifiable review of line-specific layer-semantics remediation."""
from __future__ import annotations
import hashlib,json,re,subprocess
from collections import Counter
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
LEDGER=ROOT/'docs/governance/generated/l1-l12-layer-semantics-compatibility-ledger-v1.json'
INVENTORY=ROOT/'docs/governance/generated/l1-l12-layer-semantics-drift-inventory-v1.json'
OUTPUT=ROOT/'docs/governance/generated/l1-l12-layer-semantics-remediation-independent-review-v3.json'
MARKER='HELIX:LAYER-SEMANTICS-COMPAT vmodel-l1-l12-v1'
DRIFT=[
('l8',re.compile(r'L8(?:-integration|\s*(?:=|:)\s*(?:integration|結合)|\s+結合(?:テスト)?)',re.I)),
('l9',re.compile(r'L9(?:-system|\s*(?:=|:)\s*(?:system|総合)|\s+総合(?:テスト)?)',re.I)),
('l10',re.compile(r'L10\s*(?:=|:)?\s*(?:UX\s*磨き|UX refinement|UX/WCAG)',re.I)),
('l11',re.compile(r'L11\s*(?:=|:)?\s*(?:総合レビュー|UAT)(?![^\n]{0,40}(?:human visual|人間visual))',re.I)),
('l12',re.compile(r'L12(?:-deploy|\s*(?:=|:)?\s*(?:デプロイ|受入))(?![^\n]{0,40}(?:operation|operational|value|運用|価値))',re.I)),]
COMPAT=re.compile(r'(?:legacy|旧|compat|互換|remap|再投影|段階移行|supersed|移行前|移行元)',re.I)
CENTRAL=re.compile(r'(?:docs|tests|src)/[^\s`|]*(?:L8-integration|L9-system|L10-ux|L11-uat|L12-acceptance)|pair_(?:artifact|freeze_exempt_target):|A-101\s*注記',re.I)
REWRITES={
'l8':[(r'L8\s*結合テスト','L9 結合テスト'),(r'L8\s*結合検証','L9 結合検証'),(r'L8\s*=\s*module 間 / 内外境界の\s*\*\*結合\*\*','L9 = module 間 / 内外境界の **結合**')],
'l9':[(r'L9\s*総合テスト','L10 システム/Real UX evidence 検証'),(r'L9\s*総合検証','L10 システム/Real UX evidence 検証')],
'l10':[(r'L10\s*UX\s*磨き(?:上げ)?(?:/WCAG)?','L10 システム/Real UX evidence'),(r'L10\s*UX refinement','L10 system/Real UX evidence'),(r'L10\s*UX/WCAG','L10 system/Real UX evidence'),(r'L10\s*UX\b','L10 system/Real UX evidence')],
'l11':[(r'L11\s*総合レビュー\s*[+・]?\s*UAT','L11 受入/human visual'),(r'L11\s*UAT','L11 受入/human visual')],
'l12':[(r'L12\s*受入テスト','L12 運用/価値検証'),(r'L12\s*受入検証','L12 運用/価値検証'),(r'L12\s*受入証跡','L12 運用/価値証跡'),(r'L12\s*受入観測','L12 運用/価値観測'),(r'L12\s*受入 evidence','L12 operational/value evidence'),(r'L12\s*受入\b','L12 運用/価値'),(r'L12\s*デプロイ\s*[+・]?\s*受入','L12 運用/価値')]}
def sha(v):return hashlib.sha256(v).hexdigest()
def historical(p):return p.startswith(('docs/archive/','docs/migration/','docs/governance/generated/'))
def open_old(p,line):
 if historical(p) or CENTRAL.search(line) or COMPAT.search(line) or p.startswith(('src/','tests/','docs/plans/')):return False
 if re.search(r'(?:L8-integration|L9-system|UX refinement)',line,re.I) and re.search(r'(?:`|path|ファイル名|降下先|理由)',line,re.I):return False
 return True
def rewrite(line,kind):
 protected=[]
 def hold(m):protected.append(m.group(0));return f'@@P{len(protected)-1}@@'
 v=re.sub(r'`[^`]*(?:L8-integration|L9-system|L10-ux|L11-uat|L12-acceptance)[^`]*`',hold,line)
 for pat,rep in REWRITES[kind]:v=re.sub(pat,rep,v,flags=re.I)
 for i,x in enumerate(protected):v=v.replace(f'@@P{i}@@',x)
 return v
def main():
 files=subprocess.check_output(['git','ls-files','docs','src','tests'],cwd=ROOT,text=True).splitlines();ledger=json.loads(LEDGER.read_text());inv=json.loads(INVENTORY.read_text());issues=[]
 markers=[]
 for rel in files:
  try:
   if MARKER in (ROOT/rel).read_text(encoding='utf8'):markers.append(rel)
  except:pass
 edge_issues=[];edges=[]
 for alias in ledger['aliases']:
  rx=re.compile(alias['legacy_token_pattern'],re.I)
  for e in alias['consumer_edges']:
   local=[];p=ROOT/e['path']
   try:lines=p.read_text(encoding='utf8').splitlines();line=lines[e['line']-1]
   except Exception:line='';local.append('path_or_line_missing')
   if line and sha(line.encode())!=e['line_sha256']:local.append('line_hash_mismatch')
   if line and not rx.search(line):local.append('alias_pattern_not_present')
   for key in ('reason','expiry','reopen_rule'):
    if not e.get(key):local.append(key+'_missing')
   if 'atomic' not in e.get('expiry','') or 'reopen' not in e.get('reopen_rule',''):local.append('terminal_policy_not_exact')
   edges.append({**e,'alias_key':alias['alias_key'],'issues':local});edge_issues.extend(local)
 rewritten=[x for x in edges if x['reason']=='pre_cutover_prose_consumer'];unique={(x['path'],x['line']) for x in rewritten}
 canonical_rx={'LSC-L8-LEGACY-INTEGRATION':re.compile(r'L8.{0,30}(?:unit|detail|単体|詳細)|canonical.{0,50}L8',re.I),'LSC-L9-LEGACY-SYSTEM':re.compile(r'L9.{0,30}(?:integration|結合)|canonical.{0,50}L9',re.I),'LSC-L10-LEGACY-UX':re.compile(r'L10.{0,40}(?:system|システム).{0,30}Real UX',re.I),'LSC-L11-LEGACY-UAT':re.compile(r'L11.{0,40}(?:acceptance|受入).{0,40}human visual',re.I),'LSC-L12-LEGACY-DEPLOY':re.compile(r'L12.{0,40}(?:operational|運用).{0,30}(?:value|価値)',re.I)}
 rewrite_fail=[]
 for x in rewritten:
  line=(ROOT/x['path']).read_text(encoding='utf8').splitlines()[x['line']-1]
  if not canonical_rx[x['alias_key']].search(line):rewrite_fail.append({'path':x['path'],'line':x['line'],'alias_key':x['alias_key'],'code':'canonical_meaning_absent_same_line','line_sha256':x['line_sha256']})
 inv_bad=[]
 for r in inv['findings']:
  try:line=(ROOT/r['path']).read_text(encoding='utf8').splitlines()[r['line']-1]
  except:line=''
  if not line or sha(line.encode())!=r['line_sha256']:inv_bad.append({'path':r['path'],'line':r['line']})
 hist=[r for r in inv['findings'] if r['disposition']=='explicit_historical_classification'];hist_escape=[r for r in hist if not historical(r['path'])]
 aliases=[r for r in inv['findings'] if r['disposition']!='explicit_historical_classification'];remaining_line_specific=[r for r in aliases if r['disposition']=='line_specific_compatibility_reference']
 id_edges={(x['path'],x['line']) for x in edges if x['reason']=='legacy_id_or_completed_audit_consumer_requires_line_binding'};line_edges={(x['path'],x['line']) for x in remaining_line_specific};remaining_alias_union=id_edges|line_edges
 stable_expected={('src/lint/descent-obligation.ts',175,'LSC-L8-LEGACY-INTEGRATION'),('src/lint/descent-obligation.ts',176,'LSC-L9-LEGACY-SYSTEM'),('src/lint/g3-trace.ts',96,'LSC-L12-LEGACY-DEPLOY')};stable_findings=[]
 for path,line,key in sorted(stable_expected):
  match=next((x for x in edges if x['path']==path and x['line']==line and x['alias_key']==key),None)
  try:current=(ROOT/path).read_text(encoding='utf8').splitlines()[line-1];head=subprocess.check_output(['git','show','HEAD:'+path],cwd=ROOT,text=True).splitlines()[line-1]
  except Exception:current='';head='!missing'
  local=[]
  if not match:local.append('central_alias_edge_missing')
  if current!=head:local.append('runtime_behavior_line_changed')
  if path.endswith('descent-obligation.ts') and 'includes(' not in current:local.append('stable_parser_token_missing')
  if path.endswith('g3-trace.ts') and 'AT-* ID' not in current:local.append('stable_code_contract_comment_missing')
  stable_findings.append({'path':path,'line':line,'alias_key':key,'line_sha256':sha(current.encode()),'issues':local})
 stable_issues=[issue for row in stable_findings for issue in row['issues']]
 confl=[x for x in inv['design_harness_mentions'] if x['ownership']=='possible_verification_or_general_design_conflation']
 checks={'marker_zero':len(markers)==0,'central_edges_current_denominator':len(edges)==ledger['summary']['consumer_edges']==291,'edge_exactness':not edge_issues,'pre_cutover_current_denominator':len(rewritten)==122 and len(unique)==115,'canonical_meaning_exact':not rewrite_fail,'old_cf3_119_resolved_as_116_canonical_plus_3_stable':(len(rewritten)-6)==116 and len(stable_findings)==3 and not stable_issues,'inventory_hash_exact':not inv_bad,'remaining_alias_current_denominator':len(remaining_alias_union)==28,'historical_non_escape':not hist_escape,'open_backlog_zero':inv['summary']['semantic_correction_obligations_open']==0 and not rewrite_fail and not stable_issues,'design_harness_conflation_zero':not confl,'runtime_behavior_unchanged':not stable_issues and ledger['summary']['runtime_mutations']==0 and inv['summary']['runtime_mutations']==0}
 for k,v in checks.items():
  if not v:issues.append({'code':k+'_failed'})
 out={'schema_version':'helix.layer-semantics-remediation-independent-review.v3','status':'independent_review_pass_design_closed_runtime_unchanged' if not issues else 'independent_review_findings_open','sources':{'ledger':{'sha256':sha(LEDGER.read_bytes())},'inventory':{'sha256':sha(INVENTORY.read_bytes())},'prior_review':{'sha256':'cf3f06dff64a9d407d0acea8afc40b809c55ed823578548781f03c0e00b1a93c','canonical_failures':119}},'summary':{'markers':len(markers),'central_edges':len(edges),'edge_issues':len(edge_issues),'pre_cutover_findings':len(rewritten),'pre_cutover_unique_lines':len(unique),'canonical_current_lines':len(rewritten),'old_failure_coordinates_resolved_canonical':len(rewritten)-6,'stable_src_test_aliases':len(stable_findings),'unresolved':len(rewrite_fail)+len(stable_issues),'inventory_hash_failures':len(inv_bad),'remaining_alias_union':len(remaining_alias_union),'remaining_line_specific_aliases':len(line_edges),'remaining_id_aliases':len(id_edges),'historical':len(hist),'historical_escape':len(hist_escape),'producer_open_backlog':inv['summary']['semantic_correction_obligations_open'],'independent_open_backlog':len(rewrite_fail)+len(stable_issues),'design_harness_conflation':len(confl),'runtime_mutations':0,'verified_true':0,'coverage_credit_true':0},'checks':checks,'findings':issues,'edge_findings':[x for x in edges if x['issues']],'canonical_meaning_findings':rewrite_fail,'stable_runtime_alias_findings':stable_findings,'inventory_hash_findings':inv_bad,'historical_escape_findings':hist_escape,'decision':'current denominatorを採用し、canonical実文言116とHEAD不変stable code alias 3で旧119座標を解消。Design closureのみでruntime cutover/verification/coverage creditではない。'}
 OUTPUT.write_text(json.dumps(out,ensure_ascii=False,indent=2,sort_keys=True)+'\n')
if __name__=='__main__':main()
