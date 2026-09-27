# HELIX-CONNECT 機構内要求監査

## 対象と結論

- 基準: `main`相当 `858026b250a15d4fec020b21b315c250decf960b`。現HEAD一致。対象はCONNECTのL1/L2/L11、G7接続棚卸し、PO source/decision、CONNECTの登録訂正履歴およびL1が指定する旧source。旧runtime/test/CIは実行していない。
- 候補本文はL1/L2/L11とも`draft_candidate`で、未採択・未実行。登録receiptの`authority_effect`も`none`。この監査は採択・実装許可を生成しない。
- 全IDを対応表で照合したところ、現在のL2とL11の種別・責務・oracleは一致する。具体的に修正済みの履歴差はL2-006の旧`composite`登録とL11-001の旧「重複端点」誤解で、現行本文・現行register訂正はそれぞれ解消している。未解消の機構内 blocker は確認できなかった。
- 3機構の構成はL11-007のfixture形状であり、最低製品数/機構数の要求とは読まない。L11-007は複数辺の構成体fixtureを使ってstale、部分成功、停止伝播等を確認する受入案。L1/L2はこの数を製品構成の下限にしていない。

## 正本・hash

| 資産 | 行 | SHA-256 / 内容 |
|---|---:|---|
| Concept `docs/concept/helix-concept.md` | 227 | CONNECTは内部・外部構造の接続、登録・契約版照合・通信・再送・追跡を持ち、業務判断・承認は持たない。WEB-CONNECTORと分離。|
| L1 `docs/helix-connect/L1-planning/connect-intent.md` | 19–53 | `9c212572afda81405c6d5ab70151f5b35356722204616e85e132162b45907c70` |
| L2 `docs/helix-connect/L2-requirements/connect-requirements.md` | 1–205 | `d4e550eefa2bdb0b9e5b6aa0644db7486cc27bce4662025f3f73b33a7d077ffa` |
| L11 `docs/helix-connect/L11-acceptance/connect-acceptance.md` | 1–80 | `b5dcfe5477b91a13e70e8e4e0bc3a020529d5c0c8272af7079befcbb6cceb624` |
| PO source `docs/helix-connect/sources/connect-l1-po-original-2026-09-27.md` | 1–7 | `a9737c48618f048103879ef1602b82b9800c8b25df884a5d04562a07fcffec1a` |
| PO decision `docs/governance/decisions/connect-l1-po-decisions-2026-09-27.md` | 14–29 | `fb54e7cc6d1c47381cc396820ab92c2d8806306f28055ac4144e1e02684fa930` |

PO原文は「接続部分を疎結合に保ち、各機構への変更耐性を強化」「段階リリースは機能として成立する部分を他要求から導出」。decisionは原文の範囲整理に留まり、L1対象revisionの承認を記録しない（source 5行、decision 16・20・24–29行）。L1はConceptの既存接続責務を土台に接続ごとの波及抑制・影響確認を具体化し、段階機能自体を追加していない（L1 19–39、45行）。

### 旧source照合（inventory-first）

