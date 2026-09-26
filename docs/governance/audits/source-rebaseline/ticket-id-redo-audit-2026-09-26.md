# ticket要求の番号付け再整理監査（2026-09-26）

status: draft_candidate / authority_effect: none

## 起点と前回指摘

PR #2141 の旧HEAD `bbf0e902acec6d1638c49a7c02a894deeae2824b` を親として履歴を保ち、main `a4f65a6ff669c20e08bb15cfac2ee4e14903e061` の本文からやり直した。旧差分をmainへ機械的に適用していない。前回の[独立review（Major 3件）](https://github.com/RetryYN/HELIX-HARNESS/pull/2141#issuecomment-5830946607)に対する作成側の修正記録であり、独立reviewの合格ではない。

- 粒度：ticketの種類の目的・発行・合流先は行全体で一つの単体要求とし、連続処理は接続、推進と検収までを構成体とした。「計画」だけの要求IDは作らない。単体の要求という分類と、ticketが扱う対象の単体・接続・構成体は別である。
- ID：主要求と別のHXT-TYPE／FLOW／SYS／CORE／USE接頭辞を使い、親主要求と対L11行を明示した。既存のHXT-RQ-01..07と衝突しない。主要求の数を増やしていない。
- 責務と分担：最新mainのINTELLIGENCEの稼働判断、OSの発行、HARNESSのコア、LABOの評価を保持した。各詳細要求にシステムへ吸収する部分と運用で補う部分を記した。Scrum Reverseのcheckpointは既存条件を使い、日付・周期・承認手順を創作しない。

旧監査は旧HEADの証拠として元のbytesを保持する。旧監査にある95件・19種類・旧責務・未決事項なしという記述を今回の状態へ継承しない。今回の未採否状態はmainのままで、Experimentは案、Trainingは3.0の案、WEB-OS jobは要求整理時の未決として保持する。旧DTK 14件は退役済みの比較資料のままである。

## 旧source、判断史、failure、consumer

参照・照合のみで、旧runtime、workflow、hook、CI、testは実行していない。

| source／asset | 保持する点と失敗・consumer | 変更と根拠 |
|---|---|---|
| `archive/legacy-generation-2026-09-14/root/docs/process/modes/README.md:29–80`（LEGACY-ASSET-BF02D9AB7313C42D8FED） | workflow種別、入力から実行線への導出、親子、再入、revision変更時のstale。Issue・PLAN・PR・DBへの投影がconsumerで、投影成功と証拠の有効性を分ける | 9/24判断でticket化し、Discovery／PoC、Decide、Researchの裁定を分離、Forward大中小を導入。旧axisやstate machineを新schemaに採用しない |
| `archive/legacy-generation-2026-09-14/root/docs/governance/helix-harness-requirements_v1.3.md:60–125`（LEGACY-ASSET-02319C2481B9E01698D5） | 工程義務、画面の合意、Scrum Reverseのcheckpointと再入。receiptなしのrelease-readyと測れない高速化を拒否する。設計と受入がconsumer | 旧開発方式・層の扱いをそのまま移さず、9/24判断と9/26 V谷判断、最新HARNESS本文を適用する |
| `archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:65,69,120–121` | 画面の要求還流、findingの振り分け・返却と破棄禁止、再合意前のForward合流禁止。作成側と後続作業がconsumer | 9/26 handoff判断でOSの推進を発行・振り分けの主体、Issueをticketの投影とする |
| `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/execution-ticket-requirements.md:157–163,242,319,343,349–351` | 評価対象と実験の実行を混同しない、後日失敗で元closureを書き換えない、別予算・列、Benchから直接配車しない。評価・配車・改善還流がconsumer | 9/26判断でLABO評価、INTELLIGENCE案、OS登録・発行へ分担。Experimentという名前を案として保持する |
| `archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/pillar-requirements.md:29–39` | 既存のconfirmed要求系列を侵さない名前空間、inventoryを先に読む | 既存のHXT-RQ詳細IDと親主要求の分離を起点に、今回の詳細を別prefixにする。旧IR／IDからauthorityを生成しない |

Trainingの旧source不在はhandoff判断記録の検索結果（旧execution-ticket-intake:164はweightsのfine-tuningを要求しない）に従い、新しい3.0の案として明示する。各詳細行の根拠は以下に記録する。完全一致の再利用は旧source本文の保存に限り、要求の整理は最新PO判断からの意味の再導出である。

## 詳細IDと出典

34件：ticket種類21、接続9、構成体1、HARNESSコア2、既存種類の適用境界1。L2／L11の主要求の連番は不変。成功条件・反例は各IDと同じ対L11行に一件ずつ置く。

