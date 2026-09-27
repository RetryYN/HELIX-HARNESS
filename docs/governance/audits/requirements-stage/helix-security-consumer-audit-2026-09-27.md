# SECURITY利用側7機構の監査記録（R2179-01）

## 対象・基準・集計

基準commitは `858026b250a15d4fec020b21b315c250decf960b`。対象はHELIX-OS、CONNECT、INFRASTRUCTURE、HARNESS、BRAIN、LABO、INTELLIGENCEの7機構におけるL2/L11計14本文。各本文で `rg -ni security` による大文字小文字を区別しない行検索を行い、全251一致行を読み、ID節・操作・選択入力・authority/戻し先の文脈まで確認した。251は一致行数であって依存ID数ではない。旧runtime/test/CIは実行していない。SHAは各本文の基準時点の内容。

| 文書 | SHA-256 | 一致行数 | 一致行番号 |
|---|---|---:|---|
| `docs/helix-harness/L2-requirements/product-requirements.md` | `7ee1004f8d2c0eea7816b1e321a3ad4abd284156c50704b41476940491d5d44d` | 19 | 113,119,147,156,237,239,240,243,358,406,413,538,591,615,630,633,648,669,671 |
| `docs/helix-harness/L11-acceptance/product-acceptance.md` | `e6e9211edef5809129b765511f6683b291eeb787889d89fe9b52fce44c00e378` | 10 | 49,57,78,127,156,227,232,247,325,442 |
| `docs/helix-os/L2-requirements/governance-requirements.md` | `c92d3c052884c05fbbba89fc86f6e6e0c576846e87073327fb0917e32a1747cf` | 38 | 57,179,231,233,234,239,493,542,547,549,627,668,675,678,698,708,728,738,768,781,818,829,832,833,839,840,841,842,843,844,852,855,859,860,868,871,875,876 |
| `docs/helix-os/L11-acceptance/governance-acceptance.md` | `026cfa386f99221ca1d43d238d4cf7f50e53c03c35193f8bcba09baff0578f07` | 11 | 24,50,108,112,347,349,423,438,445,448,461 |
| `docs/helix-brain/L2-requirements/brain-requirements.md` | `01ff0931918dbf878698084e31ffaccb10e459fa1fca20992f22c4c4e2230e03` | 7 | 90,224,244,253,349,365,367 |
| `docs/helix-brain/L11-acceptance/brain-acceptance.md` | `2b80d64785ed37353fdeee020c893236cd31dffac653206e613ad80f7dbd7e86` | 5 | 29,41,43,44,55 |
| `docs/helix-labo/L2-requirements/labo-requirements.md` | `f1c39e5e77d86e287f6f18378b315b67d31fd09862c9b3f626d0301843e537ed` | 15 | 219,221,271,273,277,361,373,387,388,399,400,413,450,453,454 |
| `docs/helix-labo/L11-acceptance/labo-acceptance.md` | `9f37f8c3ef0882724825433c6484d7ae4f73d24750962ebebe535c63e54e1060` | 6 | 76,89,90,131,146,162 |
| `docs/helix-intelligence/L2-requirements/intelligence-requirements.md` | `40497f22a3ec2aff462b617764df7da6d09b427d95ed91d2ee737535c2e91260` | 17 | 21,142,204,206,262,266,268,269,368,370,437,504,511,524,526,542,557 |
| `docs/helix-intelligence/L11-acceptance/intelligence-acceptance.md` | `74d9b3601ba6e65bfc68d3f43039b172eb65306a5615e8875ad6dcb62c0767c7` | 6 | 77,92,99,116,169,254 |
| `docs/helix-infrastructure/L2-requirements/infrastructure-requirements.md` | `cab7225b5461ba9a071c1397e75f6ee9e60511719c25342ca85627109c953730` | 54 | 27,35,37,49,57,66,85,87,88,89,126,129,130,131,132,133,134,141,143,144,155,157,158,159,185,187,188,190,208,218,235,236,237,238,239,245,248,255,258,269,270,277,280,290,293,294,304,323,391,395,397,398,407,416 |
| `docs/helix-infrastructure/L11-acceptance/infrastructure-acceptance.md` | `39cc6ffc11c4994fef69ff4f676fd88f529ec677ef9a4dc58b12a17f77d000ba` | 34 | 38,39,40,68,88,89,128,132,133,135,136,145,173,175,176,200,201,202,203,230,245,246,248,254,257,263,266,272,274,275,281,293,295,304 |
| `docs/helix-connect/L2-requirements/connect-requirements.md` | `d4e550eefa2bdb0b9e5b6aa0644db7486cc27bce4662025f3f73b33a7d077ffa` | 25 | 47,49,52,62,73,76,84,87,98,109,121,122,132,134,237,238,239,240,241,242,243,244,245,246,248 |
| `docs/helix-connect/L11-acceptance/connect-acceptance.md` | `b5dcfe5477b91a13e70e8e4e0bc3a020529d5c0c8272af7079befcbb6cceb624` | 4 | 26,44,52,72 |

検索件数の内訳はOS/CONNECT/INFRASTRUCTUREが166行、HARNESS/BRAINが41行、INTELLIGENCE/LABOが44行で、合計251行。各資料内に記録された異なる検索語の集計（例：securityに加えて認可/権限を検索）とは混同しない。

## 共通判定

既決のsecurity authority・permission・data-use/classificationは、対象revision・対象scope・operation・適用期間が一致し、かつ期限内で失効していない限り再利用する。期限切れ/失効、対象版の変更、scopeやoperationの拡大、適用sourceの変更時は再照合し、不明なら該当操作・入力を保留する。単なるownerへのfailure handoffは全操作の実行依存ではない。依存区分は常時必須、特定操作時、選択入力元に応じて必須、参照の四種を維持し、参照記述をrequired input/permission/oracleの代替に使わない。

各機構のsecurity policy/authorityはSECURITYに残る。利用側は既存の有効な権限とreceiptを対象範囲内で照合し、権限を新設したり、通常runごとの人間再承認を発生させたりしない。SECURITY 1.0の015/016 identity・分類基盤と、後続1.xの017/018/019/025 sink・観測・Web境界能力を分ける。1.x能力が候補や将来版行に現れることだけで、現行1.0の全操作へ拡張しない。

## OS / CONNECT / INFRASTRUCTURE

凡例：**常時**＝該当要求の全操作に必要。**操作時**＝その操作を行う場合に限り必要。**選択入力時**＝選択したsource/sink/inputに限り必要。**参照**＝状態・責任者・境界の記録であり、機能成立の依存ではない。

### HELIX-OS

#### 横断行・初期identityの分類

