# 検証方法・テスト技法のtemplate seed候補と調達材料

status: scaffold（seed候補と調査材料。採否、要求、設計、実装の決定ではない）
authority_effect: none
binding: [SCF-B-0153](../bindings/SCF-B-0153.json)

## 何をしたか

2026-10-01、POは次のように依頼した（原文）。

> 要求から参考リポジトリを探してくるとか、設計テンプレや検証手法、テスト手法のケースをまとめて行ったりやれることあるで。テンプレート作っとけばあとでコア作るのが楽になるだろ？材料調達や！

Claude（review_merge lane）は、材料を3つにまとめた。seed化の進め方として「Claudeがseed候補を作ってPRにし、reviewとmergeはCodexが行う」案と「材料をCodexへ渡す」案を示し、POは前者を選んだ（原文「Aで」）。

- `materials/source-inventory.md`：現行のseed（DT-SDOP）、template契約の要求、旧HELIXの関連資産（asset ID、行）、技法の名指し箇所、gapの棚卸し。
- `materials/reference-repositories.md`：採択済み・条件付き採択の要求の群ごとに、外部のrepository・OSS・標準を集めた参考資料（ライセンス、HELIXの境界と衝突する点）。**採用・技術選定ではない。**
- `materials/hybrid-zip-verification-extract.md`：`archive/reference-sources/ハイブリッド設計ドキュメントv1-fixed.zip`の検証・テスト系テンプレートと見本から、意味atomを抽出した記録（Z1〜Z21、行き先と採らないもの）。
- `templates/`：上の材料から作ったseed候補13件。

既存の設計テンプレseed（[SCF-B-0152](../bindings/SCF-B-0152.json)のDT-SDOP-001〜007）は設計側だけで、検証方法とテスト技法のtemplateが無かった（`materials/source-inventory.md` §5 gap 2・3）。本seedはそのgapを埋める候補である。

## 置き場所と形の根拠

| 判断 | 根拠 |
|---|---|
| 汎用の構造はHELIX-BRAIN、製品への適用はHELIX-HARNESS-CORE、実行・運転はHELIX-OS | `docs/helix-brain/candidates/design-template-system-requirements.md`「現行Conceptに照らした担当」。HARNESS-L2-022（HARNESSは契約を持ち、テストとCIの運転・ticket発行・検収はOS）、HARNESS-L2-005（CIの組み立てと運転はOSの検収） |
| scaffoldに置き、採否をしない | DST-HARNESS-005（seed template pack）は未採択の候補。AGENTS.md「仮の物は`scaffold/`名前空間に限り、Scaffold Bindingへ登録して置く」。先例はSCF-B-0152 |
| 各templateが持つ契約の項目 | DST-HARNESS-002（ID、version、applicability、必須input／section／field、relation、owner、negative oracle、measurement、completion、supersession）、DST-HARNESS-005（出典、採否、適用範囲、限界、negative case）、DST-HARNESS-006（適用判定と理由・判断者・対象revision・再評価条件）、HARNESS-L2-043（canonicalな正例と境界の負例） |
| 旧HELIXの形との関係 | 旧 `archive/legacy-generation-2026-09-14/root/docs/design/helix/L5-detail/design-template-json-authority.md` 33–77・103–108。**保持する点**：template必須fieldの集合、supersession、verification／measurement欄、未知をfail-closeにする考え方。**変更する点**：JSONを正本とせず、Markdownの表で持つ。**理由**：新世代のschemaはL3以降で選ぶ（design-template-system-requirements.md末尾）。SCF-B-0152 READMEと同じ扱い |
| ZIPの扱い | `scaffold/design-pattern-inventory-20260925/README.md`（SCF-B-0151）101–103行の旧判断 HVM-REJECT-01〜03（Python generator／Excel builderを移植しない、53文書を一律必須にしない、Excel buildを完了証跡の正本にしない）を守る。ZIP内のtoolは実行せず、見本の値は写さない |
| 旧の検証工程との関係 | 旧 `archive/legacy-generation-2026-09-14/root/docs/process/forward/L08-L14-verification-phase.md` 28–35（canonical pairとgate）・73–79（右腕のevidence profile）・197–205（差戻し）・213–220（追加のテスト設計の分離）。**保持する点**：左腕のtest basis → 右腕のtest condition → 必須evidenceの型、対の凍結前にテスト設計を後付けしない。**変更する点**：旧の層番号（旧G8＝L5↔L8「integration」等）とG13／G14を写さない。差戻し先を検証層で固定する旧の表は、意味が変わる層へ戻す現行の規則に置き換える。**理由**：現行HARNESS-L2-040の6組とHARNESS-L2-022の差戻しの規則 |