| 詳細ID | 親主要求 | 根拠 |
|---|---|---|
| HXT-TYPE-01 | HELIXOS-L2-010 | archive/legacy-generation-2026-09-14/root/docs/process/modes/README.md:29–80; docs/governance/decisions/concept-requirement-po-decisions-2026-09-24.md:78–95 |
| HXT-TYPE-02 | HELIXOS-L2-010 | archive/legacy-generation-2026-09-14/root/docs/process/modes/README.md:29–80; docs/governance/decisions/concept-requirement-po-decisions-2026-09-24.md:78–95 |
| HXT-TYPE-03 | HELIXOS-L2-010 | archive/legacy-generation-2026-09-14/root/docs/process/modes/README.md:29–80; docs/governance/decisions/concept-requirement-po-decisions-2026-09-24.md:78–95 |
| HXT-TYPE-04 | HELIXOS-L2-010 | archive/legacy-generation-2026-09-14/root/docs/process/modes/README.md:29–80; docs/governance/decisions/concept-requirement-po-decisions-2026-09-24.md:78–95 |
| HXT-TYPE-05 | HELIXOS-L2-010 | archive/legacy-generation-2026-09-14/root/docs/process/modes/README.md:29–80; docs/governance/decisions/concept-requirement-po-decisions-2026-09-24.md:78–95 |
| HXT-TYPE-06 | HELIXOS-L2-010 | archive/legacy-generation-2026-09-14/root/docs/process/modes/README.md:29–80; docs/governance/decisions/concept-requirement-po-decisions-2026-09-24.md:78–95 |
| HXT-TYPE-07 | HELIXOS-L2-010 | archive/legacy-generation-2026-09-14/root/docs/process/modes/README.md:29–80; docs/governance/decisions/concept-requirement-po-decisions-2026-09-24.md:78–95 |
| HXT-TYPE-08 | HELIXOS-L2-010 | archive/legacy-generation-2026-09-14/root/docs/process/modes/README.md:29–80; docs/governance/decisions/concept-requirement-po-decisions-2026-09-24.md:78–95 |
| HXT-TYPE-09 | HELIXOS-L2-010 | archive/legacy-generation-2026-09-14/root/docs/process/modes/README.md:29–80; docs/governance/decisions/concept-requirement-po-decisions-2026-09-24.md:78–95; archive/legacy-generation-2026-09-14/root/docs/governance/helix-harness-requirements_v1.3.md:94–108 |
| HXT-TYPE-10 | HELIXOS-L2-009／HELIXOS-L2-010 | archive/legacy-generation-2026-09-14/root/docs/process/modes/README.md:29–80; docs/governance/decisions/concept-requirement-po-decisions-2026-09-24.md:78–95 |
| HXT-TYPE-11 | HELIXOS-L2-010 | archive/legacy-generation-2026-09-14/root/docs/process/modes/README.md:29–80; docs/governance/decisions/concept-requirement-po-decisions-2026-09-24.md:78–95 |
| HXT-TYPE-12 | HELIXOS-L2-010 | archive/legacy-generation-2026-09-14/root/docs/process/modes/README.md:29–80; docs/governance/decisions/concept-requirement-po-decisions-2026-09-24.md:78–95 |
| HXT-TYPE-13 | HELIXOS-L2-010 | archive/legacy-generation-2026-09-14/root/docs/process/modes/README.md:29–80; docs/governance/decisions/concept-requirement-po-decisions-2026-09-24.md:78–95 |
| HXT-TYPE-14 | HELIXOS-L2-010 | archive/legacy-generation-2026-09-14/root/docs/process/modes/README.md:29–80; docs/governance/decisions/concept-requirement-po-decisions-2026-09-24.md:78–95 |
| HXT-TYPE-15 | HELIXOS-L2-010 | archive/legacy-generation-2026-09-14/root/docs/process/modes/README.md:29–80; docs/governance/decisions/concept-requirement-po-decisions-2026-09-24.md:78–95 |
| HXT-TYPE-16 | HELIXOS-L2-010 | archive/legacy-generation-2026-09-14/root/docs/process/modes/README.md:29–80; docs/governance/decisions/concept-requirement-po-decisions-2026-09-24.md:78–95 |
| HXT-TYPE-17 | HELIXOS-L2-010 | archive/legacy-generation-2026-09-14/root/docs/process/modes/README.md:29–80; docs/governance/decisions/concept-requirement-po-decisions-2026-09-24.md:78–95 |
| HXT-TYPE-18 | HELIXOS-L2-010 | archive/legacy-generation-2026-09-14/root/docs/process/modes/README.md:29–80; docs/governance/decisions/concept-requirement-po-decisions-2026-09-24.md:78–95 |
| HXT-TYPE-19 | HELIXOS-L2-010 | archive/legacy-generation-2026-09-14/root/docs/process/modes/README.md:29–80; docs/governance/decisions/concept-requirement-po-decisions-2026-09-24.md:78–95 |
| HXT-TYPE-20 | HELIXOS-L2-010／HELIXOS-L2-005 | archive/legacy-generation-2026-09-14/root/docs/governance/candidates/execution-ticket-requirements.md:157–163,343; docs/governance/decisions/handoff-integration-po-decisions-2026-09-26.md（Experimentの案） |
| HXT-TYPE-21 | HELIXOS-L2-010／HELIXOS-L2-005 | docs/governance/decisions/handoff-integration-po-decisions-2026-09-26.md（Training、旧intake:164に学習要求なしと記録） |
| HXT-FLOW-01 | HELIXOS-L2-010／HELIXOS-L2-002 | archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:65,121; docs/governance/decisions/concept-requirement-po-decisions-2026-09-24.md; docs/governance/decisions/handoff-integration-po-decisions-2026-09-26.md |
| HXT-FLOW-02 | HELIXOS-L2-010／HELIXOS-L2-005 | archive/legacy-generation-2026-09-14/root/docs/process/modes/README.md:40,73–80; docs/governance/decisions/concept-requirement-po-decisions-2026-09-24.md |
| HXT-FLOW-03 | HELIXOS-L2-010 | archive/legacy-generation-2026-09-14/root/docs/process/modes/README.md:44–45,73–80; docs/governance/decisions/concept-requirement-po-decisions-2026-09-24.md |
| HXT-FLOW-04 | HELIXOS-L2-010 | archive/legacy-generation-2026-09-14/root/docs/process/modes/README.md:37,55–80; docs/governance/decisions/concept-requirement-po-decisions-2026-09-24.md |
| HXT-FLOW-05 | HELIXOS-L2-010／HELIXOS-L2-011／HELIXOS-L2-008 | archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:68,118,121（旧固定3段からの変更はdocs/governance/decisions/harness-v-valley-process-po-decisions-2026-09-26.md） |
| HXT-FLOW-06 | HELIXOS-L2-002／HELIXOS-L2-005／HELIXOS-L2-007 | archive/legacy-generation-2026-09-14/root/docs/governance/candidates/execution-ticket-requirements.md:319; docs/governance/decisions/harness-v-valley-process-po-decisions-2026-09-26.md; docs/governance/decisions/handoff-integration-po-decisions-2026-09-26.md |
| HXT-FLOW-07 | HELIXOS-L2-010／HELIXOS-L2-002 | archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:69,120; docs/governance/decisions/handoff-integration-po-decisions-2026-09-26.md |
| HXT-FLOW-08 | HELIXOS-L2-010／HELIXOS-L2-005 | archive/legacy-generation-2026-09-14/root/docs/governance/candidates/execution-ticket-requirements.md:157–163,343; docs/governance/decisions/handoff-integration-po-decisions-2026-09-26.md |
| HXT-FLOW-09 | HELIXOS-L2-010／HELIXOS-L2-005 | docs/governance/decisions/handoff-integration-po-decisions-2026-09-26.md（旧sourceに学習ticket要求なし） |
| HXT-SYS-01 | HELIXOS-L2-010／HELIXOS-L2-011／HELIXOS-L2-008／HELIXOS-L2-002 | archive/legacy-generation-2026-09-14/root/docs/process/modes/README.md:64–80; archive/legacy-generation-2026-09-14/root/docs/governance/candidates/execution-ticket-requirements.md:349–351; docs/governance/decisions/concept-requirement-po-decisions-2026-09-24.md; docs/governance/decisions/po-optimal-draft-po-decisions-2026-09-25.md:109–139; docs/governance/decisions/handoff-integration-po-decisions-2026-09-26.md |
| HXT-CORE-01 | HARNESS-L2-002／HARNESS-L2-008 | archive/legacy-generation-2026-09-14/root/docs/governance/helix-harness-requirements_v1.3.md:60–91; docs/governance/decisions/concept-requirement-po-decisions-2026-09-24.md; docs/governance/decisions/po-optimal-draft-po-decisions-2026-09-25.md:134–139 |
| HXT-CORE-02 | HARNESS-L2-002／HARNESS-L2-008 | archive/legacy-generation-2026-09-14/root/docs/process/modes/README.md:64–80; docs/governance/decisions/concept-requirement-po-decisions-2026-09-24.md; docs/governance/decisions/handoff-integration-po-decisions-2026-09-26.md |
| HXT-USE-01 | HELIXOS-L2-004／HELIXOS-L2-010 | docs/governance/decisions/handoff-integration-po-decisions-2026-09-26.md（botとWeb提供側job。旧sourceとの差は同記録） |

