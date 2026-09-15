import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { analyzeEntityCoverage } from "../../src/lint/entity-coverage";

// U-CLIBUNDLE-001 用の ROOT 導出プローブ（PLAN-RECOVERY-39）。
//
// bundle 化した成果物が **どの repo を自分の root と考えるか** を直接観測するための entrypoint。
// 実 CLI / hook の出力から ROOT を読み取ることはできない（ROOT 依存の分岐は、その root に
// 状態ファイルが在るときにしか外から見えない）。そのため間接観測ではなく専用プローブを置く。
//
// 2 つを出力する。
// 1. `root`: 被検査対象と同一の式で導出した repo root。導出式は一致させること。
// 2. `entities`: **実際の ROOT 依存 lint module**（src/lint/entity-coverage）を bundle 越しに
//    走らせた結果。esbuild の define は bundle される全 module の import.meta.url を
//    無差別に置換するため、entry だけでなく依存 module の ROOT 解決も健全であることを、
//    合成値ではなく実 module の実行結果で確かめる。ROOT を誤れば docs を解決できず
//    throw するか件数が変わる。
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");

process.stdout.write(
  `${JSON.stringify({ root: ROOT, entities: analyzeEntityCoverage().primaryEntities.length })}\n`,
);
