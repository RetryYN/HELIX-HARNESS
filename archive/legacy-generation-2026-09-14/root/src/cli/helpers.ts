export function packetFreshnessLine(packet: {
  sourceCommand: string;
  generatedAt: string;
  freshness: { validForMinutes: number; expiresAt: string; stale: boolean };
}): string {
  return `  packet-freshness: source=${packet.sourceCommand} generatedAt=${packet.generatedAt} validForMinutes=${packet.freshness.validForMinutes} expiresAt=${packet.freshness.expiresAt} stale=${packet.freshness.stale}\n`;
}

export function verificationSourceLines(
  rows: Array<{
    phase: string;
    command?: string;
    writePolicy?: string;
    source?: string;
    sourceUrl?: string;
    sourceCheckedAt?: string;
    latestOfficialStatus?: string;
    sourceStatusDelta?: string;
    adoptionDecision?: string;
    adoptionDecisionDelta?: string;
    workflowRouteImpact?: string;
  }>,
): string {
  return rows
    .map(
      (row) =>
        `  verification-source: ${row.phase} source=${row.source ?? "-"} sourceUrl=${row.sourceUrl ?? "-"} checked=${row.sourceCheckedAt ?? "-"} status=${row.latestOfficialStatus ?? "-"} statusDelta=${row.sourceStatusDelta ?? "-"} adoption=${row.adoptionDecision ?? "-"} adoptionDelta=${row.adoptionDecisionDelta ?? "-"} routeImpact=${row.workflowRouteImpact ?? "-"} writePolicy=${row.writePolicy ?? "-"} command=${row.command ?? "-"}\n`,
    )
    .join("");
}

export function writeRecordTemplates(
  templates: Array<{
    recordName: string;
    insertionHintJa?: string;
    yamlLines: string[];
    yamlLinesJa?: string[];
  }>,
  indent = "    ",
): void {
  for (const template of templates) {
    process.stdout.write(`${indent}record-template ${template.recordName}:\n`);
    if (template.insertionHintJa) {
      process.stdout.write(`${indent}  record-template-hint-ja: ${template.insertionHintJa}\n`);
    }
    for (const line of template.yamlLines) {
      process.stdout.write(`${indent}  ${line}\n`);
    }
    if (template.yamlLinesJa && template.yamlLinesJa.length > 0) {
      process.stdout.write(`${indent}  record-template-ja:\n`);
      for (const line of template.yamlLinesJa) {
        process.stdout.write(`${indent}    ${line}\n`);
      }
    }
  }
}