| 行・identity | 依存区分 / 役割 | 防ぐ害・限定条件 | 既決authority再利用 / 1.x |
|---|---|---|---|
| L2-004（57、542、547、549行） | Worker割当・実行・回収をOSが進行統制する。特権実行はSECURITY authorityの操作時依存。 | 自己承認、二重割当、権限失効後の実行、未完義務の喪失を防ぐ。revoke時は新規/実行中割当を停止し、成果を隔離する。 | 対象operation・scope・期限が有効な既存SECURITY authorityを照合する。OSは権限を重複定義しない。SECURITY 1.x sinkへの依存ではない。 |
| L2-001/003/004/005/007/009（235–237行） | 対象製品が承認したtarget/operation/environment/network・data scopeと期限へauthorityを束縛する、該当操作時の共通条件。 | 無認可操作、scope drift、失効・stale権限を停止し、通常作業と特権Workerの資源/証拠を分ける。該当しない通常作業に特権操作を要求しない。 | 同じ対象・版・scope・期限に有効な既決authorityを用い、対象範囲/版/期限が変われば再照合する。1.x能力を追加しない。 |
| L2-001/002/003/006/007/009（179行） | 旧archiveの物理削除だけに関する条件。法的/security理由と別のaction-binding approvalがある場合に限定。通常のarchive参照・保全をsecurity実行依存にはしない。 | 判断史・archive原文の不可逆な喪失を防ぐ。 | 当該削除操作に結び付く明示的承認条件を使う。1.x sinkの常時依存ではない。 |
| Security engagement節（231–241行） | 233–234行は旧SEA候補と新世代対応表への参照であり、単独の実行依存ではない。235–237行は上記authority条件。239–241行は分類に従う機微security dataの取扱い境界で、保存/暗号化/retention/disclosureの方式は未承認としている。 | 未許可操作と機微データの通常DB/log/memory/Issue/PR/AI context/配布物への流出を防ぐ。未承認の保管方式や特権operationを新設しない。 | 適用scopeの既存分類/authorityを参照する。SECURITY 1.x sink実装を前提化しない。 |
| L2-002/004/005/006の提供構成移管範囲（493行） | OPS/security brokerの再実装を求めないという境界記述。security依存ではない。 | 旧brokerを理由に新しいauthority機構を推測・再構築しない。 | 新規permissionを作らず、現行SECURITY ownerに残す。1.x依存なし。 |

関連L2候補本文のsecurity該当行は`governance-requirements.md` 627、668、675、678、698、708、728、738、818、829、832–844、852、855、859–860、868、871、875–876行（旧source根拠/表・一般説明のhitを含む）。L11での主な適用箇所は`governance-acceptance.md` 347–349、445、448、461行。

| ID | 分類・対象範囲 / 防ぐ害 | 操作時の限定 / authority |
|---|---|---|
| OS-017 作業フロー、OS-018 割当、OS-020 CI実行、OS-021 対象project配布 | 各工程で既存authority/制約、CI/Worker/配布先資源を束ねる（OS L2 668、675–679、698、708）。無認可操作、実行環境逸脱、資格情報/成果物の混線を防ぐ。OSはsecurity判断・実資源を所有しない。| 実行・配布・CI等の操作時に限り必要。単なるticket/plan準備段階でauthorityが未成立なら実行可能表示にしない。L2-021はscopeを選択対象と必要な依存に限る。L11-018はOSがsecurity認可やInfra状態を代替しない反例（L11 347–349）。|
| OS-023/024 引継ぎ | SECURITYとの対応境界、または適用scope/data-useに沿う引継ぎ（L2 728、738）。未認可data-useやtenant境界越えを防ぐ。| 引継ぎ対象に許可・data-use制約が適用される場合のみその操作で必要。L2-024が1.0の受け口であり、学習/推薦の後続版そのものを要求しない。|
| OS-026 段階候補の導出 | 不明安全依存をownerへ戻す（L2 818）。これは候補構成の欠落を検出する責務。| SECURITY機能を実行時の常時依存にはしない。安全依存のidentity/statusを候補導出時に照合する参照。|
| OS-027 低リスクの初回実行 (1.0) | 操作authority、隔離/外向き通信/Worker制約、資産identity/分類、secret-free/secret-restricted入力/出力、未評価と許可の分離（L2 829,832–844; L11 445,448,454–455）。守る害はscope/tenant漏れ、credential露出、無許可外向き通信、生成物class逸脱、unknown assetをsafeと推定すること。| **当該初回経路の操作時は必須**（ネットワークなしは許容、通信する場合のみ許可先）。SECURITY L2-008 authority、003隔離、005 credential、006 外向き通信、007物理制約、015/016 identity/分類を既存SECURITY authorityから再利用。一般的低リスク判定器は作らない。SECURITY L2-017/018/019/025のsink・検知・Web保護を要件化していない。 |
| OS-028 支援 引継ぎ、OS-029 Worker支援 構成体（1.0候補） | SECURITY制約と該当authorityを元ticket/scope/試行に結び付けし、相談先への無許可context、権限移譲、scope逸脱を防ぐ（L2 852,855–860,868,871,875–876; L11 461以降）。選択contextの来歴/利用許可も必要。| 028の相談割当/引継ぎを選んだoperationでauthorityが必要。通常作業やINTELLIGENCE単体の事前候補生成に相談能力・相談先稼働を強制しない（L2 851,856–859）。029の実作業operationは当該操作のauthority/制約を使う。1.x security sink機能を必要としない。|
| OS-014 / 対応表 hits | 段階releaseから実data/secret/credentialを外す、またはindexでowner境界を示す（L2 627,768）。| SECURITY実装依存ではなく境界の記録。OS-025のsecurity indexもL11 423行でありdependencyではない。|

**OS-027のSECURITY依存閉包**：PO補強decision `body-reinforcement-po-decisions-2026-09-27.md` 114–116行は既存SECURITY `003/005/006/007/008/015/016`の条件を明記する。OS L2 840行も015/016を要求する。L2-833の単独成立依存一覧には015が明記されないが、SECURITY L2-016が015に依存するため、既存依存の閉包で満たされる。これは追跡上の明示差であり、本文変更を要する欠陥とは扱わない。SECURITY 017/018/019/025のsink機能追加を意味せず、既存authority/guardの意味も変わらない。

### HELIX-CONNECT

CONNECT L2 43–52行は共通契約。許可/data-use/分類を「適用される場合」にoperationへ束縛し、CONNECTは許可や業務完了を発行・拡張しない。各L2 bodyは56–135行、L11は22–76行。