## 準備記録37行の対応

元の準備記録はsnapshotとして書き換えない。対象30行と補助7行を区別する。原文引用や導入文は新しい要求を生まず、対応先の根拠として示す。

| 準備記録ID | 原行 | 対応先／扱い |
|---|---:|---|
| G4-TICKET-LINE-001 | 104 | HXT-SYS-01（導入・未採否状態） |
| G4-TICKET-LINE-002 | 106 | HXT-SYS-01 |
| G4-TICKET-LINE-003 | 107 | HXT-SYS-01（PO原文の根拠） |
| G4-TICKET-LINE-004 | 109 | HXT-SYS-01 |
| G4-TICKET-LINE-005 | 110 | HXT-SYS-01 |
| G4-TICKET-LINE-006 | 111 | HXT-SYS-01／HXT-CORE-01／02。旧BRAIN判断は最新mainのINTELLIGENCEへ置換済み |
| G4-TICKET-LINE-007 | 112 | HXT-SYS-01／HXT-FLOW-05 |
| G4-TICKET-LINE-008 | 113 | HXT-SYS-01 |
| G4-TICKET-LINE-009 | 114 | HXT-SYS-01／HXT-FLOW-04 |
| G4-TICKET-LINE-010 | 115 | HXT-SYS-01 |
| G4-TICKET-LINE-011 | 119 | 補助：出典・表見出し・旧との差の説明。単独の要求IDは付けない |
| G4-TICKET-LINE-012 | 121 | HXT-SYS-01／HXT-FLOW-05 |
| G4-TICKET-LINE-013 | 123 | 補助：出典・表見出し・旧との差の説明。単独の要求IDは付けない |
| G4-TICKET-LINE-014 | 125 | HXT-TYPE-01 |
| G4-TICKET-LINE-015 | 126 | HXT-TYPE-02 |
| G4-TICKET-LINE-016 | 127 | HXT-TYPE-03 |
| G4-TICKET-LINE-017 | 128 | HXT-TYPE-04 |
| G4-TICKET-LINE-018 | 129 | HXT-TYPE-05 |
| G4-TICKET-LINE-019 | 130 | HXT-TYPE-06 |
| G4-TICKET-LINE-020 | 131 | HXT-TYPE-07 |
| G4-TICKET-LINE-021 | 132 | HXT-TYPE-08 |
| G4-TICKET-LINE-022 | 133 | HXT-TYPE-09 |
| G4-TICKET-LINE-023 | 134 | HXT-TYPE-10 |
| G4-TICKET-LINE-024 | 135 | HXT-TYPE-11 |
| G4-TICKET-LINE-025 | 136 | HXT-TYPE-12 |
| G4-TICKET-LINE-026 | 137 | HXT-TYPE-13 |
| G4-TICKET-LINE-027 | 138 | HXT-TYPE-14 |
| G4-TICKET-LINE-028 | 139 | HXT-TYPE-15 |
| G4-TICKET-LINE-029 | 140 | HXT-TYPE-16 |
| G4-TICKET-LINE-030 | 141 | HXT-TYPE-17 |
| G4-TICKET-LINE-031 | 142 | HXT-TYPE-18 |
| G4-TICKET-LINE-032 | 143 | HXT-TYPE-19 |
| G4-TICKET-LINE-033 | 145 | 補助：出典・表見出し・旧との差の説明。単独の要求IDは付けない |
| G4-TICKET-LINE-034 | 146 | 補助：出典・表見出し・旧との差の説明。単独の要求IDは付けない |
| G4-TICKET-LINE-035 | 147 | 補助：出典・表見出し・旧との差の説明。単独の要求IDは付けない |
| G4-TICKET-LINE-036 | 148 | 補助：出典・表見出し・旧との差の説明。単独の要求IDは付けない |
| G4-TICKET-LINE-037 | 149 | 補助：出典・表見出し・旧との差の説明。単独の要求IDは付けない |

