# HELIX-SECURITY L10 総合検証（1.0採択親31件の草稿）

> 状態: L10総合検証設計草稿。実行結果や合格証拠ではない。archive内test/runtime/CIは使わない。本書はSECURITYのStage 1 19件、Stage 2cの031、Stage 3の029/030/032/034/035、Stage 4の021/022/023/024/026、Stage 5の027の31親を対象とする。

## 検証共通契約

各caseは同番号のL3 ACへ対応する。合成fixtureはscope/owner/revisionを明示し、意味上のunknownを許可に変えない。観測は機構責務ごとの出力/receipt/owner確認に分ける。Worker環境やOS/CONNECT/HARNESSが所有する実制御をSECURITYの内部成功とみなさない。検証には対象固定L2/L11を正本とし、SECURITY-L2-033はPO採択P0訂正版を使用する。旧test-design/fixturesは設計上のnegative oracle参照に限り、実行しない。

## 親要件とL3/L10対応表

| 固定L2 identity | L3 FR | L3 AC | L10 case | 版 |
|---|---|---|---|---|
| `HELIXSECURITY-L2-001` | `SECURITY-FR-001-01` | `SECURITY-AC-001-01` | `SECURITY-CASE-001-01` | 1.0 |
| `HELIXSECURITY-L2-002` | `SECURITY-FR-002-01` | `SECURITY-AC-002-01` | `SECURITY-CASE-002-01` | 1.0 |
| `HELIXSECURITY-L2-003` | `SECURITY-FR-003-01` | `SECURITY-AC-003-01` | `SECURITY-CASE-003-01` | 1.0 |
| `HELIXSECURITY-L2-004` | `SECURITY-FR-004-01` | `SECURITY-AC-004-01` | `SECURITY-CASE-004-01` | 1.0 |
| `HELIXSECURITY-L2-005` | `SECURITY-FR-005-01` | `SECURITY-AC-005-01` | `SECURITY-CASE-005-01` | 1.0 |
| `HELIXSECURITY-L2-006` | `SECURITY-FR-006-01` | `SECURITY-AC-006-01` | `SECURITY-CASE-006-01` | 1.0 |
| `HELIXSECURITY-L2-007` | `SECURITY-FR-007-01` | `SECURITY-AC-007-01` | `SECURITY-CASE-007-01` | 1.0 |
| `HELIXSECURITY-L2-008` | `SECURITY-FR-008-01` | `SECURITY-AC-008-01` | `SECURITY-CASE-008-01` | 1.0 |
| `HELIXSECURITY-L2-009` | `SECURITY-FR-009-01` | `SECURITY-AC-009-01` | `SECURITY-CASE-009-01` | 1.0 |
| `HELIXSECURITY-L2-010` | `SECURITY-FR-010-01` | `SECURITY-AC-010-01` | `SECURITY-CASE-010-01` | 1.0 |
| `HELIXSECURITY-L2-011` | `SECURITY-FR-011-01` | `SECURITY-AC-011-01` | `SECURITY-CASE-011-01` | 1.0 |
| `HELIXSECURITY-L2-012` | `SECURITY-FR-012-01` | `SECURITY-AC-012-01` | `SECURITY-CASE-012-01` | 1.0 |
| `HELIXSECURITY-L2-013` | `SECURITY-FR-013-01` | `SECURITY-AC-013-01` | `SECURITY-CASE-013-01` | 1.0 |
| `HELIXSECURITY-L2-014` | `SECURITY-FR-014-01` | `SECURITY-AC-014-01` | `SECURITY-CASE-014-01` | 1.0 |
| `HELIXSECURITY-L2-015` | `SECURITY-FR-015-01` | `SECURITY-AC-015-01` | `SECURITY-CASE-015-01` | 1.0 |
| `HELIXSECURITY-L2-016` | `SECURITY-FR-016-01` | `SECURITY-AC-016-01` | `SECURITY-CASE-016-01` | 1.0 |
| `HELIXSECURITY-L2-020` | `SECURITY-FR-020-01` | `SECURITY-AC-020-01` | `SECURITY-CASE-020-01` | 1.0 |
| `HELIXSECURITY-L2-028` | `SECURITY-FR-028-01` | `SECURITY-AC-028-01` | `SECURITY-CASE-028-01` | 1.0 |
| `HELIXSECURITY-L2-033` | `SECURITY-FR-033-01` | `SECURITY-AC-033-01` | `SECURITY-CASE-033-01` | 1.0 |
| `HELIXSECURITY-L2-031` | `SECURITY-FR-031-01..04` | `SECURITY-AC-031-01..04` | `SECURITY-CASE-031-01..04` | Stage 2c / 1.0 |
| `HELIXSECURITY-L2-021` | `SECURITY-FR-021-01` | `SECURITY-AC-021-01..03` | `SECURITY-CASE-021-01..03` | Stage 4 / 1.0 |
| `HELIXSECURITY-L2-022` | `SECURITY-FR-022-01` | `SECURITY-AC-022-01..03` | `SECURITY-CASE-022-01..03` | Stage 4 / 1.0 |
| `HELIXSECURITY-L2-023` | `SECURITY-FR-023-01` | `SECURITY-AC-023-01..04` | `SECURITY-CASE-023-01..04` | Stage 4 / 1.0 |
| `HELIXSECURITY-L2-024` | `SECURITY-FR-024-01` | `SECURITY-AC-024-01..03` | `SECURITY-CASE-024-01..03` | Stage 4 / 1.0 |
| `HELIXSECURITY-L2-026` | `SECURITY-FR-026-01` | `SECURITY-AC-026-01..03` | `SECURITY-CASE-026-01..03` | Stage 4 / 1.0 |
| `HELIXSECURITY-L2-029` | `SECURITY-FR-029-01` | `SECURITY-AC-029-01..03` | `SECURITY-CASE-029-01..04` | Stage 3 / 1.0 |
| `HELIXSECURITY-L2-030` | `SECURITY-FR-030-01` | `SECURITY-AC-030-01..03` | `SECURITY-CASE-030-01..03` | Stage 3 / 1.0 |
| `HELIXSECURITY-L2-032` | `SECURITY-FR-032-01` | `SECURITY-AC-032-01..02` | `SECURITY-CASE-032-01..02` | Stage 3 / 1.0 |
| `HELIXSECURITY-L2-034` | `SECURITY-FR-034-01` | `SECURITY-AC-034-01..03` | `SECURITY-CASE-034-01..03` | Stage 3 / 1.0 |
| `HELIXSECURITY-L2-035` | `SECURITY-FR-035-01` | `SECURITY-AC-035-01..03` | `SECURITY-CASE-035-01..04` | Stage 3 / 1.0 |
| `HELIXSECURITY-L2-027` | `SECURITY-FR-027-01` | `SECURITY-AC-027-01..04` | `SECURITY-CASE-027-01..04` | Stage 5 / 1.0 |

## 句別被覆と責務分解（L3/AC/L10）

