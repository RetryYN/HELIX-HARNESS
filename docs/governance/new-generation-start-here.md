# HELIX新世代 作業入口

status: upstream_rebuild
generation_boundary: 2026-09-14

## 現在の目的

旧HELIXを現行pathで延命せず、HELIX-HARNESSとHELIX-OSを分離して上流から組み直す。
HARNESSは外部提供するV-model開発基盤、HELIX-OSはHARNESS自身を含むHELIXプロジェクト群の管理・統制・継続改善機構である。
HELIX-WebはHARNESS Version 1完成後に展開する個別製品の総称（製品群）で、service runtimeはHELIX-OS外のHELIX-WEB-OSが担う。

## 本体8機構の現在の判断状態（2026-09-28）

POは本体8機構の確認資料が固定したL1対象revisionを確定し、L2と対になるL11の要求一式に合意した。
以下の各判断記録が対象commit・本文SHA-256・明示候補集合・適用条件を特定する。本文中のdraft/candidate metadataは
判断前の固定bytesとして保持し、対象revisionの状態は判断記録から読む。以降の履歴説明にある「POが確認する」「未合意」は当時の状態であり、この8機構の固定revisionについては次の記録を優先する。

| 機構 | PO判断記録 | 採用した明示候補数 |
|---|---|---:|
| HELIX-HARNESS | [L1確定・L2/L11合意](decisions/helix-harness-requirements-po-decision-2026-09-28.md) | 24 |
| HELIX-OS | [L1確定・L2/L11合意](decisions/helix-os-requirements-po-decision-2026-09-28.md) | 16 |
| HELIX-BRAIN | [L1確定・L2/L11合意](decisions/helix-brain-requirements-po-decision-2026-09-28.md) | 42 |
| HELIX-LABO | [L1確定・L2/L11合意](decisions/helix-labo-requirements-po-decision-2026-09-28.md) | 53 |
| HELIX-INTELLIGENCE | [L1確定・L2/L11合意](decisions/helix-intelligence-requirements-po-decision-2026-09-28.md) | 54 |
| HELIX-SECURITY | [L1確定・L2/L11合意](decisions/helix-security-requirements-po-decision-2026-09-28.md) | 28 |
| HELIX-INFRASTRUCTURE | [L1確定・L2/L11合意](decisions/helix-infrastructure-requirements-po-decision-2026-09-28.md) | 26 |
| HELIX-CONNECT | [L1確定・L2/L11合意](decisions/helix-connect-requirements-po-decision-2026-09-28.md) | 7 |

合計250候補は各version_targetと適用条件を保持して採用された。後続版・Web条件付きの内容を1.0へ前倒ししない。
HARNESS-L2-029＝CORE、031＝共通部品、032＝CORE。SECURITYは全操作のauthority境界を適用し、有効な既決権限を再利用する。通常作業の毎回の人間承認は追加しない。
旧sourceの未完引継ぎは保持し、旧HELIXからのデグレ照合と最後の横断整理を進める。実装順序A/BはL3開始時のPO判断として残る。
この判断はL3要件承認、実装・実行・配布の許可や要求ステージ終了の宣言を含まない。Web／WEB-OSは今回の確認対象外である。

## 読込順

1. [Concept入口](../concept/README.md)
2. [Concept本文](../concept/helix-concept.md)と[製品責務境界](../concept/product-boundary.md)
   - 旧4対象（HARNESS、OS、Web、WEB-OS）のL1の承認は[2026-09-17 decision record](decisions/concept-v4.1-and-four-l1-approval-2026-09-17.md)に記録されている