HARNESS準備記録の旧71行はHXT-CORE-02、72行はOSへの参照、73行はHXT-CORE-01、74行はHXT-CORE-02、75行はHXT-CORE-01へ接続する。

## 旧95 IDからの対応

旧IDは旧HEADと組で参照する。新本文では定義せず、今回の詳細IDへまとめる。これは旧要求のretireではなく、未採否の番号付けの修正である。

| 旧HEADの詳細ID | 今回の詳細ID |
|---|---|
| HELIXOS-L2-014 | HXT-SYS-01 |
| HELIXOS-L2-015 | HXT-SYS-01 |
| HELIXOS-L2-016 | HXT-SYS-01 |
| HELIXOS-L2-017 | HXT-SYS-01 |
| HELIXOS-L2-018 | HXT-SYS-01 |
| HELIXOS-L2-019 | HXT-SYS-01 |
| HELIXOS-L2-020 | HXT-SYS-01／HXT-FLOW-05 |
| HELIXOS-L2-021 | HXT-SYS-01／HXT-FLOW-05 |
| HELIXOS-L2-022 | HXT-SYS-01 |
| HELIXOS-L2-023 | HXT-SYS-01 |
| HELIXOS-L2-024 | HXT-SYS-01／HXT-FLOW-04 |
| HELIXOS-L2-025 | HXT-SYS-01／HXT-FLOW-04 |
| HELIXOS-L2-026 | HXT-SYS-01／HXT-FLOW-04 |
| HELIXOS-L2-027 | HXT-SYS-01 |
| HELIXOS-L2-028 | HXT-SYS-01／HXT-FLOW-05 |
| HELIXOS-L2-029 | HXT-SYS-01／HXT-FLOW-05 |
| HELIXOS-L2-030 | HXT-SYS-01／HXT-FLOW-05 |
| HELIXOS-L2-031 | HXT-TYPE-01 |
| HELIXOS-L2-032 | HXT-TYPE-01 |
| HELIXOS-L2-033 | HXT-TYPE-01 |
| HELIXOS-L2-034 | HXT-TYPE-02 |
| HELIXOS-L2-035 | HXT-TYPE-02 |
| HELIXOS-L2-036 | HXT-TYPE-02 |
| HELIXOS-L2-037 | HXT-TYPE-03 |
| HELIXOS-L2-038 | HXT-TYPE-03 |
| HELIXOS-L2-039 | HXT-TYPE-03 |
| HELIXOS-L2-040 | HXT-TYPE-04 |
| HELIXOS-L2-041 | HXT-TYPE-04 |
| HELIXOS-L2-042 | HXT-TYPE-04 |
| HELIXOS-L2-043 | HXT-TYPE-05 |
| HELIXOS-L2-044 | HXT-TYPE-05 |
| HELIXOS-L2-045 | HXT-TYPE-05 |
| HELIXOS-L2-046 | HXT-TYPE-05 |
| HELIXOS-L2-047 | HXT-TYPE-05 |
| HELIXOS-L2-048 | HXT-TYPE-06 |
| HELIXOS-L2-049 | HXT-TYPE-06 |
| HELIXOS-L2-050 | HXT-TYPE-06 |
| HELIXOS-L2-051 | HXT-TYPE-06 |
| HELIXOS-L2-052 | HXT-TYPE-07 |
| HELIXOS-L2-053 | HXT-TYPE-07 |
| HELIXOS-L2-054 | HXT-TYPE-07 |
| HELIXOS-L2-055 | HXT-TYPE-07 |
| HELIXOS-L2-056 | HXT-TYPE-07 |
| HELIXOS-L2-057 | HXT-TYPE-07 |
| HELIXOS-L2-058 | HXT-TYPE-08 |
| HELIXOS-L2-059 | HXT-TYPE-08 |
| HELIXOS-L2-060 | HXT-TYPE-08 |
| HELIXOS-L2-061 | HXT-TYPE-08 |
| HELIXOS-L2-062 | HXT-TYPE-09 |
| HELIXOS-L2-063 | HXT-TYPE-09 |
| HELIXOS-L2-064 | HXT-TYPE-09 |
| HELIXOS-L2-065 | HXT-TYPE-09 |
| HELIXOS-L2-066 | HXT-TYPE-09 |
| HELIXOS-L2-067 | HXT-TYPE-10 |
| HELIXOS-L2-068 | HXT-TYPE-10 |
| HELIXOS-L2-069 | HXT-TYPE-10 |
| HELIXOS-L2-070 | HXT-TYPE-11 |
| HELIXOS-L2-071 | HXT-TYPE-11 |
| HELIXOS-L2-072 | HXT-TYPE-11 |
| HELIXOS-L2-073 | HXT-TYPE-11 |
| HELIXOS-L2-074 | HXT-TYPE-12 |
| HELIXOS-L2-075 | HXT-TYPE-12 |
| HELIXOS-L2-076 | HXT-TYPE-12 |
| HELIXOS-L2-077 | HXT-TYPE-13 |
| HELIXOS-L2-078 | HXT-TYPE-13 |
| HELIXOS-L2-079 | HXT-TYPE-13 |
| HELIXOS-L2-080 | HXT-TYPE-14 |
| HELIXOS-L2-081 | HXT-TYPE-14 |
| HELIXOS-L2-082 | HXT-TYPE-14 |
| HELIXOS-L2-083 | HXT-TYPE-14 |
| HELIXOS-L2-084 | HXT-TYPE-15 |
| HELIXOS-L2-085 | HXT-TYPE-15 |
| HELIXOS-L2-086 | HXT-TYPE-15 |
| HELIXOS-L2-087 | HXT-TYPE-16 |
| HELIXOS-L2-088 | HXT-TYPE-16 |
| HELIXOS-L2-089 | HXT-TYPE-16 |
| HELIXOS-L2-090 | HXT-TYPE-17 |
| HELIXOS-L2-091 | HXT-TYPE-17 |
| HELIXOS-L2-092 | HXT-TYPE-17 |
| HELIXOS-L2-093 | HXT-TYPE-17 |
| HELIXOS-L2-094 | HXT-TYPE-18 |
| HELIXOS-L2-095 | HXT-TYPE-18 |
| HELIXOS-L2-096 | HXT-TYPE-18 |
| HELIXOS-L2-097 | HXT-TYPE-19 |
| HELIXOS-L2-098 | HXT-TYPE-19 |
| HELIXOS-L2-099 | HXT-TYPE-19 |
| HARNESS-L2-010 | HXT-CORE-02 |
| HARNESS-L2-011 | HXT-CORE-01 |
| HARNESS-L2-012 | HXT-CORE-01 |
| HARNESS-L2-013 | HXT-CORE-02 |
| HARNESS-L2-014 | HXT-CORE-02 |
| HARNESS-L2-015 | HXT-CORE-01 |
| HELIXOS-L2-100 | HXT-SYS-01 |
| HARNESS-L2-016 | HXT-CORE-02 |
| HARNESS-L2-017 | HXT-CORE-02 |