| 固定親 / L3 / AC / case | 入力 → 出力・保証 | 否定・境界oracle | 主担当 / 失敗時の戻し先 | 依存owner区分 | 版 |
|---|---|---|---|---|---|
| `HELIXSECURITY-L2-001` / `SECURITY-FR-001-01` / `SECURITY-AC-001-01` / `SECURITY-CASE-001-01` | source/project/revision/classification付き外部入力→untrusted分類と昇格状態 | 閲覧だけでinstruction/authority/memory/BRAIN/training/policyへ昇格不可 | SECURITYはtrust decision、欠落意味はL1-001/002へ | source=外部owner、authority=SECURITY、受渡し=CONNECT、証拠=HARNESS | 1.0 |
| `HELIXSECURITY-L2-002` / `SECURITY-FR-002-01` / `SECURITY-AC-002-01` / `SECURITY-CASE-002-01` | 命令様data・Tool args・instruction・operation・credential経路→遮断/保持結果 | 直結ゼロ。完全なinjection検出器は要求せず、検出器不在をallow理由にしない | SECURITY policy不足はL1-002、enforcementはWorker owner | source=001、実行=Worker、authority=SECURITY、trace=HARNESS | 1.0 |
| `HELIXSECURITY-L2-003` / `SECURITY-FR-003-01` / `SECURITY-AC-003-01` / `SECURITY-CASE-003-01` | project/tenant/environment/assignment identityとstate/data/credential/artifact→scope判定 | 欠落/unknown時停止、primary tree/他project fallbackなし | scope意味はL1-003、physical boundaryはINFRASTRUCTURE接続へ | assignment=OS、environment=INFRASTRUCTURE、policy=SECURITY、証拠=HARNESS | 1.0 |
| `HELIXSECURITY-L2-004` / `SECURITY-FR-004-01` / `SECURITY-AC-004-01` / `SECURITY-CASE-004-01` | project/root/HEAD/revision/digest/owner/scope構成→integrity判定 | stale/unknown/他project/欠落を既定値で補わない | 対象scopeはL1-004、構成ownerへ欠落返却 | identity=owner、assignment=OS、enforcement=Worker、証拠=HARNESS | 1.0 |
| `HELIXSECURITY-L2-005` / `SECURITY-FR-005-01` / `SECURITY-AC-005-01` / `SECURITY-CASE-005-01` | canonical classifier identity/revisionとcredential class/actor/operation/target/environment/scope/expiry/purpose/revoke→scoped use decision | raw secret露出、scope/purpose不足、expiry/revoke後利用は0 | policy意味はL1-005、保管/注入境界はL2-024 | authority=SECURITY、store=credential owner、dispatch=OS/Worker、egress=CONNECT | 1.0 |
| `HELIXSECURITY-L2-006` / `SECURITY-FR-006-01` / `SECURITY-AC-006-01` / `SECURITY-CASE-006-01` | source/destination/protocol/path/classification/bytes/purpose/authority/expiry→egress decision | unknown/未許可destinationはdeny。1.x Web sinkを1.0完了にしない | policy意味はL1-006、physical routeはINFRASTRUCTUREへ | classification=SECURITY、transport=CONNECT、route=INFRASTRUCTURE、証拠=HARNESS | 1.0 |
| `HELIXSECURITY-L2-007` / `SECURITY-FR-007-01` / `SECURITY-AC-007-01` / `SECURITY-CASE-007-01` | SECURITYが宣言しrevisionへ束縛した9制約→Worker適用/実観測 | 未適用/unknown/unsupportedでhost fallbackなし。制約をWorkerが拡張しない | policy不足はL1-007、enforcement欠落はWorker/INFRASTRUCTURE ownerへ | scope/policy=SECURITY、進行=OS、実行/enforcement=Worker、実資源観測=INFRASTRUCTURE、記録=HARNESS | 1.0 |
| `HELIXSECURITY-L2-008` / `SECURITY-FR-008-01` / `SECURITY-AC-008-01` / `SECURITY-CASE-008-01` | actor/target/operation/revision/environment/scope/expiry authority tuple→operation別allow/deny | tuple各要素の欠落/不一致はallow不可 | 意味変更はL1-008、停止伝播はL2-009/022 | authority=SECURITY、assignment=OS、execution=Worker、trace=HARNESS | 1.0 |
| `HELIXSECURITY-L2-009` / `SECURITY-FR-009-01` / `SECURITY-AC-009-01` / `SECURITY-CASE-009-01` | revocation/triggerと該当recipient集合→受領/適用/未達を分けた伝播状態 | 対象recipient未達/unknownはsuccess不可、無関係scopeのglobal stopも不可 | policy意味はL1-009、enforcement差は各recipient ownerへ | authority=SECURITY、recipient=OS/Worker/CONNECT/artifact owners、測定=HARNESS | 1.0 |
| `HELIXSECURITY-L2-010` / `SECURITY-FR-010-01` / `SECURITY-AC-010-01` / `SECURITY-CASE-010-01` | 15対象のsource/provenance/digest/dependency/permission/network/finding/rollback→update decision | version文字列だけ/欠落unknownの採用不可 | meaning/判定軸はL1-010、実行promotionはL2-023 | policy=SECURITY、artifact=owner、progression=OS、verification=HARNESS | 1.0 |
| `HELIXSECURITY-L2-011` / `SECURITY-FR-011-01` / `SECURITY-AC-011-01` / `SECURITY-CASE-011-01` | 同一filename等の前後permission/capability manifest→能力差分 | read-onlyからwrite/shell/network等のdriftを見落とさない | 分類意味はL1-011、比較不能はunknown | 構成=owner、authority=SECURITY、実行=Worker、証拠=HARNESS | 1.0 |
| `HELIXSECURITY-L2-012` / `SECURITY-FR-012-01` / `SECURITY-AC-012-01` / `SECURITY-CASE-012-01` | source/producer/version/digest/dependency/permission/network/risk/update/rollback→provenance status | 不明供給元/能力をtrustedへ上げない。特定scannerを要求しない | 範囲変更はL1-012 | artifact owner=source、判定=SECURITY、promotion=OS、証拠=HARNESS | 1.0 |
| `HELIXSECURITY-L2-013` / `SECURITY-FR-013-01` / `SECURITY-AC-013-01` / `SECURITY-CASE-013-01` | build/validation/distribution/runtime artifact identity chain→一致/不一致結果 | identity/digest/工程欠落やdigestだけのtrust推定で昇格しない | identity意味はL1-013、昇格停止をOSへ返す | artifact owner、HARNESS verification receipt、OS promotion、SECURITY判定 | 1.0 |
| `HELIXSECURITY-L2-014` / `SECURITY-FR-014-01` / `SECURITY-AC-014-01` / `SECURITY-CASE-014-01` | memory/training/BRAIN各target classとsource/provenance/classification→SECURITY decision+reason | missing/unknown/wrong targetはhold/deny。handoff/evaluation/storage完了を主張しない | metadataはsource owner、対象意味はL1-014、handoffはL2-027 owner | 判定=SECURITY、保存=各target owner、評価=LABO、証拠=HARNESS | 1.0 |
| `HELIXSECURITY-L2-015` / `SECURITY-FR-015-01` / `SECURITY-AC-015-01` / `SECURITY-CASE-015-01` | asset owner/identity/source/revision/digest→6分類の対象asset identity | owner/identity unknownをpublic/trustedにしない、内容dumpしない | 範囲変更はL1-015へ | identity=各asset owner、分類=SECURITY、assignment=OS、証拠=HARNESS | 1.0 |
| `HELIXSECURITY-L2-016` / `SECURITY-FR-016-01` / `SECURITY-AC-016-01` / `SECURITY-CASE-016-01` | asset identityへ6分類またはunknownを付与→classification record | missing/unknownをpublic/allowにしない。1.x sink enforcementを完了条件にしない | 分類意味はL1-016 | identity=015、分類=SECURITY、適用sink=後続L2-019/025、証拠=HARNESS | 1.0 |
| `HELIXSECURITY-L2-020` / `SECURITY-FR-020-01` / `SECURITY-AC-020-01` / `SECURITY-CASE-020-01` | 8 Guard responsibilitiesとoptional Bot候補→Guard決定とBot補助結果 | 決定ruleをBot任せ、Botなしで抜ける、全例示Botを1.0必須にしない | boundary意味はL1-020、実施責任はenforcement owner | policy=SECURITY、runtime=Worker、判断補助=INTELLIGENCE、証拠=HARNESS | 1.0 |
| `HELIXSECURITY-L2-028` / `SECURITY-FR-028-01` / `SECURITY-AC-028-01` / `SECURITY-CASE-028-01` | HARNESS descriptor + SECURITY artifact identity/version/digest/dependency/provenance→SECURITY固有accept/reject/unknown | missing/mismatch/range外を通さず、共通交換/rollbackをSECURITY所有にしない | 判定意味はL1-010、artifactはL1-013、共通lifecycleはHARNESS L2-010/011 | 判定=SECURITY、descriptor/lifecycle=HARNESS、artifact=owner、進行=OS | 1.0 |
| `HELIXSECURITY-L2-033` / `SECURITY-FR-033-01` / `SECURITY-AC-033-01` / `SECURITY-CASE-033-01` | assignment/current HEAD/authority/rule revision/raw-vs-scoped credential context→dispatch eligibility/output boundary | valid scoped credential-useは許容、raw secret/secret content exposureはdeny、Worker outputはauthorityを作らない | binding不足は既存OS assignment ownerへ | authority=SECURITY、assignment=OS、execution=Worker、task exchange=HARNESS | 1.0 |
| `HELIXSECURITY-L2-031` / `SECURITY-FR-031-01..04` / `SECURITY-AC-031-01..04` / `SECURITY-CASE-031-01..04` | 追加runtimeのauthority/scope、isolated copy、data/credential境界、実適用観測→allow/deny/unknownとproposal状態 | canonical access、secret/egress逸脱、欠落/false/driftした適用観測、receipt単独昇格は不合格 | SECURITYはpolicy照合、OS assignment/未完義務、Worker/INFRASTRUCTURE適用観測、HARNESS再検証 | 常時029/005/007/008/OS018/INFRA010、操作別006/009/022/023、選択source別 | 1.0 |
| `HELIXSECURITY-L2-029` / `SECURITY-FR-029-01` / `SECURITY-AC-029-01..03` / `SECURITY-CASE-029-01..04` | 追加runtime/config/data class/opt-out/operation/ローカル観測→委譲可否・採用状態 | secret/unknownをpublic化、型別証拠相殺、self-claimによる主Worker偽装を拒否 | policy不足=SECURITY、適用観測=INFRASTRUCTURE/Worker、assignment=OS | 現行029/005/006/007/008条件を適用範囲内で照合、HARNESS010/011を常時依存にしない | 1.0 |
| `HELIXSECURITY-L2-030` / `SECURITY-FR-030-01` / `SECURITY-AC-030-01..03` / `SECURITY-CASE-030-01..03` | scope拡大revision/権限/監査/rollback/risk owner/監視/threat model→独立条件状態 | 条件欠落・unknown、ログだけの充足、SECURITYからのOS/INTELLIGENCE代行は不合格 | SECURITYは条件判定、OSは昇格、Worker/INFRAは強制、INTELLIGENCEは意味判断 | 選択されたscope/revisionと既存owner条件 | 1.0 |
| `HELIXSECURITY-L2-032` / `SECURITY-FR-032-01` / `SECURITY-AC-032-01..02` / `SECURITY-CASE-032-01..02` | 同一repository/operation denyとone-shot/provider flag、policy適用状態→既存allow/deny境界 | 下位flagの上書き、unknownから許可、無関係操作の一律denyは不合格 | SECURITYはpolicy、OS/Workerはassignment/適用、既存authorityへ戻す | 対象repository/operationの同一policy revision | 1.0 |
| `HELIXSECURITY-L2-034` / `SECURITY-FR-034-01` / `SECURITY-AC-034-01..03` / `SECURITY-CASE-034-01..03` | profile/revision/capability/probe/egress/authority→profile operation別判定 | raw secret/未許可egress/authority欠落をdeny、valid scoped credential useは通す | CONNECT identity/互換、SECURITY policy、Worker/INFRA適用、ownerへ未closure返却 | 選択profile・operation・sourceだけ | 1.0 |
| `HELIXSECURITY-L2-035` / `SECURITY-FR-035-01` / `SECURITY-AC-035-01..03` / `SECURITY-CASE-035-01..04` | 対象revisionの既存operation authorityとrepository policy/deny状態は常時入力。選択runtimeのallowlist能力とpolicy適用状態は選択入力に応じて追加照合し、run cleanup/switch能力はbypass/YOLO選択runのみで観測。HR/HAC/HATはconsumer資料としてのみ保持 | unknown allowlist能力だけで通常operationを一律停止せず、既存policy適用unknownは該当operationだけ未完。bypass許可への変換もしない | policy/authority=SECURITY、run設定適用=Worker、assignment=OS | 常時=既存authorityとrepository policy/deny状態、選択runtime条件=allowlist能力とpolicy適用、bypass選択時のみ=cleanup/switch、参照資料のみ=HR/HAC/HAT | 1.0 |
| `HELIXSECURITY-L2-021` / `SECURITY-FR-021-01` / `SECURITY-AC-021-01..03` / `SECURITY-CASE-021-01..03` | CONNECT source/revision/input-output identity→分類・理由付き受領trace | source混同、受領からtrust/permission/storage生成を拒否 | CONNECT搬送、SECURITY分類、LABO/INTELLIGENCE利用、target owner保存 | 選択sourceとtargetの既存契約 | 1.0 |
| `HELIXSECURITY-L2-022` / `SECURITY-FR-022-01` / `SECURITY-AC-022-01..03` / `SECURITY-CASE-022-01..03` | 判断依頼tuple→SECURITY判断→OS assignment→Worker適用観測 | INTELLIGENCEだけでauthority生成、通信/retryやassignmentのowner越境を拒否 | SECURITY判断、OS assignment、Worker適用、CONNECT通信 | 同一actor/target/operation/revision/scope tuple | 1.0 |
| `HELIXSECURITY-L2-023` / `SECURITY-FR-023-01` / `SECURITY-AC-023-01..04` / `SECURITY-CASE-023-01..04` | 段階別candidate/admission/run/verification/promotion evidence→状態遷移 | missing/failed/stale/revision違い、将来receipt前倒し、未見正常の自動拒否を区別 | SECURITY固有判定、HARNESS検証、OS progression、owner別戻し | 選択stageと既存contract | 1.0 |
| `HELIXSECURITY-L2-024` / `SECURITY-FR-024-01` / `SECURITY-AC-024-01..03` / `SECURITY-CASE-024-01..03` | policy/credential/egress/isolation条件とINFRA resource/Worker enforcement観測→一致状態 | resource準備だけで強制完了、raw secret保存、owner代行を拒否 | SECURITY policy、INFRASTRUCTURE resource、Worker enforcement、OS状態 | 選択environment/resource operationの条件 | 1.0 |
| `HELIXSECURITY-L2-026` / `SECURITY-FR-026-01` / `SECURITY-AC-026-01..03` / `SECURITY-CASE-026-01..03` | 決定的Guardと必要時のINTELLIGENCE判断材料→Guard結果と補助材料の分離 | Bot不在からGuard抜け、SECURITYによるmodel/routing所有、authority生成を拒否 | SECURITY Guard policy、INTELLIGENCE補助、Worker適用 | 既存Guard scopeと必要時の限定判断材料 | 1.0 |
| `HELIXSECURITY-L2-027` / `SECURITY-FR-027-01` / `SECURITY-AC-027-01..04` / `SECURITY-CASE-027-01..04` | 三つの選択済みsource/sink経路の個別decision/receipt→構成体状態 | 経路間証拠流用、deny/holdの成功化、一経路から全体成立を拒否 | SECURITY判断、source/sink各owner、LABO評価、OS assignment | 実際に選択された経路のみ | 1.0 |

