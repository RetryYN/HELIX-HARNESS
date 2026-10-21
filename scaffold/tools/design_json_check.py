#!/usr/bin/env python3
"""Read-only static check for explicit design JSON references."""
import argparse, collections, hashlib, json, os, re, subprocess, sys
from pathlib import Path

REV = re.compile(r"^[0-9a-f]{40}$")
SHA = re.compile(r"^[0-9a-f]{64}$")
FILE_PATH_KEYS = {"source_path", "approval_record_path", "paired_document", "document", "archive_path",
                  "input_source_path", "expected_source_path", "record_path", "decision_path", "test_path",
                  "whole_freeze_source_path", "source_packet_source_path", "targets_control_path", "receipt_path"}
POINTER_KEYS = {"json_pointer", "pointer", "pointers", "base_pointer", "input_base_pointer", "input_patch_pointer",
                "source_patch_pointer", "origin_before_case_pointer", "fixture_base_pointer", "base_case_pointer"}
LOCAL_POINTER_KEYS = {"scope_pointers", "document_id_source_pointer"}
REVISION_KEYS = ("revision", "commit", "source_revision", "approval_record_revision")
PIN_TRIPLES = (
    ("path", "revision", "sha256"), ("path", "revision", "file_sha256"),
    ("path", "revision", "file_bytes_sha256"), ("path", "revision", "whole_sha256"),
    ("path", "revision", "whole_file_sha256"), ("path", "commit", "sha256"),
    ("path", "source_revision", "sha256"), ("path", "source_revision", "source_sha256"),
    ("path", "source_revision", "file_sha256"), ("source_path", "source_revision", "source_sha256"),
    ("source_path", "source_revision", "sha256"), ("source_path", "source_commit", "source_sha256"),
    ("source_path", "revision", "whole_sha256"), ("source_path", "revision", "file_sha256"),
    ("approval_record_path", "approval_record_revision", "approval_record_sha256"),
    ("document", "revision", "sha256"), ("document", "revision", "file_sha256"))
SKIP_PIN_KEYS = {"pointer", "pointers", "json_pointer", "line_range", "read_lines"}
PATH_SUFFIXES = (".json", ".jsonl", ".md", ".yaml", ".yml", ".py", ".ts", ".txt")

def safe(path):
    return (isinstance(path, str) and path and os.path.normpath(path) == path
            and not os.path.isabs(path) and ".." not in path.split("/") and "\\" not in path)

def parse_ref(value):
    if not isinstance(value, str):
        return None, None, None
    path, pointer = (value.split("#", 1) + [None])[:2] if "#" in value else (value, None)
    match = re.match(r"^([0-9a-f]{40}):(.*)$", path)
    return (match.group(2), pointer, match.group(1)) if match else (path, pointer, None)

def looks_like_path(value):
    path, _, _ = parse_ref(value)
    return (isinstance(path, str) and path and not path.startswith("/")
            and ("/" in path or path.endswith(PATH_SUFFIXES)))

def unsafe_shape(value):
    return isinstance(value, str) and (value.startswith("../") or "\\" in value or os.path.isabs(value))

def resolve(doc, ref):
    if ref == "":
        return doc
    if not isinstance(ref, str) or not ref.startswith("/"):
        raise ValueError("not an absolute JSON Pointer")
    current = doc
    for raw in ref[1:].split("/"):
        part = raw.replace("~1", "/").replace("~0", "~")
        if isinstance(current, list) and part.isdigit() and int(part) < len(current):
            current = current[int(part)]
        elif isinstance(current, dict) and part in current:
            current = current[part]
        else:
            raise KeyError(part)
    return current

