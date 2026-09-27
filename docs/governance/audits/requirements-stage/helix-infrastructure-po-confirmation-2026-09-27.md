# INFRASTRUCTURE PO確認packet（対象本文固定: f6dad2a）

**対象**: HELIX-INFRASTRUCTURE。このpacketはPO判断を記録する前の確認素材であり、採択・合意・承認を示さない。

## 先に確認できる要点

**この機構でできること（POが既に決めた1.0最低18項目に対応する候補）**

- HELIX本体の実行資源と実状態、容量、drift、観測を把握する（L2-001〜004）。
- Backup/Restore/Rollback、独立bootstrap/recovery、runtime rebuildabilityの復旧経路を確認する（L2-005〜007）。
- CORE設計、OSのWork/Change、SECURITY authorityとWorker実操作をつなぎ、1.0構成体の成立を確認する（L2-008〜011）。
- L2-025はWorkerと実行資源の接続候補。既決18項目と1.0範囲はそのまま示しており、18項目の再確認は求めない。L2-012〜024/026は版未定の後続候補。

**今回追加された候補と監査で明確にした点**

- L2-025でWorker/ticketと実資源の状態を分けて対応づける。L2-026の配置・容量等の判断候補接続は後続版のまま保つ。
- L2/L11-010では、操作ごとの許可を維持しつつ、更新時の追加条件と、その操作に必要な復旧義務を分けた。読取りだけの操作には一律のバックアップを課さず、書込み禁止と、その操作による変更がないことを確認する。
- 独立した復旧経路（OOB）は、停止中のOSからticketや割当が返ることを開始条件にしない。SECURITYの制約下のWorkerが、独立経路と別の有効な許可で開始し、OS復旧後に作業・変更記録へ結果を同期する。
- L11-001/003では、対象のModel Runtimeのモデル・版・サーバー・GPUメモリ・同時実行数・遅延・容量・稼働状態・接続先を、観測元の版とともに確認する。未観測・不明・古い値を「健全」「容量十分」とせず、モデルの能力評価や配置判断、根拠のない数値閾値を追加しない。
- L2/L11-011では、復旧能力を含む最低18項目すべてを構成体として確認する。L1の意味、最低18項目、1.0と後続版の境界は変えていない。詳細は[機構内解消記録](helix-infrastructure-internal-resolution-2026-09-27.md)にある。

**今回決めること**

固定したL1 revisionの確認と26候補の処置。PO既決の1.0最低18項目と、それ以外の「1.0より後（版は未定）」は再質問しない。

## 固定対象とsource証拠

全リンクはcommit `f6dad2a33e24f000b87d7f09b8d40288257e74cc` に固定。SHA-256はファイルbytes、Git blobは同じ固定revisionのblob objectを示す。判断前に本文が変わった場合は、最新版へ固定し直す。

