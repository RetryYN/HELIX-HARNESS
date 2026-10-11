# テンプレート作業の分担と読取り入口

## 現在の分担

本書は旧HARNESS一括所有の作業を、既決の責務へ割り当て直す案内である。要求意味・採択・実装許可の正本はConcept、対象別L2/L11、PO判断記録であり、本書やticketから生成しない。確認baseは`6fa0f253442fd74ea7cec1124439334a6d477471`。現行L3以下は10/10巻き戻しで停止している。

| 作業単位 | ownerと対象 | 渡すもの | 現在許可される整理 |
|---|---|---|---|
| 汎用テンプレート | BRAIN。DST-HARNESS-002/005、DST-OS-001の汎用版・状態 | 意味契約・版・適用条件・seedの汎用構造 | 旧source/実例/seedを読み、既存BRAIN要求と候補の意味・対oracle・採否の対応を整理する |
| 製品要求への適用 | HARNESS-CORE。DST-HARNESS-001/003/004/006/007、DST-OS-005の停止・Backflow意味 | 製品固有の設計義務、適用/N/Aの意味、欠落入力のBackflow、変更影響 | HARNESS-L2-009/008と対L11に接続し、汎用構造と製品固有の意味を分けて要求整理する |
| 案件の適用記録・運転 | OS。DST-OS-001のproject exact set/版、003の適用・義務・N/A・Backflow・結果、004の候補登録/振分、005の適用 | 同じ因果関係の対象・revision・版・適用結果・候補の記録 | OSの既存登録・provenance・推進責務と候補を照合し、HARNESS/BRAINの意味を再定義しない |

DST-OS-002の選択は、HARNESS要求エンジン・BRAINパターン・INTELLIGENCE稼働判断の接続として扱い、単独ownerへすべてを割り当てない。改善はOSが候補を登録・振り分け、LABOが効果と退行を評価し、評価を経た汎用パーツをBRAINへ返す。LABO評価・INT提案・OS受領から採択を生成しない。

## 発行した作業指示

- 汎用構造の要求整理: `FT-BRAIN-TEMPLATE-REVIEW-001`
- 製品適用・Backflowの要求整理: `FT-HARNESS-TEMPLATE-REVIEW-001`
- exact set/版/結果・改善接続の要求整理: `FT-OS-TEMPLATE-REVIEW-001`

旧FT-HARNESS-DESIGNTPL-001とFT-OS-DESIGNTPL-001は過去の発行記録として保持する。既存seedはscaffoldのauthority状態とBindingを保持し、一括で物理移動・正式昇格しない。L3再開後の設計・実装作業は、POが定める順序・範囲と必要な上流状態から再構成する。

## 根拠と旧source対応

