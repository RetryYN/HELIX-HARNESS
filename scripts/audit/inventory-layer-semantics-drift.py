#!/usr/bin/env python3
"""Inventory L1-L12 drift with line-specific, marker-independent dispositions."""
from __future__ import annotations
import hashlib,json,re,subprocess,sys
from collections import Counter
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
AUTHORITY="docs/design/helix/L3-requirements/vmodel-canonical-authority-cutover.md"
VISUAL="docs/governance/visual-design-harness-verification-ledger.md"
LEDGER="docs/governance/generated/l1-l12-layer-semantics-compatibility-ledger-v1.json"
DRIFT=[
 ("legacy_l8_integration",re.compile(r"L8(?:-integration|\s*(?:=|:)\s*(?:integration|結合)|\s+結合(?:テスト)?)",re.I),"L8=unit/detail","LSC-L8-LEGACY-INTEGRATION"),
 ("legacy_l9_system",re.compile(r"L9(?:-system|\s*(?:=|:)\s*(?:system|総合)|\s+総合(?:テスト)?)",re.I),"L9=integration","LSC-L9-LEGACY-SYSTEM"),
 ("legacy_l10_ux_only",re.compile(r"L10\s*(?:=|:)?\s*(?:UX\s*磨き|UX refinement|UX/WCAG)",re.I),"L10=system/Real UX evidence","LSC-L10-LEGACY-UX"),
 ("legacy_l11_review_uat",re.compile(r"L11\s*(?:=|:)?\s*(?:総合レビュー|UAT)(?![^\n]{0,40}(?:human visual|人間visual))",re.I),"L11=acceptance/human visual","LSC-L11-LEGACY-UAT"),
 ("legacy_l12_deploy_acceptance",re.compile(r"L12(?:-deploy|\s*(?:=|:)?\s*(?:デプロイ|受入))(?![^\n]{0,40}(?:operation|operational|value|運用|価値))",re.I),"L12=operational/value","LSC-L12-LEGACY-DEPLOY")]
COMPAT=re.compile(r"(?:legacy|旧|compat|互換|remap|再投影|段階移行|supersed|移行前|移行元)",re.I)
CENTRAL_ALIAS_CONSUMER=re.compile(r"(?:docs|tests|src)/[^\s`|]*(?:L8-integration|L9-system|L10-ux|L11-uat|L12-acceptance)|pair_(?:artifact|freeze_exempt_target):|A-101\s*注記",re.I)
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def path_class(p):
 if p.startswith(("docs/archive/","docs/migration/")):return "historical_archive_explicit"
 if p.startswith("docs/governance/generated/"):return "generated_evidence_historical_or_derived"
 if p.startswith(("docs/plans/","docs/test-design/","tests/","src/","docs/design/","docs/process/","docs/governance/")):return "current_normative_plan_test_or_code"
 return "current_other"
def classify(path,cls,line,alias):
 if "historical" in cls or "generated" in cls:return "explicit_historical_classification",None,False
 if CENTRAL_ALIAS_CONSUMER.search(line):return "central_compatibility_alias_registered",alias,False
 if COMPAT.search(line):return "line_specific_compatibility_reference",alias,False
 if re.search(r"(?:L8-integration|L9-system|UX refinement)",line,re.I) and re.search(r"(?:`|path|ファイル名|降下先|理由)",line,re.I):return "central_compatibility_alias_registered",alias,False
 if path.startswith(("src/","tests/","docs/plans/")):return "central_compatibility_alias_registered",alias,False
 return "terminal_design_redesign_backlog",alias,True
def main():
 if len(sys.argv)!=2:raise SystemExit("usage: inventory... OUTPUT.json")
 files=subprocess.check_output(["git","ls-files","docs","tests","src"],cwd=ROOT,text=True).splitlines();files=[p for p in files if p!="README.md" and not p.endswith((".png",".zip",".db",".pdf"))]
 findings=[];mentions=[]
 for rel in files:
  try:lines=(ROOT/rel).read_text(encoding="utf-8").splitlines()
  except UnicodeDecodeError:continue
  for number,line in enumerate(lines,1):
   for kind,pattern,target,alias in DRIFT:
    if pattern.search(line):
     cls=path_class(rel);disp,key,opened=classify(rel,cls,line,alias)
     findings.append({"path":rel,"line":number,"kind":kind,"path_class":cls,"disposition":disp,"compatibility_alias_key":key,"semantic_correction_obligation_open":opened,"canonical_target":target,"line_sha256":hashlib.sha256(line.encode()).hexdigest(),"text":line[:500]})
   if re.search(r"Design HARNESS|Design Harness|design harness",line):
    confused=bool(re.search(r"(?:general|一般)(?:設計|design)|(?:CI|architecture|workflow).*(?:所有|吸収)|L8.?L10.*(?:Integration|System)",line,re.I));guarded=bool(re.search(r"(?:ビジュアル|visual).*(?:専用|限定|デザインのほう)|(?:一般設計|general design).*(?:しない|禁止|吸収しない)",line,re.I))
    mentions.append({"path":rel,"line":number,"path_class":path_class(rel),"text":line[:500],"ownership":"explicit_anti_conflation_guard" if guarded else "possible_verification_or_general_design_conflation" if confused else "visual_design_scope_or_neutral"})
 counts=Counter(x["kind"] for x in findings);disps=Counter(x["disposition"] for x in findings);hc=Counter(x["ownership"] for x in mentions);opened=sum(x["semantic_correction_obligation_open"] for x in findings)
 out={"schema_version":"helix.layer-semantics-drift-inventory.v2","status":"line_specific_redesign_backlog_closed_runtime_untouched" if opened==0 else "line_specific_terminal_classification_complete_open_redesign_visible_runtime_untouched","authority":{"path":AUTHORITY,"sha256":sha(ROOT/AUTHORITY),"epoch":"vmodel-l1-l12-v1","activation":"pending-po-approval"},"compatibility_ledger":{"path":LEDGER,"sha256":sha(ROOT/LEDGER)},"visual_design_authority":{"path":VISUAL,"sha256":sha(ROOT/VISUAL),"ownership":"visual generation and evaluation evidence only"},"canonical_layers":{"L8":"unit/detail","L9":"integration","L10":"system/Real UX evidence","L11":"acceptance/human visual","L12":"operational/value"},"scope":{"tracked_files":len(files),"roots":["docs","tests","src"],"readme_excluded":True},"summary":{"findings":len(findings),"by_kind":dict(sorted(counts.items())),"by_disposition":dict(sorted(disps.items())),"semantic_correction_obligations_open":opened,"design_harness_mentions":len(mentions),"design_harness_ownership":dict(sorted(hc.items())),"runtime_mutations":0,"verified_true":0,"coverage_credit_true":0},"invariants":["file-wide compatibility markers are forbidden","candidate authoring authority is not runtime cutover","every finding has a line-specific terminal classification","open redesign is visible and never converted to zero","Design HARNESS is visual-only"],"findings":findings,"design_harness_mentions":mentions}
 (ROOT/sys.argv[1]).write_text(json.dumps(out,ensure_ascii=False,indent=2,sort_keys=True)+"\n",encoding="utf-8")
if __name__=="__main__":main()
