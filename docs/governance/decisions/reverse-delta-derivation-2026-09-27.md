# G16 Reverse・差分改修候補の導出記録（2026-09-27）

## 記録の位置づけ

これはPO原文第2項を既存HELIX-HARNESSの親・要求へ接続し、L2/L11の未採択候補を導出した記録である。POによるL1意味の追加採択、L2要求の採択、Version 1への収載、設計・実装・変更適用の承認を表さない。G16候補identityのauthorityはdraft candidateであり、L1は現在の状態のまま確認待ちとする。

起点は[PO補強原文](../../helix-harness/sources/capability-reinforcement-po-original-2026-09-27.md)第2項と、[全5項の起点記録](capability-reinforcement-po-decisions-2026-09-27.md)。原文SHA-256は `ab8bb6ae8cd418053d6baaafccaa80ee8ef2e715caab1576e5a00c306e97d1f8`。前書き1〜4行はClaude、区切り以降はPOである。共通手順は `scaffold/review-handoff/local/codex-goals-2026-09-27.md` の第5弾G16（読取り時SHA-256 `7eb3bcf5e27310db3fab0b31bf3ae27c8afb9ce557e3b417a2d29d374d475909`）。旧source・親と導出の対応は以下に記録する。

## 旧HELIX sourceと保持・変更

| Source | 読んだ範囲と保持する意味 | 変更と理由 |
|---|---|---|
| `LEGACY-ASSET-B5B5E71B2AF1459D59A1`、`archive/legacy-generation-2026-09-14/root/docs/design/harness/L3-functional/functional-requirements.md:406–426`（FR-14）、SHA-256 `a90609ad8145d8b9c1be6a6870b6ecad4bc71f3708fc977edd14f926c074257a` | 既存コード・設計・依存を読み、evidence/as-is/gap/routing候補とunknownを明示するReverse。archive本文内のAC-FR-14-01〜03も読み、正常抽出、必須reverse type欠落、gap-only境界の意味を確認した。 | 旧`helix reverse`、R0–R4 workflow、`.helix/`出力を実行・移植しない。現行のHARNESS-L2-019入口・result境界を保つ。 |
| `LEGACY-ASSET-D11F51092619506417E4`、`archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/multimodal-design-harness-authority.md:56–69,71–78,121–145`、SHA-256 `baf570f59ac838302f69a27b17a6febca78bf911278af21a9d2f4f9e87a1edd2` | 外部Reverse extractorのcandidate状態、source digest/extractor version/uncertainty/provenance、confidenceだけでcanonical化しない境界。 | 旧source setはDOM/screenshot等の視覚設計用であり、一般code/DB/API/configへschemaごと一般化しない。現行入力typeをPO要求から再導出する。 |
| `LEGACY-ASSET-EB3700B0088F311C2295`、`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/agentic-audit-future-state-delta-requirements.md:50–78`、SHA-256 `685d95abf7218410b807dd9c58efd73a45b0b1937f820fefacf111fb2276bc1a` | source revision/digestと差分を接合し、affected exact set、evidence/unknown、authority non-writeを保つ意味。 | internal audit delta schemaを製品reverseへコピーしない。製品のobserved code/DB/API/configと保存designを別に照合する。 |
| `LEGACY-ASSET-CAC0C64EB7540180B1FE`、`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/agentic-audit-future-state-delta-acceptance.md:20–25,42–46`、SHA-256 `09d07e224518c0e14f946c8aaaf20128da422e0b554a7446c1d019d8263c0d5a` | wrong/stale receipt、affected set欠落、unknownの不当補完、Requirement direct write拒否の受入材料。 | 旧acceptanceを実行せず、そのnegative meaningだけをG16の限定内容oracleに再導出する。 |

旧sourceはhistorical/candidateであり、現行authority・成功証拠ではない。新候補は「一回取り込める」Reverseを保ちつつ、POが求める外部編集後の再比較と限定改修案へ具体化する。実変更・migration適用は追加しない。

## 現行親との対応

