# システム設計・運用保守プレイブックの設計テンプレseed候補

status: scaffold（seed候補。採否、要求、設計、実装の決定ではない）
authority_effect: none
binding: [SCF-B-0152](../bindings/SCF-B-0152.json)
source package: `archive/reference-sources/system-design-ops-playbook-2026-09-29.zip`
source package SHA-256: `f8b34013192a7e0f70030bab36f442502dbfd238f4fde80383d689ba632d0d73`

## 何をしたか

2026-09-29、POは作業用のskill「system-design-ops-playbook」（Claude用のskill形式。`SKILL.md`、`references/` 7件、`assets/` 7件の計15ファイル）を渡し、「このスキルを設計テンプレに変換してフォルダ削除まで進めておくれ」と依頼した。

- 元の15ファイルは、bytesを変えずに`archive/reference-sources/`へZIPで保存した（参照用。実行しない、正本にしない）。
- skillの本文を、設計テンプレのseed候補7件（`templates/DT-SDOP-001〜007`）と、HELIX-OSの司会進行の材料1件（`os-decision-facilitation-input.md`）へ分けた。
- 作業中のPOの発言（WBS系の決めるものをOSに載せる、手法を組み合わせてOSがHARNESSと連携して「どこまで決めるか」を扱う、PoC・プロトにログを差し込む工程）は、`docs/helix-os/sources/decision-facilitation-po-original-2026-09-29.md`に原文のまま保存した。
- repositoryの外にあった元のフォルダ（作業treeの未追跡`system-design-ops-playbook/`）は、ZIPの内容一致を確かめてから削除する。

## 置き場所と形の根拠

| 判断 | 根拠 |
|---|---|
| templateの汎用の構造はHELIX-BRAIN、製品への適用はHELIX-HARNESS-CORE | `docs/helix-brain/candidates/design-template-system-requirements.md`「現行Conceptに照らした担当」（DST-HARNESS-002・005はBRAIN、001・003・004・006・007はHARNESS-CORE）。`docs/helix-harness/L2-requirements/product-requirements.md`「Design Templateと要求backflow」 |
| scaffoldに置き、採否をしない | seed template packの要求（DST-HARNESS-005）は未採択の候補である。AGENTS.md「仮の物は`scaffold/`名前空間に限り、Scaffold Bindingへ登録して置く」 |
| 各templateが持つ契約の項目 | DST-HARNESS-002（ID、version、applicability、必須input／section、relation、owner、negative oracle、measurement、completion、supersession）とDST-HARNESS-005（出典、採否、適用範囲、限界、negative case） |
| 旧HELIXの形との関係 | 旧`archive/legacy-generation-2026-09-14/root/docs/design/helix/L4-basic-design/design-template-json-authority.md` §1・§4（template ID/version、適用条件、必須input/section/field、negative oracle、measurement、completion）。**保持する点**：契約の項目の集合と、未知の条件をfail-closeにする考え方。**変更する点**：JSONの正本とせず、Markdownの表で持つ。**理由**：新世代のschemaはL3以降で選ぶ（design-template-system-requirements.md末尾）。適用条件を閉じた式木にするのも、そのschemaが決まってからにする |
| 原本の保存の仕方 | `archive/reference-sources/README.md`の先例（ハイブリッド設計ドキュメントのZIPを参照用に保存し、SCF-B-0151で調査記録を束縛した） |

## 元のファイルの行き先（全15件）

