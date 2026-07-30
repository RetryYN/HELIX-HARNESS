import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import {
  loadRequirementIrShadowFromShards,
  renderRequirementGeneratedView,
} from "./requirement-generated-view";

const repoRoot = process.cwd();
const outputPath =
  process.argv[2] ?? "docs/generated/requirements/requirement-definition.generated.md";
const shadow = loadRequirementIrShadowFromShards(repoRoot);
const markdown = renderRequirementGeneratedView(shadow);
mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, markdown, "utf8");
process.stdout.write(
  `${JSON.stringify({
    output_path: outputPath,
    source_root_digest: shadow.root_digest,
    requirements: shadow.requirements.length,
    system_contracts: shadow.system_contracts.length,
    acceptance_cases: shadow.acceptance_cases.length,
    system_tests: shadow.system_tests.length,
  })}\n`,
);
