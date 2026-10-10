# OS005/007/012/013の句比較と明示参照inventory

基準main `21d34b022ead7cd006316dc6f45778f4ff2e83ee`。authority_effect: none。[JSON証拠](os-labo-four-requirement-comparison-2026-10-10.json) SHA-256 `72f03666160d9ccaaab4b6941cb3d67d395741533480c527aeede0c3ebda5cb5`。

現行OS005/007/012/013と保持候補・対L11の13行20セルを、文単位の比較候補として無損失固定。正式最小atom・source移管・全consumer閉包ではない。

## 責務・否定・版境界

| ID | 分類候補 | 保持する責務 | failure/authority境界 |
|---|---|---|---|
| HELIXOS-L2-005 | split | OSが出典/scope付き観測・失敗・改善候補を登録・振分け、観測結果をLABOへ渡し、Feedbackを採否後のticketへ戻す。LABOは効果/退行研究、変更と採否はtarget owner。HARNESS自身も対象に残す。 | 未承認経験の規則化、還流先欠落、棄却理由消失、件数/ログ量で改善認定、LABO proposalによるOS authority書換えを拒否。 |
| HELIXOS-L2-007 | OS保持 | Worker/判断/操作/検証の原ログ・証拠を共通形式でproject/要求revisionへ結ぶ。分析用observationのLABO正本を作っても原source state/authorityは移さない。 | 欠落/重複/stale/形式不備を成功証拠にせず、未反映memory・未ack finding・expired指示を消失/再提示/二重利用しない。 |
| HELIXOS-L2-012 | split | OS行は候補移管へのnavigation。候補の内部先行/外部不足補充/source revision/取得範囲/欠落/適用条件を保持。工程内Research ticketは別用途。INTがCrawlerを発行、実行はOS割当Worker、外部知識のLABO評価→BRAINは2.0。 | 秘密送信、取得命令実行、外部patch自動採用、closed/mergedだけの解決認定を拒否。Bot発行1.0を外部知識循環全体1.0へ前倒ししない。 |
| HELIXOS-L2-013 | split | OS行は候補移管へのnavigation。原記録/同じ仕事への関連はOS、episode/比較/長期是正効果はLABO、現在状態の診断仮説はINT候補。要求欠落→原因候補と失敗→上流欠落の両方向、管理自身も是正対象、修正後症状/退行再観測を残す。 | 事実/AI仮説/承認/表示と未着手/観測停止/正常を混同しない。候補を自動write/自己採択せず、再観測前に是正完了としない。 |

## 原文セルと比較候補

13行/20セル/34文区間。元row全文とmetadataをJSONに保持し、各セルの文字区間を連続保存する。否定・列挙・例外を落とさず、複合文は正式最小atom未確定として保持する。

