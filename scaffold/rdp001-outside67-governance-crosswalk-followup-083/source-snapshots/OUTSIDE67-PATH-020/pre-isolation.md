# Infinity Loop業務要求の対象別照合

指定JSON正本のHIL-BR-01..33を読んだ対象別整理案。要求本文の複製・上書きや、JSON移管完了を意味しない。
正本は[requirements.json](../../../../requirements-ir/requirements.json)。各IDのrevision・statementと受入参照を保持して照合する。

照合時のファイルSHA-256：`80e965736a91f99b2ebb77fba2e63a4bf86d5ab5df6fde1d9685f57b42457688`。

| 正本ID | revision | 対象判断 | 分離・是正する条件 |
|---|---|---|---|
| HIL-BR-01 | 1 | HARNESS／OS | 合意後の進行条件はHARNESS-L2-003、runtime交互運転はHELIXOS-L2-004／009 |
| HIL-BR-02 | 1 | OS | PR検出・監査job生成はHELIXOS-L2-004／008 |
| HIL-BR-03 | 1 | OS・意味変更要 | HELIXOS-L2-005／007。永続知識をmemoryへ昇格する旧条件はHMCの有期限通知境界と衝突 |
| HIL-BR-04 | 1 | HARNESS／OS | 分類軸とReverse適用条件はHARNESS-L2-002／003、Issueへの投影はHELIXOS-L2-002／003 |
| HIL-BR-05 | 1 | HARNESS／OS | 再設計・再凍結条件はHARNESS-L2-003／004、割当はHELIXOS-L2-004 |
| HIL-BR-06 | 1 | HARNESS／OS | 工程条件はHARNESS-L2-003、作業状態への適用はHELIXOS-L2-002／008 |
| HIL-BR-07 | 1 | OS・採用差分照合要 | HELIXOS-L2-001／007。入力保存と終端権限をAVS／RFAのscopeと照合し、要求の採否とIssue状態を分ける |
| HIL-BR-08 | 1 | HARNESS／OS | scope条件はHARNESS-L2-003／004、子作業生成はHELIXOS-L2-002。子Issueを要求正本にしない |
| HIL-BR-09 | 1 | OS・意味変更要 | HELIXOS-L2-004。HARNESS所有agent、旧drive軸を最新の責務・分類へ改訂する対象 |
| HIL-BR-10 | 1 | OS | HELIXOS-L2-002／007。因果追跡とDB収束、memoryは通知参照へ限定 |
| HIL-BR-11 | 1 | OS | HELIXOS-L2-005。候補・検証・昇格を追跡しHARNESS規則を直接上書きしない |
| HIL-BR-12 | 1 | OS | HELIXOS-L2-001／003。intakeと分類・作業接続 |
| HIL-BR-13 | 1 | HARNESS／OS | HARNESS-L2-003がL2合意条件、HELIXOS-L2-001／007が適用・証拠管理 |
| HIL-BR-14 | 2 | OS | HELIXOS-L2-002／005。source inventoryと採否追跡。exact source範囲は消さず照合する |
| HIL-BR-15 | 1 | OS | HELIXOS-L2-001／002／005。product dataの取込・出典・投影。Web製品機能の採択ではない |
| HIL-BR-16 | 1 | HARNESS／OS | 検証順序・lineage条件はHARNESS-L2-005、CI実行はHELIXOS-L2-008。三段固定の適用範囲を照合する |
| HIL-BR-17 | 1 | OS | HELIXOS-L2-002／004／007。finding処理・後続作業・writerへの返却 |
| HIL-BR-18 | 1 | OS・意味変更要 | HELIXOS-L2-004／009。agent instance lifecycleのHARNESS所有表現をOSへ改訂する対象 |
| HIL-BR-19 | 1 | 実装制約 | ADR-009／010によるHELIX実装・配布制約。consumerの言語制約としてHARNESS-L2-005へ転用しない |
| HIL-BR-20 | 1 | OS | HELIXOS-L2-008。quarantineと代替検証運用。条件緩和の根拠にしない |
| HIL-BR-21 | 1 | HARNESS／OS・意味変更要 | 意味保存とreroute条件はHARNESS-L2-003／004、実施管理はHELIXOS-L2-005。旧駆動モデル表現を現行分類へ照合 |
| HIL-BR-22 | 1 | HARNESS／OS | 設計義務の条件はHARNESS-L2-004、生成・消込管理はHELIXOS-L2-002 |
| HIL-BR-23 | 1 | OS・意味変更要 | HELIXOS-L2-001／004／005。Translatorとgap管理のHARNESS所有表現を改訂する対象 |
| HIL-BR-24 | 1 | OS | HELIXOS-L2-001／002／007。要求定義の履歴と状態管理 |
| HIL-BR-25 | 1 | HARNESS／OS | 層・上下・pair条件はHARNESS-L2-001／004、台帳の生成・投影はHELIXOS-L2-002／007 |
| HIL-BR-26 | 1 | HARNESS／OS・採用差分照合要 | 正本化条件はHARNESS-L2-003、authoring transactionはHELIXOS-L2-001／003。RFA候補の承認policy発効と区別 |
| HIL-BR-27 | 1 | HARNESS／OS | 必要な設計契約はHARNESS-L2-004／005、portfolio導出・管理はHELIXOS-L2-002 |
| HIL-BR-28 | 1 | HARNESS／OS | style・Discovery接続はHARNESS-L2-002／003、portfolio適用はHELIXOS-L2-003 |
| HIL-BR-29 | 1 | OS | HELIXOS-L2-004／005。判断packの選択・評価・段階昇格 |
| HIL-BR-30 | 1 | OS・意味変更要 | HELIXOS-L2-004。専門agent生成・権限制約のHARNESS所有表現を改訂する対象 |
| HIL-BR-31 | 1 | OS | HELIXOS-L2-004／005。第三者worker採否とbench証拠 |
| HIL-BR-32 | 1 | OS | HELIXOS-L2-004。第三者runtimeの隔離・委譲範囲。Python semantic coreのauthority制約と混同しない |
| HIL-BR-33 | 1 | HARNESS／OS | 提供indexと構成条件はHARNESS-L2-006、配布運用はHELIXOS-L2-006。実cutoverは別境界 |

「意味変更要」は名称置換だけでは解消しない。候補・PO決定との意味差分を確認し、正規JSON transactionで要求revision・契約・受入・下流へ反映する必要がある。
本文の旧HARNESS所有という記載は、最新決定によるOSへの分離を妨げる根拠にしない。
この33件を全153件やHELIX全要求の代替分母にしない。FR69件、NFR40件、TR11件とrefinement・他文書の条件は別途照合する。
