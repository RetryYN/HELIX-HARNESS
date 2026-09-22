#!/usr/bin/env python3
import json, shutil, subprocess, sys, tempfile
from pathlib import Path

HERE = Path(__file__).resolve()
VALIDATOR = HERE.with_name("validate.py")
TARGET = HERE.parent

def run(root):
    return subprocess.run([sys.executable, str(VALIDATOR), "--root", str(root)], capture_output=True, text=True)

def mutate_json(path, fn):
    data=json.loads(path.read_text(encoding="utf-8")); fn(data); path.write_text(json.dumps(data, ensure_ascii=False, indent=2)+"\n", encoding="utf-8")

def mutate_jsonl(path, index, fn):
    rows=[json.loads(x) for x in path.read_text(encoding="utf-8").splitlines()]; fn(rows[index]); path.write_text("\n".join(json.dumps(x,ensure_ascii=False,sort_keys=True) for x in rows)+"\n",encoding="utf-8")

def main():
    cases=[]
    with tempfile.TemporaryDirectory(prefix="outside67-selfcheck-") as td:
        root=Path(td)/"repo"; shutil.copytree(TARGET.parents[1],root)
        base=run(root)
        if base.returncode != 0: print("FAIL selfcheck baseline\n"+base.stdout+base.stderr); return 1
        def case(name, mutate, needle):
            c=Path(td)/name; shutil.copytree(root,c); mutate(c); p=run(c)
            ok=p.returncode != 0 and needle in (p.stdout+p.stderr); cases.append((name,ok,p.stdout+p.stderr))
        case("denominator",lambda c:mutate_json(c/"scaffold/rdp001-outside67-product-boundary-062/inventory.json",lambda d:d["scope"].__setitem__("remaining_after_batch",59)),"E_ACCOUNTING")
        case("fragment",lambda c:mutate_jsonl(c/"scaffold/rdp001-outside67-product-boundary-062/product-units.jsonl",0,lambda d:d.__setitem__("source_fragment","改変")),"E_UNIT_FRAGMENT_MIRROR")
        case("unknown",lambda c:mutate_jsonl(c/"scaffold/rdp001-outside67-product-boundary-062/product-units.jsonl",0,lambda d:d.__setitem__("implementation_status","implemented")),"E_UNIT_UNKNOWN")
        case("current_unknown",lambda c:mutate_jsonl(c/"scaffold/rdp001-outside67-product-boundary-062/product-units.jsonl",0,lambda d:d.__setitem__("current_implementation_status","implemented")),"E_UNIT_UNKNOWN")
        case("product",lambda c:mutate_jsonl(c/"scaffold/rdp001-outside67-product-boundary-062/product-units.jsonl",0,lambda d:d.__setitem__("product_candidates",["HELIX-HARNESS"])),"E_FOUR_PRODUCT")
        case("overlap",lambda c:mutate_jsonl(c/"scaffold/rdp001-outside67-product-boundary-062/selected-source-items.jsonl",0,lambda d:d.__setitem__("source_item_id","OUTSIDE67-PATH-008")),"E_OVERLAP")
        case("execution",lambda c:mutate_json(c/"scaffold/rdp001-outside67-product-boundary-062/inventory.json",lambda d:d.__setitem__("old_runtime_test_ci_execution",True)),"E_EXECUTION")
        case("snapshot",lambda c:(c/"scaffold/rdp001-outside67-product-boundary-062/source-snapshots/OUTSIDE67-PATH-059/pre-isolation.md").write_text("changed\n",encoding="utf-8"),"E_SNAPSHOT")
        case("base_ancestor",lambda c:mutate_json(c/"scaffold/rdp001-outside67-product-boundary-062/inventory.json",lambda d:d["scope"].__setitem__("base_origin_main","0"*40)),"E_BASE_NOT_ANCESTOR")
        case("inventory_keyset",lambda c:mutate_json(c/"scaffold/rdp001-outside67-product-boundary-062/inventory.json",lambda d:d.__setitem__("free_text","tampered")),"E_INVENTORY_KEYS")
        case("inventory_findings_keyset",lambda c:mutate_json(c/"scaffold/rdp001-outside67-product-boundary-062/inventory.json",lambda d:d["findings"][0].__setitem__("free_text","tampered")),"E_INVENTORY_FIXED")
        case("inventory_questions_count",lambda c:mutate_json(c/"scaffold/rdp001-outside67-product-boundary-062/inventory.json",lambda d:d["unresolved_questions"].pop()),"E_INVENTORY_FIXED")
        case("unit_keyset",lambda c:mutate_jsonl(c/"scaffold/rdp001-outside67-product-boundary-062/product-units.jsonl",0,lambda d:d.__setitem__("free_text","tampered")),"E_UNIT_KEYS")
        case("normalized_statement",lambda c:mutate_jsonl(c/"scaffold/rdp001-outside67-product-boundary-062/product-units.jsonl",0,lambda d:d["normalized_statement"].__setitem__("free_text","tampered")),"E_UNIT_FIXED_FIELD")
        case("retained_meaning",lambda c:mutate_jsonl(c/"scaffold/rdp001-outside67-product-boundary-062/product-units.jsonl",0,lambda d:d["retained_meaning"].__setitem__("free_text","tampered")),"E_UNIT_FIXED_FIELD")
        case("unresolved_questions",lambda c:mutate_jsonl(c/"scaffold/rdp001-outside67-product-boundary-062/product-units.jsonl",0,lambda d:d["unresolved_questions"].__setitem__("free_text","tampered")),"E_UNIT_FIXED_FIELD")
        case("diff_observation",lambda c:mutate_jsonl(c/"scaffold/rdp001-outside67-product-boundary-062/product-units.jsonl",0,lambda d:d["diff_observation"].__setitem__("free_text","tampered")),"E_UNIT_FIXED_FIELD")
        case("canonical_product",lambda c:mutate_jsonl(c/"scaffold/rdp001-outside67-product-boundary-062/product-units.jsonl",0,lambda d:d.__setitem__("candidate_product","HELIX-OS")),"E_UNIT_CANONICAL:candidate_product")
        case("canonical_selection_reason",lambda c:mutate_jsonl(c/"scaffold/rdp001-outside67-product-boundary-062/product-units.jsonl",0,lambda d:d.__setitem__("selection_reason","tampered")),"E_UNIT_CANONICAL:selection_reason")
        case("canonical_anchor_keyset",lambda c:mutate_jsonl(c/"scaffold/rdp001-outside67-product-boundary-062/product-units.jsonl",0,lambda d:d["source_anchor"]["pre_isolation"].__setitem__("free_text","tampered")),"E_UNIT_ANCHOR_KEYS")
        case("scope_keyset",lambda c:mutate_json(c/"scaffold/rdp001-outside67-product-boundary-062/inventory.json",lambda d:d["scope"].__setitem__("free_text","tampered")),"E_SCOPE_KEYS")
        bad=[x for x in cases if not x[1]]
        if bad:
            print("FAIL selfcheck cases: "+", ".join(x[0] for x in bad)); print("\n".join(x[2] for x in bad)); return 1
    print("PASS outside67 product-boundary selfcheck: baseline + 21 negative cases")
    return 0

if __name__ == "__main__": sys.exit(main())
