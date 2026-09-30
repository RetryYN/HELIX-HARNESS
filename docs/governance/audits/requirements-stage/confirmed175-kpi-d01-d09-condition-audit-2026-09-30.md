# confirmed175 KPI D-01〜D-09 個別条件監査

- 基準revision: `2bf484b1a84af346feaf8cf7b72e59f3889e6333`
- 範囲: 旧 `business-requirements.md:196–204` の9 source identities。原文は [旧要求](../../../../archive/legacy-generation-2026-09-14/root/docs/design/harness/L1-requirements/business-requirements.md#L196)。
- JSON明細: [confirmed175-kpi-d01-d09-condition-audit-2026-09-30.json](confirmed175-kpi-d01-d09-condition-audit-2026-09-30.json)
- 旧source file SHA-256: `09ad9a27afe25bd730f57319865d1f342e6b31729da2dd27f22ecd6cb753ac61`。行SHA、原文、identityごとのpair比較はJSONに記録した。

## 判断revisionとpair参照

- **固定2026-09-28 decision** `HDEC-HARNESS-REQUIREMENTS-2026-09-28` はL2 `product-requirements.md` SHA `aed75cb4bdd644eedd9d3eb408cf522af2c4fbf4272db7b775edc62fc383100a`、L11 `product-acceptance.md` SHA `09b2963187f9aaddbb1ad189d77e517e91914bd5ccdf2499dd9c11855139bcd4` を固定し、明示候補010–033を採択した。L2-005 / L11対応受入（L2 `:56,118–123`; L11 `:25,46–52`）は選択検証義務・risk・証拠・省略回収の一般契約、L2-022（L2 `:298–304`）は段階別oracle/evidenceの一般契約を持つが、L11に同IDの個別受入行はない。これらにD-01..09のKPI式・閾値は列挙されず、9件の個別比較とは数えない。Decision記録SHA-256: `c7a6d39ceb853fe6c00ccc336ffa7bbbd6c7e87a0aaba172f43f490dd0a7fd23`.
- **後発2026-09-29 decision** [57候補decision](../../decisions/po-decision-2026-09-29-57candidates.md#L41) はHARNESS-L2-036採択を明示する。採択pair revisionは `318ec4a04abb3c1cc17111b3d939f913facd5fd3`。その対の固定ファイルSHAはL2 `111cc0285e94bf0a1569627653ba1c578d5dcdf9dbedbbf168bb9acca3ae8d09`、section digest `sha256:7a18c20e22c0cf65e8edcd3b3ca7eca7996d72c0358c874591407d77dbba4bbb`; L11 `3c8831fc3e843791d9fa1901cf0060b90d1e41ad6a3a5ff4c33022fe9a9958c5`、section digest `sha256:80e87d6469c45baa056fbc7415871725c3358f7392a87308c809d6bfe87f0ba4`. L2 §036 `:730,747,750,773`; L11 §036 `:493–514`。
- D-02だけは036内でgate通過率 `≥90%` を**運用目標**として保持し、対象母集団・期間・分母はL3照合、個別ticketのpass閾値ではない。これは9/28固定pairの個別比較ではなく、318ec4aの後発明示採択pairである。HEAD559 residual dispositionの「未採択候補」は9/29以前の状態。D-02 source identityのsuccessor割当・移管完了は確認していない。

## 9 source identities

| ID | 旧原文（source line） | file SHA / line SHA | 式・測定と目標 | 固定pairでのidentity別比較 | 後発adopted pair | 現時点の残余 |
|---|---|---|---|---|---|---|
| D-01 | `196` `PLAN 起票数/sprint` | `09ad9a27afe2…` / `7a64579a7cf0…` | sprint 期間中に起票された PLAN 件数 — **≥ 1 件/sprint**; source consumer `.helix/plan_registry/ / helix plan list` | L2-005/022の一般契約を参照するが当該KPI個別比較なし | 確認なし | 保持/置換/retireの意味判断は未確定。指標個別の対象母集団、期間、分子/分母、イベント/source、欠損/例外処理、owner/consumer、oracle、threshold適用と評価結果は、該当するadopted pairでidentity別に特定されていない。full-auditのknown residual 17件中のKPI 9件に留まり、閉包・successorなし。 |
| D-02 | `197` `gate 通過率` | `09ad9a27afe2…` / `bb5adc7a3bbb…` | gate pass 件数 / gate 総実行件数 × 100 — **≥ 90 %**; source consumer `.helix/gate_runs/ / helix gate log` | L2-005/022の一般契約を参照するが当該KPI個別比較なし | HARNESS-L2-036 / L11-036 adopted; ≥90%を運用目標として保持（source successor未割当） | 元のgate pass率の運用目標は保持された。元の計測場所 .helix/gate_runs/ / helix gate log は非継承の旧consumer pathとして参照情報に残る。実際の対象gate母集団・期間・分母、取得event/source、欠測/再計算の扱いはL3具体化待ち。source identity ledgerのsuccessor未割当・preserved_pending_rehomeは維持。 |
| D-03 | `198` `V-model 順序遵守違反` | `09ad9a27afe2…` / `01eba392cbe0…` | 前工程未完了で後工程着手した検知件数 — **0 件**; source consumer `helix doctor / helix plan lint` | L2-005/022の一般契約を参照するが当該KPI個別比較なし | 確認なし | 保持/置換/retireの意味判断は未確定。指標個別の対象母集団、期間、分子/分母、イベント/source、欠損/例外処理、owner/consumer、oracle、threshold適用と評価結果は、該当するadopted pairでidentity別に特定されていない。full-auditのknown residual 17件中のKPI 9件に留まり、閉包・successorなし。 |
| D-04 | `199` `回帰検出率` | `09ad9a27afe2…` / `b02f2f37342e…` | テストで検出した回帰件数 / 回帰発生総件数 × 100 — **≥ 80 %**; source consumer CI gate / helix trace | L2-005/022の一般契約を参照するが当該KPI個別比較なし | 確認なし | 保持/置換/retireの意味判断は未確定。指標個別の対象母集団、期間、分子/分母、イベント/source、欠損/例外処理、owner/consumer、oracle、threshold適用と評価結果は、該当するadopted pairでidentity別に特定されていない。full-auditのknown residual 17件中のKPI 9件に留まり、閉包・successorなし。 |
| D-05 | `200` `4 artifact trace 整合率` | `09ad9a27afe2…` / `2dbedc2052c3…` | trace 整合 PLAN 件数 / 全 PLAN 件数 × 100 — **≥ 95 %**; source consumer `helix trace check / .helix/artifact/trace/` | L2-005/022の一般契約を参照するが当該KPI個別比較なし | 確認なし | 保持/置換/retireの意味判断は未確定。指標個別の対象母集団、期間、分子/分母、イベント/source、欠損/例外処理、owner/consumer、oracle、threshold適用と評価結果は、該当するadopted pairでidentity別に特定されていない。full-auditのknown residual 17件中のKPI 9件に留まり、閉包・successorなし。 |
| D-06 | `201` `agent guard bypass 件数` | `09ad9a27afe2…` / `af85a9b45b79…` | `HELIX_ALLOW_RAW_AGENT=1` 実行件数 (audit 記録) — **0 件 目標 (PO 承認時のみ許容)**; source consumer .helix/audit/ / agent-guard log | L2-005/022の一般契約を参照するが当該KPI個別比較なし | 確認なし | 保持/置換/retireの意味判断は未確定。指標個別の対象母集団、期間、分子/分母、イベント/source、欠損/例外処理、owner/consumer、oracle、threshold適用と評価結果は、該当するadopted pairでidentity別に特定されていない。full-auditのknown residual 17件中のKPI 9件に留まり、閉包・successorなし。 |
| D-07 | `202` `AI 委譲時間率` | `09ad9a27afe2…` / `459333adac01…` | AI 委譲タスク工数 / 総開発工数 × 100 — **≥ 70 %**; source consumer PLAN drive: 集計 / helix status | L2-005/022の一般契約を参照するが当該KPI個別比較なし | 確認なし | 保持/置換/retireの意味判断は未確定。指標個別の対象母集団、期間、分子/分母、イベント/source、欠損/例外処理、owner/consumer、oracle、threshold適用と評価結果は、該当するadopted pairでidentity別に特定されていない。full-auditのknown residual 17件中のKPI 9件に留まり、閉包・successorなし。 |
| D-08 | `203` `gate override 件数/sprint` | `09ad9a27afe2…` / `5995c913ddb8…` | PO による gate fail-close 例外行使件数 — **≤ 2 件/sprint**; source consumer .helix/audit/ / gate override log | L2-005/022の一般契約を参照するが当該KPI個別比較なし | 確認なし | 保持/置換/retireの意味判断は未確定。指標個別の対象母集団、期間、分子/分母、イベント/source、欠損/例外処理、owner/consumer、oracle、threshold適用と評価結果は、該当するadopted pairでidentity別に特定されていない。full-auditのknown residual 17件中のKPI 9件に留まり、閉包・successorなし。 |
| D-09 | `204` `continuation 再開成功率` | `09ad9a27afe2…` / `9cd4358f9d4b…` | next authority 実行成功件数 / continuation event 総件数 × 100 — **≥ 95 %**; source consumer `harness.db continuation projection / helix status` | L2-005/022の一般契約を参照するが当該KPI個別比較なし | 確認なし | 保持/置換/retireの意味判断は未確定。指標個別の対象母集団、期間、分子/分母、イベント/source、欠損/例外処理、owner/consumer、oracle、threshold適用と評価結果は、該当するadopted pairでidentity別に特定されていない。full-auditのknown residual 17件中のKPI 9件に留まり、閉包・successorなし。 |

## 原文条件の補足

### D-01

- 原文: `archive/legacy-generation-2026-09-14/root/docs/design/harness/L1-requirements/business-requirements.md:196` — | **D-01** | PLAN 起票数/sprint | sprint 期間中に起票された PLAN 件数 | ≥ 1 件/sprint | .helix/plan_registry/ / helix plan list |
- retained meaning: sprintごとのPLAN起票数を数え≥1件/sprintを測る。期間がsprintである以外のPLAN適格性、取り消し/重複の扱いは原文未定義。 旧sourceのKPI名、算式/測定、閾値、およびsource-declared measurement locationは原文snapshotとして保持する。固定f6dad2a L2/L11の採択候補集合から個別KPI採択は確認できず、後発の9/29 adopted HARNESS-L2-036 pairにも当該identityのKPI値を保持する記録は確認できない。
- exceptions: 隣接するHARNESS-L2-005/022等の一般verification/oracle/evidence契約は、このKPIの同値な指標・閾値・集計契約として数えない。; 旧計測場所のpath/CLIは旧consumerの出典記録であり、現行runtimeの採択・実行指示ではない。
- residual: 保持/置換/retireの意味判断は未確定。指標個別の対象母集団、期間、分子/分母、イベント/source、欠損/例外処理、owner/consumer、oracle、threshold適用と評価結果は、該当するadopted pairでidentity別に特定されていない。full-auditのknown residual 17件中のKPI 9件に留まり、閉包・successorなし。

### D-02

- 原文: `archive/legacy-generation-2026-09-14/root/docs/design/harness/L1-requirements/business-requirements.md:197` — | **D-02** | gate 通過率 | gate pass 件数 / gate 総実行件数 × 100 | ≥ 90 % | .helix/gate_runs/ / helix gate log |
- retained meaning: D-02の≥90%目標は後発採択HARNESS-L2-036/L11-036に明示的に保持された。formulaのpass件数/gate総実行件数×100と目標値は旧原文に保持される一方、母集団・期間・分母の適用定義はL3照合待ち。固定f6dad2a pairでの個別比較とは別revision・別decision。
- exceptions: HARNESS-L2-036の一般採択・KPI目標保持は、D-02 source identityのsuccessor割当やsource-atom移管完了を意味しない。; L2/L11本文の未採択candidate metadataはdecision recordで上書きされるが、その採択からsource identityの閉包を生成しない。
- residual: 元のgate pass率の運用目標は保持された。元の計測場所 .helix/gate_runs/ / helix gate log は非継承の旧consumer pathとして参照情報に残る。実際の対象gate母集団・期間・分母、取得event/source、欠測/再計算の扱いはL3具体化待ち。source identity ledgerのsuccessor未割当・preserved_pending_rehomeは維持。

### D-03

- 原文: `archive/legacy-generation-2026-09-14/root/docs/design/harness/L1-requirements/business-requirements.md:198` — | **D-03** | V-model 順序遵守違反 | 前工程未完了で後工程着手した検知件数 | 0 件 | helix doctor / helix plan lint |
- retained meaning: 前工程未完了のまま後工程へ着手した検知件数を0件目標とする。違反検知の定義・対象範囲・分母なし。 旧sourceのKPI名、算式/測定、閾値、およびsource-declared measurement locationは原文snapshotとして保持する。固定f6dad2a L2/L11の採択候補集合から個別KPI採択は確認できず、後発の9/29 adopted HARNESS-L2-036 pairにも当該identityのKPI値を保持する記録は確認できない。
- exceptions: 隣接するHARNESS-L2-005/022等の一般verification/oracle/evidence契約は、このKPIの同値な指標・閾値・集計契約として数えない。; 旧計測場所のpath/CLIは旧consumerの出典記録であり、現行runtimeの採択・実行指示ではない。
- residual: 保持/置換/retireの意味判断は未確定。指標個別の対象母集団、期間、分子/分母、イベント/source、欠損/例外処理、owner/consumer、oracle、threshold適用と評価結果は、該当するadopted pairでidentity別に特定されていない。full-auditのknown residual 17件中のKPI 9件に留まり、閉包・successorなし。

### D-04

- 原文: `archive/legacy-generation-2026-09-14/root/docs/design/harness/L1-requirements/business-requirements.md:199` — | **D-04** | 回帰検出率 | テストで検出した回帰件数 / 回帰発生総件数 × 100 | ≥ 80 % | CI gate / `helix trace` |
- retained meaning: テスト検出回帰件数/回帰発生総件数×100、≥80%。発生総件数の独立確定方法や測定期間は原文未定義。 旧sourceのKPI名、算式/測定、閾値、およびsource-declared measurement locationは原文snapshotとして保持する。固定f6dad2a L2/L11の採択候補集合から個別KPI採択は確認できず、後発の9/29 adopted HARNESS-L2-036 pairにも当該identityのKPI値を保持する記録は確認できない。
- exceptions: 隣接するHARNESS-L2-005/022等の一般verification/oracle/evidence契約は、このKPIの同値な指標・閾値・集計契約として数えない。; 旧計測場所のpath/CLIは旧consumerの出典記録であり、現行runtimeの採択・実行指示ではない。
- residual: 保持/置換/retireの意味判断は未確定。指標個別の対象母集団、期間、分子/分母、イベント/source、欠損/例外処理、owner/consumer、oracle、threshold適用と評価結果は、該当するadopted pairでidentity別に特定されていない。full-auditのknown residual 17件中のKPI 9件に留まり、閉包・successorなし。

### D-05

- 原文: `archive/legacy-generation-2026-09-14/root/docs/design/harness/L1-requirements/business-requirements.md:200` — | **D-05** | 4 artifact trace 整合率 | trace 整合 PLAN 件数 / 全 PLAN 件数 × 100 | ≥ 95 % | helix trace check / .helix/artifact/trace/ |
- retained meaning: trace整合PLAN件数/全PLAN件数×100、≥95%。「4 artifact」の構成定義とtrace適格性は原文未定義。 旧sourceのKPI名、算式/測定、閾値、およびsource-declared measurement locationは原文snapshotとして保持する。固定f6dad2a L2/L11の採択候補集合から個別KPI採択は確認できず、後発の9/29 adopted HARNESS-L2-036 pairにも当該identityのKPI値を保持する記録は確認できない。
- exceptions: 隣接するHARNESS-L2-005/022等の一般verification/oracle/evidence契約は、このKPIの同値な指標・閾値・集計契約として数えない。; 旧計測場所のpath/CLIは旧consumerの出典記録であり、現行runtimeの採択・実行指示ではない。
- residual: 保持/置換/retireの意味判断は未確定。指標個別の対象母集団、期間、分子/分母、イベント/source、欠損/例外処理、owner/consumer、oracle、threshold適用と評価結果は、該当するadopted pairでidentity別に特定されていない。full-auditのknown residual 17件中のKPI 9件に留まり、閉包・successorなし。

### D-06

- 原文: `archive/legacy-generation-2026-09-14/root/docs/design/harness/L1-requirements/business-requirements.md:201` — | **D-06** | agent guard bypass 件数 | `HELIX_ALLOW_RAW_AGENT=1` 実行件数 (audit 記録) | 0 件 目標 (PO 承認時のみ許容) | `.helix/audit/` / agent-guard log |
- retained meaning: `HELIX_ALLOW_RAW_AGENT=1`実行件数（audit記録）を0件目標。PO承認時のみ許容との例外が併記される。例外の権限・集計扱いは未定義。 旧sourceのKPI名、算式/測定、閾値、およびsource-declared measurement locationは原文snapshotとして保持する。固定f6dad2a L2/L11の採択候補集合から個別KPI採択は確認できず、後発の9/29 adopted HARNESS-L2-036 pairにも当該identityのKPI値を保持する記録は確認できない。
- exceptions: 隣接するHARNESS-L2-005/022等の一般verification/oracle/evidence契約は、このKPIの同値な指標・閾値・集計契約として数えない。; 旧計測場所のpath/CLIは旧consumerの出典記録であり、現行runtimeの採択・実行指示ではない。
- residual: 保持/置換/retireの意味判断は未確定。指標個別の対象母集団、期間、分子/分母、イベント/source、欠損/例外処理、owner/consumer、oracle、threshold適用と評価結果は、該当するadopted pairでidentity別に特定されていない。full-auditのknown residual 17件中のKPI 9件に留まり、閉包・successorなし。

### D-07

- 原文: `archive/legacy-generation-2026-09-14/root/docs/design/harness/L1-requirements/business-requirements.md:202` — | **D-07** | AI 委譲時間率 | AI 委譲タスク工数 / 総開発工数 × 100 | ≥ 70 % | PLAN `drive:` 集計 / `helix status` |
- retained meaning: AI委譲タスク工数/総開発工数×100、≥70%。工数計測・AI委譲範囲・総開発工数の扱いは未定義。 旧sourceのKPI名、算式/測定、閾値、およびsource-declared measurement locationは原文snapshotとして保持する。固定f6dad2a L2/L11の採択候補集合から個別KPI採択は確認できず、後発の9/29 adopted HARNESS-L2-036 pairにも当該identityのKPI値を保持する記録は確認できない。
- exceptions: 隣接するHARNESS-L2-005/022等の一般verification/oracle/evidence契約は、このKPIの同値な指標・閾値・集計契約として数えない。; 旧計測場所のpath/CLIは旧consumerの出典記録であり、現行runtimeの採択・実行指示ではない。
- residual: 保持/置換/retireの意味判断は未確定。指標個別の対象母集団、期間、分子/分母、イベント/source、欠損/例外処理、owner/consumer、oracle、threshold適用と評価結果は、該当するadopted pairでidentity別に特定されていない。full-auditのknown residual 17件中のKPI 9件に留まり、閉包・successorなし。

### D-08

- 原文: `archive/legacy-generation-2026-09-14/root/docs/design/harness/L1-requirements/business-requirements.md:203` — | **D-08** | gate override 件数/sprint | PO による gate fail-close 例外行使件数 | ≤ 2 件/sprint | `.helix/audit/` / gate override log |
- retained meaning: POによるgate fail-close例外行使件数を≤2件/sprint。例外記録の粒度/取消/再利用扱いは未定義。 旧sourceのKPI名、算式/測定、閾値、およびsource-declared measurement locationは原文snapshotとして保持する。固定f6dad2a L2/L11の採択候補集合から個別KPI採択は確認できず、後発の9/29 adopted HARNESS-L2-036 pairにも当該identityのKPI値を保持する記録は確認できない。
- exceptions: 隣接するHARNESS-L2-005/022等の一般verification/oracle/evidence契約は、このKPIの同値な指標・閾値・集計契約として数えない。; 旧計測場所のpath/CLIは旧consumerの出典記録であり、現行runtimeの採択・実行指示ではない。
- residual: 保持/置換/retireの意味判断は未確定。指標個別の対象母集団、期間、分子/分母、イベント/source、欠損/例外処理、owner/consumer、oracle、threshold適用と評価結果は、該当するadopted pairでidentity別に特定されていない。full-auditのknown residual 17件中のKPI 9件に留まり、閉包・successorなし。

### D-09

- 原文: `archive/legacy-generation-2026-09-14/root/docs/design/harness/L1-requirements/business-requirements.md:204` — | **D-09** | continuation 再開成功率 | next authority 実行成功件数 / continuation event 総件数 × 100 | ≥ 95 % | harness.db continuation projection / helix status |
- retained meaning: continuation event総件数に対するnext authority実行成功件数×100、≥95%。成功判定、母集団のevent種類、失敗/未観測の扱いは未定義. 旧sourceのKPI名、算式/測定、閾値、およびsource-declared measurement locationは原文snapshotとして保持する。固定f6dad2a L2/L11の採択候補集合から個別KPI採択は確認できず、後発の9/29 adopted HARNESS-L2-036 pairにも当該identityのKPI値を保持する記録は確認できない。
- exceptions: 隣接するHARNESS-L2-005/022等の一般verification/oracle/evidence契約は、このKPIの同値な指標・閾値・集計契約として数えない。; 旧計測場所のpath/CLIは旧consumerの出典記録であり、現行runtimeの採択・実行指示ではない。
- residual: 保持/置換/retireの意味判断は未確定。指標個別の対象母集団、期間、分子/分母、イベント/source、欠損/例外処理、owner/consumer、oracle、threshold適用と評価結果は、該当するadopted pairでidentity別に特定されていない。full-auditのknown residual 17件中のKPI 9件に留まり、閉包・successorなし。

## 集計と限界

- Full-auditはD-01..09をknown residualの1群として扱い、9/30 queueは全9件を `not_individually_compared` とする。旧grouped dispositionはHEAD559に対する§3の整理で、固定f6dad2a pair比較ではない。D-02についてはHEAD559時点の候補記述に対し、318ec4aの後発adopted pairで90%運用目標を部分保持する。入力digestとrevisionはJSONに記録した。
- 本監査はsource 9件を保持し、意味変更・retire・欠陥認定を行わない。D-02の後発採択036は部分的な要求保持を示すが、source atom closure/successorを生成しない。D-01、D-03〜09は個別の採択済み後発pairをこの監査範囲では確認しなかった。
- 旧計測場所（`.helix/*`, `helix ...`, `CI gate`, `harness.db` 等）は旧原文にある記録先であり、現行consumer/runtimeとして採択または実行していない。KPIの対象母集団、期間、source event、欠測/例外処理等の残余を推測で埋めていない。
