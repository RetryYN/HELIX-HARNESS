"""Fixed design checker inside the private sandbox; Git blobs are the input authority."""
from pathlib import Path
import sys

from common import Diagnostic, canonical_bytes, strict_json
from manifest import verify_design_manifest
from target import GitReader


def main():
    try:
        # This is a trusted, read-only private source copy made by the snapshot writer.
        config = strict_json(Path(__file__).with_name("config.json").read_bytes())
        reader = GitReader(Path.cwd(), "/usr/bin/git", config["executables"]["git"])
        entries = reader.entries(reader.tree(reader.commit("HEAD")))
        raw = reader.blob(entries, "scaffold/local-ci/design-manifest.json")
        manifest = strict_json(raw)
        paths = {row["path"] for row in manifest["files"]}
        paths.update(row["archive_path"] for row in manifest["legacy_pins"])
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
