import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const templatePath = "docs/templates/plan/impl/template.md";
const schemaPath = "src/schema/frontmatter.ts";

describe("PLAN template backprop decision parity", () => {
  it("U-PLANBPP-001: templateはschema外のrequired値を案内しない", () => {
    const template = readFileSync(templatePath, "utf8");

    expect(template).toContain("backprop_decision: not_required");
    expect(template).not.toMatch(/backprop_decision[^\n]*(?:ある場合|otherwise)[^\n]*required/i);
    expect(template).not.toMatch(/backprop_decision:\s*required/);
  });

  it("U-PLANBPP-002: templateのdecision exact setはfrontmatter schemaと一致する", () => {
    const template = readFileSync(templatePath, "utf8");
    const schema = readFileSync(schemaPath, "utf8");

    const schemaExactSet = schema.match(/backprop_decision:\s*z\.enum\(\[(.*?)\]\)/)?.[1];
    expect(schemaExactSet).toBe('"not_required"');
    expect(template).toContain("意味変更がある場合は該当artifactをgeneratesへ含める");
  });
});
