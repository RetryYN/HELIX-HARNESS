# CORE→OSのticket導出と結果還流の静的照合（#1805）

対象base `4537f4bdd0f3f036ab90d71a74c76d8563a39904`。authority_effect: none。JSON証拠 [ticketissuer-core-os-roundtrip-1805-2026-10-10.json](ticketissuer-core-os-roundtrip-1805-2026-10-10.json)、SHA-256 `a815203e5d8285ab8896451794b18482a5a310c177ae0f852c453cba5bee1394`。

Issue本文と追加commentの全7項目を固定し、既採択の契約と同じ案件の往復例へ対応づけた。R@a/U、K@v、D、W@w、T、Eは説明用の参照記号で、schemaや実run recordではない。7件の静的例を記述し、実行は0件である。新しい要求意味、L3再開やIssue closeを導かない。

## 全7項目の照合

### C01 工程意味と製品設計

COREの製品固有設計・義務・依存・意味差分と、HARNESSが提供する工程語彙・trigger／route・順序・join・停止／差戻し／完了条件を区別して入力へ結ぶ。

**正常例**：COREの製品P・要求R@a・scope Uの選択template K@vから義務Dと影響候補を得る。工程契約W@wの語彙・順序・join・停止条件は別に参照し、OSはWを再定義せず受領する。

**負例**：COREの設計義務DをOS独自の工程順序へ置換する、またはstyleをticket kindにする場合は不成立。

**判定範囲**：工程・製品適用・運転のownerを別に識別できる。 根拠 S01, S02, S04, S08。

### C02 CORE→OS受渡し

CORE→OSで、対象identity／revision／scope、選択template／knowledge版、設計義務、依存、変更影響、必要検証、未充足入力、戻し先を保持する受渡しを照合する。既存contractにないfieldの必須化は不足候補として正本へ返す。

**正常例**：R@a/UとK@vの選択set、義務D、依存、意味影響候補、必要pair、未充足入力と戻し先を参照した受渡しを記録する。候補・選択・使用setを区別し、受領だけで実施済みにしない。

**負例**：K@vを別版K@v2へ黙って差替え、R@bの義務でR@aの不足を埋める、knowledge定義欠落をCOREが補完する場合は不成立。

**判定範囲**：既採択009/002の参照で結ぶ。ここに新しいwire fieldを追加しない。 根拠 S02, S03, S04, S06, S07, S11。

### C03 OSのroute具体化

OSが案件の現在状態・登録済み要求・許可・優先度・資源・予算・期限と受領した工程契約を合わせ、必要なroute・作業ticket／workflow・割当を具体化する正常例を示す。ticketの状態や依存を作業開始のauthorityにせず、現在の上流状態から可否を照合する。

**正常例**：OSは登録R@a/U、現在状態、依存、既存authority、優先度、資源、budget/期限、W@wを照合し、適格な既定部品のticket graph候補を作る。同じ承認済み入力では同じ候補となる条件を照合する。 OSがassignmentを別に照合し、ticket・要求revision・Worker・呼出しレーン・authority・scope・予算・期限へ結ぶ条件は018から読む。

**負例**：ticketが存在するだけで起動する、未解決依存をready化する、INT案を無検査でticket化する場合は不成立。

**判定範囲**：導出例の記述であり、現実にticketを発行・割当・実行していない。 根拠 S04, S05, S08, S09, S16, S17, S26。

### C04 結果Backflowと未完義務

OS→COREで、Worker結果・検収finding・未充足義務・変更／不足を元のrevision／scope／因果IDへ結び、適切な意味ownerへBackflowする往復例を示す。

**正常例**：仮定したWorker結果Eは元ticket T、R@a/U、actor、因果参照と義務Dへ結ぶ。検収finding F（Dの必要oracle未充足）も同じT/R@a/U/Dへ結び、必要oracleの意味ownerへ返す。知識定義不足はBRAIN、製品要求値の未決はHARNESS008、適用契約不整合はHARNESSへ返す候補に分ける。OSは受信側の未完義務受理証拠が揃うまでTを完了にしない。

**負例**：配送ACKだけでDを消込む、OSが適用判断を作る、失敗を訂正で消す、受領しただけのCOREに解決済み印を付ける場合は不成立。

**判定範囲**：Backflow候補の形成・発行・受理・意味解決を別に確認する。 根拠 S02, S06, S07, S10, S11。

### C05 stale・別scope・部分成功

stale版、別scope結果、未充足input、未解決依存、義務の脱落、単体成功からhandoff／構成体／完了を推定する負例を示す。

**正常例**：R@a/Uに束縛した有効な材料と未観測範囲を保持し、単体の成功、接続の受渡し、構成体固有条件を別々に照合する。

**負例**：R@b、scope V、stale W、未充足input、未解決依存、義務D抜け、単体successだけの接続/構成体successを各一件ずつ混入したとき、元scopeの成立根拠にしない。

**判定範囲**：未観測をpass/N/A/欠陥0へ補完せず、元義務・scope・戻し先を残す。 根拠 S03, S06, S08, S10, S11, S17。

### C06 OS・INT・Worker往復

