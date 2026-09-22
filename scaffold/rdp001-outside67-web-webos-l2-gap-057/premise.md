# 調査前提

- `MPR-SH-OUTSIDE67-001` は `unassigned_cross_product`、`source_preserved_unassigned`、`authority_effect:none` のsource holdingであり、67 path_revision_pairを要求atomとして扱わない。
- 旧L2文書の `status:draft`、`freeze_blocking:true`、親L1候補・L11 pair記載は、現行承認・実装・受入を意味しない。
- path由来product／phaseは候補であり、HELIX-HARNESS、HELIX-OS、HELIX-Web、HELIX-Web-OSの責務境界と最終ownerを確定しない。
- 旧／現行implementation、degradation、failure、consumer、decisionの不在や未記載は、未実装・正常・廃止・不要の根拠にしない。
- WebとWeb-OSのsource lineは意味接続候補を持つが、共有state／credential／writer／authorityを生成しない。
- source_fragmentにないactor／action／condition／guard／sequenceの補完はcandidate_inferenceとして隔離し、source意味へ昇格しない。原文fragment自体の明示的否定・禁止だけを逐語negative／guardとして保持する。
- fragmentが同一行の列挙語である場合、行全体の述語を意味継承してよい範囲を`inherited_predicate`のexact span／positionで束縛する。fragment＋述語で証明できるaction／conditionだけをsource-supportedへ復元し、行全体にない生成guardは残さない。
- `normalized_statement`、`retained_meaning`、`unresolved_questions`、`diff_observation`は意味を追加する自由欄ではなく、各atomに独立recordとして固定する。inventoryのfindings／unresolved_questions／prohibited_inferenceも固定id／status／text recordとし、未知keyや無指定statusを受け入れない。
