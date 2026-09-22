# 新世代authority・全資産統制と既存候補の対応

確認日: 2026-09-14

## 目的

要求authority materializationとWorld Governanceの既存候補を、新世代のauthority管理・資産統制へ再分類する。
既存候補のIssue、PLAN、承認、JSON-only epoch、既存engine、旧CIを新世代へ継承しない。
本表は要求源の照合であり、L2合意、L3凍結、Requirement IR更新、runtime実装を行わない。

## 要求authority materialization候補

対象sourceは`requirements-authority-materialization-{requests,requirements,acceptance}.md`である。
BR 7件、要件14件、受入14件を確認した。

| 旧ID | 保持候補の意味 | 新世代接続先 | 持ち込まない条件 | 状態 |
|---|---|---|---|---|
| RAMG-BR-001／002、R-01..07 | GitHubを意味正本にせず、上流authority確定後にruntimeへ一方向投影する | HELIXOS-L2-001／002、新世代asset policy | Issue上のauthority declaration、main merge SHA、旧IR admissionを新世代の成立条件にしない | split_reapproval_required |
| RAMG-BR-003／004、R-08／09 | 複合capability自身の要求を持ち、依存を必要sliceへ限定する | HARNESS-L2-003／004、HELIXOS-L2-002／003 | 旧Issue番号、旧Capability owner、既存slice構造を固定しない | semantic_atom_candidate |
| RAMG-BR-005、R-10..12 | source、projection、consumerの欠落を全数／差分で監査し、unknownを隠さない | HELIXOS-L2-001／002／007 | PR changed-scope検査、scheduled audit、旧disposition enumを方式として固定しない | scope_rewrite_required |
| RAMG-BR-006、R-13 | source文書、semantic authority、projectionを区別する | 新世代authority policy、AIDOC-HARNESS-002／003 | `canonical Requirement IR JSONだけ`を意味正本とする旧epochを採用しない。対象別文書と指定JSONのauthority registerを親にする | authority_conflict_rewrite |
| RAMG-BR-007、R-14 | AI proposal、canonicalization、人間approval、freezeを別状態にする | HELIXOS-L2-001／002、上流変更管理 | 旧`auto_admit`／`canonical_specified`状態名と既存engineを再利用必須にしない | semantic_atom_candidate |
| RAMG-AC-001..014 | authority欠落、stale、Issue-only、dual authority、自己freezeを拒否する反例 | 対象別L11／L10候補 | main merge、旧IR JSON-only、旧Issue fixtureを新世代oracleにしない | oracle_atom_candidate |

RAMGの「Markdownはsource-of-derivation、JSONだけがcurrent semantic read authority」という条件は、新世代の
対象別repo-owned Concept／L1／L2／L3文書と指定JSONのauthority registerへ置き換える。物理形式でauthorityを一括決定せず、
対象、意味範囲、revision、承認、read／write contractを台帳で指定する。

## World Governance候補

対象sourceは`world-governance-{requests,requirements,acceptance}.md`である。
BR 3件、要件9件、受入10件を確認した。

| 旧ID | 保持候補の意味 | 新世代接続先 | 持ち込まない条件 | 状態 |
|---|---|---|---|---|
| HWG-BR-01、R01..03 | 全資産を要求・責務・設計・実装・検証・consumer・提供から双方向に棚卸しし、状態を分離する | HELIXOS-L2-001／002／007、asset governance policy | main SHAだけの母集団、既存graph／portfolio／DB owner、JSON-only authorityを固定しない | split_reapproval_required |
| HWG-BR-02、R04／05／07 | 新要求を受け取り、影響scopeと行為別admissionを分け、無関係な作業を止めない | HELIXOS-L2-001..004、上流変更管理 | Issue／PLAN／PRを要求受付の同列sourceにしない。旧policy evaluator、CLI／GitHub入口を再利用しない | authority_conflict_rewrite |
| HWG-BR-03、R06 | Module／Slice／Bundle／Waveと提供状態を分離する | HARNESS-L2-006、HELIXOS-L2-006 | 旧Release inventory、既存Module、旧consumerをbaselineにしない | split_reapproval_required |
| R08 | source revision、取得品質、判定、許可scopeを束縛し、取得失敗を空集合にしない | HELIXOS-L2-001／002／007、AIDOC-OS-005／006 | GitHub観測・旧event checkpoint・既存CI／reviewを必要証拠として固定しない | semantic_atom_candidate |
| R09 | 全数inventoryと通常差分を分け、未把握・費用・誤停止・見逃しを測る | HELIXOS-L2-002／005／007 | 毎PR、旧CI、現行runtimeを測定母集団・baselineにしない | measurement_scope_rewrite |
| HWG-AC-01..10 | 状態混同、orphan、無根拠edge、stale、自己承認を拒否する反例 | 対象別L11／L10候補 | 旧CI維持、旧policy＋旧consumer E2E、PR／DB replayを新世代の合格条件にしない | oracle_atom_candidate |