INTELLIGENCEとの連携を別の接続として照合する。OS→INTは現状・ticket・依存・証拠（INT-L2-031）、INT→OSは計画・配置・診断等の根拠付き候補（035）。OSが発行・割当、Workerが実行し、actor／scope付き結果をOS／INTへ返す（037）。候補だけで実行許可を生成せず、OS stateのownerはOSに保持する。

**正常例**：OSの許可されたT/current state/dependency/evidenceをOS revision付きでINT031へ渡す。INT035は根拠・停止条件・依存付き計画/配置/診断候補をOSへ返す。OSが適格性と既存authorityを確認し、割当済みTをINT037のWorkerへ渡す。actor/scope付き結果をOS/INTへ返す。

**負例**：INTがOS stateを書換える、candidateから直接実行する、OS割当を飛ばす、WorkerをINTと同一視する、専用CONNECT契約が不明でも接続済みにする場合は不成立。

**判定範囲**：CORE知識受渡しとINTの稼働中候補を別接続に保持する。CONNECT admitted contractの成立はこの静的例で証明しない。 根拠 S12, S13, S14, S15, S04, S08。

### C07 1.0／4.0境界

1.0はHARNESS定義済み工程部品の規則的な組合せ・途中結果の差戻し、部品外の流れの生成は4.0という版境界を維持する。

**正常例**：1.0の例はW@wに定義済み部品の規則的組合せと既定戻し先への差戻しである。途中結果でも元R@aと未完義務を保持する。

**負例**：部品にないflowの生成、元authority/oracleの無条件流用、4.0能力を1.0開始前提へ変える場合は不成立。

**判定範囲**：4.0の保持を1.0成立へ前倒ししない。 根拠 S04, S08, S16, S17。

## 旧sourceと採択根拠

旧template exact set/trace/pair/Backflow、ticket意味非上書き、Bench非配車、評価ticketとsubject ticket分離、再入staleと義務/権限保持。
既存のPO判断が定めたCORE/BRAIN/OS/INT/LABOのownerと1.0/4.0区分を読む。監査例で新しい規則・field/schema・採択・formal successorを追加しない。

OS017/020/023のL2/L11とINT031/035/037のL2の選択本文は9/28固定採択commitに一致する。CORE009/OS002追補は10/10固定採択decisionから読み、候補metadataを理由に未採択へ戻さない。全文の現行SHAだけから全追補の採択を推定しない。

## 証拠参照

| ID | path | 行 |
|---|---|---|
| S01 | `docs/helix-harness/L2-requirements/product-requirements.md` | 315–316 |
| S02 | `docs/helix-harness/L2-requirements/product-requirements.md` | 1594–1604 |
| S03 | `docs/helix-harness/L11-acceptance/product-acceptance.md` | 1342–1349 |
| S04 | `docs/helix-os/L2-requirements/governance-requirements.md` | 664–673 |
| S05 | `docs/helix-os/L2-requirements/governance-requirements.md` | 694–703 |
| S06 | `docs/helix-os/L2-requirements/governance-requirements.md` | 724–733 |
| S07 | `docs/helix-os/L2-requirements/governance-requirements.md` | 1698–1707 |
| S08 | `docs/helix-os/L11-acceptance/governance-acceptance.md` | 338–344 |
| S09 | `docs/helix-os/L11-acceptance/governance-acceptance.md` | 359–365 |
| S10 | `docs/helix-os/L11-acceptance/governance-acceptance.md` | 380–386 |
| S11 | `docs/helix-os/L11-acceptance/governance-acceptance.md` | 1364–1371 |
| S12 | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md` | 217–224 |
| S13 | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md` | 253–260 |
| S14 | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md` | 271–278 |
| S15 | `docs/helix-intelligence/L11-acceptance/intelligence-acceptance.md` | 94–100 |
| S16 | `docs/helix-os/L2-requirements/governance-requirements.md` | 610–610 |
| S17 | `docs/helix-os/L11-acceptance/governance-acceptance.md` | 308–308 |
| S18 | `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/execution-ticket-requirements.md` | 157–163 |
| S19 | `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/execution-ticket-requirements.md` | 280–282 |
| S20 | `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/execution-ticket-requirements.md` | 349–351 |
| S21 | `archive/legacy-generation-2026-09-14/root/docs/archive/intake/2026-09-06-concept-vision/vision/HELIX_VISION_v0.1.md` | 190–208 |
| S22 | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md` | 121–121 |
| S23 | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L4-basic-design/design-template-json-authority.md` | 38–46 |
| S24 | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L4-basic-design/design-template-json-authority.md` | 47–60 |
| S25 | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L4-basic-design/design-template-json-authority.md` | 81–92 |

| S26 | `docs/helix-os/L2-requirements/governance-requirements.md` | 674–683 |

## 元Issueの残条件

- 推進生成器と管理登録の設計/実装/検収
- PoC/UI prototype/Feature typed ticket・operational tagのversioned mappingとworkflow実生成の検証
- label/remote driftからlocal authorityを上書きしない同期・read-after/idempotency/補償（1812）
- 依存1798/1804、CONNECT admitted interface・SECURITY/INFRASTRUCTUREの対象scope証拠
- Worker/CI/handoff受理・接続固有/構成体の実結果

既存Feature Ticket、Issue本文、採択契約、MPR、source holding、Bindingは変更していない。旧runtime/test/CIを実行せず、static mappingを実受渡し成功・source全移管・完了へ昇格させない。
