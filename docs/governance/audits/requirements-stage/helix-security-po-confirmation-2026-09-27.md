# SECURITY PO確認packet（対象本文固定: f6dad2a）

**対象**: HELIX-SECURITY。このpacketはPO判断を記録する前の確認素材であり、採択・合意・承認を示さない。

**現在の状態（2026-09-28）**：PO判断を受領し、[判断記録](../../decisions/helix-security-requirements-po-decision-2026-09-28.md)へ全文・対象SHA・全28候補の採用を記録した。以下の質問・候補状態の説明は判断前の提示内容として残す。現在の採否と個別選択は判断記録を参照する。

## 先に確認できる要点

**この機構でできること（1.0候補）**

- 外部入力・構成・資格情報・通信の扱いと、操作ごとの権限を照合する（L2-001〜008）。
- Workerへ決めた制約を渡し、権限失効や範囲逸脱があればOS・Worker・CONNECTの該当先へ停止を伝える（L2-007、009）。
- 更新、供給元、artifact、資産識別・分類、永続化の判定を行い、機構間の権限や変更をつなぐ（L2-010〜016、020〜024、027〜028）。L2-015/016は資産識別・分類の土台で、Web実利用保護全体は含まない。

**今回追加された候補と監査で明確にした点**

- L2-027はMemory・Training Dataset・BRAINへの永続化を判定する構成体候補、L2-028はpack更新とartifact integrityの単体候補。L2-014の単体判定と、3経路すべての構成体成立を分ける。
- 版境界: L2-017〜019とL2-025のWeb実利用、L2-026の意味判断・検出接続は後続版側。L2-015/016の資産基盤、L2-020のGuard、L2-026のGuard/Bot境界は1.0側として表に残す。
- 内部監査の消化で実際に補強したのは、L11-007（9制御fixtureでWorker制約を確認し、read-onlyでもwrite禁止を強制、scope内の操作起因変更なしを観測。rollbackを省けるのは変更なしを確認した場合のみ）、L11-009（triggerと該当recipientごとの停止・未達/未観測）、L11-003（project/tenant/environment/worktree等と関連stateのscope照合）、L11-020（Guardと必要時Botの責務例）。L2/L11-010の15更新対象とその個別条件は維持したが、人の毎run承認は追加していない。無関係なunknownの全操作停止や顧客runtimeを1.0へ追加していない。

**今回決めること**

固定したL1 revisionの確認と28候補の処置に加え、L1-008/009で旧security engagement限定からHELIX全操作へ広げるauthority scopeを確認する。推奨はL1の記載どおり全操作のauthority境界を維持し、旧special engagement admissionは別扱いで残すこと。通常作業の毎回の人間承認は加えず、期限内でoperation/revision/scopeが一致する既決authorityを再利用する。影響はL2/L11-008、009、022とWorker制約接続L2/L11-007。

## 固定対象とsource証拠

全リンクはcommit `f6dad2a33e24f000b87d7f09b8d40288257e74cc` に固定。SHA-256はファイルbytes、Git blobは同じ固定revisionのblob objectを示す。判断前に本文が変わった場合は、最新版へ固定し直す。

