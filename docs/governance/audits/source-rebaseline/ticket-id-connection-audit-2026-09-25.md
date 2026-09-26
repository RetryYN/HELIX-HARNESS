# ticket節の要求ID・親要求・L11接続監査（2026-09-25）

status: draft_candidate / authority_effect: none。旧資産は参照のみで実行していない。対象L2／L11は未採否・未実行である。退役DTK 14件は比較資料であり、IDの分母にも復活案にも含めない。

## IDと旧source

origin/main起点：`78bfd42ed808ff17982ffabfe0ffac0c04c557de`。以下でいう「編集前」の本文SHA-256は、OS L2 `152fd45e3ac29867ef1b2c604f8400fcd8a6e965078a7cd663183a1177e113fe`、HARNESS L2 `1c5866127960956c7943218aa8571c8eb743fc98b28b7137c1816974f2b7aec4`、OS L11 `c467403b2e4c7b53f1e492427c1b10d962b20c2f89b3e815a9fafc1765d14a1d`、HARNESS L11 `11ff00b74f2b7e0286ed115ae35d62f34b9f65f72a19fb8b7265eda1b795e40b` である。

現行の主要求はOS L2表（編集前56–68行）とHARNESS L2表（編集前52–60行）の `HELIXOS-L2-NNN`／`HARNESS-L2-NNN`。詳細行はOS L2の `HXT-RQ-01..07`（編集前523–529行）、候補はWBS-OS-001..008（`docs/helix-os/candidates/wbs-ledger-requirements.md:54-66`）のように各条件を固有IDで示す。旧要求 `archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/pillar-requirements.md:29-39,48-58` はHBR／HNFR名前空間の衝突回避を明記し、旧IR `archive/legacy-generation-2026-09-14/root/requirements-ir/requirements.json:1` の `HIL-BR-01` は `requirement_id` と対の `acceptance_ids` を分ける。したがって現行L2と同じID形式の未使用連番を使い、親主要求と対L11行を別列で結んだ。新しいprefixやID体系は設けていない。旧IRのID採用・authority継承はしない。

旧workflow分類索引 `archive/legacy-generation-2026-09-14/root/docs/process/modes/README.md:29-49,55-80`（LEGACY-ASSET-BF02D9AB7313C42D8FED）、旧HARNESS v1.3 `archive/legacy-generation-2026-09-14/root/docs/governance/helix-harness-requirements_v1.3.md:69-85,94-102`（LEGACY-ASSET-02319C2481B9E01698D5）、旧IR（LEGACY-ASSET-A60CF91DD2AF6693E6F9）を照合した。旧索引のDiscovery/PoC、S4、Research/ADRは2026-09-24 PO判断 (`docs/governance/decisions/concept-requirement-po-decisions-2026-09-24.md:78-95`) で現行の別ticket／独立DECIDE／参考ソースのみへ変わった。保持点はworkflow種別と必要な戻り線、変更点はこの三つの境界とForwardの開発方式横断、理由は同判断記録である。旧索引の同一語を現行の種類・発行・合流の自動authorityにしない。

## 準備記録30行の対応

`po-optimal-draft-preparation-items-2026-09-25.jsonl` の `G4-TICKET-LINE-001..010,012,014..032` が30行。各行を原行のまま参照し、分割した条件は同じ原行から複数IDへ接続した。ほかの7行（011、013、033–037）は出典・表見出し・旧差分説明なので要求IDの分母外にし、下表にも理由を示す。

