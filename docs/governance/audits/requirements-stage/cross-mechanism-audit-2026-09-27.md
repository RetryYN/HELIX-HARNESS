# 機構間意味関係監査（作成側監査材料）

**baseline main:** `d308f4080da298172001ef97e9c4b5f66d32ed7d`。8機構のL2/L11本文をこのcommitに固定して照合した。
この資料は、完全ID参照と略記展開を混同せず、本文の責務・入力・出力・戻し先を照合した作成側の横断材料である。候補や本文記載だけから採択・実装許可・完了を生成しない。

## スコープとrevision

| 参照元機構 | path | 現行main SHA-256 | L2 identity見出し数 |
|---|---|---|---:|
| HARNESS | `docs/helix-harness/L2-requirements/product-requirements.md` | `aed75cb4bdd644eedd9d3eb408cf522af2c4fbf4272db7b775edc62fc383100a` | 24 |
| OS | `docs/helix-os/L2-requirements/governance-requirements.md` | `c92d3c052884c05fbbba89fc86f6e6e0c576846e87073327fb0917e32a1747cf` | 16 |
| CONNECT | `docs/helix-connect/L2-requirements/connect-requirements.md` | `31e3f234172bb5a92b26d41db2de21534cd4301274fc7e2800b4f8a935ce598b` | 7 |
| SECURITY | `docs/helix-security/L2-requirements/security-requirements.md` | `027e6d25c8665e8aca006f23660c4ecfcc0ec0a92946be871e935ec5aa7a774c` | 28 |
| INFRASTRUCTURE | `docs/helix-infrastructure/L2-requirements/infrastructure-requirements.md` | `569cbf7767be79b07568663026a0ab05e9fe70ea29c3636401a5db1038b8183b` | 26 |
| BRAIN | `docs/helix-brain/L2-requirements/brain-requirements.md` | `01ff0931918dbf878698084e31ffaccb10e459fa1fca20992f22c4c4e2230e03` | 42 |
| LABO | `docs/helix-labo/L2-requirements/labo-requirements.md` | `f1c39e5e77d86e287f6f18378b315b67d31fd09862c9b3f626d0301843e537ed` | 53 |
| INTELLIGENCE | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md` | `40497f22a3ec2aff462b617764df7da6d09b427d95ed91d2ee737535c2e91260` | 54 |

照合baselineはmain `d308f4080da298172001ef97e9c4b5f66d32ed7d`。8機構すべてのL2/L11本文SHAを上表に固定した。

## 8機構L11 revision table

現行main `d308f4080da298172001ef97e9c4b5f66d32ed7d`で実体ファイルのSHA-256を算出した。

| 機構 | 現行main L11 path | SHA-256 |
|---|---|---|
| HARNESS | `docs/helix-harness/L11-acceptance/product-acceptance.md` | `09b2963187f9aaddbb1ad189d77e517e91914bd5ccdf2499dd9c11855139bcd4` |
| OS | `docs/helix-os/L11-acceptance/governance-acceptance.md` | `925e06cd08056d9569dd31703d7f76e5be59b34f85980646c733367af5edd680` |
| CONNECT | `docs/helix-connect/L11-acceptance/connect-acceptance.md` | `bc0cf2f39f9c368074c546b39f53a6bd350998bb0bbdb056285b305f22cc9dad` |
| SECURITY | `docs/helix-security/L11-acceptance/security-acceptance.md` | `25635649f87c0e805a5d1cf35b5c1201144c851533808770cd4f9ac6ba067c01` |
| INFRASTRUCTURE | `docs/helix-infrastructure/L11-acceptance/infrastructure-acceptance.md` | `7c3d22adef53a8b9c613408a8b8697b2aa40d1e5316776b5305f5a34eb22dada` |
| BRAIN | `docs/helix-brain/L11-acceptance/brain-acceptance.md` | `7aa66ee36a31974fcd33473c768ddcd771d1bd7e61f26201ff53a3e241b7977b` |
| LABO | `docs/helix-labo/L11-acceptance/labo-acceptance.md` | `bcd77438bf1afa4d33c31d35fa5138ea6f978f3d241d159bde35f0b0ccf83200` |
| INTELLIGENCE | `docs/helix-intelligence/L11-acceptance/intelligence-acceptance.md` | `4b96aa9565325a35d3ca10813453434df9ec15f21ea64f5db22740fdb3218e3a` |

## 件数と判定の粒度

完全ID表記は126 参照組（216 mention）、略記/範囲の展開は97 参照組（130 mention: slash/range展開112、機構省略仮定15、数字のみ仮定2、略記range1）。両分類群合計223組のうち15組が重複し、unionは**208組**。名前だけの機構言及は**418 occurrence-level records**であり、L2接続edge数ではない。抽出は各L2文書の見出しをsource identityとする横断参照inventoryで、全identityのsemantic graphではない。
保存済み抽出証跡を基準本文と静的照合した結果、literal 216箇所のsource行全文は216/216一致し、略記/range 130箇所もpath・line・全文が一致した。source見出しline、target path/SHA/見出しまたは証拠行は126組すべて一致し、target identityは表形式を含む宣言272件内で確認できた。HARNESS-L2-009は見出しでなく表形式identityであり、evidence line扱いの制約を保持する。この一致はheading-bound inventoryの正確性を確認するもので、全272 identityのsource graph網羅を意味しない。
意味クラスは「実際に業務情報/証拠を渡す操作」「共通pack/verification/security契約の参照」「構成/責務主体/authority境界」「任意/除外/negative reference」「背景/例/機構名のみ」に分けた。IDの出現は依存証明ではない。`version_target`は目標版であり、実行時の版・採択状態・個々の依存closureではない。4依存区分の記載が同じ文で明示されない場合は不明を維持。不明/未記載だけで障害とは認定しない。


### 見出し以外の表形式identityと抽出範囲

8文書の見出しから検出したL2 source identityは計250件。文書中の宣言表にはさらに22件（HARNESS 001〜009の9件、OS 001〜013の13件）があるため、両者を合わせた宣言identity数は272件である。この22件は本文見出しに存在せず、下記は見出し起点の208組/418名前参照inventoryへ混ぜていない。

| 文書上の宣言identity | 現行本文で確認した責務 | 対応する受入記述 | 参照元 |
|---|---|---|---|
| HARNESS-L2-001〜009（9件） | 宣言表が親L1との候補対応を列挙する。要求本文の表行は工程構成、方式選択、開始/凍結/差戻し/再開、要求・設計・test trace、verification/oracle、提供、versioned design-template義務などを別々に定める。CORE/HARNESSは工程・要求・設計義務の意味を保持し、OSは工程実行を担う。 | `product-acceptance.md:21-29,33-50` に各L2の受入を対応させる。 | `product-requirements.md:38-60,66-75,100-124` |
| HELIXOS-L2-001〜013（13件） | 利用要求表がproject要求正本・decision/revision、変更影響、Worker assignment/execution/review、観測/Feedback、提供、証拠、隔離CI実行、継続、管理/推進/検収、ticket workflow、研究/横断diagnosticの責務を列挙する。特にOS-L2-004は割当/進行をOS、案をINTELLIGENCE、実行をWorker、実行制約と自己承認防止をSECURITYへ分ける。 | `governance-acceptance.md:21-33,40-55` は既存IDごとの受入条件を列挙し、OS-004の案/割当/実行/権限制約の分担を確認する。 | `governance-requirements.md:52-68,194-204,278-280`; `governance-acceptance.md:21-33,40-55` |

表形式identityをsourceとして持つ交差参照・機構名言及は、この抽出scriptの見出し区切り範囲の外である。HARNESS-001〜009とOS-001〜013の本文表および対応L11は読み、上記の責務境界を確認したが、ここから別identityへのedgeや依存区分を推測していない。現行OS本文の `HELIXOS-L2-001..009` のような範囲表記も、抽出器の区間記号対象外であり、同機構内記述として交差参照edge集計へ加えていない。よって208組を全identity graphの網羅と称さない。

## 17方向の関係群：機構の向きごとに整理

| 方向 | 固有参照組 | 全223件 | 関係群・意味の確認 | 状態/限界 |
|---|---:|---:|---|---|
| HARNESS → OS | 4 | 6 | 選択executor/OS運転とHARNESS契約の境界 | 参照組明細は次節。実際の受渡し、共通契約、明示的な非依存をidentity行で区別する。 |
| HARNESS → BRAIN | 2 | 2 | 設計知識の選択的入力/受領記録 | 参照組明細は次節。実際の受渡し、共通契約、明示的な非依存をidentity行で区別する。 |
| OS → HARNESS | 8 | 10 | 段階構成・運転・検証契約参照 | 参照組明細は次節。実際の受渡し、共通契約、明示的な非依存をidentity行で区別する。 |
| OS → SECURITY | 7 | 11 | 操作別authority/隔離/egress/security条件 | 参照組明細は次節。実際の受渡し、共通契約、明示的な非依存をidentity行で区別する。 |
| OS → LABO | 4 | 5 | assignment/resultからBench観測への受渡し（任意referenceを含む） | 参照組明細は次節。実際の受渡し、共通契約、明示的な非依存をidentity行で区別する。 |
| OS → INTELLIGENCE | 3 | 4 | proposal/context受領とOS assignmentの境界 | 参照組明細は次節。実際の受渡し、共通契約、明示的な非依存をidentity行で区別する。 |
| CONNECT → HARNESS | 14 | 14 | 共通pack呼出し契約（登録/互換/通信そのものではない） | 参照組明細は次節。実際の受渡し、共通契約、明示的な非依存をidentity行で区別する。 |
| SECURITY → HARNESS | 2 | 2 | 共通pack境界のauthority/data-use参照 | 参照組明細は次節。実際の受渡し、共通契約、明示的な非依存をidentity行で区別する。 |
| INFRASTRUCTURE → OS | 3 | 3 | OS運転が要求する実資源/環境stateへの接続 | 参照組明細は次節。実際の受渡し、共通契約、明示的な非依存をidentity行で区別する。 |
| BRAIN → HARNESS | 6 | 6 | 設計入力/knowledge 受領記録の受け手接続 | 参照組明細は次節。実際の受渡し、共通契約、明示的な非依存をidentity行で区別する。 |
| BRAIN → OS | 1 | 1 | OS工程/実行との説明的責務境界 | 参照組明細は次節。実際の受渡し、共通契約、明示的な非依存をidentity行で区別する。 |
| LABO → HARNESS | 27 | 28 | 共通pack/受入契約の参照（多くは各参照元の実行経路ではない） | 参照組明細は次節。実際の受渡し、共通契約、明示的な非依存をidentity行で区別する。 |
| LABO → OS | 9 | 9 | assignment/result/証拠受渡しまたはOS実行責務参照 | 参照組明細は次節。実際の受渡し、共通契約、明示的な非依存をidentity行で区別する。 |
| LABO → INTELLIGENCE | 4 | 5 | 評価材料/Bench水準の選択的proposal 受渡し | 参照組明細は次節。実際の受渡し、共通契約、明示的な非依存をidentity行で区別する。 |
| INTELLIGENCE → HARNESS | 96 | 97 | verification/meaning/backflow契約またはCORE入力；共通pack/呼出し契約（各INT要求の別実行依存とは限らない） | 参照組明細は次節。実際の受渡し、共通契約、明示的な非依存をidentity行で区別する。 |
| INTELLIGENCE → OS | 3 | 3 | proposal/support/assignment運転境界 | 参照組明細は次節。実際の受渡し、共通契約、明示的な非依存をidentity行で区別する。 |
| INTELLIGENCE → LABO | 15 | 17 | 歴史評価/Bench 証拠/独立評価への選択的経路 | 参照組明細は次節。実際の受渡し、共通契約、明示的な非依存をidentity行で区別する。 |

方向別合計unique 208組。全223件の記述のうち、15 組は完全表記と略記展開双方に現れた。参照元identity/参照先identity/path行は次表に全件展開する。

## 223記述に含まれる固有参照組明細

| 参照元 → 参照先 | 参照元文書:行 | 参照形式 | 関係群 | 依存区分の字面marker hint | `version_target`（参照元→参照先） |
|---|---|---|---|---|---|
| `HARNESS-L2-025` → `HELIXBRAIN-L2-030` | `docs/helix-harness/L2-requirements/product-requirements.md:546,549,551,552` | 完全ID | 設計知識の選択的入力/受領記録 | 不明（当該箇所に区分の明記なし）, 常時必須, 選択入力 | 1.0 → 1.0 |
| `HARNESS-L2-026` → `HELIXBRAIN-L2-030` | `docs/helix-harness/L2-requirements/product-requirements.md:542` | 完全ID | 設計知識の選択的入力/受領記録 | 常時必須 | 1.0 → 1.0 |
| `HARNESS-L2-030` → `HELIXOS-L2-020` | `docs/helix-harness/L2-requirements/product-requirements.md:609,613` | 完全ID＋略記 | 選択executor/OS運転とHARNESS契約の境界 | 不明（当該箇所に区分の明記なし） | 1.0 → 1.0 |
| `HARNESS-L2-031` → `HELIXOS-L2-020` | `docs/helix-harness/L2-requirements/product-requirements.md:633,641,642` | 略記・範囲展開 | 選択executor/OS運転とHARNESS契約の境界 | 不明（当該箇所に区分の明記なし）, 特定操作時のみ（字面）, 選択入力 | 1.0 → 1.0 |
| `HARNESS-L2-032` → `HELIXOS-L2-020` | `docs/helix-harness/L2-requirements/product-requirements.md:649,653,662` | 完全ID＋略記 | 選択executor/OS運転とHARNESS契約の境界 | 不明（当該箇所に区分の明記なし）, 選択入力 | 1.0 → 1.0 |
| `HARNESS-L2-033` → `HELIXOS-L2-020` | `docs/helix-harness/L2-requirements/product-requirements.md:681,689` | 略記・範囲展開 | 選択executor/OS運転とHARNESS契約の境界 | 特定操作時のみ（字面）, 不明（当該箇所に区分の明記なし） | 1.0 → 1.0 |
| `HELIXOS-L2-014` → `HARNESS-L2-010` | `docs/helix-os/L2-requirements/governance-requirements.md:624,629,631` | 完全ID | 段階構成・運転・検証契約参照 | 不明（当該箇所に区分の明記なし） | 不明・未記載 → 不明・未記載 |
| `HELIXOS-L2-014` → `HARNESS-L2-011` | `docs/helix-os/L2-requirements/governance-requirements.md:631` | 略記・範囲展開 | 段階構成・運転・検証契約参照 | 不明（当該箇所に区分の明記なし） | 不明・未記載 → 不明・未記載 |
| `HELIXOS-L2-014` → `HARNESS-L2-022` | `docs/helix-os/L2-requirements/governance-requirements.md:631` | 略記・範囲展開 | 段階構成・運転・検証契約参照 | 不明（当該箇所に区分の明記なし） | 不明・未記載 → 不明・未記載 |
| `HELIXOS-L2-026` → `HARNESS-L2-010` | `docs/helix-os/L2-requirements/governance-requirements.md:813,820,821,822` | 完全ID | 段階構成・運転・検証契約参照 | 不明（当該箇所に区分の明記なし） | 1.0 → 不明・未記載 |
| `HELIXOS-L2-026` → `HARNESS-L2-011` | `docs/helix-os/L2-requirements/governance-requirements.md:813,820,821,822` | 完全ID＋略記 | 段階構成・運転・検証契約参照 | 不明（当該箇所に区分の明記なし） | 1.0 → 不明・未記載 |
| `HELIXOS-L2-026` → `HARNESS-L2-022` | `docs/helix-os/L2-requirements/governance-requirements.md:813,820,821,822` | 完全ID＋略記 | 段階構成・運転・検証契約参照 | 不明（当該箇所に区分の明記なし） | 1.0 → 不明・未記載 |
| `HELIXOS-L2-027` → `HARNESS-L2-022` | `docs/helix-os/L2-requirements/governance-requirements.md:833` | 完全ID | 段階構成・運転・検証契約参照 | 不明（当該箇所に区分の明記なし） | 不明・未記載 → 不明・未記載 |
| `HELIXOS-L2-027` → `HELIXINTELLIGENCE-L2-010` | `docs/helix-os/L2-requirements/governance-requirements.md:828,832,833,836` | 完全ID＋略記 | proposal/context受領とOS assignmentの境界 | 不明（当該箇所に区分の明記なし） | 不明・未記載 → 1.0 |
| `HELIXOS-L2-027` → `HELIXLABO-L2-054` | `docs/helix-os/L2-requirements/governance-requirements.md:828,833,836` | 略記・範囲展開 | assignment/resultからBench観測への受渡し（任意referenceを含む） | 不明（当該箇所に区分の明記なし） | 不明・未記載 → 1.0 |
| `HELIXOS-L2-027` → `HELIXLABO-L2-055` | `docs/helix-os/L2-requirements/governance-requirements.md:828,833,836` | 完全ID＋略記 | assignment/resultからBench観測への受渡し（任意referenceを含む） | 不明（当該箇所に区分の明記なし） | 不明・未記載 → 1.0 |
| `HELIXOS-L2-027` → `HELIXLABO-L2-057` | `docs/helix-os/L2-requirements/governance-requirements.md:837` | 完全ID | assignment/resultからBench観測への受渡し（任意referenceを含む） | 不明（当該箇所に区分の明記なし） | 不明・未記載 → 不明・未記載 |
| `HELIXOS-L2-027` → `HELIXSECURITY-L2-003` | `docs/helix-os/L2-requirements/governance-requirements.md:833,843` | 完全ID | 操作別authority/隔離/egress/security条件 | 不明（当該箇所に区分の明記なし） | 不明・未記載 → 不明・未記載 |
| `HELIXOS-L2-027` → `HELIXSECURITY-L2-005` | `docs/helix-os/L2-requirements/governance-requirements.md:833,841` | 完全ID＋略記 | 操作別authority/隔離/egress/security条件 | 不明（当該箇所に区分の明記なし） | 不明・未記載 → 不明・未記載 |
| `HELIXOS-L2-027` → `HELIXSECURITY-L2-006` | `docs/helix-os/L2-requirements/governance-requirements.md:833,842` | 完全ID＋略記 | 操作別authority/隔離/egress/security条件 | 不明（当該箇所に区分の明記なし） | 不明・未記載 → 不明・未記載 |
| `HELIXOS-L2-027` → `HELIXSECURITY-L2-007` | `docs/helix-os/L2-requirements/governance-requirements.md:833,841` | 略記・範囲展開 | 操作別authority/隔離/egress/security条件 | 不明（当該箇所に区分の明記なし） | 不明・未記載 → 不明・未記載 |
| `HELIXOS-L2-027` → `HELIXSECURITY-L2-008` | `docs/helix-os/L2-requirements/governance-requirements.md:833,844` | 完全ID＋略記 | 操作別authority/隔離/egress/security条件 | 不明（当該箇所に区分の明記なし） | 不明・未記載 → 不明・未記載 |
| `HELIXOS-L2-027` → `HELIXSECURITY-L2-015` | `docs/helix-os/L2-requirements/governance-requirements.md:840` | 完全ID | 操作別authority/隔離/egress/security条件 | 不明（当該箇所に区分の明記なし） | 不明・未記載 → 不明・未記載 |
| `HELIXOS-L2-027` → `HELIXSECURITY-L2-016` | `docs/helix-os/L2-requirements/governance-requirements.md:832,833,840` | 完全ID＋略記 | 操作別authority/隔離/egress/security条件 | 不明（当該箇所に区分の明記なし） | 不明・未記載 → 不明・未記載 |
| `HELIXOS-L2-028` → `HELIXINTELLIGENCE-L2-068` | `docs/helix-os/L2-requirements/governance-requirements.md:851,859` | 完全ID | proposal/context受領とOS assignmentの境界 | 不明（当該箇所に区分の明記なし） | 1.0 → 1.0 |
| `HELIXOS-L2-029` → `HARNESS-L2-022` | `docs/helix-os/L2-requirements/governance-requirements.md:868,870,871,872,875,877` | 完全ID | 段階構成・運転・検証契約参照 | 不明（当該箇所に区分の明記なし）, 常時必須 | 1.0 → 不明・未記載 |
| `HELIXOS-L2-029` → `HELIXINTELLIGENCE-L2-068` | `docs/helix-os/L2-requirements/governance-requirements.md:867,868,872,875,877` | 完全ID | proposal/context受領とOS assignmentの境界 | 不明（当該箇所に区分の明記なし） | 1.0 → 1.0 |
| `HELIXOS-L2-029` → `HELIXLABO-L2-060` | `docs/helix-os/L2-requirements/governance-requirements.md:874,875,877` | 完全ID | assignment/resultからBench観測への受渡し（任意referenceを含む） | 不明（当該箇所に区分の明記なし） | 1.0 → 1.0 |
| `HELIXCONNECT-L2-001` → `HARNESS-L2-010` | `docs/helix-connect/L2-requirements/connect-requirements.md:60` | 完全ID | 共通pack呼出し契約（登録/互換/通信そのものではない） | 不明（当該箇所に区分の明記なし） | 不明・未記載 → 不明・未記載 |
| `HELIXCONNECT-L2-001` → `HARNESS-L2-011` | `docs/helix-connect/L2-requirements/connect-requirements.md:60` | 略記・範囲展開 | 共通pack呼出し契約（登録/互換/通信そのものではない） | 不明（当該箇所に区分の明記なし） | 不明・未記載 → 不明・未記載 |
| `HELIXCONNECT-L2-002` → `HARNESS-L2-010` | `docs/helix-connect/L2-requirements/connect-requirements.md:73` | 完全ID | 共通pack呼出し契約（登録/互換/通信そのものではない） | 不明（当該箇所に区分の明記なし） | 不明・未記載 → 不明・未記載 |
| `HELIXCONNECT-L2-002` → `HARNESS-L2-011` | `docs/helix-connect/L2-requirements/connect-requirements.md:73` | 略記・範囲展開 | 共通pack呼出し契約（登録/互換/通信そのものではない） | 不明（当該箇所に区分の明記なし） | 不明・未記載 → 不明・未記載 |
| `HELIXCONNECT-L2-003` → `HARNESS-L2-010` | `docs/helix-connect/L2-requirements/connect-requirements.md:84` | 完全ID | 共通pack呼出し契約（登録/互換/通信そのものではない） | 不明（当該箇所に区分の明記なし） | 不明・未記載 → 不明・未記載 |
| `HELIXCONNECT-L2-003` → `HARNESS-L2-011` | `docs/helix-connect/L2-requirements/connect-requirements.md:84` | 略記・範囲展開 | 共通pack呼出し契約（登録/互換/通信そのものではない） | 不明（当該箇所に区分の明記なし） | 不明・未記載 → 不明・未記載 |
| `HELIXCONNECT-L2-004` → `HARNESS-L2-010` | `docs/helix-connect/L2-requirements/connect-requirements.md:95` | 完全ID | 共通pack呼出し契約（登録/互換/通信そのものではない） | 不明（当該箇所に区分の明記なし） | 不明・未記載 → 不明・未記載 |
| `HELIXCONNECT-L2-004` → `HARNESS-L2-011` | `docs/helix-connect/L2-requirements/connect-requirements.md:95` | 略記・範囲展開 | 共通pack呼出し契約（登録/互換/通信そのものではない） | 不明（当該箇所に区分の明記なし） | 不明・未記載 → 不明・未記載 |
| `HELIXCONNECT-L2-005` → `HARNESS-L2-010` | `docs/helix-connect/L2-requirements/connect-requirements.md:106` | 完全ID | 共通pack呼出し契約（登録/互換/通信そのものではない） | 不明（当該箇所に区分の明記なし） | 不明・未記載 → 不明・未記載 |
| `HELIXCONNECT-L2-005` → `HARNESS-L2-011` | `docs/helix-connect/L2-requirements/connect-requirements.md:106` | 略記・範囲展開 | 共通pack呼出し契約（登録/互換/通信そのものではない） | 不明（当該箇所に区分の明記なし） | 不明・未記載 → 不明・未記載 |
| `HELIXCONNECT-L2-006` → `HARNESS-L2-010` | `docs/helix-connect/L2-requirements/connect-requirements.md:119,123` | 完全ID | 共通pack呼出し契約（登録/互換/通信そのものではない） | 不明（当該箇所に区分の明記なし） | 不明・未記載 → 不明・未記載 |
| `HELIXCONNECT-L2-006` → `HARNESS-L2-011` | `docs/helix-connect/L2-requirements/connect-requirements.md:119,123` | 略記・範囲展開 | 共通pack呼出し契約（登録/互換/通信そのものではない） | 不明（当該箇所に区分の明記なし） | 不明・未記載 → 不明・未記載 |
| `HELIXCONNECT-L2-007` → `HARNESS-L2-010` | `docs/helix-connect/L2-requirements/connect-requirements.md:132,136` | 完全ID | 共通pack呼出し契約（登録/互換/通信そのものではない） | 不明（当該箇所に区分の明記なし） | 不明・未記載 → 不明・未記載 |
| `HELIXCONNECT-L2-007` → `HARNESS-L2-011` | `docs/helix-connect/L2-requirements/connect-requirements.md:132,136` | 略記・範囲展開 | 共通pack呼出し契約（登録/互換/通信そのものではない） | 不明（当該箇所に区分の明記なし） | 不明・未記載 → 不明・未記載 |
| `HELIXSECURITY-L2-028` → `HARNESS-L2-010` | `docs/helix-security/L2-requirements/security-requirements.md:345,348,350` | 完全ID | 共通pack境界のauthority/data-use参照 | 不明（当該箇所に区分の明記なし） | 不明・未記載 → 不明・未記載 |
| `HELIXSECURITY-L2-028` → `HARNESS-L2-011` | `docs/helix-security/L2-requirements/security-requirements.md:345,348,350` | 略記・範囲展開 | 共通pack境界のauthority/data-use参照 | 不明（当該箇所に区分の明記なし） | 不明・未記載 → 不明・未記載 |
| `HELIXINFRASTRUCTURE-L2-009` → `HELIXOS-L2-014` | `docs/helix-infrastructure/L2-requirements/infrastructure-requirements.md:119,120,122` | 完全ID | OS運転が要求する実資源/環境stateへの接続 | 不明（当該箇所に区分の明記なし） | 1.0 → 不明・未記載 |
| `HELIXINFRASTRUCTURE-L2-011` → `HELIXOS-L2-014` | `docs/helix-infrastructure/L2-requirements/infrastructure-requirements.md:146` | 完全ID | OS運転が要求する実資源/環境stateへの接続 | 不明（当該箇所に区分の明記なし） | 1.0 → 不明・未記載 |
| `HELIXINFRASTRUCTURE-L2-015` → `HELIXOS-L2-014` | `docs/helix-infrastructure/L2-requirements/infrastructure-requirements.md:187` | 完全ID | OS運転が要求する実資源/環境stateへの接続 | 不明（当該箇所に区分の明記なし） | 1.0より後・版未定 → 不明・未記載 |
| `HELIXBRAIN-L2-003` → `HARNESS-L2-002` | `docs/helix-brain/L2-requirements/brain-requirements.md:115` | 略記・範囲展開 | 設計入力/knowledge 受領記録の受け手接続 | 不明（当該箇所に区分の明記なし） | 不明・未記載 → 不明・未記載 |
| `HELIXBRAIN-L2-008` → `HELIXOS-L2-001` | `docs/helix-brain/L2-requirements/brain-requirements.md:170` | 略記・範囲展開 | OS工程/実行との説明的責務境界 | 不明（当該箇所に区分の明記なし） | 不明・未記載 → 不明・未記載 |
| `HELIXBRAIN-L2-010` → `HARNESS-L2-005` | `docs/helix-brain/L2-requirements/brain-requirements.md:192` | 略記・範囲展開 | 設計入力/knowledge 受領記録の受け手接続 | 不明（当該箇所に区分の明記なし） | 不明・未記載 → 不明・未記載 |
| `HELIXBRAIN-L2-022` → `HARNESS-L2-009` | `docs/helix-brain/L2-requirements/brain-requirements.md:438,440` | 完全ID | 設計入力/knowledge 受領記録の受け手接続 | 不明（当該箇所に区分の明記なし）, 四区分不明（依存記載あり・当該箇所で条件を特定できない） | 不明・未記載 → 不明・未記載 |
| `HELIXBRAIN-L2-028` → `HARNESS-L2-010` | `docs/helix-brain/L2-requirements/brain-requirements.md:497,499,500,502` | 完全ID | 設計入力/knowledge 受領記録の受け手接続 | 不明（当該箇所に区分の明記なし）, 四区分不明（依存記載あり・当該箇所で条件を特定できない） | 1.0 → 不明・未記載 |
| `HELIXBRAIN-L2-028` → `HARNESS-L2-011` | `docs/helix-brain/L2-requirements/brain-requirements.md:497,499,500,502` | 略記・範囲展開 | 設計入力/knowledge 受領記録の受け手接続 | 不明（当該箇所に区分の明記なし）, 四区分不明（依存記載あり・当該箇所で条件を特定できない） | 1.0 → 不明・未記載 |
| `HELIXBRAIN-L2-030` → `HARNESS-L2-009` | `docs/helix-brain/L2-requirements/brain-requirements.md:580,582` | 完全ID | 設計入力/knowledge 受領記録の受け手接続 | 不明（当該箇所に区分の明記なし）, 常時必須 | 1.0 → 不明・未記載 |
| `HELIXLABO-L2-001` → `HARNESS-L2-010` | `docs/helix-labo/L2-requirements/labo-requirements.md:75` | 完全ID | 共通pack/受入契約の参照（多くは各参照元の実行経路ではない） | 四区分不明（依存記載あり・当該箇所で条件を特定できない） | 不明・未記載 → 不明・未記載 |
| `HELIXLABO-L2-001` → `HARNESS-L2-011` | `docs/helix-labo/L2-requirements/labo-requirements.md:75` | 略記・範囲展開 | 共通pack/受入契約の参照（多くは各参照元の実行経路ではない） | 四区分不明（依存記載あり・当該箇所で条件を特定できない） | 不明・未記載 → 不明・未記載 |
| `HELIXLABO-L2-002` → `HARNESS-L2-010` | `docs/helix-labo/L2-requirements/labo-requirements.md:83` | 完全ID | 共通pack/受入契約の参照（多くは各参照元の実行経路ではない） | 四区分不明（依存記載あり・当該箇所で条件を特定できない） | 不明・未記載 → 不明・未記載 |
| `HELIXLABO-L2-002` → `HARNESS-L2-011` | `docs/helix-labo/L2-requirements/labo-requirements.md:83` | 略記・範囲展開 | 共通pack/受入契約の参照（多くは各参照元の実行経路ではない） | 四区分不明（依存記載あり・当該箇所で条件を特定できない） | 不明・未記載 → 不明・未記載 |
| `HELIXLABO-L2-003` → `HARNESS-L2-010` | `docs/helix-labo/L2-requirements/labo-requirements.md:91` | 完全ID | 共通pack/受入契約の参照（多くは各参照元の実行経路ではない） | 四区分不明（依存記載あり・当該箇所で条件を特定できない） | 不明・未記載 → 不明・未記載 |
| `HELIXLABO-L2-003` → `HARNESS-L2-011` | `docs/helix-labo/L2-requirements/labo-requirements.md:91` | 略記・範囲展開 | 共通pack/受入契約の参照（多くは各参照元の実行経路ではない） | 四区分不明（依存記載あり・当該箇所で条件を特定できない） | 不明・未記載 → 不明・未記載 |
| `HELIXLABO-L2-004` → `HARNESS-L2-010` | `docs/helix-labo/L2-requirements/labo-requirements.md:99` | 完全ID | 共通pack/受入契約の参照（多くは各参照元の実行経路ではない） | 四区分不明（依存記載あり・当該箇所で条件を特定できない） | 不明・未記載 → 不明・未記載 |
| `HELIXLABO-L2-004` → `HARNESS-L2-011` | `docs/helix-labo/L2-requirements/labo-requirements.md:99` | 略記・範囲展開 | 共通pack/受入契約の参照（多くは各参照元の実行経路ではない） | 四区分不明（依存記載あり・当該箇所で条件を特定できない） | 不明・未記載 → 不明・未記載 |
| `HELIXLABO-L2-005` → `HARNESS-L2-010` | `docs/helix-labo/L2-requirements/labo-requirements.md:107` | 完全ID | 共通pack/受入契約の参照（多くは各参照元の実行経路ではない） | 四区分不明（依存記載あり・当該箇所で条件を特定できない） | 不明・未記載 → 不明・未記載 |
| `HELIXLABO-L2-005` → `HARNESS-L2-011` | `docs/helix-labo/L2-requirements/labo-requirements.md:107` | 略記・範囲展開 | 共通pack/受入契約の参照（多くは各参照元の実行経路ではない） | 四区分不明（依存記載あり・当該箇所で条件を特定できない） | 不明・未記載 → 不明・未記載 |
| `HELIXLABO-L2-006` → `HARNESS-L2-010` | `docs/helix-labo/L2-requirements/labo-requirements.md:115` | 完全ID | 共通pack/受入契約の参照（多くは各参照元の実行経路ではない） | 四区分不明（依存記載あり・当該箇所で条件を特定できない） | 不明・未記載 → 不明・未記載 |
| `HELIXLABO-L2-006` → `HARNESS-L2-011` | `docs/helix-labo/L2-requirements/labo-requirements.md:115` | 略記・範囲展開 | 共通pack/受入契約の参照（多くは各参照元の実行経路ではない） | 四区分不明（依存記載あり・当該箇所で条件を特定できない） | 不明・未記載 → 不明・未記載 |
| `HELIXLABO-L2-007` → `HARNESS-L2-010` | `docs/helix-labo/L2-requirements/labo-requirements.md:123` | 完全ID | 共通pack/受入契約の参照（多くは各参照元の実行経路ではない） | 四区分不明（依存記載あり・当該箇所で条件を特定できない） | 不明・未記載 → 不明・未記載 |
| `HELIXLABO-L2-007` → `HARNESS-L2-011` | `docs/helix-labo/L2-requirements/labo-requirements.md:123` | 略記・範囲展開 | 共通pack/受入契約の参照（多くは各参照元の実行経路ではない） | 四区分不明（依存記載あり・当該箇所で条件を特定できない） | 不明・未記載 → 不明・未記載 |
| `HELIXLABO-L2-008` → `HARNESS-L2-010` | `docs/helix-labo/L2-requirements/labo-requirements.md:131` | 完全ID | 共通pack/受入契約の参照（多くは各参照元の実行経路ではない） | 四区分不明（依存記載あり・当該箇所で条件を特定できない） | 不明・未記載 → 不明・未記載 |
| `HELIXLABO-L2-008` → `HARNESS-L2-011` | `docs/helix-labo/L2-requirements/labo-requirements.md:131` | 略記・範囲展開 | 共通pack/受入契約の参照（多くは各参照元の実行経路ではない） | 四区分不明（依存記載あり・当該箇所で条件を特定できない） | 不明・未記載 → 不明・未記載 |
| `HELIXLABO-L2-009` → `HARNESS-L2-010` | `docs/helix-labo/L2-requirements/labo-requirements.md:139` | 完全ID | 共通pack/受入契約の参照（多くは各参照元の実行経路ではない） | 四区分不明（依存記載あり・当該箇所で条件を特定できない） | 不明・未記載 → 不明・未記載 |
| `HELIXLABO-L2-009` → `HARNESS-L2-011` | `docs/helix-labo/L2-requirements/labo-requirements.md:139` | 略記・範囲展開 | 共通pack/受入契約の参照（多くは各参照元の実行経路ではない） | 四区分不明（依存記載あり・当該箇所で条件を特定できない） | 不明・未記載 → 不明・未記載 |
| `HELIXLABO-L2-010` → `HARNESS-L2-010` | `docs/helix-labo/L2-requirements/labo-requirements.md:147` | 完全ID | 共通pack/受入契約の参照（多くは各参照元の実行経路ではない） | 四区分不明（依存記載あり・当該箇所で条件を特定できない） | 不明・未記載 → 不明・未記載 |
| `HELIXLABO-L2-010` → `HARNESS-L2-011` | `docs/helix-labo/L2-requirements/labo-requirements.md:147` | 略記・範囲展開 | 共通pack/受入契約の参照（多くは各参照元の実行経路ではない） | 四区分不明（依存記載あり・当該箇所で条件を特定できない） | 不明・未記載 → 不明・未記載 |
| `HELIXLABO-L2-057` → `HELIXOS-L2-018` | `docs/helix-labo/L2-requirements/labo-requirements.md:395,399` | 完全ID | assignment/result/証拠受渡しまたはOS実行責務参照 | 不明（当該箇所に区分の明記なし） | 不明・未記載 → 1.0 |
| `HELIXLABO-L2-057` → `HELIXOS-L2-019` | `docs/helix-labo/L2-requirements/labo-requirements.md:395,399` | 略記・範囲展開 | assignment/result/証拠受渡しまたはOS実行責務参照 | 不明（当該箇所に区分の明記なし） | 不明・未記載 → 1.0 |
| `HELIXLABO-L2-057` → `HELIXOS-L2-023` | `docs/helix-labo/L2-requirements/labo-requirements.md:395,399` | 略記・範囲展開 | assignment/result/証拠受渡しまたはOS実行責務参照 | 不明（当該箇所に区分の明記なし） | 不明・未記載 → 1.0 |
| `HELIXLABO-L2-057` → `HELIXOS-L2-027` | `docs/helix-labo/L2-requirements/labo-requirements.md:395,399` | 完全ID | assignment/result/証拠受渡しまたはOS実行責務参照 | 不明（当該箇所に区分の明記なし） | 不明・未記載 → 不明・未記載 |
| `HELIXLABO-L2-058` → `HARNESS-L2-010` | `docs/helix-labo/L2-requirements/labo-requirements.md:406,414` | 完全ID | 共通pack/受入契約の参照（多くは各参照元の実行経路ではない） | 四区分不明（依存記載あり・当該箇所で条件を特定できない） | 1.0 → 不明・未記載 |
| `HELIXLABO-L2-058` → `HARNESS-L2-011` | `docs/helix-labo/L2-requirements/labo-requirements.md:406,414` | 略記・範囲展開 | 共通pack/受入契約の参照（多くは各参照元の実行経路ではない） | 四区分不明（依存記載あり・当該箇所で条件を特定できない） | 1.0 → 不明・未記載 |
| `HELIXLABO-L2-058` → `HARNESS-L2-023` | `docs/helix-labo/L2-requirements/labo-requirements.md:406,414` | 完全ID＋略記 | 共通pack/受入契約の参照（多くは各参照元の実行経路ではない） | 四区分不明（依存記載あり・当該箇所で条件を特定できない） | 1.0 → 不明・未記載 |
| `HELIXLABO-L2-059` → `HARNESS-L2-010` | `docs/helix-labo/L2-requirements/labo-requirements.md:427` | 完全ID | 共通pack/受入契約の参照（多くは各参照元の実行経路ではない） | 不明（当該箇所に区分の明記なし） | 1.0 → 不明・未記載 |
| `HELIXLABO-L2-059` → `HARNESS-L2-011` | `docs/helix-labo/L2-requirements/labo-requirements.md:427` | 略記・範囲展開 | 共通pack/受入契約の参照（多くは各参照元の実行経路ではない） | 不明（当該箇所に区分の明記なし） | 1.0 → 不明・未記載 |
| `HELIXLABO-L2-059` → `HARNESS-L2-022` | `docs/helix-labo/L2-requirements/labo-requirements.md:427` | 完全ID | 共通pack/受入契約の参照（多くは各参照元の実行経路ではない） | 不明（当該箇所に区分の明記なし） | 1.0 → 不明・未記載 |
| `HELIXLABO-L2-059` → `HELIXINTELLIGENCE-L2-010` | `docs/helix-labo/L2-requirements/labo-requirements.md:425,427,429` | 完全ID＋略記 | 評価材料/Bench水準の選択的proposal 受渡し | 不明（当該箇所に区分の明記なし） | 1.0 → 1.0 |
| `HELIXLABO-L2-059` → `HELIXINTELLIGENCE-L2-011` | `docs/helix-labo/L2-requirements/labo-requirements.md:427,429` | 略記・範囲展開 | 評価材料/Bench水準の選択的proposal 受渡し | 不明（当該箇所に区分の明記なし） | 1.0 → 1.0 |
| `HELIXLABO-L2-059` → `HELIXINTELLIGENCE-L2-034` | `docs/helix-labo/L2-requirements/labo-requirements.md:427` | 完全ID | 評価材料/Bench水準の選択的proposal 受渡し | 不明（当該箇所に区分の明記なし） | 1.0 → 1.0 |
| `HELIXLABO-L2-060` → `HARNESS-L2-022` | `docs/helix-labo/L2-requirements/labo-requirements.md:449,453,455` | 完全ID | 共通pack/受入契約の参照（多くは各参照元の実行経路ではない） | 常時必須, 不明（当該箇所に区分の明記なし） | 1.0 → 不明・未記載 |
| `HELIXLABO-L2-060` → `HELIXINTELLIGENCE-L2-068` | `docs/helix-labo/L2-requirements/labo-requirements.md:453` | 完全ID | 評価材料/Bench水準の選択的proposal 受渡し | 不明（当該箇所に区分の明記なし） | 1.0 → 1.0 |
| `HELIXLABO-L2-060` → `HELIXOS-L2-018` | `docs/helix-labo/L2-requirements/labo-requirements.md:453,455` | 完全ID | assignment/result/証拠受渡しまたはOS実行責務参照 | 不明（当該箇所に区分の明記なし） | 1.0 → 1.0 |
| `HELIXLABO-L2-060` → `HELIXOS-L2-019` | `docs/helix-labo/L2-requirements/labo-requirements.md:453,455` | 完全ID | assignment/result/証拠受渡しまたはOS実行責務参照 | 不明（当該箇所に区分の明記なし） | 1.0 → 1.0 |
| `HELIXLABO-L2-060` → `HELIXOS-L2-023` | `docs/helix-labo/L2-requirements/labo-requirements.md:453,455` | 完全ID | assignment/result/証拠受渡しまたはOS実行責務参照 | 不明（当該箇所に区分の明記なし） | 1.0 → 1.0 |
| `HELIXLABO-L2-060` → `HELIXOS-L2-028` | `docs/helix-labo/L2-requirements/labo-requirements.md:453` | 完全ID | assignment/result/証拠受渡しまたはOS実行責務参照 | 不明（当該箇所に区分の明記なし） | 1.0 → 1.0 |
| `HELIXLABO-L2-060` → `HELIXOS-L2-029` | `docs/helix-labo/L2-requirements/labo-requirements.md:453` | 完全ID | assignment/result/証拠受渡しまたはOS実行責務参照 | 不明（当該箇所に区分の明記なし） | 1.0 → 1.0 |
| `HELIXINTELLIGENCE-L2-001` → `HARNESS-L2-010` | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:52` | 完全ID | 共通pack/呼出し契約（各INT要求の別実行依存とは限らない） | 四区分不明（依存記載あり・当該箇所で条件を特定できない） | 1.0 → 不明・未記載 |
| `HELIXINTELLIGENCE-L2-001` → `HARNESS-L2-011` | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:52` | 略記・範囲展開 | 共通pack/呼出し契約（各INT要求の別実行依存とは限らない） | 四区分不明（依存記載あり・当該箇所で条件を特定できない） | 1.0 → 不明・未記載 |
| `HELIXINTELLIGENCE-L2-002` → `HARNESS-L2-010` | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:58` | 完全ID | 共通pack/呼出し契約（各INT要求の別実行依存とは限らない） | 四区分不明（依存記載あり・当該箇所で条件を特定できない） | 1.0 → 不明・未記載 |
| `HELIXINTELLIGENCE-L2-002` → `HARNESS-L2-011` | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:58` | 略記・範囲展開 | 共通pack/呼出し契約（各INT要求の別実行依存とは限らない） | 四区分不明（依存記載あり・当該箇所で条件を特定できない） | 1.0 → 不明・未記載 |
| `HELIXINTELLIGENCE-L2-003` → `HARNESS-L2-010` | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:64` | 完全ID | 共通pack/呼出し契約（各INT要求の別実行依存とは限らない） | 四区分不明（依存記載あり・当該箇所で条件を特定できない） | 1.0 → 不明・未記載 |
| `HELIXINTELLIGENCE-L2-003` → `HARNESS-L2-011` | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:64` | 略記・範囲展開 | 共通pack/呼出し契約（各INT要求の別実行依存とは限らない） | 四区分不明（依存記載あり・当該箇所で条件を特定できない） | 1.0 → 不明・未記載 |
| `HELIXINTELLIGENCE-L2-004` → `HARNESS-L2-010` | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:70` | 完全ID | 共通pack/呼出し契約（各INT要求の別実行依存とは限らない） | 四区分不明（依存記載あり・当該箇所で条件を特定できない） | 1.0 → 不明・未記載 |
| `HELIXINTELLIGENCE-L2-004` → `HARNESS-L2-011` | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:70` | 略記・範囲展開 | 共通pack/呼出し契約（各INT要求の別実行依存とは限らない） | 四区分不明（依存記載あり・当該箇所で条件を特定できない） | 1.0 → 不明・未記載 |
| `HELIXINTELLIGENCE-L2-005` → `HARNESS-L2-010` | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:76` | 完全ID | 共通pack/呼出し契約（各INT要求の別実行依存とは限らない） | 四区分不明（依存記載あり・当該箇所で条件を特定できない） | 1.0 → 不明・未記載 |
| `HELIXINTELLIGENCE-L2-005` → `HARNESS-L2-011` | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:76` | 略記・範囲展開 | 共通pack/呼出し契約（各INT要求の別実行依存とは限らない） | 四区分不明（依存記載あり・当該箇所で条件を特定できない） | 1.0 → 不明・未記載 |
| `HELIXINTELLIGENCE-L2-006` → `HARNESS-L2-010` | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:82` | 完全ID | 共通pack/呼出し契約（各INT要求の別実行依存とは限らない） | 四区分不明（依存記載あり・当該箇所で条件を特定できない） | 1.0 → 不明・未記載 |
| `HELIXINTELLIGENCE-L2-006` → `HARNESS-L2-011` | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:82` | 略記・範囲展開 | 共通pack/呼出し契約（各INT要求の別実行依存とは限らない） | 四区分不明（依存記載あり・当該箇所で条件を特定できない） | 1.0 → 不明・未記載 |
| `HELIXINTELLIGENCE-L2-007` → `HARNESS-L2-010` | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:88` | 完全ID | 共通pack/呼出し契約（各INT要求の別実行依存とは限らない） | 四区分不明（依存記載あり・当該箇所で条件を特定できない） | 1.0 → 不明・未記載 |
| `HELIXINTELLIGENCE-L2-007` → `HARNESS-L2-011` | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:88` | 略記・範囲展開 | 共通pack/呼出し契約（各INT要求の別実行依存とは限らない） | 四区分不明（依存記載あり・当該箇所で条件を特定できない） | 1.0 → 不明・未記載 |
| `HELIXINTELLIGENCE-L2-008` → `HARNESS-L2-010` | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:94` | 完全ID | 共通pack/呼出し契約（各INT要求の別実行依存とは限らない） | 四区分不明（依存記載あり・当該箇所で条件を特定できない） | 1.0 → 不明・未記載 |
| `HELIXINTELLIGENCE-L2-008` → `HARNESS-L2-011` | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:94` | 略記・範囲展開 | 共通pack/呼出し契約（各INT要求の別実行依存とは限らない） | 四区分不明（依存記載あり・当該箇所で条件を特定できない） | 1.0 → 不明・未記載 |
| `HELIXINTELLIGENCE-L2-009` → `HARNESS-L2-010` | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:100` | 完全ID | 共通pack/呼出し契約（各INT要求の別実行依存とは限らない） | 四区分不明（依存記載あり・当該箇所で条件を特定できない） | 1.0 → 不明・未記載 |
| `HELIXINTELLIGENCE-L2-009` → `HARNESS-L2-011` | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:100` | 略記・範囲展開 | 共通pack/呼出し契約（各INT要求の別実行依存とは限らない） | 四区分不明（依存記載あり・当該箇所で条件を特定できない） | 1.0 → 不明・未記載 |
| `HELIXINTELLIGENCE-L2-010` → `HARNESS-L2-010` | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:106` | 完全ID | 共通pack/呼出し契約（各INT要求の別実行依存とは限らない） | 四区分不明（依存記載あり・当該箇所で条件を特定できない） | 1.0 → 不明・未記載 |
| `HELIXINTELLIGENCE-L2-010` → `HARNESS-L2-011` | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:106` | 略記・範囲展開 | 共通pack/呼出し契約（各INT要求の別実行依存とは限らない） | 四区分不明（依存記載あり・当該箇所で条件を特定できない） | 1.0 → 不明・未記載 |
| `HELIXINTELLIGENCE-L2-011` → `HARNESS-L2-010` | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:112` | 完全ID | 共通pack/呼出し契約（各INT要求の別実行依存とは限らない） | 四区分不明（依存記載あり・当該箇所で条件を特定できない） | 1.0 → 不明・未記載 |
| `HELIXINTELLIGENCE-L2-011` → `HARNESS-L2-011` | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:112` | 略記・範囲展開 | 共通pack/呼出し契約（各INT要求の別実行依存とは限らない） | 四区分不明（依存記載あり・当該箇所で条件を特定できない） | 1.0 → 不明・未記載 |
| `HELIXINTELLIGENCE-L2-012` → `HARNESS-L2-010` | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:118` | 完全ID | 共通pack/呼出し契約（各INT要求の別実行依存とは限らない） | 四区分不明（依存記載あり・当該箇所で条件を特定できない） | 1.0 → 不明・未記載 |
| `HELIXINTELLIGENCE-L2-012` → `HARNESS-L2-011` | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:118` | 略記・範囲展開 | 共通pack/呼出し契約（各INT要求の別実行依存とは限らない） | 四区分不明（依存記載あり・当該箇所で条件を特定できない） | 1.0 → 不明・未記載 |
| `HELIXINTELLIGENCE-L2-013` → `HARNESS-L2-010` | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:124` | 完全ID | 共通pack/呼出し契約（各INT要求の別実行依存とは限らない） | 四区分不明（依存記載あり・当該箇所で条件を特定できない） | 1.0 → 不明・未記載 |
| `HELIXINTELLIGENCE-L2-013` → `HARNESS-L2-011` | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:124` | 略記・範囲展開 | 共通pack/呼出し契約（各INT要求の別実行依存とは限らない） | 四区分不明（依存記載あり・当該箇所で条件を特定できない） | 1.0 → 不明・未記載 |
| `HELIXINTELLIGENCE-L2-014` → `HARNESS-L2-010` | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:130` | 完全ID | 共通pack/呼出し契約（各INT要求の別実行依存とは限らない） | 四区分不明（依存記載あり・当該箇所で条件を特定できない） | 1.0 → 不明・未記載 |
| `HELIXINTELLIGENCE-L2-014` → `HARNESS-L2-011` | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:130` | 略記・範囲展開 | 共通pack/呼出し契約（各INT要求の別実行依存とは限らない） | 四区分不明（依存記載あり・当該箇所で条件を特定できない） | 1.0 → 不明・未記載 |
| `HELIXINTELLIGENCE-L2-015` → `HARNESS-L2-010` | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:136` | 完全ID | 共通pack/呼出し契約（各INT要求の別実行依存とは限らない） | 四区分不明（依存記載あり・当該箇所で条件を特定できない） | 1.0 → 不明・未記載 |
| `HELIXINTELLIGENCE-L2-015` → `HARNESS-L2-011` | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:136` | 略記・範囲展開 | 共通pack/呼出し契約（各INT要求の別実行依存とは限らない） | 四区分不明（依存記載あり・当該箇所で条件を特定できない） | 1.0 → 不明・未記載 |
| `HELIXINTELLIGENCE-L2-016` → `HARNESS-L2-010` | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:142` | 完全ID | 共通pack/呼出し契約（各INT要求の別実行依存とは限らない） | 四区分不明（依存記載あり・当該箇所で条件を特定できない） | 1.0 → 不明・未記載 |
| `HELIXINTELLIGENCE-L2-016` → `HARNESS-L2-011` | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:142` | 略記・範囲展開 | 共通pack/呼出し契約（各INT要求の別実行依存とは限らない） | 四区分不明（依存記載あり・当該箇所で条件を特定できない） | 1.0 → 不明・未記載 |
| `HELIXINTELLIGENCE-L2-018` → `HARNESS-L2-010` | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:148` | 完全ID | 共通pack/呼出し契約（各INT要求の別実行依存とは限らない） | 四区分不明（依存記載あり・当該箇所で条件を特定できない） | 1.0 → 不明・未記載 |
| `HELIXINTELLIGENCE-L2-018` → `HARNESS-L2-011` | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:148` | 略記・範囲展開 | 共通pack/呼出し契約（各INT要求の別実行依存とは限らない） | 四区分不明（依存記載あり・当該箇所で条件を特定できない） | 1.0 → 不明・未記載 |
| `HELIXINTELLIGENCE-L2-019` → `HARNESS-L2-010` | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:154` | 完全ID | 共通pack/呼出し契約（各INT要求の別実行依存とは限らない） | 四区分不明（依存記載あり・当該箇所で条件を特定できない） | 1.0 → 不明・未記載 |
| `HELIXINTELLIGENCE-L2-019` → `HARNESS-L2-011` | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:154` | 略記・範囲展開 | 共通pack/呼出し契約（各INT要求の別実行依存とは限らない） | 四区分不明（依存記載あり・当該箇所で条件を特定できない） | 1.0 → 不明・未記載 |
| `HELIXINTELLIGENCE-L2-020` → `HARNESS-L2-010` | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:160` | 完全ID | 共通pack/呼出し契約（各INT要求の別実行依存とは限らない） | 四区分不明（依存記載あり・当該箇所で条件を特定できない） | 1.0 → 不明・未記載 |
| `HELIXINTELLIGENCE-L2-020` → `HARNESS-L2-011` | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:160` | 略記・範囲展開 | 共通pack/呼出し契約（各INT要求の別実行依存とは限らない） | 四区分不明（依存記載あり・当該箇所で条件を特定できない） | 1.0 → 不明・未記載 |
| `HELIXINTELLIGENCE-L2-021` → `HARNESS-L2-010` | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:166` | 完全ID | 共通pack/呼出し契約（各INT要求の別実行依存とは限らない） | 四区分不明（依存記載あり・当該箇所で条件を特定できない） | 3.0 → 不明・未記載 |
| `HELIXINTELLIGENCE-L2-021` → `HARNESS-L2-011` | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:166` | 略記・範囲展開 | 共通pack/呼出し契約（各INT要求の別実行依存とは限らない） | 四区分不明（依存記載あり・当該箇所で条件を特定できない） | 3.0 → 不明・未記載 |
| `HELIXINTELLIGENCE-L2-022` → `HARNESS-L2-010` | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:172` | 完全ID | 共通pack/呼出し契約（各INT要求の別実行依存とは限らない） | 四区分不明（依存記載あり・当該箇所で条件を特定できない） | 3.0 → 不明・未記載 |
| `HELIXINTELLIGENCE-L2-022` → `HARNESS-L2-011` | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:172` | 略記・範囲展開 | 共通pack/呼出し契約（各INT要求の別実行依存とは限らない） | 四区分不明（依存記載あり・当該箇所で条件を特定できない） | 3.0 → 不明・未記載 |
| `HELIXINTELLIGENCE-L2-023` → `HARNESS-L2-010` | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:178` | 完全ID | 共通pack/呼出し契約（各INT要求の別実行依存とは限らない） | 四区分不明（依存記載あり・当該箇所で条件を特定できない） | 3.0 → 不明・未記載 |
| `HELIXINTELLIGENCE-L2-023` → `HARNESS-L2-011` | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:178` | 略記・範囲展開 | 共通pack/呼出し契約（各INT要求の別実行依存とは限らない） | 四区分不明（依存記載あり・当該箇所で条件を特定できない） | 3.0 → 不明・未記載 |
| `HELIXINTELLIGENCE-L2-024` → `HARNESS-L2-010` | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:184` | 完全ID | 共通pack/呼出し契約（各INT要求の別実行依存とは限らない） | 四区分不明（依存記載あり・当該箇所で条件を特定できない） | 3.0 → 不明・未記載 |
| `HELIXINTELLIGENCE-L2-024` → `HARNESS-L2-011` | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:184` | 略記・範囲展開 | 共通pack/呼出し契約（各INT要求の別実行依存とは限らない） | 四区分不明（依存記載あり・当該箇所で条件を特定できない） | 3.0 → 不明・未記載 |
| `HELIXINTELLIGENCE-L2-025` → `HARNESS-L2-010` | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:190` | 完全ID | 共通pack/呼出し契約（各INT要求の別実行依存とは限らない） | 四区分不明（依存記載あり・当該箇所で条件を特定できない） | 3.0 → 不明・未記載 |
| `HELIXINTELLIGENCE-L2-025` → `HARNESS-L2-011` | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:190` | 略記・範囲展開 | 共通pack/呼出し契約（各INT要求の別実行依存とは限らない） | 四区分不明（依存記載あり・当該箇所で条件を特定できない） | 3.0 → 不明・未記載 |
| `HELIXINTELLIGENCE-L2-026` → `HARNESS-L2-010` | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:196` | 完全ID | 共通pack/呼出し契約（各INT要求の別実行依存とは限らない） | 四区分不明（依存記載あり・当該箇所で条件を特定できない） | 3.0 → 不明・未記載 |
| `HELIXINTELLIGENCE-L2-026` → `HARNESS-L2-011` | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:196` | 略記・範囲展開 | 共通pack/呼出し契約（各INT要求の別実行依存とは限らない） | 四区分不明（依存記載あり・当該箇所で条件を特定できない） | 3.0 → 不明・未記載 |
| `HELIXINTELLIGENCE-L2-030` → `HARNESS-L2-010` | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:215` | 完全ID | 共通pack/呼出し契約（各INT要求の別実行依存とは限らない） | 不明（当該箇所に区分の明記なし） | 1.0 → 不明・未記載 |
| `HELIXINTELLIGENCE-L2-030` → `HARNESS-L2-011` | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:215` | 略記・範囲展開 | 共通pack/呼出し契約（各INT要求の別実行依存とは限らない） | 不明（当該箇所に区分の明記なし） | 1.0 → 不明・未記載 |
| `HELIXINTELLIGENCE-L2-031` → `HARNESS-L2-010` | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:224` | 完全ID | 共通pack/呼出し契約（各INT要求の別実行依存とは限らない） | 不明（当該箇所に区分の明記なし） | 1.0 → 不明・未記載 |
| `HELIXINTELLIGENCE-L2-031` → `HARNESS-L2-011` | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:224` | 略記・範囲展開 | 共通pack/呼出し契約（各INT要求の別実行依存とは限らない） | 不明（当該箇所に区分の明記なし） | 1.0 → 不明・未記載 |
| `HELIXINTELLIGENCE-L2-032` → `HARNESS-L2-010` | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:233` | 完全ID | 共通pack/呼出し契約（各INT要求の別実行依存とは限らない） | 不明（当該箇所に区分の明記なし） | 1.0 → 不明・未記載 |
| `HELIXINTELLIGENCE-L2-032` → `HARNESS-L2-011` | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:233` | 略記・範囲展開 | 共通pack/呼出し契約（各INT要求の別実行依存とは限らない） | 不明（当該箇所に区分の明記なし） | 1.0 → 不明・未記載 |
| `HELIXINTELLIGENCE-L2-033` → `HARNESS-L2-010` | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:242` | 完全ID | 共通pack/呼出し契約（各INT要求の別実行依存とは限らない） | 不明（当該箇所に区分の明記なし） | 1.0 → 不明・未記載 |
| `HELIXINTELLIGENCE-L2-033` → `HARNESS-L2-011` | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:242` | 略記・範囲展開 | 共通pack/呼出し契約（各INT要求の別実行依存とは限らない） | 不明（当該箇所に区分の明記なし） | 1.0 → 不明・未記載 |
| `HELIXINTELLIGENCE-L2-034` → `HARNESS-L2-010` | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:251` | 完全ID | 共通pack/呼出し契約（各INT要求の別実行依存とは限らない） | 不明（当該箇所に区分の明記なし） | 1.0 → 不明・未記載 |
| `HELIXINTELLIGENCE-L2-034` → `HARNESS-L2-011` | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:251` | 略記・範囲展開 | 共通pack/呼出し契約（各INT要求の別実行依存とは限らない） | 不明（当該箇所に区分の明記なし） | 1.0 → 不明・未記載 |
| `HELIXINTELLIGENCE-L2-035` → `HARNESS-L2-010` | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:260` | 完全ID | 共通pack/呼出し契約（各INT要求の別実行依存とは限らない） | 不明（当該箇所に区分の明記なし） | 1.0 → 不明・未記載 |
| `HELIXINTELLIGENCE-L2-035` → `HARNESS-L2-011` | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:260` | 略記・範囲展開 | 共通pack/呼出し契約（各INT要求の別実行依存とは限らない） | 不明（当該箇所に区分の明記なし） | 1.0 → 不明・未記載 |
| `HELIXINTELLIGENCE-L2-036` → `HARNESS-L2-010` | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:269` | 完全ID | 共通pack/呼出し契約（各INT要求の別実行依存とは限らない） | 不明（当該箇所に区分の明記なし） | 1.0 → 不明・未記載 |
| `HELIXINTELLIGENCE-L2-036` → `HARNESS-L2-011` | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:269` | 略記・範囲展開 | 共通pack/呼出し契約（各INT要求の別実行依存とは限らない） | 不明（当該箇所に区分の明記なし） | 1.0 → 不明・未記載 |
| `HELIXINTELLIGENCE-L2-037` → `HARNESS-L2-010` | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:278` | 完全ID | 共通pack/呼出し契約（各INT要求の別実行依存とは限らない） | 不明（当該箇所に区分の明記なし） | 1.0 → 不明・未記載 |
| `HELIXINTELLIGENCE-L2-037` → `HARNESS-L2-011` | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:278` | 略記・範囲展開 | 共通pack/呼出し契約（各INT要求の別実行依存とは限らない） | 不明（当該箇所に区分の明記なし） | 1.0 → 不明・未記載 |
| `HELIXINTELLIGENCE-L2-038` → `HARNESS-L2-010` | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:287` | 完全ID | 共通pack/呼出し契約（各INT要求の別実行依存とは限らない） | 不明（当該箇所に区分の明記なし） | 1.0 → 不明・未記載 |
| `HELIXINTELLIGENCE-L2-038` → `HARNESS-L2-011` | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:287` | 略記・範囲展開 | 共通pack/呼出し契約（各INT要求の別実行依存とは限らない） | 不明（当該箇所に区分の明記なし） | 1.0 → 不明・未記載 |
| `HELIXINTELLIGENCE-L2-039` → `HARNESS-L2-010` | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:296` | 完全ID | 共通pack/呼出し契約（各INT要求の別実行依存とは限らない） | 不明（当該箇所に区分の明記なし） | 1.0 → 不明・未記載 |
| `HELIXINTELLIGENCE-L2-039` → `HARNESS-L2-011` | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:296` | 略記・範囲展開 | 共通pack/呼出し契約（各INT要求の別実行依存とは限らない） | 不明（当該箇所に区分の明記なし） | 1.0 → 不明・未記載 |
| `HELIXINTELLIGENCE-L2-040` → `HARNESS-L2-010` | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:305` | 完全ID | 共通pack/呼出し契約（各INT要求の別実行依存とは限らない） | 不明（当該箇所に区分の明記なし） | 1.0 → 不明・未記載 |
| `HELIXINTELLIGENCE-L2-040` → `HARNESS-L2-011` | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:305` | 略記・範囲展開 | 共通pack/呼出し契約（各INT要求の別実行依存とは限らない） | 不明（当該箇所に区分の明記なし） | 1.0 → 不明・未記載 |
| `HELIXINTELLIGENCE-L2-041` → `HARNESS-L2-010` | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:314` | 完全ID | 共通pack/呼出し契約（各INT要求の別実行依存とは限らない） | 不明（当該箇所に区分の明記なし） | 不明・未記載 → 不明・未記載 |
| `HELIXINTELLIGENCE-L2-041` → `HARNESS-L2-011` | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:314` | 略記・範囲展開 | 共通pack/呼出し契約（各INT要求の別実行依存とは限らない） | 不明（当該箇所に区分の明記なし） | 不明・未記載 → 不明・未記載 |
| `HELIXINTELLIGENCE-L2-042` → `HARNESS-L2-010` | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:323` | 完全ID | 共通pack/呼出し契約（各INT要求の別実行依存とは限らない） | 不明（当該箇所に区分の明記なし） | 3.0 → 不明・未記載 |
| `HELIXINTELLIGENCE-L2-042` → `HARNESS-L2-011` | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:323` | 略記・範囲展開 | 共通pack/呼出し契約（各INT要求の別実行依存とは限らない） | 不明（当該箇所に区分の明記なし） | 3.0 → 不明・未記載 |
| `HELIXINTELLIGENCE-L2-043` → `HARNESS-L2-010` | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:332` | 完全ID | 共通pack/呼出し契約（各INT要求の別実行依存とは限らない） | 不明（当該箇所に区分の明記なし） | 3.0 → 不明・未記載 |
| `HELIXINTELLIGENCE-L2-043` → `HARNESS-L2-011` | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:332` | 略記・範囲展開 | 共通pack/呼出し契約（各INT要求の別実行依存とは限らない） | 不明（当該箇所に区分の明記なし） | 3.0 → 不明・未記載 |
| `HELIXINTELLIGENCE-L2-044` → `HARNESS-L2-010` | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:341` | 完全ID | 共通pack/呼出し契約（各INT要求の別実行依存とは限らない） | 不明（当該箇所に区分の明記なし） | 1.0 → 不明・未記載 |
| `HELIXINTELLIGENCE-L2-044` → `HARNESS-L2-011` | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:341` | 略記・範囲展開 | 共通pack/呼出し契約（各INT要求の別実行依存とは限らない） | 不明（当該箇所に区分の明記なし） | 1.0 → 不明・未記載 |
| `HELIXINTELLIGENCE-L2-045` → `HARNESS-L2-010` | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:350` | 完全ID | 共通pack/呼出し契約（各INT要求の別実行依存とは限らない） | 不明（当該箇所に区分の明記なし） | 1.0 → 不明・未記載 |
| `HELIXINTELLIGENCE-L2-045` → `HARNESS-L2-011` | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:350` | 略記・範囲展開 | 共通pack/呼出し契約（各INT要求の別実行依存とは限らない） | 不明（当該箇所に区分の明記なし） | 1.0 → 不明・未記載 |
| `HELIXINTELLIGENCE-L2-066` → `HARNESS-L2-010` | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:462` | 完全ID | 共通pack/呼出し契約（各INT要求の別実行依存とは限らない） | 不明（当該箇所に区分の明記なし） | 不明・未記載 → 不明・未記載 |
| `HELIXINTELLIGENCE-L2-066` → `HARNESS-L2-011` | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:462` | 略記・範囲展開 | 共通pack/呼出し契約（各INT要求の別実行依存とは限らない） | 不明（当該箇所に区分の明記なし） | 不明・未記載 → 不明・未記載 |
| `HELIXINTELLIGENCE-L2-066` → `HELIXLABO-L2-054` | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:462` | 完全ID | 歴史評価/Bench 証拠/独立評価への選択的経路 | 不明（当該箇所に区分の明記なし） | 不明・未記載 → 1.0 |
| `HELIXINTELLIGENCE-L2-066` → `HELIXLABO-L2-055` | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:462` | 略記・範囲展開 | 歴史評価/Bench 証拠/独立評価への選択的経路 | 不明（当該箇所に区分の明記なし） | 不明・未記載 → 1.0 |
| `HELIXINTELLIGENCE-L2-067` → `HARNESS-L2-010` | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:479` | 完全ID | 共通pack/呼出し契約（各INT要求の別実行依存とは限らない） | 不明（当該箇所に区分の明記なし） | 1.0 → 不明・未記載 |
| `HELIXINTELLIGENCE-L2-067` → `HARNESS-L2-011` | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:479` | 略記・範囲展開 | 共通pack/呼出し契約（各INT要求の別実行依存とは限らない） | 不明（当該箇所に区分の明記なし） | 1.0 → 不明・未記載 |
| `HELIXINTELLIGENCE-L2-067` → `HELIXLABO-L2-006` | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:477` | 完全ID | 歴史評価/Bench 証拠/独立評価への選択的経路 | 不明（当該箇所に区分の明記なし） | 1.0 → 不明・未記載 |
| `HELIXINTELLIGENCE-L2-067` → `HELIXLABO-L2-035` | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:474,475,479` | 完全ID | 歴史評価/Bench 証拠/独立評価への選択的経路 | 不明（当該箇所に区分の明記なし） | 1.0 → 1.0 |
| `HELIXINTELLIGENCE-L2-067` → `HELIXLABO-L2-052` | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:475,479,487` | 完全ID＋略記 | 歴史評価/Bench 証拠/独立評価への選択的経路 | 不明（当該箇所に区分の明記なし） | 1.0 → 1.0 |
| `HELIXINTELLIGENCE-L2-067` → `HELIXLABO-L2-054` | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:475,479` | 完全ID | 歴史評価/Bench 証拠/独立評価への選択的経路 | 不明（当該箇所に区分の明記なし） | 1.0 → 1.0 |
| `HELIXINTELLIGENCE-L2-067` → `HELIXLABO-L2-055` | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:475` | 完全ID | 歴史評価/Bench 証拠/独立評価への選択的経路 | 不明（当該箇所に区分の明記なし） | 1.0 → 1.0 |
| `HELIXINTELLIGENCE-L2-067` → `HELIXLABO-L2-059` | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:474,475,485,487,489` | 完全ID＋略記 | 歴史評価/Bench 証拠/独立評価への選択的経路 | 不明（当該箇所に区分の明記なし） | 1.0 → 不明・未記載 |
| `HELIXINTELLIGENCE-L2-068` → `HARNESS-L2-022` | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:495,496,497,498,500,502,503,505` | 完全ID | verification/meaning/backflow契約またはCORE入力 | 不明（当該箇所に区分の明記なし） | 1.0 → 不明・未記載 |
| `HELIXINTELLIGENCE-L2-068` → `HELIXLABO-L2-055` | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:503` | 完全ID | 歴史評価/Bench 証拠/独立評価への選択的経路 | 不明（当該箇所に区分の明記なし） | 1.0 → 1.0 |
| `HELIXINTELLIGENCE-L2-068` → `HELIXOS-L2-020` | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:495,500,503,505` | 完全ID | proposal/support/assignment運転境界 | 不明（当該箇所に区分の明記なし） | 1.0 → 1.0 |
| `HELIXINTELLIGENCE-L2-068` → `HELIXOS-L2-028` | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:495,500,503,505` | 完全ID | proposal/support/assignment運転境界 | 不明（当該箇所に区分の明記なし） | 1.0 → 1.0 |
| `HELIXINTELLIGENCE-L2-068` → `HELIXOS-L2-029` | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:495,503,505` | 完全ID | proposal/support/assignment運転境界 | 不明（当該箇所に区分の明記なし） | 1.0 → 1.0 |
| `HELIXINTELLIGENCE-L2-069` → `HARNESS-L2-010` | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:521,525` | 完全ID | 共通pack/呼出し契約（各INT要求の別実行依存とは限らない） | 常時必須, 四区分不明（依存記載あり・当該箇所で条件を特定できない） | 1.0 → 不明・未記載 |
| `HELIXINTELLIGENCE-L2-069` → `HARNESS-L2-011` | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:521,525` | 略記・範囲展開 | 共通pack/呼出し契約（各INT要求の別実行依存とは限らない） | 常時必須, 四区分不明（依存記載あり・当該箇所で条件を特定できない） | 1.0 → 不明・未記載 |
| `HELIXINTELLIGENCE-L2-069` → `HARNESS-L2-023` | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:521,525` | 完全ID＋略記 | verification/meaning/backflow契約またはCORE入力 | 常時必須, 四区分不明（依存記載あり・当該箇所で条件を特定できない） | 1.0 → 不明・未記載 |
| `HELIXINTELLIGENCE-L2-069` → `HELIXLABO-L2-024` | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:525` | 完全ID | 歴史評価/Bench 証拠/独立評価への選択的経路 | 四区分不明（依存記載あり・当該箇所で条件を特定できない） | 1.0 → 1.0 |
| `HELIXINTELLIGENCE-L2-070` → `HARNESS-L2-010` | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:537,541` | 完全ID | 共通pack/呼出し契約（各INT要求の別実行依存とは限らない） | 常時必須, 四区分不明（依存記載あり・当該箇所で条件を特定できない） | 1.0 → 不明・未記載 |
| `HELIXINTELLIGENCE-L2-070` → `HARNESS-L2-011` | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:537,541` | 略記・範囲展開 | 共通pack/呼出し契約（各INT要求の別実行依存とは限らない） | 常時必須, 四区分不明（依存記載あり・当該箇所で条件を特定できない） | 1.0 → 不明・未記載 |
| `HELIXINTELLIGENCE-L2-070` → `HARNESS-L2-023` | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:541` | 略記・範囲展開 | verification/meaning/backflow契約またはCORE入力 | 四区分不明（依存記載あり・当該箇所で条件を特定できない） | 1.0 → 不明・未記載 |
| `HELIXINTELLIGENCE-L2-070` → `HELIXLABO-L2-006` | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:532,541,542` | 完全ID | 歴史評価/Bench 証拠/独立評価への選択的経路 | 不明（当該箇所に区分の明記なし）, 四区分不明（依存記載あり・当該箇所で条件を特定できない） | 1.0 → 不明・未記載 |
| `HELIXINTELLIGENCE-L2-070` → `HELIXLABO-L2-024` | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:531,532,534,537,541,542` | 完全ID | 歴史評価/Bench 証拠/独立評価への選択的経路 | 不明（当該箇所に区分の明記なし）, 常時必須, 四区分不明（依存記載あり・当該箇所で条件を特定できない） | 1.0 → 1.0 |
| `HELIXINTELLIGENCE-L2-070` → `HELIXLABO-L2-052` | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:541` | 完全ID | 歴史評価/Bench 証拠/独立評価への選択的経路 | 四区分不明（依存記載あり・当該箇所で条件を特定できない） | 1.0 → 1.0 |
| `HELIXINTELLIGENCE-L2-071` → `HARNESS-L2-010` | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:552` | 完全ID | 共通pack/呼出し契約（各INT要求の別実行依存とは限らない） | 常時必須 | 1.0 → 不明・未記載 |
| `HELIXINTELLIGENCE-L2-071` → `HARNESS-L2-011` | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:552` | 略記・範囲展開 | 共通pack/呼出し契約（各INT要求の別実行依存とは限らない） | 常時必須 | 1.0 → 不明・未記載 |
| `HELIXINTELLIGENCE-L2-071` → `HARNESS-L2-023` | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:552` | 略記・範囲展開 | verification/meaning/backflow契約またはCORE入力 | 常時必須 | 1.0 → 不明・未記載 |
| `HELIXINTELLIGENCE-L2-071` → `HELIXLABO-L2-006` | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:553` | 完全ID | 歴史評価/Bench 証拠/独立評価への選択的経路 | 特定操作時のみ（字面） | 1.0 → 不明・未記載 |
| `HELIXINTELLIGENCE-L2-071` → `HELIXLABO-L2-024` | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:547,549,552,553` | 完全ID | 歴史評価/Bench 証拠/独立評価への選択的経路 | 不明（当該箇所に区分の明記なし）, 常時必須, 特定操作時のみ（字面） | 1.0 → 1.0 |

## 418件の機構名だけの言及

この一覧は機構名だけが書かれ、要求IDを同じ行に特定できない記述である。IDや依存を推定せず、方向ごとに出現数・参照元ID・代表行を示す。418件すべての全文・文書・行番号は抽出JSONの`name_only_unidentified_targets`に保持した。

| 方向 | 記述数 | 参照元ID集合 | 代表例（文書:行） | 分類・限界 |
|---|---:|---|---|---|
| HARNESS → OS | 10 | `HARNESS-L2-015`, `HARNESS-L2-017`, `HARNESS-L2-018`, `HARNESS-L2-021`, `HARNESS-L2-022`, `HARNESS-L2-023`, `HARNESS-L2-024`, `HARNESS-L2-032`, `HARNESS-L2-033` | `docs/helix-harness/L2-requirements/product-requirements.md:392`（全文は抽出JSONの行記録を参照） | 選択executor/OS運転とHARNESS契約の境界。名前参照の全件一覧であり依存辺とは認定せず、参照先identityは不明のまま。 |
| HARNESS → CONNECT | 8 | `HARNESS-L2-025`, `HARNESS-L2-026` | `docs/helix-harness/L2-requirements/product-requirements.md:535`（全文は抽出JSONの行記録を参照） | 記述上の関係—個別操作の成立依存とは未断定。名前参照の全件一覧であり依存辺とは認定せず、参照先identityは不明のまま。 |
| HARNESS → SECURITY | 6 | `HARNESS-L2-011`, `HARNESS-L2-018`, `HARNESS-L2-026`, `HARNESS-L2-030`, `HARNESS-L2-031`, `HARNESS-L2-032` | `docs/helix-harness/L2-requirements/product-requirements.md:358`（全文は抽出JSONの行記録を参照） | 記述上の関係—個別操作の成立依存とは未断定。名前参照の全件一覧であり依存辺とは認定せず、参照先identityは不明のまま。 |
| HARNESS → INFRASTRUCTURE | 1 | `HARNESS-L2-017` | `docs/helix-harness/L2-requirements/product-requirements.md:406`（全文は抽出JSONの行記録を参照） | 記述上の関係—個別操作の成立依存とは未断定。名前参照の全件一覧であり依存辺とは認定せず、参照先identityは不明のまま。 |
| HARNESS → BRAIN | 2 | `HARNESS-L2-026` | `docs/helix-harness/L2-requirements/product-requirements.md:537`（全文は抽出JSONの行記録を参照） | 設計知識の選択的入力/受領記録。名前参照の全件一覧であり依存辺とは認定せず、参照先identityは不明のまま。 |
| HARNESS → LABO | 2 | `HARNESS-L2-018`, `HARNESS-L2-021` | `docs/helix-harness/L2-requirements/product-requirements.md:416`（全文は抽出JSONの行記録を参照） | 記述上の関係—個別操作の成立依存とは未断定。名前参照の全件一覧であり依存辺とは認定せず、参照先identityは不明のまま。 |
| OS → HARNESS | 5 | `HELIXOS-L2-025`, `HELIXOS-L2-028`, `HELIXOS-L2-029` | `docs/helix-os/L2-requirements/governance-requirements.md:748`（全文は抽出JSONの行記録を参照） | 成果物/証拠/操作の選択的受渡し。名前参照の全件一覧であり依存辺とは認定せず、参照先identityは不明のまま。 |
| OS → CONNECT | 2 | `HELIXOS-L2-026` | `docs/helix-os/L2-requirements/governance-requirements.md:809`（全文は抽出JSONの行記録を参照） | CONNECT実行を含む場合のtransport/契約境界参照。名前参照の全件一覧であり依存辺とは認定せず、参照先identityは不明のまま。 |
| OS → SECURITY | 8 | `HELIXOS-L2-014`, `HELIXOS-L2-023`, `HELIXOS-L2-025`, `HELIXOS-L2-028`, `HELIXOS-L2-029` | `docs/helix-os/L2-requirements/governance-requirements.md:627`（全文は抽出JSONの行記録を参照） | 操作別authority/隔離/egress/security条件。名前参照の全件一覧であり依存辺とは認定せず、参照先identityは不明のまま。 |
| OS → INFRASTRUCTURE | 6 | `HELIXOS-L2-014`, `HELIXOS-L2-025` | `docs/helix-os/L2-requirements/governance-requirements.md:627`（全文は抽出JSONの行記録を参照） | 実行環境・資源・復旧の操作境界。名前参照の全件一覧であり依存辺とは認定せず、参照先identityは不明のまま。 |
| OS → BRAIN | 1 | `HELIXOS-L2-029` | `docs/helix-os/L2-requirements/governance-requirements.md:873`（全文は抽出JSONの行記録を参照） | 記述上の関係—個別操作の成立依存とは未断定。名前参照の全件一覧であり依存辺とは認定せず、参照先identityは不明のまま。 |
| OS → LABO | 4 | `HELIXOS-L2-018`, `HELIXOS-L2-022`, `HELIXOS-L2-025`, `HELIXOS-L2-027` | `docs/helix-os/L2-requirements/governance-requirements.md:675`（全文は抽出JSONの行記録を参照） | assignment/resultからBench観測への受渡し（任意referenceを含む）。名前参照の全件一覧であり依存辺とは認定せず、参照先identityは不明のまま。 |
| OS → INTELLIGENCE | 1 | `HELIXOS-L2-027` | `docs/helix-os/L2-requirements/governance-requirements.md:827`（全文は抽出JSONの行記録を参照） | proposal/context受領とOS assignmentの境界。名前参照の全件一覧であり依存辺とは認定せず、参照先identityは不明のまま。 |
| CONNECT → SECURITY | 1 | `HELIXCONNECT-L2-002` | `docs/helix-connect/L2-requirements/connect-requirements.md:78`（全文は抽出JSONの行記録を参照） | 記述上の関係—個別操作の成立依存とは未断定。名前参照の全件一覧であり依存辺とは認定せず、参照先identityは不明のまま。 |
| SECURITY → HARNESS | 5 | `HELIXSECURITY-L2-013`, `HELIXSECURITY-L2-015`, `HELIXSECURITY-L2-023` | `docs/helix-security/L2-requirements/security-requirements.md:195`（全文は抽出JSONの行記録を参照） | 共通pack境界のauthority/data-use参照。名前参照の全件一覧であり依存辺とは認定せず、参照先identityは不明のまま。 |
| SECURITY → OS | 13 | `HELIXSECURITY-L2-007`, `HELIXSECURITY-L2-009`, `HELIXSECURITY-L2-013`, `HELIXSECURITY-L2-015`, `HELIXSECURITY-L2-022`, `HELIXSECURITY-L2-023`, `HELIXSECURITY-L2-025` | `docs/helix-security/L2-requirements/security-requirements.md:135`（全文は抽出JSONの行記録を参照） | 記述上の関係—個別操作の成立依存とは未断定。名前参照の全件一覧であり依存辺とは認定せず、参照先identityは不明のまま。 |
| SECURITY → CONNECT | 5 | `HELIXSECURITY-L2-009`, `HELIXSECURITY-L2-010`, `HELIXSECURITY-L2-021` | `docs/helix-security/L2-requirements/security-requirements.md:155`（全文は抽出JSONの行記録を参照） | 記述上の関係—個別操作の成立依存とは未断定。名前参照の全件一覧であり依存辺とは認定せず、参照先identityは不明のまま。 |
| SECURITY → INFRASTRUCTURE | 5 | `HELIXSECURITY-L2-010`, `HELIXSECURITY-L2-024` | `docs/helix-security/L2-requirements/security-requirements.md:162`（全文は抽出JSONの行記録を参照） | 記述上の関係—個別操作の成立依存とは未断定。名前参照の全件一覧であり依存辺とは認定せず、参照先identityは不明のまま。 |
| SECURITY → BRAIN | 6 | `HELIXSECURITY-L2-001`, `HELIXSECURITY-L2-014`, `HELIXSECURITY-L2-015`, `HELIXSECURITY-L2-017`, `HELIXSECURITY-L2-019` | `docs/helix-security/L2-requirements/security-requirements.md:74`（全文は抽出JSONの行記録を参照） | 記述上の関係—個別操作の成立依存とは未断定。名前参照の全件一覧であり依存辺とは認定せず、参照先identityは不明のまま。 |
| SECURITY → LABO | 4 | `HELIXSECURITY-L2-015`, `HELIXSECURITY-L2-021` | `docs/helix-security/L2-requirements/security-requirements.md:212`（全文は抽出JSONの行記録を参照） | 記述上の関係—個別操作の成立依存とは未断定。名前参照の全件一覧であり依存辺とは認定せず、参照先identityは不明のまま。 |
| SECURITY → INTELLIGENCE | 3 | `HELIXSECURITY-L2-015`, `HELIXSECURITY-L2-022`, `HELIXSECURITY-L2-026` | `docs/helix-security/L2-requirements/security-requirements.md:212`（全文は抽出JSONの行記録を参照） | 記述上の関係—個別操作の成立依存とは未断定。名前参照の全件一覧であり依存辺とは認定せず、参照先identityは不明のまま。 |
| INFRASTRUCTURE → HARNESS | 4 | `HELIXINFRASTRUCTURE-L2-001`, `HELIXINFRASTRUCTURE-L2-002`, `HELIXINFRASTRUCTURE-L2-008`, `HELIXINFRASTRUCTURE-L2-011` | `docs/helix-infrastructure/L2-requirements/infrastructure-requirements.md:38`（全文は抽出JSONの行記録を参照） | 記述上の関係—個別操作の成立依存とは未断定。名前参照の全件一覧であり依存辺とは認定せず、参照先identityは不明のまま。 |
| INFRASTRUCTURE → OS | 28 | `HELIXINFRASTRUCTURE-L2-001`, `HELIXINFRASTRUCTURE-L2-003`, `HELIXINFRASTRUCTURE-L2-006`, `HELIXINFRASTRUCTURE-L2-009`, `HELIXINFRASTRUCTURE-L2-010`, `HELIXINFRASTRUCTURE-L2-011`, `HELIXINFRASTRUCTURE-L2-012`, `HELIXINFRASTRUCTURE-L2-014`, `HELIXINFRASTRUCTURE-L2-015`, `HELIXINFRASTRUCTURE-L2-018`, `HELIXINFRASTRUCTURE-L2-020`, `HELIXINFRASTRUCTURE-L2-021`, `HELIXINFRASTRUCTURE-L2-022`, `HELIXINFRASTRUCTURE-L2-023`, `HELIXINFRASTRUCTURE-L2-024`, `HELIXINFRASTRUCTURE-L2-025`, `HELIXINFRASTRUCTURE-L2-026` | `docs/helix-infrastructure/L2-requirements/infrastructure-requirements.md:35`（全文は抽出JSONの行記録を参照） | OS運転が要求する実資源/環境stateへの接続。名前参照の全件一覧であり依存辺とは認定せず、参照先identityは不明のまま。 |
| INFRASTRUCTURE → CONNECT | 2 | `HELIXINFRASTRUCTURE-L2-001` | `docs/helix-infrastructure/L2-requirements/infrastructure-requirements.md:35`（全文は抽出JSONの行記録を参照） | 記述上の関係—個別操作の成立依存とは未断定。名前参照の全件一覧であり依存辺とは認定せず、参照先identityは不明のまま。 |
| INFRASTRUCTURE → SECURITY | 28 | `HELIXINFRASTRUCTURE-L2-001`, `HELIXINFRASTRUCTURE-L2-002`, `HELIXINFRASTRUCTURE-L2-003`, `HELIXINFRASTRUCTURE-L2-004`, `HELIXINFRASTRUCTURE-L2-010`, `HELIXINFRASTRUCTURE-L2-011`, `HELIXINFRASTRUCTURE-L2-012`, `HELIXINFRASTRUCTURE-L2-015`, `HELIXINFRASTRUCTURE-L2-017`, `HELIXINFRASTRUCTURE-L2-018`, `HELIXINFRASTRUCTURE-L2-020`, `HELIXINFRASTRUCTURE-L2-021`, `HELIXINFRASTRUCTURE-L2-022`, `HELIXINFRASTRUCTURE-L2-023`, `HELIXINFRASTRUCTURE-L2-024` | `docs/helix-infrastructure/L2-requirements/infrastructure-requirements.md:35`（全文は抽出JSONの行記録を参照） | 記述上の関係—個別操作の成立依存とは未断定。名前参照の全件一覧であり依存辺とは認定せず、参照先identityは不明のまま。 |
| INFRASTRUCTURE → BRAIN | 2 | `HELIXINFRASTRUCTURE-L2-001`, `HELIXINFRASTRUCTURE-L2-020` | `docs/helix-infrastructure/L2-requirements/infrastructure-requirements.md:35`（全文は抽出JSONの行記録を参照） | 記述上の関係—個別操作の成立依存とは未断定。名前参照の全件一覧であり依存辺とは認定せず、参照先identityは不明のまま。 |
| INFRASTRUCTURE → LABO | 5 | `HELIXINFRASTRUCTURE-L2-001`, `HELIXINFRASTRUCTURE-L2-009`, `HELIXINFRASTRUCTURE-L2-014` | `docs/helix-infrastructure/L2-requirements/infrastructure-requirements.md:35`（全文は抽出JSONの行記録を参照） | 記述上の関係—個別操作の成立依存とは未断定。名前参照の全件一覧であり依存辺とは認定せず、参照先identityは不明のまま。 |
| INFRASTRUCTURE → INTELLIGENCE | 3 | `HELIXINFRASTRUCTURE-L2-001`, `HELIXINFRASTRUCTURE-L2-016`, `HELIXINFRASTRUCTURE-L2-020` | `docs/helix-infrastructure/L2-requirements/infrastructure-requirements.md:35`（全文は抽出JSONの行記録を参照） | 記述上の関係—個別操作の成立依存とは未断定。名前参照の全件一覧であり依存辺とは認定せず、参照先identityは不明のまま。 |
| BRAIN → HARNESS | 16 | `HELIXBRAIN-L2-004`, `HELIXBRAIN-L2-006`, `HELIXBRAIN-L2-018`, `HELIXBRAIN-L2-019`, `HELIXBRAIN-L2-022`, `HELIXBRAIN-L2-024`, `HELIXBRAIN-L2-029`, `HELIXBRAIN-L2-030` | `docs/helix-brain/L2-requirements/brain-requirements.md:125`（全文は抽出JSONの行記録を参照） | 設計入力/knowledge 受領記録の受け手接続。名前参照の全件一覧であり依存辺とは認定せず、参照先identityは不明のまま。 |
| BRAIN → OS | 3 | `HELIXBRAIN-L2-025`, `HELIXBRAIN-L2-027` | `docs/helix-brain/L2-requirements/brain-requirements.md:469`（全文は抽出JSONの行記録を参照） | OS工程/実行との説明的責務境界。名前参照の全件一覧であり依存辺とは認定せず、参照先identityは不明のまま。 |
| BRAIN → CONNECT | 3 | `HELIXBRAIN-L2-026`, `HELIXBRAIN-L2-030` | `docs/helix-brain/L2-requirements/brain-requirements.md:480`（全文は抽出JSONの行記録を参照） | 記述上の関係—個別操作の成立依存とは未断定。名前参照の全件一覧であり依存辺とは認定せず、参照先identityは不明のまま。 |
| BRAIN → SECURITY | 5 | `HELIXBRAIN-L2-001`, `HELIXBRAIN-L2-INFRA-001`, `HELIXBRAIN-L2-INFRA-003`, `HELIXBRAIN-L2-INFRA-004`, `HELIXBRAIN-L2-INFRA-015` | `docs/helix-brain/L2-requirements/brain-requirements.md:90`（全文は抽出JSONの行記録を参照） | 記述上の関係—個別操作の成立依存とは未断定。名前参照の全件一覧であり依存辺とは認定せず、参照先identityは不明のまま。 |
| BRAIN → INFRASTRUCTURE | 28 | `HELIXBRAIN-L2-001`, `HELIXBRAIN-L2-020`, `HELIXBRAIN-L2-024`, `HELIXBRAIN-L2-027`, `HELIXBRAIN-L2-INFRA-001`, `HELIXBRAIN-L2-INFRA-002`, `HELIXBRAIN-L2-INFRA-003`, `HELIXBRAIN-L2-INFRA-004`, `HELIXBRAIN-L2-INFRA-005`, `HELIXBRAIN-L2-INFRA-006`, `HELIXBRAIN-L2-INFRA-007`, `HELIXBRAIN-L2-INFRA-008`, `HELIXBRAIN-L2-INFRA-009`, `HELIXBRAIN-L2-INFRA-010`, `HELIXBRAIN-L2-INFRA-011`, `HELIXBRAIN-L2-INFRA-012`, `HELIXBRAIN-L2-INFRA-013`, `HELIXBRAIN-L2-INFRA-014`, `HELIXBRAIN-L2-INFRA-015`, `HELIXBRAIN-L2-INFRA-016`, `HELIXBRAIN-L2-INFRA-017` | `docs/helix-brain/L2-requirements/brain-requirements.md:90`（全文は抽出JSONの行記録を参照） | 記述上の関係—個別操作の成立依存とは未断定。名前参照の全件一覧であり依存辺とは認定せず、参照先identityは不明のまま。 |
| BRAIN → LABO | 7 | `HELIXBRAIN-L2-007`, `HELIXBRAIN-L2-020`, `HELIXBRAIN-L2-024`, `HELIXBRAIN-L2-025`, `HELIXBRAIN-L2-026`, `HELIXBRAIN-L2-027` | `docs/helix-brain/L2-requirements/brain-requirements.md:157`（全文は抽出JSONの行記録を参照） | 記述上の関係—個別操作の成立依存とは未断定。名前参照の全件一覧であり依存辺とは認定せず、参照先identityは不明のまま。 |
| BRAIN → INTELLIGENCE | 4 | `HELIXBRAIN-L2-004`, `HELIXBRAIN-L2-012`, `HELIXBRAIN-L2-021` | `docs/helix-brain/L2-requirements/brain-requirements.md:125`（全文は抽出JSONの行記録を参照） | 記述上の関係—個別操作の成立依存とは未断定。名前参照の全件一覧であり依存辺とは認定せず、参照先identityは不明のまま。 |
| LABO → HARNESS | 7 | `HELIXLABO-L2-021`, `HELIXLABO-L2-029`, `HELIXLABO-L2-059`, `HELIXLABO-L2-060` | `docs/helix-labo/L2-requirements/labo-requirements.md:205`（全文は抽出JSONの行記録を参照） | 共通pack/受入契約の参照（多くは各参照元の実行経路ではない）。名前参照の全件一覧であり依存辺とは認定せず、参照先identityは不明のまま。 |
| LABO → OS | 25 | `HELIXLABO-L2-001`, `HELIXLABO-L2-006`, `HELIXLABO-L2-022`, `HELIXLABO-L2-028`, `HELIXLABO-L2-032`, `HELIXLABO-L2-037`, `HELIXLABO-L2-039`, `HELIXLABO-L2-042`, `HELIXLABO-L2-050`, `HELIXLABO-L2-053`, `HELIXLABO-L2-056`, `HELIXLABO-L2-057`, `HELIXLABO-L2-058`, `HELIXLABO-L2-059`, `HELIXLABO-L2-060` | `docs/helix-labo/L2-requirements/labo-requirements.md:75`（全文は抽出JSONの行記録を参照） | assignment/result/証拠受渡しまたはOS実行責務参照。名前参照の全件一覧であり依存辺とは認定せず、参照先identityは不明のまま。 |
| LABO → CONNECT | 21 | `HELIXLABO-L2-021`, `HELIXLABO-L2-022`, `HELIXLABO-L2-023`, `HELIXLABO-L2-024`, `HELIXLABO-L2-025`, `HELIXLABO-L2-026`, `HELIXLABO-L2-027`, `HELIXLABO-L2-030`, `HELIXLABO-L2-032`, `HELIXLABO-L2-033`, `HELIXLABO-L2-034`, `HELIXLABO-L2-035`, `HELIXLABO-L2-036`, `HELIXLABO-L2-037`, `HELIXLABO-L2-040`, `HELIXLABO-L2-041`, `HELIXLABO-L2-042`, `HELIXLABO-L2-054`, `HELIXLABO-L2-057` | `docs/helix-labo/L2-requirements/labo-requirements.md:205`（全文は抽出JSONの行記録を参照） | 記述上の関係—個別操作の成立依存とは未断定。名前参照の全件一覧であり依存辺とは認定せず、参照先identityは不明のまま。 |
| LABO → SECURITY | 4 | `HELIXLABO-L2-025`, `HELIXLABO-L2-038`, `HELIXLABO-L2-039`, `HELIXLABO-L2-060` | `docs/helix-labo/L2-requirements/labo-requirements.md:221`（全文は抽出JSONの行記録を参照） | 記述上の関係—個別操作の成立依存とは未断定。名前参照の全件一覧であり依存辺とは認定せず、参照先identityは不明のまま。 |
| LABO → INFRASTRUCTURE | 1 | `HELIXLABO-L2-026` | `docs/helix-labo/L2-requirements/labo-requirements.md:225`（全文は抽出JSONの行記録を参照） | 記述上の関係—個別操作の成立依存とは未断定。名前参照の全件一覧であり依存辺とは認定せず、参照先identityは不明のまま。 |
| LABO → BRAIN | 1 | `HELIXLABO-L2-023` | `docs/helix-labo/L2-requirements/labo-requirements.md:213`（全文は抽出JSONの行記録を参照） | 記述上の関係—個別操作の成立依存とは未断定。名前参照の全件一覧であり依存辺とは認定せず、参照先identityは不明のまま。 |
| LABO → INTELLIGENCE | 22 | `HELIXLABO-L2-024`, `HELIXLABO-L2-035`, `HELIXLABO-L2-052`, `HELIXLABO-L2-053`, `HELIXLABO-L2-054`, `HELIXLABO-L2-056`, `HELIXLABO-L2-060` | `docs/helix-labo/L2-requirements/labo-requirements.md:217`（全文は抽出JSONの行記録を参照） | 評価材料/Bench水準の選択的proposal 受渡し。名前参照の全件一覧であり依存辺とは認定せず、参照先identityは不明のまま。 |
| INTELLIGENCE → HARNESS | 17 | `HELIXINTELLIGENCE-L2-017`, `HELIXINTELLIGENCE-L2-038`, `HELIXINTELLIGENCE-L2-060`, `HELIXINTELLIGENCE-L2-062`, `HELIXINTELLIGENCE-L2-064`, `HELIXINTELLIGENCE-L2-067`, `HELIXINTELLIGENCE-L2-068`, `HELIXINTELLIGENCE-L2-069`, `HELIXINTELLIGENCE-L2-070` | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:204`（全文は抽出JSONの行記録を参照） | verification/meaning/backflow契約またはCORE入力。名前参照の全件一覧であり依存辺とは認定せず、参照先identityは不明のまま。 |
| INTELLIGENCE → OS | 16 | `HELIXINTELLIGENCE-L2-016`, `HELIXINTELLIGENCE-L2-017`, `HELIXINTELLIGENCE-L2-039`, `HELIXINTELLIGENCE-L2-065`, `HELIXINTELLIGENCE-L2-066`, `HELIXINTELLIGENCE-L2-067`, `HELIXINTELLIGENCE-L2-068`, `HELIXINTELLIGENCE-L2-070` | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:142`（全文は抽出JSONの行記録を参照） | proposal/support/assignment運転境界。名前参照の全件一覧であり依存辺とは認定せず、参照先identityは不明のまま。 |
| INTELLIGENCE → CONNECT | 41 | `HELIXINTELLIGENCE-L2-017`, `HELIXINTELLIGENCE-L2-030`, `HELIXINTELLIGENCE-L2-031`, `HELIXINTELLIGENCE-L2-032`, `HELIXINTELLIGENCE-L2-033`, `HELIXINTELLIGENCE-L2-034`, `HELIXINTELLIGENCE-L2-035`, `HELIXINTELLIGENCE-L2-036`, `HELIXINTELLIGENCE-L2-037`, `HELIXINTELLIGENCE-L2-038`, `HELIXINTELLIGENCE-L2-039`, `HELIXINTELLIGENCE-L2-040`, `HELIXINTELLIGENCE-L2-041`, `HELIXINTELLIGENCE-L2-042`, `HELIXINTELLIGENCE-L2-043`, `HELIXINTELLIGENCE-L2-044`, `HELIXINTELLIGENCE-L2-045`, `HELIXINTELLIGENCE-L2-067`, `HELIXINTELLIGENCE-L2-070`, `HELIXINTELLIGENCE-L2-071` | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:204`（全文は抽出JSONの行記録を参照） | 参照元/受け手専用接続 契約; 参照先 CONNECT identityの対応は別表を確認。名前参照の全件一覧であり依存辺とは認定せず、参照先identityは不明のまま。 |
| INTELLIGENCE → SECURITY | 6 | `HELIXINTELLIGENCE-L2-016`, `HELIXINTELLIGENCE-L2-036`, `HELIXINTELLIGENCE-L2-062`, `HELIXINTELLIGENCE-L2-068`, `HELIXINTELLIGENCE-L2-069` | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:142`（全文は抽出JSONの行記録を参照） | 記述上の関係—個別操作の成立依存とは未断定。名前参照の全件一覧であり依存辺とは認定せず、参照先identityは不明のまま。 |
| INTELLIGENCE → BRAIN | 16 | `HELIXINTELLIGENCE-L2-005`, `HELIXINTELLIGENCE-L2-013`, `HELIXINTELLIGENCE-L2-019`, `HELIXINTELLIGENCE-L2-032`, `HELIXINTELLIGENCE-L2-044`, `HELIXINTELLIGENCE-L2-060`, `HELIXINTELLIGENCE-L2-063`, `HELIXINTELLIGENCE-L2-064`, `HELIXINTELLIGENCE-L2-068` | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:74`（全文は抽出JSONの行記録を参照） | 記述上の関係—個別操作の成立依存とは未断定。名前参照の全件一覧であり依存辺とは認定せず、参照先identityは不明のまま。 |
| INTELLIGENCE → LABO | 5 | `HELIXINTELLIGENCE-L2-018`, `HELIXINTELLIGENCE-L2-022`, `HELIXINTELLIGENCE-L2-042`, `HELIXINTELLIGENCE-L2-067`, `HELIXINTELLIGENCE-L2-071` | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:148`（全文は抽出JSONの行記録を参照） | 歴史評価/Bench 証拠/独立評価への選択的経路。名前参照の全件一覧であり依存辺とは認定せず、参照先identityは不明のまま。 |

## 本文の両端を照合した接続群と判断

### 1. 共通pack契約の参照は個別接続の実行ではない

CONNECT-L2-001〜007の各本文は、HARNESS-L2-010/011を共通pack契約として適用し、CONNECTの責務を接続identity/契約/互換/transport/受領記録に限定する（`docs/helix-connect/L2-requirements/connect-requirements.md:45-52,60,73-111,119`）。CONNECT identity/端点を業務責務主体が宣言し、登録自体は業務承認/送信許可を作らない。接続対応表 `:143-177` は 接続元identity とその適用候補CONNECT-L2を列挙する。
同じHARNESS-L2-010/011 契約参照はLABOの観測参照元群、INTELLIGENCEのL2群、SECURITY/操作 packagesでも繰り返される。このためHARNESS 010/011への多数辺は共通呼出し/pack境界の参照であり、各要求が互いの独立実行操作を全て要求する意味ではない。個々の接続を確かめるときはCONNECT対応表と参照元別 受け手 identityを使う。INTELLIGENCE-L2-070は既存INTELLIGENCE-L2-033（入力）/040（result 受渡し）を使うと明記する。CONNECTのmapping `:170,177` で両参照元identityはCONNECT-L2-001/002/003/005/006に対応済み。従って070の「専用connector」は抽象的な新connectorを追加するのでなく、既存接続identityを再利用する読解が成立する。

### 2. G19開始・支援・結果受渡しは段階依存で整合

OS-L2-027 (現行`governance-requirements.md:829-837`) は初回runに対象scope、authority、安全、oracle、資源、必要時のINTELLIGENCE/LABO材料を束縛し、結果後にOS-L2-018/019/023を経てLABO観測へ渡す。性能未評価だけで開始を止めない。OS-L2-028 (`:851-860`) はINTELLIGENCE-L2-068の候補生成と相談実行受領記録を分け、相談は選択時のみ。OS-L2-029 (`:867-876`) HARNESS-L2-022を「開始前のverification義務/対/oracleの契約入力」とし、実行結果受領記録は開始前条件にしない。consult 受領記録は実相談時のみ。INTELLIGENCE-L2-068の候補作成にOS-028の相談完了は不要。
LABO-L2-057 (`labo-requirements.md:395-399`) はOS-018/019/023 result 受領記録からLABO-028へ運ぶ。OS-027はprovenance参照に留め、057の依存にしない（明記されたnegative edge。OS `:830,837`でも同じ）。L2-055/054評価・受渡しは各別責務主体として残る。LABO-L2-060 (`:441-455`) は支援有無評価にOS result/受領記録、HARNESS oracle、INT-068 参照元証拠を求めるが、OS-028相談受領記録は実相談を選択したrunのみ、OS-029は一周成立runを参照元に選ぶ場合のみ。testなし/相談不要runを排除する循環は見つからなかった。

### 3. G17のモデル入力→計算→結果→LABO受領は段階順で整合

INTELLIGENCE L2-069〜071 (現行`intelligence-requirements.md:513-559`) は説明予測L2-006と有限model計算を別identityで表し、HARNESS Product Coreが設計/modelの正本、INTELLIGENCEが許可revisionの計算、LABOが後続実績の独立評価、OSが実環境/Worker運転を所有する。069は033 入力 受領記録から開始し、明示schema/rule/units/rates/price/参照元が足りない指標を数値化しない。期待値oracleはL11のfixtureまたは期待値付き検証操作に限る。通常scenarioはtrace/計算値/不明で成立しうる。
070は既存033 入力 段階 → 069 計算 → 040 結果送達 → LABO-024 受け手受領記録を別受領記録にする。各段階へ未到達の後段受領記録を開始前に要求しない（`intelligence-requirements.md:531-542`）。LABO-006の実験運転と予測と実績の比較は条件が揃う場合の別操作である。071は同一model revision/baseline/scenario/scopeと明記ruleで比較し、DB切断/負荷増/仮想worker 2→4をモデル変数としてのみ扱う（`:547-557`）。したがって、model schemaや必要relationが033 payloadにない場合は、070が明記するとおり欠落/不明として参照元/契約の責務主体へ戻すべき範囲で、仮の意味や新必須fieldを補う根拠にはならない。これは未対応範囲の制限であり、直ちに不明=障害とは判定しない。

### 4. BRAIN設計入力とHARNESS設計の受け手

BRAIN-L2-022/030はそれぞれPattern入力/知識revisionとquery/受領記録を出し、HARNESS-L2-009がその知識を使う場合に設計義務へ接続する。HARNESS-L2-009は単独見出しとして解析器が捉えられないが、HARNESS文書の親対応表 `:38-48`、要求対応表 `:59-60`、具体的な設計義務記述 `:116`、新unit `:385`および`538-542`にIDと責務がある。これは解析見出しの不足であり受信側identityの不在ではない。BRAIN `brain-requirements.md:438-441,580-584`も受領方法がHARNESSへ戻ることを明記。

### 5. OS/Infrastructure資源操作とHARNESS pack境界

HARNESSは契約/verification/oracle、OSは段階release/Worker/CI/ticketの運転、Infrastructureは実行環境構成・資源・復旧状態を所有する。OS-L2-014 `governance-requirements.md:624-632` はpack/verification boundaryをHARNESS、environment config/rollbackをINFRASTRUCTUREと分ける。INFRASTRUCTURE-L2-009/011/015からOS-L2-014の明示参照は段階release運転に必要な環境連携である。後続versionや未決numericを横断参照だけから1.0必須とは判定しない。旧preauditの「INFRA 1.0は18件で上限」という記述は誤りなので本監査に持ち込まない。18は最低項目で上限でなく、各現行L2の個別`version_target`で見る。

## 誤読を避ける照合記録（C1〜C4：要求修正findingではない）

### C1 — ID参照の明示的な非依存と実受渡しを区別する

例: OS-L2-027→LABO-L2-057は字面参照として抽出されたが、OS `:837`は「027はprovenance参照のみで057依存にしない」、LABO `:395-399`も同じと記す。これを業務依存辺として数えると循環誤認になる。対してOS-018/019/023→LABO-028/055/057は実行結果/観測の参照元受領記録を伴う実受渡しである。推奨読解は参照の正負と段階上の役割を別fieldに保つこと。修正要求ではなく意味分類の扱い。
### C2 — HARNESS pack共通契約参照を各unitの実行依存に広げない

LABO/CONNECT/INTELLIGENCE要求の大量のHARNESS-L2-010/011参照は、pack identity/契約 version/call scope/correlation/証拠 共通契約を適用する記述が主。参照元機構の機構固有 task, observation, support, model結果内容は各参照元の責務主体が保持し、HARNESSが効果評価・connector通信・Worker assignmentを奪わない。この繰返しを独立受け手間の実行依存や全能力同時有効化と読み替えない。
### C3 — G17入力schemaの不足は参照元に戻し、未知を成功にしない

L2-069の計算入力は有限の状態・関係・規則・単位・rate/価格参照元に限る。既存L2-033は設計/要求/意味とHARNESS検証参照元受領記録を所有し、070は現行参照元契約にないsimulation fieldを黙って必須化しない。契約が必要fieldを供給できなければ、数値・伝播の主張を未対応/不明にし、参照元/契約責務主体へ戻す。INTELLIGENCEへ製品固有model authorityを移さず、独立fixtureのoracleがないだけで通常計算すべてを停止しない。
### C4 — OS/WorkerとLABO/INTELLIGENCEの段階を分ける

OS-L2-028/029は候補生成、選択時の相談、実行、test、review/受入受領記録、最終受渡しを区別する。LABO-L2-060は比較を選んだ場合の相談証拠を使い、assignmentはOSに残す。020/022は該当段階の契約/操作依存で、先行完了受領記録を要求しない。今回照合した本文に残る直接矛盾は見つからなかった。この結果は作成側照合で、独立Claude reviewではない。

## 17方向の両端L2・L11照合

以下は現行main `d308f4080da298172001ef97e9c4b5f66d32ed7d` のL2とL11を照合した結果である。参照行と双方の見出し位置は固有参照組明細・L2本文・L11 revision表に固定した。反復するHARNESS共通契約参照は同じ契約単位で束ね、個別の業務受渡しと区別した。参照時に4区分が明記されない組はJSON/表の`不明・未記載`を維持し、本文の別箇所にある単独依存を参照行へ遡及させていない。

### 1. HARNESS → BRAIN：設計知識を選択時に受け取る

- **照合した両端**：HARNESS-L2-025/026 (`product-requirements.md:530-557`) はBRAIN connector契約を常時照合し、個別Pattern/knowledge 受領記録を使う場合のみその選択知識の適用条件・版・必須入力を照合する。BRAIN-L2-030 (`brain-requirements.md:575-600`) はquery/受領記録で知識identity・version・参照元・scope・未充足入力をHARNESS-L2-009へ渡し、設計選択と製品固有意味をHARNESS/COREへ残す。HARNESS-L11は設計unit/構成体のoracleを`product-acceptance.md:274-306`、BRAIN-L11はG15の029/030正常・誤り・未見・双方向traceを`brain-acceptance.md:83-115`で照合する。
- **判定**：実際の接続だが、Patternの全件完成を常時必須にしない。選択したknowledgeに定義済required fieldの値が未決なら知識受領記録は可能で、未充足義務・設計不成立を残す。field定義そのものの欠落は値未決と混同せずBRAINへ戻す。HARNESS側の設計義務対応付け欠落はHARNESSへ戻す。L11が値未決とfield定義欠落を分け、未見条件も不明のままにするため、未知を成功にも無条件拒否にもしていない。BRAIN-L2-022/030の同時充足は既存L11-030で確認され、後述U1のとおり非findingとする。

### 2. HARNESS → OS：生成候補から選択executorへ段階送信

- **照合した両端**：HARNESS-L2-030/031はcase/repro 候補生成、032は実行接続、033は結果までの構成体を分ける (`product-requirements.md:607-692`)。入力oracle/対象revisionを先に固定し、将来run 受領記録は開始入力にしない。OS-L2-020 (`governance-requirements.md:692-710`) はticket/CI profile/隔離run/結果回収を所有し、HARNESS oracleを追加・削除しない。HARNESS-L11は具体test/repro/032/033の正常・誤り・未見と、回帰成立に後続結果受領記録が必要な場合を`product-acceptance.md:410-460`で区別する。OS-L11は検収・CI運転の状態を`governance-acceptance.md:359-383`で確認する。
- **判定**：032を選ぶ操作に限るexecutor受渡しであり、OS-020は常に全HARNESS利用の実行依存ではない。参照元/参照先どちらの候補生成も、後続run結果が返るまで開始不能にしていない。run result 不明/missingはその実行・回帰成立の主張を保留しHARNESS oracle 責務主体/OS run 責務主体へ戻す。HARNESSが実行、OSがoracle意味を持つ矛盾は確認しなかった。

### 3. OS → HARNESS：段階構成と検証契約の入力

- **照合した両端**：OS-L2-014/026はHARNESS-L2-010/011/022を段階構成・要求導出・適合性の契約入力として参照 (`governance-requirements.md:619-641,807-823`)。OS-L2-027/029もHARNESS-L2-022のtest/oracle/受入義務を参照する (`:824-845,863-880`)。HARNESS-L2-010/011/022はpack境界・呼出し・検証状態の正本 (`product-requirements.md:340-369,447-461`)。HARNESS-L11は各契約の段階別oracleを`:199-234,298-306`、OS-L11は段階リリース/020/027-029を`governance-acceptance.md:311-359,442-480`で照合する。
- **判定**：HARNESS契約がOS運転の規範入力であり、OS結果がHARNESSの意味・受入を上書きしない。027のHARNESS-L2-022は開始前のoracle/test義務入力で、検査結果受領記録を先に要求しない。OS単体実行と後段構成体/受入は分けられ、未達はHARNESS契約またはOS ticketへ戻る。段階収載で必要な範囲のみ有効となる。

### 4. OS → SECURITY：操作に適用する権限・隔離・egress条件

- **照合した両端**：OS-L2-027の限定初回run (`governance-requirements.md:824-845`) は、対象操作に適用されるSECURITY authority、隔離、resource/data-use条件を照合する。参照先はSECURITY-L2-003/005/006/008/015/016のproject・credential・egress・操作 authority・資産identity・分類基盤 (`security-requirements.md:90-150,210-230`)。OS-L11の027 fixtureはscope-bound 初回実行を`:442-455`、SECURITY-L11はrevoke/egress/credential/isolationと不明時停止を`security-acceptance.md:54-85`で確認する。
- **判定**：単なる名称参照ではなく、実runで該当するauthority/security条件を閉じる操作依存。全SECURITY-L2能力が全runで一律必須という意味ではない。実行対象scope/操作に無関係な未観測項目を全停止へ広げず、反対に適用するauthority/隔離/証拠が不明なら成功扱いしない。authority不足はSECURITY、割当・停止・記録はOSへ戻る。抽出参照行自体には4区分が結び付かない参照組があるので区分欄は明記範囲だけとする。

### 5. OS → LABO：run結果を観測参照元として選択

- **照合した両端**：OS-L2-027は初回結果・構成provenanceを別に示し、LABO-L2-055/057へ結果観測候補を渡す。OS-L2-029は支援loop一周の評価を行う場合にLABO-L2-060の比較を参照する。LABO-L2-057 (`labo-requirements.md:391-401`) はOS-018/019/023 result/受領記録からLABO-028観測へ受渡し、OS-027を明示的にprovenance参照のみ・非依存とする。LABO-L2-060 (`:441-455`) はOS受領記録とHARNESS oracleの同一scope比較を持つ。LABO-L11は初回受領と条件付比較を`:148-205`、OS-L11は段階結果を`:442-480`で照合する。
- **判定**：OS結果→LABO observationは実接続。OS-027→LABO-057は明示negative/provenance edgeで、実行依存と数えると循環を作る。LABO-060は効果比較を選ぶ場合の条件で、OS-029の通常run全部に前提化しない。HARNESS oracle結果やLABO evaluationは参照元/受け手受領記録とは別の義務。未受領はLABO観測未成立としてOS/参照元へ戻す。

### 6. OS → INTELLIGENCE：配置・支援候補をOSが受け取る

- **照合した両端**：OS-L2-027はINTELLIGENCE-L2-010配置候補、028はINTELLIGENCE-L2-068支援案、029は068とその段階候補を参照 (`governance-requirements.md:824-880`)。INTELLIGENCE-L2-010は配置候補を生成しOSへ渡すがassignmentを行わず (`intelligence-requirements.md:102-107`)、068は困難箇所に対する限定案を作りOSが相談を認可する (`:491-512`)。OS-L11の027/028/029例 (`governance-acceptance.md:442-480`) とINTELLIGENCE-L11の068単体/G17受入 (`intelligence-acceptance.md:201-250`) を読む。
- **判定**：INTELLIGENCE出力はOSが受領する提案・contextで、OSがassignment/相談実行・authorityを保つ。事前test/指示準備から開始する029正常経路には028相談受領記録を要求せず、相談選択時にのみ028 受領記録を必要とする。INT proposalだけでWorkerを起動しない。適用参照元が未見・oracleが未定なら候補は不明/保留で、既定値で補完しない。

### 7. CONNECT → HARNESS：全接続が共通pack/呼出し契約を使う

- **照合した両端**：CONNECT-L2-001〜007 (`connect-requirements.md:41-142`) はHARNESS-L2-010/011のidentity・版・scope・相関・未完義務・更新条件を共通契約として適用する。各接続unitは登録・互換照合・通信・再送・traceを分け、CONNECTは業務意味/承認を作らない。HARNESS-L2-010/011 (`product-requirements.md:340-369`) がpack/call共通意味を定義する。CONNECT-L11の単体・接続・構成体fixtureは`connect-acceptance.md:20-83`、HARNESS-L11のpack boundaryは`product-acceptance.md:199-218`。
- **判定**：共通契約参照はCONNECT機構の各unitに必要だが、登録(001)、互換だけ(002)、通信(003)等は個別操作単位で別成立する。CONNECTの各L2を単一の複合実行時処理へ潰す意味ではない。stale/不明/ack未確認は送信適格性または接続完了を生まず、端点責務主体/SECURITY/HARNESS契約責務主体へ戻る。端点共有は許可される一方、identity衝突は拒否する既決のCONNECT条件を維持する。

### 8. SECURITY → HARNESS：descriptorをsecurity判定の入力に使う

- **照合した両端**：SECURITY-L2-028 (`security-requirements.md:342-348`) はHARNESS-L2-010/011共通pack descriptorを受け取り、SECURITY更新候補のidentity/version/digest/provenance/integrityを判定する。HARNESS-L2-010/011は共通pack lifecycle/呼出し契約を維持し、SECURITYは更新admission以外の交換/rollback state machineを所有しない。SECURITY-L11は全体scope/依存境界およびsecurity fixtureを`security-acceptance.md:17-85`、HARNESS-L11はdescriptor/pack境界を`:199-234`で確認する。
- **判定**：descriptorはSECURITY判定の常時入力であり、HARNESS pack-lifecycleの処理移転ではない。identity/version/digestの欠落や不明はsecurity更新受入を止める一方、HARNESSもSECURITY verdictのみで更新を全体完了扱いしない。戻し先はidentity/pack契約ならHARNESS、provenance/integrity/security admissionならSECURITY。

### 9. INFRASTRUCTURE → OS：資源・実行状態と作業・変更状態を結ぶ

- **照合した両端**：INFRASTRUCTURE-L2-009/011/015 (`infrastructure-requirements.md:114-195`) は参照元identity/location/version/実際の状態/復旧状態とOS ticket/change/revisionを結び、正本を二重化しない。009は通常接続がOS 段階リリース全体に依存しないと明記、011は段階構成の構成体受入、015は後続版の変更適用候補。OS-L2-014 (`governance-requirements.md:619-641`) は段階契約を所有するOS側入力。INFRASTRUCTURE-L11は009/011を`:106-151`、OS-L11は段階リリースを`:311-323`で照合する。
- **判定**：009は1.0の実資源/work state接続、011は1.0のInfrastructure全体構成体、015は`version_target: 1.0より後・版未定`である。015や将来Infrastructure 段階-change能力をOS-014の通常release開始条件へ前倒ししない。POの18最低項目は上限ではなく、L1追加項目も個別の`version_target`で判定する。参照元identity/state不一致はINFRASTRUCTURE、ticket/段階/操作状態不一致はOSへ戻る。

### 10. BRAIN → HARNESS：設計knowledgeをHARNESS受入義務へつなぐ

- **照合した両端**：BRAIN-L2-022 (`brain-requirements.md:434-446`) はPattern 必須入力/constraint/relationをHARNESS-L2-009設計義務へ渡す。L2-030 (`:575-600`) はquery/受領記録、選択知識参照元、相関・version・未充足義務を同じ受け手へ運ぶ。BRAIN-L2-028 (`:494-503`) は共通descriptor適用、BRAIN-L2-003/010等の旧要件参照は一般知識の必須入力/negative knowledgeに関するもの。HARNESS-L2-009/010/011が受領・設計契約を定義 (`product-requirements.md:116,340-369`)。BRAIN-L11 G15 029/030 (`brain-acceptance.md:83-115`) とHARNESS-L11 design/oracle (`product-acceptance.md:274-306`) が双方の受入例。
- **判定**：実接続は022/030→HARNESS-009、対して028→HARNESS-010/011はpack descriptor/共通契約参照。BRAINは汎用knowledge/必須入力/relations、HARNESSは製品設計義務と製品固有選択を所有する。値未定知識は受領できても未充足のまま、定義欠落・逆trace欠落は未成立。022の入力内容・双方向traceと030のquery/receipt条件は、既存L11-030の追補で同時に検査する。既存消化#2189と後述U1を照合し、併存自体を二重実行や矛盾とは判定しない。

### 11. BRAIN → OS：Pattern revision/stateの利用記録

- **照合した両端**：BRAIN-L2-008 (`brain-requirements.md:161-170`) はPattern/Unit/Part identity/version/stateをBRAINが所有し、実projectで使ったversion/stateの登録はOSへ委ねる。OS-L2-001のrouting/既存利用要求表は、projectごとの要求正本・判断出所・合意revision・担当責務を確認する登録側の行き先である (`governance-requirements.md:36-55,752-770`)。BRAIN-L11のversion/supersession/end-to-end条件は`:70-82`、OS-L11の要求出所・scope・revision条件は`governance-acceptance.md:40-45,77-84`で照合した。
- **判定**：versioned知識参照の利用実績をOSが記録する責務境界で、OSがPatternを採択・改変せず、BRAINもproject状態を所有しない。本文はBRAIN-L2-008で「利用版・状態の登録はOS」と明示するが、個別connection identityやreceipt schemaを追加定義していない。OS-L2-001の現行routing/要求登録の用途を照合先として特定し、OS-001から独自authorityを導かない。未特定schemaを新規必須とせず、利用版不明を適用済みにしない。戻し先はknowledge version/stateならBRAIN、project usage/event identityならOS。

### 12. LABO → HARNESS：共通pack/受入条件と選択参照元閉包

- **照合した両端**：LABO-L2-001〜010 (`labo-requirements.md:69-147`) はHARNESS-L2-010/011を共通pack/call規約として参照する。LABO-L2-058 (`:403-414`) はLABO-001 参照元ごとの選択依存を明記し、HARNESS-L2-023を条件別closure契約に使う。L2-059 (`:416-440`) はHARNESS-L2-022 oracle、L2-060 (`:441-455`) はHARNESS-022 quality/受入 oracleを比較入力とする。HARNESS-L2-010/011/022/023 (`product-requirements.md:340-369,447-478`) が共通契約・oracle/状態を所有する。LABO-L11はunit/接続/構成体の評価候補とG13/G20例 (`labo-acceptance.md:41-105,156-205`)、HARNESS-L11は010/011/022/023の受入 (`product-acceptance.md:199-234,298-306`)。
- **判定**：001〜010の繰返しは個別LABO 操作の別々の実行依存を宣言するものではなく共通pack/呼出し契約参照。058で選んだ参照元の依存だけが該当呼出しに必要となり、未選択参照元は未観測として残る。059/060は評価に使うHARNESS oracleを独立入力にする。不明 applicable oracleは評価passにしないが、無関係なoracles全件の完成も必須化しない。参照元/pack 契約不整合は当該責務主体へ戻る。

### 13. LABO → OS：実行受領記録の観測取込と支援効果比較

- **照合した両端**：LABO-L2-057と060をOS-L2-018/019/023/027/028/029に対照した。057はOS 受領記録を観測接続として受け、027を任意provenanceに限定 (`labo-requirements.md:391-401`)。060は選択比較に必要なOS assignment/result 受領記録を入力し、実作業割当はOSに残す (`:441-455`)。OSは割当/結果の責務を各節`:672-691,682-691,722-731`、018/019/023および支援の流れを`:824-880`で定義。LABO-L11の057/060例`:148-205`、OS-L11の一周sequence`:442-480`。
- **判定**：057は実受領記録受渡し、060は比較操作の選択依存。LABOはassignment/authorityを変更せず、結果・費用・時間を評価する。OSはLABO評価を作らず受領記録を渡す。未観測値は未評価/比較不能を残し、OS実行成功やLABOの有効性判定に昇格しない。

### 14. LABO → INTELLIGENCE：評価材料とBench水準の別経路

- **照合した両端**：LABO-L2-059は評価材料をINTELLIGENCE-L2-034/010/011へ選択的に使う経路、LABO-060はWorker支援有無比較結果をINTELLIGENCE-068へ渡す候補、LABO-055/054はBench水準の別経路 (`labo-requirements.md:150-155,259-321,416-455`)。INTELLIGENCE-L2-010は配置候補、034はLABO評価材料、068は作業中支援候補 (`intelligence-requirements.md:102-107,244-252,491-512`)。LABO-L11 comparison cases `labo-acceptance.md:178-205`、INTELLIGENCE-L11 候補/証拠 `intelligence-acceptance.md:201-214`で確認。
- **判定**：一般評価材料とBench levelは異なる能力・経路で、059の全結果を054へ送る条件ではない。060比較結果もINT-068の候補生成へ材料として渡せる場合であり、LABOが支援を起動・選択せずINTELLIGENCEが配置しない。未評価/非互換の材料はその状態で保持し、参照元/受け手の責務主体へ戻る。範囲外Web/3.0+学習系はこの1.0routeへ混ぜない。

### 15. INTELLIGENCE → HARNESS：pack共通契約、oracle、条件別依存

- **照合した両端**：INTELLIGENCE-L2-001〜045、066/067/069/070/071がHARNESS-L2-010/011を共通契約として参照する多数組、068→HARNESS-022、069/070/071→HARNESS-023が個別の規範入力/closure関係 (`intelligence-requirements.md:52-350,462-559`)。HARNESS-L2-010/011/022/023 (`product-requirements.md:340-369,447-478`) とHARNESS-L11のpack/oracle/closure cases (`product-acceptance.md:199-234,298-306`) に照合した。INTELLIGENCE-L11 068/G17 069–071は`intelligence-acceptance.md:201-250`。
- **判定**：45組の010/011は共通pack identity/version/call/result/証拠 契約で、各INT要求の独立実行依存と一律解釈しない。068が022 oracleを使うのは支援時test/review契約、69–71の023参照は当該model 入力/参照元 conditionのclosureに使う。033/040段階受領記録は到達順に発生し、後段受領記録を計算開始前に要求しない。通常計算は参照元に結び付く rule/units/trace/不明で成立可能。oracleはL11のfixtureまたは期待値付き検証操作の場合のみ必須。明示条件不成立の入力を排除する一方、不明な項目を成功扱いしない。

### 16. INTELLIGENCE → LABO：予測/候補と後続評価・実績の分離

- **照合した両端**：INTELLIGENCE-L2-066/067/068/069/070/071はLABO-L2-006/024/035/052/054/055/059を評価materialまたはresult receiverとして参照 (`intelligence-requirements.md:462-559`)。LABO側は実験/実績評価を006、Aggregate 受領記録を024、一般material境界を035/052、Bench 証拠を054/055、効果比較を059/060で分離 (`labo-requirements.md:109-115,215-321,416-455`)。INTELLIGENCE-L11 G17は仮想結果/後続実測区分・受領記録を`:211-250`、LABO-L11は独立評価・G13比較oracleを`labo-acceptance.md:164-205`で照合した。
- **判定**：069/071仮想model 計算をLABO実験/実測へ偽装しない。070の接続sequenceは既存INT-033 入力 受領記録→069 result→INT-040 send→LABO-024 受領記録で、実測比較は選んだ後続操作に限る。predictionとresult 受領記録後の独立LABO評価をINTELLIGENCEが自己認定しない。要求版/参照元/schema不足はCORE/HARNESSへ、受領はLABO、評価oracleはLABOへ戻す。条件のない精度閾値や未知model fieldを補わない。

### 17. INTELLIGENCE → OS：提案/診断をassignment/実行へ渡す

- **照合した両端**：INTELLIGENCE-L2-068はOS-L2-020/028/029をtest実行・相談・構成体支援の接続先として参照 (`intelligence-requirements.md:491-512`)。OS-L2-020/028/029はrun execution/consult authority/元Worker復帰/一周責務を定義 (`governance-requirements.md:672-710,722-731,847-880`)。INTELLIGENCE-L11 068 `intelligence-acceptance.md:201-214` とOS-L11 028/029 `governance-acceptance.md:457-480` で相談あり/なし双方のfixtureを照合した。
- **判定**：候補またはtest/instruction準備をOS実行結果へ格上げせず、相談受領記録は選択時のみ。元Workerのassignment、test実行、結果/verification 受領記録、独立reviewの責務主体はOS/HARNESS側に残る。既知oracleがない未見endpointではINTELLIGENCEが類推結果を確定せず、必要な契約参照元へ戻す。OSは候補不足や受領記録未着を成功/受入にしない。

## 機構名だけの418件の記述の意味分類と限界

抽出JSONの418件は全行全文（最大行長1174文字）を保存し、各記述の参照元ID・path・行・参照先機構名を保持した。265種の異なる全文行を、ID未特定のまま全文で扱った。うち32件は「各参照元/受け手の責務主体と専用CONNECT connectorのadmitted 契約」というLABO等の共通接続条件の反復、13件は版/依存/属性一覧を含む全体・段階構成入力、残りは入力/出力・authority/責務主体・旧参照元上の理由・後続scope等の記述を含む。機械抽出の方向は「その文書が別機構名に言及した向き」であり、source→consumerの業務方向を意味しない。機構名だけの行から要求identityを推測しない。


### 名前参照のみの行から本文で確認できた接続

以下は名前参照を新しい要求identityへ割り当てた一覧ではない。現行本文に別途明示された接続identity、入力/出力、L11検証、既存監査の照合先を使い、418件が未解消接続を意味しないことを確認した。名前参照の方向と実接続方向は一致しない場合がある。表に示す依存区分は接続全体の単一分類ではなく、選択操作の明文条件に限る。

| 抽出上の名前参照 | 本文で特定した接続・両端の責務 | 区分・失敗時の戻し先 | 根拠 |
|---|---|---|---|
| BRAIN/LABO | `HELIXBRAIN-L2-020` はLABO評価済み候補をBRAINへ受ける。反対に `HELIXLABO-L2-023` はBRAINから許可された利用/変更結果をLABO Aggregateへ観測として受ける。`HELIXLABO-L2-034` は複数product/meaning/episodeで支持されたgeneric structure candidateをBRAINへ返す。BRAINが知識正本、LABOが観測/評価とgenericity evidenceを持つ。 | 選択された知識利用・観測・candidate送達時のみ各接続契約を使う。source identity/evaluation scope不足はBRAINまたはLABOへ戻す。 | BRAIN L2 `brain-requirements.md:414-422`; BRAIN L11 `brain-acceptance.md:60`; LABO L2 `labo-requirements.md:211-213,255-257`; LABO L11 `labo-acceptance.md:74,85,117-124` |
| BRAIN/INTELLIGENCE | `HELIXBRAIN-L2-021` はINTELLIGENCE queryへBRAIN knowledge identity/version、条件、制約、反例を返す。INTELLIGENCE側 `HELIXINTELLIGENCE-L2-032` はPatternを判断材料として使い、適用candidateだけを返す。`HELIXINTELLIGENCE-L2-044` はgenericity candidateをLABO経由へ回しBRAINを直接更新しない。BRAINはknowledge正本、INTELLIGENCEは判断candidate、LABOは評価を所有する。 | 適用candidate作成時の選択knowledgeであり、全BRAIN knowledgeの利用依存ではない。適用性/revision不明はBRAINへ、汎用性/evidence不足はLABOへ戻す。 | BRAIN L2 `brain-requirements.md:424-432`; INT L2 `intelligence-requirements.md:226-233,334-341`; INT L11 `intelligence-acceptance.md:269,279`; CONNECT crosswalk `connect-requirements.md:169,181` |
| LABO/INFRASTRUCTURE | `HELIXLABO-L2-026` の見出しは「INFRASTRUCTURE → Aggregate」であり、INFRA resource/runtime evidenceがLABO観測へ入る向き。LABOは許可されたevidenceをsource版付きで観測し、resource authorityはINFRASTRUCTUREに残る。ここからLABO→INFRA出力は導かない。 | INFRA source契約/connectorは選択resource evidenceを観測するときに適用。stale/unknownはsource ownerへ戻す。 | LABO L2 `labo-requirements.md:223-225`; LABO L11 `labo-acceptance.md:74,77`; CONNECT crosswalk `g7-connect-source-connection-inventory.md:42` |
| LABO/SECURITY | `HELIXLABO-L2-025` はSECURITY→Aggregate入力、`HELIXLABO-L2-038` はLABO→SECURITY Feedback出力。前者は許可された安全性/incident evidenceの観測、後者は認可・隔離・credential・情報保護のFeedbackであり、LABOは権限を変えない。 | SECURITY evidence選択時またはFeedback送達時のみ対象scope/data-handling契約を適用。scope/許可不明はSECURITYへ戻す。 | LABO L2 `labo-requirements.md:219-221,271-273`; LABO L11 `labo-acceptance.md:76,89`; SECURITY consumer audit `helix-security-consumer-audit-2026-09-27.md:137-147` |
| LABO/CONNECT | `HELIXLABO-L2-040` は接続evidenceをCONNECTへ戻すFeedback経路。CONNECTはedge/transport契約を担い、業務上の接続意味はLABO/source ownerに残る。 | Feedback送達時のみ接続固有identity/CONNECT connectorを照合。契約不一致はCONNECTへ戻す。 | LABO L2 `labo-requirements.md:279-281`; LABO L11 `labo-acceptance.md:91`; CONNECT crosswalk `g7-connect-source-connection-inventory.md:42` |
| INTELLIGENCE/SECURITY | `HELIXINTELLIGENCE-L2-036` は限定修復等の特定actionに対するSECURITY permission/constraint/revocation照合。SECURITYがpermission/isolation authorityを保持し、INTELLIGENCEは許可を発行/変更しない。 | 操作時のみ。actor/target/revision/scope/期限/失効状態を対象operationで照合し、既決有効receiptを再利用する。不明・失効はSECURITYへ戻し実行しない。 | INT L2 `intelligence-requirements.md:262-269`; INT L11 `intelligence-acceptance.md:273`; SECURITY consumer audit `helix-security-consumer-audit-2026-09-27.md:125-133` |
| INTELLIGENCE/CONNECT | INTの明示connection identities（例: `HELIXINTELLIGENCE-L2-032/-036/-044`）はCONNECTの登録・版・通信・trace契約を使う。CONNECTは技術edgeを、各source/consumer ownerはknowledge、permission、Feedback/candidateの意味を保持する。 | 接続ごとのadmitted contract。connectorの存在だけで業務受領・許可・完了は生じず、scope/version/receiptの不一致は該当source/consumerへ戻す。 | INT→CONNECT crosswalk `connect-requirements.md:169,173,181`; CONNECT source/consumer境界 `g7-connect-source-connection-inventory.md:41-43`; INT L2 `intelligence-requirements.md:226-233,262-269,334-341` |

この対応表は抽出対象の全418行について新identityを付番するものではない。既存の明示identityで責務を特定できた接続だけを確認した。残る行は機構名/背景/共通契約等の記述であり、単独では未解消要求や必須依存を示さない。

表の「依存区分の字面marker hint」は、抽出時に同じ記述周辺にある依存ラベルの手掛かりをそのまま示すだけで、identity全体または毎回の実行への分類ではない。混在行、複数の入力条件、後続段階の受領記録は本文全体を読み、操作条件ごとに判定する。例えば `HARNESS-L2-025 → HELIXBRAIN-L2-030` はconnector/schema/scope照合が常時、選択Patternの適用検査・knowledge provenanceが各操作に応じるため、行中に複数markerがあっても「全knowledgeが常時必須」とは読まない。`version_target`の抽出値も本文の明記を優先し、「1.0より後・版未定」は後続scopeとして保持する。

分類は以下の読み方を保持する。明示的な接続/受領記録/受渡しを含む記述は候補経路として本文の両端に該当identityが別途特定できる時だけ接続表へ対応づけた。HARNESS共通pack/呼出し契約の記述は共通規範参照。責務・責務主体・正本・authorityの記述は境界説明。`version_target` 1.x/2.0/3.0+・後続版・Web未採択を含む行は後続scopeとして1.0必須へ繰り上げない。旧参照元/PO/Conceptの引用・背景例は説明資料。すべてidentity未特定行一覧を残し、これらだけを根拠に依存判定しない。原文上の異なる内容が同じ行に混在し、参照先identityを特定できないものは分類を保留し「ID未特定」とした。

## 確認結果・具体照合項目

17方向の明示ID参照208組は、実接続・共通契約参照・境界/背景・明示非依存に分類し、反復規約は責務同一性で群化した。さらに、418件の機構名参照から、指定されたBRAIN/LABO/INTELLIGENCEとSECURITY/CONNECT/INFRASTRUCTUREの関係について、現行L2と対応L11、CONNECT crosswalk、SECURITY consumer監査の現行根拠を補った。これらは名前参照行へ新identityを付けるものではない。

**この接続照合範囲では要求修正findingなし。** 現行本文で確認した接続群には、両端の出力/入力責務、scope/revisionの保持、条件付き依存、ownerへの戻し先が既に定義されている。名前参照の同一行に相手identityがないことは抽出限界であり、契約責務不明や未解消要求の証拠ではない。新たな反例または元契約と両立しない条件は確認できなかった。U1は既存L11-030と消化記録で内容とreceiptの同時充足が試されているため非findingとする。U2も未解消要求ではなく抽出形式の限界として扱う。

1.0では参照元revision/scope/authority・受領記録・適用oracleがわかる場合だけ当該操作を進め、未見入力/schema/oracleは該当責務主体へ戻す。未知状態を成功扱いしない一方、個別仕様を確認せず未知を一律拒否にも拡張しない。

- **U1 — 解消済み非finding（BRAIN 022/030）**：022はPattern required input/dependencyのHARNESS-009設計義務へのtraceを、030は選択knowledgeのquery/receipt契約を担う。L11-030は値未決receiptと未充足義務、必須field定義欠落を別に扱い、source→HARNESS義務と逆traceを同時に照合する (`brain-acceptance.md:99-113`)。resolution recordは既存L2意味・依存を変えずL11 oracleを具体化したと記録する (`helix-brain-internal-resolution-2026-09-27.md:5-8,15,20,26-38`)。併存だけから二重実行または両立不能を導く反例は確認されない。
- **U2 — 抽出限界であり非finding**：418件は「行で明示IDを捕捉できなかった名前参照」の件数であり、418個の未解消要求/接続を意味しない。文章文脈と既存L2/L11/crosswalk/監査で責務の分かる代表群は上表に示した。残りは、同じ文脈読解で個別の接続要求や相手責務の欠落が確認されない限り、未解消扱いにしない。
- **他にfindingなし**：OS-027→LABO-057を依存と読む循環、全LABO参照元を毎回必須とする解釈、全CONNECT参照を通信実行依存とする解釈、未見model入力を成功扱い/無条件拒否する解釈は、本文の操作条件/negative referenceと整合しない。抽出の字面数だけでは欠陥としない。

## `version_target`・依存区分・権限状態の扱い

同じ機構への言及に「常時必須／特定操作時のみ必須／選択した入力元に応じて必須／参照資料のみ」を一律割当てせず、各本文の条件を確認した。G17-069は有限model rule/units/参照元を常時照合し、価格・rate・expected oracleは選択操作と参照元に応じる。070は033入力受領記録から始まり、040送達とLABO-024受領は計算/送達後の受領記録。071は同一revision/scopeを固定し、070全体の後段受領記録を開始前提にしない。OS-027は該当操作のauthority/security条件を閉じ、performance 不明と実行許可を別に保つ。`version_target:1.0`は実行artifactの版ではない。INTELLIGENCE-L2-022の3.0 training scopeはHARNESS共通契約を参照しても1.0へ移らない。版値不明は不明のまま記し、選択契約を照合しないまま互換不成立とも成功とも判定しない。

## 確認した範囲

8機構の現行main L2本文から、見出し起点の208固有参照元・参照先組、97略記/範囲参照組、418件の機構名のみのoccurrenceを行単位で固定した。17方向すべてについて抽出対象の両端L2契約と対応L11を読み、共通規範・実受渡し・任意/非依存・後続scopeを分類した。別途、見出し外の宣言表にあるHARNESS-L2-001〜009とOS-L2-001〜013の本文表とL11も責務確認した。これは全272 identityのsemantic edge graphを作ったという意味ではない。対応する8件のL11 SHAは表に記録した。

抽出限界は、(1) 22件の表形式identityがheading-bound source inventory外、(2) 418件の機構名だけのoccurrenceにL2 target identityを付けない、(3) `..`同機構rangeなど一部document-level記述を展開しない、である。これらは抽出上の限界として明示し、未解消要求と扱わない。旧runtime/testは実行していない。
## 旧参照元と証跡

以下の旧sourceはinventory-firstの起点として読み、source、consumer、独立評価、未知/未評価の保持を現行責務へ対応させた。旧runtime、test、CIは実行せず、旧schemaや配置方式は移植していない。各asset/path/行/SHAをこの報告に収録する。

| 旧source | asset ID・path・行・SHA-256 | 保持した意味と変更境界 |
|---|---|---|
| FRS requirements | `LEGACY-ASSET-B75E46DBE77592351574`; `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/functional-release-slice-requirements.md`; R-06 89–92, R-13/14 134–142, R-20 190–194, R-23/24 209–217; `eb1a7747afacd607217ee9e1905f87e629354a023102c1f32521ff8a9bc54a17` | 収載/除外、owner、依存閉包、成熟度と構成体受入を分ける。unknown/stale/ambiguousを暗黙包含や局所greenへ丸めない。旧Slice数・旧実装は移植しない。 |
| FRS requests | `LEGACY-ASSET-201EED9C5D6D2FF4D41B`; `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/functional-release-slice-requests.md`; BR-002 28–31, BR-004 38–41, BR-009 64–67; `bf47d434930bd701d368a49b725d49b00a5af2f385b6e1436b294f7b47796e20` | source→影響対象→必要検証、各利用に必要な安全依存閉包、機構単体と複合利用の区別を起点にする。 |
| resident-lane requirements | `LEGACY-ASSET-50CA1C554747F12266D3`; `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/resident-lane-orchestration-requirements.md`; RLO-FR-040 663–666; `17bc83614d7f5f75b61831eb447a23ee706cb8a6d9e54477736e553ff956dcfd` | task-class evidenceを配置材料に使い、未評価を明示し、scoreから権限を作らない。fixed provider/resident runtime/assignment方式は移植しない。 |
| resident-lane acceptance | `LEGACY-ASSET-437A6A68F9A9E0AE1B9E`; `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/resident-lane-orchestration-acceptance.md`; RLO-AC-030 43; `63ac3d0fbc36f014977998f9073846bfc01e5d352e07c1e10d408f0eab0ad707` | 未benchmarked task classを明示し、effortやassignment authorityを推測で更新しない。 |
| design-template JSON authority | `LEGACY-ASSET-4F5A1F0739EC1111D91D`; `archive/legacy-generation-2026-09-14/root/docs/design/helix/L4-basic-design/design-template-json-authority.md`; 23–27, 34–41, 61–91; `e254d995d1d9fbbcc74bb53b3356b4499ac20cca2280eeafde1412d08630c4cb` | 汎用template/構造知識と、選択された製品設計の意味・適用条件・input・traceを分ける。旧JSON schema/runtimeは移植しない。 |
| Bench evaluation requirements | `LEGACY-ASSET-28FB139B26CD61CC51EE`; `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/helix-bench-evaluation.md`; 76–147; `a1a5fea1fb89434fb025a9c0541f5cacb10ac9be66e97e7e7964975d2469b116` | 同一task/scope/oracle/protocolで比較し、failure/intervention/cost evidenceを保持する。 |
| Bench evaluation acceptance | `LEGACY-ASSET-A952A3A175EB82A4781B`; `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/helix-bench-evaluation-acceptance.md`; 30–41; `6b5a72da16fe56130350b6e8b8fc2606cb8c90015ff73f34ffb3b93625a0c185` | 独立評価を保持し、未評価をINTELLIGENCE配置確定やOS権限へ昇格させない。 |

入力は[参照抽出証拠](cross-mechanism-reference-evidence-2026-09-27.json)に収録する。抽出補助はローカルの静的読取りのみで、正式toolではない。正式化時に暫定worktree比較と古い先行メモを除去し、字面marker・略記のfield名と後続版の表示を修正した。source/target/path/行/原文は保持した。変更内容と元snapshot digestは証拠の `extraction_limits` に記録する。

## 作成側の検収・先行PRの統合確認

GPT6 Luna high Workerが照合資料を作り、別Workerが抽出の原文・ID・SHAを検査し、Codex executionが原文、疑義の処置、既存受入との対応を検収した。これはClaudeの独立reviewとは別である。

抽出検収では単一行のmarkerを別義務へ伝播する問題を見つけたため、markerは字面の手掛かりに限定した。例：HARNESS-L2-025のline549で、常時必要なconnector契約と、Pattern選択時の030 receiptを区別する。送信時のauthorityと純粋な互換照合、後段receiptと開始前入力も本文で区別した。

[先行16 PRの統合記録](mechanism-review-closure-2026-09-27.json)は、8機構の監査PRと消化PRのexact HEAD・merge commit・merged状態を固定する。各mergeの第1親とreview HEADのmerge-baseからHEADまでの全PR差分を列挙し、変更対象の全blobをmerge後treeと比較した。最後のcommitだけの比較ではない。全16 PRが基準mainの祖先で、全変更blob一致を確認した。採否・実装完了の証明にはしない。

静的検証：scfctl 142 binding fail=0 / stale=0 / residuals=0 / selftest 69 fail=0。現用研究validator137件は105 pass・既知32 failで、変更前baselineと各pathのreturncode一致。govcheck、gen_rulebook --check、govcheck_selftest、差分空白検査、相対リンク、source SHAと引用全文の照合を行った。旧CI・旧hook・旧runtime・旧CLIは実行していない。

C1〜C4は要求修正findingではなく誤読を除く照合記録、U1/U2も非findingである。次の消化PRは各所見のNOCHANGE根拠と、独立reviewで追加された実findingがあればその修正を対応付ける。要求を無理に変更せず、監査所見の処置記録を閉じて総合検証と8機構のPO確認へ進む。本監査のmergeは要求の採択を生成しない。

## R2195-01：責務の重複・空白の点検追補

独立reviewで、参照のある接続だけの照合では、参照し合わない機構の二者所有や上位機能の担当漏れを確認できないと指摘された。指摘を受け、[責務所有・利用の監査](cross-mechanism-responsibility-audit-2026-09-27.md)と[Concept/L1からの空白照合](cross-mechanism-responsibility-coverage-2026-09-27.md)を追加した。前者は要求意味、検証義務、権限、知識、現在判断、比較、実行、接続、実資源、証拠、改善の出力別に8機構の所有・利用を照合し、後者は相互参照の有無によらず上位機能のL2所有先を確認する。

特にINTELLIGENCE-L2-011、LABO-L2-055/059はPO原文と既存L1/L2/L11、旧AAFD-BR-04まで照合した。INT011の領域・能力別適性比較、LABO055の履歴作業水準、LABO059の改善効果の出力を分け、059が011の比較契約を使う明文と不足時の戻し先を確認した。所有の移管や新しい機構は不要と判定する。

追加した範囲でも要求本文の変更を要する重複・空白は確認しなかった。R2195-01への対応は監査方法と根拠の不足を埋めるものであり、C1〜C4/U1/U2は引き続き非findingの照合記録である。要求本文の実装・採択・旧source全atom移管の完了は主張しない。
