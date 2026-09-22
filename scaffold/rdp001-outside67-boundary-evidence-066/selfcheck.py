#!/usr/bin/env python3
import json,shutil,subprocess,sys,tempfile
from pathlib import Path
HERE=Path(__file__).resolve(); TARGET=HERE.parent; VALIDATOR=TARGET/'validate.py'
def run(root):return subprocess.run([sys.executable,'-B',str(VALIDATOR),'--root',str(root)],capture_output=True,text=True)
def mutate(path,fn):
 d=json.loads(path.read_text(encoding='utf8'));fn(d);path.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
def mutatel(path,i,fn):
 rows=[json.loads(x) for x in path.read_text(encoding='utf8').splitlines()];fn(rows[i]);path.write_text(''.join(json.dumps(x,ensure_ascii=False,sort_keys=True)+'\n' for x in rows),encoding='utf8')
def main():
 cases=[]
 with tempfile.TemporaryDirectory(prefix='outside67-candidate-selfcheck-') as td:
  root=Path(td)/'repo';shutil.copytree(TARGET.parents[1],root)
  base=run(root)
  if base.returncode:print('FAIL baseline\n'+base.stdout+base.stderr);return 1
  def case(name,fn,needle):
   c=Path(td)/name;shutil.copytree(root,c);fn(c);p=run(c);cases.append((name,p.returncode!=0 and needle in p.stdout+p.stderr,p.stdout+p.stderr))
  basepath='scaffold/rdp001-outside67-boundary-evidence-066/'
  case('fragment',lambda c:mutatel(c/(basepath+'product-units.jsonl'),0,lambda d:d.__setitem__('source_fragment','tampered')),'E_FRAGMENT_PROVENANCE')
  case('counterpart',lambda c:mutatel(c/(basepath+'selected-source-items.jsonl'),4,lambda d:d['archive_counterpart'].__setitem__('sha256','tampered')),'E_COUNTERPART_PROV')
  case('product',lambda c:mutatel(c/(basepath+'product-units.jsonl'),0,lambda d:d.__setitem__('candidate_product','HELIX-OS')),'E_UNIT_CANON')
  case('unknown',lambda c:mutatel(c/(basepath+'product-units.jsonl'),0,lambda d:d.__setitem__('consumer_status','closed')),'E_UNKNOWN')
  case('anchor_root',lambda c:mutatel(c/(basepath+'product-units.jsonl'),0,lambda d:d['source_anchor'].__setitem__('free_text','x')),'E_ANCHOR_ROOT')
  case('duplicate_anchor',lambda c:mutatel(c/(basepath+'product-units.jsonl'),1,lambda d:d['source_anchor']['pre_isolation'].__setitem__('line',15)),'E_DUP_ANCHOR')
  case('overlap',lambda c:mutate(c/(basepath+'inventory.json'),lambda d:d['source_holding'].__setitem__('selected_item_ids',['OUTSIDE67-PATH-008']+d['source_holding']['selected_item_ids'][1:])),'E_DENOMINATOR_SELECTION')
  case('scope_keyset',lambda c:mutate(c/(basepath+'inventory.json'),lambda d:d['scope'].__setitem__('unknown_key','x')),'E_SCOPE_KEYS')
  case('scope_canonical',lambda c:mutate(c/(basepath+'inventory.json'),lambda d:d['scope'].__setitem__('batch_width_observed',6)),'E_SCOPE_CANONICAL')
  case('source_holding_count',lambda c:mutate(c/(basepath+'inventory.json'),lambda d:d['source_holding'].__setitem__('combined_reviewed_and_candidate_count',11)),'E_SOURCE_HOLDING_CANONICAL')
  case('unit_keyset',lambda c:mutatel(c/(basepath+'product-units.jsonl'),0,lambda d:d['normalized_statement'].__setitem__('free_text','x')),'E_UNIT_NESTED_KEYS')
  case('execution',lambda c:mutate(c/(basepath+'inventory.json'),lambda d:d.__setitem__('old_runtime_test_ci_execution',True)),'E_AUTHORITY')
  bad=[x for x in cases if not x[1]]
  if bad:print('FAIL cases: '+','.join(x[0] for x in bad));print('\n'.join(x[2] for x in bad));return 1
 print('PASS outside67 candidate selfcheck: baseline + 12 negative cases');return 0
if __name__=='__main__':sys.exit(main())