| 固定source | SHA-256 | Git blob |
|---|---|---|
| [docs/concept/helix-concept.md](https://github.com/RetryYN/HELIX-HARNESS/blob/f6dad2a33e24f000b87d7f09b8d40288257e74cc/docs/concept/helix-concept.md) | `06e210c312fc6a5f18c1fc29248e55ebe9c2eee0c177006e32d7b421af8baa78` | `e57b94e76049037172b7a6ce3e6376f47591ca17` |
| [docs/helix-infrastructure/L1-planning/infrastructure-intent.md](https://github.com/RetryYN/HELIX-HARNESS/blob/f6dad2a33e24f000b87d7f09b8d40288257e74cc/docs/helix-infrastructure/L1-planning/infrastructure-intent.md) | `1673cf1333c762b817e1031cb610de90b6e967f7c2d851ab2a4b71e4959ebc37` | `2073df3f78dc9d74c3cfda9bac5dab3654853043` |
| [docs/helix-infrastructure/L2-requirements/infrastructure-requirements.md](https://github.com/RetryYN/HELIX-HARNESS/blob/f6dad2a33e24f000b87d7f09b8d40288257e74cc/docs/helix-infrastructure/L2-requirements/infrastructure-requirements.md) | `569cbf7767be79b07568663026a0ab05e9fe70ea29c3636401a5db1038b8183b` | `8ec8fa92bc1adf03376f60e031dd880095bc02f4` |
| [docs/helix-infrastructure/L11-acceptance/infrastructure-acceptance.md](https://github.com/RetryYN/HELIX-HARNESS/blob/f6dad2a33e24f000b87d7f09b8d40288257e74cc/docs/helix-infrastructure/L11-acceptance/infrastructure-acceptance.md) | `7c3d22adef53a8b9c613408a8b8697b2aa40d1e5316776b5305f5a34eb22dada` | `eaa32f53a77a96ffbe2230757c290047708accb4` |
| [docs/helix-infrastructure/sources/runtime-infrastructure-l1-po-original-2026-09-26.md](https://github.com/RetryYN/HELIX-HARNESS/blob/f6dad2a33e24f000b87d7f09b8d40288257e74cc/docs/helix-infrastructure/sources/runtime-infrastructure-l1-po-original-2026-09-26.md) | `a76dfdd2106f6aa5b0dc94c65a2cfbc64d2a57298bba7dd07f5b24d1b1589522` | `2d5fa2e15c6e004fb60da4e56d3087653fb6e33d` |
| [docs/governance/decisions/infrastructure-concept-placement-po-decisions-2026-09-26.md](https://github.com/RetryYN/HELIX-HARNESS/blob/f6dad2a33e24f000b87d7f09b8d40288257e74cc/docs/governance/decisions/infrastructure-concept-placement-po-decisions-2026-09-26.md) | `59c45ce845c674866703a595159fff3df32d077f1c36dca23858499b3480bf2f` | `29a372ab799ab73102688b49d8efd9a5bd8e17ab` |
| [docs/governance/audits/requirements-stage/helix-infrastructure-internal-audit-2026-09-27.md](https://github.com/RetryYN/HELIX-HARNESS/blob/f6dad2a33e24f000b87d7f09b8d40288257e74cc/docs/governance/audits/requirements-stage/helix-infrastructure-internal-audit-2026-09-27.md) | `c08b2eca0ade2826ecbaeedc6d6a84662a83fc3a5f9e05e354b4ae8fe0c4c8f7` | `9199d386014fb5fe7cf43d29bc299df45da84e7c` |

## 既決PO履歴と今回確認すること

既決履歴: 既決事項：POは1.0最低範囲を18項目とし、残る対象範囲は「1.0より後（版は未定）」とした。L1側の対象・名称等の判断記録も履歴保持する。18項目の範囲や後続版未定を再質問せず、今回の候補ID表の照合と対象L1 revisionの確認を求める。 根拠: [docs/governance/decisions/infrastructure-concept-placement-po-decisions-2026-09-26.md:31-37,58-63](https://github.com/RetryYN/HELIX-HARNESS/blob/f6dad2a33e24f000b87d7f09b8d40288257e74cc/docs/governance/decisions/infrastructure-concept-placement-po-decisions-2026-09-26.md#L31).

旧sourceとの保持・変更理由: 旧資産保持・変更記録（監査記録）: `LEGACY-ASSET-17C4BF78919578FEBB18` product-lifecycle-operations-requirements.md:68-98,108-119,164-171; `LEGACY-ASSET-5D41345F55800F23AC38` infrastructure-operations-quality-l3-requirement-candidates.md:7-15; `LEGACY-ASSET-E239B45CE3FFE8B34D2B` runtime infrastructure source:120-132; `LEGACY-ASSET-719D5EC9C06FC4AAD0FF` infinity-loop requirement:165-170. 旧運用・品質要求を保持し、機構別の単体/接続/構成体と版境界へ再導出した根拠は監査記録を参照。 SHA-256（列挙順）: `ed4d21bf9a6ec0a922fda9d5906350cfa4c6a35edc4ecc0fd6d30dc3148dacb0` / `73a92522cf1dca8a101c8b63d5b53e0f875499d1ddc5f72b7b7b9d549a7765e6` / `4d94b4b887a356fb9b17eaddc4df7a9c6e0eaed955d151c48a6efba667be7344` / `db31f424cc89cc4cc31058b2d03059e794ab2d63fa0b1f431dd38eced8f4c8fb`。source別の完全な判断は上記固定監査記録に記録済み。

今回の真の残存確認点: L2-001〜011の1.0範囲とL2-012〜024/026の後続版（版未定）、L2-025の1.0位置づけはL2候補表に従う。L2-011は18項目の構成体候補であり、18個のL2 identityや一律のbackup義務へ言い換えない。現行L1 revisionが過去の配置判断を正確に反映するか確認し、意味が違う場合だけ差戻し理由を示す。

## 全L2候補とregister/coverage状況

候補母集団はL2本文の一覧表/各identityとregisterの突合結果。candidate 26件を全件収載。各行のregister IDは旧revisionから最新revisionまでの履歴、最新行だけが現在候補record。receiptは候補source atomのcoverage証拠で、PO合意・L1承認・実装可否を意味しない。

| L2 identity | kind | version_target（L2本文） | register revision履歴 | 最新receipt | 最新管理状態 |
|---|---|---|---|---|---|
| `HELIXINFRASTRUCTURE-L2-001` | `unit` | 1.0 | `MPR-RC-HELIXINFRASTRUCTURE-L2-001-001 → MPR-RC-HELIXINFRASTRUCTURE-L2-001-002 → MPR-RC-HELIXINFRASTRUCTURE-L2-001-003` | `INFRA-stage` | `registered_proposal` / authority_effect `none` / coverage `no_loss` |
| `HELIXINFRASTRUCTURE-L2-002` | `unit` | 1.0 | `MPR-RC-HELIXINFRASTRUCTURE-L2-002-001 → MPR-RC-HELIXINFRASTRUCTURE-L2-002-002` | `INFRA-functional-r2` | `registered_proposal` / authority_effect `none` / coverage `no_loss` |
| `HELIXINFRASTRUCTURE-L2-003` | `unit` | 1.0 | `MPR-RC-HELIXINFRASTRUCTURE-L2-003-001 → MPR-RC-HELIXINFRASTRUCTURE-L2-003-002 → MPR-RC-HELIXINFRASTRUCTURE-L2-003-003` | `INFRA-stage` | `registered_proposal` / authority_effect `none` / coverage `no_loss` |
| `HELIXINFRASTRUCTURE-L2-004` | `unit` | 1.0 | `MPR-RC-HELIXINFRASTRUCTURE-L2-004-001 → MPR-RC-HELIXINFRASTRUCTURE-L2-004-002` | `INFRA-functional-r2` | `registered_proposal` / authority_effect `none` / coverage `no_loss` |
| `HELIXINFRASTRUCTURE-L2-005` | `unit` | 1.0 | `MPR-RC-HELIXINFRASTRUCTURE-L2-005-001 → MPR-RC-HELIXINFRASTRUCTURE-L2-005-002` | `INFRA-functional-r2` | `registered_proposal` / authority_effect `none` / coverage `no_loss` |
| `HELIXINFRASTRUCTURE-L2-006` | `unit` | 1.0 | `MPR-RC-HELIXINFRASTRUCTURE-L2-006-001 → MPR-RC-HELIXINFRASTRUCTURE-L2-006-002` | `INFRA-functional-r2` | `registered_proposal` / authority_effect `none` / coverage `no_loss` |
| `HELIXINFRASTRUCTURE-L2-007` | `unit` | 1.0 | `MPR-RC-HELIXINFRASTRUCTURE-L2-007-001 → MPR-RC-HELIXINFRASTRUCTURE-L2-007-002` | `INFRA-functional-r2` | `registered_proposal` / authority_effect `none` / coverage `no_loss` |
| `HELIXINFRASTRUCTURE-L2-008` | `connection` | 1.0 | `MPR-RC-HELIXINFRASTRUCTURE-L2-008-001 → MPR-RC-HELIXINFRASTRUCTURE-L2-008-002` | `INFRA-functional-r2` | `registered_proposal` / authority_effect `none` / coverage `no_loss` |
| `HELIXINFRASTRUCTURE-L2-009` | `connection` | 1.0 | `MPR-RC-HELIXINFRASTRUCTURE-L2-009-001 → MPR-RC-HELIXINFRASTRUCTURE-L2-009-002` | `INFRA-functional-r2` | `registered_proposal` / authority_effect `none` / coverage `no_loss` |
| `HELIXINFRASTRUCTURE-L2-010` | `composite` | 1.0 | `MPR-RC-HELIXINFRASTRUCTURE-L2-010-001 → MPR-RC-HELIXINFRASTRUCTURE-L2-010-002 → MPR-RC-HELIXINFRASTRUCTURE-L2-010-003` | `INFRA-stage` | `registered_proposal` / authority_effect `none` / coverage `no_loss` |
| `HELIXINFRASTRUCTURE-L2-011` | `composite` | 1.0 | `MPR-RC-HELIXINFRASTRUCTURE-L2-011-001 → MPR-RC-HELIXINFRASTRUCTURE-L2-011-002 → MPR-RC-HELIXINFRASTRUCTURE-L2-011-003` | `INFRA-stage` | `registered_proposal` / authority_effect `none` / coverage `no_loss` |
| `HELIXINFRASTRUCTURE-L2-012` | `unit` | 1.0より後（版は未定） | `MPR-RC-HELIXINFRASTRUCTURE-L2-012-001 → MPR-RC-HELIXINFRASTRUCTURE-L2-012-002` | `INFRA-functional-r2` | `registered_proposal` / authority_effect `none` / coverage `no_loss` |
| `HELIXINFRASTRUCTURE-L2-013` | `unit` | 1.0より後（版は未定） | `MPR-RC-HELIXINFRASTRUCTURE-L2-013-001 → MPR-RC-HELIXINFRASTRUCTURE-L2-013-002` | `INFRA-functional-r2` | `registered_proposal` / authority_effect `none` / coverage `no_loss` |
| `HELIXINFRASTRUCTURE-L2-014` | `connection` | 1.0より後（版は未定） | `MPR-RC-HELIXINFRASTRUCTURE-L2-014-001 → MPR-RC-HELIXINFRASTRUCTURE-L2-014-002` | `INFRA-functional-r2` | `registered_proposal` / authority_effect `none` / coverage `no_loss` |
| `HELIXINFRASTRUCTURE-L2-015` | `unit` | 1.0より後（版は未定） | `MPR-RC-HELIXINFRASTRUCTURE-L2-015-001 → MPR-RC-HELIXINFRASTRUCTURE-L2-015-002` | `INFRA-functional-r2` | `registered_proposal` / authority_effect `none` / coverage `no_loss` |
| `HELIXINFRASTRUCTURE-L2-016` | `unit` | 1.0より後（版は未定） | `MPR-RC-HELIXINFRASTRUCTURE-L2-016-001 → MPR-RC-HELIXINFRASTRUCTURE-L2-016-002` | `INFRA-functional-r2` | `registered_proposal` / authority_effect `none` / coverage `no_loss` |
| `HELIXINFRASTRUCTURE-L2-017` | `unit` | 1.0より後（版は未定） | `MPR-RC-HELIXINFRASTRUCTURE-L2-017-001 → MPR-RC-HELIXINFRASTRUCTURE-L2-017-002` | `INFRA-functional-r2` | `registered_proposal` / authority_effect `none` / coverage `no_loss` |
| `HELIXINFRASTRUCTURE-L2-018` | `unit` | 1.0より後（版は未定） | `MPR-RC-HELIXINFRASTRUCTURE-L2-018-001 → MPR-RC-HELIXINFRASTRUCTURE-L2-018-002` | `INFRA-functional-r2` | `registered_proposal` / authority_effect `none` / coverage `no_loss` |
| `HELIXINFRASTRUCTURE-L2-019` | `unit` | 1.0より後（版は未定） | `MPR-RC-HELIXINFRASTRUCTURE-L2-019-001 → MPR-RC-HELIXINFRASTRUCTURE-L2-019-002` | `INFRA-functional-r2` | `registered_proposal` / authority_effect `none` / coverage `no_loss` |
| `HELIXINFRASTRUCTURE-L2-020` | `connection` | 1.0より後（版は未定） | `MPR-RC-HELIXINFRASTRUCTURE-L2-020-001 → MPR-RC-HELIXINFRASTRUCTURE-L2-020-002` | `INFRA-functional-r2` | `registered_proposal` / authority_effect `none` / coverage `no_loss` |
| `HELIXINFRASTRUCTURE-L2-021` | `composite` | 1.0より後（版は未定） | `MPR-RC-HELIXINFRASTRUCTURE-L2-021-001 → MPR-RC-HELIXINFRASTRUCTURE-L2-021-002` | `INFRA-functional-r2` | `registered_proposal` / authority_effect `none` / coverage `no_loss` |
| `HELIXINFRASTRUCTURE-L2-022` | `unit` | 1.0より後（版は未定） | `MPR-RC-HELIXINFRASTRUCTURE-L2-022-001 → MPR-RC-HELIXINFRASTRUCTURE-L2-022-002` | `INFRA-functional-r2` | `registered_proposal` / authority_effect `none` / coverage `no_loss` |
| `HELIXINFRASTRUCTURE-L2-023` | `composite` | 1.0より後（版は未定） | `MPR-RC-HELIXINFRASTRUCTURE-L2-023-001 → MPR-RC-HELIXINFRASTRUCTURE-L2-023-002` | `INFRA-functional-r2` | `registered_proposal` / authority_effect `none` / coverage `no_loss` |
| `HELIXINFRASTRUCTURE-L2-024` | `composite` | 1.0より後（版は未定） | `MPR-RC-HELIXINFRASTRUCTURE-L2-024-001 → MPR-RC-HELIXINFRASTRUCTURE-L2-024-002` | `INFRA-functional-r2` | `registered_proposal` / authority_effect `none` / coverage `no_loss` |
| `HELIXINFRASTRUCTURE-L2-025` | `connection` | 1.0 | `MPR-RC-HELIXINFRASTRUCTURE-L2-025-001 → MPR-RC-HELIXINFRASTRUCTURE-L2-025-002` | `INFRA-functional-r2` | `registered_proposal` / authority_effect `none` / coverage `no_loss` |
| `HELIXINFRASTRUCTURE-L2-026` | `connection` | 1.0より後（版は未定） | `MPR-RC-HELIXINFRASTRUCTURE-L2-026-001 → MPR-RC-HELIXINFRASTRUCTURE-L2-026-002` | `INFRA-functional-r2` | `registered_proposal` / authority_effect `none` / coverage `no_loss` |

### Receiptファイル

- `INFRA-stage`: [docs/governance/audits/requirement-registration/helix-infrastructure-stage-review-coverage-receipt-2026-09-27.json](https://github.com/RetryYN/HELIX-HARNESS/blob/f6dad2a33e24f000b87d7f09b8d40288257e74cc/docs/governance/audits/requirement-registration/helix-infrastructure-stage-review-coverage-receipt-2026-09-27.json)、SHA-256 `5cc099f3e8adf4b764ac1fb3575de150c2b7bf1af14f36e1ca396f283ce5a865`。
- `INFRA-functional-r2`: [docs/governance/audits/requirement-registration/helixinfrastructure-functional-units-coverage-receipt-2026-09-27-r2.json](https://github.com/RetryYN/HELIX-HARNESS/blob/f6dad2a33e24f000b87d7f09b8d40288257e74cc/docs/governance/audits/requirement-registration/helixinfrastructure-functional-units-coverage-receipt-2026-09-27-r2.json)、SHA-256 `ad11c2002b4bf5ba9476519a3ed4ae4d92ffa43f3cc89de5f6ff3164a9f176b5`。

## POに明示してほしい判断（未受領）

- **L1**: 固定したL1本文のexact revisionを確定するか、差戻すか。過去のPO企画判断から現在のL1 bytesの確定を推定しない。
- **L2/L11**: 上表の全候補について、明示された範囲で採用・保留・不採用、または差戻しを記録する。包括回答で個々のIDの処置が特定できない場合、その候補は未受領のままにする。
- **一括回答**: このpacketが明示するL1 exact revisionと候補表の全IDを対象に、POが「一式でよい」と明示した回答は、そのrevision確認および全候補への処置として受領できる。候補IDの再列挙は不要。部分的な回答、または対象revision/候補集合を特定できない回答では、未指定部分を未受領のまま残す。
- **残存差分**: 上記「真の残存確認点」に対する選択、または現行候補を差戻す理由を示す。既決PO事項は再質問せず、本文へ自動的に確定状態を付与しない。

## 状態の読み方

- 最新register行の `registered_proposal`、`authority_effect: none`、`coverage_result: no_loss` は、候補登録と旧source atom coverageを示す。PO採否、L1 authority、L2 agreementを示さない。過去revisionは履歴として保持する。
- PO判断を受けるまで、L1/L2/L11は候補状態。空欄・曖昧な返答からdispositionを埋めない。候補の不採用だけでは旧sourceの意味をretireしない。
- `version_target`は候補の対象版であり、実装済み版・release承認ではない。上表の後続版候補は残し、1.0の受入条件へ混ぜない。
- 同一PRのdecision recordにはdecider、日時、Concept/L1/L2/L11のexact revision、IDごとのPO処置・理由、旧source保持/変更、register/receipt参照を記録する。本文変更時は編集後SHAへ判断対象を束縛し直す。

## 確認PRの前提と受領後の扱い

機構内の監査・解消16 PR、横断監査 #2195 と解消 #2196、総合検証 #2197 はmerge/read-after済み。[総合検証](integrated-verification-2026-09-27.md)から根拠へ辿れる。本資料は要求本文の固定revisionへの読み口であり、本文やsource atomの被覆を置き換えない。

[PO指示の手順4](../../sources/requirements-stage-po-handoff-original-2026-09-27.md)に従い、POのL1対象revision確定・L2合意（または差戻し）を同じPRの判断記録へ入れるまでDraftを維持し、mergeしない。独立reviewは資料の正確さを照合するもので、PO判断を代行しない。提示したrevisionと集合に対する「一式でよい」という一括回答も、その範囲の判断として記録できる。IDの再列挙は求めない。部分回答・意味変更指示は対象だけを反映し、未判断部分を残す。

旧自律境界（LEGACY-ASSET-6EBDB617A8104A7756D0、`archive/legacy-generation-2026-09-14/root/CLAUDE.md:82-85`、SHA-256 `7bdfc0bc578359e42efae4242ee42b53abd6e2ec23874f1294d3ec0e278c8feb`）の、人が企画・要求の意味を持ちAIが要件以下を起草する分担を保持する。旧層番号・旧runtime・旧merge方式は移植しない。現行のL1/L2対象revision判断と、L3要件承認を分ける。

現在はPO判断未受領。受領後は実際の回答・対象revision・候補処置を記録し、本文変更があれば対のL11、register訂正revision、receipt、研究pinとbindingを追随させてexact HEADを再reviewする。候補の処置から旧sourceのretireや未完atomの被覆完了、L3承認、実装・release許可を生成しない。

8機構分の確認PRをすべて作成し、全件の独立review指摘0件まで作成側が進める。先行する確認PRのPO判断待ちを理由に、残る確認PRの作成・reviewを止めない。