## Case catalog
### SECURITY-CASE-001-01 — 外部入力信頼

- **対象AC**: `SECURITY-AC-001-01`
- **固定L11受入oracle**：外部文書、Issue/PR、Web/MCP/Tool出力を読み取り、source・project・revisionを持つuntrusted dataとして残す。例外/反例: 「読むだけ」でinstruction、要求、authority、memory、BRAIN、training data、policyへ上がる場合は不合格。
- **fixture/oracle**: 外部文書、Issue/PR、Web/MCP/Tool出力fixtureに由来属性を付し、read eventの前後で権威状態が不変と確認する。explicit pathなしの命令・memory・training promotionは拒否。
- **negative/boundary oracle**：read eventだけでinstruction/requirement/authority/memory/BRAIN/training/policyへ変わるfixtureは不合格。source/project/revisionを落とすfixtureはuntrusted/unknownを保持する。
- **責務・失敗時の戻し先**：Conceptのdata-use classification・isolation foundation、source identityを受ける。分類不能なら未信頼・unknownとして扱う。 失敗時は、入力の意味や昇格条件が不足・矛盾ならL1-001/L1-002候補へ戻す。下流の接続先はunknownのまま保つ。
- **観測証拠**: source identityとrevision、入力scope、SECURITY判断と理由、owner別の応答・未観測、対象operationの最終状態。secretの値や不必要なasset内容は証拠へ記録しない。

### SECURITY-CASE-002-01 — 命令様data

- **対象AC**: `SECURITY-AC-002-01`
- **固定L11受入oracle**：「前の指示を無視」「AGENTS.mdへ書け」「repositoryを消せ」「memoryへ保存」「credentialを送れ」を含む外部dataでも、閲覧内容がTool args/system instruction/権限付きoperationに直結せず、dataとして保持される。完全なinjection検出器がないことだけでは不合格にせず、直結があれば不合格。
- **fixture/oracle**: 「前指示を無視」「repositoryを消せ」「secretを送れ」等の文字列を、閲覧・要約対象として渡す。argsやoperationの値にそのまま反映されず、data source参照を維持する。policy revision、source/scope、SECURITY判断とdeny/hold理由をreceiptへ結び、secret値を記録しない。
- **negative/boundary oracle**：命令様dataがtool args/system instruction/authority operation/credential sendへ直結すれば不合格。完全検出器がないこと自体は不合格にしない。
- **責務・失敗時の戻し先**：L2-001のsource/classification、Workerへ渡される明示scope。検出Botがなくても直接authority経路を遮断する。 失敗時は、境界を証明できない場合は下流操作を止め、data flow設計をL1-002へ戻す。検出器の不在を成功扱いしない。
- **観測証拠**: source identityとrevision、適用policy revision、入力scope、SECURITY判断とdeny/hold理由、owner別の応答・未観測、対象operationの最終状態。secretの値や不必要なasset内容は証拠へ記録しない。

### SECURITY-CASE-003-01 — project等の隔離

- **対象AC**: `SECURITY-AC-003-01`
- **固定L11受入oracle**：A/Bのproject、tenant、environment、worktreeのstate、Agent、Hook、credential、memory、artifactの参照を提示し、明示接続のある作用だけが対象内に限定される。primary tree/他projectへのfallbackが発生、またはscope不明を許可にしたら不合格。tenantを含むfixtureは合成scope identityの境界確認であり、顧客tenant runtimeの構築を1.0の前提にしない。tenant dimensionが対象にない環境で存在を捏造せず、当該操作に適用されるtenant identityがある場合は照合を省略しない。
- **fixture/oracle**: project A/Bとassignmentのsynthetic identityを用いてread/write/execute/network/state/credential/artifact境界を追跡する。明示接続なしの他project/primary tree作用とunknown scope許可を拒否する。
- **negative/boundary oracle**：明示接続なしのcross-project/primary-tree作用、unknown scopeを許可扱い、assignment不一致があれば不合格。tenant実装を仮定・捏造しない。
- **責務・失敗時の戻し先**：OSからassignment/project identity、INFRASTRUCTUREから実環境identity、CONNECTから宣言済み接続identityを受ける。各機構は自分のstateを正本として保持する。 失敗時は、identityが欠落、衝突、不明なら操作停止。identity構造の不足はL1-003へ、物理環境の不足は接続要求でINFRASTRUCTUREへ戻す。
- **観測証拠**: source identityとrevision、入力scope、SECURITY判断と理由、owner別の応答・未観測、対象operationの最終状態。secretの値や不必要なasset内容は証拠へ記録しない。

### SECURITY-CASE-004-01 — 設定integrity

- **対象AC**: `SECURITY-AC-004-01`
- **固定L11受入oracle**：正しいproject/root/HEAD/revision/digest/owner/scopeの構成だけを識別し、stale revision、未知Hook、他projectのMCP設定を受け入れない。構成の一部欠落を既定値で黙って補ったら不合格。
- **fixture/oracle**: 現在値一致、stale revision、別project、unknown hook/MCP config、各フィールド欠落を比較する。採用可能revisionとunknown/staleの比較結果、内容差分とauthority差分の別出力を観測し、既定値で穴埋めした状態はpassしない。
- **negative/boundary oracle**：stale revision、unknown hook/config、他project source、project/root/HEAD/digest/owner/scope各欠落のいずれかを既定値補完して受入れたら不合格。
- **責務・失敗時の戻し先**：L2-003のidentityと、構成sourceのrevision/digest。Ownerが不明ならその不明を維持する。 失敗時は、対象のowner/scopeが不明ならL1-004へ戻し、実行を停止する。承認のない構成を推測採用しない。
- **観測証拠**: source identityとrevision、入力scope、SECURITY判断と理由、owner別の応答・未観測、対象operationの最終状態。secretの値や不必要なasset内容は証拠へ記録しない。

### SECURITY-CASE-005-01 — secret/credential

- **対象AC**: `SECURITY-AC-005-01`
- **固定L11受入oracle**：raw credentialはcontext/log/artifactに現れず、範囲・operation・target・expiry付き利用だけが許可され、期限切れ/revoked credentialの後続利用が止まる。repository混入、直接Worker露出、egress漏れ、値入りreceiptがあれば不合格。
- **fixture/oracle**: normal fixtureでは非公開scope付きcredential-useだけを呼び出し、actor/operation/target/environment/scope/expiry/purposeを既存credential-use/authority tupleと照合し、生値が全観測出力から除外される。各fieldの欠落/不一致、expired/revoked、直接store、値入りartifact/receiptは個別拒否。
- **fixture追加**：複数consumerに同一canonical classifier identity/revisionを与える正常例と、consumer一つだけ独自判定を使う例、classifier版がstale/unknownの例を比較する。
- **未見の正常例**：異なる種類の合成credential consumerでも、既存canonical classifierの同一identity/revisionと完全な既存authority tupleを使う場合は、raw値を受け渡さず同じclassification/use結果を得る。consumer種別が未見という理由だけでdenyせず、未結束classifierやunknown authorityを許可にしない。
- **negative/boundary oracle**：raw secretがcontext/file/artifact/log/Tool result/egressに現れる、Workerへstoreを直接見せる、expired/revoked/mismatched useを続ける、秘密をreceiptへ書く、consumer別classifierを作る/同じinputの分類結果が食い違うfixtureは不合格。正しい非公開scoped credential-useを一律denyすることも不合格。
- **責務・失敗時の戻し先**：L2-008 authority、L2-006 egress、Worker境界L2-007、INFRASTRUCTUREの安全な実資源境界。 失敗時は、欠落scope、期限切れ、未知のcredential class、検査不能はdeny/stop。方針の不足はL1-005へ、保存・注入境界はL2-024へ戻す。
- **観測証拠**: source identityとrevision、入力scope、SECURITY判断と理由、owner別の応答・未観測、対象operationの最終状態。secretの値や不必要なasset内容は証拠へ記録しない。

### SECURITY-CASE-006-01 — egress

- **対象AC**: `SECURITY-AC-006-01`
- **固定L11受入oracle**：送信先/protocol/endpoint/data class/bytes/purpose/authority/expiryを照合し、明示許可された範囲内の送信だけを通す。分類はL2-016の1.0分類記録基盤から読み、L2-019や1.x sink enforcementが存在しない状態でも1.0の送信判定は成立する。vendor側privacy設定だけがある送信、未許可destination、未知classificationが通れば不合格。L2-019のasset-specific egressは別の1.x受入とする。
- **fixture/oracle**: 明示許可内、宛先/protocol/path不一致、unknown class/authority、期限切れを対比し、default-deny基準の許可一覧、個別判断、送信量計測とdata-minimization結果を出力として照合する。vendor privacy設定のみの根拠では許可されず、1.0判定を1.x sink availabilityへ依存させない。
- **negative/boundary oracle**：未許可destination/protocol/path、unknown classification/purpose/authority/expiryを送信可能にしたら不合格。vendor privacy設定だけでallowしない。asset-specific 1.x sinkがないことだけで1.0一般egress判断を不合格にしない。
- **責務・失敗時の戻し先**：L2-005のsecret検査、L2-016の1.0分類基盤（data-use classificationとasset exposure classの記録だけ）、CONNECTの論理接続、INFRASTRUCTUREの実network経路。L2-019のCore Asset Egress GuardとL2-016の1.x sink enforcementは依存に含めない。 失敗時は、宛先/分類/目的/authorityがunknownならdenyし、方針の意味差はL1-006へ戻す。物理経路の不明はL2-024へ。
- **観測証拠**: source identityとrevision、入力scope、SECURITY判断と理由、owner別の応答・未観測、対象operationの最終状態。secretの値や不必要なasset内容は証拠へ記録しない。

### SECURITY-CASE-007-01 — 実行環境制約

