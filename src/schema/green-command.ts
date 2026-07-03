export const GREEN_COMMAND_KINDS = [
  "unit_test",
  "integration_test",
  "typecheck",
  "lint",
  "doctor",
  "vmodel_lint",
  "smoke",
] as const;

export const GREEN_COMMAND_RUNNERS = ["bun", "powershell", "bash", "ci"] as const;

export const GREEN_COMMAND_SCOPES = ["full", "targeted", "changed-files", "gate"] as const;

export type GreenCommandKind = (typeof GREEN_COMMAND_KINDS)[number];

function normalizedCommand(command: string): string {
  return command.replaceAll("\\", "/").toLowerCase();
}

export function greenCommandMatchesKind(kind: string, command: string): boolean {
  const normalized = normalizedCommand(command);
  if (!normalized.trim()) return false;
  switch (kind) {
    case "unit_test":
      return /\b(?:bunx\s+vitest|vitest|bun\s+(?:run\s+)?(?:test|vitest)|bun\s+test|npm\s+test|pnpm\s+test|yarn\s+test)\b/.test(
        normalized,
      );
    case "integration_test":
      return /\b(?:bunx\s+vitest|vitest|bun\s+(?:run\s+)?(?:test|vitest)|bun\s+test|playwright|testcontainers|integration)\b/.test(
        normalized,
      );
    case "typecheck":
      return /\b(?:typecheck|tsc\s+--noemit|tsc\s+--no-emit)\b/.test(normalized);
    case "lint":
      return /\b(?:lint|biome\s+check|eslint|plan\s+lint)\b/.test(normalized);
    case "doctor":
      return /\bdoctor\b/.test(normalized);
    case "vmodel_lint":
      return /\bvmodel\s+lint\b/.test(normalized);
    case "smoke":
      return /\S/.test(normalized);
    default:
      return false;
  }
}
