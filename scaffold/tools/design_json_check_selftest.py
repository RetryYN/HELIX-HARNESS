#!/usr/bin/env python3
"""Strict positive/negative selftest for design_json_check.py in a temp repo."""
import hashlib, json, os, shutil, subprocess, sys, tempfile
from pathlib import Path

TOOL = Path(__file__).resolve().parent / "design_json_check.py"
DOC = Path("docs/helix-os/L4-basic-design/check-fixture.json")
ENV = {k: v for k, v in os.environ.items() if not k.startswith("GIT_")}
ENV.update(GIT_CONFIG_GLOBAL="/dev/null", GIT_CONFIG_NOSYSTEM="1")

def git(root, *args):
    p = subprocess.run(["git", "-C", root, "-c", "commit.gpgsign=false", "-c", "core.hooksPath=/dev/null", *args],
                       capture_output=True, text=True, env=ENV)
    if p.returncode:
        raise RuntimeError(p.stderr)
    return p.stdout.strip()

def sha(data):
    return hashlib.sha256(data).hexdigest()

def fixture():
    root = Path(tempfile.mkdtemp(prefix="design-json-check-"))
    try:
        (root / DOC.parent).mkdir(parents=True)
        (root / "AGENTS.md").write_text("rules\n", encoding="utf-8")
        (root / "docs/source.txt").write_text("pinned\n", encoding="utf-8")
        (root / "docs/target.json").write_text(json.dumps({"value": 42}), encoding="utf-8")
        git(root, "init", "-q")
        git(root, "config", "user.email", "selftest@example.invalid")
        git(root, "config", "user.name", "selftest")
        git(root, "add", "AGENTS.md", "docs")
        git(root, "commit", "-qm", "fixture")
        old = git(root, "rev-parse", "HEAD")
        (root / "docs/source.txt").write_text("changed\n", encoding="utf-8")
        git(root, "add", "docs/source.txt"); git(root, "commit", "-qm", "change")
        doc = {
            "document_id": "SELFTEST", "items": [{"name": "x"}],
            "scope_pointers": ["/items/0"],
            "cross_ref": {"path": "docs/target.json", "revision": old, "json_pointer": "/value"},
            "source_pins": [{"path": "docs/source.txt", "revision": old, "sha256": sha(b"pinned\n")}],
            "partial_hash": {"path": "docs/source.txt", "revision": old, "sha256": sha(b"pinned"), "line_range": [1, 1]},
            "label_pin": {"path": "docs/source.txt", "revision": "current_candidate", "sha256": "0" * 64},
            "commit_pin": {"path": "docs/source.txt", "commit": old, "sha256": sha(b"pinned\n")},
            "label_pointer": {"document": "L5", "pointer": "/functions/0"},
            "historical_pin": {"path": "docs/source.txt", "revision": old, "sha256": "0" * 64, "historical_approval": True},
            "test_path": "AGENTS.md",
        }
        (root / DOC).write_text(json.dumps(doc, ensure_ascii=False), encoding="utf-8")
        return root
    except Exception:
        shutil.rmtree(root); raise

def run(root):
    return subprocess.run([sys.executable, str(TOOL), "--root", str(root)], capture_output=True, text=True, env=ENV)

def load(root):
    return json.loads((root / DOC).read_text(encoding="utf-8"))

def save(root, doc):
    (root / DOC).write_text(json.dumps(doc, ensure_ascii=False), encoding="utf-8")

def result(name, mutate, expected):
    root = fixture()
    try:
        if mutate:
            doc = load(root); mutate(doc); save(root, doc)
        r = run(root); out = json.loads(r.stdout)
        if expected is None:
            ok = r.returncode == 0 and out["violations"] == 0
        else:
            ok = r.returncode == 1 and any(i["code"] == code and i["at"] == at for i in out["items"] for code, at in [expected])
        print(("ok  " if ok else "NG  ") + name)
        if not ok:
            print(r.stdout + r.stderr)
        return ok
    finally:
        shutil.rmtree(root)

def main():
    tests = [
        ("valid fixture", None, None),
        ("missing JSON Pointer", lambda d: d.update(scope_pointers=["/items/9"]), ("E_POINTER", "/scope_pointers/0")),
        ("missing pinned path", lambda d: d["source_pins"][0].update(path="docs/missing.txt"), ("E_SOURCE", "/source_pins/0/sha256")),
        ("wrong source sha256", lambda d: d["source_pins"][0].update(sha256="0" * 64), ("E_SOURCE_SHA", "/source_pins/0/sha256")),
        ("unsafe pin path", lambda d: d["source_pins"][0].update(path="../source.txt"), ("E_PATH", "/source_pins/0/path")),
        ("unsafe path reference", lambda d: d.update(test_path="../source.txt"), ("E_PATH", "/test_path")),
        ("absolute path reference", lambda d: d.update(test_path="/etc/passwd"), ("E_PATH", "/test_path")),
        ("unknown pinned revision", lambda d: d["source_pins"][0].update(revision="0" * 40), ("E_SOURCE", "/source_pins/0/sha256")),
        ("missing cross-file pointer", lambda d: d["cross_ref"].update(json_pointer="/absent"), ("E_POINTER", "/cross_ref/json_pointer/0")),
    ]
    ok = all([result(name, mutate, expected) for name, mutate, expected in tests])
    print("selftest:", "OK" if ok else "FAIL")
    return 0 if ok else 1

if __name__ == "__main__":
    sys.exit(main())
