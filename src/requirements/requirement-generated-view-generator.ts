import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import {
  loadCanonicalRequirementIrFromShards,
  renderRequirementGeneratedView,
} from "./requirement-generated-view";

const repoRoot = process.cwd();
const outputPath =
  process.argv[2] ?? "docs/generated/requirements/requirement-definition.generated.md";
const requirementIr = loadCanonicalRequirementIrFromShards(repoRoot);
const markdown = renderRequirementGeneratedView(requirementIr);
mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, markdown, "utf8");
process.stdout.write(
  `${JSON.stringify({
    output_path: outputPath,
    source_root_digest: requirementIr.root_digest,
    requirements: requirementIr.requirements.length,
    system_contracts: requirementIr.system_contracts.length,
    acceptance_cases: requirementIr.acceptance_cases.length,
    system_tests: requirementIr.system_tests.length,
  })}\n`,
);
