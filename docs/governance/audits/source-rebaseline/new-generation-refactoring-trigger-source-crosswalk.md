# 新世代の構造改善判断と旧Refactoring Trigger候補の対応

確認日: 2026-09-14

## 目的

`refactoring-trigger-admission-{requirements,acceptance}.md`の旧要件6件、旧受入12件を、HARNESSの変更・検証条件と
HELIX-OSの観測・候補・採否統制へ再分類する。旧候補はUIL、System Synthesis、Universal Workflow、RF0..RF6、
current 9 scope、既存CIを前提に承認されたcandidateであり、新世代へ承認状態や実装方式を継承しない。

旧候補には独立したL1利用要求がない。新世代では利用者価値と対象をL1／L2で確定してからL3 trigger契約を導出する。
本表は要求源の照合であり、候補生成、admission、Issue／PLAN生成、runtime write、CIを実行しない。

## 要件の再分類

| 旧ID | 保持候補の意味 | 新世代接続先 | 持ち込まない条件 | 状態 |
|---|---|---|---|---|
| RTG-R-01 | 観測から改善候補を導く規則を版・出典・baseline・window・閾値・反証・期限へ束縛する | HARNESS-L2-004／005、HELIXOS-L2-005／007 | UIL、旧event／finding、既存registry、runtime hardcode検査を固定しない | split_reapproval_required |
| RTG-R-02 | invariant違反、再発、傾向、環境変化等を別triggerとして扱い、単一metricで採択しない | HELIXOS-L2-005／007 | 旧trigger enum、release／provider event、scheduled scan、CI costを必須集合にしない | classification_rederivation_required |
| RTG-R-03 | 候補、finding、根拠、scope、意味保存、必要検証、期限を束縛し、意味変更・故障・外部変化を分ける | HARNESS-L2-004／005、HELIXOS-L2-002／003／005 | RF0、旧route、UIL／System Synthesis、Universal Workflowを継承しない | workflow_rederivation_required |
| RTG-R-04 | primary responsibilityを一意にし、関連影響とauthority未確定を分ける | HELIXOS-L2-001／002／003 | current 9 scope、旧owner、Issue #1170、`authority_pending` enumを固定しない | authority_scope_rewrite |
| RTG-R-05 | 対象集合、評価revision、source、policy、findingを記録し、未評価とfindingなしを分ける | HELIXOS-L2-002／005／007 | 旧coverage receipt、current scope、既存scannerを継承しない | semantic_atom_candidate |
| RTG-R-06 | 観測、候補、採否、有効化を分け、見逃し・誤検出・重複・手戻り・費用を比較する | HELIXOS-L2-005／007 | 旧UIL到達、shadow admission、Issue／PLAN、RF0実行、既存CIを段階条件にしない | measurement_rederivation_required |

## 受入候補の再分類

| 旧ID | 保持候補の反例 | 新世代接続先 | 持ち込まない条件 | 状態 |
|---|---|---|---|---|
| RTG-AC-001／002 | 同じ入力・policyから同じ判断を返し、stale・window・sample・期限を個別に判定する | HELIXOS L10候補 | 旧event exact set、baseline、policy schemaを固定しない | oracle_rederivation_required |
| RTG-AC-003／004 | triggerを区別し、単一metricや定期scanだけで実質findingを生成しない | HELIXOS L11／L10候補 | 旧trigger enum、LOC、Issue数、AI評価を固定oracleにしない | oracle_atom_candidate |
| RTG-AC-005／006 | scope・根拠・意味保存を確認し、unknownや非refactorを誤分類しない | HARNESS L11、HELIXOS L11／L10候補 | `code_clean`、REDESIGN／RECOVERY等の旧routeを継承しない | split_oracle_reapproval |
| RTG-AC-007／008 | owner不明・複数primary・authority未確定を採択済みにしない | HELIXOS L11／L10候補 | current 9 scopeと旧pending判定をoracleにしない | authority_oracle_rewrite |
| RTG-AC-009／010 | source欠落・partial・staleと、評価済みfindingなし・no actionを区別する | HELIXOS L11／L10候補 | 旧receipt schemaやscanner coverageを継承しない | oracle_atom_candidate |
| RTG-AC-011／012 | 観測だけから実行・Issue・PLAN・authority writeへ進めず、複数効果を比較する | HELIXOS L11／L10／L12候補 | UIL、RF0、旧CI cost、既存before／afterを新世代baselineにしない | lifecycle_oracle_rewrite |

## 新世代の構造改善境界

1. HARNESSは、意味保存の判定、変更分類、影響する上流・設計・V-pair、必要検証、差戻し条件を定める。
2. HELIX-OSは、観測、finding、改善候補、scope、重複、採否、割当、結果、効果、失効を管理する。
3. 構造改善候補は要求や設計の意味変更を実行しない。意味変更は対象製品の最上流へ別の変更候補として戻す。
4. metric、AI評価、file size、Issue数、定期scan、旧CI結果の一つだけで改善を採択・実行しない。
5. 旧実装とpolicyはarchive sourceとして意味と反例を保全し、新世代runtimeへ再接続しない。

