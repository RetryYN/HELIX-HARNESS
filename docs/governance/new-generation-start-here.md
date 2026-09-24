# HELIX新世代 作業入口

status: upstream_rebuild
generation_boundary: 2026-09-14

## 現在の目的

旧HELIXを現行pathで延命せず、HELIX-HARNESSとHELIX-OSを分離して上流から組み直す。
HARNESSは外部提供するV-model開発基盤、HELIX-OSはHARNESS自身を含むHELIXプロジェクト群の管理・統制・継続改善機構である。
HELIX-WebはHARNESS Version 1完成後に展開する個別製品で、service runtimeはHELIX-OS外のHELIX-Web-OSが担う。

## 読込順

1. [Concept入口](../concept/README.md)
2. [Concept本文](../concept/helix-concept.md)と[製品責務境界](../concept/product-boundary.md)
   - 4対象L1の承認は[2026-09-17 decision record](decisions/concept-v4.1-and-four-l1-approval-2026-09-17.md)に記録されている
3. [HELIX自体の5大目標候補](../concept/helix-five-goals.md)
4. [HELIXエージェントの七大原則候補](../concept/helix-principles.md)
5. 対象製品のL1
   - [HELIX-HARNESS](../helix-harness/L1-planning/product-intent.md)
   - [HELIX-OS](../helix-os/L1-planning/system-intent.md)
   - [HELIX-Web](../helix-web/L1-planning/product-intent.md)
   - [HELIX-Web-OS](../helix-web-os/L1-planning/system-intent.md)
   - [5大目標・七大原則のL1被覆監査](audits/source-rebaseline/l1-goals-principles-coverage-audit.md)
   - [5大目標・七大原則のPO原文source atom inventory](l1-goals-principles-source-inventory.md)
6. [対象別L2入口](audits/source-rebaseline/l2-source-register.md)と対応するL11
   - [L2D-S0-01・S0-02承認とL2D-S1-01 deferのdecision record](decisions/l2d-s0-approval-and-s1-01-defer-2026-09-19.md)
7. [企画・Vision→前提research→要求の被覆監査](audits/source-rebaseline/planning-research-requirement-flow-audit-2026-09-15.md)
8. [上流authority管理台帳](upstream-authority-register-2026-09-14.md)
9. [上流authority状態モデル](authority-state-model.md)
10. [GitHub上流運用モデル](github-upstream-operating-model.md)
11. [管理層の要求仮登録契約](management-provisional-requirement-registration.md)
12. [Repository foundation readiness](repository-foundation-readiness.md)
    - [新世代作業基盤への集約 operation contract](new-generation-workbase-consolidation.md)
13. [旧要求の無損失carry-forward方針](legacy-requirement-carry-forward-policy.md)、[現在の管理状況](requirement-carry-forward-status.md)、[153要求の再配置wave](legacy-ir-rehome-wave-register.md)
    - [Concept機構・版・製品属性の要求対応表](crosswalks/concept-mechanism-version-requirement-crosswalk.md)と[PO判断パッケージ](crosswalks/concept-requirement-po-decision-packet.md)は未承認の再配置候補であり、現行L1差分と旧要求の意味を別に確認する
    - 全要求の要否・再配置を扱う場合は、[要否・再配置review program](requirement-disposition-review-program.md)を親作業とし、[責務・機能重複review](requirement-overlap-review-program.md)、[技術代替可能性review](requirement-technical-substitutability-review-program.md)、個別要求の人間decision・要求PRを分ける
    - IDのない段落条件を扱う場合は、[semantic line全量保全inventory](legacy-requirement-semantic-line-inventory.md)と[atom化review contract](requirement-atomization-review-contract.md)を追加で読む
    - 旧candidate系列を扱う場合は、[旧candidate source全量inventory](legacy-candidate-source-inventory.md)から原文行へ戻る
14. [旧世代archive-first隔離記録](archive-first-transition-record-2026-09-14.md)
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
4対象L1、5大目標、七大原則、製品責務境界である。これらの親は現行Conceptへ付け替えた。BRAIN、LABO、Intelligence、Security、CONNECT、Runner／Sandboxの責務差分は候補として記録し、対象別L2／L11の採否を生成しない。

