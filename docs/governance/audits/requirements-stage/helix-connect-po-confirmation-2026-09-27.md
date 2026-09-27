# CONNECT PO確認packet（対象本文固定: f6dad2a）

**対象**: HELIX-CONNECT。このpacketはPO判断を記録する前の確認素材であり、採択・合意・承認を示さない。

## 先に確認できる要点

**この機構でできること（1.0候補）**

- 接続と両端契約を登録し、版の互換性・staleを確認する（L2-001/002）。
- 登録契約に沿った通信、重複を防ぐ再送、接続単位の追跡を扱う（L2-003〜005）。
- 片側更新後も互換を保つ接続（L2-006）と複数機構を結ぶ構成体（L2-007）を別々に受け入れる。単体接続が通っても構成体成立とはしない。

**今回追加された候補と監査で明確にした点**

- 機構内監査とconsumer点検を受けて実際に修正したのはL2/L11-002。互換性の参照照合は送信許可を前提とせず、読取りに適用される既存scope/accessは維持する。照合結果がcompatibleでも送信eligibilityは`not_evaluated`、送信attemptは0件。実送信のときだけ既存の操作許可と該当data-use/classificationを照合し、欠落・unknown・期限切れ・scope不一致・失効ならattempt前に保留する。新しい人間approvalやpermitは追加しない。
- そのほか、L2-006の片側交換とL2-007の複数辺構成は接続identity・契約revision・scope・結果追跡を対応させ、単体成功から構成体成功を推定しない。PO原文の段階リリースは他要求から成立部分を導くものとし、CONNECT独自機能にはしない。旧connectorの版付き契約・stale・再送・追跡は意味として保持し、旧API/CLI実装や業務判断、採択済み接続集合は持ち込まない。

**今回決めること**

固定したL1 revisionの確認と7候補の処置。既決の目的「接続部分を疎結合にし、各機構への変更耐性を高める」は再質問せず、製品属性やHELIX-WEB-CONNECTORも追加しない。

## 固定対象とsource証拠

全リンクはcommit `f6dad2a33e24f000b87d7f09b8d40288257e74cc` に固定。SHA-256はファイルbytes、Git blobは同じ固定revisionのblob objectを示す。判断前に本文が変わった場合は、最新版へ固定し直す。

