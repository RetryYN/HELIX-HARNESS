# HARNESS Stage 2b（012/013）L3/L10確認資料 — 修正候補

本文revision `6c787542372013aa63b9dd8c1ccc6a66f78e0752` は、HARNESS-L2-012/013のL3要件と対のL10総合検証を修正したローカル候補です。対象はこの2親で、Stage 2b全体の完了を意味しません。

修正では、L2-013が要求する要求エンジン部品とCOREを別々の必須入力として扱い、identity・revision・scopeのmissing/unknown/stale/mismatchを個別に照合するACと24通りの単一field変異を追加しました。契約payload/schema/ownerが固定sourceから確定できない場合はunknownのまま保持し、HARNESS-L2-008を親・前提・補完元にしていません。L2-012のDecide後fixtureは、Decideに加えて既存production条件・authorityが別入力で満たされる場合に限る形に改め、不足を一つずつ外す反例を追加しました。NFR-013では「依存名の存在確認」と「source-bound identity/revision/scope照合」の候補を比較し、後者を測定候補に選ぶ根拠と未解決値の扱いを記録しました。

件数はFR 2、AC 8、機能CASE 12、独立BR 0、business CASE 0、NFR候補2、測定CASE2です。54 source pins（bounded span 43件）、現在の行pin28件を再計算しました。固定L2/L11、PO/G0、旧asset ledgerと旧sourceのfull/raw-LF SHAを記録しています。六文書の既存prefix bytesは維持しました。前回revision用のimmutable監査は変更せず保存しました。

作成側の静的確認は `scfctl validate` 147 bindings・fail 0、`stale` 0、`residuals` 0、`govcheck` atoms 7622 / requirements 57 / files 58、`git diff --check` 合格です。旧runtime・CI・test、Bun、実装、L10実行、性能実測は行っていません。

**この修正候補の独立Claude reviewとPO L3承認は未成立です。** このsummaryは承認を求める判断そのものを生成せず、修正後本文revisionと監査を検収・reviewへ渡すための時点記録です。本文commitとこの監査/summaryのcommitは分離しています。

| 正本 | SHA-256 |
|---|---|
| `docs/helix-harness/L3-requirements/functional-requirements.md` | `c436e37935b4238f1d7c7f0cdd080206e202fbbb01b9e0001793c9202cce960b` |
| `docs/helix-harness/L3-requirements/business-requirements.md` | `375ee38f05d0fd6c527096116361d647cb57a80e8ff707637499a3190c62fa86` |
| `docs/helix-harness/L3-requirements/nfr-grade.md` | `01490f676993430c985c9345fe02223aa0023acb74a7d24251a73284d315dab8` |
| `docs/helix-harness/L10-verification/functional-verification.md` | `386355bfc8655cee84351e457cb1c4a61e022a75095f91428f8ef89d8101ca9c` |
| `docs/helix-harness/L10-verification/business-verification.md` | `4d32df2b83ff46b85e5765bb69f7dea03f7391b81aac22f8ce6cc45b378d6449` |
| `docs/helix-harness/L10-verification/nfr-verification.md` | `1c94cbf246a2f9811a3e03a5bd308b8401303eb89a7f2fe251b3f10df091e176` |

静的監査: [l3-l10-harness-stage2b-static-validation-2026-10-05-6c7875423.json](l3-l10-harness-stage2b-static-validation-2026-10-05-6c7875423.json)。