| ID | 分類・対象範囲 / 防ぐ害 | 操作時の限定 / authority |
|---|---|---|
| CONNECT-001 登録 | 端点ownerの業務契約・scopeと、適用されるSECURITY/data-use IDを接続identityに記録（L2 58,62–65; L11 44）。登録は許可/承認ではない。| 入力に権限を明示するのは**該当する場合**。登録自体が許可を要求/発行しない。異なる接続IDで同じ端点を共有できる、ID衝突だけ拒否。|
| CONNECT-002 版/stale確認 | 互換な版の組と期限内の許可を照合し送信可否を返す（L2 67–76; L11 46–48）。古い許可/互換性による送信を防ぐ。| ここに明確化が必要：L2-075の単独成立依存は登録＋端点の版/compatだけで「通信は必須でない」とするが、入力L2-073は期限内SECURITY許可を無条件に要求し、出力は互換/非互換/unknown/staleと送信可否。L11-002は「互換revisionなら送信可能」とだけ書き、許可の存在を正常fixtureの条件として明記しない。**純粋な互換性比較は許可なしで可能、実送信可否の最終判定には該当許可が操作時に必須**と二段階で明記できる。現文を字義通り読むと適用外のオフライン比較でも許可を要求する/互換判定だけで送信可能にする双方の誤読が可能。権限は既存SECURITY ownerへ返す。|
| CONNECT-003 通信 | 適用許可・scope/data-useと契約に束縛し、unknown/out-of-scopeは停止（L2 80,84–87; L11 52）。無許可転送/契約外入力/業務結果偽装を防ぐ。| **実送受信時必須**。許可証拠はSECURITYから受け、CONNECTは判定主体にならない。|
| CONNECT-004 再送 | 元許可/expiry、同一operation/digest、再送上限を引き継ぎ（L2 91,95,98）。期限切れ/失効した許可後の再送、二重効果を防ぐ。| **再送 操作時必須**；失効/期限切れなら停止する。CONNECTは業務再送可否を推定しない。|
| CONNECT-005 追跡記録 | 許可結果/data-use等のIDと停止理由を観測し、payloadを複製しない（L2 102–109; L11 60）。漏えい/不明authorityを成功に丸めない。| 追跡記録自身はsecurity許可を取得・発行する依存ではなく**適用結果の記録**。|
| CONNECT-006 片側置換 | 適用される権限と再照合、未完義務を保持（L2 115,119–122; L11 66）。一端変更から両端同時変更や未許可送信を推定しない。| **選択した交換/送受信時**必須。別の辺/WEB connectorは常時依存ではない。|
| CONNECT-007 構成体 | 辺ごとのSECURITY許可/data-use conditionと停止伝播を記録（L2 128,132–135; L11 72）。未許可後続edge、全体成功誤表示を防ぐ。| **選択した構成体を成す辺/操作だけ**必要。すべての棚卸しsource行が全構成体の必須辺になるわけではない。|

対応表の注意：CONNECT L2 139行はsource棚卸しの対応表であり、実端点の完全集合や採択結果ではない。表243行のSECURITY-L2-025はWeb資産境界に関するsourceとの対応を構成体候補007へ結ぶ。SECURITY L2-025はWeb適用1.x（L2 312–320、L11 49行）。これはCONNECT-007すべての常時必須依存ではなく、選択される辺がそのWeb経路を実際に使う場合のsource固有条件と読むべき。CONNECT L1 29行は利用者向けHELIX-WEB-CONNECTORを本機構scopeから除外し、L2-007の一般内部/外部機構構成体をWeb公開機能と同一視しない。017/018/019のsecurity sinkもCONNECT dependencyとして列挙されていない。

### HELIX-INFRASTRUCTURE

#### L2-003 / L2-019の該当範囲

- **INFRA-003（L2 57–58行）**はnetwork pathと資源・データ保管先のsecurity boundary, owner, confidentiality, recovery属性を資源モデルに記録する。これはInfrastructureの観測/分類metadataで、L2-003の単独成立依存にSECURITY許可や1.x sink実装を加える記述ではない。起動・変更操作に必要なauthorityは該当するOS/SECURITY/Worker契約で別に照合する。
- **INFRA-019（L2 222–230行）**は観測鮮度/collector confidenceの後続候補（`version_target: 1.0より後`）。特にL2 230行はL1-033/034を束ねる条件で、security一致行ではなく、SECURITY 1.xの実装依存にも当たらない。観測をstale/unknownとして返す既存の安全境界を後続機能の常時必須化に読み替えない。

L2の版定義は1.0の単体要件001–007/接続要件008–009/操作構成体010/構成体011（L2 30–147）、後続候補012–024は全て1.0後（L2 148–285）、Worker資源接続025は1.0（L2 286–296）、026は1.0後（L2 297–306）。PO原文 `runtime-infrastructure-l1-po-original-2026-09-26.md` 22–30行はCOREは設計、OSは作業/変更、SECURITYはauthority、Infrastructureは実行時資源の観測を担当すると分ける。PO decision `infrastructure-concept-placement-po-decisions-2026-09-26.md` 33–37,60–63行で18項目が1.0、それ以外が後続版と決定。