各templateの「旧HELIXとの対応」に、保持する点・変更する点・理由をtemplateごとに記録した。

## seed候補の一覧

| ID | 名前 | 適用条件の要点 |
|---|---|---|
| DT-VT-001 | 検証・テストの共通証拠欄と非適用の記録 | 以下のすべての証拠に共通 |
| DT-VT-002 | テスト技法カード（C01〜C40） | カードごとの「適用」「N/A」欄 |
| DT-VT-003 | 技法の選び方（提案） | 変更（ticket）ごとの技法の選択。**規則ではない** |
| DT-VT-004 | 検証設計の骨組み（方式・検証マトリクス・開始と完了の基準） | 要件をどう確かめるかを実行前に決めるとき |
| DT-VT-005 | 画面の検証 | 画面を持つ対象（5軸をN/Aにしない） |
| DT-VT-006 | PoC・Prototypeの検証（L2.5） | L2.5でPoCまたはPrototypeを適用したとき |
| DT-VT-007 | AIの成果物の検証 | AIが作った成果物を採るとき |
| DT-VT-101 | 検証方法 L1↔L12（運用評価） | 配備した製品の価値・運用品質 |
| DT-VT-102 | 検証方法 L2↔L11（利用者受入） | 利用者が触る成果 |
| DT-VT-103 | 検証方法 L3↔L10（総合検証） | システムに固有の義務 |
| DT-VT-104 | 検証方法 L4↔L9（L4との照合） | 境界・コネクタ |
| DT-VT-105 | 検証方法 L5↔L8（L5との照合） | 詳細設計の契約 |
| DT-VT-106 | 検証方法 L6↔L7（TDDの閉じ） | 振る舞いを足す・変える実装 |

版はすべて`0.1.0-seed-candidate`である。seedは普遍的な正解ではない（DST-HARNESS-005）。数値・tool名は例であり、要求の値や採用を意味しない。

## DT-SDOPで欠けていた欄の扱い

`materials/source-inventory.md` §1.1の表で欠けていた欄を、本seedでは次のように持つ。DT-SDOP-001〜007本体は変更しない（SCF-B-0152の範囲）。

| 欠けていた欄 | 本seedでの持ち方 |
|---|---|
| measurement | 数値は置かず、測る場合はHARNESS-L2-034の14項目に従い、値はL3で導くと各templateに書く（必要case数・coverage率・mutation閾値・reduction上限はHARNESS-L2で未採択） |
| supersession | 各templateの「置き換え」行 |
| layer／pair | 各templateの「対（V-pair）」行。DT-VT-101〜106は対ごとのtemplate |
| canonicalな正例 | 各templateの「正例と境界の負例」 |
| 適用判定の判断者・対象revision・再評価条件 | DT-VT-001 §2（HARNESS-L2-003がL2.5の非適用に求める6項目を流用） |
| unit／connection／compositeの別 | 各templateの「区分」行 |

## Web展開後に扱う内容

canary分析、本番のchaos、本番のSLO監視、脆弱性scanの必須化、tenantを横断する保持は、カードとして載せても1.0の必須条件にしない。DT-VT-002・003・101の該当箇所に明記した。

## 生成しないもの

- templateの採否、BRAINのseedとしての登録、要求の意味、L3以下の設計、検証義務を生成しない。
- DT-VT-003の選び方の表を、merge admission、工程の完了条件、新しい承認手続きとして使わない。
- `materials/reference-repositories.md`の候補を、採用・技術選定として扱わない。toolを導入・実行しない。
- 旧HELIXのtest・CI・runtimeを実行しない。旧資産は文書として読むだけにする。

## 後続

1. BRAINの企画（L1）ができた後、DST-HARNESS-005の採否と合わせて、本seed候補とDT-SDOPを採否する。
2. HARNESS-L2-005の検証義務の規則とHARNESS-L2-022の段階の契約をL3へ降ろすとき、DT-VT-001の欄とDT-VT-101〜106の観点を入力の候補にする。
3. `materials/source-inventory.md` §5のgapのうち、6（画面検証template）はDT-VT-005、8（ZIP catalogの未抽出）は`materials/hybrid-zip-verification-extract.md`とDT-VT-004〜007で扱った。4（connection contract、data・permission・migration・rollbackの専用の設計seed）、5（受入・運用評価側）の残り、7（未採択の数値）は本seedの範囲外として残す。ZIPのatomのうちZ17（駆動の方向をriskで決める）とZ20（スモークの最小集合）は後続の候補として残す。
4. 正式なtemplate registryとseedが入ったら、`scfctl check-replacement SCF-B-0153` → `retire`で本scaffoldを撤去する。