| asset ID / source | 行・SHA | 旧の意味 → 現行で保持/変更 |
|---|---|---|
| `LEGACY-ASSET-C3DE79BA9451172F3E43` `archive/legacy-generation-2026-09-14/root/docs/design/helix/L5-detail/product-data-connector.md` | 33–57, 86–109。`2b42c26f7e4d387a6e2b178de05c2c27ac946646f266faee95aa08a65e803b04` | version付きproduct-data read connector、境界ごとのauthority、read-only、明示revision、idempotency、stale/unknownの扱いを保持。旧は特定のproduct data ingestionとNode/Python proposal/commit境界。現行CONNECT全般へその設計/実装、DBやcredential/ingest規則を移植せず、接続・版・再送・traceの考え方だけ再導出（L1 46行）。|
| `LEGACY-ASSET-DD66C1B6B7BE234B37E6` `archive/legacy-generation-2026-09-14/root/docs/design/helix/L6-function-design/product-data-connector.md` | 27–57。`48014b188ebe0c3ffe18b86fa472f048a88e248316bf2b3218aaa605a5e55f42` | pure function/adapterの外部境界、厳密な版契約、exact result/failure oracle、ingestion権限境界を確認。特定connector関数設計なので現行L2/L11へAPIやfailure tokenをコピーしていない。|
| `LEGACY-ASSET-BD13CC67526B48D461F9` `archive/legacy-generation-2026-09-14/root/docs/adr/ADR-003-runtime-adapter-boundary-subscription-cli.md` | 8–24, 26–45。`ffbe51c4a34cdaf4c072393a0864d916c7a4e1d6eaf4788bb0260e8280291f37` | Runtime adapterが外部固有性を隔離しcoreにprovider詳細/認証前提を漏らさない。A-71/API認証前提漏れのfailure historyを保持。現行はadapter/transportを接続側revisionとして区別するが、旧CLI/provider起動方法、API-key方針をCONNECT一般へ転用しない（L1 47–49行）。|

旧sourceは参照のみ。現行L1が意味の再導出と明記し、旧資産の完全一致再利用・旧runtime/test/CI実行はしていない。CONNECT coverage receiptsは`source_atom_count: 0`を明記しており、この空集合`no_loss`を旧意味の網羅と解釈しない（`helixconnect-derived-coverage-receipt-2026-09-27-r2.json` 4–28行）。

## ID別照合（現行）

L2一覧・種別・L1親はL2 31–39行。各節の入出力/成立依存/失敗時ownerは下記を参照。L11の各AC対応はL11 30–38行、具体fixtureは本文各節。