| 準備記録ID | 原行 | 元文（準備記録の逐語） | 対応する新文の条件ID／付けない理由 |
|---|---:|---|---|
| G4-TICKET-LINE-001 | 104 | 2026-09-24のPO判断（[decision record](../../governance/decisions/concept-requirement-po-decisions-2026-09-24.md)）による。本節は要求案であり、PO最適ドラフトPRで要求IDを付けて詰める。 | PO原文・旧差分・出典・表見出しの記録であり、独立した条件ではない |
| G4-TICKET-LINE-002 | 106 | ticketは、HELIX-OSの推進が発行する作業の単位である。旧HELIXではPLANに責務が集中していた。ticketはその責務を薄くし、作業ticketとして発行する。 | HELIXOS-L2-014 |
| G4-TICKET-LINE-003 | 107 | PO「駆動モデルに即したチケットが発行される仕組みで、フォワードは大、中、小のようにしたら複数人が作業してもできる。トラブルや局所的なものが発生したらリカバリーやインシデント、PoCみたいなのができて、それがイシューやPRに登録される仕組み」。 | PO原文・旧差分・出典・表見出しの記録であり、独立した条件ではない |
| G4-TICKET-LINE-004 | 109 | - 駆動モデルはticketの種類で置き換える。各ticketは、駆動モデルに由来する進め方を、動的ワークフローとして中に持つ。 | HELIXOS-L2-015、HELIXOS-L2-016 |
| G4-TICKET-LINE-005 | 110 | - Scrum等は開発方式（枠）であり、ticketの種類ではない。 | HELIXOS-L2-017 |
| G4-TICKET-LINE-006 | 111 | - HARNESSは導出のためのコア（HELIX-JSONの定義とPythonの意味導出コア）を持つ。BRAINはそこから判断し、推進はticketを導いて発行する。 | HELIXOS-L2-018、HELIXOS-L2-019、HELIXOS-L2-100 |
| G4-TICKET-LINE-007 | 112 | - ticketは、種類、対象（単体／接続／構成体）、親の要求と版、変更の範囲を持つ。検収は、そこから必要な検証を導き、CIを動的に組み立てる。 | HELIXOS-L2-020、HELIXOS-L2-021 |
| G4-TICKET-LINE-008 | 113 | - ticketが正で、GitHub IssueとPRは映しである。Issueのcloseやmergeで、ticketは完了にならない。 | HELIXOS-L2-022、HELIXOS-L2-023 |
| G4-TICKET-LINE-009 | 114 | - ticketは計画から導いて発行する。トラブル系は、範囲と起きたことを入れると、種類・対象・親の要求が導かれて発行される。範囲が分からないときは、先にDiscoveryで明らかにする。 | HELIXOS-L2-024、HELIXOS-L2-025、HELIXOS-L2-026 |
| G4-TICKET-LINE-010 | 115 | - 突発的に発生するものと、計画的に発行できるものを分ける。 | HELIXOS-L2-027 |
| G4-TICKET-LINE-011 | 119 | 旧HELIXの確定版（`archive/legacy-generation-2026-09-14/root/docs/process/modes/README.md:29-47`）を起点に、PO判断を加えた。 | PO原文・旧差分・出典・表見出しの記録であり、独立した条件ではない |
| G4-TICKET-LINE-012 | 121 | Forwardは本流である。開発方式がVモデル・Scrum・Hybridのどれであっても、その方式の規定の路線を走るticketをForwardとする。ほかのticketは、最後にForwardへ合流する。 | HELIXOS-L2-028、HELIXOS-L2-029、HELIXOS-L2-030 |
| G4-TICKET-LINE-013 | 123 | 種類 &#124; 何のticketか &#124; 発行 &#124; 合流先 | PO原文・旧差分・出典・表見出しの記録であり、独立した条件ではない |
| G4-TICKET-LINE-014 | 125 | Forward 大 &#124; 構成体（システム全体）を、開発方式の規定路線で要求から受入まで通す &#124; 計画 &#124; 本流 | HELIXOS-L2-031、HELIXOS-L2-032、HELIXOS-L2-033 |
| G4-TICKET-LINE-015 | 126 | Forward 中 &#124; 接続（機能と機能のつなぎ）を、開発方式の規定路線で作る &#124; 計画 &#124; Forward 大 | HELIXOS-L2-034、HELIXOS-L2-035、HELIXOS-L2-036 |
| G4-TICKET-LINE-016 | 127 | Forward 小 &#124; 単体の機能を、開発方式の規定路線で作る &#124; 計画 &#124; Forward 中／大 | HELIXOS-L2-037、HELIXOS-L2-038、HELIXOS-L2-039 |
| G4-TICKET-LINE-017 | 128 | Discovery &#124; 開発の途中で検証が必要になったとき、または範囲が分からないときに確かめる &#124; 突発 &#124; 発行元のticket | HELIXOS-L2-040、HELIXOS-L2-041、HELIXOS-L2-042 |
| G4-TICKET-LINE-018 | 129 | PoC &#124; 技術的に成り立つかを確かめる。画面の有無に関係なく、成立性が不明なときに発行する。本番実装にはしない &#124; 計画（L2.5） &#124; Backflow→要求エンジンの2次形成→DECIDE | HELIXOS-L2-043、HELIXOS-L2-044、HELIXOS-L2-045、HELIXOS-L2-046、HELIXOS-L2-047 |
| G4-TICKET-LINE-019 | 130 | Prototype &#124; 画面の操作と使う人の反応を確かめる。画面のない対象では発行しない &#124; 計画（L2.5） &#124; Backflow→要求エンジンの2次形成→DECIDE | HELIXOS-L2-048、HELIXOS-L2-049、HELIXOS-L2-050、HELIXOS-L2-051 |
| G4-TICKET-LINE-020 | 131 | DECIDE &#124; 裁定。要求の確認や技術の選定をPR化して決める &#124; 計画 &#124; 採用→Forward、不採用→記録して終了、方針変更→次の計画 | HELIXOS-L2-052、HELIXOS-L2-053、HELIXOS-L2-054、HELIXOS-L2-055、HELIXOS-L2-056、HELIXOS-L2-057 |
| G4-TICKET-LINE-021 | 132 | Backflow &#124; 下流の結果（PoC・Prototypeの結果、要求の入力不足、下流で分かったこと）を要求へ戻す &#124; PoC・Prototypeの後は計画、それ以外は突発 &#124; 要求エンジン（L2） | HELIXOS-L2-058、HELIXOS-L2-059、HELIXOS-L2-060、HELIXOS-L2-061 |
| G4-TICKET-LINE-022 | 133 | Reverse &#124; 実装の事実から設計へ戻す。Scrum Reverseを含む &#124; 突発（設計と実装のずれ、同種finding再発、性能退行、障害等）と計画（Scrum Reverseのcheckpoint：sprint review前、release candidate合流前、public contract・DB schema・主要dependency・NFR budgetの変更時。旧`helix-harness-requirements_v1.3.md:94-102`） &#124; Forwardの該当層 | HELIXOS-L2-062、HELIXOS-L2-063、HELIXOS-L2-064、HELIXOS-L2-065、HELIXOS-L2-066 |
| G4-TICKET-LINE-023 | 134 | Recovery &#124; AIの逸脱・暴走・context切れから正常な地点へ戻す &#124; 突発 &#124; 中断していた工程 | HELIXOS-L2-067、HELIXOS-L2-068、HELIXOS-L2-069 |
| G4-TICKET-LINE-024 | 135 | Incident &#124; 本番障害に緊急対応する &#124; 突発 &#124; 運用評価（L12）。恒久対策はReverse経由 | HELIXOS-L2-070、HELIXOS-L2-071、HELIXOS-L2-072、HELIXOS-L2-073 |
| G4-TICKET-LINE-025 | 136 | Refactor &#124; 振る舞いを変えずにコードの構造を直す &#124; 計画（範囲を入れれば事象からも発行可） &#124; Forward 小 | HELIXOS-L2-074、HELIXOS-L2-075、HELIXOS-L2-076 |
| G4-TICKET-LINE-026 | 137 | Design-refactor &#124; 外部の振る舞いを保って設計の構造を直す &#124; 計画（範囲を入れれば事象からも発行可） &#124; Forward | HELIXOS-L2-077、HELIXOS-L2-078、HELIXOS-L2-079 |
| G4-TICKET-LINE-027 | 138 | Performance-refactor &#124; 設計を保って性能を上げる。測れない高速化は不可 &#124; 計画（範囲を入れれば事象からも発行可） &#124; Forward | HELIXOS-L2-080、HELIXOS-L2-081、HELIXOS-L2-082、HELIXOS-L2-083 |
| G4-TICKET-LINE-028 | 139 | Redesign &#124; 外部の約束・要求・受入条件を変えて設計をやり直す &#124; 計画 &#124; Forward（要求が変わるときはDECIDEを経る） | HELIXOS-L2-084、HELIXOS-L2-085、HELIXOS-L2-086 |
| G4-TICKET-LINE-029 | 140 | Retrofit &#124; 依存・基盤・構成の更新に合わせて段階的に移行する &#124; 計画（範囲を入れれば事象からも発行可） &#124; Forwardの該当層 | HELIXOS-L2-087、HELIXOS-L2-088、HELIXOS-L2-089 |
| G4-TICKET-LINE-030 | 141 | Research &#124; 選定や比較のための参考ソースを集める。決定には関わらない &#124; 計画 &#124; 依頼元 | HELIXOS-L2-090、HELIXOS-L2-091、HELIXOS-L2-092、HELIXOS-L2-093 |
| G4-TICKET-LINE-031 | 142 | Add-feature &#124; 既存のものに機能を差分で追加する &#124; 計画 &#124; Forwardの該当層 | HELIXOS-L2-094、HELIXOS-L2-095、HELIXOS-L2-096 |
| G4-TICKET-LINE-032 | 143 | Version-up &#124; 後の版へ回した項目を保全し、時期が来たら取り込む &#124; 計画 &#124; 取り込み時にDECIDE→Add-feature | HELIXOS-L2-097、HELIXOS-L2-098、HELIXOS-L2-099 |
| G4-TICKET-LINE-033 | 145 | 旧定義との違いは次の4点である。 | PO原文・旧差分・出典・表見出しの記録であり、独立した条件ではない |
| G4-TICKET-LINE-034 | 146 | - DiscoveryとPoCは、旧HELIXでは1つだった（PoCはS2）。PO判断で分けた。 | PO原文・旧差分・出典・表見出しの記録であり、独立した条件ではない |
| G4-TICKET-LINE-035 | 147 | - 旧S4 decideはDiscovery専用だった。DECIDEとして独立させた。 | PO原文・旧差分・出典・表見出しの記録であり、独立した条件ではない |
| G4-TICKET-LINE-036 | 148 | - 旧Researchは決定（ADR）まで含んでいた。PO判断で決定を外した。 | PO原文・旧差分・出典・表見出しの記録であり、独立した条件ではない |
| G4-TICKET-LINE-037 | 149 | - Redesign・Design-refactor・Performance-refactorは、旧HELIXに手順書がない。旧要件の記述だけを起点にした。 | PO原文・旧差分・出典・表見出しの記録であり、独立した条件ではない |

