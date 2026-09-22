#!/usr/bin/env python3
"""Tamper tests for SCF-B-0121; each expected error code is asserted."""
from pathlib import Path
import copy, json, shutil, subprocess, sys, tempfile
HERE=Path(__file__).resolve().parent
REPO=HERE.parents[1]
VALIDATOR=HERE/"validate.py"

def load_jsonl(p): return [json.loads(x) for x in p.read_text().splitlines() if x.strip()]
def save_jsonl(p,rows): p.write_text("".join(json.dumps(x,ensure_ascii=False,sort_keys=True)+"\n" for x in rows))
def run_case(name, expected, mutate):
    with tempfile.TemporaryDirectory(prefix="scf-b-0121-") as td:
        root=Path(td)/HERE.name
        shutil.copytree(HERE,root)
        mutate(root)
        p=subprocess.run([sys.executable,str(root/"validate.py"),"--root",str(root),"--repo-root",str(REPO)],text=True,capture_output=True)
        out=p.stdout+p.stderr
        if p.returncode==0 or expected not in out:
            raise SystemExit(f"{name}: expected {expected}, got rc={p.returncode}: {out.strip()}")
        print(f"PASS {name}: {expected}")

def change_file(rel, fn):
    def m(root):
        p=root/rel; x=json.loads(p.read_text()); fn(x); p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+"\n")
    return m

def change_jsonl(rel, index, fn):
    def m(root):
        p=root/rel; rows=load_jsonl(p); fn(rows[index]); save_jsonl(p,rows)
    return m

CASES=[
 ("source-digest", "E_SOURCE_DIGEST", change_jsonl("source-items.jsonl",0,lambda x:x["pre_isolation"].__setitem__("sha256","0"*64))),
 ("source-snapshot", "E_SOURCE_SNAPSHOT", lambda root:(root/"source-snapshots/OUTSIDE67-PATH-007/pre-isolation.md").write_bytes(b"tampered")),
 ("source-schema", "E_SOURCE_SCHEMA", change_jsonl("source-items.jsonl",0,lambda x:x.__setitem__("unknown_key",True))),
 ("unit-set", "E_UNIT_SET", lambda root:(root/"candidate-units.jsonl").write_text("\n".join((root/"candidate-units.jsonl").read_text().splitlines()[:-1])+"\n")),
 ("candidate-record", "E_CANDIDATE_RECORD", change_jsonl("candidate-units.jsonl",0,lambda x:x.__setitem__("current_l1_text","改変"))),
 ("context-boundary", "E_CONTEXT_BOUNDARY", change_jsonl("context-records.jsonl",0,lambda x:x.__setitem__("formal_unit_status","generated"))),
 ("phase-boundary", "E_PHASE_BOUNDARY", change_jsonl("candidate-units.jsonl",0,lambda x:x.__setitem__("phase_status","candidate"))),
 ("implementation-boundary", "E_IMPLEMENTATION_BOUNDARY", change_jsonl("candidate-units.jsonl",0,lambda x:x.__setitem__("implementation_status","implemented"))),
 ("formal-unit", "E_FORMAL_UNIT", change_jsonl("candidate-units.jsonl",0,lambda x:x.__setitem__("formal_unit_status","formal"))),
 ("authority-boundary", "E_AUTHORITY_BOUNDARY", change_jsonl("candidate-units.jsonl",0,lambda x:x.__setitem__("authority_status","granted"))),
 ("overlap", "E_OVERLAP", change_file("inventory.json",lambda x:x["overlap_control"].__setitem__("existing_target_path_ids",["OUTSIDE67-PATH-007"]))),
 ("inventory-declaration", "E_INVENTORY_DECLARATION", change_file("inventory.json",lambda x:x["negative_case_codes"].pop())),
 ("input-digest", "E_INPUT_DIGEST", change_file("inventory.json",lambda x:x["input_digest_pins"].__setitem__("web_l1","0"*64))),
 ("l1-approval-decision-digest", "E_INPUT_DIGEST", change_file("inventory.json",lambda x:x["input_digest_pins"].__setitem__("l1_approval_decision","0"*64))),
 ("base-commit", "E_BASE_COMMIT", change_file("inventory.json",lambda x:x["scope"].__setitem__("base_origin_main","0"*40))),
]
for name,code,mutate in CASES: run_case(name,code,mutate)
print(f"SCF-B-0121 selfcheck: PASS ({len(CASES)} negative cases; expected error codes matched)")