| ID | 分類・対象範囲 / 防ぐ害 | 操作時の限定 / authority |
|---|---|---|
| INFRA-001 構成 | SECURITY等を資源identity/依存/ネットワーク経路として記録（L2 35–38; L11 38–40）。資源状態をpolicy/authorityに見せない。| **参照/観測**, security policy/判断実装の依存ではない。 |
| INFRA-002 差分 | 権限/SECURITY差分を観測し、実変更をOS/SECURITY authority/Workerへ委ねる（L2 45–49）。無許可修復を防ぐ。| 比較/読取専用は観測時。**修正操作時だけ**authority/Workerが必要。|
| INFRA-004 incident状態 | security isolationを観測区分として保持（L2 65–69; L11 68）。collectorの欠測をhealthyとしない。| **参照/観測**。security incidentの意味をINFRAが所有しない。|
| INFRA-006 独立したbootstrap/復旧 | HELIXから独立した限定復旧には別SECURITY authorityを使う（L2 85–89; L11 88–89）。制御面停止時の循環する万能OOB経路を防ぐ。| **Recovery 操作時必須**、1.0 最小要件 17。通常の資源観測等の依存ではない。|
| INFRA-010 security authority/Worker操作; INFRA-011 1.0 構成体 | 010はSECURITYが認可した対象/動作/scope/版/期限内でWorkerで実操作し、実状態と結果/evidenceを分ける（L2 126–134; L11 128–136）。不許可操作、credential漏えい、部分操作を成功と偽ることを防ぐ。011はPOの18項目全体を閉じる（L2 138–146; L11 140–148）。| 010の対象操作を実行するときにSECURITY authority/物理的強制必須。これはPOの1.0 最小要件 14/16。011は010等を含む1.0構成の必要条件だが、SECURITY 1.x sink機能を含まない。|
| INFRA-012 制御/実行分離, 015 段階的変更, 017 場所/ツール中立性, 018 費用/廃止, 020 Web/資産配置, 021 世代更新, 022 自動拡張, 023 複数cloud, 024 自動failover | 1.0後候補。各候補はsecurity policy/authority/分類を入力、owner、受入条件として使う箇所を持つ（L2 152–286; L11 169–284）。特に020はWeb/customer scopeと分類、021はsecurity受入条件、022–024は操作authority。| **後続version_target候補内だけ**。Infrastructure L2 150行とL11 152–167行は後続機能を1.0の依存/合格条件にしないと明記。SECURITY 017/018/019/025を1.0へ持ち込まない。 |
| INFRA-025 Worker資源接続 | Worker実資源に必要な隔離条件を対応させる（L2 288–295; L11 286–295）。ホスト/別tenantへの意図しない操作を防ぐ。| Worker実行環境に資源を関連付ける場合に隔離条件必須（1.0 最小要件 16）。自動配置最適化/scaleは依存ではない。 |
| INFRA-026 判断候補接続 | INTELLIGENCE候補、SECURITY authority、Worker実操作を別所有にする（L2 299–306; L11 299–306）。| L2 297–306で1.0より後。現行観測/判断引継ぎにSECURITY ownerを記録することは1.x判断機能の実装依存と異なる。|

1.0の対応表（INFRA L2 376–408行）は、SECURITY接続item14→010、Worker実行item16→010/025、OOB復旧item17→006に割り当てる。他のsecurity関連の実行のauthority条件は操作ごとに定まる。INFRA-018のL2 218行はSECURITY credential/data policyを含む依存・版の記載であり、失敗時の戻し先はL2 219行でowner一般へ返す。L2 230行はINFRA-019節の束ねる条件で、SECURITY依存の記載ではない。L11-018の223–230行、特に230行は失敗時にcost/resource/SECURITY/data ownerへ戻す責務であり、実行時の前提条件ではない。

## OS・CONNECT・INFRASTRUCTUREの主な監査結果

1. **CONNECT-002の入力条件と受入条件に具体的な曖昧さがある。** 根拠はL2 73–76行とL11 48行。L2入力は期限内のSECURITY許可を必須にする一方、単独成立依存は通信不要としている。L11-002は互換版なら送信可能とするが、適用許可との結び付きを明記しない。互換性の比較結果（`compatible`）と、操作時の送信可否（`compatible`かつ現行の適用許可・scope・期限あり）を分けるのがよい。許可がなくても純粋な比較は行えるが、送信は停止する。既存のSECURITY authority責任を維持し、新しい手続きを設けない。
2. **OS-027の015表記差は依存閉包で解消する。** 既存PO decision R2167-01（補強decision 114–116行）は015/016を挙げる。L2-833の単独成立依存一覧は016のみだが、適格条件L2-840は両方を示し、SECURITY-016も015に依存する（SECURITY L2 222–226行）。sink動作やauthorityの変更は生じないため、本文修正を要する欠陥とはしない。
3. **1.x sink IDは現行1.0候補の操作依存ではない。** SECURITY-017/018/019はOS/CONNECT/INFRASTRUCTUREのL2/L11計6本文に明示参照がない。SECURITY-025はCONNECT対応表243行だけにあり、選択されたWeb境界sourceとの対応であって、全構成体の依存ではない。OS-027の015/016は基礎identity/分類でありsink強制ではない。INFRA-020/021/022/023/024は後続候補で、現行の版境界とL11によって1.0から除外される。
4. **既存authorityの再利用は責任境界に沿っている。** SECURITYはpolicy/許可、OSは操作進行/割当、INFRASTRUCTUREは実資源状態を所有し、Worker環境が制約を強制する。CONNECTは該当する許可/data-use IDを受け渡し、結果を記録する。3機構のいずれもticket、資源観測、端点登録、候補本文からauthorityを作らない。

## 旧sourceとPOの根拠

- OS初回実行のPO原文 `docs/helix-os/sources/body-reinforcement-po-original-2026-09-27.md` 11–17行は、「評価不足」と「実行権限」を分離し、許可済みの低リスク作業/Worker/予算/人の確認/検証に限る案を示す。PO decision `body-reinforcement-po-decisions-2026-09-27.md` 101–116行は、旧資産 `LEGACY-ASSET-50CA1C554747F12266D3` RLO-FR-040（`archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/resident-lane-orchestration-requirements.md` 663–666行、SHA `17bc83614d7f5f75b61831eb447a23ee706cb8a6d9e54477736e553ff956dcfd`）と `LEGACY-ASSET-437A6A68F9A9E0AE1B9E` RLO-AC-030（`archive/legacy-generation-2026-09-14/root/docs/test-design/helix/resident-lane-orchestration-acceptance.md` 43行、SHA `63ac3d0fbc36f014977998f9073846bfc01e5d352e07c1e10d408f0eab0ad707`）を記録する。旧の未評価状態を明示し、authorityを変えない点を保持する。現行ではOS/SECURITY/INTELLIGENCE/LABOの責務分担に沿って限定的な初回実行適格性を具体化する。decision 114–116行は、L2-016が作業リスク分類ではなく資産露出分類であると訂正し、新たな「低リスク」SECURITY分類器を避ける。
- SECURITYのPO原文 `docs/helix-security/sources/security-l1-idea-po-original-2026-09-26.md` 20–46行は、Policy/Authority/Trust Boundary、物理的強制、OSの操作進行、INTELLIGENCEの判断、HARNESSの検証、LABOの効果評価を分ける。52–99行は、信頼されない入力がauthorityや指示へ変わることを防ぐ。これは利用機構の役割分担を支えるが、参照のたびにすべての強制/sink候補を実装する意味ではない。
- INFRAのPO原文 `docs/helix-infrastructure/sources/runtime-infrastructure-l1-po-original-2026-09-26.md` 20–43行は設計/実行/観測の責任を分ける。対応するdecisionは現行Conceptの対象範囲として記録済み。INFRA L2 410–418行の旧source根拠は `LEGACY-ASSET-17C4BF78919578FEBB18`（`archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/product-lifecycle-operations-requirements.md`、SHA `ed4d21bf9a6ec0a922fda9d5906350cfa4c6a35edc4ecc0fd6d30dc3148dacb0`）を保持し、環境/credential参照/deploy/rollback/観測を残しつつ、現行所有をCORE設計、INFRA資源状態、OS変更状態、SECURITY authority、Worker操作に分ける。provider交換と全lifecycleは後続に残す。旧資産は実行していない。
- CONNECTのL1/PO/Conceptと旧sourceの照合結果は、本記録のCONNECT節と旧source根拠に含めた。L2共通契約45–52行とPO原文5行は、security利用を条件付きとし、CONNECTがauthorityを作らず、業務/data-useの意味をsource側ownerに残す。

