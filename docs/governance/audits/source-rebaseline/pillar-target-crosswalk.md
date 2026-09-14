# HELIX柱要求の対象別対応

> **旧世代sourceの対応記録:** 本表の上位IDと「正規改訂」は旧世代sourceから意味を採取するための対応語であり、
> 旧文書を新世代canonicalへ再昇格する指示ではない。採用は対象別L2の個別判断で行う。

確認日: 2026-09-14

`archive/legacy-generation-2026-09-14/root/docs/design/helix/L0-charter/helix-charter_v0.1.md`のP0–P9と
`archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/pillar-requirements.md`のHBR／HNFRは、HARNESSの工程要求と
HELIX-OSの実行・管理要求を混在させている。本表は既存承認を変更せず、対象別L2への親子関係を明示する。

| 上位ID | HARNESSへ渡す意味 | HELIX-OSへ渡す意味 | 対象別L2 |
|---|---|---|---|
| HBR-P0 | 選択済みdevelopment style、逸脱時の正規return、進行条件 | route判定、停止、Recovery実行、状態管理 | HARNESS-L2-002／003、HELIXOS-L2-003／009 |
| HBR-P1 | 要件凍結後の工程、version対象、完了条件 | queue、heartbeat、budget、継続・再開、実行制御 | HARNESS-L2-003、HELIXOS-L2-004／009 |
| HBR-P2 | worker≠verifier等の工程上の役割分離条件 | Worker割当、lane、provider、effort、budget、tool surface統制 | HARNESS-L2-005、HELIXOS-L2-003／004 |
| HBR-P3 | V-pair、検証義務、machine／semantic判定、外部真実との照合 | gate・review・測定の実行と証拠回収 | HARNESS-L2-001／003／004／005、HELIXOS-L2-007／008 |
| HBR-P4 | 改善で再確認する要求・設計・検証の工程 | drift検出、修復候補、学習、採否、効果・退行の観測 | HARNESS-L2-004、HELIXOS-L2-005／007 |
| HBR-P6 | 外部提供するHARNESS package、版、依存、導入・更新・復旧条件 | GitHub／CI運転、artifact生成、配布、promotion、rollback、監視 | HARNESS-L2-006、HELIXOS-L2-006／008 |
| HBR-P7 | 要求・設計・検証の参照条件 | bounded通知、状態projection、ログ、継続、知識の昇格・失効 | HARNESS-L2-004／005、HELIXOS-L2-005／007／009 |
| HBR-P8 | 根拠を要求・設計・検証へ反映する工程条件 | 外部調査、tool実行、security、sandbox、skill候補化 | HARNESS-L2-003／005、HELIXOS-L2-003／004／005 |
| HBR-P9 | trace、V-pair、変更影響、完了条件 | ledger、DB projection、欠落・競合・staleの管理と可視化 | HARNESS-L2-004、HELIXOS-L2-001／002／007 |
| HNFR-P3 | 検証厳格性、self-review禁止、反証可能な完了証拠 | 独立reviewとevidenceの実行・保存 | HARNESS-L2-005、HELIXOS-L2-007／008 |
| HNFR-P5 | contextに依存しない工程・再開条件 | injection budget、checkpoint、continuation、memory縮退 | HARNESS-L2-003／005、HELIXOS-L2-004／009 |
| HNFR-P8 | 外部連携時に工程が要求する安全条件 | secret、PII、認可、sandbox、外部作用の実行統制 | HARNESS-L2-005、HELIXOS-L2-003／004／007 |
| HNFR-AC | 同一規則を適用するための公開契約 | runtime／adapter間のrule、memory、guard parity | HARNESS-L2-005、HELIXOS-L2-003／004／009 |

P5はL0 charterで独立した業務柱として定義されず、HNFR-P5だけが存在する。欠番を推測で新要求へ補わない。
各行は一つの上位要求を二重正本化するものではない。HARNESSは「何を満たすか」、HELIX-OSは
「どの対象へ適用し、実行・保存・制御するか」を所有する。正規改訂では上位IDとの`derived_from`／`governed_by`関係を
保持し、同じ文章を両対象へ複製しない。
