# HELIX新世代 作業入口

status: upstream_rebuild
generation_boundary: 2026-09-14

## 現在の目的

旧HELIXを現行pathで延命せず、HELIX-HARNESSとHELIX-OSを分離して上流から組み直す。
HARNESSは外部提供するV-model開発基盤、HELIX-OSはHARNESS自身を含むHELIXプロジェクト群の管理・統制・継続改善機構である。
HELIX-WebはHARNESS Version 1完成後に展開する個別製品で、service runtimeはHELIX-OS外のHELIX-Web-OSが担う。

## 読込順

1. [Concept入口](../concept/README.md)
2. [製品責務境界](../concept/product-boundary.md)と[Concept本文](../concept/helix-concept-v4.1.md)
3. 対象製品のL1
   - [HELIX-HARNESS](../helix-harness/L1-planning/product-intent.md)
   - [HELIX-OS](../helix-os/L1-planning/system-intent.md)
   - [HELIX-Web](../helix-web/L1-planning/product-intent.md)
   - [HELIX-Web-OS](../helix-web-os/L1-planning/system-intent.md)
4. [対象別L2入口](audits/source-rebaseline/l2-source-register.md)と対応するL11
5. [上流authority管理台帳](upstream-authority-register-2026-09-14.md)
6. [旧世代archive-first隔離記録](archive-first-transition-record-2026-09-14.md)
7. [旧資産の完全一致再利用統制](legacy-asset-reuse-control.md)
8. 必要な場合だけ、[旧資産4,020件の明細台帳](legacy-asset-disposition.jsonl)を`asset_id`または`source_path`で照会し、
   指定された旧source／crosswalkを読む。明細台帳は機械参照用であり、AIの全文startup readには含めない

Conceptと対象別L1はcandidate、対象別L2／L11はdraftであり、まだcanonicalではない。
旧Concept、旧requirements、Requirement IR、候補群、設計、実装は新世代へ自動昇格しない。

## 現在許可される作業

- 旧sourceのinventory、意味分類、対象別crosswalk、archive隔離。
- Concept、対象別L1、L2／L11の起草、静的なID・参照・責務整合確認。
- exact revisionのremote syncと、明示的に許可されたGitHub review通路での意味review。
- GitHub PRを共有・review surfaceとして使うこと。

## 現在停止する作業

- L3以降の設計・実装、新世代CIの実装・起動、release、deployment。
- 旧CI、旧runtime、旧hook、旧test、旧AI promptの実行またはfallback。
- reviewer名だけを根拠にしたCLI、API、IDE、Worker、GitHub Appの起動。
- PR、Issue、CI、DB、memory、会話からの要求採否・人間承認・受入の生成。

## GitHubの位置づけ

PRは上流候補の差分共有と許可されたreviewに使う。旧workflowは非実行archiveへ移動済みであり、現時点で新世代CIはない。
required check、review、merge等のrepository設定が旧世代を前提にする場合、その設定変更はHELIX-OSのGitHub projection再構築として別に扱う。
