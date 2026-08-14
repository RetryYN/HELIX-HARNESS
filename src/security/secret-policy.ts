/**
 * secret 様 token の runtime 非依存 policy SSoT。
 *
 * lint / feedback / state-db のいずれにも所有させず、依存方向を
 * 各機能 module -> security の一方向に保つ。
 */
export const SECRET_PATTERN =
  /(\bsk-[A-Za-z0-9_-]{16,}|\bghp_[A-Za-z0-9_]{16,}|\bgithub_pat_[A-Za-z0-9_]{16,}|\bxox[baprs]-[A-Za-z0-9-]{16,})/;

export function isSecretLike(value: string): boolean {
  return SECRET_PATTERN.test(value);
}

export interface SecretScanArtifact {
  path: string;
  text: string;
}

export interface SecretScanViolation {
  path: string;
  line: number;
  marker: string;
}

export interface SecretScanResult {
  checked: number;
  violations: SecretScanViolation[];
  ok: boolean;
}

const SECRET_SCAN_PATTERNS: ReadonlyArray<{ marker: string; pattern: RegExp }> = [
  { marker: "narrow-secret-token", pattern: SECRET_PATTERN },
  { marker: "aws-access-key", pattern: /\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/ },
  { marker: "github-token", pattern: /\b(?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9_]{16,}\b/ },
  { marker: "stripe-live-key", pattern: /\b(?:sk|rk)_live_[A-Za-z0-9]{16,}\b/ },
  { marker: "npm-token", pattern: /\bnpm_[A-Za-z0-9]{20,}\b/ },
  {
    marker: "slack-webhook",
    pattern: /https:\/\/hooks\.slack\.com\/services\/[A-Za-z0-9/_-]{20,}/,
  },
  { marker: "jwt", pattern: /\beyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\b/ },
  { marker: "azure-connection-string", pattern: /\bAccountKey=[A-Za-z0-9+/=]{20,}(?:;|$)/i },
  { marker: "private-key-block", pattern: /-----BEGIN [A-Z ]*PRIVATE KEY-----/ },
  {
    marker: "authorization-bearer",
    pattern: /\bAuthorization\s*:\s*Bearer\s+["']?[A-Za-z0-9._~+/=-]{16,}/i,
  },
  {
    marker: "secret-assignment",
    pattern:
      /\b(?:api[_-]?key|access[_-]?token|client[_-]?secret|password|passwd)\s*[:=]\s*["'`]?[A-Za-z0-9._~+/=-]{12,}/i,
  },
];

const ALLOW_LINE_PATTERN = /(dummy|placeholder|redacted|fixture|not-a-secret|\*\*\*)/i;

export function analyzeSecretScan(
  artifacts: readonly SecretScanArtifact[],
  options: { allowAnnotatedExamples?: boolean } = {},
): SecretScanResult {
  const violations: SecretScanViolation[] = [];
  for (const artifact of artifacts) {
    const lines = artifact.text.split(/\r?\n/);
    for (let i = 0; i < lines.length; i += 1) {
      const line = lines[i];
      if (options.allowAnnotatedExamples !== false && ALLOW_LINE_PATTERN.test(line)) continue;
      for (const { marker, pattern } of SECRET_SCAN_PATTERNS) {
        if (pattern.test(line)) violations.push({ path: artifact.path, line: i + 1, marker });
      }
    }
  }
  return { checked: artifacts.length, violations, ok: violations.length === 0 };
}
