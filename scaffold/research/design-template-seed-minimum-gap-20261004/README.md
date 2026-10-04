# 最小seedの未被覆領域の設計テンプレseed候補

status: scaffold（seed候補と調査材料。採否、要求、設計、実装の決定ではない）
authority_effect: none
binding: [SCF-B-0154](../../bindings/SCF-B-0154.json)

## 何をしたか

2026-10-04、POは次のように発言した（原文）。

> 並列で進められるのない？待機期間長すぎて時間がもったいないだろ。BRAIN素材をためまくるのがいいと思うがどうかね？

これを受け、review_mergeレーン（Claude）の下で、設計template system要求候補「seed templateの作り方」（`docs/helix-brain/candidates/design-template-system-requirements.md` 74–82）が挙げる最小seedの4領域のうち、既存のseed候補（[SCF-B-0152](../../bindings/SCF-B-0152.json)のDT-SDOP-001〜007、[SCF-B-0153](../../bindings/SCF-B-0153.json)のDT-VT-001〜007・101〜106）で覆われていない領域の設計テンプレseed候補を起草した。SCF-B-0153の`materials/source-inventory.md` §5 gap 1（DT-SDOP seedの欠落欄）とgap 4（最小seedの4領域の未被覆）が起点である。

- `templates/`：seed候補6件（DT-MSG-001〜006）。
- `materials/legacy-source-inventory.md`：使った旧source（asset ID、path、行、全体SHA-256）、検索範囲と結果、参照資料、現行の関連要求、持ち込まなかったもの。

旧HELIXは`archive/`を読むだけにした。旧CLI・旧hook・旧runtime・旧test・旧CI・Bunは実行していない。

## 置き場所と形の根拠

| 判断 | 根拠 |
|---|---|
| 汎用の構造はHELIX-BRAIN、製品への適用はHELIX-HARNESS-CORE | `docs/helix-brain/candidates/design-template-system-requirements.md`「現行Conceptに照らした担当」（DST-HARNESS-002・005はBRAIN、001・003・004・006・007はHARNESS-CORE）。`docs/helix-harness/L2-requirements/product-requirements.md`「Design Templateと要求backflow」（62–68） |
| scaffoldに置き、採否をしない | DST-HARNESS-005（seed template pack）は未採択の候補。AGENTS.md「仮の物は`scaffold/`名前空間に限り、Scaffold Bindingへ登録して置く」。先例はSCF-B-0152・0153。Bindingは[SCF-B-0154](../../bindings/SCF-B-0154.json) |
| 各templateが持つ契約の項目 | DST-HARNESS-002（ID、version、applicability、必須input／section／field、relation、owner、negative oracle、measurement、completion、supersession）、DST-HARNESS-005（出典、採否、適用範囲、限界、negative case）、DST-HARNESS-006（適用判定と理由・判断者・対象revision・再評価条件）。SCF-B-0153が足した「区分」「対（V-pair）」「正例と境界の負例」「置き換え」の行もそろえた |
| 旧HELIXの形との関係 | 旧 `archive/legacy-generation-2026-09-14/root/docs/design/helix/L5-detail/design-template-json-authority.md` 33–77・103–108（LEGACY-ASSET-98372FEE8A3AC8F9C299）、L4版 83–91（LEGACY-ASSET-4F5A1F0739EC1111D91D）。**保持する点**：template必須fieldの集合、supersession、未知をfail-closeにする考え方。completion（旧L4 83–91）のうち、必須section／fieldのcoverage、requirement trace、negative oracle、measurementまたは根拠付きN/A、V-pairへの引渡し（各templateの「検証への対応」）、未決の欄に行き先を書くこと（旧の明示defer）を、各templateの完了条件に持つ。**変更する点**：JSONを正本とせず、Markdownの表で持つ。旧のcompletionのうち、source／template／instance revision digestの一致（旧L4 91、旧L5 76）、independent review（旧L5 76）、stale条件（旧L5 74）、閉じたdownstream artifact kind（旧L5 77）は、本seed候補では持たない。**理由**：digestの一致・staleの判定・artifact kindの閉集合は、template registryとinstanceの版管理の契約であり、DST-HARNESS-002（version、supersession）・DST-OS-001〜005（registry・適用の記録）として別に導く対象である。seed候補の段でMarkdownに写すと、registryの形を先に決めることになる（新世代のschemaはL3以降で選ぶ、design-template-system-requirements.md末尾）。independent reviewは現行の独立review（AGENTS.md）が持ち、templateの完了条件に重ねない。SCF-B-0152・0153 READMEと同じ扱い |
| 各templateの「旧HELIXとの対応」 | AGENTS.md「再構築の原則」。templateごとに旧source（asset ID、path、行、全体SHA-256）、保持する点、変更する点、理由を書いた。旧に根拠が見つからない欄は、検索範囲と結果を`materials/legacy-source-inventory.md` §2に書き、templateの末尾で新規案と明示した |
| ZIPの扱い | `archive/reference-sources/ハイブリッド設計ドキュメントv1-fixed.zip`は旧HELIXの資産ではなくPO提供の参照資料。章立てと欄の名前だけを参照し、`tools/`は実行せず、見本の値は写していない（`scaffold/research/design-pattern-inventory-20260925/README.md` 101–103 HVM-REJECT-01〜03） |