3. [HELIX自体の5大目標候補](../concept/helix-five-goals.md)
4. [HELIXエージェントの七大原則候補](../concept/helix-principles.md)
5. 対象機構のL1
   - [HELIX-HARNESS](../helix-harness/L1-planning/product-intent.md)
   - [HELIX-OS](../helix-os/L1-planning/system-intent.md)
   - [HELIX-Web](../helix-web/L1-planning/product-intent.md)
   - [HELIX-WEB-OS](../helix-web-os/L1-planning/system-intent.md)（WebとWEB-OSは2026-09-24のPO判断でVisionレベルの材料へ分類し直した。2026-09-26の配置選択は[当時の判断記録](decisions/helix-web-relocation-po-decisions-2026-09-26.md)に保持し、2026-10-03にPOがdocs/以下の対象別folderへ統合することを選択した（[現行の配置判断記録](decisions/helix-web-docs-consolidation-po-decisions-2026-10-03.md)））
   - L1企画（固定revisionの確認は上記2026-09-28判断記録を参照）：[HELIX-BRAIN](../helix-brain/L1-planning/brain-intent.md)、[HELIX-LABO](../helix-labo/L1-planning/labo-intent.md)、[HELIX-INTELLIGENCE](../helix-intelligence/L1-planning/intelligence-intent.md)、[HELIX-SECURITY](../helix-security/L1-planning/security-intent.md)、[HELIX-INFRASTRUCTURE](../helix-infrastructure/L1-planning/infrastructure-intent.md)（2026-09-26のPO判断でConceptの機構に加えた。1.0は原文の18項目に当たる要求だけ）
   - [HELIX-CONNECT L1](../helix-connect/L1-planning/connect-intent.md)（固定revisionは上記判断記録で確認済み）
   - [5大目標・七大原則のL1被覆監査](audits/source-rebaseline/l1-goals-principles-coverage-audit.md)
   - [5大目標・七大原則のPO原文source atom inventory](l1-goals-principles-source-inventory.md)
6. [対象別L2入口](audits/source-rebaseline/l2-source-register.md)と対応するL11
   - [L2D-S0-01・S0-02承認とL2D-S1-01 deferのdecision record](decisions/l2d-s0-approval-and-s1-01-defer-2026-09-19.md)
   - L3本文の起草前に[L3要件・L10総合検証の配置と著述規則](l3-l10-authoring-layout.md)を読む
7. [企画・Vision→前提research→要求の被覆監査](audits/source-rebaseline/planning-research-requirement-flow-audit-2026-09-15.md)
8. [上流authority管理台帳](upstream-authority-register-2026-09-14.md)
9. [上流authority状態モデル](authority-state-model.md)
10. [GitHub上流運用モデル](github-upstream-operating-model.md)
11. [管理層の要求仮登録契約](management-provisional-requirement-registration.md)
12. [Repository foundation readiness](audits/source-rebaseline/repository-foundation-readiness.md)
    - [新世代作業基盤への集約 operation contract](audits/source-rebaseline/new-generation-workbase-consolidation.md)
13. [旧要求の無損失carry-forward方針](legacy-requirement-carry-forward-policy.md)、[現在の管理状況](requirement-carry-forward-status.md)、[153要求の再配置wave](legacy-migration/ir/legacy-ir-rehome-wave-register.md)（2026-09-26のPO判断で、旧HELIXからの移行作業の台帳・待ち行列・wave記録は`governance/`直下から[`legacy-migration/`](legacy-migration/README.md)の種類別フォルダへ移した：[判断記録](decisions/governance-legacy-migration-layout-po-decisions-2026-09-26.md)）
    - [Concept機構・版・製品属性の要求対応表](crosswalks/concept-mechanism-version-requirement-crosswalk.md)と[PO判断パッケージ](crosswalks/concept-requirement-po-decision-packet.md)は未承認の再配置候補であり、現行L1差分と旧要求の意味を別に確認する
    - 全要求の要否・再配置を扱う場合は、[要否・再配置review program](requirement-disposition-review-program.md)を親作業とし、[責務・機能重複review](requirement-overlap-review-program.md)、[技術代替可能性review](requirement-technical-substitutability-review-program.md)、個別要求の人間decision・要求PRを分ける
    - IDのない段落条件を扱う場合は、[semantic line全量保全inventory](legacy-migration/requirement/legacy-requirement-semantic-line-inventory.md)と[atom化review contract](requirement-atomization-review-contract.md)を追加で読む
    - 旧candidate系列を扱う場合は、[旧candidate source全量inventory](legacy-migration/candidate/legacy-candidate-source-inventory.md)から原文行へ戻る
