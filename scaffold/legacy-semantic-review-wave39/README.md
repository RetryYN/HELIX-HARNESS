# Wave39 legacy semantic review Scaffold

このScaffoldは、`origin/main=38d38f47794e70d621403ad8dbeac56518a76766` を入力基点に、旧IRの未レビュー候補5 unitを、requirements／decomposition／旧asset catalogの静的な研究候補として保持する。作成時点のHEADはこのbaseであり、`validate.py` の ancestor gate はこのrevision自身と、その後の子孫HEADの両方を許す。成果物は正式要求、現行owner、authority、phase admission、implementation、degradation、consumer closureを生成しない。

対象unitは次の5件である。

- `IRUNIT-HIL-NFR-14-HELIX-OS`: 不正JSON、schema不一致、oversize、sequence欠落、worker crash、timeout、cancel、backpressure、親process消失をfail-closeし、partial resultを正本へ昇格しないという旧文を、一つの未分割composite候補として保持する。旧failure recordは `HIL_WORKER_JSON_INVALID`、`HIL_WORKER_PAYLOAD_OVERSIZE`、`HIL_WORKER_SEQUENCE_GAP`、`HIL_WORKER_TIMEOUT`、`HIL_WORKER_CRASHED`、`HIL_WORKER_BACKPRESSURE_EXCEEDED`、`HIL_WORKER_PARENT_LOST`、`HIL_IPC_FAIL_OPEN` を歴史記述として照合した。旧consumerは `PythonWorkerBroker`／`HOT-HIL-24` とされるが、現行consumer closureはpendingである。
- `IRUNIT-HIL-NFR-21-HELIX-OS`: append-only原記録、AI dispositionによる削除・不可視化・終端化禁止、PO以外のcancel/supersede禁止、独立reviewなしのfalse-positive/accepted-risk拒否を一つの未分割composite候補として保持する。旧failure recordは duplicate target、false-positive未検証、risk approval欠落、unauthorized cancel、append-only violation 等を歴史記述として保持し、旧consumer `DirectiveCustodyGate`／`HOT-HIL-36` と現行pendingを分離する。
- `IRUNIT-HIL-TR-01-HELIX-OS`: Node strict／Bun除去とactive surface契約を一つの未分割composite候補として保持する。`IR-ROUTE-Q1` と `runtime_or_technology_constraint_product_contract_vs_internal_implementation` は未解決routing holdとして行とmetaへ保存する。旧failure `HIL_NODE_CONTROL_PLANE_INVALID`／`HIL_ACTIVE_BUN_*`、旧consumer `NodeControlPlane`／`BunDependencyCoverageGate` は歴史の照合結果であり、Node実装完了や現行OS authorityを意味しない。
- `IRUNIT-HIL-TR-08-HELIX-HARNESS` と `IRUNIT-HIL-TR-08-HELIX-OS`: 同一の旧文から、それぞれの最小source spanを保持する。`child process＋versioned JSON Lines over stdio` はHARNESSの規範候補とOSの運転候補に共有し、両rowの `connection_records` と atomの `shared_with_units` で接続を明示する。HARNESSはphase未解決、OSは旧PHCAP-10候補のまま保持する。envelope fields、stdout protocol／stderr診断分離は各unitのsource spanに含めるが、製品境界の確定には使わない。旧failure `HIL_IPC_ENVELOPE_INVALID`／`HIL_WORKER_PAYLOAD_DIGEST_MISMATCH` と旧consumer `PythonWorkerBroker` を静的に照合し、現行consumer／implementation／degradationはpending／unknownのままにする。

各unitは requirement、design、implementation_source の3 role edge、合計15 edgeである。要求sourceの候補atomは、NFR14／NFR21／TR01が各1、TR08のHARNESS／OSが各2、合計7。各unitに一つずつ `composite_unresolved` を付け、合計5として別計数する。原文の義務を単語や表セルへ水増しせず、normalizedな現行判断を付加しない。TR08の共有接続は原文にある関係だけを保持し、現行product routing推論は `candidate` と `unresolved` の範囲に留める。

assetは13件を調査対象分母として保持する。10件は15 role edgeの選択集合（要求assetは共有）に使い、3件（`LEGACY-ASSET-08488BBF033F37F536AB`、`LEGACY-ASSET-50A93B0E753DC3840E03`、`LEGACY-ASSET-F15959C1E9E9256ED64B`）はsource／catalog／decision／failure／consumerの補助照合に使う。全assetについて、catalog source SHA、legacy implementation status、disposition、decision、copy/read-after、consumer refsを読み、旧実行は行っていない。`LEGACY-ASSET-4AB89A46AE3C74CD5584` はBR19で既済のため選択・再計上しない。

旧assetの `candidate_product_targets` と現行 `docs/concept/product-boundary.md`／各製品L1は候補境界の比較入力である。HARNESS、OS、Web、Web-OSをauthorityへ昇格させず、Web/Web-OSの直接根拠を補わない。旧phase候補、旧実装状態、縮退、failure outcome、consumer closure、successorは未確定として記録する。

`generate.py` は旧archiveをimportせず、source／catalog／crosswalk／decomposition／routing queue／decision／failure／consumer ledgerとWave1〜38の静的成果物を読み、同じ入力から決定的にledger/metaを再生成する。`validate.py` はschema、unit／role／asset keyset、exact source span、source digest、TR08 shared relation、TR01 `IR-ROUTE-Q1`、13 asset分母、prior overlap、四製品候補境界、unknown status、base ancestorをfail-closedに検査する。`selfcheck.py` は本体validator経路で11種類の否定変異を拒否する。

```text
python3 -B scaffold/legacy-semantic-review-wave39/generate.py
python3 -B scaffold/legacy-semantic-review-wave39/validate.py
python3 -B scaffold/legacy-semantic-review-wave39/selfcheck.py
python3 scaffold/tools/scfctl.py validate
python3 scaffold/tools/scfctl.py stale
python3 scaffold/tools/scfctl.py residuals
git diff --check
```

旧archive配下のworkflow、runtime、test、CI、hook、adapter、sourceは実行していない。Bindingは `SCF-B-0068` として研究候補を登録し、mergeやPRの状態から要求・authority・実装成立を推定しない。