HARNESS側の準備記録 `G4-L2-DETAIL-HARNESS-071..075` は本監査のHARNESS IDへ原行ごとに接続する。

| 原行 | HARNESS条件ID |
|---:|---|
| 71 | HARNESS-L2-010 |
| 72 | 参照のみ |
| 73 | HARNESS-L2-011、HARNESS-L2-012 |
| 74 | HARNESS-L2-013、HARNESS-L2-016、HARNESS-L2-017、HARNESS-L2-014 |
| 75 | HARNESS-L2-015 |

## 全条件の親・旧source・対L11

各行の成功条件と反例は同じIDのL11行にある。原文の意味を分割した行は下表の「条件」を新文とし、上記準備記録の `current_text` を元文として対照する。

| 条件ID | 親主要求 | 原行 | 分割後の条件 | 旧source・判断行 |
|---|---|---:|---|---|
| HELIXOS-L2-014 | HELIXOS-L2-010 | 106 | ticketは、HELIX-OSの推進が発行する作業の単位である。 | docs/governance/decisions/concept-requirement-po-decisions-2026-09-24.md:78-95; archive/legacy-generation-2026-09-14/root/docs/process/modes/README.md:64-71 |
| HELIXOS-L2-015 | HELIXOS-L2-010 | 109 | 駆動モデルはticketの種類で置き換える。 | docs/governance/decisions/concept-requirement-po-decisions-2026-09-24.md:78-95; archive/legacy-generation-2026-09-14/root/docs/process/modes/README.md:30-49 |
| HELIXOS-L2-016 | HELIXOS-L2-010 | 109 | 各ticketは、駆動モデルに由来する進め方を、動的ワークフローとして中に持つ。 | docs/governance/decisions/concept-requirement-po-decisions-2026-09-24.md:78-95; archive/legacy-generation-2026-09-14/root/docs/process/modes/README.md:64-80 |
| HELIXOS-L2-017 | HELIXOS-L2-010 | 110 | Scrum等は開発方式（枠）であり、ticketの種類ではない。 | docs/governance/decisions/concept-requirement-po-decisions-2026-09-24.md:78-95; archive/legacy-generation-2026-09-14/root/docs/process/modes/README.md:30-49 |
| HELIXOS-L2-018 | HELIXOS-L2-010 | 111 | HARNESSは導出のためのコア（HELIX-JSONの定義とPythonの意味導出コア）を持つ。 | docs/governance/decisions/concept-requirement-po-decisions-2026-09-24.md:78-95; archive/legacy-generation-2026-09-14/root/docs/process/modes/README.md:64-67 |
| HELIXOS-L2-019 | HELIXOS-L2-010 | 111 | BRAINはそこから判断する。 | docs/governance/decisions/concept-requirement-po-decisions-2026-09-24.md:78-95; archive/legacy-generation-2026-09-14/root/docs/process/modes/README.md:64-71 |
| HELIXOS-L2-020 | HELIXOS-L2-010 | 112 | ticketは、種類、対象（単体／接続／構成体）、親の要求と版、変更の範囲を持つ。 | docs/governance/decisions/concept-requirement-po-decisions-2026-09-24.md:78-95; archive/legacy-generation-2026-09-14/root/docs/process/modes/README.md:64-71 |
| HELIXOS-L2-021 | HELIXOS-L2-011 | 112 | 検収は、そこから必要な検証を導き、CIを動的に組み立てる。 | docs/governance/decisions/concept-requirement-po-decisions-2026-09-24.md:78-95; archive/legacy-generation-2026-09-14/root/docs/process/modes/README.md:64-71 |
| HELIXOS-L2-022 | HELIXOS-L2-002 | 113 | ticketが正で、GitHub IssueとPRは映しである。 | docs/governance/decisions/concept-requirement-po-decisions-2026-09-24.md:78-95; archive/legacy-generation-2026-09-14/root/docs/process/modes/README.md:69-71 |
| HELIXOS-L2-023 | HELIXOS-L2-002 | 113 | Issueのcloseやmergeで、ticketは完了にならない。 | docs/governance/decisions/concept-requirement-po-decisions-2026-09-24.md:78-95; archive/legacy-generation-2026-09-14/root/docs/process/modes/README.md:69-71 |
| HELIXOS-L2-024 | HELIXOS-L2-010 | 114 | ticketは計画から導いて発行する。 | docs/governance/decisions/concept-requirement-po-decisions-2026-09-24.md:78-95; archive/legacy-generation-2026-09-14/root/docs/process/modes/README.md:64-67 |
| HELIXOS-L2-025 | HELIXOS-L2-010 | 114 | トラブル系は、範囲と起きたことを入れると、種類・対象・親の要求が導かれて発行される。 | docs/governance/decisions/concept-requirement-po-decisions-2026-09-24.md:78-95; archive/legacy-generation-2026-09-14/root/docs/process/modes/README.md:64-67 |
| HELIXOS-L2-026 | HELIXOS-L2-010 | 114 | 範囲が分からないときは、先にDiscoveryで明らかにする。 | docs/governance/decisions/concept-requirement-po-decisions-2026-09-24.md:78-95; archive/legacy-generation-2026-09-14/root/docs/process/modes/README.md:64-67 |
| HELIXOS-L2-027 | HELIXOS-L2-010 | 115 | 突発的に発生するものと、計画的に発行できるものを分ける。 | docs/governance/decisions/concept-requirement-po-decisions-2026-09-24.md:78-95; archive/legacy-generation-2026-09-14/root/docs/process/modes/README.md:64-67 |
| HELIXOS-L2-028 | HELIXOS-L2-010 | 121 | Forwardは本流である。 | docs/governance/decisions/concept-requirement-po-decisions-2026-09-24.md:78-95; archive/legacy-generation-2026-09-14/root/docs/process/modes/README.md:73-80 |
| HELIXOS-L2-029 | HELIXOS-L2-010 | 121 | 開発方式がVモデル・Scrum・Hybridのどれであっても、その方式の規定の路線を走るticketをForwardとする。 | docs/governance/decisions/concept-requirement-po-decisions-2026-09-24.md:78-95; archive/legacy-generation-2026-09-14/root/docs/process/modes/README.md:30-36 |
| HELIXOS-L2-030 | HELIXOS-L2-010 | 121 | ほかのticketは、最後にForwardへ合流する。 | docs/governance/decisions/concept-requirement-po-decisions-2026-09-24.md:78-95; archive/legacy-generation-2026-09-14/root/docs/process/modes/README.md:73-80 |
| HELIXOS-L2-031 | HELIXOS-L2-010 | 125 | Forward 大／内容：構成体（システム全体）を、開発方式の規定路線で要求から受入まで通す | archive/legacy-generation-2026-09-14/root/docs/process/modes/README.md:34-36; docs/governance/decisions/concept-requirement-po-decisions-2026-09-24.md:78-95 |
| HELIXOS-L2-032 | HELIXOS-L2-010 | 125 | Forward 大／発行：計画 | archive/legacy-generation-2026-09-14/root/docs/process/modes/README.md:34-36; docs/governance/decisions/concept-requirement-po-decisions-2026-09-24.md:78-95 |
| HELIXOS-L2-033 | HELIXOS-L2-010 | 125 | Forward 大／合流先：本流 | archive/legacy-generation-2026-09-14/root/docs/process/modes/README.md:34-36; docs/governance/decisions/concept-requirement-po-decisions-2026-09-24.md:78-95 |
| HELIXOS-L2-034 | HELIXOS-L2-010 | 126 | Forward 中／内容：接続（機能と機能のつなぎ）を、開発方式の規定路線で作る | archive/legacy-generation-2026-09-14/root/docs/process/modes/README.md:34-36; docs/governance/decisions/concept-requirement-po-decisions-2026-09-24.md:78-95 |
| HELIXOS-L2-035 | HELIXOS-L2-010 | 126 | Forward 中／発行：計画 | archive/legacy-generation-2026-09-14/root/docs/process/modes/README.md:34-36; docs/governance/decisions/concept-requirement-po-decisions-2026-09-24.md:78-95 |
| HELIXOS-L2-036 | HELIXOS-L2-010 | 126 | Forward 中／合流先：Forward 大 | archive/legacy-generation-2026-09-14/root/docs/process/modes/README.md:34-36; docs/governance/decisions/concept-requirement-po-decisions-2026-09-24.md:78-95 |
| HELIXOS-L2-037 | HELIXOS-L2-010 | 127 | Forward 小／内容：単体の機能を、開発方式の規定路線で作る | archive/legacy-generation-2026-09-14/root/docs/process/modes/README.md:34-36; docs/governance/decisions/concept-requirement-po-decisions-2026-09-24.md:78-95 |
| HELIXOS-L2-038 | HELIXOS-L2-010 | 127 | Forward 小／発行：計画 | archive/legacy-generation-2026-09-14/root/docs/process/modes/README.md:34-36; docs/governance/decisions/concept-requirement-po-decisions-2026-09-24.md:78-95 |
| HELIXOS-L2-039 | HELIXOS-L2-010 | 127 | Forward 小／合流先：Forward 中／大 | archive/legacy-generation-2026-09-14/root/docs/process/modes/README.md:34-36; docs/governance/decisions/concept-requirement-po-decisions-2026-09-24.md:78-95 |
| HELIXOS-L2-040 | HELIXOS-L2-010 | 128 | Discovery／内容：開発の途中で検証が必要になったとき、または範囲が分からないときに確かめる | archive/legacy-generation-2026-09-14/root/docs/process/modes/README.md:37,57-61; docs/governance/decisions/concept-requirement-po-decisions-2026-09-24.md:78-95 |
| HELIXOS-L2-041 | HELIXOS-L2-010 | 128 | Discovery／発行：突発 | archive/legacy-generation-2026-09-14/root/docs/process/modes/README.md:37,57-61; docs/governance/decisions/concept-requirement-po-decisions-2026-09-24.md:78-95 |
| HELIXOS-L2-042 | HELIXOS-L2-010 | 128 | Discovery／合流先：発行元のticket | archive/legacy-generation-2026-09-14/root/docs/process/modes/README.md:37,57-61; docs/governance/decisions/concept-requirement-po-decisions-2026-09-24.md:78-95 |
| HELIXOS-L2-043 | HELIXOS-L2-010 | 129 | PoC／内容：技術的に成り立つかを確かめる。 | archive/legacy-generation-2026-09-14/root/docs/process/modes/README.md:37,57-61; docs/governance/decisions/concept-requirement-po-decisions-2026-09-24.md:78-95 |
| HELIXOS-L2-044 | HELIXOS-L2-010 | 129 | PoC／内容：画面の有無に関係なく、成立性が不明なときに発行する。 | archive/legacy-generation-2026-09-14/root/docs/process/modes/README.md:37,57-61; docs/governance/decisions/concept-requirement-po-decisions-2026-09-24.md:78-95 |
| HELIXOS-L2-045 | HELIXOS-L2-010 | 129 | PoC／内容：本番実装にはしない。 | archive/legacy-generation-2026-09-14/root/docs/process/modes/README.md:37,57-61; docs/governance/decisions/concept-requirement-po-decisions-2026-09-24.md:78-95 |
| HELIXOS-L2-046 | HELIXOS-L2-010 | 129 | PoC／発行：計画（L2.5） | archive/legacy-generation-2026-09-14/root/docs/process/modes/README.md:37,57-61; docs/governance/decisions/concept-requirement-po-decisions-2026-09-24.md:78-95 |
| HELIXOS-L2-047 | HELIXOS-L2-010 | 129 | PoC／合流先：Backflow→要求エンジンの2次形成→DECIDE | archive/legacy-generation-2026-09-14/root/docs/process/modes/README.md:37,57-61; docs/governance/decisions/concept-requirement-po-decisions-2026-09-24.md:78-95 |
| HELIXOS-L2-048 | HELIXOS-L2-010 | 130 | Prototype／内容：画面の操作と使う人の反応を確かめる。 | archive/legacy-generation-2026-09-14/root/docs/process/modes/README.md:37,57-61; docs/governance/decisions/concept-requirement-po-decisions-2026-09-24.md:78-95 |
| HELIXOS-L2-049 | HELIXOS-L2-010 | 130 | Prototype／内容：画面のない対象では発行しない。 | archive/legacy-generation-2026-09-14/root/docs/process/modes/README.md:37,57-61; docs/governance/decisions/concept-requirement-po-decisions-2026-09-24.md:78-95 |
| HELIXOS-L2-050 | HELIXOS-L2-010 | 130 | Prototype／発行：計画（L2.5） | archive/legacy-generation-2026-09-14/root/docs/process/modes/README.md:37,57-61; docs/governance/decisions/concept-requirement-po-decisions-2026-09-24.md:78-95 |
| HELIXOS-L2-051 | HELIXOS-L2-010 | 130 | Prototype／合流先：Backflow→要求エンジンの2次形成→DECIDE | archive/legacy-generation-2026-09-14/root/docs/process/modes/README.md:37,57-61; docs/governance/decisions/concept-requirement-po-decisions-2026-09-24.md:78-95 |
| HELIXOS-L2-052 | HELIXOS-L2-010 | 131 | DECIDE／内容：裁定。 | archive/legacy-generation-2026-09-14/root/docs/process/modes/README.md:57-61; docs/governance/decisions/concept-requirement-po-decisions-2026-09-24.md:78-95 |
| HELIXOS-L2-053 | HELIXOS-L2-010 | 131 | DECIDE／内容：要求の確認や技術の選定をPR化して決める。 | archive/legacy-generation-2026-09-14/root/docs/process/modes/README.md:57-61; docs/governance/decisions/concept-requirement-po-decisions-2026-09-24.md:78-95 |
| HELIXOS-L2-054 | HELIXOS-L2-010 | 131 | DECIDE／発行：計画 | archive/legacy-generation-2026-09-14/root/docs/process/modes/README.md:57-61; docs/governance/decisions/concept-requirement-po-decisions-2026-09-24.md:78-95 |
| HELIXOS-L2-055 | HELIXOS-L2-010 | 131 | DECIDE／合流先：採用→Forward | archive/legacy-generation-2026-09-14/root/docs/process/modes/README.md:57-61; docs/governance/decisions/concept-requirement-po-decisions-2026-09-24.md:78-95 |
| HELIXOS-L2-056 | HELIXOS-L2-010 | 131 | DECIDE／合流先：不採用→記録して終了 | archive/legacy-generation-2026-09-14/root/docs/process/modes/README.md:57-61; docs/governance/decisions/concept-requirement-po-decisions-2026-09-24.md:78-95 |
| HELIXOS-L2-057 | HELIXOS-L2-010 | 131 | DECIDE／合流先：方針変更→次の計画 | archive/legacy-generation-2026-09-14/root/docs/process/modes/README.md:57-61; docs/governance/decisions/concept-requirement-po-decisions-2026-09-24.md:78-95 |
| HELIXOS-L2-058 | HELIXOS-L2-010 | 132 | Backflow／内容：下流の結果（PoC・Prototypeの結果、要求の入力不足、下流で分かったこと）を要求へ戻す | archive/legacy-generation-2026-09-14/root/docs/process/modes/README.md:73-80; docs/governance/decisions/concept-requirement-po-decisions-2026-09-24.md:78-95 |
| HELIXOS-L2-059 | HELIXOS-L2-010 | 132 | Backflow／発行：PoC・Prototypeの後は計画 | archive/legacy-generation-2026-09-14/root/docs/process/modes/README.md:73-80; docs/governance/decisions/concept-requirement-po-decisions-2026-09-24.md:78-95 |
| HELIXOS-L2-060 | HELIXOS-L2-010 | 132 | Backflow／発行：それ以外は突発 | archive/legacy-generation-2026-09-14/root/docs/process/modes/README.md:73-80; docs/governance/decisions/concept-requirement-po-decisions-2026-09-24.md:78-95 |
| HELIXOS-L2-061 | HELIXOS-L2-010 | 132 | Backflow／合流先：要求エンジン（L2） | archive/legacy-generation-2026-09-14/root/docs/process/modes/README.md:73-80; docs/governance/decisions/concept-requirement-po-decisions-2026-09-24.md:78-95 |
| HELIXOS-L2-062 | HELIXOS-L2-010 | 133 | Reverse／内容：実装の事実から設計へ戻す。 | archive/legacy-generation-2026-09-14/root/docs/process/modes/README.md:38,73-80; docs/governance/decisions/concept-requirement-po-decisions-2026-09-24.md:78-95 |
| HELIXOS-L2-063 | HELIXOS-L2-010 | 133 | Reverse／内容：Scrum Reverseを含む。 | archive/legacy-generation-2026-09-14/root/docs/process/modes/README.md:38,73-80; docs/governance/decisions/concept-requirement-po-decisions-2026-09-24.md:78-95 |
| HELIXOS-L2-064 | HELIXOS-L2-010 | 133 | Reverse／発行：突発（設計と実装のずれ、同種finding再発、性能退行、障害等） | archive/legacy-generation-2026-09-14/root/docs/process/modes/README.md:38,73-80; docs/governance/decisions/concept-requirement-po-decisions-2026-09-24.md:78-95 |
| HELIXOS-L2-065 | HELIXOS-L2-010 | 133 | Reverse／発行：計画（Scrum Reverseのcheckpoint：sprint review前、release candidate合流前、public contract・DB schema・主要dependency・NFR budgetの変更時。旧`helix-harness-requirements_v1.3.md:94-102`） | archive/legacy-generation-2026-09-14/root/docs/process/modes/README.md:38,73-80; docs/governance/decisions/concept-requirement-po-decisions-2026-09-24.md:78-95 |
| HELIXOS-L2-066 | HELIXOS-L2-010 | 133 | Reverse／合流先：Forwardの該当層 | archive/legacy-generation-2026-09-14/root/docs/process/modes/README.md:38,73-80; docs/governance/decisions/concept-requirement-po-decisions-2026-09-24.md:78-95 |
| HELIXOS-L2-067 | HELIXOS-L2-009 | 134 | Recovery／内容：AIの逸脱・暴走・context切れから正常な地点へ戻す | archive/legacy-generation-2026-09-14/root/docs/process/modes/README.md:39; docs/governance/decisions/concept-requirement-po-decisions-2026-09-24.md:78-95 |
| HELIXOS-L2-068 | HELIXOS-L2-009 | 134 | Recovery／発行：突発 | archive/legacy-generation-2026-09-14/root/docs/process/modes/README.md:39; docs/governance/decisions/concept-requirement-po-decisions-2026-09-24.md:78-95 |
| HELIXOS-L2-069 | HELIXOS-L2-009 | 134 | Recovery／合流先：中断していた工程 | archive/legacy-generation-2026-09-14/root/docs/process/modes/README.md:39; docs/governance/decisions/concept-requirement-po-decisions-2026-09-24.md:78-95 |
| HELIXOS-L2-070 | HELIXOS-L2-010 | 135 | Incident／内容：本番障害に緊急対応する | archive/legacy-generation-2026-09-14/root/docs/process/modes/README.md:40; docs/governance/decisions/concept-requirement-po-decisions-2026-09-24.md:78-95 |
| HELIXOS-L2-071 | HELIXOS-L2-010 | 135 | Incident／発行：突発 | archive/legacy-generation-2026-09-14/root/docs/process/modes/README.md:40; docs/governance/decisions/concept-requirement-po-decisions-2026-09-24.md:78-95 |
| HELIXOS-L2-072 | HELIXOS-L2-010 | 135 | Incident／合流先：運用評価（L12） | archive/legacy-generation-2026-09-14/root/docs/process/modes/README.md:40; docs/governance/decisions/concept-requirement-po-decisions-2026-09-24.md:78-95 |
| HELIXOS-L2-073 | HELIXOS-L2-010 | 135 | Incident／合流先：恒久対策はReverse経由 | archive/legacy-generation-2026-09-14/root/docs/process/modes/README.md:40; docs/governance/decisions/concept-requirement-po-decisions-2026-09-24.md:78-95 |
| HELIXOS-L2-074 | HELIXOS-L2-010 | 136 | Refactor／内容：振る舞いを変えずにコードの構造を直す | archive/legacy-generation-2026-09-14/root/docs/process/modes/README.md:41; docs/governance/decisions/concept-requirement-po-decisions-2026-09-24.md:78-95 |
| HELIXOS-L2-075 | HELIXOS-L2-010 | 136 | Refactor／発行：計画（範囲を入れれば事象からも発行可） | archive/legacy-generation-2026-09-14/root/docs/process/modes/README.md:41; docs/governance/decisions/concept-requirement-po-decisions-2026-09-24.md:78-95 |
| HELIXOS-L2-076 | HELIXOS-L2-010 | 136 | Refactor／合流先：Forward 小 | archive/legacy-generation-2026-09-14/root/docs/process/modes/README.md:41; docs/governance/decisions/concept-requirement-po-decisions-2026-09-24.md:78-95 |
| HELIXOS-L2-077 | HELIXOS-L2-010 | 137 | Design-refactor／内容：外部の振る舞いを保って設計の構造を直す | archive/legacy-generation-2026-09-14/root/docs/process/modes/README.md:47; docs/governance/decisions/concept-requirement-po-decisions-2026-09-24.md:78-95 |
| HELIXOS-L2-078 | HELIXOS-L2-010 | 137 | Design-refactor／発行：計画（範囲を入れれば事象からも発行可） | archive/legacy-generation-2026-09-14/root/docs/process/modes/README.md:47; docs/governance/decisions/concept-requirement-po-decisions-2026-09-24.md:78-95 |
| HELIXOS-L2-079 | HELIXOS-L2-010 | 137 | Design-refactor／合流先：Forward | archive/legacy-generation-2026-09-14/root/docs/process/modes/README.md:47; docs/governance/decisions/concept-requirement-po-decisions-2026-09-24.md:78-95 |
| HELIXOS-L2-080 | HELIXOS-L2-010 | 138 | Performance-refactor／内容：設計を保って性能を上げる。 | archive/legacy-generation-2026-09-14/root/docs/process/modes/README.md:48; docs/governance/decisions/concept-requirement-po-decisions-2026-09-24.md:78-95 |
| HELIXOS-L2-081 | HELIXOS-L2-010 | 138 | Performance-refactor／内容：測れない高速化は不可。 | archive/legacy-generation-2026-09-14/root/docs/process/modes/README.md:48; docs/governance/decisions/concept-requirement-po-decisions-2026-09-24.md:78-95 |
| HELIXOS-L2-082 | HELIXOS-L2-010 | 138 | Performance-refactor／発行：計画（範囲を入れれば事象からも発行可） | archive/legacy-generation-2026-09-14/root/docs/process/modes/README.md:48; docs/governance/decisions/concept-requirement-po-decisions-2026-09-24.md:78-95 |
| HELIXOS-L2-083 | HELIXOS-L2-010 | 138 | Performance-refactor／合流先：Forward | archive/legacy-generation-2026-09-14/root/docs/process/modes/README.md:48; docs/governance/decisions/concept-requirement-po-decisions-2026-09-24.md:78-95 |
| HELIXOS-L2-084 | HELIXOS-L2-010 | 139 | Redesign／内容：外部の約束・要求・受入条件を変えて設計をやり直す | archive/legacy-generation-2026-09-14/root/docs/process/modes/README.md:46; docs/governance/decisions/concept-requirement-po-decisions-2026-09-24.md:78-95 |
| HELIXOS-L2-085 | HELIXOS-L2-010 | 139 | Redesign／発行：計画 | archive/legacy-generation-2026-09-14/root/docs/process/modes/README.md:46; docs/governance/decisions/concept-requirement-po-decisions-2026-09-24.md:78-95 |
| HELIXOS-L2-086 | HELIXOS-L2-010 | 139 | Redesign／合流先：Forward（要求が変わるときはDECIDEを経る） | archive/legacy-generation-2026-09-14/root/docs/process/modes/README.md:46; docs/governance/decisions/concept-requirement-po-decisions-2026-09-24.md:78-95 |
| HELIXOS-L2-087 | HELIXOS-L2-010 | 140 | Retrofit／内容：依存・基盤・構成の更新に合わせて段階的に移行する | archive/legacy-generation-2026-09-14/root/docs/process/modes/README.md:42; docs/governance/decisions/concept-requirement-po-decisions-2026-09-24.md:78-95 |
| HELIXOS-L2-088 | HELIXOS-L2-010 | 140 | Retrofit／発行：計画（範囲を入れれば事象からも発行可） | archive/legacy-generation-2026-09-14/root/docs/process/modes/README.md:42; docs/governance/decisions/concept-requirement-po-decisions-2026-09-24.md:78-95 |
| HELIXOS-L2-089 | HELIXOS-L2-010 | 140 | Retrofit／合流先：Forwardの該当層 | archive/legacy-generation-2026-09-14/root/docs/process/modes/README.md:42; docs/governance/decisions/concept-requirement-po-decisions-2026-09-24.md:78-95 |
| HELIXOS-L2-090 | HELIXOS-L2-010 | 141 | Research／内容：選定や比較のための参考ソースを集める。 | archive/legacy-generation-2026-09-14/root/docs/process/modes/README.md:43; docs/governance/decisions/concept-requirement-po-decisions-2026-09-24.md:78-95 |
| HELIXOS-L2-091 | HELIXOS-L2-010 | 141 | Research／内容：決定には関わらない。 | archive/legacy-generation-2026-09-14/root/docs/process/modes/README.md:43; docs/governance/decisions/concept-requirement-po-decisions-2026-09-24.md:78-95 |
| HELIXOS-L2-092 | HELIXOS-L2-010 | 141 | Research／発行：計画 | archive/legacy-generation-2026-09-14/root/docs/process/modes/README.md:43; docs/governance/decisions/concept-requirement-po-decisions-2026-09-24.md:78-95 |
| HELIXOS-L2-093 | HELIXOS-L2-010 | 141 | Research／合流先：依頼元 | archive/legacy-generation-2026-09-14/root/docs/process/modes/README.md:43; docs/governance/decisions/concept-requirement-po-decisions-2026-09-24.md:78-95 |
| HELIXOS-L2-094 | HELIXOS-L2-010 | 142 | Add-feature／内容：既存のものに機能を差分で追加する | archive/legacy-generation-2026-09-14/root/docs/process/modes/README.md:44; docs/governance/decisions/concept-requirement-po-decisions-2026-09-24.md:78-95 |
| HELIXOS-L2-095 | HELIXOS-L2-010 | 142 | Add-feature／発行：計画 | archive/legacy-generation-2026-09-14/root/docs/process/modes/README.md:44; docs/governance/decisions/concept-requirement-po-decisions-2026-09-24.md:78-95 |
| HELIXOS-L2-096 | HELIXOS-L2-010 | 142 | Add-feature／合流先：Forwardの該当層 | archive/legacy-generation-2026-09-14/root/docs/process/modes/README.md:44; docs/governance/decisions/concept-requirement-po-decisions-2026-09-24.md:78-95 |
| HELIXOS-L2-097 | HELIXOS-L2-010 | 143 | Version-up／内容：後の版へ回した項目を保全し、時期が来たら取り込む | archive/legacy-generation-2026-09-14/root/docs/process/modes/README.md:45; docs/governance/decisions/concept-requirement-po-decisions-2026-09-24.md:78-95 |
| HELIXOS-L2-098 | HELIXOS-L2-010 | 143 | Version-up／発行：計画 | archive/legacy-generation-2026-09-14/root/docs/process/modes/README.md:45; docs/governance/decisions/concept-requirement-po-decisions-2026-09-24.md:78-95 |
| HELIXOS-L2-099 | HELIXOS-L2-010 | 143 | Version-up／合流先：取り込み時にDECIDE→Add-feature | archive/legacy-generation-2026-09-14/root/docs/process/modes/README.md:45; docs/governance/decisions/concept-requirement-po-decisions-2026-09-24.md:78-95 |
| HARNESS-L2-010 | HARNESS-L2-002 | 71 | ticketはHELIX-OSの推進が導いて発行する作業の単位とする。 | archive/legacy-generation-2026-09-14/root/docs/governance/helix-harness-requirements_v1.3.md:69-85; archive/legacy-generation-2026-09-14/root/docs/process/modes/README.md:30-49,64-80; docs/governance/decisions/concept-requirement-po-decisions-2026-09-24.md:78-95 |
| HARNESS-L2-011 | HARNESS-L2-008 | 73 | HARNESSは、OSとBRAINがticketを導くためのコアを持つ。 | archive/legacy-generation-2026-09-14/root/docs/governance/helix-harness-requirements_v1.3.md:69-85; archive/legacy-generation-2026-09-14/root/docs/process/modes/README.md:30-49,64-80; docs/governance/decisions/concept-requirement-po-decisions-2026-09-24.md:78-95 |
| HARNESS-L2-012 | HARNESS-L2-008 | 73 | コアは、工程の語彙・順序・停止・差戻し・完了条件と、落としてはならない工程義務（必要な層と対、成果物、oracle、人の判断が要る場所、戻し先）を、HELIX-JSONの定義と、JSONどうしの意味をつなぐPythonの意味導出コアとして提供する。 | archive/legacy-generation-2026-09-14/root/docs/governance/helix-harness-requirements_v1.3.md:69-85; archive/legacy-generation-2026-09-14/root/docs/process/modes/README.md:30-49,64-80; docs/governance/decisions/concept-requirement-po-decisions-2026-09-24.md:78-95 |
| HARNESS-L2-013 | HARNESS-L2-008 | 74 | BRAINはコアから判断する。 | archive/legacy-generation-2026-09-14/root/docs/governance/helix-harness-requirements_v1.3.md:69-85; archive/legacy-generation-2026-09-14/root/docs/process/modes/README.md:30-49,64-80; docs/governance/decisions/concept-requirement-po-decisions-2026-09-24.md:78-95 |
| HARNESS-L2-014 | HARNESS-L2-002 | 74 | HARNESS自身はticketを発行しない。 | archive/legacy-generation-2026-09-14/root/docs/governance/helix-harness-requirements_v1.3.md:69-85; archive/legacy-generation-2026-09-14/root/docs/process/modes/README.md:30-49,64-80; docs/governance/decisions/concept-requirement-po-decisions-2026-09-24.md:78-95 |
| HARNESS-L2-015 | HARNESS-L2-002 | 75 | 開発方式が変わっても、コアの工程義務を落とさない。 | archive/legacy-generation-2026-09-14/root/docs/governance/helix-harness-requirements_v1.3.md:69-85; archive/legacy-generation-2026-09-14/root/docs/process/modes/README.md:30-49,64-80; docs/governance/decisions/concept-requirement-po-decisions-2026-09-24.md:78-95 |

