# PHCAP-15/17 orphan asset link research premise

PHCAP-15 Deploy と PHCAP-17 Incident の代表旧asset六件について、218件の要求unit crosswalkに対する直接意味linkの有無、旧sourceの静的証拠、四製品の候補routing、failure／consumer／decision残差を固定する research premise である。

この成果物は `authority_effect: none`、`new_build_allowed: false`、`meaning_change_applied: false` を維持する。旧sourceはarchiveから静的に読み、bytes、line範囲、digest、台帳状態を照合した。旧runtime、workflow、CLI、test、CI、hook、adapter、DB、外部APIは実行していない。

## 監査結果

- crosswalk対象は218 unit、321 unit-phase候補linkである。
- PHCAP-15 と PHCAP-17 の `direct_phase_candidates` を持つunitは各0件である。
- 218 unit全体の `direct_legacy_asset_links` は0件で、六assetの要求ID／source spanのexact matchも0件である。
- 六assetはcrosswalk metadataの `unreferenced_phase_representative_assets` と一致する。1897 planは別phase候補のcandidate poolに68件、4618 runbookはPHCAP-16/20 candidate poolに1件あるが、これは意味linkではない。
- 六assetすべてについて、旧sourceは文書／plan／process／skillの静的存在を示すだけで、要求unit固有の旧実装成立、実行、pass、consumer closureを示さない。台帳の旧実装状態は全件 `unknown` である。
- 候補routingは HELIX-HARNESS、HELIX-OS、HELIX-Web、HELIX-Web-OS の四製品を列挙する。asset／phase台帳の候補と現行product boundaryを接続候補として保持するだけで、owner、採否、successor、current implementation、phase admissionは確定しない。

## bounded search receipt

`inventory.json` の `requirement_link_audit` は crosswalk JSONL と metadataに限定した再計数である。asset source本文については、六archive pathのSHA-256、行数、各source anchorのsegment SHA-256を保持し、要求unit ID（`HIL-*`等）と218 unitのsource text spanを照合した。source本文には要求unit IDの出現がなく、長さ25文字以上のcrosswalk source span exact matchもない。一般語の類似はcandidate poolにも直接linkにも変換していない。

`failure_consumer_decision_audit` は六assetのdisposition台帳、phase/product classification台帳、append-only decision logを対象にした。decision recordは0件、consumer_refsは全件空、execution receiptは0件である。source内の旧review green、smoke、acceptance、route exit条件、runbook checklistは歴史的記述または未実行の設計条件として保持し、現行のfailure／pass／authorityへ昇格しない。

## 検証

```text
python3 -B scaffold/phcap15-17-orphan-asset-links/validate.py
python3 -B scaffold/phcap15-17-orphan-asset-links/selfcheck.py
python3 -B scaffold/tools/scfctl.py validate
python3 -B scaffold/tools/scfctl.py stale
python3 -B scaffold/tools/scfctl.py residuals
git diff --check
```

正式な要求unit、製品owner、phase、L2／L11、L3／L10、実装、受入、deployment、incident、consumer closureが人間判断で成立した場合に限り、別途正式crosswalkへ置換する。scaffoldの検証合格はその成立を意味しない。