- `OSL2-005-58-C2-A1` split / requirement：`  HARNESS自身への適用を含む観測・失敗・改善候補を、出典と適用範囲を保持して登録し、還流先へ振り分けられる。 `
- `OSL2-005-58-C2-A2` split / requirement：` 観測と作業の結果はLABOへ渡し、LABOが返す改善の提案（Feedback）を登録し、還流先へ振り分け、採否の後にticketにして回す（OSはPMにあたり、LABOはPMOとして評価と提案を出す。 `
- `OSL2-005-58-C2-A3` unresolved / navigation：` [2026-09-26 PO判断](../../governance/decisions/handoff-integration-po-decisions-2026-09-26.md)）。 `
- `OSL2-005-58-C2-A4` split / requirement：` 改善の評価と研究はHELIX-LABOが担う（[HELIX-LABOの候補](../../helix-labo/candidates/improvement-research-requirements.md)、2026-09-25 PO判断）  `
- `OSL2-005-58-C4-A1` split / acceptance：`  改善候補を出典と適用範囲付きで登録し、経験を正本へ勝手に昇格させず、還流先の欠落を検出できる  `
- `OSL2-007-60-C2-A1` OS保持 / requirement：`  Worker・判断・操作・検証のログと証拠を、Conceptの1.0土台（BASE-01）の共通形式で保存し、対象プロジェクトと要求revisionから参照できる  `
- `OSL2-007-60-C4-A1` OS保持 / acceptance：`  欠落・重複・古い証拠を識別し、ログの存在だけで承認・完了にしない  `
- `OSL2-012-65-C2-A1` unresolved / navigation：`  【HELIX-LABOへ移管（2026-09-25 PO判断）】技術調査。 `
- `OSL2-012-65-C2-A2` unresolved / navigation：` 本文は[HELIX-LABOの候補](../../helix-labo/candidates/improvement-research-requirements.md)へ移した  `
- `OSL2-012-65-C4-A1` split / acceptance：`  要求整理前や設計途中の調査は工程内の調査（Research ticket）とする  `
- `OSL2-013-66-C2-A1` unresolved / navigation：`  【HELIX-LABOへ移管（2026-09-25 PO判断）】同じ仕事の横断診断。 `
- `OSL2-013-66-C2-A2` unresolved / navigation：` 本文は[HELIX-LABOの候補](../../helix-labo/candidates/improvement-research-requirements.md)へ移した  `
- `OSL2-013-66-C4-A1` split / acceptance：`  同じ仕事への関連付けに使う原記録の保存はHELIXOS-L2-007に残す  `
- `OSL11-005-25-C2-A1` split / acceptance：`  HARNESS自身への適用と各productの観測から改善候補を出典と適用範囲付きで登録し、還流先へ振り分けて採否・変更・再検証まで追跡する。 `
- `OSL11-005-25-C2-A2` split / acceptance：` 未承認経験の規則化、HARNESS改善責務の欠落、棄却理由の消失、還流先の欠落を拒否する。 `
- `OSL11-005-25-C2-A3` split / acceptance：` 改善の効果と退行の評価はHELIX-LABOの候補で確認し、OSの登録件数やログ量を改善達成としない。 `
- `OSL11-005-25-C2-A4` split / acceptance：` 観測と作業の結果がLABOへ渡り、LABOが返した改善の提案が登録・振り分けされてticketへ辿れることを確かめ、LABOの提案がOSのauthorityを直接書き換える構成を拒否する  `
- `OSL11-007-27-C2-A1` OS保持 / acceptance：`  Worker・判断・操作・検証のログを、Conceptの1.0土台（ログと証拠）の共通形式で要求revisionから辿り、欠落・重複・staleを成功証拠として使わない。 `
- `OSL11-007-27-C2-A2` OS保持 / acceptance：` 共通形式の欠けた記録を、他の機構の記録と結べない不完全な記録として識別する  `
- `OSL11-012-32-C2-A1` unresolved / navigation：`  【HELIX-LABOへ移管（2026-09-25 PO判断）】技術調査の受入条件は[HELIX-LABOの候補](../../helix-labo/candidates/improvement-research-requirements.md)へ移した  `
- `OSL11-013-33-C2-A1` unresolved / navigation：`  【HELIX-LABOへ移管（2026-09-25 PO判断）】同じ仕事の横断診断の受入条件は[HELIX-LABOの候補](../../helix-labo/candidates/improvement-research-requirements.md)へ移した  `
- `CAND-005-30-C3-A1` split / requirement：`  HARNESS自身への適用を含む観測・失敗・改善候補を評価し、採択後の変更・再検証・効果確認まで改善の効果と退行を研究できる。 `
- `CAND-005-30-C3-A2` split / requirement：` 改善候補の登録と還流先への振り分けはHELIX-OSに残す  `
- `CAND-005-30-C5-A1` split / acceptance：`  HARNESS自身と各productの改善を同じ機構で追跡し、経験を正本へ勝手に昇格させず、訂正・棄却・保留・失効と影響範囲を確認できる  `
- `CAND-012-31-C3-A1` split / requirement：`  内部system情報と外部技術情報を、出典・revision・時点・取得範囲・欠落・適用条件付きで調査できる  `
- `CAND-012-31-C5-A1` split / acceptance：`  内部事例を先に照合し、不足分だけを未信頼外部情報として取得する。 `
- `CAND-012-31-C5-A2` split / acceptance：` 秘密を送信せず、取得文の命令やpatchを実行せず、closed／mergedだけで解決済みにしない。 `
- `CAND-012-31-C5-A3` split / acceptance：` 要求整理前や設計途中の調査は工程内の調査（Research ticket）とし、本要求に含めない  `
- `CAND-013-32-C3-A1` split / requirement：`  管理・推進・検収・Worker・crawler・CIを同じ仕事へ関連付け、要求からの欠落と失敗からの原因候補を双方向に診断して是正効果まで追跡できる  `
- `CAND-013-32-C5-A1` split / acceptance：`  観測事実・AI仮説・承認・表示、未着手・観測停止・正常を区別する。 `
- `CAND-013-32-C5-A2` split / acceptance：` 管理自身も是正対象とし、自動writeせず、修正後の症状と退行を再観測する  `
- `CAND-012-58-C2-A1` split / acceptance：`  内部情報の欠落と外部情報の相違を保持し、秘密送信、取得命令実行、外部patch自動採用、closed／mergedだけの解決認定を拒否する  `
- `CAND-013-59-C2-A1` split / acceptance：`  同じ仕事について上流からの欠落と失敗からの原因候補を突合し、管理自身を含む是正ticket、再検証、再観測へ辿る。 `
- `CAND-013-59-C2-A2` split / acceptance：` 未着手や観測停止を正常と表示しない  `

