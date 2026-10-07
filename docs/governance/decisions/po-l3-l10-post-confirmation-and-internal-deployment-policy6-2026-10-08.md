---
title: "L3／L10の機構×Stage事後確認と、内部デプロイ方針6（型番・ディレクトリ構成）の確定 PO decision record（2026-10-08）"
decision_record_id: HDEC-PO-L3-L10-POSTCONFIRM-AND-STAGE-RELEASE-POLICY6-2026-10-08
decision_status: recorded
decider_role: PO
decided_at: 2026-10-08
recorded_at: 2026-10-08
source: 2026-10-08（Asia/Tokyo）のClaude作業session（lane `review_merge`）でのPOの発言
authority_effect: effective_when_this_record_is_admitted_to_main
---

# L3／L10の事後確認と、内部デプロイ方針6の確定（2026-10-08）

## 記録の範囲

本書は、POが同じ発言で示した二つの判断を記録する。

1. [L3／L10承認の委任判断](l3-l10-approval-delegation-po-decision-2026-10-05.md)と[GitHub上流運用モデル「POの事後確認」](../github-upstream-operating-model.md#poの事後確認)に基づく、L3／L10の機構×Stage事後確認。
2. [段階リリースを内部デプロイとして扱う判断記録](stage-release-internal-deployment-po-decisions-2026-10-07.md)（HDEC-STAGE-RELEASE-INTERNAL-DEPLOYMENT-2026-10-07）で「PO確認待ち」とした方針6の確定。

既存の判断記録、一覧の時点記録、監査記録は書き換えない。本書から、L2の変更、新しい承認手続き、L10の実行・合格、実装・運転・release・tag・cutover・配布・外部公開の許可、Issue closeを生成しない。

## POの発言

2026-10-08、POは会話で次の整理を示し、末尾で「これで合意で」と述べた。整理のうち判断の範囲を定める部分を、原文のまま引用する。

> **今、判断へ進めてよいのは「型番・ディレクトリ方針の追加承認」と「L3／L10のPO事後確認」です。**

> **部品・接続・システムを種別付きの型番で識別し、台帳で版・検証範囲・内部デプロイ状態を管理する。コードと設定の配置はアプリケーション構造へ合わせるが、フォルダの場所を部品の識別子や境界の正本にはしない。具体的なディレクトリ配置・台帳形式はL4で決め、`docs/`は今回変更しない。**

> 確認対象は、main `786ee7c8`の事後確認一覧と、その基点 **`911b896f`**に結び付く承認対象版です。274親の承認経路を照合した資料は揃っていますが、**試験の実行合格、製品完成、実装・切替・配布の一括許可まで認める判断にはしません。**

> **私の推奨は「方針6は追加承認。L3／L10は現行一覧で事後確認へ進む。未決4論点と実施許可は含めない」です。** 未決論点に依存しない作業まで止める必要はありません。承認・事後確認の記録は、まだ変更していません。これで合意で

## 判断1：L3／L10の機構×Stage事後確認

### 確認したもの

- 一覧：main `786ee7c85c5454e3b2314c1d8ee3ca28f5178db1` の[L3／L10 PO事後確認一覧](../l3-l10-po-post-confirmation.md)（SHA-256 `b6dff5ec2096267263587962c29095869659a406b4fcaee2de04a6482250b002`）。
- 一覧の確認基点：main `911b896f9207c86feba65c65042363f13ae408a3`。承認経路の照合は[final admission closure snapshot](../audits/requirements-stage/l3-final-admission-closure-2026-10-08-911b896f.json)（SHA-256 `9a5cf035205436bdef182aa94426f221b8cdeed793254185bd06a8dfcb189165`）に固定されている。
- 一覧の独立review：[PR #2673 review01 comment 6043466870](https://github.com/RetryYN/HELIX-HARNESS/pull/2673#issuecomment-6043466870)（Major 0、Minor 0、未確認範囲なし）。merge/read-afterは[comment 6043495140](https://github.com/RetryYN/HELIX-HARNESS/pull/2673#issuecomment-6043495140)。

### 対象

固定1.0 rosterの274親（8機構、41の機構×Stage group）について、上の一覧とsnapshotが示す承認対象の本文revisionと判断記録。内訳は、直接PO判断12親、委任条件1〜3とmain admissionを経た85親、既存main承認記録177親である。177親は、2026-10-07に条件1の誤帰属が判明した9件の旧判断記録を根拠にしていない。

### 判断

POは、上の対象について、委任による承認を事後確認した。差し戻す対象はない。

運用モデル「POの事後確認」のとおり、差し戻しが必要になった場合は、別の差し戻し判断記録で対象revisionの承認を取り消す。本書はその手続きを変えない。

### 含めないもの

- L10 fixtureの実行・合格、製品の完成、実装・切替・配布の許可。
- 274親全体の意味を一から再監査したという主張。本判断は、委任承認の経路と対象revisionの事後確認である。
- 確認基点 `911b896f` より後に承認対象が変わったもの。例えば、作業中のPR #2674（SECURITY Stage 2c 親031の修正）が委任承認を経てmainへ入った場合、その新しいrevisionは本書の対象に含まれない。次の事後確認で扱う。

## 判断2：内部デプロイ方針6（型番とディレクトリ構成）の確定

### 確定する範囲

[段階リリースを内部デプロイとして扱う判断記録](stage-release-internal-deployment-po-decisions-2026-10-07.md)の「PO確認待ちの整理（未確定。本書から効力を持たない）」にある「6. 型番と、アプリケーション構造に合わせたディレクトリ構成」を、そこに書かれた本文のとおり確定する。

- 確定する本文：PR #2651の本文revision `5ceb31959227185d662a2b9d002926ae2e1e679e` で加えた方針6の節。main `786ee7c85` の同じ節は、この版とbyte単位で同じである（節の本文SHA-256 `745e84cc89a10d5036cc86341a10b2ca3e6c7a5f4d5338ffe4a8e073d2a94ae6`）。
- この版への独立review：[PR #2651 comment 6040252851](https://github.com/RetryYN/HELIX-HARNESS/pull/2651#issuecomment-6040252851)（Codex、no findings、未確認範囲なし）。
- 要点：部品（パック）・接続・システム（段階）の識別子を「型番」として一つの台帳で管理し、台帳の各行に種別、identity、契約・成果物・依存の版、検証範囲、内部デプロイの状態を持たせる。項目はHARNESS-L2-010とHELIXOS-L2-014が定めるものをそのまま使い、新しい項目は足さない。実装を始めたら、コードと設定のディレクトリ構成をアプリケーションの構造に合わせるが、フォルダのpathを型番やパックの境界の正本にしない。正本は台帳の識別子である。
- 具体的なディレクトリ配置と台帳の形式はL4の設計で決める。文書（`docs/`）の構成は、既存の判断のまま変えない。

元の判断記録の方針6の節は、時点の記録として書き換えない。方針6の効力は、本書がmainへ入った時点で生じる。

## 未決のまま残すもの（本書に含めない）

POの整理どおり、次の4論点は今回の判断から分けて残す。機能を却下するものではない。

1. Web由来の追加要求001／012の採否と対象版（[Development Compilerの判断記録](development-compiler-stages-po-decisions-2026-10-06.md)の未決事項）。
2. 製品開発フィードバックとHELIX-Benchの具体的な分け方（同上）。
3. Ticketを本文外の依存グラフへどう配置するか（同上）。
4. 段階を組み直さずに、部品・接続を単独で内部デプロイしてよいか（[内部デプロイの判断記録](stage-release-internal-deployment-po-decisions-2026-10-07.md)の「POへの問い（未決）」）。現行のHELIXOS-L2-014は段階を単位としており、単独のデプロイを許すとL2の意味の変更にあたる。

これらに依存しない作業は止めない。

## 旧HELIXとの対応

| 旧source | 保持する点 | 変える点 |
|---|---|---|
| 旧`CLAUDE.md`「自律境界」（`archive/legacy-generation-2026-09-14/root/CLAUDE.md`。人は企画・要求・デザインモックを持ち、要件は承認のみ） | 人が要件の承認に関わること | 2026-10-05のPO判断で、L3の承認をOpusとFableの一致へ委任し、POは機構×Stageの区切りで事後確認する形にした（変更は既存の委任判断記録に記録済み。本書は新しい変更を加えない） |
| 方針6の旧source（内部デプロイの判断記録「旧HELIXとの対応」のHWG-R06、HWG-AC-07ほか） | 同判断記録の記載のとおり | 本書で新しく変える点はない |

## 本書から生成しないもの

L2の変更、新しい承認手続き・merge gate、L10の実行・合格、v0.1の宣言、実装・運転・release・tag・cutover・配布・外部公開の許可、Issue close。
