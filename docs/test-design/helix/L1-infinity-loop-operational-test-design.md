---
title: "HELIX L1 Infinity Loop 運用テスト設計 — HIL要件 pair"
layer: L11
legacy_layer: L14
canonical_layer_scheme: L1-L12
kind: test_design
status: draft
created: 2026-07-15
updated: 2026-07-19
owner: PO (人間 / RetryYN)
plan: PLAN-L1-07-infinity-loop-platform-requirements
pair_artifact: docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md
---

# HELIX L1 Infinity Loop 運用テスト設計

## §0 pair方針

本書はlegacy L1要求をcanonical L2要求へ再投影したHIL-BR/FR/TR/NFRのL11受入テスト対である。物理pathとHOT IDはcompatibilityのため維持する。各要件は最低1件のHOT-HIL-*へ接続し、実装未完了をpassと扱わない。L12はL1企画の運用テスト対であり、本書をL12 pairとして扱わない。

## §1 代表運用シナリオ

| ID | 対応要件 | シナリオ | 合否条件 |
|---|---|---|---|
| **HOT-HIL-01** | HIL-BR-01/02, HIL-FR-01/02 | CodexがPRを作成し、Claude Code拡張hookが監査を開始する | 全base branchで1 delivery→1 audit job、head SHA一致、重複job 0 |
| **HOT-HIL-02** | HIL-BR-03, HIL-FR-10 | Codex完了後にClaudeがmemory圧縮する | raw logをmemoryへ複製せず、promote/supersede/no-promotion receiptが1件存在 |
| **HOT-HIL-03** | HIL-BR-04, HIL-FR-03/04, HIL-NFR-03 | Issueから実装を開始する | Reverse R0–R4とR4 routingが無ければ実装claimはexit 1、例外値0件 |
| **HOT-HIL-04** | HIL-BR-05, HIL-FR-05 | 監査が設計欠陥を検出する | Reverse→Redesign→pair-freeze→Forward実装以外の順序を拒否 |
| **HOT-HIL-05** | HIL-BR-06/07, HIL-FR-07 | AIがreceipt無しでIssueをcloseする | close拒否または再open、unauthorized closure event、merge不可 |
| **HOT-HIL-06** | HIL-BR-08, HIL-FR-06, HIL-NFR-07 | Codexが要求外CLI/API/設定を追加する | capability budget超過またはtrace無しsurfaceをScope Gateが検出しexit 1 |
| **HOT-HIL-07** | HIL-BR-09, HIL-FR-11/12/13, HIL-NFR-10 | 工程表からW-agentを生成する | registry→両runtime射影が決定的、worker/verifier別、drift/forbidden pathをblock |
| **HOT-HIL-08** | HIL-BR-10/12, HIL-FR-08/09 | IssueからPR監査まで一周する | Issue/Reverse/PLAN/commit/PR/CI/audit join切れ0、欠落は未完了表示 |
| **HOT-HIL-09** | HIL-BR-11, HIL-FR-14 | 同種findingが反復する | recipe候補→shadow→効果測定を経ずにgate/skill強制昇格しない |
| **HOT-HIL-10** | HIL-FR-15/16 | ZIP、前身exact 2 repositoryの全advertised heads/tags/pull、現行HELIXを再棚卸しする | A/B一致済みauthority receipt由来のref/content/edge分母、全core featureに採否とevidence pathがある |
| **HOT-HIL-11** | HIL-TR-01/02/03/07 | Node control planeからPython detectorを実行する | versioned input/output、timeout、provenance、DB write authority違反0、Bun不要 |
| **HOT-HIL-12** | HIL-TR-04/05/06, HIL-NFR-09 | clean環境で実行する | Linux full gate green、macOS/Windows adapter smoke、lock/version再現、OS logic fork 0 |
| **HOT-HIL-13** | HIL-NFR-01/04 | delivery再送とloop反復が起きる | 副作用重複0、budget到達で停止、同一checkpointから再開 |
| **HOT-HIL-14** | HIL-NFR-02/08 | AI-Aが自己audit/close/memory昇格を試みる | role separation gateが拒否し、identity/session/contextを分離したAI-Bのreceiptを要求 |
| **HOT-HIL-15** | HIL-NFR-05/06 | Issue/PR/ZIPに実行誘導または高影響操作が含まれる | untrusted分類、命令非実行、高影響操作はaction-binding approval待ち |
| **HOT-HIL-16** | HIL-BR-13, HIL-FR-17/20, HIL-NFR-11 | 本HARNESS構築PLANが画面工程をskipする | `not_applicable` receiptにno-UI理由、PO判定、入力digest、再entry triggerが揃う。暗黙skip、空理由、LLM単独判断はexit 1 |
| **HOT-HIL-17** | HIL-BR-13, HIL-FR-17..20 | 将来dashboardをscopeへ追加して既存skipのままL1 freezeへ進む | skipをstale判定しPrototype Discoveryへ戻す。artifact、walkthrough、要求delta/agreement前のL1 freeze/L3開始を拒否 |
| **HOT-HIL-18** | HIL-FR-18/19, HIL-NFR-11 | 画面対象が静的wireframeだけをG2証拠として提出する | 起動可能artifact、主要interaction/state、trace、digest、walkthroughが無ければG2 fail |
| **HOT-HIL-19** | HIL-BR-14, HIL-FR-21/22, HIL-NFR-12 | ZIPのprototype宣言を読んだが要件/Gateへ結線せず採用済みにする | `107_Vモデル・レベル定義.yaml`、導入ガイド、WBS、template/skillの各capabilityに独立IDと全trace edgeが無ければpair-freezeを拒否 |
| **HOT-HIL-20** | HIL-BR-14, HIL-FR-21/22 | exact 2 repositoryでhead/tag/pull ref追加・移動・消滅、A/B race、identity/namespace差替えを行う。ZIP entry変更、現行symbol削除も行う | authority/source digest差分でsnapshot・atomization・coverageの旧receiptを同一causalityでstale化し、再抽出・全件採否・orphan 0まで完了扱いに戻さない |
| **HOT-HIL-21** | HIL-BR-15, HIL-FR-23/24, HIL-TR-09/10, HIL-NFR-17 | product sourceをfull sync後に同一watermarkで再送する | 重複canonical record 0、source→snapshot→entity→requirement/Issue lineage全join、Python直接DB write 0 |
| **HOT-HIL-22** | HIL-FR-24 | connector schema変更、削除、watermark逆行を発生させる | drift/tombstone/stale findingを生成し、旧projectionを無音でcurrent扱いしない |
| **HOT-HIL-23** | HIL-FR-25/26, HIL-TR-10, HIL-NFR-13 | ZIP core engineとdetectorを同一snapshotへ実行する | engine artifactとdetector findingを別run/authorityで保存し、source/version/digestから再現可能 |
| **HOT-HIL-24** | HIL-FR-27, HIL-TR-08/09, HIL-NFR-14 | IPCへ正常、不正JSON、oversize、timeout、cancel、crash、late resultを注入する | 正常runだけ1回commit、異常はterminal receipt、partial/late DB write 0 |
| **HOT-HIL-25** | HIL-BR-19, HIL-FR-33, HIL-TR-11 | BunをPATHから除いたclean Linuxでinstall→build→CLI→hooks→tests→packageを実行する | 全必須command green、active Bun dependency 0、歴史的言及はpath/reason付きallowlistのみ |
| **HOT-HIL-26** | HIL-FR-34, HIL-TR-04..06, HIL-NFR-19 | 共通OS contract fixtureを3 profileで実行する | Linux full green、macOS portable green、Windows compatibility記録、coreのWSL/PowerShell依存0 |
| **HOT-HIL-27** | HIL-BR-16, HIL-FR-28, HIL-NFR-15 | prejoin/postjoin/external CI失敗と別SHA green再利用を試す | 該当段で停止し順序飛越/別SHAを拒否、3段が同一causality chainへjoin |
| **HOT-HIL-28** | HIL-BR-20, HIL-FR-29, HIL-NFR-16 | 既知failureをquarantineし同checkに新fingerprintを発生させる | exact既知だけ隔離、新failureはfail。代替gate/Issue/期限欠落ならquarantine拒否 |
| **HOT-HIL-29** | HIL-BR-17, HIL-FR-04/08/09/10/30 | Claudeがactionable findingを生成する | finding→Issue→R0–R4→memory summary→Codex queue全joinまでclaim不可、証拠なしdrop 0 |
| **HOT-HIL-30** | HIL-FR-05/31 | findingがcanonical L2要求変更を必要とする | L2/L11 pairをstale化し、再freeze前のclaim/Forward join/PR作成を拒否 |
| **HOT-HIL-31** | HIL-FR-05/17..20/31 | no-UI skip済PLANへ画面scopeを追加する | skip receiptをstale化してPrototype Discoveryへ戻し、agreement前のfreezeを拒否 |
| **HOT-HIL-32** | HIL-BR-18, HIL-FR-32, HIL-NFR-18 | agentをmusterしheartbeat停止、cancel、再起動、verify、retireする | lifecycle順序違反0、lease後write 0、checkpoint再開、verification後release、retired再claim不可 |
| **HOT-HIL-33** | HIL-FR-32, HIL-NFR-18 | 旧agent processがlease再割当後に遅延completionを返す | fencing token不一致で拒否し現ownerのartifact/state/memoryを上書きしない |
| **HOT-HIL-34** | HIL-TR-06 | Node/Python dependencyをclean/offline Linuxで解決しSBOM/secret/license検査を行う | canonical lockから再現しSBOM component未収録0、secret finding 0、未分類/禁止license 0、OS別lock fork 0 |
| **HOT-HIL-35** | HIL-FR-04/35, HIL-NFR-03/20 | R0–R4へ空、placeholder、同文、同digest、対象漏れ、根拠なしno-findingを投入し、budget途中停止も発生させる | 各phase固有assertionで拒否し、obligation 100%未満はcheckpoint後も未完了。phase skip 0 |
| **HOT-HIL-36** | HIL-BR-07, HIL-FR-09/36, HIL-NFR-21 | user directive/findingをAIがduplicate/false-positive/telemetry/cancelへ分類する | 原記録はdurable、duplicate先生存＋oracle包含、false-positive独立反証、cancel/supersede PO receipt、appeal route欠落なら非終端 |
| **HOT-HIL-37** | HIL-BR-14, HIL-FR-21/22/37, HIL-NFR-12/22 | ZIPまたはexact 2 Git authoritiesのreceipt由来contentをdirectory/aggregate代表行だけでcoveredにする | ref/content/edgeまたはatomic child count未確定、unclassified/overlap 1件でfreeze拒否。親をcovered分母へ算入しない |
| **HOT-HIL-38** | HIL-BR-08, HIL-FR-06/38, HIL-NFR-07/23 | 同じ変更でHIL要件を後付けし、そのHILだけを根拠に新CLI/dependencyを正当化する | authoritative rootへ到達しないcycleを拒否し、minimum-necessary/代替/budget証拠が無ければScope Gate fail |
| **HOT-HIL-39** | HIL-BR-21, HIL-FR-39, HIL-NFR-24 | 設計上のpolicy外部化、重複contract共通化、責務/stateのオブジェクト化、semantic renameを起票する。semantic同等で名称不統一、名称近似でsemantic相違、文字列類似だけ、public identifier rename、observable behavior変更、根拠なし汎用化を個別投入する | I/O、副作用、failure、state、call graph、全consumer、before/after oracle、behavior invariant、設計pair、rollbackがある最小変換だけを既存Refactorへ接続する。同義名はcanonical化し、同名異義は分離し、文字列類似だけは拒否する。public contract/DB semantics/要求差分はRedesignまたはRetrofitへrerouteし、推測抽象化はScope Gateで拒否する |
| **HOT-HIL-40** | HIL-BR-21, HIL-FR-40, HIL-NFR-25 | 13 roleのdomain objectと曖昧名、internal/public/DB renameを個別投入する | role invariant、canonical term、symbol↔object↔oracle edgeを検査し、internal renameだけoracle IDを維持、publicはRedesign、DBはRetrofitへ送る |
| **HOT-HIL-41** | HIL-BR-22, HIL-FR-41, HIL-FR-42, HIL-NFR-26 | requirement/service/objectから設計義務を生成し、見出しだけ、TBD、aggregate消込、偽N/A、orphanを投入する | 原子的な意味dischargeと双方向edgeがある義務だけをcoveredとし、未消込1件でfreeze拒否 |
| **HOT-HIL-42** | HIL-BR-23, HIL-FR-43, HIL-FR-44, HIL-NFR-27 | Requirement Translatorへ複合要求、曖昧要求、現行templateで表現不能な要求を投入する | 原文を保持してatom/challengeへ分岐し、template gapはIssue→shadow→独立reviewを経るまでactive化しない |
| **HOT-HIL-43** | HIL-BR-24, HIL-FR-45, HIL-NFR-28 | 要求のcapture、atom化、active化、split、merge、rename、supersede、N/Aを個別実行する | source/authority/oracle/service/template/obligation edgeと変更receiptが完全なrevisionだけをactive化し、coverage行だけ・孤児・stale・未解決ambiguityを拒否する |
| **HOT-HIL-44** | HIL-BR-25, HIL-FR-46, HIL-FR-47, HIL-NFR-29 | canonical L1–L12 templateと層外L0 anchorから章/field/table/done-when/pair obligationを抽出し各layer ledgerへ追加する | 全template atomがprovenance付きproposalまたはgap findingになり、空/TBD/抽出不能/重複/aggregate追加をfreezeへ算入しない |
| **HOT-HIL-45** | HIL-BR-25, HIL-FR-48, HIL-NFR-29 | 隣接layer間でdownstream edge、backprop edge、revision、粒度を個別に欠落・不一致化する | 上下2方向と同一semantic revisionが揃うまで対象layerのexitを拒否する |
| **HOT-HIL-46** | HIL-BR-25, HIL-FR-49, HIL-NFR-29 | L0/L1/L2/L3/L4/L5/L6の各正規V-pairでdesign側、verification側、oracle、snapshotを個別に欠落・不一致化する | 左右2方向、同一oracle/snapshot、実行evidenceが揃うpairだけをgreenにする |
| **HOT-HIL-47** | HIL-BR-25, HIL-FR-50, HIL-NFR-29 | ledger重複、責務混在、semantic/name collision、孤立edgeをrefactorし、pair/behavior/public/DB差分を個別投入する | 全上下・左右pairとoracleを保存する最小変更だけDesignRefactorへ送り、意味/public変更はRedesign、永続state変更はRetrofitへ送る |
| **HOT-HIL-48** | HIL-BR-26, HIL-FR-51, HIL-NFR-30 | 可逆な修正、L0目的変更、安全境界緩和をProposal化し、authority・impact・rollbackの欠落も投入する | 可逆変更だけを自動Admissionし、上位目的・安全境界は人間判断へ送り、検査欠落をCanonical化しない |
| **HOT-HIL-49** | HIL-FR-52, HIL-FR-53, HIL-NFR-31/32 | Markdown、DB、receiptの各段へfaultを注入し、rename/split/mergeとstale base revisionを実行する | 部分current 0、同一command冪等、異payload conflict、identity・authority・oracle・typed edge保持を証明する |
| **HOT-HIL-50** | HIL-BR-27, HIL-FR-54/55, HIL-NFR-33 | 同一意味の義務、既存契約、未被覆risk、positive-only見本、冗長見本を混在させる | 未被覆0・意味重複0の最小portfolioとrule/branch/risk単位のpositive/negative coverageを要求し、冊数・見本数だけの合格を拒否する |
| **HOT-HIL-51** | HIL-BR-28, HIL-FR-56 | 同じ要求をForwardとScrum S0–S4で処理し、snapshot、oracle、S4 decision、Forward返却edgeを個別に欠落させる | 各phaseを同一parent/snapshotへjoinし、S4未決定成果をForward currentへ入れず、deltaを要求/templateへ逆伝播する |
| **HOT-HIL-52** | HIL-BR-29, HIL-FR-57/58, HIL-NFR-34 | 工程/domain/riskが異なるtaskへ同一skillを強制し、候補判断packを自己評価だけでactive化する | 適用観点、反証、evidence、authorityを合成し、with/without shadowと別runtime reviewが無い候補をactive化しない |
| **HOT-HIL-53** | HIL-BR-30, HIL-FR-59/60, HIL-NFR-34 | 単純task、security review、並列探索、blind verificationからagent teamを生成し、未許可tool、自己検証、過剰並列、stale contractを投入する | 単純taskは既存roleへ送り、必要taskだけ最小teamを生成し、委譲4点、context/tool/path/budget、分離、lease/fencing/retire欠落を拒否する |
| **HOT-HIL-54** | HIL-BR-31, HIL-FR-61/62, HIL-NFR-35 | 候補名をblind化した同一fixtureでsmoke/full benchと実taskを走らせ、security failureやscope逸脱を高平均点へ混ぜる | machine dimensions、blind judge、retry込み実効costを再現し、重大failureを平均で相殺せず用途別admissionを決定する |
| **HOT-HIL-55** | HIL-FR-63, HIL-NFR-36 | upper-tier high固定、lightweight low固定、品質悪化時のeffort増だけを候補にする | upper-tier low/medium、lightweight highを既定とし、品質問題ではmodel/runtime escalationと比較して最小有効構成と例外receiptを残す |
| **HOT-HIL-56** | HIL-BR-32, HIL-FR-64/65/66/67/68/69, HIL-NFR-37/38/39/40 | 隔離なし委譲、allowlist外egress、履歴込み払い出し、未浄化env、bypass残置、機密ファイル混入、vendor設定依拠の充足claim、quota枯渇を投入する | sandbox契約・環境浄化・最小払い出し・proposal再検証・auditをローカル強制機構だけで判定し、違反をfail-close/quarantineする |
| **HOT-HIL-57** | HIL-BR-33 | 手編集した生成index、first/third-party混在、未承認のcutover切替を投入する | 正本indexからの決定論導出だけを許し、混在index と未承認配布切替を拒否する |

## §2 量閉じ

- HIL-BR-01..33: HOT-HIL-01..10/16/17/19..21/25/27..29/32/39..57で被覆。
- HIL-FR-01..69: HOT-HIL-01..56で被覆。
- HIL-TR-01..11: HOT-HIL-11/12/21/23..26/34で被覆。
- HIL-NFR-01..40: HOT-HIL-03/05..09/12..16/18..29/32/33/35..56で被覆。
- 実装状態: 全件`not-implemented`または`partial`。本L1 pair作成だけで完成扱いにしない。