- **対象AC**: `SECURITY-AC-007-01`
- **固定L11受入oracle**：各制約（write path、network、credential、environment、timeout、resource、diff検査、rollback、result collection）がWorker実行環境へ渡り、適用・観測状態を確認できる。いずれか未適用/unknownなのにhost fallbackで実行、制約をWorkerが自己拡張したら不合格。read-onlyでもwrite禁止の適用と操作対象scopeの実行後の変更なし観測を要する。rollbackだけは変更なしを確認できた場合に限り適用対象外とでき、変更有無がunknownなら成功扱いしない。以下の9制御fixture表で条件を個別に確認する。
- **fixture/oracle**: 制約ごとにrequest→environment acknowledgement/evidenceを検査。欠落・unsupported・自己拡張を投入し、起動停止/unknownを確認する。read-onlyもscope内変更なしを観測。rollback N/Aは変更なし確認時のみ。
- **negative/boundary oracle**：一つでもconstraint→実行環境適用が未確認/unsupported/unknownなのに開始、host fallback、Worker自身のscope拡張があれば不合格。read-onlyで変更があれば不合格。変更なしを確認したrollback N/Aだけ許す。
- **責務・失敗時の戻し先**：Concept/Worker実行契約、OS assignment、INFRASTRUCTURE実資源、L2-003/005/006/008。旧Runner/Sandbox actorを復活させない。 失敗時は、未適用/未観測/unsupportedは実行停止・unknown。SECURITY方針不足はL1-007、物理enforcement欠落はINFRASTRUCTURE接続の候補へ戻す。
- **観測証拠**: source identityとrevision、入力scope、SECURITY判断と理由、owner別の応答・未観測、対象operationの最終状態。secretの値や不必要なasset内容は証拠へ記録しない。

## SECURITY-CASE-007-01 の9制御fixture

各行はL2-007が列挙する独立制約を一つずつ欠落・不一致にする。合成fixtureのみを使い、外部作用は行わない。

| 制御 | fixture入力 | 欠落/不一致条件 | 観測owner・証拠 | 合格条件 |
|---|---|---|---|---|
| write path | assignment scope内の許可pathとread-only/write条件 | pathを一つscope外へ差替え、またはwrite禁止を欠落 | Worker enforcement owner;要求/実効pathと実行後状態 | scope外write 0、read-only時対象変更なし |
| network | assignmentで宣言したnetwork scope | destination/protocolを許可外にする | Worker/INFRASTRUCTURE owner; endpointと拒否結果 | 未許可egress 0 |
| credential | credential classとscope/expiry/revoke state | credentials noneの条件でfallbackを試す、特権credentialへfallback、Workerからhost credential参照、scope不一致/unknown/期限切れを独立投入。別fixtureで有効scoped capabilityをraw値非到達で使う | SECURITY/credential owner;値を含まない判断receipt | 無許可利用とraw value記録0。既存条件内のscoped useは一律denyしない |
| environment | SECURITYが宣言しassignment/policy revisionへ束縛した許可set、Worker実行環境identity | 固定L11例の`TASK_MODE`/`LANG`だけを許可し、許可外の`HOST_SECRET_REF`（値なし）を拒否する。許可set欠落/改変・別環境適用も独立変異 | SECURITY policy owner + Worker enforcement owner;宣言setと実適用観測 | SECURITYが宣言したsetだけ適用。許可外変数の継承と適用観測欠落/unknownでの実行0。secret値を露出させない |
| timeout | assignment/runtime ownerの宣言時間値 | 宣言値到達/超過と観測不明を比較 | Worker owner;宣言値と停止event | 宣言境界を超える処理を成功にしない。未宣言値を補わない |
| resource | SECURITY制約へ結び付いたpolicy revision、assignment内resource条件、Workerの実適用状態 | 条件を欠落、設定だけ宣言して適用観測を欠落、実resourceを境界超過させる | SECURITY policy owner + Worker enforcement owner;要求/実効resource観測 | 設定だけで適用済みとしない。欠落/unknown/超過で継続しない |
| diff検査 | operation前後の対象scope diff | 許可scope内の実差分positive、scope外差分、実post-stateとdiff不一致、secret markerを含むdiff記録、diff receipt欠落を独立投入 | operation owner/Worker;前後identityとdiff scope | 実post-state照合に合う許可範囲のみ受入れ、scope外差分とsecret記録0、receipt欠落はunknown |
| rollback | 変更有無と既存rollback条件 | rollback計画だけで復旧済と主張、部分復元、無関係scopeも復元、rollback receipt欠落、変更有無unknownを独立投入 | operation/OS owner;実行後状態・rollback結果 | 計画は復旧証拠でない。部分/無関係scope復元を拒否し、変更なしを確認できた場合だけ適用外。unknownは成功扱いしない |
| result collection | operation結果、collection scope、実行後適用観測 | stdout/自己申告だけで適用済みとする、result field/receipt欠落・staleを独立投入 | HARNESS証拠owner + operation owner | 実適用観測の欠落を成功にせずunknown、host fallbackなし |

### SECURITY-CASE-008-01 — operation authority

- **対象AC**: `SECURITY-AC-008-01`
- **固定L11受入oracle**：異なるread/write/execute/network/install/delete/merge/release/deploy/credential-use/security-change操作で別authorityを要求し、actor/target/operation/revision/environment/scope/expiryが完全一致したときだけ影響の大きいoperationを許可する。Agent利用権から包括write/deployが生じる、または欠落・期限切れ・driftを通すと不合格。
- **fixture/oracle**: read authorityでwrite等を試みる、target/revision/scope/expiry driftを各々投入しdenyを確認。exact tupleだけ対応operationへ返す。
- **negative/boundary oracle**：actor/target/operation/revision/environment/scope/expiryのいずれかが不一致/unknownなのにallow、またはread/Agent利用からwrite/deploy権限を推定したら不合格。
- **責務・失敗時の戻し先**：L2-003 identity、L2-004構成integrity、L2-005 credential、L2-006 egress、OSの進行。 失敗時は、未認可、drift、expiry、unknownではdenyし、意味の変更はL1-008へ戻す。停止伝播はL2-009/022で検証。
- **観測証拠**: source identityとrevision、入力scope、SECURITY判断と理由、owner別の応答・未観測、対象operationの最終状態。secretの値や不必要なasset内容は証拠へ記録しない。

### SECURITY-CASE-009-01 — revoke/quarantine

- **対象AC**: `SECURITY-AC-009-01`
- **固定L11受入oracle**：revoke、scope drift、credential漏洩、異常通信、runtime逸脱、unknownを投入すると、OSの新規割当停止、Workerの実行停止と途中成果物隔離、CONNECT通信停止、credential使用停止、artifact access停止の該当先へ伝わる。どれかの該当停止が確認できず成功扱いで継続したら不合格。unknownは列挙triggerの安全上の影響や不明な外部副作用に関するものとし、無関係な一般文書の意味unknownを全操作停止へ広げない。operation/project/worker/credential/connection/artifactの該当identityに束縛して伝播し、recipient別の受領・適用・未達・未観測を区別する。
- **fixture/oracle**: 各triggerを対象identityに結び、該当recipientごとの受領・適用を確認。無関係な通常文書の意味unknownはglobal stopにしない。該当recipient未達をsuccessとして扱わない。
- **negative/boundary oracle**：該当recipientの未達/未観測をsuccess扱いし対象operationを継続したら不合格。無関係な通常操作まで停止することも不合格。伝播相関identityを混同しない。
- **責務・失敗時の戻し先**：L2-003/005/006/007/008、OS assignment、Worker実行環境、CONNECT、artifact access、INFRASTRUCTURE観測。 失敗時は、recipient未応答・未観測・unknownの間は対象operation/新規割当てを止める。authority/policy意味差はL1-009へ、OS/Worker/CONNECT/INFRAのenforcement差はその接続先L1へ戻す。
- **観測証拠**: source identityとrevision、入力scope、SECURITY判断と理由、owner別の応答・未観測、対象operationの最終状態。secretの値や不必要なasset内容は証拠へ記録しない。

### SECURITY-CASE-010-01 — 更新受入

- **対象AC**: `SECURITY-AC-010-01`
- **固定L11受入oracle**：source code、dependency、package、plugin、MCP、Skill、Agent definition、Hook、runtime config、sandbox policy、model、model weights、prompt/system instruction、Connector、infrastructure configurationの15対象それぞれについて、provenance、digest、dependency/permission/network/credential/hook-config差分、新規実行物、known finding、rollback情報が揃い採否と根拠を追える。単に新version、または欠落情報をunknownのまま採用したら不合格。
- **fixture/oracle**: 15種類の対象を代表fixture各一つとして列挙し、版文字列だけの更新とprovenance欠落/差分/rollback unknownを対比する。各項目欠落でunknown/rejectとなる。scanner等の特定実装は前提にしない。
- **negative/boundary oracle**：15種のいずれかでprovenance/digest/差分/known finding/rollback等の該当情報を欠落させても採用、または新versionだけで採用したら不合格。未知はunknown/rejectで、特定scannerの不在は失敗条件にしない。
- **責務・失敗時の戻し先**：L2-011能力差分、L2-012 supply-chain provenance、L2-013 artifact integrity、L2-008 authority。 失敗時は、情報不足はunknown/reject、意味や必要な判定軸の差はL1-010へ戻す。実行/昇格はL2-023に従う。
- **観測証拠**: source identityとrevision、入力scope、SECURITY判断と理由、owner別の応答・未観測、対象operationの最終状態。secretの値や不必要なasset内容は証拠へ記録しない。

### SECURITY-CASE-011-01 — capability drift

- **対象AC**: `SECURITY-AC-011-01`
- **固定L11受入oracle**：同じfile変更でもread-only→write+shell+networkの能力差分を検出し、model/Agent/MCP/pluginにも適用される。hash一致/ファイル名だけでcapability不変と結論したら不合格。
- **fixture/oracle**: 同一ファイル名/ハッシュの固定例でもpermission manifestが変わるfixtureを用い、version差分→capability差分→security impactの比較結果を検出する。model/Agent/MCP/plugin種別で適用を確認する。
- **negative/boundary oracle**：同じfile name/hashでもread-only→write/shell/network等の能力差があれば検知する。差を分類できない状態でcapability不変・受入可としたら不合格。
- **責務・失敗時の戻し先**：L2-004の構成identity、L2-010のcandidate revision。比較不能はunknownとする。 失敗時は、能力を分類できない変更は受け入れず、分類意味の不足をL1-011へ戻す。
- **観測証拠**: source identityとrevision、入力scope、SECURITY判断と理由、owner別の応答・未観測、対象operationの最終状態。secretの値や不必要なasset内容は証拠へ記録しない。

### SECURITY-CASE-012-01 — supply-chain provenance

- **対象AC**: `SECURITY-AC-012-01`
- **固定L11受入oracle**：package/container/GitHub repo/MCP/plugin/Skill/Agent/model/binaryでsource、producer、version、digest、dependency、permission、network、known risk、update delta、rollbackを辿れる。不明な供給元/実行能力をtrustedへ昇格したら不合格。
- **fixture/oracle**: 対象種別ごとにprovenance fieldを確認し、supplier/producer/permission unknown、dependency mismatch、rollback欠落を投入してunknown/reject。
- **negative/boundary oracle**：supplier/source/producer/version/digest/dependency/permission/network/risk/update/rollbackの不明・不一致をtrustedとしたら不合格。特定scanner/registry/providerなしを理由に拒否しない。1.0のprovenance traceから1.x Core Asset Guard/sink protectionの完成を主張しない。
- **責務・失敗時の戻し先**：L2-010更新candidateとL2-013artifact identity。特定scanner/registry/providerを新規必須化しない。 失敗時は、欠落または不一致はunknown/reject。対象範囲の変更はL1-012へ戻す。
- **観測証拠**: source identityとrevision、入力scope、SECURITY判断と理由、owner別の応答・未観測、対象operationの最終状態。secretの値や不必要なasset内容は証拠へ記録しない。

