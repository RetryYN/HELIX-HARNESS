# Grok/Kimi公式OSSから得たHELIX改善候補（2026-07-19）

本書はClaude runtimeがxai-org／MoonshotAI公式リポジトリを調査して抽出した設計入力である。外部実装のbulk importやauthority化は行わず、HELIXのprecedence、ADR-009/010、inventory-firstに従って採否を決める。

## 要件へ追突する6件

1. `worker-runtime-research-2026-07-19`: Claude/Codex以外のworker runtimeを、非authorityの外部AI workerとして接続可能にする。隔離worktree、repository-level bypass禁止、secret作業の委譲禁止を必須とする。
2. delegation adapterをstdout回収だけに閉じず、approval request、tool call、resultをtyped eventとして扱うwire protocol境界を設ける。Nodeが承認とwrite transactionを制御する。
3. one-shot overrideより上位に、repository単位で全bypassを恒久denyするversioned switchを設ける。
4. worker出力はstrict既定のschema validation profileを通し、緩和は明示的かつ証跡付きとする。
5. HELIX-HARNESS-OS配布はcanonical index、generated index、first/third-party区分、免責を持つpackage contractへ降下する。実cutoverはPLAN-M-02のaction-binding approval境界を維持する。
6. grok-buildのworktree払い出し、回収、crash recovery、衝突処理をbehavior atom単位で精読するDiscovery PLANを起票する。

PythonはADR-010の恒久semantic coreであり、本書の外部AI workerと同義ではない。BunはADR-009のtarget authorityではなく、Node cutover terminal receipt前に限る移行時runnerである。
