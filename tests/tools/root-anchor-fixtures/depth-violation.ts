// U-CLIBUNDLE-001 の fixture（PLAN-RECOVERY-39）。実行されることはない。
//
// repoRoot から 3 階層下に在り、かつ `import.meta.url` を使う module。
// ROOT anchor は「2 階層下」という単一の深さしか表現できないため、この深さの module が
// bundle の import graph へ入ると無音で ROOT を誤る。`assertRootAnchorCompatible` が
// これを build 時に拒否することを固定するために存在する。
export const FIXTURE_URL = import.meta.url;
