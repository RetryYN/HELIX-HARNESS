# outside-67 四製品L1 semantic relation 監査候補

outside-67 first15 inventoryから、旧pre-isolation pathのうち四製品のL1 path 4件を固定し、旧blobと現行承認済みL1のsemantic relationを行アンカー付きで記録する静的候補です。対象は次の4件です。

| 製品 | 旧path | semantic relation | gap |
|---|---|---|---|
| HELIX-HARNESS | `docs/design/harness/L1-planning/product-intent.md` | `partial` | 旧7要求を保持し、現行はL1-008／009を追加して9要求 |
| HELIX-OS | `docs/design/helix-os/L1-planning/system-intent.md` | `partial` | L1-007とP6でdeployment authorityをruntimeから分離 |
| HELIX-Web | `docs/design/helix-web/L1-planning/product-intent.md` | `exact` | 本文要求・責務境界は同一、front matterの参照pathのみ更新 |
| HELIX-Web-OS | `docs/design/helix-web-os/L1-planning/system-intent.md` | `exact` | 本文要求・責務境界は同一、front matterのparent pathのみ更新 |

4件の旧blobはpre-isolation commitとarchive commitで同一です。現行承認L1のSHAは2026-09-17 decision recordの承認表へ照合しています。製品責務は `docs/concept/product-boundary.md` の対象別入口と責務行へ照合しました。

13 live source holding（management registerのsupersedes終端）に対する旧path、旧blob OID、旧SHAのexact matchは4件とも0件でした。これはsemantic non-inclusionや要求不採用を意味しません。要求disposition review contract（`docs/governance/requirement-disposition-review-program.md:30-31`）に従い、新しいsourceである4旧blobはsemantic dispositionの前にsource_holdingへ登録する必要があります。現行L1とdecision recordのsemantic relationは証拠ですが、source_holdingを代替しません。今回の候補は登録を実行せず、4件すべてを `source_holding_required_before_semantic_disposition` としています。既存holdingへの直接包含が後続read-afterで証明される場合だけ、この前提を再評価できます。

candidateは `findings_only`、`authority_effect: none` で、正式source_holding、requirement identity、successor、採否、consumer closureを生成しません。旧archiveはGit objectを静的に読み、旧runtime・test・CI・hookは実行していません。

## 検証

```text
python3 scaffold/pre-isolation-outside-l1-semantic/generate.py
python3 scaffold/pre-isolation-outside-l1-semantic/validate.py
python3 scaffold/pre-isolation-outside-l1-semantic/selfcheck.py
python3 scaffold/tools/scfctl.py validate
python3 scaffold/tools/scfctl.py stale
python3 scaffold/tools/scfctl.py residuals
git diff --check
```