## 次工程

Concept v4.1と対象別L1で構造改善の利用者価値を定め、HARNESS／HELIX-OS L2／L11へ個別採否する。
新しいscope、trigger、状態、効果指標はその後にL3／L10／L12へ降ろす。要求整理が閉じるまで旧UIL、RF0、
既存scanner、Issue／PLAN自動生成、既存CIを実行しない。

## 2026-10-20 追補：代表assetと直接参照の再照合（#1906、PHCAP-18）

確認revisionは `f6cb2f4f575a3be6c2de027155ee1f9f831320f9`。上の本文・表・次工程は2026-09-14時点の整理として保持する。現在の採択・版・責務は現行Conceptと対象別判断記録から読む。本追補は5代表の静的調査で、台帳の状態や承認を書き換えない。全asset/consumer閉包、本Issueの完了、現runtime成立を認定しない。

### 固定sourceと台帳の対応

下表のpathは全て `archive/legacy-generation-2026-09-14/root/` 内の相対path、行は固定revisionの行番号。SHA-256は同revisionのGit blobのraw bytesを計算し、`docs/governance/legacy-asset-disposition.jsonl` の `source_sha256` と5件全て一致した。台帳5件はいずれも `Historical` / `authority_status: historical` / `disposition: unresolved` / `implementation_status: unknown` / `consumer_refs: []` である。空のconsumer_refsはconsumer不在の証明ではない。

| asset ID | source path | raw SHA-256 |
|---|---|---|
| `LEGACY-ASSET-12E2CD9B07EFAC343ED0` | `docs/governance/candidates/refactoring-trigger-admission-requirements.md` | `4776830ec12a6a464732db56e6ff8d93f89e8e89a6dcb8c175728a82482cc754` |
| `LEGACY-ASSET-603D0E8D8193914F4AC0` | `docs/design/helix/L5-detail/design-refactoring-domain-model.md` | `6561d660925cb2d607f90c8a3fb4477dba959a2aecd48365156a025ce580b57b` |
| `LEGACY-ASSET-3B8F5F0230F7469B5D11` | `docs/design/helix/L6-function-design/design-refactoring-domain-model.md` | `626e177f61cbb8170b0d557241f75fcf2958a5f64d41fc1078f4ef5607c3086e` |
| `LEGACY-ASSET-7EBF2130DE1840722A6B` | `src/state-db/refactor-candidates.ts` | `1f878c2ae0e96e7a44346579baf7bcb7dede758414a7e947a2dcd4805a9633f3` |
| `LEGACY-ASSET-E56701056732E5CF9A1C` | `tests/feedback-refactor-disposition.test.ts` | `002c7aaf6c9f572809c61805847d6c2fc2fe3db7e5ba11eb4f5a62e790e96bfc` |

| 対象 | 実物の確認範囲と到達層の限界 |
|---|---|
| RTG候補 | `refactoring-trigger-admission-requirements.md:29–81`。旧L3候補RTG-R-01〜06と旧candidate固有承認/非current境界を記載。現行への採用ではない |
| DRDM L5/L6 | L5 §0–1・§4–5、L6 §0–1の型/API/対検証の設計。`infinity-loop-design-slice-registry.md:56`のHDS-HIL-16は「未凍結・未実装」。対応L5 test-design:24–25は「全caseは未実装」と明記。設計内のstrict GREENや予定のtest pathを実装・テストpassへ読み替えない |
| 候補scanner実装 | `src/state-db/refactor-candidates.ts:1–16,44–57,266–400`。policy/scan rootを入力に候補を列挙するTS実装が存在する。DRDMの意味保存/authority transaction全APIの実装と同一視しない。台帳のreuse_exclusion_classは`legacy_runtime_cli_or_adapter` |
| dispositionテスト | `tests/feedback-refactor-disposition.test.ts:21–30,38–93`。20信号のfamily分割、元source digest、successor分離、下流未完の記載を検査するコードが存在する。台帳は`legacy_test_fixture_or_oracle`。存在の確認であり実行/passではない |

PHCAP-18の旧「implemented_with_tests」は代表scanner/testの存在を含む粗い分類で、DRDM全体の実装成立を証明しない。元分類を黙って変更せず、上述の対象別到達層の違いをinventory再評価へ返す。固定revisionの`src/`と`tests/`では `buildDesignSemanticSignature` の文字列検索は0件だったが、別名実装・動的接続を網羅する不在証明ではない。

### 直接consumer・参照の区別

