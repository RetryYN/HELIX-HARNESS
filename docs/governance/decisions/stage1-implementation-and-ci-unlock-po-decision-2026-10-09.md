---
title: "Stage 1の実装と新世代CIの解禁 PO decision record（2026-10-09）"
decision_record_id: HDEC-STAGE1-IMPLEMENTATION-UNLOCK-2026-10-09
decision_status: recorded
decider_role: PO
decided_at: 2026-10-09
recorded_at: 2026-10-09
source: 2026-10-09（Asia/Tokyo）のClaude作業session（lane `review_merge`）でのPOの選択と発言
authority_effect: effective_when_this_record_is_admitted_to_main
---

# Stage 1の実装と新世代CIの解禁（2026-10-09）

## 記録の範囲

本書は、POが同じ日に示した二つの判断を記録する。

1. Stage 1の親と、その依存閉包について、L4〜L6の設計から実装、L7の検証までを解禁する。
2. 新世代CIの構築と起動を解禁する。主はローカルCIとし、GitHub Actionsの実行は減らす。

本書から、release、v0.1の宣言、内部デプロイ、tag、cutover、配布repoの作成・切替、repositoryのvisibility・LICENSE・branch protection（required checkの指定を含む）の変更、L8〜L10の実行・合格、L2・Conceptの変更、新しい承認手続き・merge gate、Issue closeを生成しない。

## 経緯

共通カーネルのL4↔L9（`docs/helix-harness/L4-basic-design/common-kernel.md`、status `design_pair_defined`）が、PR #2715（merge commit `8414e71d2`）でmainへ入った。Claudeは、Codexの次の長期ゴールとして、承認済みL3／L10を親とする全機構のL4〜L6設計と、対の検証設計を揃える案を示した。

これに対し、POは次のように述べた（原文）。

> 2時間で終わる作業を長期とは言わない。ステージ1の実装の谷ぐらいまでの完成でいいんじゃないか？

Claudeは、作業入口（`docs/governance/new-generation-start-here.md`「現在停止する作業」）で実装と新世代CIが停止中であり、2026-10-08の[判断記録](l4-l6-design-unlock-and-common-kernel-trace-po-decision-2026-10-08.md)が解禁したのは設計までであることを示した。

## POの選択

ClaudeはAskUserQuestionで次の二つを問うた。POの選択は次のとおりである（原文）。

> 問い：「実装の解禁範囲はこれでいい？（PO判断として記録し、Codexの長期ゴールにする）」
>
> POの選択：「Stage1＋依存閉包 (Recommended)」
>
> 選択肢本文：「Stage 1の全親（HARNESS/BRAIN/CONNECT/INFRA/LABO/SECURITY）について、L4〜L6の設計→実装→L7の単体検証（新世代testのローカル実行）まで。Stage 1が使う共通カーネルとOS等の部品は、依存閉包の分だけ同じゴールで実装してよい。実装はhelix/・declarations/・records/の構成に置く。release、v0.1宣言、内部デプロイ、L8/L9の実行は含めない」

> 問い：「新世代CI（GitHub Actions上での検査）はどうする？」
>
> POの選択：「CIも解禁」
>
> 選択肢本文：「Stage 1の単体検証を回す最小の新世代CI（GitHub Actions）の構築と起動まで含める。旧CIは引き続き動かさない」

Claudeがこの選択を「GitHub Actionsで構築する」と書き始めたところで、POは次のように述べた（原文）。

> いや、ローカルCIを回して、ギットハブアクションを減らす方針はどこいったんだよ。逆にCI作らずにいままでの怪しすぎるだろ。

> 旧HELIXもローカルCIメインだろ。

選択肢本文のGitHub Actionsは、Claudeが示した例であった。本書は、POの続く発言に従い、CIをローカルCIを主とするものとして記録する。

## 判断1：Stage 1の実装の解禁

- **対象（Stage 1の親）**：L3／L10の承認記録のうち、Stage 1の親を承認したもの（`docs/governance/decisions/`の`helix-*-stage1-*`の判断記録。HARNESS、BRAIN、CONNECT、INFRASTRUCTURE、LABO、SECURITY）が承認した親である。親の一覧は、これらの記録から作る対応表で確定し、本書の要約からは生成しない。
- **依存閉包**：Stage 1の親を満たすために必要な、共通カーネルの要素と他機構（OS等）の部品は、その依存の分に限り同じ範囲で設計・実装してよい。依存の根拠は、承認済みL3のACと共通カーネルの対応表で示す。依存閉包を理由に、Stage 1以外の親の要求を実装済みとは扱わない。
- **解禁する作業**：L4〜L6の設計と対の検証設計、実装、L7の検証の実行。設計の親は承認済みのL3／L10に限る。承認済みでない、missing、unknown、conflict、staleの対象へは、従来どおり進まない（AGENTS.md「現在の境界」）。
- **置き場所**：実装は、2026-10-09の[構成の判断記録](repository-layout-and-source-visibility-po-decision-2026-10-09.md)と構成L4（`docs/helix-harness/L4-basic-design/repository-layout.md`）に従い、`helix/`、`declarations/`、`records/`へ置く。本書は、これらのディレクトリを実装に必要な分だけ作ることを許す。
- **技術の選択**：言語、ツールチェーン、ビルド方式はL5〜L6の設計で決め、独立reviewで確かめる。Bunは使わない（[2026-10-03の判断記録](po-decision-2026-10-03-pending4-bun.md)）。
- **承認者**：L4以降の設計と実装の承認者は人に置かない。作成側と別系統の独立reviewで確かめ、通常のPRの流れでmergeする（2026-10-08の判断記録の判断1・判断3）。

## 判断2：新世代CIの解禁（ローカルCIを主とする）