| Identity | L2 kind / 条件 | L11対応・受入の具体点 | 機構内監査 |
|---|---|---|---|
| `HELIXCONNECT-L1-001` | 単体・構成体の両方へ、接続先から疎結合、機構変更の波及を抑え接続単位に影響を確認（L1 33–39） | 下流ではL11-001〜007へ具体化。段階境界は成立するL2機能から導出するだけ（L11 74–80） | PO原文とConcept境界内。CONNECT目的の追加や独立段階機能はない。業務判断・承認は接続先owner（L1 25–29）。|
| `HELIXCONNECT-L2-001` / `L11-001` | unit。両端/方向/意味契約revision/CONNECT adapter revision/互換範囲を固有connection identityへ登録。同一端点を共有する別connectionは各ID・意味契約・scopeが識別できれば許容。同一IDの矛盾宣言/衝突は使えず、登録は許可・承認でない（L2 56–65）。| 欠落・unknown revision・同一ID二重宣言の拒否と、異なるIDによる端点共有の許容を両方試験。許可/業務承認が生成されないことも確認（L11 42–44）。| identity衝突とendpoint共有を区別済み。所有する業務意味/契約は各端点owner、接続identity/adapter・transportはCONNECT。端点共有そのものを誤り扱いしない。|
| `HELIXCONNECT-L2-002` / `L11-002` | unit。開始前とrevision/端点/adapter/compat変更後に現行両端版を比較。stale/unknown/mismatchなら通信停止、再検証結果が確認されたrevision組だけ再利用（L2 67–76）。| 範囲内・外、unknown、旧照合、片端/adapter revision変更後にstale化、再照合前停止、互換新revision証拠でのみstale解除（L11 46–48）。| staleの検出、fail-close、同じrevision組に束縛した再検証が明確。旧成功receiptの使い回しを防ぐ。適用許可のscope/expiryはSECURITYへ返す。|
| `HELIXCONNECT-L2-003` / `L11-003` | unit。通信をconnection/op/current contract revision/compat receiptへ束縛し、契約外/別revision/unknown opは拒否または隔離。CONNECTは業務意味を変更せず技術結果を返す（L2 78–87）。| 誤ったID/版、欠落descriptor、契約外field、unknown op、許可scope/expiry不明を注入。拒否理由と観測地点を証拠化し、CONNECTがSECURITY判定を代替しない（L11 50–52）。| 技術通信と業務結果を分離。permission/data-use ownerと業務result ownerへの戻し先が明示される。|
| `HELIXCONNECT-L2-004` / `L11-004` | unit。同一op・digestだけ契約上限内で再送、受信側重複効果なし。異digest同IDは衝突停止。業務結果の再送可否はowner由来（L2 89–98）。| 応答喪失後の合法な同一再送、上限超過、異digest、業務エラー/再送不可を分けて、効果一回と停止を確認（L11 54–56）。| 冪等性は技術効果に限定。業務エラーを自動再試行・CONNECTの業務判断へ昇格しない。|
| `HELIXCONNECT-L2-005` / `L11-005` | unit。登録・照合・送受信・再送・stale・拒否をID/版/順序で追跡。partial/unknownを区別し、payloadを通常traceに複製しない（L2 100–109）。| ACK欠落、再送中stale、expiry、取消、permit失効を生成し、attempt順・観測endpoint・停止理由・owner/recoveryを照合。unknownを完了にしない（L11 58–60）。| traceは観測した技術事実と業務ownerへのhandoffに留まり、業務判断の代筆を避ける。payload/secrets保護も確認対象。|
| `HELIXCONNECT-L2-006` / `L11-006` | connection。登録済み一辺の片側機構または当該adapter/transportを交換。固定側の機構・契約revisionを変えず、交換後revisionとそのconnectionの互換を再照合。互換時のみ同じ契約で通信、非互換/unknown/stale/意味契約変更では停止（L2 113–122）。| 送信側/受信側それぞれ機構本体・adapter/transportだけを交換する4 fixture。固定側維持、handoff中の未完義務/ACK/attempt保持、stale再照合、互換時通信、失敗系では0送信を確認（L11 64–66）。| connection kindと内容一致。connection単位なので他辺を依存させない（L2 121）。交換/復旧権限の扱いも既存共通HARNESS/SECURITY契約参照で閉じる。|
| `HELIXCONNECT-L2-007` / `L11-007` | composite。複数edgeの端点/契約版/順序/op mapping/retry境界/終端をtraceし、全必須辺を個別登録・互換・受渡確認した場合だけ技術完了。中間stale/部分/unknownは全体成功にしない。業務成立/承認は判定しない（L2 126–135）。| 3以上の機構 fixtureで辺の順序/lineage/terminal、stale/timeout/digest conflict/expiry/cancel/permit loss/partial-successの停止波及を確認。全edge技術完了でも業務成功/承認が出ない（L11 70–72）。| composite判定は技術traceの完了。3+は具体fixtureの大きさで、最低機構数・最低製品数・要求対象数を追加しない。失敗辺ownerおよび計画/業務判断ownerへ戻す。|

### 横断責務・接続集合

- 共通契約（L2 43–52、L11 22–26）はversion/scope/correlation/expiry/idempotency/result state、SECURITY permit/data-use参照、unknown/unfinished停止、部分成功、handoffとsecret/payload保護を一貫している。CONNECTは許可・業務完了を生成/拡張しない。
- 接続棚卸しcrosswalk（L2 137–205以降）は元機構のconnection条件をCONNECT候補へ結ぶ。L2 139行は実環境endpointの完全集合・採択ではないと明記し、L2 141行以降はsource identity別のcandidate対応。すべての対応機構/IDが現時点で実在する・接続済み・受入済みという主張ではない。
- staleと再検証はL2-002、交換をまたぐ未完義務は共通HARNESS-L2-010/011との接続で扱う。複数候補/fixtureは適用依存全体の常時必須化を意味しない。L2-001/002/003/004/005/006は成立依存を節ごとに限定し、L2-007だけが対象compositeを成す全edgeを要求する。

## register / corrected history