### SECURITY-CASE-013-01 — artifact identity chain

- **対象AC**: `SECURITY-AC-013-01`
- **固定L11受入oracle**：build/validation済artifactのidentityと配布/実行artifactのidentity・digest・provenanceが同じ鎖で一致する。異なるartifact、欠けた工程、digest不一致が昇格可能なら不合格。digest一致だけからsource trustやverification passを推定しても不合格。
- **fixture/oracle**: validation済artifactと配布/実行artifactの同一鎖と、差替え/missing step/digest mismatchを対照する。同じdigestだけでtrust/passとなるfixtureは不合格。
- **negative/boundary oracle**：生成/build/validation/配布/実行のidentity鎖に欠落/mismatch/digest差があるまま昇格、またはdigest一致だけでsource trust/verification passを推定したら不合格。
- **責務・失敗時の戻し先**：L2-010/012の更新・provenance、HARNESS verification receipt、OS promotion record。 失敗時は、identity/digest mismatch、missing stepは昇格停止。意味や必要なidentityが不足ならL1-013へ戻す。
- **観測証拠**: source identityとrevision、入力scope、SECURITY判断と理由、owner別の応答・未観測、対象operationの最終状態。secretの値や不必要なasset内容は証拠へ記録しない。

### SECURITY-CASE-014-01 — 永続化判定

- **対象AC**: `SECURITY-AC-014-01`
- **追加fixture/oracle**：memory／training dataset／BRAIN knowledgeの各target classへ、Memory poisoning／Prompt Injection persistence／training contamination／BRAIN contaminationにつながり得る合成入力を与え、L2-001/002のsource trustと、source/provenance/classification/targetを個別に欠落・unknown・不一致へ変異する。該当targetへのSECURITY判断理由を返し、不足はhold/denyする。L2-015/016のidentity/classificationを入力し、1.x sink enforcementは必須にしない。単体判定からhandoff、LABO評価、BRAIN登録、保存実行を生成せず、3経路はL2-027の別判定へ残す。
- **固定L11受入oracle**：SECURITY単体のdecision tableへmemory、training dataset、BRAIN knowledgeの3 target classを個別に入力し、source/provenance/classificationが欠落・unknown・target不一致ならhold/denyし、理由付き判定を返す。Context→Memory、Episode→Training Dataset、Product Knowledge→BRAINの機構横断受渡しや保存成功をこの単体試験で主張したら不合格。L1-014の構成体kindと3経路の成立はL2-027だけで受け入れる。
- **fixture/oracle**: 三つのtarget classを独立にfixture化し、valid L2-001/002 source trust、L2-015/016 metadataと、source trust・metadata欠落/unknown/target mismatchを比較。判定receiptに理由/targetを残し、保存や構成体完了を示さない。
- **negative/boundary oracle**：source/provenance/classification missing/unknown、または誤targetをallowしたら不合格。判定から機構間handoff、LABO評価、BRAIN登録、実保存を成功扱いしない。
- **責務・失敗時の戻し先**：SECURITYはtargetごとの判定と理由、source ownerはprovenance/classification metadata、target ownerはhandoff/保存、LABO/BRAINは評価/知識格納を所有する。metadata欠落はhold/denyしsource ownerへ返す。target集合・判定意味の変更はL1-014へ戻す。本caseは機構横断完了を主張しない。
- **観測証拠**: source identityとrevision、入力scope、SECURITY判断と理由、owner別の応答・未観測、対象operationの最終状態。secretの値や不必要なasset内容は証拠へ記録しない。

### SECURITY-CASE-015-01 — asset identity

- **対象AC**: `SECURITY-AC-015-01`
- **固定L11受入oracle**：§16列挙の HELIX-HARNESS-CORE（HELIX-JSON、Python meaning core、Requirement Engine、internal verification logic）、HELIX-BRAIN（Patterns、Units、Parts、accumulated design knowledge）、HELIX-INTELLIGENCE（internal prompts、judgment configuration、specialist models、routing / diagnostic logic）、HELIX-LABO（episodes、evaluation corpus、training material）、HELIX-OS（authority/state、topology、operation records）、HELIX-SECURITY（policies、credentials）をowner、identity、source、revision/digestで識別できる。列挙外資産も分類対象となり得る。内容をdumpせず識別不能をpublicと扱ったら不合格。受入は1.0 identity baseだけでWeb保護完了を宣言しない。
- **fixture/oracle**: 列挙資産を各一識別子で照合し、列挙外synthetic assetも拒否されないことを確認。owner/identity欠落はunknownで、本文内容dumpや1.x sink protection完成を合格条件にしない。
- **negative/boundary oracle**：owner/identity/source/revision/digest不明をpublic/trustedとし、内容dumpを要求、または1.0 identity基盤をWeb保護完了に置換したら不合格。列挙外資産を対象から排除しない。
- **責務・失敗時の戻し先**：各資産ownerからのidentity/provenanceとConceptのdata-use classification。 失敗時は、owner/identityが不明ならunclassified/unknownとして保留し、範囲の不足をL1-015へ戻す。
- **観測証拠**: source identityとrevision、入力scope、SECURITY判断と理由、owner別の応答・未観測、対象operationの最終状態。secretの値や不必要なasset内容は証拠へ記録しない。

### SECURITY-CASE-016-01 — classification基盤

- **対象AC**: `SECURITY-AC-016-01`
- **固定L11受入oracle**：1.0ではpublic/customer-owned/service-internal/HELIX-confidential/HELIX-restricted/secretの全6分類を定義し、asset identityへ分類とunknownを記録できる。分類不明をpublic/allowと扱う、または分類記録が欠ければ不合格。1.xではL2-019/025が各sinkへ分類を適用し、confidential以上を無条件出力しないことを別途受け入れる。1.x条件を1.0完了の証拠にしない。
- **fixture/oracle**: 六分類全てをassetに割当て/参照し、unknown/missing classを保持する。sink適用能力を1.0の成功条件に混同しない。
- **negative/boundary oracle**：6分類いずれかの記録欠落/unknownをpublic/allowとしたら不合格。1.x sink enforcementを1.0の必須成功条件にも、1.0の証拠から完成と推定することにも使わない。
- **責務・失敗時の戻し先**：L2-015 Asset identity。分類の定義ownerはSECURITY。sink enforcementを必要としない。 失敗時は、未分類/unknownはunknownとして保持し、公開allowの根拠にしない。分類意味の変更はL1-016へ戻す。
- **観測証拠**: source identityとrevision、入力scope、SECURITY判断と理由、owner別の応答・未観測、対象operationの最終状態。secretの値や不必要なasset内容は証拠へ記録しない。

### SECURITY-CASE-020-01 — Guard/Bot境界

- **対象AC**: `SECURITY-AC-020-01`
- **固定L11受入oracle**：Injection Guard、Scope Guard、Hook Guard、Secret Guard、Egress Guard、Runtime Guard、Permission Guard、Core Asset Guardの決定的判定をGuard側に置く。Bot候補例のSecurity Audit Bot、Injection Analysis Bot、Core Probe Detection Bot、Supply-chain Review Bot、Security Diagnosis Botはsemantic judgement/diagnosisのため必要に応じINTELLIGENCEへ接続する。候補例は全Botの初版実装・運用を要求しない。Bot不在を理由に決定的制約が抜ける、Botが包括Write権を持つ、候補を全て1.0必須runtimeとするなら不合格。Core Asset Guardの名称を保持しつつ、1.0のGuard基盤とL2-019/025の1.x公開sink適用を別に判定する。名称の列挙だけで完全なasset-specific egress/Web保護を1.0へ前倒しせず、逆に1.0のcredential・一般egress・operation guardを延期しない。
- **fixture/oracle**: 8 Guardそれぞれに、規則が定義済みでBotなしの通常入力と、必要時に限定scope/authorityを持つBot補助を加えた同一入力を与え、同じ決定結果になることを確認する。独立fixtureでGuard rule未定義または適用不能、必要なenforcement観測欠落を入力し、1.0条件を推測で補わず該当enforcement ownerへunknown/holdを返す。Bot候補が不在でも決定的Guard条件を落とさず、Bot requestのscope/authorityを検査し包括writeを拒否する。1.x sink protectionを未実装のまま1.0 Guardを評価する。
- **negative/boundary oracle**：決定的条件をBotに依存、Bot不在でGuard条件が抜ける、Botに包括write権を与える、全候補Botを1.0必須化するなら不合格。1.x asset-specific sink適用と1.0 Guard基盤を混同しない。
- **責務・失敗時の戻し先**：L2-008 authority、Worker契約、INTELLIGENCE発行interface。失敗時は、Guard未定義/不適用や必要観測欠落を対象enforcement ownerへunknown/holdとして返す。Botがいないことだけでは1.0を不成立にせず、未定義のruleをBotへ委譲して埋めない。境界意味の変更はL1-020へ戻す。
- **観測証拠**: source identityとrevision、入力scope、SECURITY判断と理由、owner別の応答・未観測、対象operationの最終状態。secretの値や不必要なasset内容は証拠へ記録しない。

### SECURITY-CASE-028-01 — SECURITY pack更新

- **対象AC**: `SECURITY-AC-028-01`
- **固定L11受入oracle**：HARNESS-L2-010/011の共通pack descriptorを入力し、SECURITY更新candidateのidentity/version/artifact digestがdescriptorと一致し、dependency versionが宣言compatibility range内で、provenanceとL2-010/013のSECURITY条件を満たす場合だけSECURITY固有の受入判定を返す。`version_target`は目標版で実版ではない。identity/version/digest欠落、不一致、range外、unknownを通せば不合格。共通交換/rollback/未完義務lifecycleの所有・受入をSECURITY-L2-028の証拠に含めたら不合格。
- **fixture/oracle**: descriptor一致の候補、identity/version/digest欠落/不一致、dependency range外、unknownを対比。security固有判定だけを検証し、共通pack lifecycleをSECURITYへ帰属させない。
- **negative/boundary oracle**：descriptor/SECURITY artifact identity・version・digest不一致、dependency range外、provenance missing/unknownを受入れたら不合格。version_targetを実artifact versionと解釈しない。共通exchange/rollback/unfinished lifecycleをSECURITY所有として検証しない。
- **責務・失敗時の戻し先**：SECURITYは固有のaccept/reject/unknown判定、HARNESSは共通descriptor・交換・rollback・未完義務lifecycle、OSはassignment/progression、artifact ownerはsource identityを所有する。SECURITY固有の受入軸の変更はL1-010、artifact identity/integrityはL1-013、共通lifecycle契約の不足はHARNESS L2-010/011へ戻す。本caseはHARNESS lifecycleを肩代わりしない。
- **観測証拠**: source identityとrevision、入力scope、SECURITY判断と理由、owner別の応答・未観測、対象operationの最終状態。secretの値や不必要なasset内容は証拠へ記録しない。

