# HELIX-BRAIN 要求stage PO確認packet（草案）

## PO向け要約

**この候補で何ができるようになるか。** BRAINは、製品をまたいで再利用できる設計知識を、適用条件・必要input・根拠・失敗例・限界と一緒に整理します。製品側へPatternやUnitの候補を返し、採用判断はHARNESS-COREや人に残します。LABOで評価した材料を受け取り、Visual Design/UXの再利用知識も扱います。今回の1.0候補は共通知識とInfrastructure知識、状態・版、各接続を含みます。外部情報を取り込む経路は2.0候補として分けています。

**今回加わった候補と確認の強化。** 新しい`HELIXBRAIN-L2-028–030`は、知識packの版・互換性、Pattern関係の設計候補、BRAINからHARNESSへの知識受渡しをそれぞれ扱います。機構内監査後は、L1/L2を変えず、対のL11-030を補強しました。必須項目の定義が欠けている知識は不合格とし、定義はあるが値が未決の知識は、不足と理由を残して受け取れるように区別します。受領できても不足義務や設計の完成にはせず、元の知識・版・項目からHARNESSの設計義務へ、またその逆へ辿れることを確かめます。詳しくは[機構内解消記録](helix-brain-internal-resolution-2026-09-27.md)を参照してください。

**今回求める判断と影響。** 以前のPO判断で決まったVisual Design/UXの1.0範囲とVisual Design HARNESS連携は保持し、聞き直しません。POに求めるのはL1のこのSHAを確定するか差戻すか、そして42件のL2/L11候補を採用・保留・不採用または差戻しする判断です。推奨は既決の範囲を維持したまま、候補ID集合を明示して一括または部分処置を記録することです。これは知識構造・接続候補の対象意味を確定する判断であり、L3承認、実装許可、候補の自動昇格を生みません。保留/不採用でも旧sourceの意味を自動retireしません。

**基準commit:** `f6dad2a33e24f000b87d7f09b8d40288257e74cc`。以下の各pathはこのcommit固定のblobである。確認時にheadが変わった場合は、PO提示前に対象revision・SHA・リンク・candidate register対応を最新mainへ再固定する。

## 対象revisionと固定リンク