class Checker:
    def __init__(self, root):
        self.root = Path(root).resolve()
        self.errors, self.blobs, self.docs = [], {}, {}
        self.files, self.unclassified = 0, collections.Counter()

    def fail(self, rel, at, code, detail):
        item = {"file": rel, "at": at, "code": code, "detail": str(detail)[:300]}
        if item not in self.errors:
            self.errors.append(item)

    def blob(self, path, revision=None):
        if not safe(path):
            raise ValueError("unsafe path " + repr(path))
        key = (path, revision)
        if key not in self.blobs:
            if revision:
                p = subprocess.run(["git", "-C", self.root, "show", revision + ":" + path],
                                   stdout=subprocess.PIPE, stderr=subprocess.DEVNULL)
                if p.returncode:
                    raise FileNotFoundError(revision + ":" + path)
                data = p.stdout
            else:
                data = (self.root / path).read_bytes()
            self.blobs[key] = data
        return self.blobs[key]

    def document(self, path, revision=None):
        key = (path, revision)
        if key not in self.docs:
            self.docs[key] = json.loads(self.blob(path, revision).decode())
        return self.docs[key]

    def revision(self, obj):
        for key in REVISION_KEYS:
            if isinstance(obj.get(key), str):
                return obj[key], bool(REV.fullmatch(obj[key]))
        return None, False

    def path_in(self, obj):
        for key in ("path", "source_path", "approval_record_path", "document", "paired_document"):
            path, _, _ = parse_ref(obj.get(key))
            if looks_like_path(obj.get(key)) and safe(path):
                return path

    def classify_pins(self, obj, rel, at):
        if (SKIP_PIN_KEYS & obj.keys() or "candidate" in str(obj.get("kind", ""))
                or any(key.startswith("historical") for key in obj)):
            self.unclassified["partial_or_candidate_pin"] += 1
            return
        matched = False
        for path_key, rev_key, sha_key in PIN_TRIPLES:
            if not all(isinstance(obj.get(k), str) for k in (path_key, rev_key, sha_key)):
                continue
            matched = True
            path, _, embedded_rev = parse_ref(obj[path_key])
            revision = obj[rev_key] if REV.fullmatch(obj[rev_key]) else embedded_rev
            expected = obj[sha_key]
            if not safe(path):
                self.fail(rel, at + "/" + path_key, "E_PATH", repr(obj[path_key]))
            elif not revision or not SHA.fullmatch(expected):
                self.unclassified["malformed_pin"] += 1
            else:
                self.verify_pin(rel, at + "/" + sha_key, path, revision, expected)
        has_path = any(k.endswith("_path") or k in FILE_PATH_KEYS or k == "path"
                       for k in obj if looks_like_path(obj.get(k)))
        has_rev = any(("revision" in k or "commit" in k or k.endswith("_head")) and isinstance(obj[k], str)
                      for k in obj)
        has_sha = any(k.endswith("sha256") and isinstance(obj[k], str) for k in obj)
        if not matched and sum((has_path, has_rev, has_sha)) >= 2:
            self.unclassified["unpaired_pin_shape"] += 1

    def verify_pin(self, rel, at, path, revision, expected):
        try:
            actual = hashlib.sha256(self.blob(path, revision)).hexdigest()
        except Exception as error:
            self.fail(rel, at, "E_SOURCE", error)
            return
        if actual != expected:
            self.fail(rel, at, "E_SOURCE_SHA", {"expected": expected, "actual": actual})

    def verify_path(self, rel, at, value):
        path, pointer, revision = parse_ref(value)
        if not safe(path):
            self.fail(rel, at, "E_PATH", repr(value))
            return
        try:
            if pointer is None:
                self.blob(path, revision)
            elif path.endswith(".json") and pointer.startswith("/"):
                resolve(self.document(path, revision), pointer)
            else:
                self.blob(path, revision)
                self.unclassified["non_json_fragment"] += 1
        except Exception as error:
            self.fail(rel, at, "E_PATH", error)

    def pointer_target(self, doc, obj):
        if obj.get("document") == "local":
            return doc, None
        path = self.path_in(obj)
        revision, valid = self.revision(obj)
        if revision and not valid:
            return None, "label revision"
        if not path:
            return None, "implicit target"
        try:
            if not path.endswith(".json"):
                self.blob(path, revision)
                return None, "non_json_target"
            return self.document(path, revision), None
        except Exception as error:
            return None, error

    def verify_pointer(self, rel, at, doc, obj, value, local):
        if not isinstance(value, str) or not value.startswith("/") and "#" not in value:
            self.unclassified["pointer_shape"] += 1
            return
        path, pointer, embedded_rev = parse_ref(value) if "#" in value else (None, value, None)
        if path:
            revision, valid = self.revision(obj)
            if revision and not valid:
                self.unclassified["label_revision"] += 1
                return
            try:
                if path.endswith(".json") and pointer and pointer.startswith("/"):
                    target, error = self.document(path, embedded_rev or revision), None
                else:
                    self.blob(path, embedded_rev or revision)
                    self.unclassified["non_json_fragment"] += 1
                    return
            except Exception as exc:
                target, error = None, exc
        elif local:
            target, error = doc, None
        else:
            target, error = self.pointer_target(doc, obj)
        if error is not None:
            skipped = error in ("implicit target", "label revision", "non_json_target")
            self.unclassified["implicit_pointer_target" if skipped else "pointer_target_error"] += 1
            if not skipped:
                self.fail(rel, at, "E_PATH", error)
            return
        try:
            resolve(target, pointer)
        except Exception as error:
            self.fail(rel, at, "E_POINTER", error)

    def collect(self, value, doc, rel, at=""):
        if isinstance(value, list):
            for index, child in enumerate(value):
                self.collect(child, doc, rel, at + "/" + str(index))
            return
        if not isinstance(value, dict):
            return
        for key, child in value.items():
            child_at = at + "/" + key
            if key in FILE_PATH_KEYS:
                if unsafe_shape(child) or looks_like_path(child):
                    self.verify_path(rel, child_at, child)
                else:
                    self.unclassified["ambiguous_path"] += 1
            if key in LOCAL_POINTER_KEYS | POINTER_KEYS:
                for index, pointer in enumerate(child if isinstance(child, list) else [child]):
                    self.verify_pointer(rel, child_at + "/" + str(index), doc, value, pointer,
                                        key in LOCAL_POINTER_KEYS)
            self.collect(child, doc, rel, child_at)
        self.classify_pins(value, rel, at)

    def check(self, path):
        rel = str(path.relative_to(self.root))
        try:
            doc = json.loads(path.read_text(encoding="utf-8"))
        except Exception as error:
            self.fail(rel, "", "E_JSON", error)
            return
        self.collect(doc, doc, rel)

    def run(self):
        for path in sorted((self.root / "docs").glob("helix-*/L*-*/**/*.json")):
            self.files += 1
            self.check(path)
        return self

def main(argv=None):
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", type=Path, default=Path(__file__).resolve().parents[2])
    args = parser.parse_args(argv)
    checker = Checker(args.root).run()
    json.dump({"schema": "helix-design-json-check.v1", "evidence_kind": "scaffold", "authority_effect": "none",
               "files": checker.files, "violations": len(checker.errors),
               "unclassified": dict(checker.unclassified), "items": checker.errors},
              sys.stdout, ensure_ascii=False, sort_keys=True, indent=2)
    print()
    return 1 if checker.errors else 0

if __name__ == "__main__":
    raise SystemExit(main())