### SECURITY-CASE-033-01 — 外部AI Worker contextと出力

- **対象AC**: `SECURITY-AC-033-01`
- **固定L11受入oracle**：PO採択P0 oracle: 既存L2-008 authority、非公開・範囲付きL2-005 credential-use、該当L2-007 enforcementとL2-006 egress条件が揃えば、毎回承認なしでdispatch可能。raw secret値またはsecret/機密task内容の露出は拒否し、出力単独ではauthority/stateを作らない。
- **fixture/oracle**: normal credential-use caseはscope/operation/target/revision/expiry一致の既存L2-008 authority、非公開scoped capability、L2-007、該当L2-006条件ありで起動可能。raw value/secret contentを渡すケースはdeny。context mismatch/stale/unboundはdispatch停止しOS assignmentへ戻す。self-reportでapproval/verified/canonical stateを書き換えられない。採択されたL11 P0をoracleに含める。
- **追加fixture**：主Workerの通常taskでは033のbinding/既存authorityだけを適用する正常例と、033だけで追加runtime限定の029 opt-out/public-onlyまたは031 proposal-only/canonical no-access条件を課す変異を対照する。追加runtimeを選択した別fixtureでは029/031と005/006/007/008の条件をすべて照合する。Worker version/config、target、rule revision、authority revision、assignment scopeを別々に変え、各々で古いcontext bindingが再利用されないことを確認する。互換性不明ではunknown/denyとし、schemaや承認者を補作しない。SECURITYによるassignment決定、OSによるauthority決定、有効authorityへの都度追加承認をそれぞれ独立に変異させる。raw secret値とsecret/機密task本文は独立に拒否し、無関係な通常taskも対照にする。
- **negative/boundary oracle**：上記各binding変化で旧bindingを流用したdispatch、互換性unknownのままのdispatch、他owner判断の代行、都度承認の追加はいずれも不合格。binding/authority/assignment/規則revision/task boundary mismatch、L2-007 enforcement欠落時にdispatchしたら不合格。raw secret値またはsecret/機密task内容を渡すdispatchは拒否。別HEAD成果の受入、無関係taskまで一律停止も不合格。正しい既存credential-use capabilityを使うtaskをcredential-useだけで拒否するのも不合格。Worker出力だけでapproval/verified/canonical stateが変われば不合格。
- **責務・失敗時の戻し先**：OSはassignment/progression、Worker環境ownerは実行隔離/enforcement、SECURITYはauthority、HARNESSはtask contract/共通交換を所有する。bindingが欠落/unknown/stale/不一致ならdispatchを止め、対象revisionと不足を既存OS assignment ownerへ返す。
- **観測証拠**: source identityとrevision、入力scope、SECURITY判断と理由、owner別の応答・未観測、対象operationの最終状態。secretの値や不必要なasset内容は証拠へ記録しない。


### Stage 1の未見正常・局所unknown対照

Stage 1の19親（L2-001〜016、020、028、033）ごとに、既存契約のscope・owner・revision・必須根拠を満たす未見のsynthetic identity/configurationを1件与え、対応する同一親の正常ACで判定できることを確認する。未見という理由だけで拒否せず、同じfixtureの別入力でそのACに必要なidentity、authority、classification、適用観測のいずれかを個別に欠落・unknownへ変異し、該当scopeだけをunknown/holdへ戻す。未見対象を新たな必須source、runtime、1.x sink、全体停止条件へ拡張しない。

## 横断シナリオと総合判定

1. **untrusted input → operation**: `SECURITY-AC-001-01/002-01`の命令様外部dataがtool/authority経路へ直結しないことを確認し、`SECURITY-AC-008-01`で別operation authorityを維持する。
2. **classification → egress**: `SECURITY-AC-015-01/016-01`でasset identity/classificationを与え、`SECURITY-AC-006-01`でunknown classはdeny、known classも明示送信条件と合致した範囲のみ許可する。Web 1.x sinksはこの1.0検証に含めない。
3. **credential + external Worker**: `SECURITY-AC-005-01/007-01/033-01`を結び、有効な既決credential-use capabilityはraw value/secret content非露出条件で使えること、秘密そのもの/機密task contentのdispatchは拒否することを確認する。P0訂正を欠落させた全credential-use denyはfail。
4. **revoke → CONNECT/OS/environment**: `SECURITY-AC-009-01`で該当recipientへ伝播し、`SECURITY-AC-008-01`のoperation停止、`SECURITY-AC-007-01`のenvironment適用状態をowner別に突合する。無関係scopeへの全停止はfail。
5. **update → artifact**: `SECURITY-AC-010-01/011-01/012-01/013-01/028-01`のcandidateを同じdescriptor/artifact chainでたどり、capability drift/provenance/identity mismatchをacceptにしない。共通pack exchange/rollbackはHARNESS ownerの検証へ残す。
6. **persistence judgement separation**: `SECURITY-AC-014-01`は3 target classへのSECURITY判断のみを返す。L2-027の機構横断handoff、LABO評価、BRAIN登録/保存は別検証としてこのsliceで成功扱いしない。

総合pass候補はStage 1の19 AC、Stage 2cの031の4 AC、Stage 3の029/030/032/034/035の14 AC、Stage 4の021/022/023/024/026の16 AC、Stage 5の027の4 AC（計57 AC）と上記境界シナリオを各scope内で照合し、authority・owner・1.0/1.x境界が一貫すること。各caseは同一revisionのL3 ACへ対応させ、unknown/未観測をpassにしない。これは未実行の設計であり、受入結果を生成しない。旧HELIX regressionは後続横断検証として別途残す。

## Stage 2c — HELIXSECURITY-L2-031対検証設計

固定L2 revision `318ec4a04abb3c1cc17111b3d939f913facd5fd3`、L2全文SHA-256 `d3103f909e540e35a95310e6741cfd038a87789150577ea182a941d58a5f2bd5`、fixed section `427–446` / SHA `db2fd29654cc210b3c06568f4e421560b069d36f8d69f04fbe413d83ad532765`。対L11全文SHA-256 `e30e63771d58dae2ca69cb9cfff5d2ab6eb71311144aa263b068cb4ae4fbf556`、section `104–115` / SHA `3b2700d511ea0feb8bbeb3dcedd7dd3eb9d1a26a2aeb9c79f57f835c045c0cd7`。以下は合成fixtureのみの未実行設計。

### SECURITY-CASE-031-01 — 適用scopeと既存authority

- **L3 AC**：`SECURITY-AC-031-01`
- **正常／held-out positive**：031が対象とする追加runtime operationについて、L2-029、005、007、008、OS-018、INFRASTRUCTURE-010を常時照合し、既存authority・assignment・runtime/config・target/scope/data conditionsが一致する例を与える。HARNESS-L2-023は依存4区分を宣言する参照契約として読むが、010/011を031の常時run dependencyにしない。未見fixtureでも必要条件がそろえば判定できる。
- **条件別negative／対照／unknown**：常時必須のL2-029/005/007/008、OS-018、INFRASTRUCTURE-010を各々独立にmissing/stale/wrong-scope/wrong-version/out-of-range/compatibility-unknownへ変異し、該当runをholdしてその依存を宣言するownerへ戻す。採択済みpack revisionがdependency ID/owner/contract version/range/scopeを固定していないfixtureは開始保留とする。006は外部runtime接続/data送信を選んだoperationでのみ欠落を変異、009は停止/逸脱が発生したfixtureでのみ欠落を変異する。022/023・HARNESS verification・OS promotion/handoffはproposal検証・採択・昇格stageでそれぞれ照合し、実行前提へ前倒ししない。source選択時はそのsourceのidentity/revision/scopeを照合し、未選択sourceは未観測として扱う。HARNESS-L2-023は参照契約として010/011を常時依存にしない。旧runtime/CLI/test-designは参照資料で実行closure外。primary Worker、追加runtimeなし、別scopeは対象外対照として無用に停止しない。
- **oracleと戻し先**：条件が揃ったpositiveはallow/constrain、欠落/不一致は既存ownerへ具体理由付きで返す。authority意味不足はSECURITY、assignment不足はOSへ返す。fixture noveltyのみをunknown根拠にしない。

### SECURITY-CASE-031-02 — isolated copyとcanonical境界

- **L3 AC**：`SECURITY-AC-031-02`
- **正常**：manifest/digest付きの最小合成payloadを別個のassignment-bound copyへ払い出し、許可範囲のproposal/限定diffを返す。
- **negative**：canonical repository、要求、authority、ticket/assignment、workflow、evidence/receipt storeへのread/writeを個別に試行し拒否・停止を確認する。出力から要求/authority/acceptance/merge/promote状態を変更する試行も拒否する。
- **oracleと戻し先**：copy内の通常提案は可能、canonical direct accessとauthority化は0件。実隔離適用はWorker environment/INFRASTRUCTURE、assignmentはOS、policyはSECURITYへ返す。

### SECURITY-CASE-031-03 — classificationとcredential非到達

- **L3 AC**：`SECURITY-AC-031-03`
- **正常**：L2-029の許可class/opt-out条件と既存operation authorityが整った合成taskを与え、非公開scoped credential-use capabilityをraw valueなしで使う場合は新たな一律拒否がないことを確認する。
- **negative**：raw secret marker、secret/機密task、unknown class、secret値のcontext/env/payload/artifact/receipt露出を個別に投入し、遮断/unknownと値露出0を確認する。opt-out完了だけで禁止classが許可される対照も拒否する。
- **oracleと戻し先**：L2-005/006/007/008/029の既存条件を再利用し、この要件でclassやoperation permissionを増やさない。classification/policyはSECURITY、実資源適用はWorker environment/INFRASTRUCTUREへ返す。

### SECURITY-CASE-031-04 — receiptの実行後生成