14. [旧世代archive-first隔離記録](audits/source-rebaseline/archive-first-transition-record-2026-09-14.md)
15. [旧資産の完全一致再利用統制](legacy-asset-reuse-control.md)
16. 必要な場合だけ、[旧資産4,020件の明細台帳](legacy-asset-disposition.jsonl)を`asset_id`または`source_path`で照会し、
   指定された旧source／crosswalkを読む。明細台帳は機械参照用であり、AIの全文startup readには含めない。
   個別採否時は[判断ログ契約](legacy-asset-decision-log.md)に従う

repository foundation、5大目標候補、七大原則候補の順に物理統合し、
Concept／製品責務境界→5大目標→七大原則→対象別L1の読込順へ収束させる。5大目標と七大原則の内容判断は、
各候補PRのmerge admissionと独立したまま扱う。repository foundationは構造整理の証拠だけで統合済みである。
Conceptは[1ファイル](../concept/helix-concept.md)をその場で改訂する。版ごとのファイル、改訂ごとの承認記録、昇格手続きは置かない。
改訂は人の指示をAIが反映し、変更の履歴はgitに残す。版ごとのファイルは残さない。v4.1／v4.2のファイルは下位文書の親付替えと同時に削除済みで、過去の本文はgitの履歴で辿る。
Conceptの改訂に紐づく下位文書は見直し対象として示し、作業全体を止めない。v4.3への改訂（2026-09-24）の見直し対象は、
4対象L1、5大目標、七大原則、製品責務境界である。これらの親は現行Conceptへ付け替えた。BRAIN、LABO、INTELLIGENCE、SECURITY、CONNECT、Runner／Sandbox（2026-09-26にWorkerへ統一した。下記）の責務差分は候補として記録し、対象別L2／L11の採否を生成しない。

