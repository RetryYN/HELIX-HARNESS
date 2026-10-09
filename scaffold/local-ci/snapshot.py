"""Build private inputs from Git objects, never from live docs paths."""
from __future__ import annotations

import os
from pathlib import Path
import tempfile
import zlib

from common import Diagnostic, sha256, strict_json
from target import GitReader, relative_path

MANIFEST_PATH = "scaffold/local-ci/design-manifest.json"
LEDGER_PATH = "docs/governance/legacy-asset-disposition.jsonl"
CHECKER_PATHS = ("scaffold/tools/scfctl.py", "scaffold/governance/tools/govcheck.py",
                 "scaffold/governance/tools/gen_rulebook.py", "scaffold/local-ci/design_check.py",
                 "scaffold/local-ci/manifest.py", "scaffold/local-ci/common.py",
                 "scaffold/local-ci/source_l7_runner.py",
                 "scaffold/local-ci/target.py", "scaffold/local-ci/config.json")
GOV_INPUTS = ("docs/governance/candidates/legacy-rule-derived-requirements.md",
              "docs/governance/legacy-migration/rule-atom/legacy-rule-atom-inventory.jsonl",
              "scaffold/governance/index.md", "scaffold/schema/binding.schema.json")


class SourceSnapshot:
    def __init__(self, temporary, root, sources, source_refs):
        self.temporary, self.root = temporary, root
        self.sources, self.source_refs = sources, source_refs

    def close(self):
        # Only this private temporary tree is made writable for cleanup.
        for parent, dirs, files in os.walk(self.root):
            os.chmod(parent, 0o700)
            for file in files:
                os.chmod(Path(parent) / file, 0o600)
        self.temporary.cleanup()


def read_fixed_snapshot(reader: GitReader, target: dict) -> SourceSnapshot:
    entries = reader.entries(target["head_tree"])
    sources = {}

    def load(path, expected=None):
        path = relative_path(path)
        if path not in sources:
            sources[path] = reader.blob(entries, path, expected)
        elif expected is not None and sha256(sources[path]) != expected:
            raise Diagnostic("Unknown", "conflict", "declared digest mismatch: " + path)
        return sources[path]

    raw_manifest = load(MANIFEST_PATH)
    manifest = strict_json(raw_manifest)
    if not isinstance(manifest, dict) or not isinstance(manifest.get("files"), list):
        raise Diagnostic("Rejected", "invalid_input", "invalid design manifest")
    for item in manifest["files"]:
        if not isinstance(item, dict) or not isinstance(item.get("path"), str):
            raise Diagnostic("Rejected", "invalid_input", "invalid DesignFile row")
        load(item["path"])
    pins = manifest.get("legacy_pins", [])
    if not isinstance(pins, list):
        raise Diagnostic("Rejected", "invalid_input", "invalid legacy pin inventory")
    for item in pins:
        if (not isinstance(item, dict) or not isinstance(item.get("archive_path"), str)
                or not isinstance(item.get("full_file_sha256"), str)):
            raise Diagnostic("Rejected", "invalid_input", "invalid LegacyPin row")
        load(item["archive_path"], item["full_file_sha256"])
    load(LEDGER_PATH)
    for path in (*CHECKER_PATHS, *GOV_INPUTS):
        load(path)
    for path in entries:
        if path.startswith("scaffold/governance/rules/"):
            load(path)

    artifact_files, artifact_dirs = set(), set()
    binding_paths = sorted(p for p in entries if p.startswith("scaffold/bindings/") and p.endswith(".json"))
    for path in binding_paths:
        binding = strict_json(load(path))
        if (not isinstance(binding, dict) or not isinstance(binding.get("upstream"), list)
                or not isinstance(binding.get("artifacts"), list)):
            raise Diagnostic("Rejected", "invalid_input", "invalid snapshot Binding input")
        for source in binding["upstream"]:
            if not isinstance(source, dict) or not isinstance(source.get("path"), str):
                raise Diagnostic("Rejected", "invalid_input", "invalid Binding upstream row")
            # Digest mismatch is left to the SCF checker; absence cannot be invented.
            load(source["path"])
        if binding.get("state") == "retired":
            continue
        for artifact in binding["artifacts"]:
            relative_path(artifact)
            if artifact in entries:
                mode, kind, _ = entries[artifact]
                if kind != "blob" or mode not in ("100644", "100755"):
                    raise Diagnostic("Unknown", "conflict", "non-regular artifact: " + artifact)
                artifact_files.add(artifact)
            elif any(p.startswith(artifact.rstrip("/") + "/") for p in entries):
                artifact_dirs.add(artifact)
            else:
                raise Diagnostic("Unknown", "missing_input", "artifact absent from target: " + artifact)

    temporary = tempfile.TemporaryDirectory(prefix="helix-local-ci-snapshot-")
    root = Path(temporary.name)
    try:
        for path, data in sources.items():
            dest = root / path
            dest.parent.mkdir(parents=True, exist_ok=True)
            dest.write_bytes(data)
        # Existing artifact-only paths are existence inputs of scfctl, not byte sources.
        for path in artifact_files - sources.keys():
            dest = root / path
            dest.parent.mkdir(parents=True, exist_ok=True)
            dest.touch()
        for path in artifact_dirs:
            (root / path).mkdir(parents=True, exist_ok=True)

        private_git = root / ".git"
        (private_git / "objects").mkdir(parents=True)
        (private_git / "refs").mkdir()
        (private_git / "HEAD").write_text(target["head_commit"] + "\n")
        (private_git / "config").write_text("[core]\nrepositoryformatversion = 0\nbare = false\nfsmonitor = false\nhooksPath = /dev/null\n")
        object_ids = set()
        for commit in {target["base_commit"], target["merge_base"], target["head_commit"]}:
            object_ids.add(commit)
            tree = reader.tree(commit)
            object_ids.add(tree)
            for row in reader.read("ls-tree", "-r", "-t", "-z", tree).split(b"\x00"):
                if row:
                    meta, _ = row.split(b"\t", 1)
                    _, kind, oid = meta.decode().split()
                    if kind == "tree":
                        object_ids.add(oid)
        for path in sources:
            object_ids.add(entries[path][2])
        changed = reader.read("diff", "--name-only", "-z", "--no-renames", "--no-ext-diff", "--no-textconv",
                              target["merge_base"], target["head_commit"]).split(b"\x00")
        baseline = reader.entries(reader.tree(target["merge_base"]))
        for raw in changed:
            if raw:
                path = raw.decode("utf-8", "strict")
                for tree_entries in (baseline, entries):
                    if path in tree_entries:
                        object_ids.add(tree_entries[path][2])
        for oid in object_ids:
            kind = reader.read("cat-file", "-t", oid).strip().decode("ascii")
            data = reader.read("cat-file", kind, oid)
            encoded = kind.encode() + b" " + str(len(data)).encode() + b"\x00" + data
            dest = private_git / "objects" / oid[:2] / oid[2:]
            dest.parent.mkdir(exist_ok=True)
            dest.write_bytes(zlib.compress(encoded))
        for parent, dirs, files in os.walk(root):
            for file in files:
                os.chmod(Path(parent) / file, 0o444)
            os.chmod(parent, 0o555)
        refs = [{"path": p, "sha256": sha256(data)} for p, data in sorted(sources.items())]
        return SourceSnapshot(temporary, root, sources, refs)
    except BaseException:
        for parent, dirs, files in os.walk(root):
            os.chmod(parent, 0o700)
        temporary.cleanup()
        raise
