#!/usr/bin/env python3
"""Generate the single compatibility authority for pre-cutover layer tokens."""

import hashlib, json, re, subprocess, sys
from pathlib import Path

ROOT=Path(__file__).resolve().parents[2]
ALIASES={
 "LSC-L8-LEGACY-INTEGRATION":{"pattern":r"L8(?:-integration|\s*(?:=|:)\s*(?:integration|結合)|\s+結合(?:テスト)?)","legacy_meaning":"L8 integration","canonical_layer":"L8","canonical_meaning":"unit/detail"},
 "LSC-L9-LEGACY-SYSTEM":{"pattern":r"L9(?:-system|\s*(?:=|:)\s*(?:system|総合)|\s+総合(?:テスト)?)","legacy_meaning":"L9 system","canonical_layer":"L9","canonical_meaning":"integration"},
 "LSC-L10-LEGACY-UX":{"pattern":r"L10\s*(?:=|:)?\s*(?:UX\s*磨き|UX refinement|UX/WCAG)","legacy_meaning":"L10 UX-only","canonical_layer":"L10","canonical_meaning":"system plus Real UX evidence"},
 "LSC-L11-LEGACY-UAT":{"pattern":r"L11\s*(?:=|:)?\s*(?:総合レビュー|UAT)","legacy_meaning":"L11 review/UAT","canonical_layer":"L11","canonical_meaning":"acceptance plus human visual acceptance"},
 "LSC-L12-LEGACY-DEPLOY":{"pattern":r"L12(?:-deploy|\s*(?:=|:)?\s*(?:デプロイ|受入))","legacy_meaning":"L12 deploy/acceptance","canonical_layer":"L12","canonical_meaning":"operational/value"},
}
def sha(v):return hashlib.sha256(v).hexdigest()
def main():
 if len(sys.argv)!=2: raise SystemExit('usage: generate... OUTPUT.json')
 files=subprocess.check_output(['git','ls-files','docs','src','tests'],cwd=ROOT,text=True).splitlines(); rows=[]
 for key,spec in ALIASES.items():
  rx=re.compile(spec['pattern'],re.I); consumers=[]
  for rel in files:
   p=ROOT/rel
   try: text=p.read_text(encoding='utf-8')
   except (UnicodeDecodeError,OSError): continue
   lines=[(i,line) for i,line in enumerate(text.splitlines(),1) if rx.search(line)]
   for number,line in lines:
    reason='legacy_path_consumer_requires_atomic_migration' if re.search(r'(?:docs|tests|src)/[^\s`|]*(?:L8-integration|L9-system|L10-ux|L11-uat|L12-acceptance)|pair_(?:artifact|freeze_exempt_target):',line,re.I) else 'legacy_id_or_completed_audit_consumer_requires_line_binding' if rel.startswith(('src/','tests/')) or re.search(r'A-101|ST-|AT-|G(?:8|9|10|11|12)',line) else 'pre_cutover_prose_consumer'
    consumers.append({'path':rel,'line':number,'line_sha256':sha(line.encode()),'reason':reason,'expiry':'after approved atomic path/ID migration and a regenerated zero-consumer receipt','reopen_rule':'reopen when this line digest, canonical authority, alias owner, or migration approval changes'})
  rows.append({'alias_key':key,**{k:v for k,v in spec.items() if k!='pattern'},'legacy_token_pattern':spec['pattern'],'source_epoch':'pre-vmodel-l1-l12-v1','consumer_edges':consumers,'consumer_count':len(consumers),'expiry':'only after an approved atomic path/ID migration proves zero legacy consumers','reopen_rule':'reopen when any bound line digest, canonical authority, or migration approval changes','runtime_authority':False})
 out={'schema_version':'helix.layer-semantics-compatibility-ledger.v1','status':'central_alias_registry_current_runtime_not_cutover','authority':{'epoch':'vmodel-l1-l12-v1','activation':'pending-po-approval','runtime_cutover':False},'invariants':['per-file compatibility markers are forbidden','legacy path and ID spellings are not renamed in this slice','line-specific normative drift remains visible','Design HARNESS means visual design only'],'aliases':rows,'summary':{'aliases':len(rows),'consumer_edges':sum(x['consumer_count'] for x in rows),'runtime_mutations':0,'verified_true':0,'coverage_credit_true':0}}
 (ROOT/sys.argv[1]).write_text(json.dumps(out,ensure_ascii=False,indent=2,sort_keys=True)+'\n')
if __name__=='__main__':main()