- Concept `docs/concept/helix-concept.md:265–268` は入口Full Reverseと、COREによる製品固有意味・設計・要求/設計/実装/test traceを支える。ただし外部編集後の反復差分比較・custom logic保全・API限定repair案までは規定しない。
- `HARNESS-L1-003`（要求変更から設計/実装/検証への影響伝達）と`HARNESS-L1-005`（外部利用者が明示された版・構成・条件で利用）が現HARNESS-L2-019の親である。G16候補はこの既存L1の具体化であり、新しい企画意味を導入しない。L1本文・採択状態は変更しない。
- `HARNESS-L2-019`は既存要件/code/PoCをHELIX形式へ変換する入口とunknown/result boundaryを保つ。027はそこで選択されるsource-type extraction unitであり、019の処理完了receiptを依存しない。019利用が027対応source typeを選ぶ時は、027がその利用の必須依存となり、019がtype/scope/revisionを渡し、027 observation receiptを019 resultへ返す。非対応typeだけを扱う019利用へ027を一律必須化しない。
- `HARNESS-L2-003/004`は影響範囲、Scoped Reverse、意味を保てる変更とBackflowをすでに所有する。028/029は影響判定やBackflowを置き換えず、source/delta/proposalをこれらのcontractへ接続する。
- `HARNESS-L2-014`は承認済み設計と設計工程、`HARNESS-L2-022`はoracle・検証・受入stageを保持する。G16出力をauthorityまたはAcceptedへ昇格させない。

## PO第2項の条件と候補identityの対応

| PO条件 | Candidate | 保持する入力・結果条件と限界 |
|---|---|---|
| code/DB definition/API definition/configから構造・振舞いを抽出しdesign modelへ戻す | `HARNESS-L2-027` unit | source typeごとにsource revision/digest/read scopeを固定し、根拠span付きobservation candidate、unsupported/unknown、未選択sourceの未観測を返す。raw source extractionのみの027にrequirement revisionや保存designを一律要求しない。要求意味・実測runtimeを捏造せず、設計正本へ直接書かない。 |
| 保存設計と実物の差を突合せ、変更対象だけの設計差分を作る | `HARNESS-L2-028` connection | 027の有効receipt、current saved design/requirement revision、product/scope、L2-003/004 impact/Backflow contractを結び、affected exact setとunknownを返す。known traceの局所比較と由来不明時の全体Reverseを区別する。 |
| 外部独自処理を認識し残し、関連部分だけのcode修正案とdata migration案を作る | `HARNESS-L2-029` composite | 027＋028を常時接続し、保存design revisionを差分の比較基準として必須にする。proposal自体を事前承認済みにする要件は作らない。API contract/実装revision/oracleはAPI repair案を作る操作時、schema/data owner/loss/rollback/compatibility oracleはmigration案を作る操作時に必須。custom logicを保持対象として説明し、案を適用しない。 |

各候補のL2本文は、単体・接続・構成体のkind、full parent L1 IDs、version_target、scope、入力/出力、依存4区分、失敗時戻し先をidentityごとに閉じる。L11はfield presenceではなく、本文に示したfixture上の内容oracleで確認する。未見例の合格をそのrevision/source/scope外へ一般化しない。

## Candidate authorityと戻し先

`HARNESS-L2-027`（単体source extraction）、`HARNESS-L2-028`（connection差分照合）、`HARNESS-L2-029`（composite往復改修proposal）はすべて未採択の`version_target: 1.0` candidateであり、この記録から採択・実装許可を生成しない。G15候補の`HARNESS-L2-025/026`は保存設計候補として対象revisionで適用が確認できた場合のみ入力にし、candidateを承認設計とは扱わない。G16はG15設計合成、G17 simulation、G18 test/reproduction generation、G19 worker支援を重複所有しない。

要求/製品意味の差はHARNESS-L2-008/該当上流ownerへ、設計義務・境界の差はHARNESS-L2-014/設計ownerへ、verification oracle不足はHARNESS-L2-022へ、入力source/read permission不足はsource/security/data ownerへ戻す。unknown/stale/矛盾は非影響・no-changeへ推定しない。code patch、data migration、commit、releaseはこの候補の外である。