[Concept](../concept/helix-concept.md)、[9/25 PO指示](decisions/brain-helix-core-po-intent-2026-09-25.md)、[現行候補の担当表](../helix-brain/candidates/design-template-system-requirements.md#現行conceptに照らした担当)、[HARNESSの適用境界](../helix-harness/L2-requirements/product-requirements.md#design-templateと要求backflow)。担当表は配置の読み替えであり、候補の採用ではない。

旧`archive/legacy-generation-2026-09-14/root/docs/design/helix/L4-basic-design/design-template-json-authority.md:19–46`のJSON意味契約・ID/版・生成view・適用判定・portfolio・pairの役割を保持する。旧HARNESS一括所有から、9/25判断に沿い汎用構造BRAIN／製品固有適用CORE／案件運転OSへ分ける。理由は製品をまたぐ知識と製品固有の意味・実行事実のowner分離であり、旧source不在を理由に新たな機構や承認手続を加えない。

## JSON正本と現在の材料

JSONを意味正本とし、Markdown/HTMLを生成viewにする既決方針を用いる。機械が扱うID、版、適用条件、必須input/section/field、relation、owner、negative oracle、measurement、completion、supersessionの意味はDST-HARNESS-002にある。説明・判断理由はJSONのidentityへ結び付ける。意味ownerは上の担当表のままとし、OSの保存成功や表示viewの編集から意味の更新を生成しない（HELIXOS-L2-053と対L11の正本・投影の負例）。

ここで整理するのは要求と材料の対応である。既存seedのMarkdown表は候補材料として保持する。JSONへの変換だけでseedを採択せず、正式schema、registry、generator、L3以下の成果物は本書で作らない。schemaやfieldの型・演算子は、再開後の対象要求・対の検証から具体化する。

## DST候補12件と対象要求・受入の対応

出典は[design-template-system候補](../helix-brain/candidates/design-template-system-requirements.md)の全12行。以下は既存要求への照合先であり、DST候補が採択済み、または既存要求で全条件を被覆済みという判定ではない。既決の意味を繰り返し承認待ちにせず、template固有条件の不足と候補の採否を分ける。

表中のBRAIN/OS/INT/LABO番号はそれぞれ`HELIXBRAIN-L2-`/`HELIXOS-L2-`/`HELIXINTELLIGENCE-L2-`/`HELIXLABO-L2-`、HARNESS番号は`HARNESS-L2-`。対L11は下の読取り入口で同じidentityの受入を照合する。

| DST候補 | 整理を持つIssue・owner | L2と対L11の照合先 | 保持する条件・残る照合 |
|---|---|---|---|
| DST-HARNESS-001 | #2842 CORE（選択の接続は#2843） | HARNESS009/023、BRAIN019/022/030 | kind/subject/risk/domain/layer/pairから選ぶexact set。知識receiptの受領と適用義務の充足を分ける |
| DST-HARNESS-002 | #2841 BRAIN | BRAIN003/007/008/028、HARNESS010/011 | 上記の全契約項目、汎用版/状態と実利用版の区別。Pattern契約との共通部分だけでtemplate固有completion/supersessionを被覆済みにしない |
| DST-HARNESS-003 | #2842 CORE | HARNESS009/025/026/040/056 | unit/connection/compositeごとの義務と要求→義務→設計→対oracle。単体の和で接続/構成体を成立扱いしない |
| DST-HARNESS-004 | #2842 CORE | HARNESS008/009、BRAIN022/030 | missing inputを質問/矛盾/要求候補/N/A候補へ返す。field定義欠落と定義済みfieldの値未決を区別し、AIの補完で閉じない |
| DST-HARNESS-005 | #2841 BRAIN | BRAIN007/008/018/020/025、HARNESS009 | seedの出典/採否/適用範囲/限界/負例。26件の存在を全件採用や正式registry成立としない |
| DST-HARNESS-006 | #2842 CORE | HARNESS003/009/023 | required/conditional/N/A/unresolvedと理由/判断者/revision/再評価条件。L2.5の非適用条件を全templateの採択根拠へ流用しない |
| DST-HARNESS-007 | #2842 CORE（運転は#2843） | HARNESS004/009/010/011、OS002/019 | template更新のsemantic impact、影響する義務/成果/検証と旧版stale。filename/digest更新だけで移管完了にしない |
| DST-OS-001 | #2841 BRAIN・#2843 OS | BRAIN008/028、HARNESS010/011、OS001/002/007/019 | generic template revision/stateはBRAIN、project exact setと使用版はOS。共通pack contractを再定義しない |
| DST-OS-002 | #2842 CORE・#2843 OS | HARNESS008/009/023、BRAIN019/022/030、OS017/023、INT019/032/033/035 | 要求engine・BRAIN候補・INTELLIGENCE判断の接続。各端のidentity/revision/receiptとunknown/conflictを保持し、OSが適用規則を作らない |
| DST-OS-003 | #2843 OS | OS002/007/019/023、HARNESS004/009 | 同一因果関係の適用/義務/消込/N/A/Backflow/成果/finding/再作業/受入/運用結果。登録件数やcheckboxで義務充足を代行しない |
| DST-OS-004 | #2843 OS（知識側は#2841） | OS005/024/025、BRAIN018/020/025、LABO022/034/037 | 観測と候補の登録/振分→LABO効果/退行評価→BRAIN知識候補。評価/受領だけで汎用知識を昇格しない |
| DST-OS-005 | #2842 CORE・#2843 OS | HARNESS003/008/009/023、OS004/017/023 | missing/unregistered/stale/conflict/input欠落時の停止/Backflow意味をCORE、適用・記録をOSに保つ。非適用は理由付きN/Aと区別し、未知を任意templateへのfallbackにしない |

### 対象L2/L11の読取り入口

- [BRAIN L2](../helix-brain/L2-requirements/brain-requirements.md)／[L11](../helix-brain/L11-acceptance/brain-acceptance.md): 知識の構造・出所・版・状態、候補提供、required input/義務の双方向trace、独立評価/採否。
- [HARNESS L2](../helix-harness/L2-requirements/product-requirements.md)／[L11](../helix-harness/L11-acceptance/product-acceptance.md): template適用、Backflow、6 pair、検証義務、影響、packの版/互換。005/022/034/036/040/043/049/056の検証条件もseedの照合先とする。
- [OS L2](../helix-os/L2-requirements/governance-requirements.md)／[L11](../helix-os/L11-acceptance/governance-acceptance.md): 登録・因果trace・ticket・検収・改善接続。意味契約をOSへ移さない。
- [INTELLIGENCE L2](../helix-intelligence/L2-requirements/intelligence-requirements.md)／[L11](../helix-intelligence/L11-acceptance/intelligence-acceptance.md)、[LABO L2](../helix-labo/L2-requirements/labo-requirements.md)／[L11](../helix-labo/L11-acceptance/labo-acceptance.md): 稼働判断の候補と評価を、template選択の接続および改善の材料として照合する。採択や実行権限の代替にしない。

## seed26件の適用対象と照合先

対象は[DT-SDOP 7件](../../scaffold/research/design-template-seed-sdop-20260929/README.md)、[DT-VT 13件](../../scaffold/verification-test-template-seed-20261001/README.md)、[DT-MSG 6件](../../scaffold/research/design-template-seed-minimum-gap-20261004/README.md)。全件`0.1.0-seed-candidate`で、Bindingとauthority状態は各READMEを読む。

各行は製品の要求へ適用するための材料の索引である。HELIX自身のSECURITY/CONNECT/INFRASTRUCTURE要求を、一般製品向けseedに取り込んで必須化しない。各製品の要求revisionとseedの適用条件を合わせて選び、値・技術・権限をseedの例から決めない。

共通照合はDST-HARNESS-002/005/006とBRAIN003/007/008（汎用契約・来歴・状態）、HARNESS009（製品適用）、OS007/019（実利用の記録）。下表の追加照合先はすべてHARNESS-L2。全件を一括で必須にする表ではない。

<!-- HELIX:template-seed-alignment:start -->
| seed | 適用する対象 | 追加のL2/L11照合先 | 範囲・注意点 |
|---|---|---|---|
| [DT-SDOP-001](../../scaffold/research/design-template-seed-sdop-20260929/templates/DT-SDOP-001-logging.md) | 稼働中に動作記録を出す実行物 | 009/034 | 秘密の複製を避け、保存の値は対象要求から。静的成果物は理由付きN/A |
| [DT-SDOP-004](../../scaffold/research/design-template-seed-sdop-20260929/templates/DT-SDOP-004-logic-design.md) | 業務規則・状態・副作用を持つunit/connection | 009/015 | MSG-004と同じ条件の正本を二つに作らず行を参照 |
| [DT-SDOP-006](../../scaffold/research/design-template-seed-sdop-20260929/templates/DT-SDOP-006-aws-foundation.md) | AWSを選んだ案件の初期設計 | 009/023 | AWS以外はN/A。Web展開後の項目を1.0へ前倒ししない |
| [DT-SDOP-005](../../scaffold/research/design-template-seed-sdop-20260929/templates/DT-SDOP-005-dependencies.md) | 外部library/API/runtime等への依存・更新 | 004/009/023 | packの場合だけ010/011も照合。設定例のauto-mergeは採らない |
| [DT-SDOP-002](../../scaffold/research/design-template-seed-sdop-20260929/templates/DT-SDOP-002-nonfunctional.md) | 稼働・運用するunit/compositeの非機能・運用 | 009/034 | 値の出所を要求に結ぶ。PoCの深さ/非適用を別に判定 |
| [DT-SDOP-007](../../scaffold/research/design-template-seed-sdop-20260929/templates/DT-SDOP-007-design-review-quickcheck.md) | 適用済みSDOP項目の設計review | 009/043 | 最低限の問い。回答済みを設計完成・要求充足としない |
| [DT-SDOP-003](../../scaffold/research/design-template-seed-sdop-20260929/templates/DT-SDOP-003-maintainability-runbook.md) | リリース後の保守・監視・復旧手順 | 009/022/034 | SLO・担当・復旧条件を対象要求から。非稼働成果物はN/A |
| [DT-VT-102](../../scaffold/verification-test-template-seed-20261001/templates/DT-VT-102-l2-l11-user-acceptance.md) | L2/L11の利用者受入 | 003/005/022/040/056 | P2。該当L2.5結果と反映後の要求revisionを受入入力へ結ぶ |
| [DT-VT-006](../../scaffold/verification-test-template-seed-20261001/templates/DT-VT-006-poc-verification.md) | L2.5のPoCとPrototype | 003/012/024 | 別々に適用を判定し、結果をBackflowでL2へ戻す |
| [DT-VT-104](../../scaffold/verification-test-template-seed-20261001/templates/DT-VT-104-l4-l9-integration.md) | L4/L9の境界・コネクタ照合 | 005/022/040/056 | P4。両端成功だけで接続成功としない。本番chaosは別範囲 |
| [DT-VT-101](../../scaffold/verification-test-template-seed-20261001/templates/DT-VT-101-l1-l12-operation-value.md) | L1/L12の価値・運用評価 | 003/005/022/040/056 | P1。local証拠と本番観測を区別。canary/chaos等を1.0必須にしない |
| [DT-VT-004](../../scaffold/verification-test-template-seed-20261001/templates/DT-VT-004-verification-design.md) | 要求/要件の検証方式・マトリクス | 004/005/034 | 主にL2/L11・L3/L10。開始/完了基準は対象契約へ結ぶ |
| [DT-VT-005](../../scaffold/verification-test-template-seed-20261001/templates/DT-VT-005-screen-verification.md) | 画面・UI実装・画面Prototype | 003/036/049 | 画面ありの5軸をN/Aにせず、device/viewport/oracle版を保持 |
| [DT-VT-105](../../scaffold/verification-test-template-seed-20261001/templates/DT-VT-105-l5-l8-detail-conformance.md) | L5/L8の詳細契約照合 | 005/022/040/056 | P5。事前/事後/不変/失敗/巻戻しの契約を対へ結ぶ |
| [DT-VT-106](../../scaffold/verification-test-template-seed-20261001/templates/DT-VT-106-l6-l7-tdd-closure.md) | L6/L7のTDDの閉じ | 003/015/022/040/056 | P6。実装前test/oracle凍結と意図した欠陥検出のRedを照合 |
| [DT-VT-002](../../scaffold/verification-test-template-seed-20261001/templates/DT-VT-002-test-technique-cards.md) | C01〜C40をカード単位で選ぶ | 005/034 | 技法数・coverage率・mutation閾値を要求値として新設しない |
| [DT-VT-003](../../scaffold/verification-test-template-seed-20261001/templates/DT-VT-003-technique-selection-proposal.md) | 変更/risk/対/境界から技法を選ぶ提案 | 005/022/034 | 早見表は候補であり、固定の選定規則・merge gateではない |
| [DT-VT-001](../../scaffold/verification-test-template-seed-20261001/templates/DT-VT-001-common-evidence.md) | 技法・pairの共通証拠と非適用理由 | 003/005/034/056 | 対象revision・oracle・実体・結果を結ぶ。単独の合格証拠にしない |
| [DT-VT-007](../../scaffold/verification-test-template-seed-20261001/templates/DT-VT-007-ai-output-verification.md) | AIが作ったcode/設計/文章/data等 | 005/034/043 | 製品成果の検証とLABOのWorker/model比較を区別 |
| [DT-VT-103](../../scaffold/verification-test-template-seed-20261001/templates/DT-VT-103-l3-l10-system-verification.md) | L3/L10の総合検証 | 005/022/040/056 | P3。構成体の義務を照合。現在はL3以下停止中 |
| [DT-MSG-003](../../scaffold/research/design-template-seed-minimum-gap-20261004/templates/DT-MSG-003-permission-privacy-external-interface.md) | 操作権限・privacy・外部interface | 004/009/023 | 適用節を分け、権限・法令解釈・保持値を創作しない。VT-103〜105へ |
| [DT-MSG-002](../../scaffold/research/design-template-seed-minimum-gap-20261004/templates/DT-MSG-002-data-migration-rollback.md) | 永続data・schema・migration/rollback | 004/009/023 | unit/connection、複数storeはcomposite。不可逆な損失をAIが許可しない |
| [DT-MSG-006](../../scaffold/research/design-template-seed-minimum-gap-20261004/templates/DT-MSG-006-design-testability.md) | 設計時の観測/制御/oracle出所/失敗到達 | 005/009/034 | 設計のtestabilityからVT-104〜106へ。技法候補の参照前のgateにしない |
| [DT-MSG-001](../../scaffold/research/design-template-seed-minimum-gap-20261004/templates/DT-MSG-001-connection-contract.md) | 境界を越えるdata/操作の辺 | 009/023/040 | connection。方向/所有/版/順序/期限/再送/部分失敗。VT-104/105へ |
| [DT-MSG-004](../../scaffold/research/design-template-seed-minimum-gap-20261004/templates/DT-MSG-004-unit-behavior.md) | 振る舞いを足す/変える単体 | 009/015 | unit。入出力/副作用/失敗/回復、SDOP-004参照。VT-105/106へ |
| [DT-MSG-005](../../scaffold/research/design-template-seed-minimum-gap-20261004/templates/DT-MSG-005-composite-architecture.md) | 複数単体・接続を組んだ全体 | 009/025/026 | composite固有の義務・全体の部分失敗を保持。VT-103/104へ |
<!-- HELIX:template-seed-alignment:end -->

### DT-VT-002の40技法カード

C01〜C40は26件とは別の内訳であり、40個の必須templateではない。各カードの適用/N/A、入力、主な対、oracle・限界を保持し、HARNESS005/023/034とDT-VT-003の提案を照合する。coverage、snapshot、単発benchmark等を単独の合格oracleへ格上げしない。

| カード | 照合する領域 | 追加のHARNESS-L2照合先 |
|---|---|---|
| C01〜C03 | review、双方向trace、静的解析/型/schema | 004/043 |
| C04〜C08 | 同値/境界、決定表、状態、組合せ、ATDD/BDD | 005/034 |
| C09〜C12 | coverage診断、mutation、TDD、単体/double | 003/015/034 |
| C13〜C18 | property/model/metamorphic/differential/golden/snapshot | 034/043 |
| C19〜C21 | consumer contract、実依存結合、system/E2E | 022/040/056 |
| C22〜C26 | visual/accessibility/表示計測/検査器精度/利用者受入 | 003/036/049 |
| C27〜C29 | fuzzing、障害注入、並行/crash/soak | 034。localと本番の範囲を区別 |
| C30〜C33 | 性能、trace観測、canary/rollback、運用評価 | 034/022。C32はWeb配備後で1.0非必須 |
| C34〜C35 | flaky隔離、依存更新 | 005/034/036 |
| C36〜C40 | 独立review、hidden test、rubric、反復、汚染 | 034/043。LABOのWorker評価と製品の受入を区別 |

## Issueごとの具体的な残作業

3件へ上の対応表を作業projectionとして結ぶ。immutable ticketは変更しない。本整理の完了と、候補の採用・seedの正式化・下流設計の完了は別である。

| Issue | この整理で対応付けたもの | 残る結果と確認の観点 |
|---|---|---|
| [#2841](https://github.com/RetryYN/HELIX-HARNESS/issues/2841) | DST-HARNESS-002/005、DST-OS-001汎用部分、26seedと40cardの来歴/状態 | 既存要求で保持できる各条件、template固有の不足/候補採否、選択seedの採用/保留/除外理由を対象revisionへ結ぶ。候補の担当表・JSON変換・材料の存在を採択証拠にしない |
| [#2842](https://github.com/RetryYN/HELIX-HARNESS/issues/2842) | DST-HARNESS-001/003/004/006/007、DST-OS-002/005意味、seed適用/6 pair | 要求→選択条件→義務→対oracleの正常例・負例・unknownを対応付ける。field定義/値未決を区別し、N/A理由欠落・stale・unit成功によるcomposite成立を拒否する。DT-VT-003の早見表や各seedの例を新しい必須gateにしない |
| [#2843](https://github.com/RetryYN/HELIX-HARNESS/issues/2843) | DST-OS-001 project部分、002接続、003/004/005運転 | 使用exact set/版・対象scope/revision・判断理由・未充足義務・Backflow/結果・改善先を既存OS受入へ結ぶ。version mismatch、receipt欠落、未ack、部分成功、別scope結果の混入を識別し、評価や登録から採択を作らない |

要求・候補の具体化を進めるときは、既決意味への追随と追加/意味変更を切り分けて一要求identityずつ扱う。人が持つ意味やauthorityモデルが要求する採否は、その差分の対象revisionを示す。今回の対応表を理由に追加承認手続きや下流再開gateを作らない。

旧sourceの生成view/意味契約・portfolio・pairの役割を保持し、[旧ddd-tdd-rules 21〜24行](../../archive/legacy-generation-2026-09-14/root/docs/governance/ddd-tdd-rules.md)の契約先行・欠陥検出としてのRedも、現行003/015と対L11の実装前oracle凍結へ照合する。seedの時系列例だけで要求の意味を変更しない。DT-MSGの束ね方は各seedが記録する新規案、SDOP/VTの外部資料やZIPは参照材料のまま保ち、旧資産の完全一致再利用や正式移管の証拠とはしない。

## 条件照合の結果と要求側の未完範囲

確認baseは`9e39ff8f83105f70cb58fb3b940596428e3f0b71`。[条件照合記録](audits/template-condition-review-2026-10-10.json)にDST12件の要求・確認結果を44の条件群として保存し、各候補の正常・負例・unknown、比較先L2/L11、既存保証と固有の未確認範囲を記録した。旧§1の6surface、§2の6componentも原文行digest・現行owner・L2/L11比較先・保持意味・未完範囲へ一項目ずつ結んだ。26seedは本文digest・適用条件の所在・候補状態・保全理由へ結んだ。これは全seed本文の完全atom化や採用、全旧sourceの移管監査ではない。

MPRと判断記録を照合した結果、DST identityそのものの仮登録・対象revision付き採否は確認できなかった。BRAIN-L1の判断にあるDST-HARNESS-002/DST-OS-001への言及は企画の根拠であり、DSTのL2採否ではない。比較先の採択済み要求はその対象decisionのまま保持し、DSTが未採択であることを理由に未採択へ戻さない。

| 比較した条件 | 現行の保証と追加採用 | 要求・候補側に残るもの |
|---|---|---|
| 汎用意味契約と版 | BRAIN003/005/007/008/028に加え、032の15項目意味契約を[10/10判断](decisions/brain-template-contract-032-po-decision-2026-10-10.md)で採用（PR #2851）。041の消費側契約だけで提供側を代替しない | 各seedの具体的section/field/owner/measurement/completionと汎用契約の対応、seed対象revisionと採否。032の採用は全seed完成ではない |
| 初期seed | 26候補原文を保全。SEEDFIRSTの非画面・技術的不確実性なしの限定知識を[10/10判断](decisions/seedfirst-knowledge-po-decision-2026-10-10.md)で採用し、[BRAINのJSON](../helix-brain/knowledge/requirements-acceptance-template-knowledge.json)へ配置。VT001/102とC01/C02/C08/C26の内容に限る | 全体の最小set、画面/PoC/他pair/3kind、未選択候補/cardの意味と採否。候補全体の昇格/retire、実受入を生成しない |
| 製品への適用と戻し | 009のexact set/各判定と義務/不足/意味影響・templateごとのN/A4属性を[10/10追補判断](decisions/core-template-009-supplement-po-decision-2026-10-10.md)で採用（PR #2853）。008/025/026等の責務と既決1.0を保持 | 選択seedと製品値の対応、判定/義務の実際の成立証拠。旧型/algorithmやpair/portfolio/renderer固有bindingの全移管は別。要求採用から実行済みにしない |
| 案件記録・選択・改善接続 | 002の候補/選択/使用set、各eventの要求revision/scope/義務への結合、LABOへの評価入力範囲/未観測追跡を[10/10追補判断](decisions/os-template-trace-002-supplement-po-decision-2026-10-10.md)で採用（PR #2855）。評価方法/母集団/測定定義はLABOのまま | 実案件の使用版/原記録と未完義務受理・接続成立、LABO評価/BRAIN採否。記録の要求採用だけで実利用/評価成立を生成しない |

現在の採用準備は[seed照合記録](audits/template-seed-adoption-readiness-2026-10-10.json)（base `37a7a23ec130abd768fd1a9082156a48a332fc09`）に分けた。上の先行auditは当時の証拠として変更しない。DST identityそのものをまとめて採用したことにはせず、032/009/002の各decisionが固定した差分だけを採用済みとして読む。

SDOP/VTのREADMEは未採択seedをMarkdownで持つ理由を「schemaはL3以降で選ぶ」としている。参考資料の保持には適用できるが、正式採用するtemplateの意味正本までMarkdownにする根拠にはしない。既決のJSON正本方針と032に従い、意味内容のJSON候補とsource対応を整理し、schema/型/演算子/renderer/runtimeの下流選定を分ける。具体的なJSON構造やseed集合を本書で決定しない。

[最初の要求例](requirements-first-roadmap.md#一つの要求例による初回の接続照合)は、申請の承認後編集拒否について知識→設計単体/構成体→ticket→Worker→検収→Backflowの経路と戻し先を示す。各候補の正常・負例・unknownは上記監査の比較例へ結ぶ。いずれも静的な意味照合であり、実在案件のL3承認、選択template、実行receiptを供給したことにはしない。

要求側の未完範囲は既存ロードマップ#2846へ保持する。SEEDFIRSTの限定知識内容は上の判断に従い採用済み。次は全体の最小選択setと、画面/PoC/他pair/3kindを含む残りの意味内容・source対応・対象revision採否を具体化する。安全/資源/計測、内部更新/復旧・支援/改善循環の要求照合は#2846へ残す。実記録・接続・評価の成立確認を、要求段階の採用や終了から生成しない。DST12件を無条件にまとめて採用する案、schema/runtime/registryの新設、L3再開は本照合から生成しない。

#2841〜#2843のimmutable ticketは要求整理・比較・不足の区別を指示しており、候補/seedの正式昇格を含まない。closeはticket本文の全作業と本照合の不足保全を、review結果・mergeとは別に確認して判断する。担当の扱いは[現行運用](github-upstream-operating-model.md#review判断merge-admission)の作成側のclose制限と、対応Issueの完了条件を別に確認する条項に従う。本照合から担当の変更や新しいclose手続きは作らない。closeした場合も上記未完範囲、#2846、候補状態とScaffold Bindingは残り、要求段階全体の完了にはしない。確認が不足していれば元IssueをOPENのまま保つ。

## 選択した初回対象へのseed適用条件の照合

[初回対象のPO選択](decisions/first-development-target-selection-po-decision-2026-10-11.md)（BRAIN032→CORE009→OS002と必要周辺入力）へ26候補の契約条件を当てる。[固定照合記録](audits/first-target-template-applicability-2026-10-11.json)は各原文のpath・行・全文/行digest、適用条件・必須入力・kind/pair・限界と未完入力を記録する。これは**知識候補の関連性の照合**であり、案件のrequired/conditional/N/A/unresolved判定、採用や使用exact set、全体の最小集合の確定ではない。

| seed | 現在の扱い | 初回対象との関係 | 未確定入力・境界 |
|---|---|---|---|
| DT-SDOP-001 | 後続設計候補 | OS案件原記録と各実行物の動作記録を区別 | 記録consumer・分類・出力環境・保持根拠 |
| DT-SDOP-002 | 後続設計候補 | 循環と単独稼働unitの非機能条件 | 重要度・規模・環境・要求値と測定法 |
| DT-SDOP-003 | 後続設計候補 | 内部利用開始後の更新・復旧運用 | SLO・体制・更新/戻し手段・backup対象 |
| DT-SDOP-004 | 後続設計候補 | CORE判定とOS状態/副作用の規則 | 要求の規則・state・失敗、MSG004との参照行 |
| DT-SDOP-005 | 後続設計候補 | 意味処理runtime・外部境界の依存 | 実依存集合・自製範囲・更新owner |
| DT-SDOP-006 | 条件未決 | AWS選定時だけ照合。現在AWS選択はない | 実行基盤の選定。非AWSのN/A4属性は案件で記録 |
| DT-SDOP-007 | 後続設計候補 | 選択SDOPの設計review | 対象設計と適用SDOP集合。単独で充足判定しない |
| DT-VT-001 | 限定採用あり | 要求/受入はSEEDFIRST限定。全pairの共通候補は保全 | 各要求revision・成果・pair・oracle。単独使用しない |
| DT-VT-002 | 限定採用あり | C01/C02/C08/C26だけ限定採用。残り36cardは候補 | cardごとのinput/risk/適用根拠。全40cardの採用ではない |
| DT-VT-003 | 準備で照合する候補 | 選択対象の変更種類・risk・pairから技法候補を比較 | risk根拠・触る辺。早見表を必須gateにしない |
| DT-VT-004 | 準備で照合する候補 | L2要求の検証方式・pair・case/oracleの知識を比較 | risk・非機能値/測定法。正式L3/L10は停止 |
| DT-VT-005 | 非画面scopeでは未選択候補 | PO選択の非画面対象。UI拡張時に再照合 | 案件の非画面根拠・判定者/revision/再評価条件は未記録 |
| DT-VT-006 | 条件未決 | Prototypeは非画面条件、PoCは技術的不確実性を別判定 | 要求ごとの成立性・期限・不確定要素。非画面だけでPoCをN/Aにしない |
| DT-VT-007 | 準備で照合する候補 | AI生成の知識/適用案/記録材料の検証 | 成果revision・model/prompt版・対の要求。採用/受入をAI採点で生成しない |
| DT-VT-101 | 運用評価に残す候補 | L1/L12価値/運用還流の義務を保持 | 価値仮説・成功指標・適用SLO/Release条件。今の実行入力ではない |
| DT-VT-102 | 限定採用あり | 非画面・技術的不確実性なしの要求/受入知識のみ | L2/L11固定revisionとPrototype/PoC別判定。実受入は未実施 |
| DT-VT-103 | 後続対検証候補 | L3/L10の固有義務と下位証拠/組合せを比較 | kind/pair照合、再開後の承認L3、検証時の下位receipt |
| DT-VT-104 | 後続対検証候補 | BRAIN→CORE・CORE→OS等の辺の検証観点 | kind/pair照合、境界仕様・connector契約 |
| DT-VT-105 | 後続対検証候補 | 詳細契約・state・不変条件・失敗/回復 | kind/pair照合、凍結対象設計・oracle |
| DT-VT-106 | 後続対検証候補 | 実装前Red→最小実装→Greenの知識 | kind/pair照合、凍結設計・先に定義するtest/oracle。今は実行しない |
| DT-MSG-001 | 後続設計候補 | BRAIN→CORE・CORE→OS・Backflow各辺 | 各端owner/revision/互換・data意味・方向・期限/再送。実装形式未定 |
| DT-MSG-002 | 後続設計候補 | knowledge/案件原記録の永続化と更新/復旧 | 意味owner・before・保持/削除・loss判断。構造変更の有無で節を判定 |
| DT-MSG-003 | 後続設計候補 | 読取/write/実行を別actor/操作として安全境界へ | 権限・data目的/分類・保持/外部consumer。節ごとに条件を照合 |
| DT-MSG-004 | 後続設計候補 | BRAIN032/CORE009/OS002各単体の入出力/失敗 | 要求/受入・意味・期待失敗/回復。SDOP004と二重正本にしない |
| DT-MSG-005 | 後続設計候補 | 三単体と複数辺による循環固有の義務 | 全体成果・各owner/辺・部分成功時の期待。値はSDOP等を参照 |
| DT-MSG-006 | 後続設計候補 | 設計段階で観測/制御/oracle出所/失敗到達を比較 | MSG/SDOP設計の宣言行と右側case。L1/L2 review開始gateにしない |

限定採用の3行も、VT001/102とC01/C02/C08/C26の**非画面・技術的不確実性なしの要求/受入知識**に限る。全card・他pair・schemaへの採用拡張ではない。非画面の選択だけでPoCを不要にせず、技術的不確実性を要求ごとに戻して照合する。AWS・画面の未選択候補もretireせず、案件のN/Aには理由・判定者・対象revision・再評価条件が要る。

### kindとpair、検証inputの時点を分ける

VT002の契約表はkindをpairから読む記述を持ち、VT103はcomposite、104はconnection、105/106はunitを主な検証観点にする。一方、既決HARNESS008/009/005は要求identityごとの単体・接続・構成体の義務を持つ。主な観点の索引を排他的な適用条件へ読み替えると、初回主単体のL3/L10などの義務が漏れるため、採用候補の15descriptorと義務を照合する。現時点で全seedの意味矛盾や新規templateの必要を断定せず、pairとkindの各原文条件を保全する。

VT103の下位証拠receiptは右側検証を始める入力であり、今の知識比較や左側要求形成前に供給する実装証拠ではない。MSG006の設計testabilityもL1/L2 reviewや技法候補選定の開始条件にしない。凍結前にoracleの意味を準備することと、実行後に証拠を得ることを区別する。

旧JSON authority:19–60の意味/表示・適用・portfolio・pair、旧verification phase:28–40/73–79のbasis/condition/evidenceを起点にした意味再導出である。旧gate、schema、test/CIを現行へ移植しない。10/10で失敗したseed不使用と件数/hashだけのreviewを繰り返さず、全section/fieldの意味被覆と未完を次の比較で確かめる。今回の表では全26本文atom、40card採否、15descriptorの完全性、6surface/6component移管を証明しない。

次は候補ごとのsection/field・負例・measurement/completionを既決032へ対応付け、必要な知識の対象revisionを提示する。案件値、接続依存、初回配置根拠は#2846へ残し、環境条件は#2905へ結ぶ。既決の意味を再承認待ちにせず、知識内容の追加採用と下流設計・L3再開は別に扱う。

## 初回の3kindに対応する意味JSON候補

[MSG001・004・005の意味候補](../helix-brain/candidates/first-cycle-design-template-knowledge.json)をBRAIN配下へ置く。単体の振る舞い、辺の契約、構成体固有の義務を比較するため、各候補を032の15項目へ対応付けた。原文の同じ候補版・source行/digest・節文脈を保ち、negative oracleとcompletionを欄の存在から区別する。これは要求整理段階の知識候補を起点とし、[MSGCONTENT節](#msgcontent初回要求整理へ採用する意味内容の固定案)の限定意味内容はPOが採用した。運用knowledge promotionは未実施であり、対象の設計instance・schema・型・実装を起こしたものではない。

| 候補 | 具体化した知識と節の適用 | 残る入力・依存 |
|---|---|---|
| MSG004（unit） | 入出力の事前/事後/不変条件、副作用、失敗分類、途中停止と回復、各観点のoracle参照。§1〜5の記入/理由付きN/Aと§6の引渡し | 業務規則/state/冪等性はSDOP004の行を参照。案件値と対caseは未供給 |
| MSG001（connection） | 各辺の方向、data意味/owner、版/互換、順序、期限/再送、冪等、部分失敗/unknownと追跡。§8の追跡は条件付き、§9は適用節ごとの引渡し | SDOP004/002とMSG003/005、VT104/105。timeout/retry値や接続形式は未定 |
| MSG005（composite） | 全体境界、各owner、依存方向、段ごとの失敗/部分成功/不明、全体の不変条件、横断参照と対oracle。下位の和だけで全体を閉じない | MSG001等の辺、SDOPの容量/観測/運用、VT103/104。構成体要求identityと実案件値は未定 |

field locatorは候補内の原文対応であり、正式IDやruntime keyではない。列・記入行・問いと、規範固定行・制約文・例/選択肢を分ける。規範はdescriptorのnormative_rules/source_constraintsへ結び、失敗分類/回復区間や横断参照の規則を来歴だけへ退避しない。欄に併記された規則/選択肢も保持する。未分類行は採用前の意味分類へ残し、各fieldの要否は節の適用と原文条件を保持する。欄の定義を候補として提供できること、製品要求値が未決であること、実際に義務が満たされたことを別に扱う。候補は採用済みの知識に昇格せず、SEEDFIRSTも変更しない。

91fieldのmeaning説明は、各欄が表す対象と区別（例：両端revisionと互換、事前条件と事後条件、部分成功と全体状態、oracle参照と実合格）を原文から具体化した。[変更照合記録](audits/first-cycle-template-field-meanings-2026-10-12.json)は3sourceと91箇所の変更、その他のdescriptor・規範・requiredness・authorityの保持を示す。説明の具体化からfieldの最終適用判定や実oracle束縛の完了を生成せず、案件値未供給と参照先知識の不足を保持する。

22節のobligation_policyを節別の記入内容・理由付き非適用・対caseへの引渡しに分け、91欄のrequirednessをその節と原文の規範/条件へ結んだ。[節別照合記録](audits/first-cycle-template-section-obligations-2026-10-12.json)と[指摘訂正記録](audits/first-cycle-template-section-obligations-2026-10-12-r2.json)に原文・変更範囲を残す。欄種別ごとの元の注意も保持し、列見出しの存在だけで行の記入・条件充足としない。MSG001 §8は結果追跡の必要性で分かれ、§9、MSG004 §6、MSG005 §7は記入した節から検証への引渡しを持つ。節が適用されることだけで全欄を一律requiredへ固定せず、案件の適用/N/A判定と理由・判定者・revision・再評価条件はCORE009へ残す。

| 未完の種類 | 戻し先と次に供給するもの | 知識比較との関係 |
|---|---|---|
| 汎用の定義・条件・関係・対oracleの意味対応が不足 | BRAIN。各field/規範の要否とoracle観点の最終照合、参照SDOP/VTの知識内容・版・採否 | 既存JSONの節/欄だけで完全とせず、不足を持つ知識候補として比較する |
| 定義済み欄の案件値、適用根拠や要求が未決 | CORE009/008。要求revision/scope/axis、候補母集合、製品値と適用判定の根拠 | 製品値を汎用知識へ埋め込まず、値未決を定義欠落やN/Aへ変えない |
| 具体設計・対case/oracle IDと実行証拠が未供給 | HARNESS025/026と対応するpair、OS002の原記録 | 汎用oracle観点と実caseを分け、未来の実行receiptを知識候補提供前の入力にしない。正式L3以下は停止中 |
| 案件の参照版・使用set・記録が不整合 | OS002。候補/選択/使用setの区別、元のrevision/scope/義務と訂正の因果関係 | BRAINの知識採否やCOREの適用判断をOSの保存成功で代替しない |

この区分は既決032/009/002の不足返却と入力時点の説明であり、追加gateや承認手続ではない。知識内容の採否準備は案件値・実行証拠が未供給でも進められるが、選択した操作に必要な要求値やauthorityのunknownを埋めて下流へ進めることはできない。

候補traceに、91欄それぞれの意味照合の問い・検出する取り違えと、VT103〜106原文の観点参照を結んだ。欄とは別の規範固定行・制約も、重複を同じsource行へ束ねた33行として対応する（MSG001の順序/冪等性、MSG004の失敗分類/停止区間/検証観点、MSG005の横断正本/全体固有義務等）。[照合記録](audits/first-cycle-template-oracle-correspondence-2026-10-12.json)に変更範囲と原文・旧source・未完を残す。これは原文の意味を比べる知識候補であり、案件のoracle ID・実case・期待値・実行結果は供給しない。

例えば方向欄は「一方向ACKから逆方向許可を作る」取り違えをVT104の境界へ、停止区間は「外部作用後の完了不明を自動再実行する」取り違えをVT105の契約へ、全体成功は「下位成功だけで全体固有義務を閉じる」取り違えをVT103へ結ぶ。欄/規範の適用範囲で照合し、主kind/pairを排他的な条件にしない。VT候補の参照からVT内容全体の採用や、再開前の検証設計・実行を生成しない。

3件は全体最小集合ではない。他23seed・40cardの残る意味対応と採否、各fieldの要否/意味とoracleの最終照合、参照先knowledgeの不足、旧6surface/component移管を保持する。JSON化だけで完全な15項目や機構成立を宣言せず、不足はBRAIN/CORE/OSの既決責務へ戻す。L3以下の停止は継続し、Issue完了・内部デプロイの許可を生成しない。

## MSGCONTENT：初回要求整理へ採用する意味内容の固定案

[意味JSON候補](../helix-brain/candidates/first-cycle-design-template-knowledge.json)の`adoption_proposal`を固定案とする。対象はMSG001/004/005の3件に限り、各templateのidentity・原候補版・15semantic_descriptorsと、原文の「1.0の境界」「限界」の意味を、今後の要求整理の入力へ採用する案である。2026-10-12、POは[限定採用の判断記録](decisions/msgcontent-knowledge-po-decision-2026-10-12.md)の原文どおり3件の意味内容を採用した。意味JSONは同じファイルで採否範囲と判断参照を更新し、`adoption_proposal`とcandidate metadataは提示時の来歴として保持する。限定採用の効力は判断記録のmain統合時に成立し、運用knowledgeのaccepted/matureへの昇格は行わない。新しい要求identityや版指定は足さず、候補のkey/locatorを正式schemaやruntime keyにしない。[範囲照合記録](audits/msg-content-adoption-proposal-2026-10-12.json)は原文・既決責務・3件共通の15観点を各件へ適用した45項目の値照合、選択payloadとscope制限を示す。[訂正記録](audits/msg-content-adoption-proposal-2026-10-12-r2.json)で、共通観点と個別の値照合を区別し、固定前の参照知識メモが当時の記述であることを明示する。

| 契約項目 | 3件で保持する内容 | 採用案から確定しないもの |
|---|---|---|
| identity・version | 3種を区別し、原候補版とsource revisionを保持 | 新知識版、schema版、案件の使用版 |
| layer/pair・downstream kind | 単体の詳細/実装、辺の境界/詳細、構成体の全体/境界の主観点 | kind/pairの排他的適用、各案件の全義務 |
| applicability | 振る舞いを変える単体、境界を越える辺、複数要素の構成体の条件 | 案件のrequired/conditional/N/A/unresolvedとN/A4属性 |
| required input | 要求/受入、両端契約、全体成果とowner、未決の戻し先 | 製品値、実各端契約、未来receiptの供給 |
| required section/field | 節別義務、欄の意味/要否根拠、固定規範/制約と列見出しだけで充足にしない注意 | 全欄一律required、空表の充足、設計instance |
| relation・meaning owner | SDOP/MSG/VTの参照と二重正本を避ける境界、汎用BRAIN/適用CORE/案件OSの責務 | 参照知識の内容全体・採否、ownerのauthority拡張 |
| trace・negative oracle | 要求から対oracleへの意味対応、失敗/不明/部分成功/単体の和による取り違え | 実case ID、期待値、実行合格、義務消込 |
| measurement・completion | 数値を根拠付きの要求/後続pairへ残すこと、適用義務の条件と設計の正しさの区別 | 実測法/閾値/結果、要求充足・機構成立 |
| supersession | 正式templateが来た際の欄の行き先対応 | 旧版consumer移管、撤去、旧sourceのretire |

意味内容の採否と、BRAIN007/025の運用knowledge promotionを分ける。LABO評価→OS登録/振分け→BRAIN変更内の独立検証→採否の順序は変更・免除せず、POの内容選択やこのPRのreviewで代替しない。選択されても運用knowledgeをaccepted/matureにせず、案件適用と実行済み受入を生成しない。SEEDFIRSTの既決範囲は保持する。

MSG005の関係欄は省略形「SDOP001・003」「VT103・104」も含む。さらにstate/data欄には関係欄外のMSG002参照がある。これらを落とさず、MSG003の権限/分類、SDOP001〜005の記録/非機能/運用/規則/依存、MSG006のtestability、VT103〜106の方法を参照先の意味/採否として残す。SDOP006はAWS採用時の条件を保持する。単純な名前抽出や3件の採用だけで必要集合・再帰的依存閉包を閉じない。

scope制限も採用対象である。原文の1.0境界にある本番chaos等を前倒しせず、図や欄が埋まったことを設計の適切さへ変換しない。source_body_context全文、例の案件値、参照知識全体、旧surface/componentの全移管、正式schema/実装・L3再開・内部デプロイは対象外である。これらの意味を不要としてretireせず、#2846と各ownerの未完へ保持する。

## 参照知識を読むための探索記録

[26seedの参照探索記録](audits/template-reference-traversal-2026-10-12.json)は、契約の関係欄と適用条件・必須入力を原文行へ束縛する。省略形と範囲を展開し、MSG001/004/005からの参照経路を記録した。名前だけを無条件に辿ると26候補全体へ届くが、これは全件を初回に必要とする根拠ではない。AWS条件、節ごとの適用、主pairと検証時点、意味参照と実装依存を保持し、選択operation/sourceに対する必要集合は別に照合する。

関係欄だけの探索であり、40card本文、全field由来参照、各原資料と旧consumerの閉包は未確認である。MSG005の本文にあるMSG002参照は対象外参照として保全する。参照循環から互いの完成receiptを知識比較の前提にせず、VT001/102と4cardの限定採用、MSGCONTENTの限定採用と運用promotion未実施、各候補の状態を保持する。次は実際に選ぶ内容・版・条件・未決入力を各ownerへ結ぶ。参照の到達や件数からIssue完了・L3再開・全体最小集合の確定を生成しない。

## 初回参照知識の契約内容候補

[SDOP001〜005・VT103〜106の意味候補](../helix-brain/candidates/first-cycle-reference-template-knowledge.json)は、既存3MSGが参照する9件の契約・負例・完了と本体を、032の15比較項目へ結ぶ。26件の適用索引から、参照先の知識内容の比較へ進める材料である。各値に原文範囲を付け、SDOPの未定義supersession、欄別meaning/要否/oracle・trace/測定の不足も残す。候補に15キーがあることを全定義完成の証拠にしない。

| 参照内容 | 保持する意味 | 比較に残す不足・適用の境界 |
|---|---|---|
| SDOP001〜003 | 動作記録の利用者・相関・分類/保持、根拠付き非機能値と受入、気づく/直す/戻す方式と担当 | 静的/非稼働は原文条件で理由付きN/A。例の数値・製品名を採用しない。復元/rollback実績は後続運用の入力 |
| SDOP004/005 | 規則・状態×イベント・異常系4問・冪等性からcaseへ結ぶ。外部依存の版固定・更新owner/EOL・adapterと例外 | 未決は上流へ戻し、未決リスト掲載を解決済みにしない。MSG004とは行参照で二重正本を避ける。auto-mergeの例は採用しない |
| VT103〜106 | 総合固有義務、境界、詳細契約、実装前Red/Greenを各pairで比較。template記入完了と状態昇格を分ける | 実L3/設計/oracle/下位proof/実行receiptは未供給。主kind/pairを排他的な適用にせず005へ戻す。技法早見/共通cardの参照を内容全体の採用にしない |

汎用知識はBRAIN、製品への適用・義務・不足はCORE、使用set/版・案件記録はOS、工程/状態意味はHARNESSへ保持する。この9件は未採用で、既決SEEDFIRSTもMSGCONTENTの固定payloadも変更しない。BRAIN007/025の知識昇格・LABO評価・OS登録/振分け・独立検証は免除しない。source全文の移管・全体最小集合・欄の完全意味比較・正式schema/runtime・L3再開は未完のままである。

旧JSON authority19〜60の意味/view・portfolio/pair、旧verification phase28〜40/73〜79のbasis/condition/evidence、旧ddd-tdd-rules21〜24の契約先行と欠陥検出Redを読取り起点に意味再導出した。旧層名・G番号・evidence形式・旧runtime/CIは移さず、原文seedが既に保持する現行pairと責務へ対応付ける。新しい要求・版・許可・gateは加えない。

### 参照知識9件の本体節と欄文脈

意味候補の`required_field.value.section_contracts`で48本体節を原文へ結び、欄が表す意味・適用義務・検出する取り違えを比較できる形にした。設計値を記入する欄、固定の規則/条件、技法の早見、参考分類、実行後の証拠を区別する。これは全節の欄文脈の比較であり、各欄の独立locator・要否・oracleの完全対応を証明したものではない。

ログの相関IDは発行/伝搬、非機能値は決定者/根拠/受入、運用は方式/担当/復元実績、規則は全行/マスと未決返却、依存は版固定/更新owner/EOLへ戻す。原文の表・問い・規則を保持し、値未決をN/Aへ変えない。VTは観点・技法・必須証拠・差戻しの4節を分け、主力/補助/後続と実証の時点を混同しない。SDOP002のIPA参考枠、SDOP003の例時間、SDOP005の更新/CI例、VTの早見を製品値・全件実行義務・実行許可へ昇格しない。

旧意味JSONの適用/portfolio/pairと契約先行/TDDを起点にした説明の具体化であり、新たな規範・case・schema・gateではない。知識候補の採否、全欄の最終意味比較、未定義supersession、全体最小集合、BRAIN007/025昇格、L3再開は未完を保持する。

## P3FIRST：初回L3／L10のための限定知識採否案

[#2846の第2回全作業照合](https://github.com/RetryYN/HELIX-HARNESS/issues/2846#issuecomment-6111384214)で、次の不足はL3／L10に使うP3知識の採否と、非画面対象に該当するSDOPの節の選別と確認された。[既存の参照意味JSON](../helix-brain/candidates/first-cycle-reference-template-knowledge.json)の`adoption_proposal`（P3FIRST）に、意味内容と非採用範囲を固定する**未採用案**を置く。元9候補の内容・状態は変えず、別版の本文を複製しない。SEEDFIRST・MSGCONTENTの採用範囲も不変である。

| 知識 | 採用を提案する意味内容 | 適用条件と今回の限界 |
|---|---|---|
| VT103（P3） | identity・原候補版・15descriptorと、本体4節の固有義務の差分、非機能値と測定、対oracle、必須証拠、意味が変わる層へのBackflow。適用判定の記録・右腕condition・Integrated→Verified・差戻し先・正例/境界負例（原文11／13〜14／18／33〜36行）も含め、原文の適用制限を保持する | 全実行を既定にせずHARNESS005／022／034／040／056を参照する。技法早見は参照IDと主力／補助の材料で、card内容全体や全技法の実行義務を採用しない。下位proof／実receiptは右側検証の開始入力で、今の知識比較や左側起草の開始入力ではない |
| SDOP001 | §1目的と利用者、§7業務イベント、§9権限・費用の問いと欄文脈 | 動作記録を出す対象に限る。静的な知識ファイルへ無条件適用しない。形式・型、ログレベル、masking方式、通知先・実値は今回の採用範囲外 |
| SDOP002 | A〜Fの可用性、性能、運用保守、移行、安全、環境の問いと欄文脈、および各回答の決定値／決定者／決定日／根拠、対象外のN/A／理由（37／103行） | 稼働・運用対象の要求形成へ使う。各項目の要否は重要度・scope・予算と原条件で判定し、全部最大・全方式採用にしない。IPA参考分類、数値・方式・法令判断・実測/復元実績は採用しない |
| SDOP003 | §1の気づく／直す／戻す目的と、方式・ownerを問う欄文脈 | 稼働・保守対象の場合。実アラート、ランブックのコマンド、担当の割当、復元・rollback実績を起草前の供給物にしない |
| SDOP004 | §1ユースケース、§2条件と結果、§3状態とイベント、§4異常系4問、§6深さの理由、§7検証への対応 | 規則・状態・外部副作用の条件に合う場合。原表の意味と未決の上流返却を保持し、未決記録を解決済みにしない。技術方式を含む§5は今回の範囲外。L3の全表記入・具体case/実行合格をこの採用案から要求しない |
| SDOP005 | §1任せる／自分で持つ範囲、§2依存と版固定・EOL・owner、§6更新方針の問い | 外部library/API/service/runtimeへの依存を扱う場合。具体的な採用物・版・lock・周期は未定。自動mergeの例を採用せず、静的成果物にruntime依存を捏造しない |

SDOPは各原文の`applicability`・`required_input`・`source_limits`と上記19節の既存欄文脈とSDOP002の補足記録条件を選ぶ。未決は未決として残し、決定値やN/Aへ補完しない。全15descriptorや全templateを採用する案ではない。選択範囲と源文書revision、抽出payloadのdigest規則をJSONへ結ぶ。sourceの表・見出しをL3の正式書式／schemaへ採用せず、要求に必要な条件・不足を見つける知識として使う。各templateの設計段階での適用義務はその段階へ保持し、ここで非採用の節を不要として消さない。

VT104〜106（P4〜P6）は後続pairの知識で、L3再開前の一律入力へ加えない。技法card内容全体、他seed、案件のrequired／conditional／N/A／unresolved・N/A4属性、実値・方式・期待値・測定・復旧の実証、全体最小集合、正式schema／renderer／実装は確定しない。SDOPの未定義supersession等を完全な契約にせず、BRAIN032の未定義返却を保持する。

採否は対象revisionへのPO判断へ残す。BRAIN007／025のLABO評価→OS登録／振分け→BRAIN変更内独立検証→採否は免除せず、要求整理に使う意味内容の選択と運用knowledgeのaccepted／mature昇格を分ける。汎用意味はBRAIN、案件適用・義務・不足はCORE、案件値と記録はOS、工程／対／状態はHARNESS、評価はLABOへ保持する。P3FIRST案の共有や採用だけでL3再開・前提機構成立・Issue完了を生成しない。

旧JSON authority19〜60の意味／表示・適用／pair、旧verification phase28〜40／73〜79の左basis／右condition／証拠を起点に、既存候補からP3と要求形成の問いだけを選ぶ意味再導出案である。旧G10のUXと現行P3のシステム義務を混同せず、旧schema／runtime／層番号は移さない。10/10巻き戻しと旧弱点UTW-021の失敗を踏まえ、件数・hash・欄の存在を意味の充足や機構成立にしない。未選択範囲と有効依存・再開scopeの残件は#2846へ保持する。

VT103原文19行の「値はL3で根拠付きで導く」と、非選択のSDOP002原文12行の「値の測定法・閾値はL11で固定する」の時点差は、再開時に採択済みHARNESS034と対oracleへ照合する問いとして#2846へ残す。本案で工程の意味や固定時点を変更しない。
