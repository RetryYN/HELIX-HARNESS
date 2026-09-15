import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  analyzeRequirementIntakeLifecycle,
  CANONICAL_IR_ACTIVATION_PROBE,
  checkRequirementIntakeLifecycle,
  detectPresentSymbols,
  loadRequirementIntakeLifecycleInput,
  REQUIREMENT_INTAKE_LIFECYCLE,
  requirementIntakeLifecycleMessages,
} from "../src/design/requirement-intake-lifecycle";

/**
 * PLAN-L7-539-lifecycle-fence / HR-FR-DHR-012
 * — 恒久 family 認識と暫定 loader / screen_trace adapter を lifecycle として分離宣言し、
 *   #257（Canonical Design IR）到達後に旧 adapter が残存したら失敗させる。
 *
 * L3 §2.1 の 3 区分（恒久 / 置換可能 / 撤去）を prose ではなく exact inventory で持ち、
 * 「撤去したつもり」と「撤去し忘れ」を機械で区別する。
 */

function symbols(disposition: "permanent" | "replaceable" | "retire"): string[] {
  return REQUIREMENT_INTAKE_LIFECYCLE.entries
    .filter((entry) => entry.disposition === disposition)
    .map((entry) => entry.symbol);
}

describe("requirement intake lifecycle fence (PLAN-L7-539)", () => {
  it("U-DRG-016: #257 未到達では撤去対象が実在し、到達後は残存を fail-close する", () => {
    // 実 repo に対する fence。inventory が現実と乖離したら気づける。
    const input = loadRequirementIntakeLifecycleInput(process.cwd());
    expect(input.present.size).toBeGreaterThan(0);

    // 現状（#257 未到達）: 撤去対象・恒久要素とも実在していること。
    const inactive = analyzeRequirementIntakeLifecycle({ ...input, canonicalIrActive: false });
    expect(inactive.ok).toBe(true);
    expect(inactive.violations).toEqual([]);

    // #257 到達後に旧 adapter が残っていれば失敗する（negative lifecycle test の本体）。
    const active = analyzeRequirementIntakeLifecycle({ ...input, canonicalIrActive: true });
    expect(active.ok).toBe(false);
    expect(active.violations.map((v) => v.reason)).toContain("retire_target_still_present");
    expect(active.violations.map((v) => v.symbol).sort()).toEqual(symbols("retire").sort());
    expect(requirementIntakeLifecycleMessages(active)[0]).toContain("#257");
  });

  it("U-DRG-016b: 恒久要素は #257 到達後も残っていなければならない", () => {
    const input = loadRequirementIntakeLifecycleInput(process.cwd());
    const permanent = symbols("permanent");
    expect(permanent.length).toBeGreaterThan(0);

    // 恒久要素を消した状態は、#257 の到達可否によらず違反になる。
    const present = new Set(input.present);
    for (const symbol of permanent) present.delete(symbol);
    for (const canonicalIrActive of [false, true]) {
      const result = analyzeRequirementIntakeLifecycle({ present, canonicalIrActive });
      expect(result.ok).toBe(false);
      expect(result.violations.map((v) => v.reason)).toContain("permanent_target_missing");
    }
  });

  it("U-DRG-016c: inventory が現実と乖離した状態を silent に通さない", () => {
    // 撤去対象が #257 未到達なのに既に消えている = 予定外の撤去、または inventory の腐り。
    // 「まだ消してはいけないものが消えている」ことを検知する（片側だけの検査にしない）。
    const input = loadRequirementIntakeLifecycleInput(process.cwd());
    const retire = symbols("retire");
    const present = new Set(input.present);
    const removed = retire[0] as string;
    present.delete(removed);

    const result = analyzeRequirementIntakeLifecycle({ present, canonicalIrActive: false });
    expect(result.ok).toBe(false);
    expect(result.violations).toEqual([{ symbol: removed, reason: "retire_target_missing_early" }]);

    // 逆に #257 到達後なら、その撤去は正しい（同じ状態でも判定が変わる）。
    const afterIr = analyzeRequirementIntakeLifecycle({ present, canonicalIrActive: true });
    expect(afterIr.violations.map((v) => v.symbol)).not.toContain(removed);
  });

  it("U-DRG-016d: 実 repo に対する gate が現状 green である", () => {
    const result = checkRequirementIntakeLifecycle(process.cwd());
    expect(result.ok).toBe(true);
    expect(requirementIntakeLifecycleMessages(result)).toEqual([
      "requirement-intake-lifecycle — OK (#257 未到達、撤去対象 4 / 置換可能 1 / 恒久 2 すべて宣言どおり)",
    ]);
  });

  it("U-DRG-016e: 宣言ではない単なる言及を実在に数えない", () => {
    // 言及まで拾うと、撤去済みの symbol が import 行やコメントに残っているだけで
    // 「まだある」と誤判定し、撤去し忘れ検査が空振りする。
    const retire = symbols("retire")[0] as string;
    const path = REQUIREMENT_INTAKE_LIFECYCLE.entries.find((e) => e.symbol === retire)
      ?.path as string;

    const mentionOnly = new Map([
      [path, `// ${retire} は #257 で撤去済み\nimport type { ${retire} } from "./legacy";\n`],
    ]);
    expect(detectPresentSymbols(mentionOnly).has(retire)).toBe(false);

    const declared = new Map([[path, `export function ${retire}() {\n  return null;\n}\n`]]);
    expect(detectPresentSymbols(declared).has(retire)).toBe(true);
  });

  it("U-DRG-016f: activation probe の実在で #257 到達を判定する", () => {
    // probe を常に false へ倒す実装は、現状（probe 不在）では同じ結果になり差が出ない。
    // probe を実際に置いた repo で判定が反転することを固定する。
    const root = mkdtempSync(join(tmpdir(), "helix-lifecycle-"));
    expect(loadRequirementIntakeLifecycleInput(root).canonicalIrActive).toBe(false);

    const probe = join(root, CANONICAL_IR_ACTIVATION_PROBE);
    mkdirSync(dirname(probe), { recursive: true });
    writeFileSync(probe, "export const CANONICAL_IR = true;\n", "utf8");
    expect(loadRequirementIntakeLifecycleInput(root).canonicalIrActive).toBe(true);
  });

  it("U-DRG-016g: 違反は symbol 昇順で全件返す", () => {
    // 先頭 1 件で打ち切ったり順序が不定だと、複数違反時に「どれが直ったか」が読めない。
    const present = new Set<string>();
    const result = analyzeRequirementIntakeLifecycle({ present, canonicalIrActive: false });
    const symbolsInOrder = result.violations.map((v) => v.symbol);
    expect(symbolsInOrder.length).toBeGreaterThan(2);
    expect(symbolsInOrder).toEqual([...symbolsInOrder].sort((a, b) => a.localeCompare(b)));
  });

  it("U-DRG-016h: async 宣言も実在として認識する", () => {
    // 宣言 regex が function 形しか見ないと、async 化しただけで「撤去済み」と誤判定する。
    const retire = symbols("retire")[0] as string;
    const path = REQUIREMENT_INTAKE_LIFECYCLE.entries.find((e) => e.symbol === retire)
      ?.path as string;
    const asyncDeclared = new Map([
      [path, `export async function ${retire}() {\n  return null;\n}\n`],
    ]);
    expect(detectPresentSymbols(asyncDeclared).has(retire)).toBe(true);
  });
});
