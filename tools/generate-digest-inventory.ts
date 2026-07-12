import { writeFileSync } from "node:fs";
import { scanDigestInventory } from "../src/lint/digest-inventory";
writeFileSync(
  "config/digest-canonicalization-inventory.json",
  `${JSON.stringify({ schema_version: "digest-inventory.v3", variants: ["prefixed_sha256", "bare_sha256", "truncated_identity", "canonical_json", "file_stream_digest", "pure_lint_embedded"], rows: scanDigestInventory(process.cwd()) }, null, 2)}\n`,
);
