#!/usr/bin/env python3
"""Visual L8-L10 evidenceがlayer freeze/tag progressへ正しく反映されるか独立監査する。"""

import argparse, hashlib, json, re
from pathlib import Path

ROOT=Path(__file__).resolve().parents[2]
GEN=ROOT/'docs/governance/generated'
OUT=GEN/'visual-layer-freeze-progress-independent-audit-v1.json'
SRC={
 'l1':ROOT/'docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md',
 'l4':ROOT/'docs/design/helix/L4-basic-design/infinity-loop-platform-basic-design.md',
 'visual':ROOT/'docs/test-design/helix/L8-L11-visual-design-harness-verification.md',
 'visual_review':GEN/'visual-design-harness-semantic-review-v1.json',
 'tag_audit':GEN/'repository-savepoint-layer-tag-design-audit-v1.json',
 'tag_review':GEN/'repository-savepoint-layer-tag-design-independent-review-v1.json',
 'progress_l6':ROOT/'docs/design/helix/L6-function-design/layer-ledger-pair-gate.md',
}
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def build():
 text={k:p.read_text(encoding='utf8') for k,p in SRC.items() if p.suffix!='.json'}
 vr=json.loads(SRC['visual_review'].read_text()); ta=json.loads(SRC['tag_audit'].read_text()); tr=json.loads(SRC['tag_review'].read_text())
 l4=text['l4']; visual=text['visual']; progress=text['progress_l6']
 canonical={
  'L8':'atomic visual/binding verification',
  'L9':'cross-screen visual integration',
  'L10':'browser/data visual system verification',
 }
 layer_counts=vr['summary']['by_layer']
 case_rows=re.findall(r'^\| (VIS-L(?:8|9|10|11)-[^ |]+) \|',visual,re.M)
 doc_case_ids=set(case_rows); review_case_ids={row['case_id'] for row in vr['cases']}
 doc_layer_counts={layer:sum(case.startswith(f'VIS-{layer}-') for case in doc_case_ids) for layer in ('L8','L9','L10','L11')}
 eligibility_l4=all(x in l4 for x in ['visual_pair_receipts','current eligibilityをexact join','case ID exact set','case-set revision/digest','matrix denominator','execution receipt set/digest','independent review receipt','visual authority epoch','eligible count','ineligible reason set','eligible count = exact case denominator','tagを`current`またはprogressを`frozen`へ遷移させない'])
 eligibility_visual=all(x in visual for x in ['case ID exact set','case-set revision/digest','matrix denominator','execution receipt','独立review receipt','visual authority epoch','eligible count','全caseがcurrent execution evidence'])
 projection_l4=all(x in l4 for x in ['applicable evidence eligibility receiptをleft join','execution cardinality不足','`blocked`、freeze numerator 0','工程task完了はeligible分子を増やさない'])
 projection_visual=all(x in visual for x in ['未実行Design case','別matrix cellで利用済みのartifact','remote tag存在','工程task完了だけを投入する','freeze numeratorを必ず0','V-pair PASSへ加算しない'])
 checks={
  'canonical_layer_meanings':all(x in visual for x in ['L5↔L8','atomic visual/binding verification','L4↔L9','cross-screen visual integration','L3↔L10','browser/data visual system verification']),
  'visual_harness_visual_only':all(x in visual+l4 for x in ['Design HARNESSはvisual/UI design専用','一般integration/system/UXを一括所有せず','Design HARNESSのownershipは`visual intent → visual contract → rendered visual evidence → human visual acceptance`に限定']),
  'designed_denominator_6_7_8':layer_counts.get('L8')==6 and layer_counts.get('L9')==7 and layer_counts.get('L10')==8,
  'visual_case_identity_exact_doc_review':doc_case_ids==review_case_ids and doc_layer_counts=={'L8':6,'L9':7,'L10':8,'L11':7},
  'execution_zero_not_eligible':vr['summary']['executed']==0 and vr['summary']['verified']==0 and vr['summary']['coverage_credit_true']==0 and 'active greenへ算入しない' in visual,
  'coverage_laundering_negative_oracles':all(x in visual for x in ['HIL_VIS_L9_BASELINE_LAUNDERING','HIL_VIS_L10_EVIDENCE_REUSED_ACROSS_CELLS','quarantine/deferred/flaky retryはgreenへ\n算入しない']),
  'roadmap_task_evidence_denominator_bound':all(x in l4 for x in ['roadmap registry ID','task-set digest','evidence denominator digest','ledger revision']),
  'pending_pair_not_progress':all(x in l4 for x in ['pending_pair','percentage、pair PASSへ算入しない','current pair receipt発行と同じtransactionで双方を`current`']),
  'tag_design_independent_review_current':ta['status']=='design_completeness_review_pass_not_executed' and tr['status']=='independent_review_design_gaps_closed_not_executed',
  'visual_case_eligibility_joined_to_layer_tag':eligibility_l4 and eligibility_visual and 'L8=6、L9=7、L10=8' in l4+visual and 'visual_freeze_eligibility_receipt' in l4 and 'visual_freeze_eligibility_receipt' in visual,
  'visual_execution_cardinality_joined_to_progress':projection_l4 and projection_visual and 'layer_progress_projection_query' in l4 and 'layer_progress_projection_query' in visual,
 }
 findings=[
  {'finding_id':'VIS-TAG-IR-001','severity':'critical','status':'open','axis':'evidence eligibility bridge','gap':'Visual 28-case contractとL8/L9/L10のcase set/revision/execution receipt/current authorityをlayer_tag_receiptまたはlayer_vpair receiptの必須fieldへexact joinするschemaがない。gate SHA＋snapshot/oracle digestだけではdesigned-not-executedをeligibleにし得る。','required_design':'L8=6、L9=7、L10=8のexact case ID/set digest、matrix denominator、execution/independent review/authority epoch、eligible countをlayer別freeze eligibility receiptへbindし、0 executedはcurrent/frozen不可とする。'},
  {'finding_id':'VIS-TAG-IR-002','severity':'high','status':'open','axis':'coverage laundering into progress','gap':'visual側はbaseline laundering・evidence reuse・quarantineを拒否するが、layer_progress_projection_queryがそのfailure/eligibilityを分子0へ落とす機械joinを明示しない。工程表完了またはtag存在からvisual evidence greenを推定できる余地がある。','required_design':'visual evidence eligibility receiptのeligible exact setだけをfreeze numeratorへ許可し、design case、N/A、quarantine、reused artifact、pending_pair、tag existenceを分子へ加えないnegative projection oracleを追加する。'},
 ]
 closure={'VIS-TAG-IR-001':checks['visual_case_eligibility_joined_to_layer_tag'],'VIS-TAG-IR-002':checks['visual_execution_cardinality_joined_to_progress']}
 for finding in findings:
  if closure[finding['finding_id']]:finding['status']='closed_design_not_implemented'
 open_count=sum(not x for x in closure.values())
 return {'schema_version':'helix.visual-layer-freeze-progress-independent-audit.v1','status':'independent_audit_visual_freeze_progress_design_closed_runtime_untouched' if open_count==0 else 'independent_audit_visual_freeze_progress_findings_open_runtime_untouched','sources':{k:{'path':str(p.relative_to(ROOT)),'sha256':sha(p)} for k,p in SRC.items()},'canonical_layers':canonical,'checks':checks,'summary':{'checks':len(checks),'passed':sum(checks.values()),'findings_open':open_count,'findings_closed_design_not_implemented':len(findings)-open_count,'critical':1,'high':1,'visual_designed_cases_l8_l10':sum(layer_counts[x] for x in ['L8','L9','L10']),'visual_executed':0,'runtime_tags_created':0,'runtime_mutations':0,'verified_true':0,'coverage_credit_true':0},'findings':findings,'decision':'L8/L9/L10の21 case eligibilityをlayer tag/freeze progressへexact joinした。Design closureだけであり、現visual evidenceは実行0のためfreeze進捗不適格。実装/tag/commitは行っていない。' if open_count==0 else 'visual case eligibilityからlayer tag/freeze progressへの機械joinが未完了。現visual evidenceは全てfreeze進捗不適格。'}
def render(x):return (json.dumps(x,ensure_ascii=False,indent=2,sort_keys=True)+'\n').encode()
def main():
 ap=argparse.ArgumentParser();ap.add_argument('--check',action='store_true');a=ap.parse_args();b=render(build())
 if a.check:
  if not OUT.exists() or OUT.read_bytes()!=b:raise SystemExit('visual layer freeze audit stale')
  print(f'OK: {OUT.relative_to(ROOT)}')
 else:OUT.write_bytes(b);print(f'WROTE: {OUT.relative_to(ROOT)}')
if __name__=='__main__':main()