| 固定source | SHA-256 | Git blob |
|---|---|---|
| [docs/concept/helix-concept.md](https://github.com/RetryYN/HELIX-HARNESS/blob/f6dad2a33e24f000b87d7f09b8d40288257e74cc/docs/concept/helix-concept.md) | `06e210c312fc6a5f18c1fc29248e55ebe9c2eee0c177006e32d7b421af8baa78` | `e57b94e76049037172b7a6ce3e6376f47591ca17` |
| [docs/helix-security/L1-planning/security-intent.md](https://github.com/RetryYN/HELIX-HARNESS/blob/f6dad2a33e24f000b87d7f09b8d40288257e74cc/docs/helix-security/L1-planning/security-intent.md) | `b779ae38e077474ee10ee07e1bb50eac1da64a86ee3bf2bc06504c1dd53be61d` | `06174b826c5dfa398450cb38b44c8b4dd3236246` |
| [docs/helix-security/L2-requirements/security-requirements.md](https://github.com/RetryYN/HELIX-HARNESS/blob/f6dad2a33e24f000b87d7f09b8d40288257e74cc/docs/helix-security/L2-requirements/security-requirements.md) | `027e6d25c8665e8aca006f23660c4ecfcc0ec0a92946be871e935ec5aa7a774c` | `e1ccfdf6b0c5ff358b9e4a79a7f088038f3d8be3` |
| [docs/helix-security/L11-acceptance/security-acceptance.md](https://github.com/RetryYN/HELIX-HARNESS/blob/f6dad2a33e24f000b87d7f09b8d40288257e74cc/docs/helix-security/L11-acceptance/security-acceptance.md) | `25635649f87c0e805a5d1cf35b5c1201144c851533808770cd4f9ac6ba067c01` | `d373ec1bf994650c74b5d7af66652c9bf8abdbf5` |
| [docs/helix-security/sources/security-l1-idea-po-original-2026-09-26.md](https://github.com/RetryYN/HELIX-HARNESS/blob/f6dad2a33e24f000b87d7f09b8d40288257e74cc/docs/helix-security/sources/security-l1-idea-po-original-2026-09-26.md) | `699a0a0df5e92cfe7367dded2ab4c1e1d1cc6f4d8b1bff0418cdfa58e4768c0c` | `682f91c836a8f80cfa10e45889700fc3a9e4c05c` |
| [docs/governance/decisions/security-l1-idea-po-decisions-2026-09-26.md](https://github.com/RetryYN/HELIX-HARNESS/blob/f6dad2a33e24f000b87d7f09b8d40288257e74cc/docs/governance/decisions/security-l1-idea-po-decisions-2026-09-26.md) | `e101742be643aecd27560a573cc72b113f9b37dd57917703d22ef6236fa4ef59` | `b5926cd54ab22315b22b16760f7d3c23628439b4` |
| [docs/governance/audits/requirements-stage/helix-security-internal-audit-2026-09-27.md](https://github.com/RetryYN/HELIX-HARNESS/blob/f6dad2a33e24f000b87d7f09b8d40288257e74cc/docs/governance/audits/requirements-stage/helix-security-internal-audit-2026-09-27.md) | `d72c1e689dc9f804163bebd170880b36a44fbcab2c37048b470e19504914e554` | `2be231958a43f0f0492e8125f8dfe41c58b1326e` |

## 既決PO履歴と今回確認すること

既決履歴: 既決事項：PO記録はL1案と版境界（§2–15/21を1.0、§16–20を1.x）を保持している。これは今回のL2全候補採択を意味しないため、再質問せず履歴として引き継ぐ。 根拠: [docs/governance/decisions/security-l1-idea-po-decisions-2026-09-26.md:16-26](https://github.com/RetryYN/HELIX-HARNESS/blob/f6dad2a33e24f000b87d7f09b8d40288257e74cc/docs/governance/decisions/security-l1-idea-po-decisions-2026-09-26.md#L16).

旧sourceとの保持・変更理由: 旧資産保持・変更記録（監査記録）: `LEGACY-ASSET-322CD23B625A08E2BFB3` security-engagement-authority-requests.md:14-24,28-38,40-44; `LEGACY-ASSET-B62E49D2E156232B8C63` security-capability-broker-authority.md:30-80; `LEGACY-ASSET-170112AB2FA2FFDBFEE9` broker acceptance:20-30; `LEGACY-ASSET-EE5DBACC7F28F7D1F605` pillar-functional-requirements.md:186,297-300. 過去の要求・authority制御を保持し、現行のGuard/分類基盤と後続Web実利用保護を分離した根拠は監査記録を参照。 SHA-256（列挙順）: `c6d76cd77529eea34518c554a555ed255cff390a34faf679806e50450c4df447` / `161722d80e7b0199310b1401992c3737bef2014b19b2776c0df4b15f833fe0a7` / `b6f926f39cd824fc102cf82bd1625d14d298f666c931786fdc6c8117d06af1c4` / `7b49652eb96f73efc903a462264962ab1811819eee76a3fd952d1a1e03af6544`。source別の完全な判断は上記固定監査記録に記録済み。

今回の真の残存判断: 旧SEAのscopeをsecurity engagement限定からHELIXの全操作へ広げる点は、候補本文に自動採用せずPO確認を残す。PO原文§9 Action Authority／§10 Revoke / Quarantine ([原文snapshot:218-277](https://github.com/RetryYN/HELIX-HARNESS/blob/f6dad2a33e24f000b87d7f09b8d40288257e74cc/docs/helix-security/sources/security-l1-idea-po-original-2026-09-26.md#L218)) と、L1-008/009の旧source対応・変更点 ([L1:84-86](https://github.com/RetryYN/HELIX-HARNESS/blob/f6dad2a33e24f000b87d7f09b8d40288257e74cc/docs/helix-security/L1-planning/security-intent.md#L84)) が根拠。旧資産 `LEGACY-ASSET-322CD23B625A08E2BFB3`（security-engagement-authority-requests.md:14-24,28-38,40-44、SHA-256 `c6d76cd77529eea34518c554a555ed255cff390a34faf679806e50450c4df447`）からは対象・操作・環境・network/data scope・期限の束縛とdrift/revoke時停止を保持し、旧special engagement固有のplan/human gateは通常作業へ持ち込まない。詳細は[L2の旧source対応表:385-394](https://github.com/RetryYN/HELIX-HARNESS/blob/f6dad2a33e24f000b87d7f09b8d40288257e74cc/docs/helix-security/L2-requirements/security-requirements.md#L385)を参照。

選択肢は (A) 現L1-008/009どおり全操作にauthority境界を適用し、旧special engagement admissionは別扱いで残す、(B) engagementに限定してL1-008/009の全操作拡張を差戻す。推奨はA。既存L2に沿って操作種別・該当scopeを照合し、期限内かつoperation/revision/scopeが一致する既決authorityを通常作業で再利用する。通常作業の毎回の人間承認や既決許可の再利用拒否は導入しない。scope・operation・revision・適用sourceが変わった場合、または期限切れ/失効時に限り該当範囲を再照合する。

影響はL2-008 (operation authority)、L2-009 (revoke/quarantine)、L2-022 (INTELLIGENCE→OS→Worker authority連鎖) と対応するL11-008/009/022（L11行32,33,46）。L2-007/L11-007（L11行31）のWorker制約適用は実行側の責務として保持し、authority判断をWorkerへ移さない。L2「人の判断が残る点」:396-399および機構内監査:12,34,48がこのscope選択を未決として記録している。既存Concept/HARNESS/OSとの矛盾やその解消はこのpacketで推測せず、POが選択した意味に従って差戻し先を明記する。

その他の既決版境界は再質問しない: L2-015/016の1.0基盤と後続の実利用保護、L2-020のGuard 1.0/Bot必要時、L2-025の1.x Web公開境界と1.0基盤準備、L2-026の1.x意味接続能力と1.0 Guard/Bot境界の部分対象を候補表どおり保持する。

## 全L2候補とregister/coverage状況

候補母集団はL2本文の一覧表/各identityとregisterの突合結果。candidate 28件を全件収載。各行のregister IDは旧revisionから最新revisionまでの履歴、最新行だけが現在候補record。receiptは候補source atomのcoverage証拠で、PO合意・L1承認・実装可否を意味しない。

| L2 identity | kind | version_target（L2本文） | register revision履歴 | 最新receipt | 最新管理状態 |
|---|---|---|---|---|---|
| `HELIXSECURITY-L2-001` | `unit` | 1.0 | `MPR-RC-HELIXSECURITY-L2-001-001` | `SECURITY-functional` | `registered_proposal` / authority_effect `none` / coverage `no_loss` |
| `HELIXSECURITY-L2-002` | `unit` | 1.0 | `MPR-RC-HELIXSECURITY-L2-002-001` | `SECURITY-functional` | `registered_proposal` / authority_effect `none` / coverage `no_loss` |
| `HELIXSECURITY-L2-003` | `unit` | 1.0 | `MPR-RC-HELIXSECURITY-L2-003-001 → MPR-RC-HELIXSECURITY-L2-003-002` | `SECURITY-stage` | `registered_proposal` / authority_effect `none` / coverage `no_loss` |
| `HELIXSECURITY-L2-004` | `unit` | 1.0 | `MPR-RC-HELIXSECURITY-L2-004-001` | `SECURITY-functional` | `registered_proposal` / authority_effect `none` / coverage `no_loss` |
| `HELIXSECURITY-L2-005` | `unit` | 1.0 | `MPR-RC-HELIXSECURITY-L2-005-001` | `SECURITY-functional` | `registered_proposal` / authority_effect `none` / coverage `no_loss` |
| `HELIXSECURITY-L2-006` | `unit` | 1.0 | `MPR-RC-HELIXSECURITY-L2-006-001` | `SECURITY-functional` | `registered_proposal` / authority_effect `none` / coverage `no_loss` |
| `HELIXSECURITY-L2-007` | `connection` | 1.0 | `MPR-RC-HELIXSECURITY-L2-007-001 → MPR-RC-HELIXSECURITY-L2-007-002` | `SECURITY-stage` | `registered_proposal` / authority_effect `none` / coverage `no_loss` |
| `HELIXSECURITY-L2-008` | `unit` | 1.0 | `MPR-RC-HELIXSECURITY-L2-008-001` | `SECURITY-functional` | `registered_proposal` / authority_effect `none` / coverage `no_loss` |
| `HELIXSECURITY-L2-009` | `composite` | 1.0 | `MPR-RC-HELIXSECURITY-L2-009-001 → MPR-RC-HELIXSECURITY-L2-009-002` | `SECURITY-stage` | `registered_proposal` / authority_effect `none` / coverage `no_loss` |
| `HELIXSECURITY-L2-010` | `unit` | 1.0 | `MPR-RC-HELIXSECURITY-L2-010-001` | `SECURITY-functional` | `registered_proposal` / authority_effect `none` / coverage `no_loss` |
| `HELIXSECURITY-L2-011` | `unit` | 1.0 | `MPR-RC-HELIXSECURITY-L2-011-001` | `SECURITY-functional` | `registered_proposal` / authority_effect `none` / coverage `no_loss` |
| `HELIXSECURITY-L2-012` | `unit` | 1.0 | `MPR-RC-HELIXSECURITY-L2-012-001` | `SECURITY-functional` | `registered_proposal` / authority_effect `none` / coverage `no_loss` |
| `HELIXSECURITY-L2-013` | `unit` | 1.0 | `MPR-RC-HELIXSECURITY-L2-013-001` | `SECURITY-functional` | `registered_proposal` / authority_effect `none` / coverage `no_loss` |
| `HELIXSECURITY-L2-014` | `unit` | 1.0 | `MPR-RC-HELIXSECURITY-L2-014-001 → MPR-RC-HELIXSECURITY-L2-014-002` | `SECURITY-functional-r2` | `registered_proposal` / authority_effect `none` / coverage `no_loss` |
| `HELIXSECURITY-L2-015` | `unit` | 1.0の土台、実利用保護は1.x | `MPR-RC-HELIXSECURITY-L2-015-001` | `SECURITY-functional` | `registered_proposal` / authority_effect `none` / coverage `no_loss` |
| `HELIXSECURITY-L2-016` | `unit` | 1.0の区分基盤、公開時適用は1.x | `MPR-RC-HELIXSECURITY-L2-016-001` | `SECURITY-functional` | `registered_proposal` / authority_effect `none` / coverage `no_loss` |
| `HELIXSECURITY-L2-017` | `unit` | 1.x | `MPR-RC-HELIXSECURITY-L2-017-001` | `SECURITY-functional` | `registered_proposal` / authority_effect `none` / coverage `no_loss` |
| `HELIXSECURITY-L2-018` | `unit` | 1.x | `MPR-RC-HELIXSECURITY-L2-018-001` | `SECURITY-functional` | `registered_proposal` / authority_effect `none` / coverage `no_loss` |
| `HELIXSECURITY-L2-019` | `unit` | 1.x | `MPR-RC-HELIXSECURITY-L2-019-001` | `SECURITY-functional` | `registered_proposal` / authority_effect `none` / coverage `no_loss` |
| `HELIXSECURITY-L2-020` | `unit` | Guard 1.0、Botは必要時 | `MPR-RC-HELIXSECURITY-L2-020-001 → MPR-RC-HELIXSECURITY-L2-020-002` | `SECURITY-stage` | `registered_proposal` / authority_effect `none` / coverage `no_loss` |
| `HELIXSECURITY-L2-021` | `connection` | 1.0の境界、対象別能力に従う | `MPR-RC-HELIXSECURITY-L2-021-001 → MPR-RC-HELIXSECURITY-L2-021-002` | `SECURITY-functional-r2` | `registered_proposal` / authority_effect `none` / coverage `no_loss` |
| `HELIXSECURITY-L2-022` | `composite` | 1.0 | `MPR-RC-HELIXSECURITY-L2-022-001` | `SECURITY-functional` | `registered_proposal` / authority_effect `none` / coverage `no_loss` |
| `HELIXSECURITY-L2-023` | `composite` | 1.0 | `MPR-RC-HELIXSECURITY-L2-023-001` | `SECURITY-functional` | `registered_proposal` / authority_effect `none` / coverage `no_loss` |
| `HELIXSECURITY-L2-024` | `connection` | 1.0 | `MPR-RC-HELIXSECURITY-L2-024-001` | `SECURITY-functional` | `registered_proposal` / authority_effect `none` / coverage `no_loss` |
| `HELIXSECURITY-L2-025` | `composite` | 1.x、1.0から基盤準備 | `MPR-RC-HELIXSECURITY-L2-025-001` | `SECURITY-functional` | `registered_proposal` / authority_effect `none` / coverage `no_loss` |
| `HELIXSECURITY-L2-026` | `connection` | 1.x能力は1.x、Guard/Bot境界は1.0 | `MPR-RC-HELIXSECURITY-L2-026-001` | `SECURITY-functional` | `registered_proposal` / authority_effect `none` / coverage `no_loss` |
| `HELIXSECURITY-L2-027` | `composite` | 1.0 | `MPR-RC-HELIXSECURITY-L2-027-001 → MPR-RC-HELIXSECURITY-L2-027-002` | `SECURITY-functional-r2` | `registered_proposal` / authority_effect `none` / coverage `no_loss` |
| `HELIXSECURITY-L2-028` | `unit` | 1.0 | `MPR-RC-HELIXSECURITY-L2-028-001 → MPR-RC-HELIXSECURITY-L2-028-002` | `SECURITY-functional-r2` | `registered_proposal` / authority_effect `none` / coverage `no_loss` |

### Receiptファイル

- `SECURITY-stage`: [docs/governance/audits/requirement-registration/helix-security-stage-review-coverage-receipt-2026-09-27.json](https://github.com/RetryYN/HELIX-HARNESS/blob/f6dad2a33e24f000b87d7f09b8d40288257e74cc/docs/governance/audits/requirement-registration/helix-security-stage-review-coverage-receipt-2026-09-27.json)、SHA-256 `93c2d8e95ddbd6c81288ab8a0ba0aec04873f040e47a7ce2b2ac47ed112b2fe3`。
- `SECURITY-functional-r2`: [docs/governance/audits/requirement-registration/helixsecurity-functional-units-coverage-receipt-2026-09-27-r2.json](https://github.com/RetryYN/HELIX-HARNESS/blob/f6dad2a33e24f000b87d7f09b8d40288257e74cc/docs/governance/audits/requirement-registration/helixsecurity-functional-units-coverage-receipt-2026-09-27-r2.json)、SHA-256 `1d6d270a08943d07ebd4f69c6ff481e20002ec3ab08f2082996f9c2861ec7109`。
- `SECURITY-functional`: [docs/governance/audits/requirement-registration/helixsecurity-functional-units-coverage-receipt-2026-09-27.json](https://github.com/RetryYN/HELIX-HARNESS/blob/f6dad2a33e24f000b87d7f09b8d40288257e74cc/docs/governance/audits/requirement-registration/helixsecurity-functional-units-coverage-receipt-2026-09-27.json)、SHA-256 `377fe1b6d2c036748e15e17726a35b8f413e8c50f5546de8c1a66fed4317207b`。

## 判断前に提示した事項（2026-09-28回答済み）

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

判断前はPO判断未受領だった。受領後は実際の回答・対象revision・候補処置を記録し、本文変更があれば対のL11、register訂正revision、receipt、研究pinとbindingを追随させてexact HEADを再reviewする。候補の処置から旧sourceのretireや未完atomの被覆完了、L3承認、実装・release許可を生成しない。

8機構分の確認PRをすべて作成し、全件の独立review指摘0件まで作成側が進める。先行する確認PRのPO判断待ちを理由に、残る確認PRの作成・reviewを止めない。