## seed候補の一覧

| ID | 名前 | 区分 | 適用条件の要点 | 主な対 |
|---|---|---|---|---|
| DT-MSG-001 | 接続契約（方向・dataの意味・順序・timeout・再送・冪等性・部分失敗） | connection | dataまたは操作の要求が単体の境界を越える辺ごと | L4↔L9、L5↔L8 |
| DT-MSG-002 | データ・migration・rollback（意味と所有、schema変更、移行、巻戻し、backfill） | unit／connection | 永続dataを追加・変更・削除する変更 | L4↔L9、L5↔L8 |
| DT-MSG-003 | 権限・privacy・外部interface | unit／connection | 操作ごとの権限の差、個人情報・秘密・外部へ出るdata、外部向けinterfaceのいずれか | L3↔L10、L4↔L9、L5↔L8 |
| DT-MSG-004 | 単体の振る舞い（入出力の契約、副作用、失敗の分類、回復） | unit | 振る舞いを足す・変える単体。状態・規則はDT-SDOP-004と併用 | L5↔L8、L6↔L7 |
| DT-MSG-005 | 構成体（境界、構成要素、依存の向き、end-to-endの流れ、構成体に固有の義務） | composite | 複数の単体と接続で一つの成果を出す対象 | L4↔L9、L3↔L10 |
| DT-MSG-006 | 設計時のtestability（観測、制御、oracleの出所、失敗に届く） | 区分を問わない | DT-MSG-001〜005・DT-SDOP-004を適用した設計成果物 | 設計側（L4・L5・L6） |

版はすべて`0.1.0-seed-candidate`である。seedは普遍的な正解ではない（DST-HARNESS-005）。数値の閾値・既定値は置いていない（値は要求とL3以降で導く）。templateの完了条件を満たしても、設計の正しさ・要求の充足・検証の合格を意味しない。

## 最小seedの4領域と既存seedとの境界

`design-template-system-requirements.md` 79–82の各語が、どのtemplateで扱われるか。

| 領域（79–82） | 語 | 扱うtemplate | 既存seedとの境界 |
|---|---|---|---|
| unit | behavior、input／output、failure、recovery | DT-MSG-004 | state・業務規則・冪等性はDT-SDOP-004だけが持つ。事前・事後条件（SDOP-004 §1）、副作用（§3）、失敗と途中停止の問い（§4）は、DT-MSG-004 §2〜§5がその行を参照して詳細化する。同じ条件・回復判断の正本を二か所に作らない |
| unit | state | DT-SDOP-004 §3（既存） | 新規に作らない |
| connection | contract、direction、data meaning、ordering、timeout、retry、idempotency、partial failure | DT-MSG-001 | timeout・retry・circuit breakerの全体方針はDT-SDOP-002 A、冪等性の方式の選択はDT-SDOP-004 §5。DT-MSG-001は辺ごとの契約だけを持つ |
| composite | architecture、boundary、dependency、end-to-end flow | DT-MSG-005 | — |
| composite | capacity | DT-SDOP-002 B（既存） | DT-MSG-005 §6は「詰まりうる段の候補」だけを書き、値はSDOP-002へ |
| composite | security | DT-SDOP-002 E（既存）、DT-MSG-003 | DT-MSG-005 §6は境界ごとの参照だけ |
| composite | observability | DT-SDOP-001・003（既存） | DT-MSG-005 §6は流れを跨ぐ相関IDだけ |
| composite | operation | DT-SDOP-003（既存） | DT-MSG-005 §6は止める・戻す単位だけ |
| data系 | data | DT-MSG-002 §1・§2 | — |
| data系 | permission、privacy、external interface | DT-MSG-003 | 認証方式・暗号化・診断等の値はDT-SDOP-002 E。AWS採用時はDT-SDOP-006 |
| data系 | migration、rollback | DT-MSG-002 §3〜§6 | 案件全体の移行計画（方式、リハーサル、停止時間、告知）はDT-SDOP-002 D、deployとロールバックの運用はDT-SDOP-003 |
| data系 | testability | DT-MSG-006 | 検証の技法・証拠・合否はDT-VT。DT-MSG-006は設計が検証を可能にしているかだけを持つ |

