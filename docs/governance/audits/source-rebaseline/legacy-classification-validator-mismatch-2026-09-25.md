# 旧資産製品分類研究の検査と現行境界の食い違い

status: research audit（検査条件・分類候補・authorityは変更しない）
comparison_base: `8e37e3c944765a830f88d59d5412cc10bf3e993d`
current_base: `d4e8ebb47abea5dc21397a9997df1f3421833f50`（PR #2131統合後）

## 対象と結果

以下の6件は両baseで同じ検査失敗を示す。`validate.py`は現行のScaffold Binding upstreamと、研究時の固定BASEから作ったinventoryを同一の現行責務境界として照合する。固定入力に含む製品境界、HARNESS／OS／Web／Web-OSのL1、作業入口の6 pathは、Bindingでは現行bytes、inventoryでは旧bytesを指す。`SCF-B-0141`の製品境界upstream noteに記録された2026-09-24のConcept親付替え後の静的read-afterでBindingを現行bytesへ付け直した一方、固定BASEから生成したinventoryは旧receiptのまま保持した。単なる行位置・SHAのずれとして旧分類候補を現行判断へ付け替えると、研究時の意味判定を現行の承認済み判定と取り違える。

| Binding | 研究束 | 現行の最初の失敗 |
|---|---|---|
| `SCF-B-0141` | `scaffold/legacy-config-product-classification-0141/` | `E_BINDING_CLOSURE`（`product-boundary.md`） |
| `SCF-B-0142` | `scaffold/legacy-research-assets-product-classification-0142/` | `E_BINDING_CLOSURE`（upstream closure） |
| `SCF-B-0120` | `scaffold/legacy-schema-product-classification-0120/` | `E_BINDING_INPUT_DIGEST`（`product-boundary.md`） |
| `SCF-B-0123` | `scaffold/legacy-source-product-classification-0123/` | `E_INPUT_SET`（upstream closure） |
| `SCF-B-0145` | `scaffold/legacy-ai-instruction-product-classification-0145/` | `E_INPUT_DRIFT` |
| `SCF-B-0147` | `scaffold/legacy-execution-ticket-product-classification-0147/` | `E_BINDING_BYTES`（完全Binding pin） |

`SCF-B-0147`には上記6 pathに加え、OSのL2・L11とL2 source registerの3 pathも固定入力と現行Bindingのdigestが違う。archive sourceや旧test・旧CIは実行していない。対象6件の現行validatorだけを実行して失敗位置を確認した。

## 意味の差分

- 旧研究の固定BASEは`SCF-B-0141`／`0120`／`0123`／`0145`で`5562f04da0f3205f9aa58205ec0d478419fc4f2e`、`0142`／`0147`で`a577a7cddd1405de27bf01d22b050eb2acaa9ba9`である。各README・generator・inventoryは「四製品L1」または旧4対象の責務候補を入力としている。これは当時のsource snapshotとして保持する。
- 旧`docs/concept/product-boundary.md`の固定本文SHA-256は`097f2731…d285e02ee038`、現行本文は`9268e357…fd4eb2b3ac0a`である。現行本文は当時の4対象表を歴史的入口とし、機構・製品属性はConceptを参照する。OS・LABO・Intelligenceへの責務分担も変わっている。
- 2026-09-24の[PO判断](../../decisions/concept-requirement-po-decisions-2026-09-24.md)はWebとWeb-OSのL1・L2・L11を要求層から外してVision材料へ分類し直した。現行の両L1 frontmatterも`vision_material`である。旧4対象L1を現行の要求境界として検査する前提は、この判断と一致しない。
- 2026-09-25の[機構配置判断](../../decisions/mechanism-placement-po-decisions-2026-09-25.md)はOSの一部をLABO／Intelligence候補へ移した。旧研究の分類候補や固定digestだけから、現在の機構owner・採否・承認を導けない。

## 扱い

この6件はゴール1の「意味が現行判断と合わない検査」に計上する。検査条件、旧sourceの分類、候補owner、fixed BASEを変更しない。将来これらの研究を現行の機構別境界へ使う場合は、旧source・判断史・failure・consumerを再照合し、現行ConceptとPO判断を入力に責務候補を再導出する必要がある。この監査記録は、その採否や新しい検査契約を決めない。

参照した旧sourceは`archive/legacy-generation-2026-09-14/root/CLAUDE.md:72-85`のinventory-first・自律境界、上記6研究束の`README.md`・`generate.py`・`inventory.json`内の固定BASE receipts、および旧`docs/concept/product-boundary.md`の固定本文である。旧sourceの読み取り以外の操作はしていない。
