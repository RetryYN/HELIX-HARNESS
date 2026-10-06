# #2607 review03 correction follow-up — 2026-10-06

## 対象と境界

PR #2607 の正式review comment `5995930243`（対象content HEAD `8c0f2c87d0803d429e5d0c55959d5382a9ac7817`、base `1a7933157fef8327a0e2747348cbe57e596019aa`）に対する作成側追補照合。review本文は `/tmp/pr2607-review03-full.md`、SHA-256 `0bf60d975734818a203412e46057bc3714d1bc01a240ffa2c289ce8f144e316b`。

前記 `l3-l10-intelligence-stage3-review03-correction-2026-10-06.md` とそのJSONは変更していない。この追補では親指示の四群のうち、078 CASE群と指定旧source scopeを読み、001/002/004の旧source再利用説明を原文に沿って限定した。修正対象本文は `docs/helix-intelligence/L3-requirements/functional-requirements.md` の該当する001/002/004 disposition文だけ。PO採択、親scope/identity/authority、L2/L11本文は変更していない。

## 078 CASEの一件単位照合

照合先は固定L2/L11 revision `633bf12ea8f948db8ba3d6600179c4a9507377a7`、L2-078 R-06/R-07/依存closure本文（646–658）、L11-078受入本文（363–382）、現行L10 `functional-verification.md` の各CASE行である。CASEは静的文書上の期待値として確認し、実行結果とは扱わない。

現行表をCASE IDとAC traceで一件ずつ列挙した実数は次のとおり。

- `AC-INTELLIGENCE-L3-078-01` は106件。内訳は11 changed dimensionのnormal 11件、authorityからreleaseまで11 dimensionそれぞれに対するmissing/unknown/stale/mismatchの44件、R-06 delta field 16項目×missing/unknown/staleの48件、invalidation projection/future-type/assumptionの個別missing 3件。
- closureは66件。effective-closure field 19項目それぞれのmissing/unknown/stale 57件とcondition-false 1件がAC-09へ、unknown condition・reference-only・selected omission・unselected-as-success・version fallbackの5件がAC-10へ、same-input/member-divergence/reason-divergenceの3件がAC-08へtraceされる。
- review commentの「078-01の109件」は表の単一AC trace数とは一致しない。現行表では078要件に対する106件のAC-01 traceに、同じ078-08 closure検証のAC-08 trace 3件を加えると109件になるため、照合対象IDを推測で削らず、両集合106件・66件を独立に全件確認した。

個別確認では、dimension名とnormal/negative入力・oracleの対象一致、異常fieldだけをunknown/incompleteに保つこと、既存ownerが明示された場合のみそこへ戻すこと、同一closure入力に対するmember/reasonの再現、R-07 delta再現との混同禁止を確かめた。新owner、未宣言条件、暗黙fallback、別fieldによる相殺、成功への読み替えを要求するCASEは見つからなかった。これはfixture記述と固定L2/L11との静的整合確認であり、実consumerの挙動保証ではない。

## 旧source指定範囲と意味対応

旧資産明細台帳のasset ID・path・source SHAを照合し、指定scopeをread-onlyで読んだ。範囲外行の全通読や旧test/runtimeの起動は行っていない。

- `LEGACY-ASSET-BBD687399574FEE23807`, `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/document-authority-census-acceptance.md:22–54`（全54行）。tracked blobのdigest/inventory revision、authority edge、typed finding、再現性の期待oracleがある。ただしこれは旧test-design（reuse exclusion class `legacy_test_design_or_oracle`）で、oracle自体を現行へ移す根拠にはしない。003/009のsource/provenance概念に限った隣接比較なら現行説明と整合する。
- `LEGACY-ASSET-6FFD7F4E58066D08B053`, `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/universal-workflow-ai-judgment-engine-acceptance.md:15–34`。source filename/version/SHA/inventory binding、source transition双方向trace、facts/candidates/counterevidence、route capability/capacityなどの受入条件がある。現行001/002/004ではこれらの意味要素との比較起点としてのみ使用し、旧AC・14-file inventory・全workflow/compiler/runtimeを移していない。
- `LEGACY-ASSET-901CD182B52024593E41`, `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/bugbot-bounded-repair-acceptance.md:1–30`（全30行）。draft candidateで、未提供scenarioと未実証の限界を明示し、diagnosis/repair proposal/write-set/実consumer境界を列挙する。007/014/015/016で比較対象とされている限定修復とdiagnosis分離の範囲は支持するが、candidateのauthorityやruntime移管の根拠にはならない。
- `LEGACY-ASSET-658FF8439F9F8E694710`, `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/bugbot-generation-acceptance.md:15–42`（全42行）。定型生成のsource/generator/output、scope、consumer、rollback受入期待を含む一方、実行証拠は未採取と明記する。現行007/014等のsource/generator/output/consumer境界を照合する隣接例にはなるが、旧受入oracleやruntimeを再利用する根拠にはならない。
- `LEGACY-ASSET-5EE032D657C221184B00`, `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/universal-workflow-ai-judgment-engine.md:41–63`。001でsource package receipt bindingとstable `source_transition_id` trace、002でrouting source/destinationとcapability/capacity制約、004でfacts/candidates/proposal/confidence/counterevidence/unresolvedの記録が比較可能。固定L2が定めるINTELLIGENCE domain identity/capability構成およびObserved Fact/Derived Interpretation/Hypothesis/Unknownへの変換は別途再導出する。5EE0だけから現在のdomain lifecycle、source-link contract、4値分類を再利用したとは言えない。
- `LEGACY-ASSET-E78B8D68CC327AA00991`, `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/requirement-discovery-json-authority.md:26–90`。stable ID/revision/semantic digest/owner/status、eventからのcandidate projection再構築、evidence/contradiction/deferなどの記録要素は004のtraceability比較起点になる。一方で文書はL3 JSON canonicalization、人間承認・freeze、別requirements lifecycleとtemplate boundaryを含み、これらはINTELLIGENCEの事実分類へ移さない。
- `LEGACY-ASSET-AD746F4F3487103519F9`, `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/requirement-discovery-json-authority-acceptance.md:16–33`。normal oracleと個別拒否mutationを対にする旧test-designで、現行の「4値分類」「fact/evidence trace」を規範的に支えるsourceではない。現行004では旧schema/state/test oracleを移さず、表中のfixture構造を照合するだけと明記した。

## 補正と残件

001/002/004の旧source dispositionを、5EE0/E78Bが実際に述べる項目へ狭めた。旧test-designのBBD6/6FFD/AD74は現行oracleの再利用根拠ではなく、比較・fixture構造照合に限定した。旧sourceには無いdomain意味やINTELLIGENCE ownerを追加していない。

今回の親指示で指定された範囲は静的に照合済み。02D8等指定外sourceの全行通読、未指定sourceの全範囲再監査は今回の範囲外であり、既存追補監査の該当記録を遡及変更していない。旧CLI/hook/runtime/test/CI、Bun、repository CIは起動していない。この追補は作成側の意味照合であり、独立review・L3承認・Finding解消の証拠ではない。
