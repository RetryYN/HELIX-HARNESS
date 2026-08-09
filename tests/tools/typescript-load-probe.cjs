// PLAN-RECOVERY-40 / U-TSLAZY-001 の観測子。
//
// `node --require <this> <cli bundle> --version` として使う。**検査対象そのものの process**
// （bundle 実起動）の CJS require cache を、終了直前に直接覗く。別 process で単体 module を
// import して代用すると「CLI 経路で load しない」を検証したことにならない。
//
// stdout は CLI 出力の assert に使うため汚さず、結果は HELIX_TS_PROBE_OUT のファイルへ書く。
// process.exit で終了しても "exit" は発火するため、CLI が自前 exit しても観測できる。
const fs = require("node:fs");

const outPath = process.env.HELIX_TS_PROBE_OUT;
if (!outPath) {
  throw new Error("HELIX_TS_PROBE_OUT is required by typescript-load-probe");
}

// resolve は cache へ載せない（load はしない）。解決できなければ観測不能として fail-close する。
const typescriptEntry = require.resolve("typescript");

process.on("exit", () => {
  fs.writeFileSync(outPath, String(Object.hasOwn(require.cache, typescriptEntry)));
});
