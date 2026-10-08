"""Fixed design checker inside the private sandbox; Git blobs are the input authority."""
from pathlib import Path
import sys

from common import Diagnostic, canonical_bytes, strict_json
from manifest import verify_design_manifest
from target import GitReader


def _manifest_source_paths(manifest):
    if not isinstance(manifest, dict):
        raise Diagnostic("Rejected", "invalid_input", "design manifest must be an object")
    files = manifest.get("files")
    pins = manifest.get("legacy_pins")
    if not isinstance(files, list) or not isinstance(pins, list):
        raise Diagnostic("Rejected", "invalid_input", "manifest files and legacy pins must be arrays")
    paths = set()
    for row in files:
        if not isinstance(row, dict) or not isinstance(row.get("path"), str) or not row["path"]:
            raise Diagnostic("Rejected", "invalid_input", "manifest DesignFile path is malformed")
        paths.add(row["path"])
    for row in pins:
        if (not isinstance(row, dict) or not isinstance(row.get("archive_path"), str)
                or not row["archive_path"] or not isinstance(row.get("full_file_sha256"), str)):
            raise Diagnostic("Rejected", "invalid_input", "manifest LegacyPin source row is malformed")
        paths.add(row["archive_path"])
    return paths


def main():
    try:
        # This is a trusted, read-only private source copy made by the snapshot writer.
        config = strict_json(Path(__file__).with_name("config.json").read_bytes())
        reader = GitReader(Path.cwd(), "/usr/bin/git", config["executables"]["git"])
        entries = reader.entries(reader.tree(reader.commit("HEAD")))
        raw = reader.blob(entries, "scaffold/local-ci/design-manifest.json")
        manifest = strict_json(raw)
        paths = _manifest_source_paths(manifest)
        sources = {path: reader.blob(entries, path) for path in paths}
        ledger = reader.blob(entries, "docs/governance/legacy-asset-disposition.jsonl")
        report = verify_design_manifest(raw, sources, ledger)
        sys.stdout.buffer.write(canonical_bytes(report) + b"\n")
        return 0 if report["structure_complete"] else 1
    except Diagnostic as exc:
        sys.stdout.buffer.write(canonical_bytes(exc.as_dict()) + b"\n")
        return 1


if __name__ == "__main__":
    sys.exit(main())
