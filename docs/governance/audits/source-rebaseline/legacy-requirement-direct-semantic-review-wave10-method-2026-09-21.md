---
title: "旧要求・旧asset直接semantic review wave 10方法"
status: candidate
authority_effect: none
source_revision: legacy-generation-2026-09-14
pr_class: research_premise
---

# 旧要求・旧asset直接semantic review wave 10方法

Wave 10はHELIX-HARNESSの`IRUNIT-HIL-BR-04-HELIX-HARNESS`、`IRUNIT-HIL-BR-13-HELIX-HARNESS`、`IRUNIT-HIL-FR-43-HELIX-HARNESS`を対象とする。各unitは要求・設計・実装候補の3 edge、合計9 edgeで直接照合する。BR04はIssue契約、BR13は画面工程、FR43は要求翻訳であり、正規分解台帳のshared source spanは持たない。

Wave9相当のschema 10、要求snapshotのみ`confirmed`、designと未実行sourceはpartial/unresolved、phase候補のexact転記、controlled exact-token anchor、候補pool membershipとsemantic linkの分離を維持する。authority effectはnone、current implementationは`not_established`、consumer closureはpending、`new_build_allowed:false`とする。

controlled term bindingは英数字anchorを3文字以上かつtoken境界一致、日本語・混在anchorを2文字以上とする。候補検索は汎用語を避け、unit ID、要求固有語、直接の設計・部分実装識別語に限定する。source fragmentの包含重複を許さず、要求文の全meaningful tokenをatomへ無損失分解する。

## bounded global search

asset catalog 4,020件全件についてarchive file bytesを静的に走査する。各unitの候補集合、選択3 asset、未review集合の件数とdigestをmetaへ保存する。候補membershipはsemantic link、phase採否、製品owner、実装成立を生成しない。archive内runtime、test、hook、CI、adapterは実行しない。

## 判定

要求edgeは同一requirement IDのsource snapshotに限り`confirmed`とする。design edgeは設計契約の部分対応として`unresolved`、implementation edgeは未実行のpartial static candidateとして`unresolved`とし、実装成立やconsumer closureを主張しない。catalog kindとpathが一致しないassetのatomは`design_partial_pending_kind_atom_ids`へ分離し、通常の設計partialへ算入せず、`no_evidence_atom_ids`からも差し引かない。

negative mutation検査点（専用verifierが各不変条件を直接検査する。mutation注入試験の実施を意味しない）：親revision、catalog digest、archive digest、asset ID、要求line range、excerpt digest、artifact kind、semantic status、phase転記、atom欠落、shared boundary、candidate search、prior overlap、status countの14種。