## authority照合

9/28 decisionの固定commit `f6dad2a33e24f000b87d7f09b8d40288257e74cc`と選択OS8行を照合。exact row一致は8/8。行一致から全current fileや保持候補の採択を生成しない。

## consumer参照の検査範囲

`rg --json --hidden HELIXOS-L2- docs scaffold archive/legacy-generation-2026-09-14`から4 IDの完全/略記連結/range参照を保存：540 files/5813 lines。各path/file SHA・行SHA・一致区間・文字列・provenance/scaffold/currentの区別をJSONに固定する。

current docs/scaffold + readonly archive; rg default ignore rules適用、hidden対象。完全ID/略記連結/rangeの明示文字参照。日本語同義・動的dispatch・DB/runtime reader/外部repo・ignored/binaryは未検査。

参照と実動作consumerは別状態。監査の引用や旧snapshotをruntime consumerに数えず、意味上の全readerとfailureを閉じたことにしない。

## 旧source・現行条件

| ID | path | 行 | 比較内容 |
|---|---|---|---|
| OLDP4 | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/pillar-requirements.md` | 54–54 | 旧P4 detection/repair/recipe/gateと未被覆条件 |
| OLDP7 | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/pillar-requirements.md` | 56–56 | 旧P7 scope/継続正本/bounded recall/retire/expired指示/委譲証拠区別 |
| OLDP8 | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/pillar-requirements.md` | 57–57 | 旧P8 外部検索/参照/skillifyと旧GAP |
| OLDP9 | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/pillar-requirements.md` | 58–58 | 旧P9 trace/coverage/backbone、旧DB未収束条件 |
| OLDEXT | `archive/legacy-generation-2026-09-14/root/docs/design/harness/L4-basic-design/external-if.md` | 34–34 | 旧external source/version/span、外部textを命令にしない |
| LABOAGG | `docs/helix-labo/L2-requirements/labo-requirements.md` | 71–75 | LABO許可観測/source正本非移管/欠測 |
| LABOLOOP | `docs/helix-labo/L2-requirements/labo-requirements.md` | 296–302 | LABO1.0内部循環/再観測/authority非移管 |
| LABOEXT | `docs/helix-labo/L2-requirements/labo-requirements.md` | 304–309 | LABO2.0外部知識/由来/比較/実験/BRAIN候補 |
| LABOREL | `docs/helix-labo/L2-requirements/labo-requirements.md` | 342–350 | 既存005/012/013候補の状態を変えないrelation |
| BOT | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md` | 126–130 | INT1.0 Bot発行とOS割当Worker、authority非追加 |
| INTTIME | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md` | 144–147 | INT現在判断/LABO過去episode・長期効果 |
| OSNEG | `docs/helix-os/L11-acceptance/governance-acceptance.md` | 39–47 | 改善入力/原event/登録/選定/継続の反例、scope/class/retention |
| PLACEMENT | `docs/governance/decisions/mechanism-placement-po-decisions-2026-09-25.md` | 58–72 | 候補005/012/013移管、案内ID/参照保持 |

## 確認した差

- 005の改善登録/routingと研究/評価は別actor。ticket化前採否と変更後再観測を落とさない。
- 007のログ形式/provenanceとLABO派生観測は別正本。ログ件数/書込/配送成功で改善やauthorityを生成しない。
- 012/013はOSのnavigationとLABO保持候補の具体条件を両方読む必要がある。9/28のOS行採択で候補本文全体を採択済みにしない。
- INT Bot発行1.0、LABO外部知識評価2.0、工程内Research ticketを分ける。内部先行/不足分のみ外部と全BRAIN再利用知識形成は同義ではない。
- 013の現在原因仮説と過去是正効果を分け、管理自身も評価対象とし、原event/事実/仮説/承認/表示を混ぜない。
- 記号参照はprovenance/候補/runtime readerを区別する材料。参照件数は動作consumer/全failure被覆/要求完了の証明ではない。

## 未完

- 文単位に複数actor/列挙義務がある候補は正式最小atomとして未確定。原33入力の正式semantic atom集合と全consumer/failure被覆は継続する。
- 012/013の保持候補の条件は未移管/未消込のまま。明示ID参照の全量保存から同義語・dynamic/runtime・外部consumerの閉包を推定しない。
- 双方停止/retention/物理配置の未判断は#2869比較へ維持し、対象revision付き全判断packetが残る。

- 旧P9とexternal-ifは補助比較source。原33入力のidentity集合や進捗分母を増減しない。

#2089/#1861はOPEN保持。canonical/MPR/holding/Binding/要求の意味・採否・successorは変更しない。旧runtime/test/CIは未実行。