| 元のファイル | 行き先 | 扱い |
|---|---|---|
| `SKILL.md` 根底にある考え方・進め方・クイックチェック | `templates/DT-SDOP-007` | 判断の軸7項目と問い10項目。HELIXの規則と重なる点はHELIXの規則を優先すると明記 |
| `SKILL.md` frontmatter（name、description）・使い方の表 | 採らない | Claudeのskillの起動条件とファイル案内であり、設計の意味を持たない |
| `references/01-logging.md` | `templates/DT-SDOP-001` | §7のキャリアの話（「障害対応で頼られる」「キャリアが広がる」等）は設計の意味を持たないため採らない。§8の設定例（Python、logrotate、Nginx）は実装例としてZIPに残し、templateへ写さない |
| `references/02-nonfunctional-requirements.md` | `templates/DT-SDOP-002` | 中項目の枠を収録。小項目の一覧は出典参照 |
| `references/03-maintainability.md` | `templates/DT-SDOP-003` | |
| `references/04-logic-design.md` | `templates/DT-SDOP-004`、§5の深さは`os-decision-facilitation-input.md` D4にも | コード片は例としてZIPに残す |
| `references/05-dependencies.md` | `templates/DT-SDOP-005` | Renovateの自動merge設定例は、HELIXの運用規則（独立review・明示merge）と別であり採らないと明記 |
| `references/06-aws.md` §1・§2・§4 | `templates/DT-SDOP-006` | 適用条件をAWS採用時に限る。Web展開後に扱うSecurity・インフラの内容を1.0へ前倒ししないと明記 |
| `references/06-aws.md` §3（決める時期と深さ） | `os-decision-facilitation-input.md` D1〜D3 | POの意図（OSの司会進行）に当たる |
| `references/07-process-and-roles.md` §1〜§5・§7・§8 | `os-decision-facilitation-input.md` A〜F | 同上 |
| `references/07-process-and-roles.md` §6（工程ごとの担当・契約形態） | 採らない | 日本のSI案件の人の体制と契約。理由は`os-decision-facilitation-input.md`「対象外とする候補」 |
| `assets/checklist-nonfunctional.md` | `templates/DT-SDOP-002`本体、ロジックの項は`DT-SDOP-004` | 「決定値・決定者・決定日・根拠、対象外はN/Aと理由」の使い方を完了条件へ |
| `assets/checklist-aws.md` | `templates/DT-SDOP-006`本体 | |
| `assets/template-logging-design.md` | `templates/DT-SDOP-001`本体 | |
| `assets/template-logic-design.md` | `templates/DT-SDOP-004`本体 | |
| `assets/template-runbook.md` | `templates/DT-SDOP-003`本体 §3 | |
| `assets/template-adr.md` | `os-decision-facilitation-input.md` C3 | 製品の設計判断のADRと、HELIXの判断記録を混同しないと明記。置き場所は未決 |
| `assets/template-raci-open-issues.md` | `os-decision-facilitation-input.md` C1・C2 | RACIを新しい承認手続きにしないと明記 |

## seed候補の一覧

| ID | 名前 | 適用条件の要点 |
|---|---|---|
| DT-SDOP-001 | ログ設計 | 稼働中に動作記録を出す実行物 |
| DT-SDOP-002 | 非機能要件・運用設計 | 稼働・運用される対象 |
| DT-SDOP-003 | 保守性・監視・アラート・ランブック | リリース後に稼働・保守される対象 |
| DT-SDOP-004 | ロジック設計 | 条件分岐の業務規則、状態、外部への副作用のいずれかを持つ処理 |
| DT-SDOP-005 | 外部サービス・依存関係の選択と更新管理 | 外部の依存を持つ対象 |
| DT-SDOP-006 | AWS採用時の初期設計 | AWSを選んだ対象に限る |
| DT-SDOP-007 | 設計レビューの最低限の確認 | 上記を横断するreview |

版はすべて`0.1.0-seed-candidate`である。seedは普遍的な正解ではない（DST-HARNESS-005）。数値・製品名は例であり、要求の値や採用を意味しない。

## 生成しないもの

- templateの採否、BRAINのseedとしての登録、要求の意味、L3以下の設計を生成しない。
- 発言1〜4から、OS・HARNESSの要求の採択やL1・L2の改訂を生成しない。要求候補へ起こすときは、`os-decision-facilitation-input.md`の「既存候補との関係」と「未決」を照合し、POの採否を経る。
- プレイブックの例（コード、設定ファイル、Terraform）を実行しない、現行pathの実装へcopyしない。

## 後続

1. BRAINの企画（L1）ができた後、DST-HARNESS-005の採否と合わせて、本seed候補の各templateを採否する（design-template-system-requirements.md「この担当は…BRAINの企画（L1）ができた後に要求として採否する」）。
2. 発言1〜4を、OSのWBS台帳候補（WBS-OS-001〜008）・`HELIXOS-L2-039`・`HARNESS-L2-045`・`HARNESS-L2-008`／`012`と照合して要求候補へ起こし、PO判断packetへ載せる。
3. 正式なtemplate registryとseedが入ったら、`scfctl check-replacement SCF-B-0152` → `retire`で本scaffoldを撤去する。