| 対象 | path | SHA-256 | 固定本文リンク |
|---|---|---|---|
| 親Concept | `docs/concept/helix-concept.md` | `06e210c312fc6a5f18c1fc29248e55ebe9c2eee0c177006e32d7b421af8baa78` | [docs/concept/helix-concept.md](https://github.com/RetryYN/HELIX-HARNESS/blob/f6dad2a33e24f000b87d7f09b8d40288257e74cc/docs/concept/helix-concept.md) |
| L1候補 | `docs/helix-brain/L1-planning/brain-intent.md` | `2674b2e1a770a038b2d53a93ca635a0cbbfca42af463a562f22e1c51d5ebb5f0` | [docs/helix-brain/L1-planning/brain-intent.md](https://github.com/RetryYN/HELIX-HARNESS/blob/f6dad2a33e24f000b87d7f09b8d40288257e74cc/docs/helix-brain/L1-planning/brain-intent.md) |
| L2候補 | `docs/helix-brain/L2-requirements/brain-requirements.md` | `01ff0931918dbf878698084e31ffaccb10e459fa1fca20992f22c4c4e2230e03` | [docs/helix-brain/L2-requirements/brain-requirements.md](https://github.com/RetryYN/HELIX-HARNESS/blob/f6dad2a33e24f000b87d7f09b8d40288257e74cc/docs/helix-brain/L2-requirements/brain-requirements.md) |
| L11受入候補 | `docs/helix-brain/L11-acceptance/brain-acceptance.md` | `7aa66ee36a31974fcd33473c768ddcd771d1bd7e61f26201ff53a3e241b7977b` | [docs/helix-brain/L11-acceptance/brain-acceptance.md](https://github.com/RetryYN/HELIX-HARNESS/blob/f6dad2a33e24f000b87d7f09b8d40288257e74cc/docs/helix-brain/L11-acceptance/brain-acceptance.md) |

L1/L2/L11のpath、commit、SHAは固定した。POは対象L1 revisionを確定し、確認packetに明示された全候補と対のL11一式を採用した（../../decisions/helix-brain-requirements-po-decision-2026-09-28.md）。候補表の固定baseline registration rowsは変更せず、採用はdecision recordと各最新registration IDの対応で読む。

## 継承済みのPO判断（聞き直さない）

POはL1アイデアに対し、Visual Designを1.0から扱い、Visual Design HARNESSと連携する選択を既に記録している。再確認事項ではなく履歴として保持する。

根拠source / decision（原文・判断記録本文は複製せず、識別子pathは原文どおり記載）:

- `docs/helix-brain/sources/brain-l1-idea-po-original-2026-09-26.md`（固定commit `f6dad2a33e24f000b87d7f09b8d40288257e74cc`、SHA-256 `d2b9f970fe40253c865b1ae52b1b0657da6f9668611c1b17e54723b69b6101e0`）
- `docs/governance/decisions/brain-l1-idea-po-decisions-2026-09-26.md`（固定commit `f6dad2a33e24f000b87d7f09b8d40288257e74cc`、SHA-256 `698a27758421909f5a16068ebdeb0c65a162858779964392ac56cd895d777e33`）
- `docs/helix-brain/sources/brain-infrastructure-domain-po-original-2026-09-26.md`（固定commit `f6dad2a33e24f000b87d7f09b8d40288257e74cc`、SHA-256 `09fcc8b0d41c26fcd51a3f0fa6b54a041f9605904c7048c1b564a9ca6366e72b`）
- `docs/governance/decisions/brain-helix-core-po-intent-2026-09-25.md`（固定commit `f6dad2a33e24f000b87d7f09b8d40288257e74cc`、SHA-256 `f61155bf27e0563988b7ed2e652f894a3b11ab7eedf6e28fba204d98647e3657`）

## PO判断内容（2026-09-28受領済み）

判断前の確認事項として提示したL1対象revisionと全42件の候補処置は、2026-09-28のPO回答で解決した。POは固定対象revisionを確定し、明示候補一式と対のL11を採用した。新たなL1/L2意味判断はこの記録から追加しない。

**L1判断（PO受領済み）:** POは`docs/helix-brain/L1-planning/brain-intent.md`のSHA-256 `2674b2e1a770a038b2d53a93ca635a0cbbfca42af463a562f22e1c51d5ebb5f0`を対象revisionとして確定した（[判断記録](../../decisions/helix-brain-requirements-po-decision-2026-09-28.md)）。

**L2/L11判断（PO受領済み）:** POは明示された全42 identityと同identityのL11一式を、候補表のversion_target・適用条件を保持して採用した。全identity・最新registration IDは[判断記録](../../decisions/helix-brain-requirements-po-decision-2026-09-28.md)に明記した。

### 候補集合：register・kind・version・receipt

下表は `f6dad2a33e24f000b87d7f09b8d40288257e74cc` 時点の各候補につき最新register行を1行示す。すべて候補登録であり、management_stateは`registered_proposal`、authority_effectは`none`。receiptは入力coverage照合の証拠であり、PO採用はdecision recordと最新registration IDの対応で読む。receipt自体はL11試験合格を証明しない。version_targetは能力目標版で、採択後の契約/実artifact版ではない。

| 候補identity | 親L1 | register ID | kind / version_target | coverage receipt |
|---|---|---|---|---|
| `HELIXBRAIN-L2-001` | HELIXBRAIN-L1-001 | `MPR-RC-HELIXBRAIN-L2-001-002` | `unit / 1.0` | `docs/governance/audits/requirement-registration/helixbrain-functional-units-coverage-receipt-2026-09-27-r3.json` |
| `HELIXBRAIN-L2-002` | HELIXBRAIN-L1-002 | `MPR-RC-HELIXBRAIN-L2-002-002` | `unit / 1.0` | `docs/governance/audits/requirement-registration/helixbrain-functional-units-coverage-receipt-2026-09-27-r3.json` |
| `HELIXBRAIN-L2-003` | HELIXBRAIN-L1-003 | `MPR-RC-HELIXBRAIN-L2-003-002` | `unit / 1.0` | `docs/governance/audits/requirement-registration/helixbrain-functional-units-coverage-receipt-2026-09-27-r3.json` |
| `HELIXBRAIN-L2-004` | HELIXBRAIN-L1-004 | `MPR-RC-HELIXBRAIN-L2-004-002` | `unit / 1.0` | `docs/governance/audits/requirement-registration/helixbrain-functional-units-coverage-receipt-2026-09-27-r3.json` |
| `HELIXBRAIN-L2-005` | HELIXBRAIN-L1-005 | `MPR-RC-HELIXBRAIN-L2-005-002` | `unit / 1.0` | `docs/governance/audits/requirement-registration/helixbrain-functional-units-coverage-receipt-2026-09-27-r3.json` |
| `HELIXBRAIN-L2-006` | HELIXBRAIN-L1-006 | `MPR-RC-HELIXBRAIN-L2-006-002` | `unit / 1.0` | `docs/governance/audits/requirement-registration/helixbrain-functional-units-coverage-receipt-2026-09-27-r3.json` |
| `HELIXBRAIN-L2-007` | HELIXBRAIN-L1-007 | `MPR-RC-HELIXBRAIN-L2-007-002` | `unit / 1.0` | `docs/governance/audits/requirement-registration/helixbrain-functional-units-coverage-receipt-2026-09-27-r3.json` |
| `HELIXBRAIN-L2-008` | HELIXBRAIN-L1-008 | `MPR-RC-HELIXBRAIN-L2-008-002` | `unit / 1.0` | `docs/governance/audits/requirement-registration/helixbrain-functional-units-coverage-receipt-2026-09-27-r3.json` |
| `HELIXBRAIN-L2-009` | HELIXBRAIN-L1-009 | `MPR-RC-HELIXBRAIN-L2-009-002` | `unit / 1.0` | `docs/governance/audits/requirement-registration/helixbrain-functional-units-coverage-receipt-2026-09-27-r3.json` |
| `HELIXBRAIN-L2-010` | HELIXBRAIN-L1-010 | `MPR-RC-HELIXBRAIN-L2-010-002` | `unit / 1.0` | `docs/governance/audits/requirement-registration/helixbrain-functional-units-coverage-receipt-2026-09-27-r3.json` |
| `HELIXBRAIN-L2-011` | HELIXBRAIN-L1-011 | `MPR-RC-HELIXBRAIN-L2-011-002` | `unit / 1.0` | `docs/governance/audits/requirement-registration/helixbrain-functional-units-coverage-receipt-2026-09-27-r3.json` |
| `HELIXBRAIN-L2-012` | HELIXBRAIN-L1-012 | `MPR-RC-HELIXBRAIN-L2-012-002` | `unit / 1.0` | `docs/governance/audits/requirement-registration/helixbrain-functional-units-coverage-receipt-2026-09-27-r3.json` |
| `HELIXBRAIN-L2-INFRA-001` | HELIXBRAIN-L1-001 | `MPR-RC-HELIXBRAIN-L2-INFRA-001-002` | `unit / 1.0` | `docs/governance/audits/requirement-registration/helixbrain-functional-units-coverage-receipt-2026-09-27-r3.json` |
| `HELIXBRAIN-L2-INFRA-002` | HELIXBRAIN-L1-002 | `MPR-RC-HELIXBRAIN-L2-INFRA-002-002` | `unit / 1.0` | `docs/governance/audits/requirement-registration/helixbrain-functional-units-coverage-receipt-2026-09-27-r3.json` |
| `HELIXBRAIN-L2-INFRA-003` | HELIXBRAIN-L1-003 | `MPR-RC-HELIXBRAIN-L2-INFRA-003-002` | `unit / 1.0` | `docs/governance/audits/requirement-registration/helixbrain-functional-units-coverage-receipt-2026-09-27-r3.json` |
| `HELIXBRAIN-L2-INFRA-004` | HELIXBRAIN-L1-003, HELIXBRAIN-L1-005 | `MPR-RC-HELIXBRAIN-L2-INFRA-004-002` | `unit / 1.0` | `docs/governance/audits/requirement-registration/helixbrain-functional-units-coverage-receipt-2026-09-27-r3.json` |
| `HELIXBRAIN-L2-INFRA-005` | HELIXBRAIN-L1-010 | `MPR-RC-HELIXBRAIN-L2-INFRA-005-002` | `unit / 1.0` | `docs/governance/audits/requirement-registration/helixbrain-functional-units-coverage-receipt-2026-09-27-r3.json` |
| `HELIXBRAIN-L2-INFRA-006` | HELIXBRAIN-L1-002, HELIXBRAIN-L1-010 | `MPR-RC-HELIXBRAIN-L2-INFRA-006-003` | `unit / 1.0` | `docs/governance/audits/requirement-registration/helixbrain-functional-units-coverage-receipt-2026-09-27-r3.json` |
| `HELIXBRAIN-L2-INFRA-007` | HELIXBRAIN-L1-004 | `MPR-RC-HELIXBRAIN-L2-INFRA-007-003` | `unit / 1.0` | `docs/governance/audits/requirement-registration/helixbrain-functional-units-coverage-receipt-2026-09-27-r3.json` |
| `HELIXBRAIN-L2-INFRA-008` | HELIXBRAIN-L1-003 | `MPR-RC-HELIXBRAIN-L2-INFRA-008-003` | `unit / 1.0` | `docs/governance/audits/requirement-registration/helixbrain-functional-units-coverage-receipt-2026-09-27-r3.json` |
| `HELIXBRAIN-L2-INFRA-009` | HELIXBRAIN-L1-003 | `MPR-RC-HELIXBRAIN-L2-INFRA-009-003` | `unit / 1.0` | `docs/governance/audits/requirement-registration/helixbrain-functional-units-coverage-receipt-2026-09-27-r3.json` |
| `HELIXBRAIN-L2-INFRA-010` | HELIXBRAIN-L1-003, HELIXBRAIN-L1-010 | `MPR-RC-HELIXBRAIN-L2-INFRA-010-002` | `unit / 1.0` | `docs/governance/audits/requirement-registration/helixbrain-functional-units-coverage-receipt-2026-09-27-r3.json` |
| `HELIXBRAIN-L2-INFRA-011` | HELIXBRAIN-L1-004 | `MPR-RC-HELIXBRAIN-L2-INFRA-011-002` | `unit / 1.0` | `docs/governance/audits/requirement-registration/helixbrain-functional-units-coverage-receipt-2026-09-27-r3.json` |
| `HELIXBRAIN-L2-INFRA-012` | HELIXBRAIN-L1-005, HELIXBRAIN-L1-011 | `MPR-RC-HELIXBRAIN-L2-INFRA-012-002` | `unit / 1.0` | `docs/governance/audits/requirement-registration/helixbrain-functional-units-coverage-receipt-2026-09-27-r3.json` |
| `HELIXBRAIN-L2-INFRA-013` | HELIXBRAIN-L1-001, HELIXBRAIN-L1-002 | `MPR-RC-HELIXBRAIN-L2-INFRA-013-003` | `unit / 1.0` | `docs/governance/audits/requirement-registration/helixbrain-functional-units-coverage-receipt-2026-09-27-r3.json` |
| `HELIXBRAIN-L2-INFRA-014` | HELIXBRAIN-L1-005 | `MPR-RC-HELIXBRAIN-L2-INFRA-014-003` | `unit / 1.0` | `docs/governance/audits/requirement-registration/helixbrain-functional-units-coverage-receipt-2026-09-27-r3.json` |
| `HELIXBRAIN-L2-INFRA-015` | HELIXBRAIN-L1-005 | `MPR-RC-HELIXBRAIN-L2-INFRA-015-002` | `unit / 1.0` | `docs/governance/audits/requirement-registration/helixbrain-functional-units-coverage-receipt-2026-09-27-r3.json` |
| `HELIXBRAIN-L2-INFRA-016` | HELIXBRAIN-L1-010 | `MPR-RC-HELIXBRAIN-L2-INFRA-016-003` | `unit / 1.0` | `docs/governance/audits/requirement-registration/helixbrain-functional-units-coverage-receipt-2026-09-27-r3.json` |
| `HELIXBRAIN-L2-INFRA-017` | HELIXBRAIN-L1-007, HELIXBRAIN-L1-008 | `MPR-RC-HELIXBRAIN-L2-INFRA-017-002` | `unit / 1.0` | `docs/governance/audits/requirement-registration/helixbrain-functional-units-coverage-receipt-2026-09-27-r3.json` |
| `HELIXBRAIN-L2-018` | HELIXBRAIN-L1-007, HELIXBRAIN-L1-011 | `MPR-RC-HELIXBRAIN-L2-018-002` | `connection / 1.0` | `docs/governance/audits/requirement-registration/helixbrain-functional-units-coverage-receipt-2026-09-27-r3.json` |
| `HELIXBRAIN-L2-019` | HELIXBRAIN-L1-003, HELIXBRAIN-L1-004, HELIXBRAIN-L1-012 | `MPR-RC-HELIXBRAIN-L2-019-002` | `connection / 1.0` | `docs/governance/audits/requirement-registration/helixbrain-functional-units-coverage-receipt-2026-09-27-r3.json` |
| `HELIXBRAIN-L2-020` | HELIXBRAIN-L1-007, HELIXBRAIN-L1-009, HELIXBRAIN-L1-010 | `MPR-RC-HELIXBRAIN-L2-020-002` | `connection / 1.0` | `docs/governance/audits/requirement-registration/helixbrain-functional-units-coverage-receipt-2026-09-27-r3.json` |
| `HELIXBRAIN-L2-021` | HELIXBRAIN-L1-003, HELIXBRAIN-L1-004, HELIXBRAIN-L1-012 | `MPR-RC-HELIXBRAIN-L2-021-002` | `connection / 1.0` | `docs/governance/audits/requirement-registration/helixbrain-functional-units-coverage-receipt-2026-09-27-r3.json` |
| `HELIXBRAIN-L2-022` | HELIXBRAIN-L1-003, HELIXBRAIN-L1-005, HELIXBRAIN-L1-012 | `MPR-RC-HELIXBRAIN-L2-022-002` | `connection / 1.0` | `docs/governance/audits/requirement-registration/helixbrain-functional-units-coverage-receipt-2026-09-27-r3.json` |
| `HELIXBRAIN-L2-023` | HELIXBRAIN-L1-006, HELIXBRAIN-L1-007, HELIXBRAIN-L1-009 | `MPR-RC-HELIXBRAIN-L2-023-002` | `connection / 1.0` | `docs/governance/audits/requirement-registration/helixbrain-functional-units-coverage-receipt-2026-09-27-r3.json` |
| `HELIXBRAIN-L2-024` | HELIXBRAIN-L1-007, HELIXBRAIN-L1-008, HELIXBRAIN-L1-010 | `MPR-RC-HELIXBRAIN-L2-024-002` | `composite / 1.0` | `docs/governance/audits/requirement-registration/helixbrain-functional-units-coverage-receipt-2026-09-27-r3.json` |
| `HELIXBRAIN-L2-025` | HELIXBRAIN-L1-007, HELIXBRAIN-L1-008, HELIXBRAIN-L1-009, HELIXBRAIN-L1-011 | `MPR-RC-HELIXBRAIN-L2-025-002` | `composite / 1.0` | `docs/governance/audits/requirement-registration/helixbrain-functional-units-coverage-receipt-2026-09-27-r3.json` |
| `HELIXBRAIN-L2-026` | HELIXBRAIN-L1-007, HELIXBRAIN-L1-009, HELIXBRAIN-L1-010 | `MPR-RC-HELIXBRAIN-L2-026-002` | `connection / 2.0` | `docs/governance/audits/requirement-registration/helixbrain-functional-units-coverage-receipt-2026-09-27-r3.json` |
| `HELIXBRAIN-L2-027` | HELIXBRAIN-L1-007, HELIXBRAIN-L1-009, HELIXBRAIN-L1-010, HELIXBRAIN-L1-011 | `MPR-RC-HELIXBRAIN-L2-027-002` | `composite / 2.0` | `docs/governance/audits/requirement-registration/helixbrain-functional-units-coverage-receipt-2026-09-27-r3.json` |
| `HELIXBRAIN-L2-028` | HELIXBRAIN-L1-008 | `MPR-RC-HELIXBRAIN-L2-028-002` | `unit / 1.0` | `docs/governance/audits/requirement-registration/helixbrain-functional-units-coverage-receipt-2026-09-27-r3.json` |
| `HELIXBRAIN-L2-029` | HELIXBRAIN-L1-003, HELIXBRAIN-L1-005, HELIXBRAIN-L1-009 | `MPR-RC-HELIXBRAIN-L2-029-001` | `unit / 1.0` | `docs/governance/audits/requirement-registration/helix-brain-design-composition-coverage-receipt-2026-09-27.json` |
| `HELIXBRAIN-L2-030` | HELIXBRAIN-L1-003, HELIXBRAIN-L1-005, HELIXBRAIN-L1-012 | `MPR-RC-HELIXBRAIN-L2-030-002` | `connection / 1.0` | `docs/governance/audits/requirement-registration/helix-brain-stage-review-coverage-receipt-2026-09-27.json` |

候補数: `42`。L2 identity見出しから抽出したID集合とL11受入identityを照合し、候補全件が同一identityで対になっている。登録行照合はidentityごとに最新のappend-only recordを選択。以前の訂正revisionはregister履歴に残し、上書きしない。L2見出しに存在しない番号を連番補完していない。

## 判断前に提示した論点（回答済み）

PO判断前に提示したL1対象revision確定とL2/L11候補処置は、2026-09-28の回答で対象revision確定・全42件採用として解決した。L1/L2の選択肢は現在の未決事項として再提示しない。旧source未完引継ぎ、L3承認、実装順序は別の未完事項として保持する。

## 対象固有の責務・版境界

L2は単体・接続・構成体ごとの機能候補。BRAIN候補の採用で製品固有意味やHARNESS設計合成をBRAINへ移さず、1.0候補と2.0候補を分けて判断する。

全42候補は上表に一件ずつ列挙。共通知識、Infrastructure知識、一般接続/構成体のidentityを含む。一般系列013–017は明示された欠番であり、候補へ含めない。

## PO判断受領済み

- L1対象revision: **確定**。`docs/helix-brain/L1-planning/brain-intent.md`、SHA-256 `2674b2e1a770a038b2d53a93ca635a0cbbfca42af463a562f22e1c51d5ebb5f0`。
- L2/L11候補処置: **全42件採用**。identity・最新registration ID・version_target／適用条件は[判断記録](../../decisions/helix-brain-requirements-po-decision-2026-09-28.md)と上表を参照。
- register行: 固定commitの既存状態を変更していない。採用はdecision recordと最新registration ID対応から読む。
- coverage receipt: source coverageの照合証拠として既存状態を保持し、PO判断receiptや実受入合格とは扱わない。
- 旧source未完引継ぎ: **未完のまま保持**。全被覆やretireは推定しない。
- L3承認・実装許可・実装順序A/B: **今回未決定**。

## 確認PRの前提とPO判断受領後の扱い

機構内の監査・解消16 PR、横断監査 #2195 と解消 #2196、総合検証 #2197 はmerge/read-after済み。[総合検証](integrated-verification-2026-09-27.md)から根拠へ辿れる。本資料は要求本文の固定revisionへの読み口であり、本文やsource atomの被覆を置き換えない。

[PO指示の手順4](../../sources/requirements-stage-po-handoff-original-2026-09-27.md)に従い、PO判断記録を本PRへ追加済みである。提示revisionと明示候補集合への一括判断を記録し、ID再列挙は求めない。独立reviewは資料・記録の正確さを照合し、PO判断を代行しない。

旧自律境界（LEGACY-ASSET-6EBDB617A8104A7756D0、`archive/legacy-generation-2026-09-14/root/CLAUDE.md:82-85`、SHA-256 `7bdfc0bc578359e42efae4242ee42b53abd6e2ec23874f1294d3ec0e278c8feb`）の、人が企画・要求の意味を持ちAIが要件以下を起草する分担を保持する。旧層番号・旧runtime・旧merge方式は移植しない。現行のL1/L2対象revision判断と、L3要件承認を分ける。

PO判断を受領し、同PRに判断記録を追加した。対象本文revisionとcandidate本文は不変で、register訂正revision・coverage receipt・research pinを更新していない。独立review、merge後read-afterを経てから次の総合整理へ進む。旧sourceのretire、未完atomの被覆完了、L3承認、実装・release許可は生成しない。

8機構分の確認PRは作成済みである。判断記録を反映した各HEADを独立reviewし、指摘解消後にmerge・read-afterする。
