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

確認baseは`9e39ff8f83105f70cb58fb3b940596428e3f0b71`。[条件照合記録](audits/template-condition-review-2026-10-10.json)にDST12件の要求・確認結果を44の条件群として保存し、各候補の正常・負例・unknown、比較先L2/L11、既存保証と固有の未確認範囲を記録した。26seedは本文digest・適用条件の所在・候補状態・保全理由へ結んだ。これは全seed本文の完全atom化や採用、全旧sourceの移管監査ではない。

MPRと判断記録を照合した結果、DST identityそのものの仮登録・対象revision付き採否は確認できなかった。BRAIN-L1の判断にあるDST-HARNESS-002/DST-OS-001への言及は企画の根拠であり、DSTのL2採否ではない。比較先の採択済み要求はその対象decisionのまま保持し、DSTが未採択であることを理由に未採択へ戻さない。

| 比較した条件 | 現行の保証 | まだ確定していないもの |
|---|---|---|
| 汎用意味契約と版 | BRAIN003/007/008/028は条件・反例・由来・版/状態・互換、005はrelationを持つ。HARNESS010/011はpack境界。041はactive templateのfield/done-when等を漏れなく候補化する | DST-HARNESS-002の全契約項目の提供と、template固有section/field・owner・measurement/completionの対応。041の消費側契約だけで提供側の全fieldを定義済みとはしない |
| 初期seed | 26件は来歴・適用・限界・負例を持つ`0.1.0-seed-candidate`として保全。BRAIN007/020/025は評価・登録・独立検証・採否を区別する | DST-HARNESS-005と各seedの採用対象revision、最小選択set。全26件を採用せず、現在の保全理由は「未採択の調達材料」であり、正式除外・retireの理由ではない |
| 製品への適用と戻し | HARNESS009/025/026は固有義務と双方向trace、BRAIN022/030はinputと知識receipt、HARNESS023/043はunknown/N-A/無断fallbackを区別する | DST-HARNESS-001/004/006/007とDST-OS-005の固有条件の採否・binding。L2.5の非適用receiptを全templateへ広げず、4種類のBackflow候補・判定者/revision/再評価条件を全件被覆したとはしない |
| 案件記録・選択・改善接続 | OS017/019/023はrevision/scope/因果・未完・受理までの非完了、INT032/033/035は版付き判断材料とOSへの候補、OS005/022/024とBRAIN020/025は評価・振分・独立採否を分ける | DST-OS-001〜004のtemplate固有exact set、適用event binding、利用の評価母集団。一般episode記録だけでtemplateの全event・実利用setを登録済みとしない |

[最初の要求例](requirements-first-roadmap.md#一つの要求例による初回の接続照合)は、申請の承認後編集拒否について知識→設計単体/構成体→ticket→Worker→検収→Backflowの経路と戻し先を示す。各候補の正常・負例・unknownは上記監査の比較例へ結ぶ。いずれも静的な意味照合であり、実在案件のL3承認、選択template、実行receiptを供給したことにはしない。

要求側の未完範囲は既存ロードマップ#2846へ保持する。次はこの4行の未確定部分を、既存採択で保持できる条件、追加・具体化の候補、採否対象と版が必要な差分へ分け、一要求identityずつ対象revisionへ結ぶ。DST12件を無条件にまとめて採用する案、schema/runtime/registryの新設、L3再開は本照合から生成しない。

#2841〜#2843のimmutable ticketは要求整理・比較・不足の区別を指示しており、候補/seedの正式昇格を含まない。これらのcloseは、独立review側がticket本文の全作業と本照合の不足保全を確認した場合に限る。closeした場合も上記未完範囲、#2846、候補状態とScaffold Bindingは残り、要求段階全体の完了にはしない。確認が不足していれば元IssueをOPENのまま保つ。
