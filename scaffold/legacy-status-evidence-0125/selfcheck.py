#!/usr/bin/env python3
"""SCF-B-0125 validatorのfail-closed負例。旧資産は実行しない。"""
from __future__ import annotations
import copy, json, os, shutil, subprocess, sys, tempfile
from pathlib import Path
BUNDLE=Path(__file__).resolve().parent
VALIDATOR=BUNDLE/"validate.py"
def clone():
 root=Path(tempfile.mkdtemp(prefix="scf-b-0125-selfcheck-")); dst=root/BUNDLE.name; shutil.copytree(BUNDLE,dst); return dst
def load(b): return json.loads((b/"inventory.json").read_text()), [json.loads(x) for x in (b/"evidence.jsonl").read_text().splitlines() if x.strip()]
def tagged(d):
 import hashlib
 return "sha256:"+hashlib.sha256(d).hexdigest()
def save(b,inv,rows,recalc=True):
 ep=b/"evidence.jsonl"; ep.write_text("".join(json.dumps(x,ensure_ascii=False,sort_keys=True)+"\n" for x in rows))
 if recalc: inv["output_sha256"]=tagged(ep.read_bytes())
 (b/"inventory.json").write_text(json.dumps(inv,ensure_ascii=False,indent=2)+"\n")
def expect(label,mutate,code,recalc=True,env=None):
 b=clone(); inv,rows=load(b); mutate(inv,rows); save(b,inv,rows,recalc)
 e=os.environ.copy(); e.update(env or {})
 p=subprocess.run([sys.executable,"-B",str(VALIDATOR),"--bundle",str(b)],text=True,capture_output=True,env=e)
 if p.returncode==0 or code not in p.stderr: raise AssertionError(f"{label}: expected {code}, rc={p.returncode}, stderr={p.stderr!r}")
 print(f"PASS {label}: {code}"); shutil.rmtree(b.parent,ignore_errors=True)
def main():
 expect("ledger nested consumer tamper",lambda i,r:r[0]["ledger_record"].update(consumer_refs=["FAKE"]),"E_LEDGER_RECORD")
 expect("source blob tamper",lambda i,r:r[0]["source_exact"].update(blob="0"*40),"E_SOURCE_EVIDENCE")
 expect("claim anchor tamper",lambda i,r:r[0]["status_claims"]["old_implementation"][0].update(line_text_sha256="sha256:"+"0"*64),"E_CLAIM_ANCHOR")
 expect("unit binding forgery",lambda i,r:r[0]["unit_binding"].update(status="bound",unit_candidate_ids=["FAKE"]),"E_UNIT_BINDING")
 expect("requirement binding forgery",lambda i,r:r[0]["requirement_binding"].update(status="bound",requirement_ids=["FAKE"]),"E_REQUIREMENT_BINDING")
 expect("old implementation promotion",lambda i,r:r[0]["legacy_implementation_evidence"].update(status="implemented"),"E_IMPLEMENTATION_EVIDENCE")
 expect("degradation promotion",lambda i,r:r[4]["degradation_evidence"].update(status="degraded"),"E_DEGRADATION_EVIDENCE")
 expect("failure promotion",lambda i,r:r[5]["failure_evidence"].update(status="failed"),"E_FAILURE_EVIDENCE")
 expect("consumer closure forgery",lambda i,r:r[8]["consumer_evidence"].update(closure_status="closed"),"E_CONSUMER_EVIDENCE")
 expect("current implementation promotion",lambda i,r:r[0]["current_implementation"].update(status="implemented"),"E_CURRENT_STATUS")
 expect("acceptance verdict forgery",lambda i,r:r[0]["acceptance_evidence"].update(status="accepted",verdict="passed"),"E_ACCEPTANCE_EVIDENCE")
 expect("scope denominator tamper",lambda i,r:i["scope"].update(selected_assets=12),"E_SCOPE")
 expect("selection set tamper",lambda i,r:i["selection"].update(selected_asset_ids_sha256="sha256:"+"0"*64),"E_SELECTION")
 expect("input digest tamper",lambda i,r:i["input_digests"][0].update(sha256="sha256:"+"0"*64),"E_INPUT_DIGEST")
 expect("base pin tamper",lambda i,r:i.update(base_revision="0"*40),"E_BASE_PIN")
 expect("output digest omission",lambda i,r:r[0].update(asset_role="tampered"),"E_OUTPUT_DIGEST",recalc=False)
 expect("authority boundary tamper",lambda i,r:i["authority_boundary"].update(authority_effect="implementation"),"E_AUTHORITY_BOUNDARY")
 expect("duplicate asset",lambda i,r:r.__setitem__(1,copy.deepcopy(r[0])),"E_ASSET_SET")
 expect("missing asset",lambda i,r:r.pop(),"E_ASSET_SET")
 expect("unknown top-level field",lambda i,r:r[0].update(fabricated=True),"E_SCHEMA")
 root=subprocess.check_output(["git","rev-list","--max-parents=0","HEAD"],text=True).splitlines()[0]
 expect("fixed BASE non-ancestor",lambda i,r:None,"E_BASE_NOT_ANCESTOR",env={"SCF_VALIDATION_HEAD":root})
 print("PASS SCF-B-0125 selfcheck: 21 negative cases")
if __name__=="__main__": raise SystemExit(main())