1. **L2-006種別**: 初回 register JSONL 335行 `MPR-RC-HELIXCONNECT-L2-006-001` は `requirement_kind=composite`, digest `sha256:c61a18cd...`。初回 coverage receipt `docs/governance/audits/requirement-registration/helixconnect-derived-coverage-receipt-2026-09-27.json` 99–115行にも同じ旧kind/旧digestが残る（当時の記録）。現行L2 38・113行はconnection。訂正後 register JSONL 337行 `MPR-RC-HELIXCONNECT-L2-006-002` は初回をsupersedeし`connection`, 現行節digest `sha256:876d54895668800e8a3f1866523fb65fb68bb7c13bad936396ecf43ecff30db7`。訂正receipt `helixconnect-derived-coverage-receipt-2026-09-27-r2.json` 9–28行もconnectionへ更新し、理由R2165-02を記録。過去行は削除/書換えではなく明示supersessionとして管理。現行不整合ではない。
2. **L2-001/L11-001 identityと端点**: 基準旧L11（commit `28b1cca62057bdb35e63d9d233f3c22eb659db5c`, file SHA `aab60fc369d3afdfb07d9455f0cb213e938861404f2b69c4afa2c7d42a125770`）の32行には「重複端点は使えない」とあり、同じ端点を使う別接続を過剰に拒否する読みだった。現行L2-001は当初からL2 58行で、異なるconnection identity/意味契約/scopeを区別するendpoint共有を許し、同一identityの矛盾宣言/衝突のみ拒否。訂正後L11 32・44行もその区別に一致する。
3. G20 correction receipt `helix-connect-identity-acceptance-correction-2026-09-27.json` 2–12, 14–40行は、L2候補意味不変・L11だけのtargeted acceptance correction、L2 semantic digest `sha256:895fae2d...`、L11現行SHA `b5dcfe...`、baseと旧L11 SHAを束縛。register JSONL 409行 `MPR-RC-HELIXCONNECT-L2-001-002` は初回登録をsupersede、L2-001のkind=`unit`とsemantic digestを維持し、correction reasonを記録。どちらのreceiptも`authority_effect:none`。現行L11、訂正履歴、registerの意味は相互に一致する。

## Finding summary

- 未解消の具体矛盾: なし。
- 修正済み履歴差としてレビュー記録に残す事項: L2-006初回種別の`composite`→`connection`訂正、およびL11-001の「重複端点」→「同一接続identity衝突」訂正。旧行を現行と誤認せず、current superseding registration/current bound L11 revisionを見る。
- 誤検出を避ける: 3機構fixtureはcomposite oracleの具体例で、最低製品数・要求対象数ではない。Endpoint共有は別ID/契約/scopeを識別できる限り有効。同一identityの矛盾だけが衝突。
- 残る上流状態: L1対象revisionのPO確認待ち、L2/L11は未採択候補、L11未実行。ここから採択・実装・運用の可否を推定しない。

## 親による検収と後続への引渡し

GPT6 Luna high Workerが調査し、Codex executionがL1/L2/L11全7対、旧connector境界とadapterの失敗史、現用register訂正を照合した。Claude review_mergeの独立reviewは別に行う。本監査は要求ステージ整理の機構内照合であり、要求本文や仮登録は変更しない。

現行の006種別と001端点共有の区別は修正済みであり、旧recordを再修正しない。機構内本文への新たな修正項目は本監査では確認しなかったため、修正を作るための要求追記は行わない。横断整理では、両端の業務意味・停止先・未完義務・版契約とCONNECTの共通条件が一致することを接続相手側まで照合する。SECURITYの他機構依存調査はSECURITY監査PR #2179でも扱い、同じ条件を別々の意味に変更しない。

これらの監査結果からL1対象revisionの採択、L2合意、実通信の成立や要求ステージ終了を生成しない。横断整理と総合検証の後に、POがL1/L2/L11を合わせて確認するPRを作る。