## 最新mainの追加条件の被覆

- PR前CI・省略回収・構造分類変更後の導き直し：HXT-FLOW-05。
- 後日失敗・LABO評価の還流：HXT-FLOW-06。
- 上流段階のOS発行、周辺機構の非発行、1.0／4.0境界：HXT-SYS-01。
- findingの返却と次ticketへの振り分け：HXT-FLOW-07。
- Experiment・Trainingの案と接続：HXT-TYPE-20／21、HXT-FLOW-08／09。
- botとWEB-OS job：HXT-USE-01。
- HARNESSのSECURITY責務の修正、Web配置、Workerモデル等の既存本文はmainのまま保持。

## 静的検証と参照の付け直し

- 全137件の研究用validate.pyは起点105 pass／32 fail、修正後105 pass／32 fail。成功集合・失敗集合は同一、新規失敗0件。既存の意味不一致を検査条件の変更で隠していない。これは要求の受入や新世代CIの合格ではない。
- 失敗の対象：`delegated-doc-003-028`、`delegated-doc-008-017`、`legacy-ai-instruction-product-classification-0145`、`legacy-config-product-classification-0141`、`legacy-execution-ticket-product-classification-0147`、`legacy-implementation-residual-0126`、`legacy-overlap-reconciliation-0144`、`legacy-research-assets-product-classification-0142`、`legacy-schema-product-classification-0120`、`legacy-source-product-classification-0123`、`legacy-test-design-worker-workflow-0148`、`phcap15-17-orphan-asset-links`、`phcap15-deploy-fifth12-research`、`phcap15-deploy-final8-research`、`phcap15-deploy-followup-research`、`phcap15-deploy-gap-research`、`phcap15-deploy-next12-research`、`phcap15-deploy-pool12-research`、`phcap15-deploy-research`、`phcap15-deploy-sixth12-research`、`pre-isolation`、`pre-isolation-next`、`pre-isolation-outside-holding-67-migration`、`pre-isolation-outside-l1-semantic`、`rdp001-delegated-doc001-atom-030`、`rdp001-outside67-followup-069`、`rdp001-outside67-governance-crosswalk-followup-083`、`rdp001-outside67-web-webos-l1-anchor-0121`、`rdp001-web-webos-vision-asset-semantic-0124`、`rdp001-web-webos-vision-coverage-0091`、`rdp001-web-webos-vision-semantic-atoms-0088`、`rdp001-web-webos-vision-source-0080`。
- 詳細ID34件の重複なし、対L11に各1行、親主要求の存在を確認。最新mainの21種類の表と既存本文は保持し、OSのID付与予定という導入文だけを末尾への案内へ変更した。準備記録30行と補助7行、旧95 IDの全件を対応づけた。
- scfctl stale=0、validateは142 binding合格、residuals=0、selftestは69 cases fail=0。git diff --check合格。
- 研究用pinは既存の行範囲・exact_text・意味fieldを保持したままファイルSHAを更新した。OUTSIDE67-PATH-002／005のcurrent counterpartは本文bytesも更新し、archiveとの不一致というrelationを保持した。
- PHCAP-08/09、10/11、12/13のgeneratorを使用。mainのgeneratorに残っていた移動前Web path（4、2、4参照）を現行inventoryのpathへ揃えた。10/11では既存inventoryと同じboundary・Webの行位置へ揃えた。全3件は再生成して同じbytesになることを確認。10/11の生成場所のmetadataのみこの作業treeへ更新された。generatorの意味field・検査の条件は変更していない。
- 研究JSON／JSONLの差を再帰比較した結果、変更はsha256 43箇所、file_sha256 1箇所、worktree 1箇所、bytes 2箇所だけだった。