- **L3 AC**：`SECURITY-AC-031-04`
- **正常**：開始前のpolicy/assignment/runtime/config/payload/scopeだけを与え、Worker/INFRASTRUCTUREから一致する隔離・data/credential/egress適用観測を受けてpolicy条件と突合しproposal可否を返す。実行後に同一tupleのresult/diff receiptを別入力し、HARNESS既存oracleの再検証状態も別に観測する。
- **negative／根拠あるunknown**：Worker/INFRASTRUCTUREからの適用観測を、欠落・false・non-applied・別revision・別scope・別assignment/runtime/targetの各状態へ独立に変異させる。SECURITYがpolicyを強制する、SECURITYがcommit判断を行う、OSがpolicy/enforcer/実資源を代替する、INFRASTRUCTUREがauthorityを発行する、またはWorker自己申告だけでHARNESS再検証を満たすowner越境を個別入力にする。deny/unknown後にhost環境へfallbackする試行を与える。実行開始後のpolicy・authority・assignment・runtime/config・scope変更に加え、payload、credential条件、data classificationを各々変え、旧照合を再利用する変異を与える。さらに許可隔離環境で既存quota制限に達した実行失敗、scope外diff、egress逸脱を与える。source未選択ならsource固有closureを求めずunobservedとし、明示選択sourceの観測欠落は未完とする。
- **oracleと戻し先**：policy・assignment・実適用・再検証が同じ対象revision/scope/ownerへ結合した観測だけ条件適用の材料とする。欠落/non-applied/drift/host fallback/scope外diff/egress/既存quota制限失敗は対象runを成功扱いせず、停止/隔離して未完理由と正しいownerへ返す。変更されたpolicy/authority/assignment/runtime/config/scope/payload/credential条件/classificationは再照合前に旧結果を流用しない。SECURITYのcommit判断とOSのenforcer/実資源代替を拒否し、既存HELIXSECURITY-L2-009の停止伝播を使ってOSの既存assignment/未完義務記録へ接続する。対応するpolicy=SECURITY、assignment/未完=OS、適用=Worker/INFRASTRUCTURE、oracle=HARNESS ownerを識別する。quota上限やretry/routing規則は新設しない。SECURITYは実適用・enforcement receipt、assignment、commit判断、実行、資源配置を所有しない。result receiptは実行後の証拠で、単体で昇格を作らない。

この設計はprimary Workerへの適用拡張、毎作業の人間承認、実runtime/secret/canonical stateへのアクセスを要求しない。

## Stage 3 — 029／030／032／034／035のpaired総合検証

固定親・PO判断・旧asset pinsは[L3機能要件](../L3-requirements/functional-requirements.md)の同じStage 3節を使う。caseは合成入力と観測契約の設計であり未実行。正常と各変異は他条件を保った独立fixtureとし、owner別出力・未完義務を観測する。未見正常入力は必要なscope/revision/根拠が揃えば受け入れ、未知の能力や証拠を成功へ補作しない。

| case ID | 親L3 AC | fixture／観測点 | 合格oracle／反例・未評価の戻し先 |
|---|---|---|---|
| `SECURITY-CASE-029-01` | `SECURITY-AC-029-01` | 同一追加runtimeのpublic、機密、secret/PII、分類unknownを別入力とし、opt-out完了/未完/不明と有効既存authorityを組合せる。path allowlistと検査結果も欠落させる。 | 機密以上・未分類・検査不明を委譲成功にしない。未完opt-out下の適格public限定委譲は可能だが採用未完。opt-out完了で機密許可にせず、raw値非到達のscoped credential-use正例を一律拒否しない。不足はdata/検査/runtime条件ownerへ返す。 |
| `SECURITY-CASE-029-02` | `SECURITY-AC-029-02` | 四証拠が適用されるwrite+network fixtureからsandbox適用claim-only、allowlist scope不一致、egress unknown、FS scope外差分を一つずつ作る。networkなしとread-only正例、型適用性unknownも比較する。 | 一型不足は他型で相殺しない。実観測と同一tupleを照合し、policyはSECURITY、適用/測定はINFRASTRUCTURE/Workerへ返しOSに未完を残す。read-onlyは既存007のwrite禁止/不変観測を用い、新しいFS-diff必須条件を加えない。根拠付き非該当とunknownは別状態。 |
| `SECURITY-CASE-029-03` | `SECURITY-AC-029-03` | runtime config/target revision/scopeを変えるfixtureに加え、同一runtimeでpayload revisionまたはclassificationを変えて旧判定を残すfixtureを個別に与える。provider privacy UI/remote flagだけの入力と、ローカル観測のみの入力を分ける。主Workerの許可済み非公開repository作業をscope外の正常対照にする。別fixtureでは追加runtimeが自分を主Workerと名乗り、実runtime identity/classificationが追加runtimeのままのケースを与える。 | payload/classificationを含むtuple変化後は旧証拠を流用しない。provider側確認とローカル強制の出所/状態を独立に返し、片方から他方の保証を生成しない。追加runtimeの自己申告だけで29条件を逃れることも不合格。未観測は該当ownerへ、主Worker通常taskへの029制限拡張は不合格。十分な新tupleの未見正常入力は評価可能。 |
| `SECURITY-CASE-029-04` | `SECURITY-AC-029-01..03` | 追加runtime operationのsource/target revision、runtime identity/version/config、OS-018 assignment、L2-029 scope、許可隔離環境の適用状態を常時入力し、各々をmissing/stale/wrong-scopeへ独立に変異する。さらに当該operationに適用されるL2-006/007条件を欠落/unknownにし、network egress、write、read-onlyの条件別fixtureと未選択sourceを対照に置く。 | 常時依存のいずれか欠落/不一致で該当runをholdし、宣言ownerへ戻す。L2-006/007の適用条件も不成立なら成功claimを作らない。read-onlyは新しいFS-diff条件を加えず既存write禁止/対象不変oracleを使う。主Worker通常taskへ029を拡張せず、HARNESS 010/011は常時dependencyにしない。未選択sourceは未観測。 |
| `SECURITY-CASE-030-01` | `SECURITY-AC-030-01` | 限定段階の自動適用拡大に操作permission、最小権限、監査、巻戻し/停止、risk owner責務/受領先、監視/異常検知、threat model、継続risk reviewを揃える。各条件を個別欠落/unknownにする。 | 正常は条件ごとに同じrevision/scopeへの充足根拠。各不足は拡大を保留し未完をownerへ返す。owner名だけ、ログだけ、外部API/code executionにrevert/disableなしを充足扱いしたら不合格。 |
| `SECURITY-CASE-030-02` | `SECURITY-AC-030-02` | 新接続先・能力・未分類dataを一つずつ加え、旧確認の無検査流用を試す。運転中の監視による条件喪失と無関係scope正常も与える。 | 対象拡大のみ不足/unknownを保持し、条件喪失は既存009へ渡す。無関係正常scopeの一律停止や未観測をriskなしにしたら不合格。 |
| `SECURITY-CASE-030-03` | `SECURITY-AC-030-03` | 有効な同一revision/scope/条件で通常operationを反復し、SECURITY確認だけでOS昇格した入力、新しい中央risk承認者を要求する入力を対照にする。 | 既存有効条件を再利用できる。新しい都度approve・中央owner追加0、他ownerの意味/昇格/実行許可代行0。必要根拠が不明なら該当ownerへunknownを返す。 |
| `SECURITY-CASE-032-01` | `SECURITY-AC-032-01` | 主Workerと追加runtime各々に同一repository/operationの有効permanent denyを与え、one-shot markerとprovider flagを別々に変える。別repository flagも対照にする。 | 下位marker/flagがあってもdeny維持。主Worker漏れ、追加runtimeだけに限定、別対象policyの流用、無権限解除は不合格。 |
| `SECURITY-CASE-032-02` | `SECURITY-AC-032-02` | 主Workerと追加runtimeのそれぞれについて、policy unknown/stale、適用unknown、確認済み非適用を別fixtureにする。非適用には既存008 authorityのvalid/invalid双方を与え、片方のprovider/runtime区分だけを照合から落とす変異も与える。 | unknown/staleは既存fail-closeへ、確認済み非適用は既存authority評価へ返す。032単独で新allow/denyを作らず、追加承認・policy変更主体・失効主体も増やさない。旧runtime/enforcerを復帰させず、035条件の主Worker拡張や無関係operation停止は不合格。 |
| `SECURITY-CASE-034-01` | `SECURITY-AC-034-01` | 同一profile/revisionのread-only capability正例へwrite-capable probe、operation不一致、profile/revision/capability欠落/unknown/staleを独立変異する。別profile正常も対照にする。 | 正例は当該operation評価可能、各反例は該当profileだけdeny/hold。別profileのcapabilityで補わず、能力供給が不明ならそのownerへ返す。 |
| `SECURITY-CASE-034-02` | `SECURITY-AC-034-02` | 有効scoped credential-use+既存authority/egress/Worker条件正例と、raw secret要求、未許可destination、authority tuple要素欠落を独立に与える。 | 正例をcredential利用だけで拒否せず、各反例は005/006/008へ戻す。CONNECT互換性でsecurity許可を代替しない。実secretをfixture/証拠へ書かない。 |
| `SECURITY-CASE-034-03` | `SECURITY-AC-034-03` | CONNECT identity/互換、SECURITY条件判定、Worker/INFRA適用観測を分け、catalog列挙・typed設定・typed safety/read-only-probe供給・登録集合が不明な入力と未見正常profileを比較する。独立変異としてCONNECTがcredential/egress/tool safety policyを発行、SECURITYがprofile registryまたは業務意味を所有、Workerが制約を自己拡張する入力を一つずつ与える。 | 未完の意味は既存ownerへ未closureで返し、L2-018の1.x probe observationだけで契約を満たした扱いにしない。3種のowner越境は不合格。catalog/schema/probe方式を補作せず、都度承認や無関係profile停止を加えない。 |
| `SECURITY-CASE-035-01` | `SECURITY-AC-035-01` | 追加runtimeの明示allowlist対応正例、非対応確認済み経過措置正例、対応なのにYOLO代替、能力unknown/staleを別々に与える。各入力に対象revisionの既存operation authorityとrepository policy/deny stateを常時含め、policy/deny状態を選択時だけ照合する変異も与える。 | 対応時はallowlist、非対応の有効policy内経過措置はrun限定。対応/unknownからYOLO許可を作らず、既存deny/policy条件を常時照合する。既存authorityなしは本case正常にせず既存ownerへ戻す。 |
| `SECURITY-CASE-035-02` | `SECURITY-AC-035-02` | run限定設定を持つ追加runtimeでsuccess/failure/cancel各終端と次runを与える。各終端の設定残置・cleanup観測欠落を別変異する。 | 全終端で除去し次runへ継承しない。残置/未観測はcleanup未完としてWorker/OSへ返し完了成功にしない。固定期限や設定schemaは作らない。 |
| `SECURITY-CASE-035-03` | `SECURITY-AC-035-03` | repository deny switchの設定能力あり/なし/unknownと適用状態を分け、同一対象有効denyへのrun設定/provider flag試行、cleanup後、主Workerとbypass非選択正常操作を対照にする。全入力で対象revisionの既存authorityとrepository policy/deny stateを提示し、これらを選択時だけ読む変異を独立に与える。さらに別repositoryまたは別runtimeの過去判定だけを入力する反例と、同一repository/runtime/revisionの現行根拠を与える正常対照を置く。 | 能力と適用を別に観測し、032のdeny優先・cleanup後denyを維持する。別repository/runtimeの判断流用は拒否し、常時policy/deny照合の欠落も不合格。優先成立だけからswitch能力を推定しない。主Workerに035を拡張せず既存条件の適用を免除しない。policy不足はSECURITY、cleanup/適用不足はWorker/OSへ返す。 |
| `SECURITY-CASE-035-04` | `SECURITY-AC-035-01..03` | bypass設定を選ばない通常operationで、選択runtimeのallowlist能力がunknownだが既存authorityとrepository policy/deny stateは有効な入力を与える。別fixtureで既存policyの適用状態unknownを与え、そのpolicyが対象operationに適用される根拠も入力する。run開始/終端/cleanupとdeny switch設定能力のcaseだけを追加runtimeでbypass系設定を選んだrunに限る。source未選択は未観測とする。 | allowlist能力unknownだけを理由に通常operationを新たにdenyせず、unknownからbypass/YOLO許可も作らない。既存policyの適用状態unknownなら該当operationだけを既存契約に従い未完とする。bypass非選択操作へcleanup/switch条件を広げない。HARNESS 010/011を常時dependencyにしない。 |