## 集計対象外と静的確認

**SECURITY依存ではないため依存数に含めないもの**：一般的な役割/owner説明と旧source根拠、棚卸し対象資源としてのSECURITY、観測状態としてのsecurity isolation、ownerへの戻し先に書かれた`SECURITY`、CONNECTのsource対応表、後続版として明示的に除外された行。該当166行を確認し、SECURITY依存、参照、境界の記述に区分した。ここでの記録は利用機構の監査結果であり、上流意味の採択判断や独立reviewではない。

## INTELLIGENCE / LABO

### INTELLIGENCE

|L2 identity / 根拠行|SECURITYとの依存区分|保護対象・義務/害|操作条件の限定可否・既決権限の再利用|
|---|---|---|---|
|`HELIXINTELLIGENCE-L2-016` `intelligence-requirements.md:138-142`; L11 `intelligence-acceptance.md:77,169`|**特定操作時のみ**。修復候補の分析・生成だけではSECURITY操作許可を要求しない。書込みを含む限定修復適用時は許可済みactor/書込範囲/対象範囲/版を照合。許可情報が不明・逸脱なら止める。|要求/設計/検証義務を改変しない、stale・循環・重複・不明副作用を通さない。害は無権限書込み、二重適用、過大書込範囲、失効した権限の適用。|操作時に適用可能な既存許可を再利用し、実行時点のactor/版/scope/期限/失効状態を照合する。束縛されたrevision・scope・recipient・期限または許可状態が変われば有効性を再照合する。新しい包括承認や各runの人間確認を追加しない。未許可/失効/unknownは保留。|
|`HELIXINTELLIGENCE-L2-017` `:202-206`; L11 `:92`|**操作/構成体時のみ**。限定修復の4接続境界が実際に構成される操作でSECURITY許可/隔離結果がその段階入力として必要。全INTELLIGENCE分析一般に必須とは読まない。|SECURITY、Worker、HARNESS、OSの責務と未完義務を分離。害は許可結果をWorker実行やHARNESS検証で代替、途中失敗を完了とすること。|各段階で既存許可/receiptを再利用する場合も、該当対象・revision・scope・recipient・有効期間と失効状態を照合する。いずれかの束縛条件変更、期限到来、失効時はその段階を保留して再照合。|
|`HELIXINTELLIGENCE-L2-036` `:262-269`; L11 `:99`|**特定操作時のみ**。専用SECURITY connectorは操作候補に許可・制約・失効照合が必要な限定修復・保護操作で呼ぶ接続identity。全機能の実行時依存ではなく、その接続を行う場合の依存。|許可/隔離権限をSECURITYに残し、許可推測・INT 許可変更を拒否。害は無認可操作、隔離越境、失効許可利用。|接続呼出し時に対象許可・constraint・actor/target revision/scope/recipient/期限/失効状態の現在有効性を照合する。許可を新たに人へ毎回再承認させる規則ではなく、適用可能な有効receiptを再利用する。束縛条件の変化、期限到来、失効/unknownなら実行しない。|
|`HELIXINTELLIGENCE-L2-062` `:366-370`; L11 `:116`|**特定操作構成時のみ**。限定自動修復の端から端実行を選ぶ場合にSECURITY/Worker/HARNESS/OSの個別成立が全て必要。|許可/isolation、実行、検証、OS受入を欠落させない。害は一段階の成功で他者権限を代理すること。|各段階receiptを、その対象revision/scope/recipient/有効期間/失効状態に照らして束ねる。束縛条件が変化した場合または期限到来・失効時は該当段階を再照合する。新規承認手続きを増やさない。|
|`HELIXINTELLIGENCE-L2-068` `:491-505`; L11 `intelligence-acceptance.md:201-209`|**選択入力元/操作に応じ必須**。Worker支援・相談の提案生成では選択した入力元と使用情報のdata-use/SECURITY条件が適用される。相談実行時はOS実行経路、内容利用権限はSECURITY。|入力元の事実/推論/unknownの区別、相談者を独立reviewerにしない、INTが割当/test/CI/受入/mergeをしない。害は制限付き入力元の漏えい、oracle/権限の移譲。|選択source利用時に有効な対象/版/scope/recipient/期限/失効状態を照合し、適用可能な既決許可を再利用する。source/対象revision/scope/recipient/許可期間が変化、期限到来、失効時は再照合。L11 `:207-209` はdata-use/source制約を候補の背景参照へ落とさず、欠落時は該当operationを保留する。|
|`HELIXINTELLIGENCE-L2-069` `:513-526`; L11 `intelligence-acceptance.md:213-227,247-256`|**選択入力元に応じ必須**。選択済CORE/HARNESS model・scenario・load・price/capacity sourceについてdata-use許可を適用。独立oracleはL11 fixtureまたは期待値付き検証operationだけで必要。069の単体計算入力はHELIXINTELLIGENCE-L2-033 receiptであり、070の全handoff receiptではない。|model/input権限とsource revisionを守り、OSの実Worker/資源状態・SECURITY権限を変えない。害はunauthorized data use、仮想Workerを実操作と誤認すること。|入力選択/利用時にcurrent source identity/revision/scope/許可期間/失効を照合し、有効な既決許可を再利用。束縛条件の変化や期限到来/失効時に再照合し、unknownなら当該計算を保留。|
|`HELIXINTELLIGENCE-L2-070` `:528-542`; L11 `intelligence-acceptance.md:229-237,247-256`|**接続各段階で必須、段階・入力元別**。033 input receipt→069 calculation result→040 send→LABO024 consumer receipt。後続receiptは先行段階の前提ではない。|予測/実測、input authority、stageごとの受領状態を分離し、無許可data handoffと仮想結果の実測偽装を防ぐ。|各段階のsource/recipient/contract/scope/revision/許可期間/失効をその段階で照合し、有効な許可を再利用する。期限到来/失効や束縛条件の変化は該当stageを保留し再照合。通常simulationにactual observation入力を課さない。|
|`HELIXINTELLIGENCE-L2-071` `:544-557`; L11 `intelligence-acceptance.md:239-256`|**選択入力/操作と送達段階に応じ必須**。選択model/input/actual-observationの許可。独立oracleはfixtureまたは期待値照合operationだけ。処理順は033 input→計算→040送達→LABO024受領。|不許可source/実資源への作用を避け、unknown/unmodeledで停止。害はシステム/Workerの実書換え、無許可data use、後段receiptの先取り。|各選択sourceと送達recipientの対象revision/scope/期限/失効を利用時に照合し、適用可能な許可を再利用する。期限到来・失効・束縛条件変化は該当段階を再照合。一般simulationへactual observationを課さない。|
|限定修復の横断境界（別々の根拠）|**操作/構成体時のみ**。各ownerの段階条件はそのidentity別に判定する。|L2-016は修復candidate/適用条件 (`intelligence-requirements.md:138-142`)、L2-017は接続横断の未完義務 (`:202-206`)、L2-036はSECURITY permission/constraint (`:262-269`)、L2-062は4者の自動修復構成 (`:366-370`)。L11も別々に確認: 016 `intelligence-acceptance.md:77,169`、017 `:92`、036 `:99`、062 `:116`。INT L2 `:504`は068の不足時戻し先であり、この四identity全体の証拠ではない。|端から端修復を選んだ時にだけ、SECURITY許可、Worker実行、HARNESS検証、OS受入の各段階evidenceを該当source/ownerへ照合する。分析/候補生成一般には4段階を要求しない。|

