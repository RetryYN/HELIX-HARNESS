#!/usr/bin/env python3
import json, shutil, subprocess, sys, tempfile
from pathlib import Path
HERE=Path(__file__).resolve(); TARGET=HERE.parent; VALIDATOR=TARGET/'validate.py'; REL='scaffold/rdp001-outside67-boundary-followup-071/'
def run(root): return subprocess.run([sys.executable,'-B',str(VALIDATOR),'--root',str(root)],capture_output=True,text=True)
def mutate(path,fn):
 d=json.loads(path.read_text(encoding='utf8')); fn(d); path.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
def mutatel(path,i,fn):
 rows=[json.loads(x) for x in path.read_text(encoding='utf8').splitlines()]; fn(rows[i]); path.write_text(''.join(json.dumps(x,ensure_ascii=False,sort_keys=True)+'\n' for x in rows),encoding='utf8')
def main():
 cases=[]
 with tempfile.TemporaryDirectory(prefix='outside67-followup-069-selfcheck-') as td:
  root=Path(td)/'repo'; shutil.copytree(TARGET.parents[1],root)
  base=run(root)
  if base.returncode: print('FAIL baseline\n'+base.stdout+base.stderr); return 1
  def case(name,fn,needle):
   c=Path(td)/name; shutil.copytree(root,c); fn(c); p=run(c); cases.append((name,p.returncode!=0 and needle in p.stdout+p.stderr,p.stdout+p.stderr))
  case('product',lambda c:mutatel(c/(REL+'product-units.jsonl'),0,lambda d:d.__setitem__('candidate_product','HELIX-OS')),'E_UNIT_BOUNDARY')
  case('unknown_promotion',lambda c:mutatel(c/(REL+'product-units.jsonl'),0,lambda d:d.__setitem__('consumer_status','closed')),'E_UNKNOWN')
  case('duplicate_anchor',lambda c:mutatel(c/(REL+'product-units.jsonl'),1,lambda d:d['source_anchor']['pre_isolation'].__setitem__('line',18)),'E_DUP_ANCHOR')
  case('anchor_fragment',lambda c:mutatel(c/(REL+'product-units.jsonl'),0,lambda d:d['source_anchor']['pre_isolation'].__setitem__('source_fragment','tampered')),'E_ANCHOR')
  case('fragment_provenance',lambda c:mutatel(c/(REL+'product-units.jsonl'),0,lambda d:d.__setitem__('source_fragment','tampered')),'E_FRAGMENT_PROVENANCE')
  case('counterpart_digest',lambda c:mutatel(c/(REL+'selected-source-items.jsonl'),0,lambda d:d['archive_counterpart'].__setitem__('sha256','tampered')),'E_COUNTERPART_PROV')
  case('overlap',lambda c:mutate(c/(REL+'inventory.json'),lambda d:d['selection'].__setitem__('candidate_ids',['OUTSIDE67-PATH-008']+d['selection']['candidate_ids'][1:])),'E_SELECTION_CANONICAL')
  case('denominator',lambda c:mutate(c/(REL+'inventory.json'),lambda d:d['source_holding'].__setitem__('combined_reviewed_and_candidate_count',16)),'E_SOURCE_HOLDING_CANONICAL')
  case('scope_keyset',lambda c:mutate(c/(REL+'inventory.json'),lambda d:d['scope'].__setitem__('unknown_key','x')),'E_SCOPE_KEYS')
  case('scope_canonical',lambda c:mutate(c/(REL+'inventory.json'),lambda d:d['scope'].__setitem__('batch_width_observed',6)),'E_SCOPE_CANONICAL')
  case('scope_unexplored_scope',lambda c:mutate(c/(REL+'inventory.json'),lambda d:d['scope'].__setitem__('unexplored_scope','ZZZ')),'E_SCOPE_CANONICAL:unexplored_scope')
  case('root_authority',lambda c:mutate(c/(REL+'inventory.json'),lambda d:d.__setitem__('old_runtime_test_ci_execution',True)),'E_AUTHORITY')
  case('unit_keyset',lambda c:mutatel(c/(REL+'product-units.jsonl'),0,lambda d:d['normalized_statement'].__setitem__('free_text','x')),'E_UNIT_NESTED_KEYS')
  case('meta_reservation',lambda c:mutate(c/(REL+'meta.json'),lambda d:d.__setitem__('binding_reservation','SCF-B-0000')),'E_META:binding_reservation')
  case('ledger_count',lambda c:mutate(c/(REL+'ledger.json'),lambda d:d.__setitem__('source_anchor_count',24)),'E_LEDGER_META:source_anchor_count')
  case('counterpart_path',lambda c:mutatel(c/(REL+'selected-source-items.jsonl'),0,lambda d:d['archive_counterpart'].__setitem__('path','docs/changed.md')),'E_COUNTERPART')
  case('diff_status',lambda c:mutate(c/(REL+'source-diffs.json'),lambda d:d['items'][0].__setitem__('status','different')),'E_DIFF_PROV')
  case('canonical_text',lambda c:mutate(c/(REL+'inventory.json'),lambda d:d['prohibited_inference'].__setitem__(0,'changed')),'E_CANONICAL_TEXT')
  bad=[x for x in cases if not x[1]]
  if bad:
   print('FAIL negative cases: '+','.join(x[0] for x in bad)); print('\n'.join(x[2] for x in bad)); return 1
 print('PASS outside67 follow-up selfcheck: baseline + 18 negative cases'); return 0
if __name__=='__main__':sys.exit(main())