archive rootで `rg -uu` により5代表のpath/basenameを検索し、scannerの3公開symbolも`src/`と`tests/`で照合した。以下は実読した代表edgeであり、検索hit全量や推移的consumer closureではない。文書参照、設定の実行対象、同じデータを読む別readerをimport/callと混ぜない。

| source → 参照先/読取側（同archive root内） | 種別・確認位置 |
|---|---|
| RTG要求 → `docs/governance/candidates/refactoring-trigger-admission-acceptance.md` | 要求のfrontmatter `pair_artifact`。対受入への文書参照で、module callではない |
| DRDM L5/L6 → 対test-design | `docs/test-design/helix/L5-design-refactoring-domain-model-integration-test-design.md:15` / `L6-design-refactoring-domain-model-unit-test-design.md:15` が設計を`pair_artifact`として参照。実行testと区別 |
| DRDM L5/L6 → catalog/registry | `docs/design/design-catalog.yaml:334–335,433,472`、`docs/governance/infinity-loop-design-slice-registry.md:56`。所在/対応関係で、runtime接続ではない |
| scanner → doctor | `src/doctor/index.ts:557–561`のimport、`:5568–5573`の`analyzeRefactorCandidates(loadRefactorCandidateInputs(...))`と`candidateRank` call |
| scanner → feedback projection | `src/state-db/feedback-projections.ts:6–10`のimport、`:67–79`の3symbolのcall。旧runtime側の利用であり現runtime consumerではない |
| disposition JSON → disposition test | `tests/feedback-refactor-disposition.test.ts:21–30`が`docs/governance/feedback-refactor-disposition.json`をreadする。`:55–63`はmanifest内のpath/hash照合 |
| disposition JSON → 別reader | `tests/l3-downstream-queue.test.ts:27`も同JSONをreadする。この共有データへの依存を、disposition test本体のimportと呼ばない |
| disposition test → guard設定 | `config/repo-wide-guard-tests.v1.json:14`の対象path列挙。テスト実行済みやpassは示さない |

PLAN名や監査文書に同じ文字列があるだけではcall edgeを認定しない。旧test-designに引用された実行testの所在・全export consumer・scanner policyから先のclosureは未完として残す。

### failure条件と採用・再導出の境界

- DRDM L5 §0・§4のconsumer欠落、provenance/revision/freshness不一致、forged/stale oracle拒否と、対L5 test-designのIT-DRDM-005/012を照合した。これは旧設計のfailure条件と未実装の反例設計であり、実発生のincident・拒否成功の実測ではない。
- disposition testはsource digestとsuccessor分離を検査する。producer allowlist・execution receipt・trust/freshnessの網羅検査とは記述されていないため、これだけを「偽oracle/全consumer漏れを防止した実装証拠」としない。
- 現行で実際に起きた参照追随漏れ・consumer主張の混同はPR #3431/#3432/#3434と親FTの比較入力を参照する。今回の提案にも同じJSONを読む別testとtest本体consumerの混同があり、上記のedge分類へ訂正した。新たな予防gateは足さない。

| 分類 | 保持する意味・現行の比較先 | 保留するもの |
|---|---|---|
| 意味再導出候補 | RTG-R-01〜06の観測/根拠/採否分離と、DRDMのconsumer/oracle保全。現行HARNESS-L2-004/005のtrace/検証義務、HELIXOS-L2-005/007の登録/原証拠へ照合 | 旧candidateの承認・9scope・UIL/RF0・固定enum/roles・旧gate・旧CIは継承しない |
| read-only保持 | DRDMの意味署名・外部化/共通化、dispositionのsource/successor分離を、#3139の比較入力にする | scanner TS・旧testを現pathへ移植せず、既存の実装除外を保持 |
| 置換の比較候補 | scanner policy/scan入力/候補出力の境界をOS005の観測→登録→採否へ照合する調査 | 置換先の実装/API・全意味同等性は未評価。完全一致再利用や置換の決定ではない |
| 未特定 | BRAIN知識への還元、CONNECTの片側交換との直接source対応、推移的consumerと残assetの全量 | 同じ名称やJSON形から写像を補完しない。CONNECT006は現接続の比較先であり旧sourceの採用証拠ではない |

現行の比較先は固定revisionの`docs/helix-harness/L2-requirements/product-requirements.md:55–56`、`docs/helix-os/L2-requirements/governance-requirements.md:58,60,294–295`。対応する対設計はHARNESS005のL8 `verification-discipline.json`。OS側の対設計への詳細edgeは実物を個別に照合して結ぶ。Concept/七原則と既存FTへの対応は保持し、表の比較候補から要求・版・担当・authorityを新規採用しない。

残件は全関連asset抽出、旧test-designのcitation実物、推移consumer closure、意味atomと現行対設計の全面対応、PHCAP inventoryの再評価である。旧CLI/hook/runtime/test/CIは実行せず、本追補だけでIssue #1906をcloseしない。