INT一般の所有境界は`intelligence-requirements.md:21`で明示: INTは権限正本でなく、OS/HARNESS/SECURITY等のownerへ接続する。`L2-016`の「SECURITYへ戻す」はfailureの戻し先であり、候補作成一般にSECURITY接続を一律必須化する根拠ではない。L11の機械判定行も許可欠落/失効/unknownは修復停止としている (`intelligence-acceptance.md:77,92,99,116`)。

### LABO

|L2 identity / 根拠行|SECURITYとの依存区分|保護対象・義務/害|操作条件の限定可否・既決権限の再利用|
|---|---|---|---|
|`HELIXLABO-L2-001` `labo-requirements.md:69-74`; L11 `labo-acceptance.md:45,146,162`|**常時必須の基礎条件 + 選択入力元に応じた許可**。LABOが何かを観測する呼出しには対象範囲、入力元 identity/版、適用データ利用/権限を保持。SECURITY connector全件は全呼出しで不要。|入力元 権限/stateを入力元に残し、secret/制限付き/権限外dataの取り込み、not_observed→successを防ぐ。|特定入力元が選択/入力に含まれる時だけ当該許可を閉じる。`L2-058`で未選択入力元は未観測、選択入力元許可不明は保留。既存対象範囲/版に有効な許可を再利用し、毎観測で新しい人decisionを作らない。|
|`HELIXLABO-L2-025` `labo-requirements.md:219-221`; L11 `labo-acceptance.md:76`|**選択入力元時のみ必須**。SECURITYの安全性/incident 証拠をAggregateへ取り込む操作用connection。|制限付きdataと権限をLABOに移さず、対象範囲不明を拒む。|SECURITY 入力元を選択した受渡しに限定可能。他入力元だけの観測にSECURITY connectorの起動を要求しない。許可済みデータ利用 対象範囲とconnector契約を再利用する。|
|`HELIXLABO-L2-038` `labo-requirements.md:271-273`; L11 `labo-acceptance.md:89`|**FeedbackをSECURITYへ出す特定操作時のみ**。許可証拠とSECURITY data-handling/対象契約が必要。|権限変更や制限付き contentの通常packet漏えいを防ぐ。|LABOがSECURITY policy/許可を決めない。対象/分類/利用範囲の既決条件と契約を再利用し、未許可証拠を削除・redactで成功扱いせず保留/SECURITYへ戻す。|
|`HELIXLABO-L2-039` `labo-requirements.md:275-277`; L11 `labo-acceptance.md:90`|**Worker実行/停止/復旧Feedbackを選ぶ時のみ**。選択結果をOS/SECURITY 対象routingへ通す。|Worker assignment/実行権限をLABOへ移さない、Worker結果を許可外入力元から作らない。|通常評価・観測すべてにこのrouteを要求しない。実行結果の入力元 identity/権限/receiptは元対象範囲のまま再利用、対象routing不明はOSへ返す。|
|`HELIXLABO-L2-056/057` `labo-requirements.md:379-400`; L11 `labo-acceptance.md:138-154` (056 `:141-146`, 057 `:151-154`)|**新規結果の取込/配送操作時のみ**。056は許可されたOS assignment/evidenceを取り込み、057は採択済みCONNECT契約または同じidentity/version/対象範囲/ack/trace/重複防止/再送義務を満たす人手receiptで配送する|制限付き証拠の漏えい、古い/誤配送/重複した観測を防ぐ|過去runは当時の入力元/権限/receiptを保持し、現在のOS assignmentや新しい許可を遡及生成しない。新規runでは適用可能なassignment/許可の現時点での有効性を確認し、対象revision/scope/recipient/期限/失効状態が変われば再照合する。該当する許可義務は省略できない。|
|`HELIXLABO-L2-058` `labo-requirements.md:403-413`|**常時必須**なのは適用される入力元権限/データ利用メタデータ。**選択入力元に応じ必須**なのは対応connector/許可。**操作時のみ**はWeb/WEB-OS source操作と、後続2.0範囲の外部取得|全LABO入力元のprovenance/分類/権限を保ち、未選択sourceを成功扱いせず、選択許可の失敗を任意化しない|区分が本文に明記される。unknownの選択条件は「全依存不要」にせず呼出しscopeへ戻す。有効な範囲内では既決判断を再利用し、Web実運用や2.0外部取得を1.0常時依存にしない。|
|`HELIXLABO-L2-059` `labo-requirements.md:416-439`; L11 `labo-acceptance.md:170-176`|**G20: 選択した比較目的/run時のみ**。目的別のcohort (導入効果=HELIX有無、改訂効果=旧版/新版、三者関係の主張=3群)ごとに必要なSECURITY許可/data-use条件を適用し、履歴runは当時の権限/receiptを保持する。実験条件軸とは分ける。|制限付きsourceの漏えい、比較条件の混同、主張に不要な群を要求または未選択群の欠落を隠すことを防ぐ|対象scope/revision/期間に有効な既決priority/tolerance・許可を再利用し、実run時にもその有効性を照合する。scope/revision/recipient/期限/失効条件の変化は再照合する。毎run新decisionは求めない。選択群の許可がunknownなら該当比較を保留し、別群へ転用しない。|
|`HELIXLABO-L2-060` `labo-requirements.md:441-455`; L11 `labo-acceptance.md:178-185`|**G19: 同一の元Worker/model/provider/version/effort下で支援あり/なしを比べる選択run時のみ**。これは059のHELIXなし/旧版/新版cohort区分を要求するものではなく、同一Worker設定の支援利用有無だけを比較因子にする。|支援source/data-use、実行許可、同一条件の効果比較を守る|source利用時と新規run時に対象revision/scope/recipient/期限/失効状態を照合し、有効な許可を再利用する。束縛条件の変化・期限到来・失効は再照合し、毎run人間承認を作らない。入力/許可不一致なら比較未評価とする。|
|横断条件: `LABO-L2-058`が`LABO-L2-001`と選択入力元へ適用|選択した観測に必要なデータ利用/権限は常時閉じる。SECURITY connector全件を一律必須にはしない|全入力元の分類/版を保持し、source正本への書戻しを行わない|許可欠落は保留する。人手receiptは配送証跡であり、SECURITYの権限/データ利用許可を代替しない。|