### Binding全体の照合

各bindingの全upstreamの存在とdigest、artifactの存在を確かめた。role、obligations、connections、operations、verification、replacementの全fieldはmainと比較して不変。これらのfieldに旧詳細IDをconsumerとして固定する記述がないことも確認した。本文は末尾への条件群の整理の追補で、研究の既存の分類、authority、採否、replacementは変えない。依存するinventoryとbindingのdigest連鎖を含め、34 bindingに理由のnoteを追記した。

| Binding | 全upstream件数 | obligation件数 | replacement |
|---|---:|---:|---|
| SCF-B-0014 | 16 | 8 | pending |
| SCF-B-0016 | 21 | 9 | pending |
| SCF-B-0020 | 22 | 7 | pending |
| SCF-B-0024 | 16 | 7 | pending |
| SCF-B-0025 | 21 | 8 | pending |
| SCF-B-0028 | 13 | 7 | pending |
| SCF-B-0030 | 25 | 5 | pending |
| SCF-B-0031 | 19 | 7 | pending |
| SCF-B-0037 | 17 | 8 | pending |
| SCF-B-0039 | 17 | 8 | pending |
| SCF-B-0041 | 25 | 6 | pending |
| SCF-B-0042 | 18 | 6 | pending |
| SCF-B-0046 | 23 | 8 | pending |
| SCF-B-0054 | 22 | 8 | pending |
| SCF-B-0074 | 16 | 8 | pending |
| SCF-B-0095 | 36 | 6 | pending |
| SCF-B-0101 | 65 | 8 | pending |
| SCF-B-0102 | 63 | 6 | pending |
| SCF-B-0104 | 59 | 6 | pending |
| SCF-B-0105 | 72 | 5 | pending |
| SCF-B-0106 | 59 | 6 | pending |
| SCF-B-0109 | 66 | 6 | pending |
| SCF-B-0110 | 66 | 7 | pending |
| SCF-B-0111 | 68 | 7 | pending |
| SCF-B-0112 | 66 | 7 | pending |
| SCF-B-0113 | 66 | 8 | pending |
| SCF-B-0114 | 66 | 8 | pending |
| SCF-B-0115 | 66 | 8 | pending |
| SCF-B-0116 | 74 | 7 | pending |
| SCF-B-0119 | 74 | 7 | pending |
| SCF-B-0130 | 74 | 8 | pending |
| SCF-B-0131 | 74 | 8 | pending |
| SCF-B-0134 | 66 | 7 | pending |
| SCF-B-0147 | 19 | 4 | pending |

