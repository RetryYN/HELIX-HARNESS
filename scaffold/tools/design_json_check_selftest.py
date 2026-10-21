#!/usr/bin/env python3
"""Negative/positive selftest for design_json_check.py. Writes only to a temp repo."""
import hashlib, json, os, shutil, subprocess, sys, tempfile
from pathlib import Path

HERE = Path(__file__).resolve().parent
TOOL = HERE / "design_json_check.py"
DOC = Path("docs/helix-os/L4-basic-design/check-fixture.json")

def git(root, *args):
    p = subprocess.run(["git", "-C", root, *args], capture_output=True, text=True)
    if p.returncode: raise RuntimeError(p.stderr)
    return p.stdout.strip()

def fixture():
    root = Path(tempfile.mkdtemp(prefix="design-json-check-"))
    (root / DOC.parent).mkdir(parents=True)
    (root / "docs/source.txt").write_text("pinned\n", encoding="utf-8")
    (root / "docs/target.json").write_text(json.dumps({"value": 42}, ensure_ascii=False), encoding="utf-8")
    git(root, "init", "-q"); git(root, "config", "user.email", "selftest@example.invalid"); git(root, "config", "user.name", "selftest"); git(root, "add", "docs"); git(root, "commit", "-qm", "fixture"); rev = git(root, "rev-parse", "HEAD")
    doc = {
        "document_id": "SELFTEST", "source_main": rev, "items": [{"name": "x"}],
        "scope_pointers": ["/items/0"],
        "cross_ref": {"path": "docs/target.json", "revision": rev, "json_pointer": "/value"},
        "source_pins": [{"path": "docs/source.txt", "revision": rev, "sha256": sha((root / "docs/source.txt").read_bytes())}],
    }
    (root / DOC).write_text(json.dumps(doc, ensure_ascii=False), encoding="utf-8")
    return root

def sha(data): return hashlib.sha256(data).hexdigest()
def run(root):
    return subprocess.run([sys.executable, str(TOOL), "--root", str(root)], capture_output=True, text=True)
def load(root): return json.loads((root / DOC).read_text(encoding="utf-8"))
def save(root, doc): (root / DOC).write_text(json.dumps(doc, ensure_ascii=False), encoding="utf-8")

def case(name, mutate, code):
    root = fixture()
    try:
        mutate(root)
        r = run(root); ok = r.returncode == 1 and code in r.stdout
        print(("ok  " if ok else "NG  ") + name)
        if not ok: print(r.stdout + r.stderr)
        return ok
    finally: shutil.rmtree(root)

def main():
    root = fixture()
    try:
        r = run(root); ok = r.returncode == 0 and '"violations": 0' in r.stdout
        print(("ok  " if ok else "NG  ") + "valid fixture")
        if not ok: print(r.stdout + r.stderr)
    finally: shutil.rmtree(root)
    tests = [
        ("missing JSON Pointer", lambda d: d.update(scope_pointers=["/items/9"]), "E_POINTER"),
        ("missing pinned path", lambda d: d["source_pins"][0].update(path="docs/missing.txt"), "E_PATH"),
        ("wrong source sha256", lambda d: d["source_pins"][0].update(sha256="0" * 64), "E_SOURCE_SHA"),
        ("unsafe pin path", lambda d: d["source_pins"][0].update(path="../source.txt"), "E_PATH"),
        ("unsafe path reference", lambda d: d.update(source_path="../source.txt"), "E_PATH"),
        ("unknown pinned revision", lambda d: d["source_pins"][0].update(revision="0" * 40), "E_PATH"),
        ("missing cross-file pointer", lambda d: d["cross_ref"].update(json_pointer="/absent"), "E_POINTER"),
    ]
    ok &= all([case(name, lambda root, fn=fn: save(root, (lambda d: (fn(d), d)[1])(load(root))), code) for name, fn, code in tests])
    print("selftest:", "OK" if ok else "FAIL")
    return 0 if ok else 1

if __name__ == "__main__": sys.exit(main())
