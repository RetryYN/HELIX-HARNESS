import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import ts from "typescript";
import { describe, expect, it } from "vitest";
import { parse } from "yaml";

const MANIFEST_PATH =
  "docs/test-design/helix/fixtures/layer-ledger-pair-gate-progress-s01.manifest";

interface ArtifactRecordV1 {
  content_digest: string;
  path: string;
  slice_id: string;
}

interface StrictDesignManifestV1 {
  artifact_inventory: ArtifactRecordV1[];
  artifact_path_content_set_digest: string;
  canonical_hst_ids: string[];
  canonical_hst_set_digest: string;
  canonical_integration_ids: string[];
  canonical_integration_set_digest: string;
  canonical_unit_ids: string[];
  canonical_unit_set_digest: string;
  expected_terminal_receipt_digest: string;
  fixture_id: string;
  slice_ids: string[];
  slice_set_digest: string;
  snapshot_binding: {
    design_snapshot_digest: string;
    source_commit: string;
    source_tree: string;
  };
  supporting_meta_oracle_receipt: {
    canonical_denominator_included: false;
    oracle_ids: [string, string];
    receipt_digest: string;
    receipt_id: string;
    snapshot_digest: string;
    status: string;
  };
}

function sha256(value: string | Buffer): string {
  return `sha256:${createHash("sha256").update(value).digest("hex")}`;
}

function setDigest(values: string[]): string {
  return sha256([...values].sort().join("\n"));
}

function loadManifest(): StrictDesignManifestV1 {
  return parse(readFileSync(MANIFEST_PATH, "utf8")) as StrictDesignManifestV1;
}

function extractTypeScriptFences(content: string): string[] {
  return [...content.matchAll(/```ts\s*\n([\s\S]*?)```/g)].map((match) => match[1] ?? "");
}

function topLevelDeclarationNames(content: string): string[] {
  return extractTypeScriptFences(content).flatMap((fence, index) => {
    const source = ts.createSourceFile(
      `design-fence-${index}.ts`,
      fence,
      ts.ScriptTarget.ES2022,
      true,
    );
    return source.statements.flatMap((statement) => {
      if (
        ts.isInterfaceDeclaration(statement) ||
        ts.isTypeAliasDeclaration(statement) ||
        ts.isClassDeclaration(statement) ||
        ts.isEnumDeclaration(statement)
      ) {
        return statement.name ? [statement.name.text] : [];
      }
      return [];
    });
  });
}

function declarationOwnerFindings(
  sources: { path: string; content: string }[],
  canonicalOwner: string,
): string[] {
  const owners = new Map<string, string[]>();
  for (const source of sources) {
    for (const name of topLevelDeclarationNames(source.content)) {
      const current = owners.get(name) ?? [];
      current.push(source.path);
      owners.set(name, current);
    }
  }
  return [...owners.entries()].flatMap(([name, paths]) =>
    paths.length === 1 && paths[0] === canonicalOwner ? [] : [`${name}:${paths.join(",")}`],
  );
}

function exactStringUnionMembers(content: string, aliasName: string): string[] | null {
  for (const [index, fence] of extractTypeScriptFences(content).entries()) {
    const source = ts.createSourceFile(
      `union-fence-${index}.ts`,
      fence,
      ts.ScriptTarget.ES2022,
      true,
    );
    const declaration = source.statements.find(
      (statement): statement is ts.TypeAliasDeclaration =>
        ts.isTypeAliasDeclaration(statement) && statement.name.text === aliasName,
    );
    if (!declaration || !ts.isUnionTypeNode(declaration.type)) {
      continue;
    }
    const members: string[] = [];
    for (const node of declaration.type.types) {
      if (!ts.isLiteralTypeNode(node) || !ts.isStringLiteral(node.literal)) {
        return null;
      }
      members.push(node.literal.text);
    }
    return members;
  }
  return null;
}

function semanticDiagnostics(path: string, content: string): string[] {
  const virtualPath = `${path}.ts`;
  const options: ts.CompilerOptions = {
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    noEmit: true,
    skipLibCheck: true,
    strict: true,
    target: ts.ScriptTarget.ES2022,
  };
  const host = ts.createCompilerHost(options, true);
  const originalFileExists = host.fileExists.bind(host);
  const originalGetSourceFile = host.getSourceFile.bind(host);
  const originalReadFile = host.readFile.bind(host);

  host.fileExists = (candidate) => candidate === virtualPath || originalFileExists(candidate);
  host.readFile = (candidate) =>
    candidate === virtualPath ? content : originalReadFile(candidate);
  host.getSourceFile = (candidate, languageVersion, onError, shouldCreate) =>
    candidate === virtualPath
      ? ts.createSourceFile(candidate, content, languageVersion, true)
      : originalGetSourceFile(candidate, languageVersion, onError, shouldCreate);

  const program = ts.createProgram([virtualPath], options, host);
  return ts
    .getPreEmitDiagnostics(program)
    .filter((diagnostic) => !diagnostic.file || diagnostic.file.fileName === virtualPath)
    .map((diagnostic) => {
      const position =
        diagnostic.file && diagnostic.start !== undefined
          ? diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start)
          : null;
      const location = position ? `${path}:${position.line + 1}:${position.character + 1}` : path;
      return `${location} TS${diagnostic.code} ${ts.flattenDiagnosticMessageText(diagnostic.messageText, " ")}`;
    });
}