| 固定source | SHA-256 | Git blob |
|---|---|---|
| [docs/concept/helix-concept.md](https://github.com/RetryYN/HELIX-HARNESS/blob/f6dad2a33e24f000b87d7f09b8d40288257e74cc/docs/concept/helix-concept.md) | `06e210c312fc6a5f18c1fc29248e55ebe9c2eee0c177006e32d7b421af8baa78` | `e57b94e76049037172b7a6ce3e6376f47591ca17` |
| [docs/helix-connect/L1-planning/connect-intent.md](https://github.com/RetryYN/HELIX-HARNESS/blob/f6dad2a33e24f000b87d7f09b8d40288257e74cc/docs/helix-connect/L1-planning/connect-intent.md) | `9c212572afda81405c6d5ab70151f5b35356722204616e85e132162b45907c70` | `017c63a2dca9ab1c0e2b4914c8c6675f02dd826b` |
| [docs/helix-connect/L2-requirements/connect-requirements.md](https://github.com/RetryYN/HELIX-HARNESS/blob/f6dad2a33e24f000b87d7f09b8d40288257e74cc/docs/helix-connect/L2-requirements/connect-requirements.md) | `31e3f234172bb5a92b26d41db2de21534cd4301274fc7e2800b4f8a935ce598b` | `1a7470f8a4af36d8470e85bcb4f5fff57b68a236` |
| [docs/helix-connect/L11-acceptance/connect-acceptance.md](https://github.com/RetryYN/HELIX-HARNESS/blob/f6dad2a33e24f000b87d7f09b8d40288257e74cc/docs/helix-connect/L11-acceptance/connect-acceptance.md) | `bc0cf2f39f9c368074c546b39f53a6bd350998bb0bbdb056285b305f22cc9dad` | `afe3d8f3c20f4fa8161cda6d0451075948a340bb` |
| [docs/helix-connect/sources/connect-l1-po-original-2026-09-27.md](https://github.com/RetryYN/HELIX-HARNESS/blob/f6dad2a33e24f000b87d7f09b8d40288257e74cc/docs/helix-connect/sources/connect-l1-po-original-2026-09-27.md) | `a9737c48618f048103879ef1602b82b9800c8b25df884a5d04562a07fcffec1a` | `964e59dda1b19cd4169a236d2ad5cf8270680521` |
| [docs/governance/decisions/connect-l1-po-decisions-2026-09-27.md](https://github.com/RetryYN/HELIX-HARNESS/blob/f6dad2a33e24f000b87d7f09b8d40288257e74cc/docs/governance/decisions/connect-l1-po-decisions-2026-09-27.md) | `fb54e7cc6d1c47381cc396820ab92c2d8806306f28055ac4144e1e02684fa930` | `253f9b9db04a145927bdd2b86ef38ad800144427` |
| [docs/governance/audits/requirements-stage/helix-connect-internal-audit-2026-09-27.md](https://github.com/RetryYN/HELIX-HARNESS/blob/f6dad2a33e24f000b87d7f09b8d40288257e74cc/docs/governance/audits/requirements-stage/helix-connect-internal-audit-2026-09-27.md) | `b7bf043b296c8244c03109decac468fe1c38a2405f31209ce197906c630b997e` | `299b1bb2fcd5991e54a2a0db3fa0439b4f23c2c1` |

## 既決PO履歴と今回確認すること

既決履歴: 既決事項：CONNECTは疎結合な接続部分の変更耐性を高める共通部品候補である。これは機構L1候補の採択・製品属性・個別L2候補の合意を意味しない。既決の目的を再質問せず、今回の対象L1 revisionとL2候補の個別処置を確認する。 根拠: [docs/governance/decisions/connect-l1-po-decisions-2026-09-27.md:14-29](https://github.com/RetryYN/HELIX-HARNESS/blob/f6dad2a33e24f000b87d7f09b8d40288257e74cc/docs/governance/decisions/connect-l1-po-decisions-2026-09-27.md#L14).

旧sourceとの保持・変更理由: 旧資産保持・変更記録（監査記録）: `LEGACY-ASSET-C3DE79BA9451172F3E43` と `LEGACY-ASSET-DD66C1B6B7BE234B37E6` は旧 product-data-connector.md:33-57,86-109 および :27-57; `LEGACY-ASSET-BD13CC67526B48D461F9` ADR-003:8-24,26-45。既存connectorの接続契約と変更耐性を保持し、共通部品候補へ再配置した根拠は監査記録を参照。 SHA-256（列挙順）: `2b42c26f7e4d387a6e2b178de05c2c27ac946646f266faee95aa08a65e803b04` / `48014b188ebe0c3ffe18b86fa472f048a88e248316bf2b3218aaa605a5e55f42` / `ffbe51c4a34cdaf4c072393a0864d916c7a4e1d6eaf4788bb0260e8280291f37`。source別の完全な判断は上記固定監査記録に記録済み。

今回の意味差分: 現行L1/L2候補と既決記録の間に新たな目的差分は確認されていない。PO原文の「接続部分を疎結合に保ち、各機構への変更耐性を強化」を維持し、段階リリース独自機能・HELIX-WEB-CONNECTOR・他機構の業務判断を含めない。残っているのは現在L1 exact revisionの採否と、7候補の個別処置の受領であり、既決原文を再質問しない。候補の登録・棚卸し対応は対象接続の採択を証明しない。

## 全L2候補とregister/coverage状況

候補母集団はL2本文の一覧表/各identityとregisterの突合結果。candidate 7件を全件収載。各行のregister IDは旧revisionから最新revisionまでの履歴、最新行だけが現在候補record。receiptは候補source atomのcoverage証拠で、PO合意・L1承認・実装可否を意味しない。

| L2 identity | kind | version_target（L2本文） | register revision履歴 | 最新receipt | 最新管理状態 |
|---|---|---|---|---|---|
| `HELIXCONNECT-L2-001` | `unit` | 1.0 | `MPR-RC-HELIXCONNECT-L2-001-001 → MPR-RC-HELIXCONNECT-L2-001-002` | `CONNECT-identity-r2` | `registered_proposal` / authority_effect `none` / coverage `no_loss` |
| `HELIXCONNECT-L2-002` | `unit` | 1.0 | `MPR-RC-HELIXCONNECT-L2-002-001 → MPR-RC-HELIXCONNECT-L2-002-002` | `CONNECT-stage` | `registered_proposal` / authority_effect `none` / coverage `no_loss` |
| `HELIXCONNECT-L2-003` | `unit` | 1.0 | `MPR-RC-HELIXCONNECT-L2-003-001` | `CONNECT-derived` | `registered_proposal` / authority_effect `none` / coverage `no_loss` |
| `HELIXCONNECT-L2-004` | `unit` | 1.0 | `MPR-RC-HELIXCONNECT-L2-004-001` | `CONNECT-derived` | `registered_proposal` / authority_effect `none` / coverage `no_loss` |
| `HELIXCONNECT-L2-005` | `unit` | 1.0 | `MPR-RC-HELIXCONNECT-L2-005-001` | `CONNECT-derived` | `registered_proposal` / authority_effect `none` / coverage `no_loss` |
| `HELIXCONNECT-L2-006` | `connection` | 1.0 | `MPR-RC-HELIXCONNECT-L2-006-001 → MPR-RC-HELIXCONNECT-L2-006-002` | `CONNECT-derived-r2` | `registered_proposal` / authority_effect `none` / coverage `no_loss` |
| `HELIXCONNECT-L2-007` | `composite` | 1.0 | `MPR-RC-HELIXCONNECT-L2-007-001` | `CONNECT-derived` | `registered_proposal` / authority_effect `none` / coverage `no_loss` |

### Receiptファイル

- `CONNECT-identity-r2`: [docs/governance/audits/requirement-registration/helix-connect-identity-acceptance-correction-2026-09-27.json](https://github.com/RetryYN/HELIX-HARNESS/blob/f6dad2a33e24f000b87d7f09b8d40288257e74cc/docs/governance/audits/requirement-registration/helix-connect-identity-acceptance-correction-2026-09-27.json)、SHA-256 `16d512897eba4f6408d631af5982fc54d30804f6ed4cd359346d11309a35cb60`。
- `CONNECT-stage`: [docs/governance/audits/requirement-registration/helix-connect-stage-review-coverage-receipt-2026-09-27.json](https://github.com/RetryYN/HELIX-HARNESS/blob/f6dad2a33e24f000b87d7f09b8d40288257e74cc/docs/governance/audits/requirement-registration/helix-connect-stage-review-coverage-receipt-2026-09-27.json)、SHA-256 `e0a659d5361a98757bf8b6f8ef1269d5bfcd50432343892fe93ab9579b322068`。
- `CONNECT-derived-r2`: [docs/governance/audits/requirement-registration/helixconnect-derived-coverage-receipt-2026-09-27-r2.json](https://github.com/RetryYN/HELIX-HARNESS/blob/f6dad2a33e24f000b87d7f09b8d40288257e74cc/docs/governance/audits/requirement-registration/helixconnect-derived-coverage-receipt-2026-09-27-r2.json)、SHA-256 `c74721757533726015b63d066fa20a153fecb01a68660cf4e11efd21394d6547`。
- `CONNECT-derived`: [docs/governance/audits/requirement-registration/helixconnect-derived-coverage-receipt-2026-09-27.json](https://github.com/RetryYN/HELIX-HARNESS/blob/f6dad2a33e24f000b87d7f09b8d40288257e74cc/docs/governance/audits/requirement-registration/helixconnect-derived-coverage-receipt-2026-09-27.json)、SHA-256 `8f9392be152b91427e1e96bbb0b20b5241662f3de4272a6d6dde37de0da1507f`。

## POに明示してほしい判断（未受領）

- **L1**: 固定したL1本文のexact revisionを確定するか、差戻すか。過去のPO企画判断から現在のL1 bytesの確定を推定しない。
- **L2/L11**: 上表の全候補について、明示された範囲で採用・保留・不採用、または差戻しを記録する。包括回答で個々のIDの処置が特定できない場合、その候補は未受領のままにする。
- **一括回答**: このpacketが明示するL1 exact revisionと候補表の全IDを対象に、POが「一式でよい」と明示した回答は、そのrevision確認および全候補への処置として受領できる。候補IDの再列挙は不要。部分的な回答、または対象revision/候補集合を特定できない回答では、未指定部分を未受領のまま残す。
- **残存差分**: 上記「今回の意味差分」に示した現行境界を確認し、候補を差戻す場合は理由を示す。既決PO事項は再質問せず、本文へ自動的に確定状態を付与しない。

## 状態の読み方

- 最新register行の `registered_proposal`、`authority_effect: none`、`coverage_result: no_loss` は、候補登録と旧source atom coverageを示す。PO採否、L1 authority、L2 agreementを示さない。過去revisionは履歴として保持する。
- PO判断を受けるまで、L1/L2/L11は候補状態。空欄・曖昧な返答からdispositionを埋めない。候補の不採用だけでは旧sourceの意味をretireしない。
- `version_target`は候補の対象版であり、実装済み版・release承認ではない。上表の後続版候補は残し、1.0の受入条件へ混ぜない。
- 同一PRのdecision recordにはdecider、日時、Concept/L1/L2/L11のexact revision、IDごとのPO処置・理由、旧source保持/変更、register/receipt参照を記録する。本文変更時は編集後SHAへ判断対象を束縛し直す。

## 確認PRの前提と受領後の扱い

機構内の監査・解消16 PR、横断監査 #2195 と解消 #2196、総合検証 #2197 はmerge/read-after済み。[総合検証](integrated-verification-2026-09-27.md)から根拠へ辿れる。本資料は要求本文の固定revisionへの読み口であり、本文やsource atomの被覆を置き換えない。

[PO指示の手順4](../../sources/requirements-stage-po-handoff-original-2026-09-27.md)に従い、POのL1対象revision確定・L2合意（または差戻し）を同じPRの判断記録へ入れるまでDraftを維持し、mergeしない。独立reviewは資料の正確さを照合するもので、PO判断を代行しない。提示したrevisionと集合に対する「一式でよい」という一括回答も、その範囲の判断として記録できる。IDの再列挙は求めない。部分回答・意味変更指示は対象だけを反映し、未判断部分を残す。

旧自律境界（LEGACY-ASSET-6EBDB617A8104A7756D0、`archive/legacy-generation-2026-09-14/root/CLAUDE.md:82-85`、SHA-256 `7bdfc0bc578359e42efae4242ee42b53abd6e2ec23874f1294d3ec0e278c8feb`）の、人が企画・要求の意味を持ちAIが要件以下を起草する分担を保持する。旧層番号・旧runtime・旧merge方式は移植しない。現行のL1/L2対象revision判断と、L3要件承認を分ける。

現在はPO判断未受領。受領後は実際の回答・対象revision・候補処置を記録し、本文変更があれば対のL11、register訂正revision、receipt、研究pinとbindingを追随させてexact HEADを再reviewする。候補の処置から旧sourceのretireや未完atomの被覆完了、L3承認、実装・release許可を生成しない。

8機構分の確認PRをすべて作成し、全件の独立review指摘0件まで作成側が進める。先行する確認PRのPO判断待ちを理由に、残る確認PRの作成・reviewを止めない。
