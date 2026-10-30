# WR226 OS017 workflow-resume residual evidence

status: scaffold research evidence; L4/L9 candidate only
base: `280d5c8dc854e5100be6ed21188d5ebd13f5abd8` (origin/main, PR #3966 included)
binding: `SCF-B-0194`

## Scope and result

対象はOS017 L7 `/cases/57,59,61,63,65,67,69,71,73,108,109,110,111,112,113,114,115,116,117,127` のraw `given_input_ref` graph、承認済みL3/L10 OS017 row、L4比較tableとdiagnostic契約散文である。r3 blind artifactはIssue #3510 comment 6532230602に固定されたSHA-256 `fe7e00049ecaa89b8c36839abe7b29feb17a860ab5b3bddba32c0f26bb44e7f3` と同一バイトで保全した。

導出はr1の誤りを隠さず記録する。r1はcase57のdependency.source_ref=nullを全例へ誤適用した。rootの指摘後、r2で各caseのgraphを個別解決し、r3に根拠pointerとhashを圧縮した。case57だけがnullで、case63を含む他19件のdependency.source_refは`DEP-RECEIPT-A`。r1/r2/r3 SHAと訂正内容は`comparison.json`に記録した。

L4散文とraw graphから各行でworkflow facet unknown、phase `resume`、finding `source_unresolved`、return owner `ticket-workflow-owner`が一致する。同じraw null leaf objectは57/109、59/110、61/111の3組だけで共有され、case-level logical finding pointerはそれぞれ異なる。残る14ケースのnull leaf pointerは重複しない。case73のL4 algorithm/8はactual process.backflow_refを読まず、intermediateとcontextのBACKFLOW-A同士を比較するため、algorithm/3 findingとのdedupも起きない。root再検収でcase73の比較対象を訂正し、20件すべてのraw leaf pointerを原L7 sourceから再照合した結果と訂正履歴をcomparison.jsonに記録した。blind r3は変更していない。

L7 expectedを固定後に照合すると、20行すべてがcondition `workflow_material_unknown`、phase `resume`、workflow facet `unknown`、ordered code `[source_unresolved]`と一致する。L8/L9もcompact expectedとphase/conditionが一致し、F02 primary requirementを示す。L4 algorithm/2のunknown operand処理を共有する18件だけ、既存class `OS017-NEG-workflow-resume-source_unresolved`の拡張候補とした。L4 conditionには一般化した意味、caller前提、overlay/dedup境界、別class境界だけを置き、個別case番号や検算過程は含めない。comparison.jsonには各caseのcaller rule、前提、algorithm/0 binding overlayの同operand/dedup区別、algorithm/4で抑止される後続finding、case73のactual/context/intermediate別pointerを記録した。algorithm/6 dependency.state closed-set専用規則のcase108と、algorithm/5 boolean selector専用規則のcase127は同codeでも同classとせず、残件にした。L9候補参照は65から83行、既存class参照は2から20行となる。L9 expected値・実行状態・formal class membershipは変更していない。

## Requirement attribution and authority boundary

許可されたL3/L10 rowと既存L4 source-class mappingの範囲で、20行の帰属候補は`HELIXOS-L3-017-F02`で一致する。新しい要求意味は作らない。L7/L8/L9はnot_executed/not_observedのまま。これは静的候補証拠であり、正式negative class登録、実behavior、4-way PASS、完了ではない。

## Legacy source and retained change

旧資産`LEGACY-ASSET-3A15E5645D2D2A59DFF5`の`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/execution-ticket-requirements.md` §3/§5はcanonical requirement/design/ticketとassignment/attempt/measurementの区別、source/owner lineageを記録する。本候補はその区別を保ちつつ、raw evidenceをrevision・graph pointer・候補classへ結び付ける現在のJSON表現を使う。旧資産`LEGACY-ASSET-A127DEC3EEE6ED63CF17`の`archive/legacy-generation-2026-09-14/root/docs/governance/predecessor-harness-full-weakness-audit-2026-07-20.md` UTW-005はPR trace/review evidenceが最新HEAD/merge-baseへ再束縛されない失敗を記録している。本証跡はorigin/mainを明示同定し、source pinsと履歴を記録する。旧CLI/runtimeや旧schemaは実行・移植しない。

## Verification and limits

`comparison.json`は各caseのgiven-input root hash、解決したleaf pointer/value、L7/L8/L9期待比較、L4候補参照を保持する。WR220 validatorは従来の2 witness検査に加えてこの20件を明示分岐で検査し、WR204 validatorは既存51 input witness、12 role witness、cross-facet reuse、L9 217 expected digest検査を維持したまま新規参照を許容する。実行結果は`verification-summary.json`に保存し、WR220/WR204 validator、scfctl validate（180 binding、fail=0）、scfctl stale（0 stale）を確認した。

L4/L5 algorithm、旧runtime/test/CIは実行していない。4-layer checkerは本候補の成立根拠として扱わない。
