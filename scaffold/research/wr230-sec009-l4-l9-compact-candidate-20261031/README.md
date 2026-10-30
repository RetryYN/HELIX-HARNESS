# WR230 SEC009 L4/L9 移行候補の研究証拠

この候補は研究用 scaffold であり、source revision `c8f20a4f91456f6d5e5c16e1be0083c34aab6651` に固定する。7つの source path、SHA-256、JSON Pointer は `compact-candidate.json` に記録し、[SCF-B-0196](../../bindings/SCF-B-0196.json) の upstream はすべて `scaffold/` 外を指す。

候補は case ID、期待値、phase、trigger、owner 値を複製せず、30 class の L4 taxonomy pointer と既存 L9 assignment pointer を保持する。単純な positive 8件、曖昧な単一契約 negative 2件、複数契約 positive 28件と negative 43件は別の pointer 配列に保ち、source の配列順を復元できる。validator は固定 revision と作業ツリーの source bytes を比較し、356件の ID、phase、trigger、期待値、class finding と typed owner を再解決する。集計結果は `verification-summary.json` に記録する。

class key は既存 L4/L5 行から QA §3 の6属性を解決する。L5 由来の typed owner は研究上の照合であり、L4/L9 の親リンク、class membership、後続 explicit mode marker の承認を生成しない。275件の対応は既存 L9 assignment に限り、曖昧な2件と複数契約の71件は class 外に残す。

旧資産との対応は L4 の `legacy_comparison` にある `LEGACY-ASSET-D461943347D372ECF6DA` と `LEGACY-ASSET-B62E49D2E156232B8C63`、Issue #3510 と PR #3918・#3925 の割当・残余記録を起点とする。旧 source の条件付き受信側停止・隔離・回復と値を隠した receipt を保持し、旧 runtime の動作は移植しない。複数 finding の受信側 case と共通の旧状態の隔離・回復 case は曖昧なまま、71件の複数契約 case も別に保つ。

静的検証は次のコマンドで行う。

```sh
python3 -B scaffold/research/wr230-sec009-l4-l9-compact-candidate-20261031/validate_compact_candidate.py
```

正式 L4/L9 は編集していない。authority と operation effect は `none`、実装 readiness は `not_ready` のままである。QA §3 は4層同時の marker を求めるため、この L4/L9 候補だけでは explicit negative equivalence や formal four-way の成立を示さない。L5 contract の `function_refs` と checker の単数 `function` の不一致も未解決である。認証・認可設定、credentials、本番、外部操作は対象に含まない。