HWGのL3候補承認は旧製品境界、旧owner、旧CI、既存policyを含むrevisionに対するものなので、新世代へ流用しない。
World Registry／Graph／Policy／Admissionという旧論理component名も、対象別L1確定前には新世代componentとして採択しない。

## 新世代authorityの上位規則

1. authorityは媒体名ではなく、対象、意味範囲、revision、actor、承認状態、read／write contractで指定する。
2. Concept・L1・L2・L3は対象別repo-owned文書をauthorityにでき、指定JSONは機械意味を所有する範囲だけauthorityにする。
3. Issue、PLAN、PR、CI、DB read model、generated view、AI文書はauthorityへの参照またはprojectionである。
4. candidate、review、approval、canonicalization、freeze、implementation、verification、acceptance、observationを別状態にする。
5. 新世代のasset graphとruntime projectionは承認上流から再構築し、旧graph・DB・IRから上流意味を逆生成しない。
6. legacy sourceは意味採取後に非実行archiveへ移し、新世代のfallback・parity oracleにしない。

## Mechanism Adequacy候補

対象sourceは`mechanism-adequacy-{vision,requests,requirements,acceptance,recognition}.md`である。
L1目的4件、要件7件、L10受入20件、L12観測4件を確認した。旧要件・受入の承認は、現行UIL、既存CI、
既存Learning／DB／workflowへの接続を含むため新世代へ流用しない。

| 旧ID | 保持候補の意味 | 新世代接続先 | 持ち込まない条件 | 状態 |
|---|---|---|---|---|
| MA-BR-01、R-01..03 | 宣言・実装・接続・検証・運用を分け、unknownと証拠不足を保ち、限定scopeで反証可能に判断する | asset governance policy、HELIXOS-L2-001／002／007 | 現行registry、実装能力、CI結果を新世代のbaselineにしない | scope_rewrite_required |
| MA-R-02の六分類 | 問題原因と証拠不足・要求再検討を区別する | HELIXOS-L2-002／005 | `existing_method_applicable`と`recomposition_required`を旧実装の再有効化に使わない。legacy atomの`adopt_and_rederive／reject／unresolved`へ書き換える | classification_rewrite_required |
| MA-BR-02、R-04／05 | 不足、制約、反例、設計候補、証拠、未知事項を一つの評価scopeへ束縛する | HELIXOS-L2-002／005／007、新世代work unit | 既存UIL、route、DB journal、Requirement IR schema、workflowへの接続を固定しない | split_reapproval_required |
| MA-BR-03、R-06 | AI呼出し・probe・資源・回数を有界にし、打切りを証拠不足として残す | HELIXOS-L2-004／005 | 現行policyを操作許可として流用せず、新世代assignmentと停止条件から導出する | semantic_atom_candidate |
| MA-BR-04、R-07 | 予測・実測・欠測を分け、誤判断・副作用・再発を観測する | HELIXOS-L2-005／007、L12候補 | 現行Learning、現行HELIX、post-mainを比較基準にしない。新世代revision間だけを同条件で測る | measurement_scope_rewrite |
| MA-AC-01..19／21 | 状態混同、検索漏れ、AI断定、stale、証拠混載、無限再生成を拒否する反例 | 対象別L11／L10候補 | 旧機構適用、既存配車、旧DB replay、旧CI／main read-afterを合格条件にしない | oracle_atom_candidate |
| MA-OP-01..04 | 誤分類、手戻り、費用、副作用、再発をL12で観測する | HELIXOS L12候補 | 現行HELIXとのbefore／after、既存Learning受渡しを必須にしない | observation_scope_rewrite |

新世代での充足性評価は、旧機構を残す判断ではない。legacy sourceから採る意味atomと捨てる実装前提を証拠付きで分類し、
採択atomも新しい上流IDから設計・実装・検証へ降ろし直す。新世代に必要な能力が既存codeに存在しても、そのcodeを
current pathへ再接続せず、理解の参考としてarchive provenanceへ記録する。

## 次工程

v4.1 Concept承認後、対象別L1でauthority管理と全資産統制の利用者・価値・非対象を確定する。その後、RAMG 14要件、
HWG 9要件、MA 7要件の各atomをHELIX-OS L2／L11へ採否し、新しいIDを付与する。L3／L10以降はその新IDから導出する。
