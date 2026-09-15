# 旧要求の現行保持領域

status: source_snapshot_preserved_pending_human_confirmation
policy: [旧要求の無損失carry-forward方針](../legacy-requirement-carry-forward-policy.md)

このdirectoryは、旧要求をarchiveだけへ退避して実質的に捨てないためのread-only source snapshotである。要求本文とRequirement IRを旧sourceから同一byteで保持するが、新世代authority、実装、oracleへ自動昇格しない。旧owner、旧技術、旧実装名が含まれていても、それを理由に要求の意味を削除しない。対象product、責務、粒度、接続関係は後続の要求PRで整理する。

- `helix-requirements_v1.3.md`: 旧要件本文の完全一致copy
- `requirements-ir/`: 旧Requirement IR 6ファイルの完全一致copy
- `MANIFEST.sha256`: 現行保持copyのdigest
- `legacy-documents/`: 旧HARNESS要求5文書、旧画面要求7文書、旧HELIX要求9文書、画面境界1文書を元相対path付きで保持
- `LEGACY-DOCUMENTS.sha256`: 上記22文書のdigest
- `../legacy-requirement-carry-forward.jsonl`: 153要求の原文・digest・配置状態
- `../legacy-requirement-document-carry-forward.jsonl`: 22要求文書のsource path、保持path、digest、元authority状態を変えない規則
- `../legacy-confirmed-requirement-identity-carry-forward.jsonl`: confirmed文書で明示宣言された175 identityのsource行、行digest、再配置状態
- `../legacy-ir-document-source-relation.jsonl`: Requirement IR 153件と保持済み人間向け要求表の原文一致relation
- `../legacy-requirement-semantic-line-carry-forward.jsonl`: 22文書の非空semantic line 2,386件を原文・行番号・digest付きで保持し、明示IDへ接続できない2,058件をatom化待ちにする台帳
- `../legacy-requirement-semantic-line-inventory.md`: semantic line台帳の範囲、数え方、後続atom化規律
- `../legacy-requirement-atomization-review-queue.jsonl`: 未分類2,058行をsource・heading・連続範囲ごとの721 review unitへ無損失に分けた処理queue
- `../pre-isolation-revision-delta-source-holding.jsonl`: 監査基準からarchive隔離直前までに変わった333 pathの旧revisionをcommit・blob・SHA-256付きで保持する台帳

archiveは隔離直前treeの同一byte snapshotである。監査基準revisionと隔離直前revisionが異なる333 pathは、
[revision差分保全監査](../audits/source-rebaseline/pre-isolation-revision-delta-audit-2026-09-16.md)に従い両方を生存中sourceとして扱う。
後のrevisionがあることから前の要求意味を同値・置換済み・不要と推定しない。

37件の対象別L2はrouting containerであり、この要求集合を置換・縮約しない。重複、縮退、意味変更、retireは候補として明示し、人間の対象revision付き決定がない限り適用しない。

## 読後検証

2026-09-15時点で、要求本文1ファイル、Requirement IR 6ファイル、旧要求文書22ファイルの計29ファイルをsourceとbyte比較し、29/29一致した。これは要求の保持証拠であり、要求の再承認、責務分離完了、実装、受入を意味しない。

22文書のsource metadataは、`confirmed` 17件、`draft` 3件、`proposed` 1件、`placeholder` 1件である。
台帳では`confirmed`を`source_confirmed_preserved`として保持し、残る5件も元statusを変えず保存する。
新世代の物理配置や37件のrouting containerを理由に、`confirmed`を未承認候補へ降格しない。

confirmed文書の要求表、要求見出し、要求宣言行から、source-qualified identity 175件を原文行付きで台帳化した。
同名IDが別文書にある場合はsource pathをnamespaceとして衝突を残す。これは自動統合・重複削除を行わないためである。
明示IDを持たない段落条件と技術要求節は、[semantic line台帳](../legacy-requirement-semantic-line-carry-forward.jsonl)へsource span単位で全量登録した。2,386行のうち328行は既存の175 identityまたは153 IRへ接続し、残る2,058行は要求かどうかを先に切らず`preserved_pending_atomization`として保持する。これは2,058要求の確定ではなく、atom化・分類前に原文を落とさないための過包含queueである。

Requirement IR 153件は、全件が保持済み`infinity-loop-platform-requirements.md`の宣言行を指している。
153/153件についてIDとstatementがIRと人間向け文書で一致することを確認し、relation台帳へ双方のpointerと
source行digestを記録した。IRだけ、またはMarkdownだけの更新で要求を消したことにしない。