- 新世代CIを構築し、起動してよい。**主はローカルCI**とする。全量の検査はローカルCIで回し、GitHub Actionsの実行は減らす。
- **ローカルCIを最初に作る。** これまでのmergeは、静的確認（`scfctl`、`govcheck`、`git diff --check`）と独立reviewだけで確かめてきた。ローカルCIができたら、まずmain上の既存の設計文書（共通カーネル、構成のL4↔L9等）に回し、見つかった不整合は修正PRで直す。そのあとStage 1の設計・実装を進める。
- **ローカルとGitHub側は同じ検査契約を使う。** 同じ検査の内容・版・設定・対象revisionでローカルとGitHub側が結果を返し、片側だけの実行や別内容での実行を合格にしない（HARNESS-L2-036）。GitHub ActionsはCIの交換可能なprovider adapterの一つとする（HELIX-OS L2「新世代CIの再構築条件」）。
- **GitHub Actionsで何を回すか**は、L5〜L6のCI設計で決め、独立reviewで確かめる。旧HELIXのとおり、mergeの単位を超えて回さず（毎commitでは回さない）、設計文書だけのPRはローカルだけで検査してよい。Actionsの役割は、ローカルCIの証跡を対象HEADへ結んで確かめることと、mergeの単位での軽い検証を基本とする。
- ローカルCIの結果だけで、作成側が自分の変更の合格を宣言しない。ローカルCIの証跡は、独立reviewと、GitHub側での照合の材料にする。
- 旧CI（`archive/`内のworkflow）と旧hookは、従来どおり実行せず、fallbackにも合格の証拠にもしない。旧workflowと旧local gateは読んで起点にし、保持する点と変える点を記録する（AGENTS.md「再構築の原則」）。
- CIにsecrets、credentialsを置かない。CIの合格から、要求の採否、承認、受入、完了を生成しない。
- required checkの指定など、branch protectionの変更は本書に含めない。必要になった時点で、対象と作用を明示してPOの許可を得る。

## 旧HELIXとの対応

| 旧source | 保持する点 | 変える点 |
|---|---|---|
| 旧`CLAUDE.md`（`LEGACY-ASSET-6EBDB617A8104A7756D0`、SHA-256 `7bdfc0bc578359e42efae4242ee42b53abd6e2ec23874f1294d3ec0e278c8feb`）82–85行「自律境界」：AIはL3起草とL4以降からGitHub PR／CI／merge／tagまでを完全自動で行い、不可逆操作だけをescalateする | 実装とCIをAIが自走し、人の承認を置かないこと | 範囲をStage 1の親と依存閉包に限る。tagは旧と違い、不可逆な外部作用として対象と作用を明示した許可を要する（AGENTS.md「現在の境界」）。新世代の段階リリースがまだ一つも無いため |
| 旧要件v1.2（`LEGACY-ASSET-BACB1FC117A09D20F273`／`archive/legacy-generation-2026-09-14/root/docs/governance/helix-harness-requirements_v1.2.md`、SHA-256 `41b38c068e91a767f964ce5ce5d7d5568c1984b3b122b808f9eff61e5a0af401`）1446–1475行 6.9節「CI起動単位とコスト方針」：ローカルは安価・高頻度、GitHub Actionsは高価・バッチの二層分担。CIはmergeの単位で回し毎commitでは回さない。設計層のpair freezeはローカルだけで検査する。PRはLinux runnerだけで回す | 二層分担、mergeの単位で回すこと、設計文書をローカルだけで検査してよいこと | 同書1135行は全量テスト・重い検証をGitHub Actionsで回すとしていたが、本書はローカルCIを主にする（POの発言と、下の旧L1・旧L4による）。旧の`harness-check`一本への集約、`dorny/paths-filter`等の具体はL5〜L6で再判断する |
| 旧HARNESS L1技術要件（`LEGACY-ASSET-96CCD05C4CCA06F50D3D`／`archive/legacy-generation-2026-09-14/root/docs/design/harness/L1-requirements/technical-requirements.md`、SHA-256 `3e105358418cb54af0bc2e414d0b06171715ab2a26ea3b44dd16f932bcbfef88`）43行：「ローカルgate証跡 → CI証跡検証 → branch protection PR許可」 | ローカルgateを先に回し、その証跡をGitHub側で対象HEADへ結んで確かめる順序 | branch protectionの変更は本書に含めない |
| 旧HARNESS L4構成（`LEGACY-ASSET-99C939E249CAF40935CB`／`archive/legacy-generation-2026-09-14/root/docs/design/harness/L4-basic-design/architecture.md`、SHA-256 `f4b9fcb98b4250879955f6eca0f2916dc1a27046820a8ad687e8f816b856bea2`）186行、223行：CIのlintはlocal gate（doctor、lint、test）で担保し、外部CI serviceの配備は別の範囲とする | 検査をlocal gateで担保すること | 旧のコマンド（`bun run …`）は引き継がない（Bunは使わない）。旧local gateを実行しない |
| 旧`.github/workflows/harness-check.yml`（`LEGACY-ASSET-1C7E5C0B33364FBF9EC6`、SHA-256 `7c18b3f208886c443957f4cdbf919de77da233e6759007b8501624c054e7d099`）1–9行：配備しても最初はRequired化しない | CIの配備と、required checkへの指定を別の段階に分けること | 旧workflowを実行も複製もしない |

## 本書から生成しないもの

release、v0.1の宣言、内部デプロイ、tag、cutover、配布repoの作成・切替、visibility・LICENSE・branch protection（required checkの指定を含む）の変更、L8〜L10の実行・合格、Stage 1以外の親の実装、L2・Conceptの変更、新しい承認手続き・merge gate、Issue close。