### 修正後本文SHA-256

| 文書 | SHA-256 |
|---|---|
| `docs/helix-os/L2-requirements/governance-requirements.md` | `5044b69109e5d6412cd49f9b0fef327ccc4d8bdabec3d27d0ac60c02364bd442` |
| `docs/helix-os/L11-acceptance/governance-acceptance.md` | `03101e583622e448df2bcee812a4b1ed7098eeeb39326b959c9953e37729edd2` |
| `docs/helix-harness/L2-requirements/product-requirements.md` | `840236515f2dd34d32db7c0974a811fc4d6399b0b8ef863b9f666f7a08badf30` |
| `docs/helix-harness/L11-acceptance/product-acceptance.md` | `24e8ae1adf67f025091abb61361bce5b26aec1c7af8f770dd8538910fa3fd7ba` |

## 独立再review後の訂正・追補（R2141-01〜07）

対象は独立review済みHEAD `6e18904e9d31e06729c5d92827723067019878c3` に対する[Claudeの所見](https://github.com/RetryYN/HELIX-HARNESS/pull/2141#issuecomment-5842004224)。上の監査・SHA・検証結果は同HEAD時点の記録として保ち、以下を追補する。

| 指摘 | 対応 |
|---|---|
| R2141-01 | PR区分を `requirement` へ訂正する。複数identityを一緒に扱う根拠は[9/24 PO判断](../../decisions/concept-requirement-po-decisions-2026-09-24.md)23–25行の、前段階処理の後に全要求をPO最適ドラフトPRで詰めるという指示。本PRはそのticket部分の一体の整理であり、34件を別identityとして確定・採択するものではない。 |
| R2141-02 | L2両文書の接続を「機構どうし、またはticket種類どうしをつなぐ連続処理」と明示した。[9/25 PO判断](../../decisions/po-optimal-draft-po-decisions-2026-09-25.md)115–119行は機構間を対象とするが、前回Major 1に従いticket種類間の一連の処理も本整理の接続に含める。単体は種類一組の定義、接続はその種類をまたぐ受け渡しとして区別するためであり、POの一般定義を変更するものではない。 |
| R2141-03 | 旧監査19行の相対リンクはOS L2からの逐語引用のため、監査の配置から解決するとリンク先がずれている。旧監査はbytesを保持する。参照先は[9/24 PO判断](../../decisions/concept-requirement-po-decisions-2026-09-24.md)である。 |
| R2141-04 | SCF-B-0024 upstream[13]とSCF-B-0095 upstream[25]の同一の「PR #2141再整理」追記を各1回にした。既存の別noteは保持した。 |
| R2141-05 | PHCAP-10/11の `base.worktree=/tmp/helix-redo-2141` は、このinventoryを実際に再生成した場所の由来metadataとして残す。generatorは実行場所を記録するため、mainの過去の生成場所に戻すと今回の生成場所を偽る。永続的な参照先・依存先としては使わず、ディレクトリ消失後もrepository rootで `python3 -B scaffold/phcap10-11-worker-ci-static/generate.py` により再生成できる。別worktreeでの再生成はこのmetadataの値だけが変わり得る。 |
| R2141-06 | 上の旧source表に記したexecution-ticket-requirements:349–351の「Benchから直接配車しない」の保持先は、main既存のOS L2のWorker節とhandoff判断の三段指定であり、今回の詳細IDの対象外である。下の訂正表で旧source表の行範囲を補い、HXT-FLOW-05の根拠と揃える。 |
| R2141-07 | HXT-SYS-01のL11反例に「開発方式をticketの種類にする」「突発と計画を分けない」を追加した。SYS-01はticket節の共通の全体条件もまとめており、OS内部の条件も含む。 |

### 旧source表の行範囲と保持先の訂正

| 旧source | 正しい対象行 | 対応先 |
|---|---|---|
| `archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md` | 65、68、69、118、120–121 | 65・121は要求還流、69・120はfinding振り分け。68・118の旧CI固定3段はHXT-FLOW-05の比較元で、9/26 V谷判断に従ってticketとの関係からのCI導出へ変えた。上の旧source表には68・118の記載が欠けていた。 |
| `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/execution-ticket-requirements.md` | 349–351 | 詳細ID外のmain既存のOS L2 Worker節・HELIXOS-L2-004／010と[handoff判断](../../decisions/handoff-integration-po-decisions-2026-09-26.md)のLABO水準→INTELLIGENCE案→OS指定。旧表の「保持」は文書全体の保持点であり、詳細IDへの新規収載ではない。 |

HXT-CORE-01の親をHARNESS-L2-003にも広げる所見については、今回は工程契約の保持（002）と意味導出コア（008）の既存の親を維持する。003の個別工程の適用条件を新たに整理する変更は行っていない。

### 再review指摘修正後の検証

34件のIDと親要求のL2／L11一致、接続定義、SYS-01反例、重複noteの解消、旧監査のbytes保持を確認した。研究用validatorは137件中105 pass／32 failで、6e18904e9と同じ集合。scfctlはstale=0、bindings=142 fail=0、residuals=0、cases=69 fail=0。git diff --check合格。参照本文・行範囲・意味fieldは不変で、文書SHAとcurrent counterpartのbytes、および依存bindingのreceiptを追随させた。

| 修正後の文書 | SHA-256 |
|---|---|
| `docs/helix-os/L2-requirements/governance-requirements.md` | `6532c37f816be7f8461e58f4ea0fdb470c5878fef3abf78916d7be4212145daf` |
| `docs/helix-os/L11-acceptance/governance-acceptance.md` | `adf377262c49facf5ba4897cbbe975c68834c71eeb71a00ec3a9ab197eb63004` |
| `docs/helix-harness/L2-requirements/product-requirements.md` | `3ef1c98a739d0ea1b887a8f151dc24f2132426764fae4267195e91238471faf9` |
| `docs/helix-harness/L11-acceptance/product-acceptance.md` | `24e8ae1adf67f025091abb61361bce5b26aec1c7af8f770dd8538910fa3fd7ba` |