4対象L1の**旧exact revision**は2026-09-17のdecision recordで承認済みである。旧承認を現行bytesへ継承しない。
[2026-09-24のPO判断](decisions/concept-requirement-po-decisions-2026-09-24.md)で、次のように扱いを決めた。
- HELIX-OS L1：本文SHA `ffbafa47…51bc`をPOが採用した。2026-09-25のPO判断（[判断記録](decisions/mechanism-placement-po-decisions-2026-09-25.md)）でL1-011・L1-012をHELIX-LABOの候補への案内行に変えた。2026-09-26のPO判断（[判断記録](decisions/handoff-integration-po-decisions-2026-09-26.md)）で提供価値とL1-006をOS＝PMの整理に合わせた。変更後の本文は、PO最適ドラフトPRで対象revisionを確認する。
- 製品責務境界：現行本文SHA `9268e357…ac0a`をPOが採用した。
- HARNESS L1と5大目標：内容をPOが採用した。HARNESS L1は1.0土台の追記、5大目標は関与表の縮約を指示された。追記・縮約後の本文は、PO最適ドラフトPRで対象revisionを確認する。
- HELIX-WebとHELIX-WEB-OS：L1・L2・L11を要求層から外し、Visionレベルの材料へ分類し直した。2026-09-26にPOが示した「HELIX-Web製品群 要求原案」により、HELIX-Webを製品の総称とし（WEB-HARNESSの7製品、WEB-HARNESS-CORE、WEB-CONNECTOR）、その構成をConceptへ反映した。原案の要求は候補（未採択）として`docs/helix-web*/`の対象ごとの`candidates/`と、LABOの候補に置いた（[判断記録](decisions/helix-web-product-group-po-decisions-2026-09-26.md)）。
- HELIX-LABO：2026-09-26にPOが示した原文をもとに、L1企画案を作った（[判断記録](decisions/labo-core-engine-po-decisions-2026-09-26.md)）。L1企画案の対象revisionはPOが確認する。
- HELIX-BRAIN：2026-09-26にPOが示した原文をもとに、L1企画案を作った（[判断記録](decisions/brain-l1-idea-po-decisions-2026-09-26.md)）。L1企画案の対象revisionはPOが確認する。
- HELIX-INTELLIGENCE：2026-09-26にPOが示した原文をもとに、L1企画案を作った（[判断記録](decisions/intelligence-l1-idea-po-decisions-2026-09-26.md)）。L1企画案の対象revisionはPOが確認する。Conceptの4.0を、BRAIN・HELIX-HARNESS-CORE・INTELLIGENCE・OSの複合処理にした。
- HELIX-SECURITY：2026-09-26にPOが示した原文をもとに、L1企画案を作った（[判断記録](decisions/security-l1-idea-po-decisions-2026-09-26.md)）。L1企画案の対象revisionはPOが確認する。
- HELIX-INFRASTRUCTURE：2026-09-26にPOが示した原文をもとに、L1企画案を作った（[判断記録](decisions/infrastructure-l1-idea-po-decisions-2026-09-26.md)）。同日のPO判断で、HELIX自身の実行環境の資源と状態を持つ機構としてConceptの機構の表に加え、「9つの機構と1つの共通部品」とした。1.0は原文の「1.0で最低限成立させる範囲」の18項目に当たる要求だけとし、それ以外の要求と、高度な自動の増減・複数のcloud・完全に自動の切替え等は1.0より後（版は未定）とする（[判断記録](decisions/infrastructure-concept-placement-po-decisions-2026-09-26.md)）。
- 作業の実行主体：2026-09-26のPO判断で、Workerへ統一した。レーンは作成やreview等の役割の割当て先、Workerはレーンの主がSubagentとして呼び出して作業させるモデルである。HELIXサブエージェント、Runner、Sandboxを別の主体や共通部品として置かず、Workerの共通の実行契約はHELIX-OSが持つ（[判断記録](decisions/worker-execution-model-po-decisions-2026-09-26.md)）。上の「Runner／Sandbox」は、v4.3への改訂の時点の記述である。
- 機構の関係：2026-09-26のPO判断で、OSはPMに近く、周辺の機構（INTELLIGENCE、LABO、HARNESS、BRAIN、SECURITY、INFRASTRUCTURE。判断の時点では「実行基盤」と書いた）はPMOにあたると整理した。レーンの役割は「作成」と呼び、「推進」はOSのチケット発行の機能名だけに使う。ticketが指定するWorkerは、LABOの水準→INTELLIGENCEの配置の案→OSの推進の指定の三段で決める。この判断で、HELIX-OS L1の提供価値とL1-006、製品責務境界、5大目標も改めた（[判断記録](decisions/handoff-integration-po-decisions-2026-09-26.md)）。
`L2D-S0-01 scaffold-binding`と`L2D-S0-02 wbs-ledger`の候補は2026-09-19の[decision record](decisions/l2d-s0-approval-and-s1-01-defer-2026-09-19.md)で承認済みであり、
候補本文内の`draft_candidate`／`awaiting_human_approval`も同じく承認前snapshotのmetadataとして、decision recordを優先する。
本体8機構の固定L2／L11と明示候補集合の合意・採用は上記2026-09-28判断記録を正本とする。それ以外の候補へ採用を広げない。
旧Concept、旧requirements、Requirement IR、候補群、設計、実装は新世代へ自動昇格しない。
この非昇格は旧要求の削減を意味しない。採用済み旧要求は`preserved_pending_rehome`として全件保持し、
対象別へ移す。実装・CI・物理配置を継承しないことと、要求意味を保持することを分ける。

