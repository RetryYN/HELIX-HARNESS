#!/usr/bin/env python3
"""Read-only static check for design JSON pointers and source pins."""
import argparse, hashlib, json, os, re, subprocess, sys
from pathlib import Path

PRODUCTS = ("helix-brain", "helix-connect", "helix-harness", "helix-infrastructure", "helix-intelligence", "helix-labo", "helix-os", "helix-security")
SHA = re.compile(r"^[0-9a-f]{64}$"); REV = re.compile(r"^[0-9a-f]{40}$")
PREFIXES = ("docs/", "archive/", "scaffold/")
REV_KEYS = ("revision", "commit", "approved_revision", "source_revision", "approval_record_revision", "base_revision", "actual_admission_revision", "approved_content_head", "source_main")
SHA_KEYS = ("sha256", "source_sha256", "file_sha256", "file_bytes_sha256", "whole_sha256", "whole_file_sha256", "approval_record_sha256")
DOC_KEYS = ("path", "source_path", "approval_record_path", "document", "paired_document")
FILE_PATH_FIELDS = {"source_path", "approval_record_path", "paired_document", "archive_path", "input_source_path", "expected_source_path", "record_path", "decision_path", "test_path", "destination_path", "whole_freeze_source_path", "source_packet_source_path", "targets_control_path", "receipt_path"}
POINTER_KEYS = {"scope_pointers", "base_pointer", "input_base_pointer", "input_patch_pointer", "source_patch_pointer", "origin_before_case_pointer", "document_id_source_pointer", "fixture_base_pointer", "base_case_pointer"}
INHERIT_PATH_CHILDREN = {"selected_objects", "source_evidence", "original_wholes", "objects"}


def sha(data): return hashlib.sha256(data).hexdigest()
def safe(path): return isinstance(path, str) and "#" not in path and path.startswith(PREFIXES) and os.path.normpath(path) == path and ".." not in path.split("/") and "\\" not in path
def parse_path(value):
    if not isinstance(value, str): return None, None, None
    m = re.match(r"^([0-9a-f]{40}):(.*)$", value)
    if m: return m.group(2), None, m.group(1)
    if "#" in value:
        p, frag = value.split("#", 1); return p, frag, None
    return value, None, None
def split_frag(value):
    p, frag, rev = parse_path(value); return p, frag
def split_ref(value):
    if isinstance(value, str) and "#" in value:
        p, frag = value.split("#", 1); return p, frag
    return None, value
def path_part(value): return parse_path(value)[0]
def rev_of(obj):
    for key in REV_KEYS:
        if isinstance(obj.get(key), str) and REV.fullmatch(obj[key]): return obj[key]
    return None
def resolve(doc, ref):
    if ref == "": return doc
    if not isinstance(ref, str) or not ref.startswith("/"): raise ValueError("not an absolute JSON Pointer")
    cur = doc
    for raw in ref[1:].split("/"):
        part = raw.replace("~1", "/").replace("~0", "~")
        if isinstance(cur, list):
            if not part.isdigit() or int(part) >= len(cur): raise KeyError(part)
            cur = cur[int(part)]
        elif isinstance(cur, dict):
            if part not in cur: raise KeyError(part)
            cur = cur[part]
        else: raise KeyError(part)
    return cur