DT-VTとの境界：DT-VTは「どう確かめるか」（技法、対ごとの検証方法、証拠の欄）を持つ。本seedは設計の欄を持ち、各templateの「検証への対応」の節でDT-VT-103〜106へ渡すだけにした。DT-VTの欄を重ねて持たない。

## 未作成にした領域と理由

| 領域 | 理由 |
|---|---|
| unitのstate（状態遷移の専用template） | DT-SDOP-004 §3（状態×イベントのマトリクス、空欄を残さない）で覆われている。別templateにすると同じ欄が二か所になる |
| compositeのcapacity・observability・operationの専用template | DT-SDOP-002 B、DT-SDOP-001、DT-SDOP-003で覆われている。DT-MSG-005 §6で参照するだけにした |
| compositeのsecurityの専用template | DT-SDOP-002 EとDT-MSG-003で覆われている。加えて、Web展開後のSecurity・インフラの内容を1.0へ前倒ししないPO方針（SCF-B-0152 README、SCF-B-0153 README「Web展開後に扱う内容」）に従い、公開境界の強制・攻撃対策の必須化は欄にしていない |
| DT-SDOP seedの欠落欄の補修（gap 1） | SCF-B-0153 README「DT-SDOPで欠けていた欄の扱い」で、欠落欄（measurement、supersession、layer／pair等）の持ち方が既に示されている。DT-SDOP本体の変更はSCF-B-0152の範囲であり、本seedでは行わない。本seedの6件は欠落欄を最初から持つ |
| event・message schemaの専用template | 旧の台帳（`docs/design/design-catalog.yaml` 716–720）で`todo`だった文書種。DT-MSG-001（辺ごとの意味・順序・版）とDT-MSG-003 §4（外部interfaceの版）で欄の大部分を覆えるため、別templateにしなかった。webhookの署名等は1.0の必須欄にしない |
| DPIA（privacyの影響評価）の専用template | 全対象に課すと過剰な制限になる。要否は要求・法令の判断。DT-MSG-003の参考資料の行に理由を書いた |

## 使った旧source

詳細（行と全体SHA-256）は`materials/legacy-source-inventory.md` §1。