4対象L1の**旧exact revision**は2026-09-17のdecision recordで承認済みである。旧承認を現行bytesへ継承しない。
[2026-09-24のPO判断](decisions/concept-requirement-po-decisions-2026-09-24.md)で、次のように扱いを決めた。
- HELIX-OS L1：現行本文SHA `ffbafa47…51bc`をPOが採用した。
- 製品責務境界：現行本文SHA `9268e357…ac0a`をPOが採用した。
- HARNESS L1と5大目標：内容をPOが採用した。HARNESS L1は1.0土台の追記、5大目標は関与表の縮約を指示された。追記・縮約後の本文は、PO最適ドラフトPRで対象revisionを確認する。
- HELIX-WebとHELIX-Web-OS：L1・L2・L11を要求層から外し、Visionレベルの材料へ分類し直した。
`L2D-S0-01 scaffold-binding`と`L2D-S0-02 wbs-ledger`の候補は2026-09-19の[decision record](decisions/l2d-s0-approval-and-s1-01-defer-2026-09-19.md)で承認済みであり、
候補本文内の`draft_candidate`／`awaiting_human_approval`も同じく承認前snapshotのmetadataとして、decision recordを優先する。
対象別L2／L11はdraft・未採否であり、まだcanonicalではない。
旧Concept、旧requirements、Requirement IR、候補群、設計、実装は新世代へ自動昇格しない。
この非昇格は旧要求の削減を意味しない。採用済み旧要求は`preserved_pending_rehome`として全件保持し、
対象別へ移す。実装・CI・物理配置を継承しないことと、要求意味を保持することを分ける。

## 現在許可される作業

- 旧sourceのinventory、意味分類、対象別crosswalk、archive隔離。
- 現行Conceptと旧承認L1 revisionを照合するL2／L11候補の起草、静的なID・参照・責務整合確認、個別採否準備。現行L1差分を承認済み入力として使わない。
- exact revisionのremote sync、Draft PRによる共有、現行の独立review通路での意味review。通常のGitHub作業では作成側が明示依頼を待たずpush・Draft PR作成・指摘修正を進め、review側がexact HEADのfindingを記録した後、作成側が修正後HEADのreview結果を確認してReady化する。
- 現行merge admissionが成立したPRを、作成側とは独立したreview側が`gh pr merge --merge`で明示mergeし、read-afterすること。新世代CIがない間は旧CIを代用しない。
- `scaffold/`名前空間での仮組み。仮の物は必ずScaffold Bindingへ登録し、`python3 scaffold/tools/scfctl.py validate`に合格させる（[scaffold/README.md](../../scaffold/README.md)）。仮組みは正式な設計・実装・CIではなく、その動作や検査の合格から採否・承認・完了を生成しない。

## 現在停止する作業

- L3以降の正式な設計・実装、新世代CIの実装・起動、release、deployment。`scaffold/`外に仮の物を置くこと。Scaffold Bindingに登録しない仮の物を置くこと。
- 旧CI、旧runtime、旧hook、旧test、旧AI promptの実行またはfallback。
- 旧CLI・旧hook・旧runtime・旧CIへのfallback。reviewer名だけから旧実行通路を起動すること。GitHub native auto-mergeと、作成側による自己merge。
- PR、Issue、CI、DB、memory、会話からの要求採否・人間承認・受入の生成。

## GitHubの位置づけ

PRは上流候補の差分共有と許可されたreviewに使う。旧workflowは非実行archiveへ移動済みであり、現時点で新世代CIはない。
required check、review、merge等のrepository設定が旧世代を前提にする場合、その設定変更はHELIX-OSのGitHub projection再構築として別に扱う。
PR #1797は`repository_foundation`に限定し、個別要求は[GitHub上流運用モデル](github-upstream-operating-model.md)に従って
一要求identityずつ後続PRで無損失に再配置・具体化する。保持・再配置、意味変更、retireを別decision種別として、すべての要求PRを対象revision付きの人間判断へ送る。
本PRのreview所見を理由に新しい要求本文を追加しない。既に置いた対象別L2／L11は未承認の整理案であり、個別要求の
追加・採否・分割・具体化は後続の要求整理PRで行う。foundationで追加できるのは、旧sourceの保存位置、digest、
仮登録、authority境界、後続PRの無損失条件に限る。