class Checker:
    def __init__(self, root):
        self.root = Path(root).resolve(); self.errors = []; self.error_seen = set(); self.files = 0; self.blobs = {}; self.docs = {};
    def fail(self, rel, at, code, detail):
        detail = str(detail)[:300]; key = (rel, at, code, detail)
        if key not in self.error_seen:
            self.error_seen.add(key); self.errors.append({"file": rel, "at": at, "code": code, "detail": detail})
    def blob(self, path, rev=None):
        if not safe(path): raise ValueError(f"unsafe path {path!r}")
        key = (path, rev)
        if key not in self.blobs:
            if rev:
                p = subprocess.run(["git", "-C", self.root, "show", f"{rev}:{path}"], stdout=subprocess.PIPE, stderr=subprocess.DEVNULL)
                if p.returncode: raise FileNotFoundError(f"{rev}:{path}")
                data = p.stdout
            else: data = (self.root / path).read_bytes()
            self.blobs[key] = data
        return self.blobs[key]
    def doc_at(self, path, rev=None):
        key = (path, rev)
        if key not in self.docs: self.docs[key] = json.loads(self.blob(path, rev).decode())
        return self.docs[key]
    def doc_path(self, obj):
        for key in DOC_KEYS:
            p = path_part(obj.get(key))
            if safe(p): return p
        return None
    def check_path(self, rel, at, value, rev=None):
        p, frag, embedded_rev = parse_path(value)
        if embedded_rev: rev = embedded_rev
        if not safe(p):
            self.fail(rel, at, "E_PATH", repr(value)); return False
        try:
            if frag is None: self.blob(p, rev)
            else: resolve(self.doc_at(p, rev), frag)
            return True
        except Exception as e:
            self.fail(rel, at, "E_PATH", e); return False
    def schema_context(self, schema):
        context = dict(schema); defs = {}
        for key in ("$defs", "defs", "types", "closed_types", "new_defs"):
            if isinstance(schema.get(key), dict): defs.update(schema[key])
        for imp in schema.get("imports") or []:
            if isinstance(imp, dict) and safe(path_part(imp.get("path"))):
                try: imported = resolve(self.doc_at(path_part(imp["path"]), rev_of(imp)), imp.get("pointer"))
                except Exception: continue
                prefix = imp.get("name") if str(imp.get("name") or "").endswith("_") else ""
                if isinstance(imported, dict):
                    for key, value in imported.items(): defs[prefix + key] = value
                elif imp.get("name"): defs[imp["name"]] = imported
        context["$defs"] = defs; return context
    def source_targets(self, doc):
        targets = []
        for key in ("source_fixture", "source_packet", "source_packet_ref", "candidate_l5_binding", "l5_candidate_pin", "paired_l4_candidate_bytes"):
            x = doc.get(key)
            if isinstance(x, dict) and safe(path_part(x.get("path"))): targets.append((path_part(x["path"]), rev_of(x)))
        if safe(path_part(doc.get("paired_document"))): targets.append((path_part(doc["paired_document"]), rev_of(doc)))
        return targets
    def check_pointer(self, rel, at, doc, obj, value, inherited_ctx):
        if not isinstance(value, str): return
        pth, ptr = split_ref(value)
        path_given = pth not in (None, "")
        embedded_rev = None
        if path_given:
            pth, _, embedded_rev = parse_path(pth)
            if not safe(pth):
                self.fail(rel, at, "E_PATH", pth); return
        if pth is None and not (ptr == "" or ptr.startswith("/")): return
        explicit = pth if path_given else self.doc_path(obj) or inherited_ctx[0]
        rev = embedded_rev or rev_of(obj) or inherited_ctx[1]
        candidates = [(explicit, rev)] if explicit else [(None, rev)] + self.source_targets(doc)
        errors = []
        for cpath, crev in candidates:
            try: resolve(self.doc_at(cpath, crev) if cpath else doc, ptr); return
            except Exception as e: errors.append(str(e))
        self.fail(rel, at, "E_POINTER", errors[-1] if errors else "no target")
    def check_pin(self, rel, at, obj, default_rev=None):
        p = self.doc_path(obj)
        if not p:
            raw = next((obj.get(k) for k in ("path", "source_path", "approval_record_path") if isinstance(obj.get(k), str)), None)
            if raw and (rev_of(obj) or any(k in obj for k in SHA_KEYS)): self.fail(rel, at + "/path", "E_PATH", repr(raw))
            return
        raw = next((obj.get(k) for k in ("path", "source_path", "approval_record_path") if path_part(obj.get(k)) == p), p)
        _, _, embedded_rev = parse_path(raw)
        rev = rev_of(obj) or embedded_rev
        for key in REV_KEYS:
            if isinstance(obj.get(key), str) and not REV.fullmatch(obj[key]): self.fail(rel, at + "/" + key, "E_PIN_SHAPE", repr(obj[key]))
        if default_rev and not REV.fullmatch(default_rev): self.fail(rel, at + "/source_main", "E_PIN_SHAPE", repr(default_rev)); default_rev = None
        if not self.check_path(rel, at + "/path", raw, rev or default_rev): return
        for key in SHA_KEYS:
            expected = obj.get(key)
            if not isinstance(expected, str): continue
            if not SHA.fullmatch(expected): self.fail(rel, at + "/" + key, "E_PIN_SHAPE", repr(expected)); continue
            try: got = sha(self.blob(p, rev or default_rev))
            except Exception as e: self.fail(rel, at + "/" + key, "E_SOURCE", e); continue
            if got != expected: self.fail(rel, at + "/" + key, "E_SOURCE_SHA", {"expected": expected, "actual": got})
    def check(self, path, doc):
        rel = str(path.relative_to(self.root))
        pin_seen = set()
        def walk(v, at="", inherited_ctx=(None, None), schema_root=None):
            if isinstance(v, list):
                for i, x in enumerate(v): walk(x, f"{at}/{i}", inherited_ctx, schema_root)
                return
            if not isinstance(v, dict): return
            direct_path = self.doc_path(v); ctx = (direct_path or inherited_ctx[0], rev_of(v) or inherited_ctx[1])
            for key, value in v.items():
                if not isinstance(value, str): continue
                p, _, _ = parse_path(value)
                pin_path = key == "path" and (safe(p) or rev_of(v) or any(k in v for k in SHA_KEYS))
                file_field = key in FILE_PATH_FIELDS or pin_path
                unsafe = value.startswith("../") or "\\" in value or ".." in value.split("/") or (os.path.isabs(value) and key != "path")
                if file_field and (safe(p) or unsafe or (key in FILE_PATH_FIELDS and "/" in p)): self.check_path(rel, f"{at}/{key}", value, rev_of(v))
                elif key in ("document", "paired_document") and safe(p): self.check_path(rel, f"{at}/{key}", value, rev_of(v))
            if direct_path and id(v) not in pin_seen and (rev_of(v) or any(k in v for k in SHA_KEYS)): self.check_pin(rel, at, v, ctx[1])
            pins = v.get("source_pins")
            pin_items = enumerate(pins) if isinstance(pins, list) else pins.items() if isinstance(pins, dict) else ()
            for key, pin in pin_items:
                if isinstance(pin, dict): pin_seen.add(id(pin)); self.check_pin(rel, f"{at}/source_pins/{key}", pin, doc.get("source_main"))
            for key, value in v.items():
                if key in POINTER_KEYS or (key in ("json_pointer", "pointer", "pointers") and (ctx[0] or "canonical_sha256" in v or "document" in v)):
                    for i, ref in enumerate(value if isinstance(value, list) else [value]):
                        self.check_pointer(rel, f"{at}/{key}/{i}", doc, v, ref, ctx)
            ref = v.get("$ref")
            if isinstance(ref, str) and ref.startswith("#/"):
                try: resolve(schema_root or doc, ref[1:])
                except Exception as e: self.fail(rel, at + "/$ref", "E_POINTER", e)
            for key, value in v.items():
                next_schema = self.schema_context(value) if isinstance(value, dict) and any(k in value for k in ("$defs", "defs", "types", "closed_types", "new_defs", "imports")) else schema_root
                walk(value, f"{at}/{key}", ctx if key in INHERIT_PATH_CHILDREN else (inherited_ctx[0], ctx[1]), next_schema)
        walk(doc)
    def run(self):
        for product in PRODUCTS:
            for layer in sorted((self.root / "docs" / product).glob("L*-*/")):
                for path in sorted(layer.rglob("*.json")):
                    self.files += 1
                    try: doc = json.loads(path.read_text(encoding="utf-8"))
                    except Exception as e: self.fail(str(path.relative_to(self.root)), "", "E_JSON", e); continue
                    self.check(path, doc)
        return self

def main(argv=None):
    ap = argparse.ArgumentParser(); ap.add_argument("--root", type=Path, default=Path(__file__).resolve().parents[2]); a = ap.parse_args(argv)
    c = Checker(a.root).run()
    json.dump({"schema":"helix-design-json-check.v1","evidence_kind":"scaffold","authority_effect":"none","files":c.files,"violations":len(c.errors),"items":c.errors}, sys.stdout, ensure_ascii=False, sort_keys=True, indent=2); print()
    return 1 if c.errors else 0

if __name__ == "__main__": raise SystemExit(main())