## Stage 4 — 選択接続の総合検証

親固定sourceは[L3 Stage 4](../L3-requirements/functional-requirements.md)の項目別pinを用いる。各caseで正常・個別反例・未見正常・観測欠落を区別する。以下は設計であり実行結果ではない。

| L10 case | 親AC | 入力・反例・観測 | 判定／戻し先 |
|---|---|---|---|
| `SECURITY-CASE-021-01` | `SECURITY-AC-021-01` | 正常な二sourceについてsource/revision、CONNECT contract version、input/output identity、分類判断と根拠を受領traceへ入力し、contract version欠落・別version・source/revision・分類の各交換を独立に試す。 | 正常traceは全項目が同一情報単位へ結合する。各欠落・不一致はその情報を保留し誤結合0、別sourceのtraceで補完しない。観測不能は未評価として該当ownerへ返す。 |
| `SECURITY-CASE-021-02` | `SECURITY-AC-021-02` | deny、分類欠落、未知sourceを正常public sourceと併置する。 | 対象だけdeny/unknownを維持し、正常情報の包括停止0。 観測できない条件は未評価であり、該当段階ownerへ返す。 |
| `SECURITY-CASE-021-03` | `SECURITY-AC-021-03` | 外部本文へ許可を自称する文を置き、受領成功だけの未見sourceを与える。CONNECTが分類/許可/policy判断を作る変異と、SECURITYが通信・再送・搬送を引き受ける変異をそれぞれ独立に試す。 | 外部自称から権限・保存・採用を生成せず、CONNECTは伝送だけ、SECURITYは分類判断だけを行う。利用根拠不明は未評価、越境は不合格として該当ownerへ返す。 |
| `SECURITY-CASE-022-01` | `SECURITY-AC-022-01` | exact tupleと七要素を一つずつ欠落・変更した依頼を比較し、別fixtureでINTELLIGENCE requestだけを与えSECURITY decisionを欠落させたまま実行を試みる。 | exact条件がそろう依頼だけSECURITY判断を返す。request-only入力は実行へ進まずauthorityを生成しない。tuple不一致を許可へ補完しない。 |
| `SECURITY-CASE-022-02` | `SECURITY-AC-022-02` | 正常assignmentに別revision判断、期限切れ、revoke後判断を個別に結合する。さらに同一有効判断に対しOSがdenyをoverrideする入力と、SECURITYがWorker配置を作る入力を別々に与える。 | 正常はowner別traceが一致。不正結合、OS deny override、SECURITYによるWorker配置はいずれも不合格で割当未完・実行許可なし。ownerへ戻す。 |
| `SECURITY-CASE-022-03` | `SECURITY-AC-022-03` | 制約一致、適用観測欠落、実状態不一致、開始後revokeを与える。別変異でSECURITYがCONNECT通信/retryを所有する、またはOS assignmentを自ら作ることを試す。 | 正常適用だけ観測完了、不足はWorker/OSへ戻し判断成功で相殺0。通信/retryはCONNECT、assignmentはOSのまま。 観測できない条件は未評価であり、該当段階ownerへ返す。 |
| `SECURITY-CASE-023-01` | `SECURITY-AC-023-01` | 正常候補とprovenance欠落、未宣言能力差分、別revision admissionを比較する。 | 不足を判断ownerへ戻し、受付だけの昇格0。 観測できない条件は未評価であり、該当段階ownerへ返す。 |
| `SECURITY-CASE-023-02` | `SECURITY-AC-023-02` | 後続receiptなしの実行開始と、隔離不一致、実行失敗を与える。 | 条件内の開始可能、将来receipt事前要求0、不一致は実行ownerへ戻る。 観測できない条件は未評価であり、該当段階ownerへ返す。 |
| `SECURITY-CASE-023-03` | `SECURITY-AC-023-03` | 実行結果と対象HEADが一致する検証、別HEAD green、検証未実施を比較する。 | 対象一致の検証だけ結果を結合、未実施は未完。 観測できない条件は未評価であり、該当段階ownerへ返す。 |
| `SECURITY-CASE-023-04` | `SECURITY-AC-023-04` | candidate→SECURITY admission→Worker run→HARNESS verification→OS promotionを順に結ぶ全正常例と、各段階を単独に失敗/unknown/missing/staleへ変えるfixture、途中revision変更、SECURITY-only/HARNESS-only/OS-ticket-onlyの各入力を比較する。 | 同一対象の必要結果が揃った段階だけ次へ進む。security accept alone、HARNESS green alone、OS ticket aloneからpromotionしない。不足・staleは昇格0で段階ownerへ戻す。未見の正常組合せは必須入力とrevisionが一致すれば未知だけを理由に拒否しない。 |
| `SECURITY-CASE-024-01` | `SECURITY-AC-024-01` | 正常条件と各条件欠落、別environmentへの引渡しを比較する。 | 正常は条件が一致、不足・異環境は該当ownerへ保留。 観測できない条件は未評価であり、該当段階ownerへ返す。 |
| `SECURITY-CASE-024-02` | `SECURITY-AC-024-02` | 資源正常かつ強制正常、資源のみ正常、強制のみ正常、観測なしを与える。 | 両者適用条件一致のみ完了、不足の相殺0。 観測できない条件は未評価であり、該当段階ownerへ返す。 |
| `SECURITY-CASE-024-03` | `SECURITY-AC-024-03` | 合成markerを通常資源経路へ混入させる反例と有効scoped利用を比較する。INFRASTRUCTUREがclassification/authority policyを作る変異、SECURITYが通常資源/backup/snapshot配置を決定する変異も試す。 | 値露出・無条件保存0、INFRASTRUCTUREによるpolicy/classification生成0、SECURITYによる資源配置決定0、既存条件内利用をcredential使用だけで一律denyしない。 観測できない条件は未評価であり、該当段階ownerへ返す。 |
| `SECURITY-CASE-026-01` | `SECURITY-AC-026-01` | 同じ決定的違反をBotなし、補助あり、補助unknownで比較する。INTELLIGENCEがGuard結果/operation authorityを直接生成する変異、SECURITYがmodel選定/routingを自ら決める変異も試す。 | Guard判断が保持されBot不在だけの停止0、違反の許可化0、Botによるauthority/Guard結果生成0、SECURITYによるmodel/routing決定0。 観測できない条件は未評価であり、該当段階ownerへ返す。 |
| `SECURITY-CASE-026-02` | `SECURITY-AC-026-02` | 正常な限定依頼と出所欠落、scope拡張、自称allow回答を比較する。 | 必要範囲の判断材料だけを受け、unknownは対象保留、自称allowによる許可0。 観測できない条件は未評価であり、該当段階ownerへ返す。 |
| `SECURITY-CASE-026-03` | `SECURITY-AC-026-03` | 未見正常eventと後続Bot能力なしの1.0接続fixtureを与える。 | owner別traceを保ち接続境界を判定、未構築後続能力を1.0失敗へ混入0。 観測できない条件は未評価であり、該当段階ownerへ返す。 |

## Stage 5 — 027三経路構成体の総合検証

固定親pinと旧source処置は[L3機能要件](../L3-requirements/functional-requirements.md)のStage 5節に従う。合成fixtureによる設計であり実行結果ではない。

| L10 case | 親AC | 入力・反例 | 判定／未評価 |
|---|---|---|---|
| `SECURITY-CASE-027-01` | `SECURITY-AC-027-01` | 三経路を異なるsource/requestとsinkで同時に与え、単体014成功だけ、一経路成功だけの対照を置く。 | 三経路の各成立を独立照合し、不足経路を他経路で補完0。 観測不足は該当source/SECURITY/sink ownerへ返し未評価を維持。 |
| `SECURITY-CASE-027-02` | `SECURITY-AC-027-02` | 各経路の各fieldを一つずつ欠落・異版化し、deny/holdを保存成功へ写す反例を与える。 | 欠落対象を保留/拒否し成功保存へ変換0、他経路の正しい証拠は保全。 観測不足は該当source/SECURITY/sink ownerへ返し未評価を維持。 |
| `SECURITY-CASE-027-03` | `SECURITY-AC-027-03` | 三経路に異なるsink接続契約を与え、LABO評価/OS登録の全経路必須化、受渡しから学習完了生成を試す。 | 固有ownerの条件を保ち新しい一律工程や学習完了生成0。 観測不足は該当source/SECURITY/sink ownerへ返し未評価を維持。 |
| `SECURITY-CASE-027-04` | `SECURITY-AC-027-04` | 未見だが条件を満たすsink revisionと、一経路だけ適用性unknownの対照を与える。 | 成立部分を同じ契約で判定、unknown経路があれば構成体成立を主張しない。 観測不足は該当source/SECURITY/sink ownerへ返し未評価を維持。 |

## 選択接続の未見正常・局所未評価の対照

次の各対照は既存ACの追加fixtureであり、新しいACや上流要求を作らない。

| 対象AC | 未見正常入力 | 局所unknown対照／判定 |
|---|---|---|
| `SECURITY-AC-021-01..03` | 未見の外部source契約版が既存適用条件を満たし、source/revision・分類・受領traceが一致する。 | 分類根拠だけ欠落した情報と対比し、正常情報は同じ受領契約で照合、欠落情報だけ保留。外部本文をauthorityにしない。 |
| `SECURITY-AC-022-01..03` | 未見のtask/operation組合せで有効tuple、OS assignment、Worker適用観測が同一対象に揃う。 | 実適用観測だけunknownの対象と比較し、正常対象は既存契約で照合、unknownを判断successで補完しない。 |
| `SECURITY-AC-023-01..04` | 未見capability差分を持つ候補で各段階の同一対象条件・結果が確認できる。 | HARNESS検証だけ未完の候補と比較し、未完は昇格へ渡さず、未見性自体は失敗理由にしない。 |
| `SECURITY-AC-024-01..03` | 未見environmentの既存適用可能contractに対しpolicy、実資源、Worker観測が一致する。 | 実資源観測だけunknownの対照を置き、正常資源だけを照合可能とし、別環境の証拠流用0。 |
| `SECURITY-AC-026-01..03` | 未見eventでも既存決定ruleでGuard判定でき、必要な判断材料の出所が確認できる。 | 意味判断材料だけunknownなら対象材料を保留し、決定Guardの正常な判断は保持。後続Bot稼働を追加必須にしない。 |
