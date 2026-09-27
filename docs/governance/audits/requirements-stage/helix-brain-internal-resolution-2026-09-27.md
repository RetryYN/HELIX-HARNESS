# HELIX-BRAIN 機構内監査 Finding 1 消化記録

## 対象・処置

- 対象revision: main `433b23968dabd8a01d1386ed43726d74b1e92eb2`。本記録はこのbaseからのL11受入具体化候補で、L1/L2の採択・意味変更、L3承認、実装/実行許可を生成しない。
- 対象identity: `HELIXBRAIN-L2-030` / paired `HELIXBRAIN-L11-030` connection。修正先は `docs/helix-brain/L11-acceptance/brain-acceptance.md:97-113` のみ。
- 処置分類: Finding 1を「既存L2-022/030契約をL11-030で区別して試すoracleの具体性不足」として補強。必須fieldの定義自体が欠けている状態と、定義済みrequired inputの値が未決の状態を別oracleにした。値未決の知識receiptは受領可能だが、未充足義務を閉じた扱いにせず、設計完成/実装準備とも別状態にする。
- 消化範囲: 元の正常・誤り・未見・依存区分の記述を維持したうえで、正常例、誤り例、未見例、依存区分に追加oracleを追記した。L2-022、L2-030、L1のidentity/意味/親、scope、version_target、依存宣言は変更していない。

## Source起点、保持点、変更点

| source | 原文位置 / asset / SHA-256 | 対応と保持点 |
|---|---|---|
| 旧Design Template JSON authority | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L4-basic-design/design-template-json-authority.md:23-27,34-41,61-91`; `LEGACY-ASSET-4F5A1F0739EC1111D91D`; `e254d995d1d9fbbcc74bb53b3356b4499ac20cca2280eeafde1412d08630c4cb` | Template ID/version、適用条件、required input/field、owner、trace、negative oracle、completionを個別要素として保持。field定義の欠落をfield値の未設定へ丸めない。旧JSON schema、algorithm、runtimeは移植・実行しない。 |
| 現行BRAIN L2 | `docs/helix-brain/L2-requirements/brain-requirements.md:106-115,434-442,575-584`; `01ff0931918dbf878698084e31ffaccb10e459fa1fca20992f22c4c4e2230e03` | L2-003はunknown/未入力を適用可能へ変換しない。L2-022はPattern input/dependencyからHARNESS-L2-009設計義務への双方向trace、値未定と未充足の区別、欠落を完了扱いしないことを明記。L2-030は選択知識のidentity/version/source/required fieldと未充足inputをreceiptへ渡す。今回これらの意味を新要求化せず受入oracleへ写す。 |
| 現行BRAIN L1 | `docs/helix-brain/L1-planning/brain-intent.md:26-28,66-68`; `2674b2e1a770a038b2d53a93ca635a0cbbfca42af463a562f22e1c51d5ebb5f0` | 汎用のPattern/Unit/PartをBRAINが持ち、製品固有意味と採用判断をCORE/HARNESSへ残す親境界を維持。 |
| 現行HARNESS requirement | `docs/helix-harness/L2-requirements/product-requirements.md:60-68`; `7ee1004f8d2c0eea7816b1e321a3ad4abd284156c50704b41476940491d5d44d` | HARNESS-L2-009はtemplateから設計義務を導き、必須inputの不足をBackflowで上流へ返す。義務の受領・設計導出はHARNESS ownerに残す。 |
| PO判断 | `docs/governance/decisions/brain-helix-core-po-intent-2026-09-25.md:51-56`; `f61155bf27e0563988b7ed2e652f894a3b11ab7eedf6e28fba204d98647e3657` | BRAINは設計知識とrequired inputを渡し、HARNESS-COREは固有設計、工程表等を導く。値未決のまま受領することと導出物の完成を区別する。 |

旧sourceの構造的なrequired field、trace、completionを現行L11で検査できる形に再導出した。変更したのはfield定義欠落と値未決を見分けるfixture、およびsource→HARNESS義務と逆traceを同時に検査するreceipt具体例である。旧schema、旧completion algorithm、BRAINからHARNESSへのauthority移譲は行っていない。

## 追加した受入oracle

| 区分 | 入力と期待結果 | 失敗時のowner |
|---|---|---|
| 正常: field定義あり・値未決 | 定義済みrequired fieldの値をunknown/未設定にする。知識receiptにfield identity/未決理由を残し、Pattern/Unit/Part/input・knowledge version→HARNESS-L2-009義務→元knowledge revision/fieldの正逆traceを確認。知識receiptは受領可能だが、未充足義務、接続全体、設計完成、実装準備は未成立。 | 元知識/field意味はBRAIN。義務結付け/receiver scopeはHARNESS。 |
| 誤り: required-field定義欠落 | field一覧または選択field定義を欠落させる。値未決と読み替えて通常受領しない。別Patternで欠落を相殺しない。逆trace違い、別revision/scope、受領後の未充足義務を完了扱いする場合も不合格。 | 知識意味・定義はBRAIN。受取schema/義務対応はHARNESS。 |
| 未見: 新しいPattern/Unit/Partと混在input | 定義済みfieldにknown値と未設定値を混在させる。fieldごとに値状態を保持し、選択知識の受領のみ成立可能。未選択知識は未観測、未充足義務は未完。field定義の欠落、逆trace欠落、scope違いは成功にしない。 | 知識意味/fieldはBRAIN、consumer scope/schemaはHARNESS。 |

上記は3種類の明示oracleである。既存の正常例（複数候補をreceiptへ対応付け、製品固有の最終選択をしない）、誤り例（connector stale、Pattern欠落、unknownの適用可能化、BRAINによる製品設計選択の拒否）、未見例（Pattern pair/版互換/未選択sourceの範囲）は削除・縮小していない。

## 変更検収用の記録

- L11-030変更前SHA-256（base `433b23968dabd8a01d1386ed43726d74b1e92eb2`）: `2b80d64785ed37353fdeee020c893236cd31dffac653206e613ad80f7dbd7e86`。
- L11-030変更後SHA-256: `7aa66ee36a31974fcd33473c768ddcd771d1bd7e61f26201ff53a3e241b7977b`。
- L2-022/030のpair意味不変を示すL2本文SHA-256: `01ff0931918dbf878698084e31ffaccb10e459fa1fca20992f22c4c4e2230e03`（変更なし）。L1本文SHA-256: `2674b2e1a770a038b2d53a93ca635a0cbbfca42af463a562f22e1c51d5ebb5f0`（変更なし）。
- 静的確認: 既存L11-030正常/誤り/未見/依存の本文を維持。field定義欠落とfield値未決の受入結果を分離し、正逆traceのsource revision/field/scopeを明記。要求本文、ID、4区分、依存、authority ownerの変更なし。実行/受入runtimeや旧runtime/test/CIは実行していない。
- 対象L11節とpairの変更digestを照合したうえで、Finding 1をL11 oracle具体化として閉じる。L2-022/030のsemantic digestは変更なし。別approval、要求採択、field補完、全BRAIN知識完成条件は追加しない。
