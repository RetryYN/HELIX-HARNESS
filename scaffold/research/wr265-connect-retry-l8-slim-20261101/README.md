# WR265 CONNECT004 L8 retry/deduplication/conflict slim

このscaffoldは DT-VT-105 に沿う L8 候補と静的照合の手順を記録する。L8 は既存69件のcase IDと順序・`function_ref`を先頭で保ち、凍結baseの independent_local_probes 13件を追加のU-ID-070..082として続ける。全82行は一意な `u_id` と元 `function_ref` を持つ。

## 行の根拠と境界

各counterexampleは固定L9 raw sourceの入力条件だけを記述し、raw packet自体は複製しない。`counterexample_source_ref` は追跡用pointerで、将来L9 slimで移行が必要になるconsumerである。各expectedは承認済みL3 requirement、L4 contract、既存L5 function/failure ruleから独立に導く。L9 `expected_material` は別のoracle pointerとして照合に使うだけで、L8 expectedの生成元にはしない。L3/L4/L5からclaimのaccept/rejectを導けない既存10行は `expected_status: unverified` とし、L9記述から補完しない。

既存69行の `function_ref` は凍結baseの値を保ち、case IDとともに既存L5 `obligation_trace` consumerへ解決する。probe 13行も凍結baseの関数参照を保ち、既存L5 calculation programへ解決する。probe入力は固定L9 raw packetを基底とする凍結base記録から照合し、probe固有のL9 expected_materialがないため期待比較先を作らない。期待はL3/L4/L5から独立導出する。関数定義、calculation program、failure ruleやbranch表をL8へ重ねていない。全82行は未実行であり、実retry、receiver効果、receipt、policy、承認、製品testを主張しない。F03 retryable result ownerはL5条件分岐に従い、`business_nonretryable` は business-owner、それ以外のunknownは operation-owner へ返す。L9実例、L4出力境界、L10 failure observationと整合する。

legacy referencesは参照のみ: `LEGACY-ASSET-C3DE79BA9451172F3E43` と `LEGACY-ASSET-DD66C1B6B7BE234B37E6`。same-key/same-digest deduplication、異digest conflict、operation identity、既存retry policy、fault recovery境界を保持し、旧cursor codec、database、runtime、execution pathは移さない。

## 検証

`validate_uid_table.py` は既定でread-only。固定baseから元69件のcase ID/順序/function_refと独立probe 13件のID/order/function_refを照合し、U-ID 82件の一意性、69件のL5 consumer、13件のprobe source ref・意味付き入力条件・L9 raw + 固定base input correspondence、L3/L4/L5から作る全82行のexpected/status/basis refs、L9 expected_materialとの69件のarea/field/result/owner比較、7件のarea別未識別変異、L4/L10 owner境界、required `removed_materials` 6 keysを確認する。反例条件は「先頭caseと異なる」のみの汎用表現で済ませず、固定raw inputが示す未観測、identity重複、累積値減少などの意味を記す。L5 algorithmや製品testは実行しない。

新しいimmutable recordが必要な場合だけ未使用pathを明示する:

```sh
python3 -B scaffold/research/wr265-connect-retry-l8-slim-20261101/validate_uid_table.py --record-id WR265-RETRY-L8-CURRENT-STATIC-R9 --record scaffold/research/wr265-connect-retry-l8-slim-20261101/verification-summary-main-overlay-r9.json
```

書込みはexclusive作成で、既存pathを拒否する。current summary R9はlatest `origin/main` overlay上の記録で、summary生成前validateとの循環を避けるためbinding artifact一覧には含めない。旧summary bytesは複製せず、`evidence-history.json` に既存commit/blob/SHA-256/byte lengthとhistory JSON pointerまたは直接pathを記録する。validatorは元archiveと各summaryを再抽出し、SHA-256/byte lengthを実測照合する。履歴summaryは実行入力やexpected fallbackに使わない。

latest `origin/main` merge overlayで `scfctl validate`, `scfctl stale`, 固有validator、`design_verification_checker.py check-child` を実測し、各結果をそのまま記録する。`not_evaluated` はpassではない。証拠は静的scaffold照合で、承認やformal L8 completionを示さない。
