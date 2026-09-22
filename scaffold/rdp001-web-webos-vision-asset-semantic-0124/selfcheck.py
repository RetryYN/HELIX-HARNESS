#!/usr/bin/env python3
"""Expected-code tamper checks for SCF-B-0124."""
from pathlib import Path
import json, shutil, subprocess, sys, tempfile
HERE=Path(__file__).resolve().parent; REPO=HERE.parents[1]
def readj(p): return json.loads(p.read_text())
def writej(p,x): p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+"\n")
def readl(p): return [json.loads(x) for x in p.read_text().splitlines() if x.strip()]
def writel(p,x): p.write_text("".join(json.dumps(y,ensure_ascii=False,sort_keys=True)+"\n" for y in x))
def run(name,code,mutate):
 with tempfile.TemporaryDirectory(prefix='scf-b-0124-') as td:
  root=Path(td)/HERE.name; shutil.copytree(HERE,root); mutate(root)
  p=subprocess.run([sys.executable,str(root/'validate.py'),'--root',str(root),'--repo-root',str(REPO)],capture_output=True,text=True)
  out=p.stdout+p.stderr
  if p.returncode==0 or code not in out: raise SystemExit(f'{name}: expected {code}, got {p.returncode}: {out.strip()}')
  print(f'PASS {name}: {code}')
def jsonl_change(rel,index,fn):
 def m(root):
  p=root/rel; x=readl(p); fn(x[index]); writel(p,x)
 return m
def json_change(rel,fn):
 def m(root):
  p=root/rel; x=readj(p); fn(x); writej(p,x)
 return m
def text_change(rel,old,new):
 def m(root):
  p=root/rel; s=p.read_text()
  if old not in s: raise SystemExit(f'missing text for {rel}')
  p.write_text(s.replace(old,new,1))
 return m
CASES=[
 ('input-digest','E_INPUT_DIGEST',lambda r:(r/'inputs/parents/0081/semantic-atoms.jsonl').write_text((r/'inputs/parents/0081/semantic-atoms.jsonl').read_text()+'\n')),
 ('base-commit','E_BASE_COMMIT',json_change('inventory.json',lambda x:x['scope'].__setitem__('base_origin_main','0'*40))),
 ('candidate-set','E_CANDIDATE_SET',lambda r:(r/'candidate-assessments.jsonl').write_text('\n'.join((r/'candidate-assessments.jsonl').read_text().splitlines()[:-1])+'\n')),
 ('span-anchor','E_SPAN_ANCHOR',jsonl_change('candidate-assessments.jsonl',0,lambda x:x.__setitem__('exact_source_text','改変'))),
 ('asset-set','E_ASSET_SET',lambda r:(r/'asset-matrix.jsonl').write_text('\n'.join((r/'asset-matrix.jsonl').read_text().splitlines()[:-1])+'\n')),
 ('asset-source','E_ASSET_SOURCE',jsonl_change('asset-matrix.jsonl',0,lambda x:x.__setitem__('asset_source_sha256','0'*64))),
 ('asset-history','E_ASSET_HISTORY',jsonl_change('asset-matrix.jsonl',0,lambda x:x.__setitem__('consumer_observation','closed'))),
 ('asset-link','E_ASSET_LINK',jsonl_change('candidate-assessments.jsonl',0,lambda x:x.__setitem__('asset_semantic_link_status','candidate_only'))),
 ('l1-anchor','E_L1_ANCHOR',jsonl_change('l1-connection-candidates.jsonl',0,lambda x:x.__setitem__('l1_anchor_candidate_ids',[]))),
 ('l1-commit-not-ancestor','E_L1_COMMIT_ANCESTOR',text_change('validate.py','L1_COMMIT="cb5a45fea289d61b67cba100fd2406813021ef48"','L1_COMMIT="07591701a40c4a68da5cfd3de220673a859eb9cf"')),
 ('l1-blob-pin','E_L1_BLOB',text_change('validate.py','L1_BLOB_OID="8d034128cc09a3b2c03abcfe31e89f8719ca170b"','L1_BLOB_OID="0000000000000000000000000000000000000000"')),
 ('l1-authority-input-pin','E_INPUT_DIGEST',jsonl_change('inputs/l1-anchor-0121/candidate-units.jsonl',0,lambda x:x.__setitem__('current_l1_effective_authority_status','awaiting_parent_approval'))),
 ('l1-authority-output','E_L1_ANCHOR',jsonl_change('l1-connection-candidates.jsonl',0,lambda x:x.__setitem__('authority_status','approved'))),
 ('phase-boundary','E_PHASE_BOUNDARY',jsonl_change('candidate-assessments.jsonl',0,lambda x:x.__setitem__('phase_status','candidate'))),
 ('formal-boundary','E_FORMAL_BOUNDARY',json_change('inventory.json',lambda x:x.__setitem__('formal_requirement_unit_count',1))),
 ('product-boundary','E_PRODUCT_BOUNDARY',jsonl_change('candidate-assessments.jsonl',0,lambda x:x.__setitem__('candidate_product','HELIX-OS'))),
 ('matrix-cardinality','E_MATRIX_CARDINALITY',json_change('inventory.json',lambda x:x['asset_comparison'].__setitem__('matrix_pair_count',419))),
 ('inventory-declaration','E_INVENTORY_DECLARATION',json_change('inventory.json',lambda x:x['negative_case_codes'].pop())),
]
for c in CASES: run(*c)
print(f'SCF-B-0124 selfcheck: PASS ({len(CASES)} negative cases; expected error codes matched)')