L2-059の本文/依存は`labo-requirements.md:416-439`、対応するG20 L11行は`labo-acceptance.md:170-176`。L2-060の本文/依存は`labo-requirements.md:441-455`、対応するG19 L11受入は`labo-acceptance.md:178-185`。059は目的に応じたHELIXなし/旧版/新版cohort比較、060は同一元Worker設定で支援有無のみを比較する候補であり、group setや成立条件を混同しない。

### SECURITY 1.0 / 1.x の版境界確認

`docs/helix-security/L2-requirements/security-requirements.md:210-269,312-324`を読み、sinkの版境界を確認した。SECURITY-L2-015のasset identityと016のasset classificationは1.0基盤であり、本文は1.xのWeb/sink一律適用を1.0に求めていない。017の意味的な情報流出、018の機能探索観測、019のcore資産egress、025のWeb公開境界は1.x/後続版である。consumer側4文書をidentity完全名で検索したところ、`HELIXSECURITY-L2-015`、`-016`、`-017`、`-018`、`-019`、`-025`への完全一致参照は0件だった。ただし、この検索結果だけを根拠に依存なしとは判断していない。前節の通り、L2/L11本文に書かれたsource選択、data-use、実行操作、feedback/connectionの条件を個別に読んで依存範囲を分類した。1.0の許可・分類情報とdata-use条件は、適用される操作では引き続き必須である。後続sink機構を使わない公開/既許可sourceの呼出しへ無関係なWeb送信・semantic probing処理を要求せず、分類済み/制限付きevidenceでは該当許可と選択connectorを必須のままにし、unknownなら保留する。

## 静的確認の結果

- 検索で確認した主なリスクは、依存の任意化ではなく、一般的な「SECURITYへ戻す」という失敗時の戻し先表現を、無関係な操作にも適用する過剰な読みである。この表現だけでは新しいSecurity workflowを一律必須にしない。
- 直接のSECURITY接続は操作/対象範囲/入力元に結び付いている。限定修復の適用（INT 016/017/036/062）、SECURITY観測の選択（LABO 025）、SECURITYへのfeedback送信（LABO 038）、Worker実行結果の選択（LABO 039）、source観測（LABO 001/058）、比較run（LABO 059/060）。
- SECURITY権限はSECURITYに残り、INTELLIGENCEとLABOは候補/証拠のみを生成する。有効な既決permission/classificationとsource receiptは、対象/版/範囲/有効期間内で再利用する。実操作時には版・範囲・失効を照合するが、通常runごとに新規承認や人間確認は設けない。人手receiptは配送の証明方法を補い、データ許可を置き換えない。
- 実際に適用される条件を「参照のみ」へ落とさない。LABO-058は権限/data-use/versionを常時メタデータとして保持し、選択sourceの許可を閉じる。INTのmodel/operation clauseも選択sourceの許可済みidentityとpermissionを要求する。unknownを任意扱いにしない。
- 読んだINTELLIGENCE/LABOのL2/L11本文では、対象範囲内のSECURITY依存欠落は見つからなかった。stage-close時には受け手契約を対象の権限receipt/scopeに照合する。この監査は許可decisionやruntime実装を作らない。

## HARNESS / BRAIN

（Codexによる照合）

基準858026b250a15d4fec020b21b315c250decf960b。大小文字を区別しない`security`検索でHARNESS L2 19行 / L11 10行、BRAIN L2 7行 / L11 5行。機構名だけでなく一般security条件も含め、該当段落/ID全体を読む。以下の「既決再利用」は同じ対象/revision/scope/期限で有効な許可の照合を指し、期限切れ・失効やscope拡大へ流用してよい意味ではない。