| asset ID | path（`archive/legacy-generation-2026-09-14/root/`から） | template |
|---|---|---|
| LEGACY-ASSET-429C82941E059B0F3D12 | `docs/skills/api-and-interface-design.md` | 001 |
| LEGACY-ASSET-E2D57A016FBD3D312CFA | `docs/skills/api-contract.md` | 001、003 |
| LEGACY-ASSET-1748EB65920E9CD3056C | `docs/skills/api.md` | 003 |
| LEGACY-ASSET-BF64B4AE03DD092532C2 | `docs/skills/data-migration.md` | 002 |
| LEGACY-ASSET-BDEA31FD6C091F282674 | `docs/skills/db.md` | 002 |
| LEGACY-ASSET-18BB86CC5625C31430B8 | `docs/skills/ci-deploy-and-rollback.md` | 002 |
| LEGACY-ASSET-95E14F385D8C1F71C209 | `docs/skills/deprecation-cutover.md` | 002 |
| LEGACY-ASSET-2489EB465FD99C6961DB | `docs/skills/security.md` | 003 |
| LEGACY-ASSET-EAE3071CBB838B8FB1E3 | `docs/skills/threat-model.md` | 003 |
| LEGACY-ASSET-679FD45E5E541F11BC62 | `docs/skills/security-and-hardening.md` | 003 |
| LEGACY-ASSET-7A6AE033EE171D1CE604 | `docs/skills/harness-observability.md` | 003、006 |
| LEGACY-ASSET-12A39A2481B480E18FE2 | `docs/skills/test-thinking.md` | 003、006 |
| LEGACY-ASSET-E5858DF0B85B6C5CEB64 | `docs/skills/system-design-sizing.md` | 005 |
| LEGACY-ASSET-DDEE27A6A7686A490CA5 | `docs/skills/design-doc.md` | 005 |
| LEGACY-ASSET-2EFC00A82748E40D2568 | `docs/design/harness/L4-basic-design/external-if.md` | 001、005 |
| LEGACY-ASSET-99C939E249CAF40935CB | `docs/design/harness/L4-basic-design/architecture.md` | 005、006 |
| LEGACY-ASSET-A440E0F5465A4EBF9855 | `docs/design/harness/L5-detailed-design/if-detail.md` | 001 |
| LEGACY-ASSET-7873E44594456A8F925A | `docs/design/harness/L5-detailed-design/internal-processing.md` | 004 |
| LEGACY-ASSET-656F75AF81EE933415D9 | `docs/design/harness/L5-detailed-design/durability-boundaries.md` | 004 |
| LEGACY-ASSET-0327D0DF98618D3066FD | `docs/design/harness/L6-function-design/source-boundary-contracts.md` | 001、004 |
| LEGACY-ASSET-BB08D70A42B6445B2D1E | `docs/design/helix/L4-basic-design/event-projection-checkpoint-replay.md` | 001、005 |
| LEGACY-ASSET-C3DE79BA9451172F3E43 | `docs/design/helix/L5-detail/product-data-connector.md` | 002、003 |
| LEGACY-ASSET-4CAC3EB72DAD353A64D7 | `docs/templates/design/L6-function-spec-template.md` | 004 |
| LEGACY-ASSET-D492D527A60A660722FF | `.claude/agents/be-logic.md` | 004、006 |
| LEGACY-ASSET-959AA9A446E3F1F16B7A | `.claude/agents/db-schema.md` | 002 |
| LEGACY-ASSET-EF44FCF2D722F986E609 | `.claude/agents/be-api.md` | 003 |
| LEGACY-ASSET-5E22432B0A5A8F7CC8B3 | `docs/governance/ddd-tdd-rules.md` | 006 |
| LEGACY-ASSET-70DA9B8C03E54A629039 | `docs/design/helix/L5-detail/design-reality-binding.md` | 006 |
| LEGACY-ASSET-EC07511FF3E241F15359 | `docs/design/design-catalog.yaml` | 001、002、003（旧で未充足だった文書種） |
| LEGACY-ASSET-4F5A1F0739EC1111D91D | `docs/design/helix/L4-basic-design/design-template-json-authority.md` | 全件（契約の形） |
| LEGACY-ASSET-98372FEE8A3AC8F9C299 | `docs/design/helix/L5-detail/design-template-json-authority.md` | 全件（契約の形） |

旧の`.claude/agents/`は旧世代のAI設定であり、AGENTS.mdに従い実行・session instructionとして使わず、設計の観点の出典として読んだだけである。

## 生成しないもの

- templateの採否、BRAINのseedとしての登録、要求の意味、L3以下の設計、検証義務を生成しない。
- HELIX-CONNECT・HELIX-SECURITY・HELIX-INFRASTRUCTUREのL2候補の意味を変えない。本seedは製品設計の汎用の欄であり、HELIX自身の機構の要求はそれぞれのL2候補が持つ。
- 数値の閾値・既定値、技術選定を生成しない。外部の一般知識（STRIDE、arc42、ISO/IEC 25010、expand／contract）は出典名を付けた参照であり、採用ではない。

## 後続

1. BRAINの企画（L1）ができた後、DST-HARNESS-005の採否と合わせて、本seed候補・DT-SDOP・DT-VTを採否する。
2. 正式なtemplate registryとseedが入ったら、`scfctl check-replacement` → `retire`で本scaffoldを撤去する。