describe("Infinity Loop strict design contract", () => {
  const manifest = loadManifest();
  const artifacts = manifest.artifact_inventory;
  const functionDesigns = artifacts.filter((artifact) =>
    artifact.path.includes("/L6-function-design/"),
  );

  it("76成果物・19 L6スライスを固定分母として読む", () => {
    expect(artifacts).toHaveLength(76);
    expect(functionDesigns).toHaveLength(19);
  });

  it("manifestを固定commit/treeと76成果物exact bytesへbindする", () => {
    const commit = manifest.snapshot_binding.source_commit;
    const tree = execFileSync("git", ["rev-parse", `${commit}^{tree}`], {
      encoding: "utf8",
    }).trim();
    expect(tree).toBe(manifest.snapshot_binding.source_tree);

    const contentFindings: string[] = [];
    const artifactRecords = artifacts.map((artifact) => {
      const bytes = execFileSync("git", ["show", `${commit}:${artifact.path}`], {
        encoding: "buffer",
        maxBuffer: 16 * 1024 * 1024,
      });
      const actual = sha256(bytes);
      if (actual !== artifact.content_digest) {
        contentFindings.push(artifact.path);
      }
      return `${artifact.path}\t${actual}`;
    });
    expect(contentFindings).toEqual([]);

    const sliceDigest = setDigest(manifest.slice_ids);
    const artifactDigest = setDigest(artifactRecords);
    const unitDigest = setDigest(manifest.canonical_unit_ids);
    const integrationDigest = setDigest(manifest.canonical_integration_ids);
    const hstDigest = setDigest(manifest.canonical_hst_ids);
    expect(sliceDigest).toBe(manifest.slice_set_digest);
    expect(artifactDigest).toBe(manifest.artifact_path_content_set_digest);
    expect(unitDigest).toBe(manifest.canonical_unit_set_digest);
    expect(integrationDigest).toBe(manifest.canonical_integration_set_digest);
    expect(hstDigest).toBe(manifest.canonical_hst_set_digest);

    const designDigest = sha256(
      [commit, tree, sliceDigest, artifactDigest, unitDigest, integrationDigest, hstDigest].join(
        "\n",
      ),
    );
    expect(designDigest).toBe(manifest.snapshot_binding.design_snapshot_digest);

    const supporting = manifest.supporting_meta_oracle_receipt;
    const supportingDigest = sha256(
      [
        supporting.receipt_id,
        designDigest,
        supporting.oracle_ids[0],
        supporting.oracle_ids[1],
        supporting.status,
        String(supporting.canonical_denominator_included),
      ].join("\n"),
    );
    expect(supporting.snapshot_digest).toBe(designDigest);
    expect(supporting.receipt_digest).toBe(supportingDigest);

    const terminalDigest = sha256(
      [
        manifest.fixture_id,
        designDigest,
        sliceDigest,
        artifactDigest,
        unitDigest,
        integrationDigest,
        hstDigest,
        supportingDigest,
      ].join("\n"),
    );
    expect(manifest.expected_terminal_receipt_digest).toBe(terminalDigest);
  });

  it("76成果物の型宣言名をV1へ閉じる", () => {
    const findings: string[] = [];
    for (const artifact of artifacts) {
      const lines = readFileSync(artifact.path, "utf8").split(/\r?\n/);
      lines.forEach((line, index) => {
        const declaration = line.match(/^(?:export\s+)?(?:interface|type)\s+([A-Za-z0-9_]+)/);
        if (declaration && !declaration[1]?.endsWith("V1")) {
          findings.push(`${artifact.path}:${index + 1}:${declaration[1]}`);
        }
      });
    }
    expect(findings).toEqual([]);
  });

  it("L6で未定義generic Resultへの縮退を認めない", () => {
    const findings = functionDesigns.flatMap((artifact) => {
      const content = readFileSync(artifact.path, "utf8");
      return /\bResult</.test(content) ? [artifact.path] : [];
    });
    expect(findings).toEqual([]);
  });

  it("全L6 TypeScript fenceを構文・意味の両方で閉じる", () => {
    const findings: string[] = [];
    for (const artifact of functionDesigns) {
      const content = readFileSync(artifact.path, "utf8");
      const fences = extractTypeScriptFences(content);
      if (fences.length === 0) {
        findings.push(`${artifact.path}: TypeScript fenceなし`);
        continue;
      }
      findings.push(...semanticDiagnostics(artifact.path, fences.join("\n")));
    }
    expect(findings).toEqual([]);
  }, 30_000);

  it("各sliceの4成果物を結合してschema衝突を拒否する", () => {
    const findings: string[] = [];
    const bySlice = new Map<string, ArtifactRecordV1[]>();
    for (const artifact of artifacts) {
      const current = bySlice.get(artifact.slice_id) ?? [];
      current.push(artifact);
      bySlice.set(artifact.slice_id, current);
    }
    for (const [sliceId, sliceArtifacts] of bySlice) {
      const fences = sliceArtifacts.flatMap((artifact) =>
        extractTypeScriptFences(readFileSync(artifact.path, "utf8")),
      );
      findings.push(...semanticDiagnostics(`strict-design/${sliceId}`, fences.join("\n")));
    }
    expect(findings).toEqual([]);
  }, 30_000);

  it("HDS-HIL-12の全共有schemaをL6単一ownerへ固定する", () => {
    const sources = artifacts
      .filter((artifact) => artifact.slice_id === "HDS-HIL-12")
      .map((artifact) => ({
        path: artifact.path,
        content: readFileSync(artifact.path, "utf8"),
      }));
    const owner = "docs/design/helix/L6-function-design/python-worker-runtime.md";
    expect(declarationOwnerFindings(sources, owner)).toEqual([]);

    const names = topLevelDeclarationNames(
      sources.find((source) => source.path === owner)?.content ?? "",
    );
    expect(names).toContain("PythonWorkerCapabilityClassV1");
    expect(names).toContain("ResolvedPythonWorkerDescriptorV1");

    const ownerText = sources.find((source) => source.path === owner)?.content ?? "";
    expect(exactStringUnionMembers(ownerText, "PythonWorkerCapabilityClassV1")?.sort()).toEqual([
      "analysis",
      "detector",
      "document_engine",
      "product_data",
      "source_atomization",
    ]);
  });

  it("HDS-HIL-12の別artifact同名schema driftをnegative mutationで拒否する", () => {
    expect(
      declarationOwnerFindings(
        [
          { path: "L6.md", content: "```ts\ninterface SharedV1 { id: string }\n```" },
          { path: "L5.md", content: "```ts\ninterface SharedV1 { id: string; drift: true }\n```" },
        ],
        "L6.md",
      ),
    ).toEqual(["SharedV1:L6.md,L5.md"]);
  });

  it("HDS-HIL-12のclosed capability union wideningをnegative mutationで拒否する", () => {
    const widened = [
      "```ts",
      "type PythonWorkerCapabilityClassV1 =",
      '  | "source_atomization"',
      '  | "document_engine"',
      '  | "detector"',
      '  | "product_data"',
      '  | "analysis"',
      "  | string;",
      "```",
    ].join("\n");
    expect(exactStringUnionMembers(widened, "PythonWorkerCapabilityClassV1")).toBeNull();
  });

  it("current quartetのoracle分母とHDS-HIL-13 cardinalityを固定する", () => {
    const currentUnitIds = new Set<string>();
    const currentIntegrationIds = new Set<string>();
    for (const artifact of artifacts) {
      if (!artifact.path.includes("/test-design/")) continue;
      const content = readFileSync(artifact.path, "utf8");
      if (artifact.path.includes("/L6-")) {
        for (const match of content.matchAll(/\bU-[A-Z0-9]+-[0-9]{3}\b/g)) {
          currentUnitIds.add(match[0]);
        }
      }
      if (artifact.path.includes("/L5-")) {
        for (const match of content.matchAll(/\bIT-[A-Z0-9]+-[0-9]{3}\b/g)) {
          currentIntegrationIds.add(match[0]);
        }
      }
    }
    expect(currentUnitIds.size).toBe(475);
    expect(currentIntegrationIds.size).toBe(360);
    expect([...currentUnitIds].sort()).toEqual([...manifest.canonical_unit_ids].sort());
    expect([...currentIntegrationIds].sort()).toEqual(
      [...manifest.canonical_integration_ids].sort(),
    );

    const functionDesign =
      readFileSync("docs/design/helix/L6-function-design/node-runtime-cutover.md", "utf8").split(
        "### §1.1",
        1,
      )[0] ?? "";
    const apiRows = [
      ...functionDesign.matchAll(/^\| `([A-Za-z][A-Za-z0-9]+)` \|.*\| `(U-NCUT-[0-9]{3})` \|$/gm),
    ];
    const apiNames = apiRows.map((match) => match[1]);
    expect(apiNames).toHaveLength(22);
    expect(new Set(apiNames).size).toBe(22);
    const apiOwnerCounts = new Map<string, number>();
    for (const row of apiRows) {
      const owner = row[2] ?? "";
      apiOwnerCounts.set(owner, (apiOwnerCounts.get(owner) ?? 0) + 1);
    }
    expect(
      [...apiOwnerCounts.entries()].sort(([left], [right]) => left.localeCompare(right)),
    ).toEqual([
      ...Array.from(
        { length: 12 },
        (_, index) => [`U-NCUT-${String(index + 1).padStart(3, "0")}`, 1] as [string, number],
      ),
      ["U-NCUT-013", 4],
      ["U-NCUT-014", 4],
      ["U-NCUT-015", 2],
    ]);
    expect([...currentUnitIds].filter((id) => id.startsWith("U-NCUT-")).sort()).toEqual(
      Array.from({ length: 15 }, (_, index) => `U-NCUT-${String(index + 1).padStart(3, "0")}`),
    );
    expect([...currentIntegrationIds].filter((id) => id.startsWith("IT-NCUT-")).sort()).toEqual(
      Array.from({ length: 13 }, (_, index) => `IT-NCUT-${String(index + 1).padStart(3, "0")}`),
    );

    const fullFunctionDesign = readFileSync(
      "docs/design/helix/L6-function-design/node-runtime-cutover.md",
      "utf8",
    );
    for (const tableName of [
      "runtime_cutover_writer_epochs",
      "runtime_cutover_operations",
      "runtime_cutover_events",
      "runtime_authority_current",
      "runtime_cutover_receipts",
    ]) {
      expect(fullFunctionDesign).toContain(`| \`${tableName}\` |`);
    }
    const requiredContracts = [
      "RuntimeAuthorityStoreCapabilityV1",
      "readonly transaction_store: RuntimeAuthorityTransactionStoreV1",
      "UNIQUE=`(operation_id,receipt_kind)`",
    ];
    const missingRequiredContracts = (content: string) =>
      requiredContracts.filter((contract) => !content.includes(contract));
    expect(missingRequiredContracts(fullFunctionDesign)).toEqual([]);
    const interfaceBlock = (content: string, name: string) =>
      content.match(new RegExp(`interface ${name} \\{[^\\n]+\\}`))?.[0] ?? "";
    const scopedInterfaceContracts: Record<string, string[]> = {
      CutoverStateV1: [
        '"activated_monitoring" | "reconcile_required" | "terminal"',
        '"rollback_required" | "rollback_approved" | "rolling_back" | "rolled_back"',
      ],
      RuntimeCutoverOperationV1: [
        "writer_epoch: number | null; lease_id: string | null; fence_token: string | null",
        '"rollback_required" | "rollback_approved" | "rolling_back" | "rolled_back"',
      ],
      RuntimeAuthorityProjectionV1: [
        'phase: "bun_active" | RuntimeCutoverOperationV1["phase"]',
        "activation_receipt_digest: string | null; terminal_receipt_digest: string | null",
      ],
      RuntimeCutoverEventV1: ['"rollback_approved" | "rollback_committed" | "rollback_reconciled"'],
      NodeCutoverTerminalApprovalV1: ['action: "node_cutover_terminal"'],
      NodeCutoverTerminalBundleV1: [
        "terminal_writer: RuntimeWriterEpochLeaseV1",
        'exact_write_set: ["terminal_event", "authority_projection", "terminal_receipt"]',
        "recovery_checkpoint_digest: string",
      ],
    };
    const missingScopedContracts = (content: string) =>
      Object.entries(scopedInterfaceContracts).flatMap(([name, contracts]) => {
        const block = interfaceBlock(content, name);
        return contracts
          .filter((contract) => !block.includes(contract))
          .map((contract) => `${name}:${contract}`);
      });
    expect(missingScopedContracts(fullFunctionDesign)).toEqual([]);
    expect(
      missingScopedContracts(
        fullFunctionDesign.replace(
          '"activated_monitoring" | "reconcile_required" | "terminal"',
          '"activated_monitoring" | "terminal"',
        ),
      ),
    ).toEqual(['CutoverStateV1:"activated_monitoring" | "reconcile_required" | "terminal"']);
    expect(
      missingScopedContracts(
        fullFunctionDesign.replace(
          "terminal_writer: RuntimeWriterEpochLeaseV1",
          "terminal_writer_removed: unknown",
        ),
      ),
    ).toEqual(["NodeCutoverTerminalBundleV1:terminal_writer: RuntimeWriterEpochLeaseV1"]);
    const unitDesign = readFileSync(
      "docs/test-design/helix/L6-node-runtime-cutover-unit-test-design.md",
      "utf8",
    );
    const unitRows = [
      ...unitDesign.matchAll(/^\| `(U-NCUT-[0-9]{3})` \| (.*?) \| .* \| `tests\//gm),
    ];
    const l7ApiOwners = unitRows.flatMap((row) => {
      const owner = row[1] ?? "";
      return [...(row[2] ?? "").matchAll(/`([A-Za-z][A-Za-z0-9]+)`/g)].map(
        (api) => [api[1] ?? "", owner] as [string, string],
      );
    });
    const sortedApiOwners = (entries: [string, string][]) =>
      entries.sort(
        ([leftApi, leftOwner], [rightApi, rightOwner]) =>
          leftApi.localeCompare(rightApi) || leftOwner.localeCompare(rightOwner),
      );
    expect(sortedApiOwners(l7ApiOwners)).toEqual(
      sortedApiOwners(apiRows.map((row) => [row[1] ?? "", row[2] ?? ""])),
    );

    const l6TraceSection = fullFunctionDesign.split("## §5 双方向trace", 2)[1] ?? "";
    const l6TraceRows = [
      ...l6TraceSection.matchAll(/^\| (.*?) \| `(U-NCUT-[0-9]{3})` \| (.*?) \| .* \|$/gm),
    ];
    const l6ApiOwners = l6TraceRows.flatMap((row) =>
      [...(row[1] ?? "").matchAll(/`([A-Za-z][A-Za-z0-9]+)`/g)].map(
        (api) => [api[1] ?? "", row[2] ?? ""] as [string, string],
      ),
    );
    expect(sortedApiOwners(l6ApiOwners)).toEqual(
      sortedApiOwners(apiRows.map((row) => [row[1] ?? "", row[2] ?? ""])),
    );
    const l6UnitIntegrationTrace = Object.fromEntries(
      Array.from({ length: 15 }, (_, index) => {
        const unit = `U-NCUT-${String(index + 1).padStart(3, "0")}`;
        return [
          unit,
          [
            ...new Set(
              l6TraceRows
                .filter((row) => row[2] === unit)
                .flatMap((row) =>
                  [...(row[3] ?? "").matchAll(/`(IT-NCUT-[0-9]{3})`/g)].map(
                    (integration) => integration[1] ?? "",
                  ),
                ),
            ),
          ].sort(),
        ];
      }),
    );

    const traceSection = unitDesign.split("## §1 逆引きtrace", 2)[1] ?? "";
    const actualUnitIntegrationTrace = Object.fromEntries(
      [...traceSection.matchAll(/^\| `(U-NCUT-[0-9]{3})` \|.*?\| (.*?) \|/gm)].map((row) => [
        row[1] ?? "",
        [...(row[2] ?? "").matchAll(/`(IT-NCUT-[0-9]{3})`/g)].map(
          (integration) => integration[1] ?? "",
        ),
      ]),
    );
    expect(actualUnitIntegrationTrace).toEqual({
      "U-NCUT-001": ["IT-NCUT-009"],
      "U-NCUT-002": ["IT-NCUT-009"],
      "U-NCUT-003": ["IT-NCUT-009", "IT-NCUT-010"],
      "U-NCUT-004": ["IT-NCUT-009", "IT-NCUT-010"],
      "U-NCUT-005": ["IT-NCUT-009", "IT-NCUT-010"],
      "U-NCUT-006": ["IT-NCUT-001", "IT-NCUT-002"],
      "U-NCUT-007": ["IT-NCUT-001"],
      "U-NCUT-008": ["IT-NCUT-003", "IT-NCUT-006"],
      "U-NCUT-009": ["IT-NCUT-004", "IT-NCUT-008"],
      "U-NCUT-010": ["IT-NCUT-004", "IT-NCUT-008"],
      "U-NCUT-011": ["IT-NCUT-001", "IT-NCUT-002", "IT-NCUT-003", "IT-NCUT-004", "IT-NCUT-005"],
      "U-NCUT-012": ["IT-NCUT-006", "IT-NCUT-007", "IT-NCUT-008", "IT-NCUT-009", "IT-NCUT-010"],
      "U-NCUT-013": ["IT-NCUT-011"],
      "U-NCUT-014": ["IT-NCUT-012"],
      "U-NCUT-015": ["IT-NCUT-013"],
    });
    expect(l6UnitIntegrationTrace).toEqual(actualUnitIntegrationTrace);
    expect([...new Set(Object.values(actualUnitIntegrationTrace).flat())].sort()).toEqual(
      Array.from({ length: 13 }, (_, index) => `IT-NCUT-${String(index + 1).padStart(3, "0")}`),
    );

    const exactTableRows = [
      "| `runtime_cutover_writer_epochs` | `RuntimeWriterEpochLeaseV1` | PK=`(scope,writer_epoch)`、`writer_epoch`単調増加、PARTIAL UNIQUE=`scope WHERE released_at IS NULL`、active lease/fence exactly one、released後write禁止 |",
      "| `runtime_cutover_operations` | `RuntimeCutoverOperationV1` | PK=`operation_id`、operation digest immutable、phaseは上記unionの許可遷移だけ。approval/plan中はepoch/lease/fence/checkpoint null、epoch取得後は全てnon-nullでwriter表へexact join |",
      "| `runtime_cutover_events` | `RuntimeCutoverEventV1` | PK=`event_id`、UNIQUE=`(operation_id,sequence)`、previous digestは直前event、operationへFK |",
      "| `runtime_authority_current` | `RuntimeAuthorityProjectionV1` | PK=`authority_id`かつ`control-plane` singleton。初期Bun authorityはphase=`bun_active`、writer_epoch=0、event/activation/terminal digest null。Node CAS後だけactivation digest必須 |",
      "| `runtime_cutover_receipts` | `RuntimeCutoverReceiptRowV1` | PK=`receipt_id`、UNIQUE=`(operation_id,receipt_kind)`、operationへFK、append-only、terminalはactivation receiptを上書き禁止 |",
    ];
    const parsedTableRows = (content: string) => {
      const section = content.split("5表のexact constraintは次を正本とする。", 2)[1] ?? "";
      return [...section.matchAll(/^\| `runtime_[^`]+` \| `[^`]+` \| .* \|$/gm)].map(
        (match) => match[0],
      );
    };
    const missingOrExtraTableRows = (content: string) => ({
      missing: exactTableRows.filter((row) => !parsedTableRows(content).includes(row)),
      extra: parsedTableRows(content).filter((row) => !exactTableRows.includes(row)),
    });
    expect(parsedTableRows(fullFunctionDesign)).toEqual(exactTableRows);
    expect(
      missingOrExtraTableRows(fullFunctionDesign.replace(exactTableRows[0] ?? "", "")),
    ).toEqual({ missing: [exactTableRows[0]], extra: [] });
    expect(
      missingOrExtraTableRows(
        fullFunctionDesign.replace(
          exactTableRows[4] ?? "",
          `${exactTableRows[4]}\n| \`runtime_cutover_shadow\` | \`ShadowV1\` | PK=\`shadow_id\` |`,
        ),
      ),
    ).toEqual({
      missing: [],
      extra: ["| `runtime_cutover_shadow` | `ShadowV1` | PK=`shadow_id` |"],
    });
    const integrationDesign = readFileSync(
      "docs/test-design/helix/L5-node-runtime-cutover-integration-test-design.md",
      "utf8",
    );
    const integrationRows = [
      ...integrationDesign.matchAll(/^\| `(IT-NCUT-[0-9]{3})` \| .* \| `tests\//gm),
    ].map((row) => row[1] ?? "");
    expect(integrationRows).toEqual(
      Array.from({ length: 13 }, (_, index) => `IT-NCUT-${String(index + 1).padStart(3, "0")}`),
    );
    const hstRows = (
      content: string,
      order: "api-first" | "unit-first" | "integration-first",
    ): string[][] => {
      const section = content.split("canonical assertion primary表", 2)[1] ?? "";
      return [...section.matchAll(/^\| `(HST-CASE-013-[0-9]{2})` \| (.*?) \|$/gm)].map((row) => {
        const cells = (row[2] ?? "").split(" | ").map((cell) => cell.replaceAll("`", ""));
        if (order === "api-first") return [row[1] ?? "", ...cells];
        if (order === "unit-first") {
          const [unit, api, integration, pre, expected, failure] = cells;
          return [
            row[1] ?? "",
            api ?? "",
            unit ?? "",
            integration ?? "",
            pre ?? "",
            expected ?? "",
            failure ?? "",
          ];
        }
        const [integration, unit, pre, expected, failure] = cells;
        return [
          row[1] ?? "",
          "",
          unit ?? "",
          integration ?? "",
          pre ?? "",
          expected ?? "",
          failure ?? "",
        ];
      });
    };
    const l5DetailDesign = readFileSync(
      "docs/design/helix/L5-detail/node-runtime-cutover.md",
      "utf8",
    );
    const canonicalHstRows = hstRows(fullFunctionDesign, "api-first");
    const expectedHstIds = Array.from(
      { length: 11 },
      (_, index) => `HST-CASE-013-${String(index + 1).padStart(2, "0")}`,
    );
    expect(canonicalHstRows).toHaveLength(11);
    expect(canonicalHstRows.map((row) => row[0])).toEqual(expectedHstIds);
    const unitHstRows = hstRows(unitDesign, "unit-first");
    const detailHstRows = hstRows(l5DetailDesign, "integration-first");
    const integrationHstRows = hstRows(integrationDesign, "integration-first");
    for (const rows of [unitHstRows, detailHstRows, integrationHstRows]) {
      expect(rows).toHaveLength(11);
      expect(rows.map((row) => row[0])).toEqual(expectedHstIds);
    }
    expect(unitHstRows).toEqual(canonicalHstRows);
    const projectWithoutApi = (rows: string[][]) =>
      rows.map(([hst, _api, unit, integration, pre, expected, failure]) => [
        hst,
        unit,
        integration,
        pre,
        expected,
        failure,
      ]);
    expect(projectWithoutApi(detailHstRows)).toEqual(projectWithoutApi(canonicalHstRows));
    expect(projectWithoutApi(integrationHstRows)).toEqual(projectWithoutApi(canonicalHstRows));
    expect(
      projectWithoutApi(
        hstRows(
          integrationDesign.replace(
            "`activated_monitoring` | `verified`",
            "`activated_monitoring` | `failed`",
          ),
          "integration-first",
        ),
      ),
    ).not.toEqual(projectWithoutApi(canonicalHstRows));
    const extraHstRow =
      "| `HST-CASE-013-12` | `IT-NCUT-012` | `U-NCUT-014` | `assertion_input_ready` | `assertion_pass` | `HIL_BUN_CUTOVER_INCOMPLETE` |";
    const integrationWithExtraHst = integrationDesign.replace(
      "| `HST-CASE-013-11` | `IT-NCUT-012` | `U-NCUT-014` | `assertion_input_ready` | `assertion_pass` | `HIL_BUN_CUTOVER_INCOMPLETE` |",
      "| `HST-CASE-013-11` | `IT-NCUT-012` | `U-NCUT-014` | `assertion_input_ready` | `assertion_pass` | `HIL_BUN_CUTOVER_INCOMPLETE` |\n" +
        extraHstRow,
    );
    expect(hstRows(integrationWithExtraHst, "integration-first")).toHaveLength(12);
    expect(hstRows(integrationWithExtraHst, "integration-first").map((row) => row[0])).not.toEqual(
      expectedHstIds,
    );
    expect(unitDesign).toContain(
      "bootstrap adapter missing／unverified／digest tamper／write-set混入",
    );
    expect(integrationDesign).toContain("新terminal writer epoch/lease/fenceとterminal approval");
  });

  it("HDS-HIL-09Aのexact-2 all-ref authority契約を固定する", () => {
    const l1Path = "docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md";
    const l1 = readFileSync(l1Path, "utf8");
    const l3 = readFileSync(
      "docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md",
      "utf8",
    );
    const l5 = readFileSync("docs/design/helix/L5-detail/source-capability-capture.md", "utf8");
    const l6 = readFileSync(
      "docs/design/helix/L6-function-design/source-capability-capture.md",
      "utf8",
    );
    const unit = readFileSync(
      "docs/test-design/helix/L6-source-capability-capture-unit-test-design.md",
      "utf8",
    );
    const integration = readFileSync(
      "docs/test-design/helix/L5-source-capability-capture-integration-test-design.md",
      "utf8",
    );
    const governance = readFileSync(
      "docs/governance/infinity-loop-source-snapshot-manifest.md",
      "utf8",
    );
    const sliceRegistry = readFileSync(
      "docs/governance/infinity-loop-design-slice-registry.md",
      "utf8",
    );
    const atomizationL6 = readFileSync(
      "docs/design/helix/L6-function-design/source-capability-atomization-closure.md",
      "utf8",
    );
    const atomizationUnit = readFileSync(
      "docs/test-design/helix/L6-source-capability-atomization-closure-unit-test-design.md",
      "utf8",
    );
    const atomizationIntegration = readFileSync(
      "docs/test-design/helix/L5-source-capability-atomization-closure-integration-test-design.md",
      "utf8",
    );

    const apiSection = l6.split("### §1.1", 1)[0] ?? "";
    const apiNames = [...apiSection.matchAll(/^\| `([A-Za-z][A-Za-z0-9]+)` \|/gm)].map(
      (match) => match[1] ?? "",
    );
    expect(apiNames).toEqual([
      "canonicalizeSourceCaptureRequest",
      "deriveSourceSnapshotId",
      "probeSourceAdapter",
      "enumerateSourceEntries",
      "deriveGitOverlay",
      "observeAdvertisedGitRefs",
      "materializeAndVerifyGitRefClosure",
      "commitGitRefAuthority",
      "classifySourceEntry",
      "renderSourceCaptureBundle",
      "planSourceCapture",
      "commitSourceCapture",
      "verifySourceCapture",
      "activateSourceSnapshot",
      "markSourceSnapshotStale",
      "resolveSourceCaptureAuthority",
      "reconcileSourceCaptureProjection",
    ]);

    const exactIds = (content: string, pattern: RegExp) =>
      [...new Set([...content.matchAll(pattern)].map((match) => match[0]))].sort();
    expect(exactIds(unit, /\bU-SCAP-[0-9]{3}\b/g)).toEqual(
      Array.from({ length: 31 }, (_, index) => `U-SCAP-${String(index + 1).padStart(3, "0")}`),
    );
    expect(exactIds(integration, /\bIT-SCAP-[0-9]{3}\b/g)).toEqual(
      Array.from({ length: 13 }, (_, index) => `IT-SCAP-${String(index + 1).padStart(3, "0")}`),
    );

    const requiredAcrossLayers = [
      "unison-ai-product/UT-TDD_AGENT-HARNESS",
      "RetryYN/ai-dev-kit-vscode",
    ];
    for (const content of [l1, l3, l5, l6, governance]) {
      for (const required of requiredAcrossLayers) {
        expect(content).toContain(required);
      }
    }
    const registryRows = sliceRegistry
      .split("\n")
      .filter((line) => /^\| HDS-HIL-[0-9]+[A-Z]? \|/.test(line));
    expect(registryRows).toHaveLength(19);
    expect(registryRows.filter((line) => line.includes("strict GREEN"))).toHaveLength(19);
    expect(registryRows.find((line) => line.startsWith("| HDS-HIL-09A |"))).toContain(
      "all-ref authority／consumer cascade／shared lifecycle rebuild",
    );
    for (const namespace of ["refs/heads/*", "refs/tags/*", "refs/pull/*/{head,merge}"]) {
      expect(l1).toContain(namespace);
      expect(governance).toContain(namespace);
    }

    const requiredTypedEvidence = [
      "GitAdvertisementExcludedEvidenceV1",
      "GitAdvertisementEqualityReceiptV1",
      "GitQuarantineMaterializationReceiptV1",
      "GitVerifiedClosureManifestV1",
      "GitSealReceiptV1",
      "GitAuthorityMembershipProofV1",
      "GitAuthorityStalePropagationReceiptV1",
      "GitAuthorityDependencyStaleTransitionV1",
      "GitAuthorityDependencyRegistrationV1",
      "GitAuthorityDependencyRetirementV1",
      "SourceSnapshotActivationArtifactV1",
      "SourceActivationArtifactStoreV1",
      "expected_retirement_count: 0 | 2 | 6",
      "AtomizationCascadeStaleTransitionV1",
      "CoverageCascadeStaleTransitionV1",
      "expected_consumer_transition_count: 0 | 2",
      "SourceGenerationLifecycleArtifactStoreV1",
      '"consumer_stale_projection"',
      "stale_event: AtomizationEventV1",
      "stale_projection: AtomizationProjectionV1",
      "after_active_pointer: AtomizationActivePointerV1",
      "stale_receipt_revision: AtomizationCoverageStatusRevisionV1",
      "after_current_pointer: AtomizationCoverageCurrentPointerV1",
      '"source_generation_lifecycle_append"',
      "lifecycle_entry_digest",
      "git_authority_dependencies",
      "SealedGitMirrorReadPortV1",
      'network_capability: "absent"',
      "unique_entry_set_digest",
      "SourceDenominatorSetV1",
      "SourceRefEntryEdgeV1",
      "exact_denominator_match: true",
      '"HSCAP_SEALED_BUNDLE_TAMPERED"',
      '"HSCAP_OFFLINE_NETWORK_ATTEMPT"',
      '"HIL_PYTHON_AUTHORITY_BYPASS"',
    ];
    expect(requiredTypedEvidence.filter((value) => !l6.includes(value))).toEqual([]);
    expect(
      requiredTypedEvidence.filter(
        (value) => !l6.replaceAll("GitSealReceiptV1", "GitSealReceiptRemovedV1").includes(value),
      ),
    ).toEqual(["GitSealReceiptV1"]);
    for (const contract of [
      "AtomizationAuthorityDependencyRegistrationV1",
      "AtomizationAuthorityDependencySupersessionV1",
      "AtomizationCommitArtifactV1",
      "AtomizationCommitArtifactReceiptV1",
      "AtomizationCommitArtifactStoreV1",
      "listBySnapshotRevisionOrder",
      "PriorSnapshotStaleLineageV1",
      "SnapshotInitialAtomizationCommitBundleV1",
      "SameSnapshotRevisionAtomizationCommitBundleV1",
      "GenesisSnapshotInitialAtomizationCommitArtifactV1",
      "PriorSnapshotInitialAtomizationCommitArtifactV1",
      "SameSnapshotRevisionAtomizationCommitArtifactV1",
      "GenesisSnapshotInitialAtomizationCommitReceiptV1",
      "PriorSnapshotInitialAtomizationCommitReceiptV1",
      "SameSnapshotRevisionAtomizationCommitReceiptV1",
      'generation_mode: "snapshot-initial"',
      'generation_mode: "same-snapshot-revision"',
      'lineage_mode: "genesis"',
      'lineage_mode: "prior-snapshot"',
      "SourceGenerationLifecycleArtifactStoreV1",
      '"source_generation_lifecycle_append"',
      "lifecycle_entry_digest",
      "listByLifecycleOrder",
      "authority_dependency_registrations: readonly [SnapshotInitialAtomizationRegistrationV1",
      "authority_dependency_registrations: readonly [SameSnapshotRevisionAtomizationRegistrationV1",
      "expected_supersession_count: 0",
      "expected_supersession_count: 4",
      '"authority_dependency_registration"',
      "git_authority_receipt_set_digest",
    ]) {
      expect(atomizationL6).toContain(contract);
    }
    expect(atomizationL6).not.toContain("AtomizationSourceGenerationLifecycle");
    for (const sharedDeclaration of [
      "SourceGenerationLifecycleFailureV1",
      "SourceGenerationLifecycleResultV1",
      "SourceGenerationLifecycleEntryV1",
      "SourceGenerationLifecycleArtifactStoreV1",
    ]) {
      const captureLine = l6
        .split("\n")
        .find((line) => new RegExp(`^(?:interface|type) ${sharedDeclaration}\\b`).test(line));
      const atomizationLine = atomizationL6
        .split("\n")
        .find((line) => new RegExp(`^(?:interface|type) ${sharedDeclaration}\\b`).test(line));
      expect(atomizationLine).toBe(captureLine);
    }
    for (const contract of [
      "S1 activation→S1 initial→S1 revision→S2 activation→S2 initial→S2 revision後DB wipe",
      "entryなしDB current",
      "per-snapshot grouped replay",
    ]) {
      expect(atomizationUnit).toContain(contract);
    }
    for (const contract of [
      "S1 activation→S1 genesis initial(0/null)→S1 revision(4)→S2 activation(S1 latest4 stale)→S2 prior-snapshot initial(0＋non-null stale lineage)→S2 revision(4/null)",
      "S1 rev1 superseded、S1 rev2 stale、S2 rev1 superseded、S2 rev2だけexact4 current",
      "index/lifecycle/journal/projection/pointer/receipt",
      "rebuild前後exact",
    ]) {
      expect(atomizationIntegration).toContain(contract);
    }

    const requirementLedger = readFileSync(
      "docs/governance/infinity-loop-requirement-definition-ledger.md",
      "utf8",
    );
    for (const [requirementId, lineNumber] of [
      ["HIL-BR-14", 59],
      ["HIL-FR-16", 91],
      ["HIL-FR-21", 96],
    ] as const) {
      const sourceLine = l1.split("\n")[lineNumber - 1] ?? "";
      const text = sourceLine.match(/^\| \*\*[^|]+\*\* \| (.*) \|$/)?.[1] ?? "";
      const ledgerLine = requirementLedger
        .split("\n")
        .find((line) => line.startsWith(`| ${requirementId} |`));
      const ledgerDigest = ledgerLine?.match(/`(sha256:[0-9a-f]{64})`/)?.[1];
      expect(ledgerDigest).toBe(sha256(text));
      expect(ledgerLine?.split("|")[2]?.trim()).toBe("2");
    }
    expect(l6).toContain("| `HST-CASE-011-03` | `commitGitRefAuthority` | `U-SCAP-031` |");
    expect(unit).toContain("| `HST-CASE-011-03` | `U-SCAP-031` |");
    expect(integration).toContain("| `HST-CASE-011-03` | `IT-SCAP-013` |");
  });
});
