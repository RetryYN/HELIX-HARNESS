# 技術負債・週次driftの旧原文と現行への接続

照合base: `fa50cfe2f5ff7e1439e5dea6127c51d078390309`。037は未採択のversion_target 1.0候補。既存固定L1/L2/L11へのPO合意を拡張しない。

## 原文

- `LEGACY-ASSET-6B6C5CB0E481BE01088B` `docs/governance/requirements-source/legacy-documents/docs/design/harness/L1-requirements/functional-requirements.md:42` file `sha256:a9c1064d359b0d9c7269a2253e416597de77fa91149c162f9a40467be3f1a008` line `sha256:cbfb45891382f2d4e88c5e18ad09c90a4df1f18f880dca3b32b04df63737563a`

  > | **FR-L1-11** | 横断 4 機構 (interrupt / debt / drift-check / readiness) のモード進行非ブロック発動 | cross-cutting-mechanisms | 割り込みイベント / 負債台帳 / drift / 保留 | sprint interrupted / debt-register / 乖離レポート / 後工程 PLAN 先送り | P0 | PM-03 (詰まり要因) / HM-07 |

- `LEGACY-ASSET-9F48ADEEB477DCA54039` `docs/governance/requirements-source/legacy-documents/docs/design/harness/L1-requirements/business-requirements.md:133` file `sha256:09ad9a27afe25bd730f57319865d1f342e6b31729da2dd27f22ecd6cb753ac61` line `sha256:d8e47c20dd56ba978a50ddb82b24f8e0e36c7e1b448dcffd90ebb1eaab585fef`

  > | **interrupt** | 割り込みイベント (緊急 bug / 方針変更) | sprint interrupted 状態登録、現工程保留 |

- `LEGACY-ASSET-9F48ADEEB477DCA54039` `docs/governance/requirements-source/legacy-documents/docs/design/harness/L1-requirements/business-requirements.md:134` file `sha256:09ad9a27afe25bd730f57319865d1f342e6b31729da2dd27f22ecd6cb753ac61` line `sha256:e52575621c82fa6fefae723e090abd122fc16d63c81f8c2dad340aaec6e66587`

  > | **debt** | 技術負債の累積検知 | debt-register 起票、返済 PLAN 自動提案 |

- `LEGACY-ASSET-9F48ADEEB477DCA54039` `docs/governance/requirements-source/legacy-documents/docs/design/harness/L1-requirements/business-requirements.md:135` file `sha256:09ad9a27afe25bd730f57319865d1f342e6b31729da2dd27f22ecd6cb753ac61` line `sha256:dd409ccbcd301e35229513f71a1645ed54057bb99cefb1fcf97b2a728878e856`

  > | **drift-check** | 週次 detector 起動 | 設計⇔実装の乖離レポート生成 |

- `LEGACY-ASSET-9F48ADEEB477DCA54039` `docs/governance/requirements-source/legacy-documents/docs/design/harness/L1-requirements/business-requirements.md:136` file `sha256:09ad9a27afe25bd730f57319865d1f342e6b31729da2dd27f22ecd6cb753ac61` line `sha256:5f0df27f912e51fb27f40e13f0b5635a9b6b10463a6850a990a71e39b18c63f7`

  > | **readiness** | 後工程着手前 | 前工程成果物の充足度確認、PLAN 先送り判定 |

## 保持・再導出・範囲

旧FRの非ブロック発動は、観測・提案を無関係なmode進行の同期gateにしない意味で保持する。同じ旧業務表が求めるinterrupt対象のholdとreadiness対象の次工程延期は、HARNESS-L2-003とOS-L2-009/010・対L11の既存条件で扱う。037はそれらを免除しない。

技術負債の累積検知は分類根拠を伴うsource/ownerの観測・LABO評価から受け、OSの既存候補記録と返済PLAN案へつなぐ。旧原文は蓄積閾値や自動実行権限を指定していないため補作せず、OSの既存優先順位決定は保持する。元のdebt-register名を別DBや別機構として復活させず、未解決負債がsource/owner/revisionとともに可視になる価値を保持する。

旧業務表の「週次」は例示でなく発動頻度であり、037の非同期観測・報告候補へ残す。既存HARNESS-L2-003/004/025の要求/設計oracleを使い、差分がある場合のReverse/Backflowへ接続する。要求revisionが変わらない週も観測し、欠測は未観測と明示する。週次全件CIや旧scheduler実行を追加せず、方式はL3以降で導出する。

親HELIXOS-L1-002の欠落/stale把握とL1-006の観測・評価・提案登録/振分けの範囲から導く。debt/driftという名がL1にないことだけで新L1や人間判断を作らない。HARNESSは技術oracle、LABOは評価、OSは観測投入・記録・進行/計画への接続を持つ。037の候補採否は他の旧要求追補とともに最後のPO判断へ残す。

## 既存条件との関係

HARNESS L2:111の要求変更がない設計/実装ずれからのReverse、L11-003/004の状態/影響判定は既存意味。OS L2:297の中断・event、L2:712–720の改善還流、L11:29,48–55の継続・振分けを再利用する。LABO-063の同種修復再発の予防候補は、全ての未解決技術負債と同一ではなく、該当すると示された場合だけ使う。

旧CLI名、旧L4実装設計、固定provider、全4,020資産再調査は入力依存にしない。原文5行の所在照合から、旧candidate全体の採択やruntime/受入実行完了を生成しない。
