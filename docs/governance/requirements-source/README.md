# 旧要求の現行保持領域

status: active_preserved_requirement_source
policy: [旧要求の無損失carry-forward方針](../legacy-requirement-carry-forward-policy.md)

このdirectoryは、旧要求をarchiveだけへ退避して実質的に捨てないための現行入力面である。要求本文とRequirement IRを旧sourceから同一byteで保持する。旧owner、旧技術、旧実装名が含まれていても、それを理由に要求の意味を削除しない。対象product、責務、粒度、接続関係は後続の要求PRで整理する。

- `helix-requirements_v1.3.md`: 旧要件本文の完全一致copy
- `requirements-ir/`: 旧Requirement IR 6ファイルの完全一致copy
- `MANIFEST.sha256`: 現行保持copyのdigest
- `legacy-documents/`: 旧HARNESS要求5文書、旧画面要求7文書、旧HELIX要求9文書、画面境界1文書を元相対path付きで保持
- `LEGACY-DOCUMENTS.sha256`: 上記22文書のdigest
- `../legacy-requirement-carry-forward.jsonl`: 153要求の原文・digest・配置状態
- `../legacy-requirement-document-carry-forward.jsonl`: 22要求文書のsource path、保持path、digest、元authority状態を変えない規則

37件の対象別L2はrouting containerであり、この要求集合を置換・縮約しない。重複、縮退、意味変更、retireは候補として明示し、人間の対象revision付き決定がない限り適用しない。

## 読後検証

2026-09-15時点で、要求本文1ファイル、Requirement IR 6ファイル、旧要求文書22ファイルの計29ファイルをsourceとbyte比較し、29/29一致した。これは要求の保持証拠であり、要求の再承認、責務分離完了、実装、受入を意味しない。