| HELIXOS-L2-100 | HELIXOS-L2-010 | 111 | 推進はticketを導いて発行する。 | docs/governance/decisions/concept-requirement-po-decisions-2026-09-24.md:78-95; archive/legacy-generation-2026-09-14/root/docs/process/modes/README.md:64-71 |
| HARNESS-L2-016 | HARNESS-L2-008 | 74 | OSはticketとその中の動的ワークフローを導いて発行する。 | docs/governance/decisions/concept-requirement-po-decisions-2026-09-24.md:78-95; archive/legacy-generation-2026-09-14/root/docs/process/modes/README.md:64-71 |
| HARNESS-L2-017 | HARNESS-L2-005 | 74 | 検収はticketから必要な検証を導く。 | docs/governance/decisions/concept-requirement-po-decisions-2026-09-24.md:78-95; archive/legacy-generation-2026-09-14/root/docs/process/modes/README.md:64-71 |
親主要求が見つからない条件：なし。意味の未決事項：なし。ID付与は採否・承認を成立させない。

## 静的検証結果

- 起点 `78bfd42ed808ff17982ffabfe0ffac0c04c557de` の `scaffold/**/validate.py` は137件中105 pass／32 fail。編集後も105 pass／32 failで、pass集合の減少は0件、新規failは0件。固定文が現行sourceに一意に残る参照のみ行位置・SHAを更新した。PHCAP-08/09のinventoryは現行generatorから再生成した。検査条件・meaning欄は変更していない。
- 旧から残るfail（同じ32件）：`delegated-doc-003-028`、`delegated-doc-008-017`、`legacy-ai-instruction-product-classification-0145`、`legacy-config-product-classification-0141`、`legacy-execution-ticket-product-classification-0147`、`legacy-implementation-residual-0126`、`legacy-overlap-reconciliation-0144`、`legacy-research-assets-product-classification-0142`、`legacy-schema-product-classification-0120`、`legacy-source-product-classification-0123`、`legacy-test-design-worker-workflow-0148`、`phcap15-17-orphan-asset-links`、`phcap15-deploy-fifth12-research`、`phcap15-deploy-final8-research`、`phcap15-deploy-followup-research`、`phcap15-deploy-gap-research`、`phcap15-deploy-next12-research`、`phcap15-deploy-pool12-research`、`phcap15-deploy-research`、`phcap15-deploy-sixth12-research`、`pre-isolation`、`pre-isolation-next`、`pre-isolation-outside-holding-67-migration`、`pre-isolation-outside-l1-semantic`、`rdp001-delegated-doc001-atom-030`、`rdp001-outside67-followup-069`、`rdp001-outside67-governance-crosswalk-followup-083`、`rdp001-outside67-web-webos-l1-anchor-0121`、`rdp001-web-webos-vision-asset-semantic-0124`、`rdp001-web-webos-vision-coverage-0091`、`rdp001-web-webos-vision-semantic-atoms-0088`、`rdp001-web-webos-vision-source-0080`。
- `scfctl stale` 0件、`validate` 142 bindings pass、`residuals` 0件、`selftest` 69 cases pass。変更文書と研究用inventoryに依存する34 bindingは、全upstream、obligations、verification、replacementの依存を照合し、括弧書きnoteで再束縛した。
- L2条件ID 95件は重複なし、各IDに対するL11行は1件、親主要求の存在を確認した。ticket種類19件の名称は編集前と同じ。準備記録の対象30行と補助7行の対応を確認した。`git diff --check` pass。旧archiveのworkflow、CLI、hook、runtime、test、CIは実行していない。