| consumer / L2・L11位置 | 依存区分と保護対象・害 | 特定操作への限定・既決再利用 | 1.x条件の1.0必須化判定 |
|---|---|---|---|
| HARNESS003/004/005: L2:113,119,239-243 / L11:49,57,156-159 | Release Portはsecurity条件の充足状態を常時管理する契約、実際の特権・credential操作ではSECURITY authorityを特定操作時必須とする。未充足条件があることと設計/検証の着手不能を同一視しない。保護対象は製品の承認済みdata/操作/environmentと資格情報。 | 高risk変更は追加の証明を必要とするが、全通常編集への人再承認ではない。既存authorityを照合する。特権実行をしない要求形成は特権の実行許可を得たことにならず、後段条件の未充足として残せる。 | Web/customer runtimeやSECURITY017/018/019/025完了の常時依存なし。 |
| HARNESS004/005/006再利用: L2:147 / L11:78-80 | 選択した完全一致再利用に限りsecurity/consumer/実行境界同一性を必須照合。異なる権限境界の資産を同一byteだけで再利用しない。 | 再利用操作時の条件。毎回人の再承認を要求しておらず、既決境界の一致証拠を使える。 | 1.x SECURITY能力の依存ではない。 |
| HARNESS003/004/005運用品質、008/009構成体: L2:156 / L11:127 | 対象製品のsecurity/privacy品質とtrust boundaryを適用範囲内で必須照合。単体成功で構成体の境界違反を隠さない。 | 対象品質の適用/非適用/unknown・決定ownerを記録する。非適用を無理由に拡張しない。 | 対象製品の品質契約であり、HELIX Web運用全量を1.0に課すものではない。 |
| HARNESS011: L2:358 / L11:206 | pack呼出し時の権限とproject/tenant/environment隔離は常時必須。内部DB/鍵/統制の漏出防止。policy/authority ownerはSECURITY。 | 呼出し元が渡す有効な権限を照合する契約であり、毎回新規人承認を発行する条件ではない。実操作ごとの追加制約は該当時だけ。 | tenantはscope key。顧客runtimeの構築や1.x公開sink guard完了を要求しない。S-4と同じ境界。 |
| HARNESS017/018: L2:406,413 / L11:212-213 | 利用者製品のrelease/運用security条件。release操作と選択した運用品質ごとの必須条件。 | HELIX-INFRA自身の配備許可とは別。既決製品条件を使い、条件不明はownerへ戻す。 | HELIX本体のWeb公開義務の前倒しではない。 |
| HARNESS023: L11:227,232 | 選択したLABO Worker source028のsecurity/data-use条件をそのrunで必須とする。未許可観測流入/利用の防止。 | sourceを選ばなければそのsourceの条件は依存でない。選択後のdata-useを参照扱いへ落とせない。既存有効許可を再利用できる。 | 未選択source全量を接続必須にしない反例。1.x sourceを無条件必須にしない。 |
| HARNESS024形成資料: L11:247 / 022品質oracle: L11:325 | security/法務の人判断待ちと、資料の形成不備を分離。022は対象stageの適用security oracleを必須化。 | 形成資料が揃えばpending decision付きで判断待ちへ進める。対象revisionの意味判断を既存の別revisionから生成しない。新しい毎操作承認条件ではない。 | 1.x項目の無条件実装依存なし。 |
| HARNESS026: L2:538 / L11の同ID節 | 選んだPatternや対象設計の権限・必要oracleを参照へ落とさない。 | 選択Patternは選択入力時、UI等は特定操作時。未選択sourceの安全条件を全体へ拡張しない。既存有効許可を照合。 | SECURITY後続能力名の必須参照なし。 |
| HARNESS029: L2:591 / L11の同ID節 | API/data ownership・migrationのloss/rollback/permissionは該当変更案を選んだ時だけ。対象source許可・scopeは常時保持。 | no-changeならAPI/data操作依存を要求しない。proposal作成を実migration許可へ昇格しない。既存許可を使えるが意味変更は上流へ戻す。 | 1.x機構の前提なし。 |
| HARNESS030: L2:611-615 / L11の同ID節 | 入力利用権限/data classは常時、actor/action permissionのcaseはそのfamily生成時だけ。機微情報漏出・未承認権限の発明防止。 | source許可は既決有効なものを使う。test候補生成に実serviceの実行許可を重ねず、doubleの実network発生は拒否。 | 1.x公開sink運用完了は要求しない。 |
| HARNESS031: L2:630,633 / L11の同ID節 | log/input利用許可、sanitization、副作用抑止はincident処理で常時必須。secret/PII/本番副作用の再送防止。 | 対象operationがincident処理そのもの。安全条件を選択外と偽装できないが、縮小の隔離実行は選択時に要求。既存data-use許可を照合。 | 本体1.0のsource安全処理。1.x asset公開保護とは分離。 |
| HARNESS032: L2:648 / L11の同ID節 | 選択consumerへの送信でsecurity/permission・実行境界は常時必要。外部doubleを落として実providerへ送る害を防ぐ。 | 実run capabilityは要求artifactに応じた操作時条件、executorは選択入力。packetを作るだけでrun権限を生成しない。 | 未選択Web consumerの稼働や1.x全量は不要。 |
| HARNESS033: L2:669,671 / L11の同ID節 | 選択した生成/再現routeの必須source/permissionを維持。回帰成立は後段receiptが必要。 | incidentを選ばなければその処理を必須化しない。適用source許可は既決再利用、未知なら当該段階のみ保留。 | 1.x常時依存なし。 |
| BRAIN-INFRA-013: L2:342-350 / L11:53 | security境界不明時の戻し先はSECURITY。知識生成の常時runtime依存ではなく、該当不明/境界判断時のowner参照。無根拠な操作権限/credential所有を防ぐ。 | 汎用知識を処理するたびにSECURITY実行や人承認を要求しない。実環境/権限状態を知識から捏造しない。 | 1.x要件への依存なし。 |

BRAINの残る一致（L2:90,224,244,253,365,367、L11:29,41,43,44,55）はknowledge Domain名・Patternのsecurity constraint・要求特性・Domain間relationの記述であり、SECURITY runtimeへの実行依存ではない。HARNESSのSecurity見出し・旧SEA/link参照（L2:237,239-240、L11:156）も、本文003/004/005の条件へ束ねて評価した。単語一致251行などの件数を依存要求数とは扱わない。

この2機構では、毎操作の人への再承認、既決authorityの再利用拒否、またはSECURITY1.x能力の全量を本体1.0で常時必須にする明示条件は確認しなかった。適用scope/authority不明時の停止は保持する。HARNESS011の外部呼出しに渡すauthority表現とSECURITYのconsumer receipt詳細はL3へ渡す契約形式であり、ここで新規runtimeを作らない。

## R2179-01向け差分・処置案

- **CONNECT-002**：L2の互換比較結果と実送信可否を分ける候補を後続改訂へ渡す。比較自体は許可なしでも行えるが、送信には適用中の有効な許可・scope・期限が必要。CONNECTは許可ownerにならない。
- **OS-027**：L2-833で015が明記されないという指摘はNOCHANGE。L2-840が015/016を条件化し、SECURITY-016の依存閉包から015が満たされる。sink能力の追加もauthority変更もない。
- **INFRA-010**：C1/C2/OOBを含むoperation authorityとWorker強制の詳細は独立INFRA監査へ引き継ぐ。本資料はSECURITY依存の利用側分類のみを記録する。
- **CONNECT履歴の行範囲訂正**：旧監査記録は書換えない。追補では正しい現行範囲をL2全体1–269行、接続棚卸しcrosswalk 137–248行、旧source対応250–260行、上流判断/対象外範囲262–269行と記録する。

## 旧source・判断境界

各機構の詳細欄および旧source照合では、legacy asset ID、完全path、対象行、該当source SHAと保持/変更の意味を基準にした。旧runtime等は実行していない。ここに記載した分類は監査結果と候補修正の材料であり、上流意味の採択や新しい承認手続きを作らない。

## 作成側の検収

R2179-01の指摘範囲を7機構14本文へ広げ、全251一致行とその要求節・受入条件を照合した。検索数を依存数や全source atom被覆の証拠にしない。SECURITY本体4件の受入明確化に加え、CONNECT-002の比較／送信条件を後続消化に採る。INFRA-010の更新許可・操作別回復・OOB開始条件はINFRA機構内監査のC-1/C-2と重複させず、その消化先へ渡す。OS-027の015表記差は本文変更不要。独立reviewはClaudeへ依頼する。
