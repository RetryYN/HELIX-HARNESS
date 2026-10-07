# HELIX-OS 040 retry counter semantics 補強監査

## 対象と判断

この時点記録は、`5857c0a396cb24a23d765e3079a18a2367b6d078` を起点に、採択済み `HELIXOS-L2-040` に対応するFR/L10 oracleを明確化した差分を記録する。対象は040のみで、他のOS Stage 3親は変更しない。

固定基点は `633bf12ea8f948db8ba3d6600179c4a9507377a7` の [L2要求](../../../helix-os/L2-requirements/governance-requirements.md) 1125–1134、および [L11受入](../../../helix-os/L11-acceptance/governance-acceptance.md) 732–743。固定L2全体SHA-256は `c530b01dbf396481f3ea0124f9a603d2a8ddfb813c9ab1e88db316262342949a`、040 spanは3403 bytes / `a5ba2bdca6bfc8adcf3216f523e882b53898d0a0424b886c1a5a6885542c3aee`。固定L11全体SHA-256は `40b2d902a2ed321c337d6982d3d61443e77e9d50d078bf698c3208038c9f6997`、040 spanは2296 bytes / `2fdcdc32156561d4b9f9931ee20194bf39b297ff96d477e58ff0d48c3abe232b`。

固定L11正常例の要求に合わせ、適用中既存policyが決める「初回attemptを数えるか」「対象failure class」「同一episodeの累積」を通常fixtureへ明示し、その意味の取り違えをそれぞれ独立negativeにした。policy入力の二つのcounter方式（初回を含む／含まない）は対照正常fixtureとして扱い、どちらかを優先・新設しない。適用中policyのfailure-class範囲も入力のまま適用する。新しいN値、schema、owner、approval、gate、performance閾値は追加していない。

## 旧sourceと差分理由

旧 `LEGACY-ASSET-3A15E5645D2D2A59DFF5` の `execution-ticket-requirements.md:240–242`（本文SHA `f0d0d33a1cced1ad7c1bab061f0a36bcdb5bad122dc58c7e8e43b47032f37d6b`、span 394 bytes / `e0eb944d58ec0a4cedd2515c537089b92a817c0f3903580728b8423968d2bfe1`）は、連続失敗・retry budgetをdurable eventと既存Recovery policyから導出し、session再開を初回扱いせず、実験retryを別budgetにする。旧 `LEGACY-ASSET-BE8B151A0094B754FF20` の `execution-ticket-acceptance.md:43`（本文SHA `fbfcdfa15fbcd207df3443f0268d37f98cbc050423d596d38e2ed68e6bf0302d`、span 83 bytes / `870ad165536e0233a5124db170f349386e7355fad08edca2b91795c28cd42b5e`）は上限超過をtyped Recovery/Backflowへ送る。

この意味を現行L2/L11がcounter semanticsと同一episodeへ再導出しているため、変更は新規要求の導入ではなく、既存親に対するAC/oracleの明確化である。旧ticket taxonomy・数値・実行方式は移植しない。

## 差分

- `FR-OS-L3-040` のAC-01で、既存policyの初回計上有無・failure classを保ち、同一episode eventを同じsemanticsで集計する条件を明記した。
- AC-02へ初回計上の反転とfailure classの除外/混入を独立変異として追加した。AC-04ではWorker/session resume後も同じepisode semanticsを保つことを明記した。ID、親、owner、scope、版は不変。
- `CASE-OS-L10-040-01` は初回を数えるpolicy/数えないpolicyをそれぞれ正常fixtureにし、入力policyごとのfailure classと累積回数から上限判定するoracleを記録した。CASE-040-04は同一episode semanticsを交代/resume後も保持する。
- `CASE-OS-L10-040-07g` は初回計上policyから初回だけを除く変異、`07h` は正しい同一episode集計が既存上限Nへ達する境界で対象内failure一件を除外する変異、`07i` は正しい集計がN-1となる境界で対象外failure一件を混入する変異を独立に扱う。前二つは余分なretryを拒否し、後者はpremature routeを拒否する。Nはfixtureに入力された既存policy値であり、新規値ではない。各caseは適用中policyの入力値を使い、新しい数値やfailure taxonomyを作らない。
- NFR-040 traceと対応するNFRV rowを同期し、counter semantics・failure class・episode累積の観測対象を明記した。NFR traceのAC-01..06範囲、NFR ID、比較閾値は増やしていない。

## 6本文のSHA-256

値は変更後working treeの実bytesから計算した。BR/BVは対象外として同一bytesである。

| 本文 | path | bytes | SHA-256 | 状態 |
|---|---|---:|---|---|
| BR | `docs/helix-os/L3-requirements/business-requirements.md` | 20354 | `cbe1866df47503b17e8a11b786dee8da58cd8a2a0a99778b64bd4a669b2fa702` | 不変 |
| FR | `docs/helix-os/L3-requirements/functional-requirements.md` | 201877 | `501f32401d57de5ae4e03ad05ed6e407eedaf0663d140b3baa21d4620ce4299f` | 040のみ変更 |
| NFR | `docs/helix-os/L3-requirements/nfr-grade.md` | 32949 | `27befa2872562b0e6dd48d98573fb73e49a3f431054a9b66c82d3182723eb8bb` | NFR-040 traceのみ変更 |
| BV | `docs/helix-os/L10-verification/business-verification.md` | 17702 | `5a75c21ce10b33fc8441adda71253870fd20a8687c18e7939cfe8b25f9d393c8` | 不変 |
| FV | `docs/helix-os/L10-verification/functional-verification.md` | 241485 | `784cc4e7970676638a5c4782f08a1bc31ad001274df8997ada121e7f2cf1ee38` | 040のみ変更 |
| NFRV | `docs/helix-os/L10-verification/nfr-verification.md` | 29578 | `6cbaa2dbaa43d3a74224457d2eb839b6290ce053b88d3d258b38c72b30a79826` | NFR-040 oracleのみ変更 |

## 検証と限界

文書をexact baseから読み、差分後のFR AC ↔ FV CASE ↔ NFR trace ↔ NFRV oracleのID参照を静的に確認した。重複ID、差分外本文、L2/L11/旧source bytesの変更がないことを確認し、`git diff --check`を実行した。旧test/runtime/CIおよび現行fixtureは実行していない。したがって、これは文書oracleの整合確認であり、実装や実行結果の合格を示さない。

## 2026-10-08 07h境界の表現訂正

後続の検収で、初回の07h入力「次のretryが入力済上限Nに達する」は、現在の正しい累積がN-1で次のretryによりNへ達する意味にも読め、期待oracleとの矛盾が生じると確認した。本文は「現在までのattempt eventの正しい累積が入力済上限Nである境界」と明示し、期待も「現在までの正しい累積が既に上限に達しているためretryを許さない」と限定した。policy、N、owner、対象failure classは変えていない。初回表のFV hashは当時の状態を示す歴史pinとして残す。今回の訂正後、FV `docs/helix-os/L10-verification/functional-verification.md` は241,465 bytes、SHA-256 `e0834b1e7dee0ee0175e28d73f155d07ff2fc856cf97bc0765d28166a123410e`。変更はCASE-040-07hの一行だけである。