## 現在許可される作業

- 旧sourceのinventory、意味分類、対象別crosswalk、archive隔離。
- 現行Conceptと対象revisionが確定したL1を照合するL2／L11の整理、静的なID・参照・責務整合確認、個別採否準備。対象decisionに含まれないL1差分を承認済み入力として使わない。
- exact revisionのremote sync、Draft PRによる共有、現行の独立review通路での意味review。通常のGitHub作業では作成側が明示依頼を待たずpush・Draft PR作成・指摘修正を進め、review側がexact HEADのfindingを記録した後、作成側が修正後HEADのreview結果を確認してReady化する。
- 現行merge admissionが成立したPRを、作成側とは独立したreview側が`gh pr merge --merge`で明示mergeし、read-afterすること。新世代CIがない間は旧CIを代用しない。
- `scaffold/`名前空間での仮組み。仮の物は必ずScaffold Bindingへ登録し、`python3 scaffold/tools/scfctl.py validate`に合格させる（[scaffold/README.md](../../scaffold/README.md)）。仮組みは正式な設計・実装・CIではなく、その動作や検査の合格から採否・承認・完了を生成しない。

## 現在停止する作業

- 実装、新世代CIの実装・起動、release、deployment。`scaffold/`外に仮の物を置くこと。Scaffold Bindingに登録しない仮の物を置くこと。L4〜L6の設計と対の検証設計は、2026-10-08のPO判断（[判断記録](decisions/l4-l6-design-unlock-and-common-kernel-trace-po-decision-2026-10-08.md)）で、承認済みのL3／L10を親とする範囲に限り解禁した。Stage 1の親とその依存閉包の実装・L7の検証、および新世代CI（ローカルCIを主とする）の構築・起動は、2026-10-09のPO判断（[判断記録](decisions/stage1-implementation-and-ci-unlock-po-decision-2026-10-09.md)）で解禁した。release、v0.1の宣言、内部デプロイ、branch protectionの変更は停止のまま残す。
- 旧CI、旧runtime、旧hook、旧test、旧AI promptの実行またはfallback。
- 旧CLI・旧hook・旧runtime・旧CIへのfallback。reviewer名だけから旧実行通路を起動すること。GitHub native auto-mergeと、作成側による自己merge。
- PR、Issue、CI、DB、memory、会話からの要求採否・人間承認・受入の生成。

## GitHubの位置づけ

PRは上流候補の差分共有と許可されたreviewに使う。旧workflowは非実行archiveへ移動済みであり、現時点で新世代CIはない。
required check、review、merge等のrepository設定が旧世代を前提にする場合、その設定変更はHELIX-OSのGitHub projection再構築として別に扱う。
PR #1797は`repository_foundation`に限定し、個別要求は[GitHub上流運用モデル](github-upstream-operating-model.md)に従って
一要求identityずつ後続PRで無損失に再配置・具体化する。保持・再配置、意味変更、retireを別decision種別とする。対象revision付きの人間判断へ送るのは、人が持つ上流（Concept、企画、要求とprototype／非UIの合意、要件の承認）の意味を変える場合と、[上流authority状態モデル](authority-state-model.md)が対象revisionの人間decision（旧要求の意味変更・retire等）を求める場合に限る（[AGENTS.md](../../AGENTS.md)「再構築の原則」、旧`archive/legacy-generation-2026-09-14/root/CLAUDE.md:82-85`「自律境界」）。担当移動と技術変更だけの差分は記録して独立reviewへ送る。
本PRのreview所見を理由に新しい要求本文を追加しない。本体8機構の固定L2／L11は上記判断記録の対象であり、対象外の追加・採否・分割・具体化は後続の要求整理PRで行う。foundationで追加できるのは、旧sourceの保存位置、digest、
仮登録、authority境界、後続PRの無損失条件に限る。
