/**
 * Kimi 独立レビュー lane の material closure digest（PLAN-RECOVERY-40 / issue #390）。
 *
 * admission が担保したいのは「受け入れ試験を通した実装＝実際に動く実装」の同一性である。
 * 旧実装はこれを `git rev-parse HEAD` の 40 桁 sha へ束縛していたが、この repository は
 * merge commit 方式なので lane PR の head sha は merge 後の main HEAD と決して一致せず、
 * さらに lane と無関係な merge のたびに失効する。担保対象が「実装」ではなく
 * 「repository 全体の commit id」になっていたのが誤りである。
 *
 * 本 module は担保対象を lane 実装そのもの（source closure ＋ provider material）の
 * digest に置き換える。lane closure が 1 byte でも変われば digest が動き、lane と無関係な
 * merge では動かない。closure member の path 一覧自体も manifest に含めるため、member を
 * 削って digest を素通りさせることもできない。
 */
import { readFileSync, statSync } from "node:fs";
import { isAbsolute, join } from "node:path";
import { canonicalJson, type Sha256Digest, sha256Digest } from "./digest";

/**
 * lane の振る舞いを決める source closure。ここに載っていない file の変更は admission を
 * 失効させないため、追加・削除は lane の security 境界の変更として扱う。
 */
export const REVIEW_LANE_CLOSURE_PATHS: readonly string[] = Object.freeze([
  "src/cli/commands/review-fallback.ts",
  "src/runtime/claude-pr-convergence.ts",
  "src/runtime/digest.ts",
  "src/runtime/independent-review-fallback.ts",
  "src/runtime/review-lane-closure.ts",
  "tests/tools/kimi-review-admission/admission-evidence.ts",
  "tests/tools/kimi-review-admission/run-admission-bench.ts",
]);

/**
 * closure に含める provider 側の material。source が同一でも CLI binary や model が入れ替われば
 * 「受け入れ試験を通した lane」と同じ挙動である保証は無いため、freshness key に含める。
 */
export interface ReviewLaneProviderMaterial {
  /**
   * Kimi CLI 実行 binary 全体の digest。version 文字列ではなく binary そのものを見る。
   * version 表示は CLI を起動しないと得られず、かつ同一 version 内の差し替えを捕まえられない。
   */
  readonly cli_binary_digest: Sha256Digest;
  readonly model: string;
}

export interface ReviewLaneClosureMember {
  readonly path: string;
  readonly digest: Sha256Digest;
}

export interface ReviewLaneClosureManifest {
  readonly schema_version: "helix-kimi-review-lane-closure.v1";
  readonly members: readonly ReviewLaneClosureMember[];
  readonly provider: ReviewLaneProviderMaterial;
}

function validProviderMaterial(material: ReviewLaneProviderMaterial): boolean {
  return (
    typeof material.model === "string" &&
    material.model.length > 0 &&
    typeof material.cli_binary_digest === "string" &&
    /^sha256:[a-f0-9]{64}$/u.test(material.cli_binary_digest)
  );
}

/**
 * closure manifest を作る。member が 1 件でも読めない場合は fail-close する
 * （読み飛ばして digest を出すと、消えた member を「変更なし」として通してしまう）。
 */
export function buildReviewLaneClosureManifest(
  repoRoot: string,
  provider: ReviewLaneProviderMaterial,
): ReviewLaneClosureManifest {
  if (!isAbsolute(repoRoot)) throw new Error("review_lane_closure_root_invalid");
  if (!validProviderMaterial(provider)) throw new Error("review_lane_closure_provider_invalid");
  const members = [...REVIEW_LANE_CLOSURE_PATHS]
    .sort((a, b) => (a < b ? -1 : a > b ? 1 : 0))
    .map((path) => {
      const absolute = join(repoRoot, path);
      let stats: ReturnType<typeof statSync>;
      try {
        stats = statSync(absolute);
      } catch (error) {
        // errno を潰さず reject reason へ畳む。不存在と失読を同じ文字列にすると
        // audit で原因を切り分けられなくなる。
        const code = (error as NodeJS.ErrnoException).code ?? "unknown";
        throw new Error(`review_lane_closure_member_missing:${code}`);
      }
      if (!stats.isFile()) throw new Error("review_lane_closure_member_not_regular_file");
      let bytes: Buffer;
      try {
        bytes = readFileSync(absolute);
      } catch (error) {
        const code = (error as NodeJS.ErrnoException).code ?? "unknown";
        throw new Error(`review_lane_closure_member_unreadable:${code}`);
      }
      return Object.freeze({ path, digest: sha256Digest(bytes) });
    });
  return Object.freeze({
    schema_version: "helix-kimi-review-lane-closure.v1" as const,
    members: Object.freeze(members),
    provider: Object.freeze({
      cli_binary_digest: provider.cli_binary_digest,
      model: provider.model,
    }),
  });
}

/** manifest 全体（member path 一覧・各 digest・provider material）の digest。 */
export function digestReviewLaneClosureManifest(manifest: ReviewLaneClosureManifest): Sha256Digest {
  return sha256Digest(canonicalJson(manifest));
}

/**
 * host 上の Kimi CLI binary から provider material を実測する。CLI は起動しない
 * （起動しないと得られない情報に依存させないための binary digest 束縛である）。
 */
export function resolveReviewLaneProviderMaterial(
  kimiExecutablePath: string,
  model: string,
): ReviewLaneProviderMaterial {
  if (!isAbsolute(kimiExecutablePath)) throw new Error("review_lane_closure_provider_invalid");
  let stats: ReturnType<typeof statSync>;
  try {
    stats = statSync(kimiExecutablePath);
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code ?? "unknown";
    throw new Error(`review_lane_closure_provider_binary_missing:${code}`);
  }
  if (!stats.isFile()) throw new Error("review_lane_closure_provider_binary_not_regular_file");
  return Object.freeze({
    cli_binary_digest: sha256Digest(readFileSync(kimiExecutablePath)),
    model,
  });
}

export function computeReviewLaneClosureDigest(
  repoRoot: string,
  provider: ReviewLaneProviderMaterial,
): Sha256Digest {
  return digestReviewLaneClosureManifest(buildReviewLaneClosureManifest(repoRoot, provider));
}
