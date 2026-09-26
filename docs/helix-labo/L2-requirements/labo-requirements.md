---
title: "HELIX-LABOの機能単位要求候補"
canonical_vmodel: L1-L12
canonical_layer: L2
canonical_pair: L11
layer: L2
kind: requirement
status: draft
authority_status: draft_candidate
freeze_blocking: true
created: 2026-09-27
updated: 2026-09-27
pair_artifact: docs/helix-labo/L11-acceptance/labo-acceptance.md
parent_l1_candidate: docs/helix-labo/L1-planning/labo-intent.md
---

# HELIX-LABOの機能単位要求候補

本書は、[HELIX-LABO L1企画案](../L1-planning/labo-intent.md)と2026-09-26のPO原文を機能単位へ整理する未採択候補である。親L1も対象revisionのPO確認待ちであり、本書は要求採択、L3承認、実装・実行許可を生成しない。既存のL1、候補、原文は変更せず、ここで割り当てたIDは整理案である。

LABOは過去の出来事を観測・評価し改善Feedbackを提案する。source mechanismのraw state、authority、要求正本、運転状態を所有しない。OSがFeedbackを登録・routingし、対象機構が自らの変更・検証を行う。LABOの評価のみで要求・設計・モデル・配置・権限・実装・releaseを変更しない。

## 親L1と既存条件

| L2 ID | 親L1候補 | 対象とする既存条件 |
|---|---|---|
| HELIXLABO-L2-001 | HELIXLABO-L1-001 | 許可観測の集積、source正本維持、成功・失敗・拒否・取消・停止・不明・未観測の区別 |
| HELIXLABO-L2-002 | HELIXLABO-L1-002 | episode相関、要求から復旧までの履歴、相関と因果の分離 |
| HELIXLABO-L2-003 | HELIXLABO-L1-003 | 良否、条件、汎用／製品固有、system／operation、不明／不要への分解 |
| HELIXLABO-L2-004 | HELIXLABO-L1-004 | Vector守破離、意味・目的・条件・構造の保持、部分構造比較 |
| HELIXLABO-L2-005 | HELIXLABO-L1-004 | KEEP等の変換操作、仕組みを増やすこと自体を目的にしない |
| HELIXLABO-L2-006 | HELIXLABO-L1-005 | baseline/candidate/hybrid比較、OS割当Workerによる実験実行、品質・誤検知・見逃し・再作業・速度・費用・介入・運用負荷・一般化範囲の評価 |
| HELIXLABO-L2-007 | HELIXLABO-L1-006 | 再現性・機械判定・oracle・副作用・retry・rollback・冪等性に基づくsystem/operation配分 |
| HELIXLABO-L2-008 | HELIXLABO-L1-006 | 例外・誤検知・回避運用・変更費用の増加を受けたsystemからoperationへの再評価 |
| HELIXLABO-L2-009 | HELIXLABO-L1-005, HELIXLABO-L1-007 | single episodeからgeneric structureまでの適用範囲とFeedback先の分離 |
| HELIXLABO-L2-010 | HELIXLABO-L1-007, HELIXLABO-L1-010 | Feedback提案と最低限の証拠、行先、INTELLIGENCE評価材料 |
| HELIXLABO-L2-011–042 | 対応する各接続節の親L1 | 内部engine間、各source→LABO、LABO→各targetの個別接続。接続ごとに一つのHELIX-CONNECT connectorを置くPO指示 |
| HELIXLABO-L2-050 | HELIXLABO-L1-008 | Feedbackから変更・検証・運用・再観測までの改善循環 |
| HELIXLABO-L2-051 | HELIXLABO-L1-009 (`version_target: 2.0`) | 外部知識の由来確認・分解・比較・実験を経たBRAIN向け候補 |
| HELIXLABO-L2-052 | HELIXLABO-L1-007, HELIXLABO-L1-010, HELIXINTELLIGENCE-L1-018 (`version_target: 1.0` evidence) | INTELLIGENCEへ評価済み材料を渡す。学習実行は含まない |
| HELIXLABO-L2-053 | HELIXLABO-L1-010 と HELIXINTELLIGENCE-L1-021, HELIXINTELLIGENCE-L1-022, HELIXINTELLIGENCE-L1-023, HELIXINTELLIGENCE-L1-024, HELIXINTELLIGENCE-L1-025, HELIXINTELLIGENCE-L1-026 (`version_target: 3.0+`) | ローカルLLM学習・調整・評価材料の受け渡し。1.0依存にしない |
| HELIXLABO-L2-054 | HELIXLABO-L1-011, HELIXINTELLIGENCE-L1-010 | 接続要求：HELIX-Benchの水準・根拠・未評価をINTELLIGENCEへ渡す。配置と割当ては行わない |
| HELIXLABO-L2-055 | HELIXLABO-L1-011 | 単体要求：HELIX-BenchがWorker履歴から作業種別・model class別の水準、根拠、未評価状態を生成する。配置と割当ては行わない |

## HELIXLABO L1要求のL2/L11受け先と版

以下の各L1要求は、対応するL2本文と同一IDのL11受入行に明示している。1.0の親条件は1.0候補へ、後続版条件は`version_target`を保った後続候補へ結び、後続版を1.0成立依存にしない。

| 親L1 | 対応するHELIXLABO-L2-xxx本文 / 同一IDのHELIXLABO-L2-xxx L11受入行 | version_target |
|---|---|---|
| HELIXLABO-L1-001 | HELIXLABO-L2-001, 021–032 | 1.0（021–030）。031/032は採択済みsource contractがある場合の任意接続 |
| HELIXLABO-L1-002 | HELIXLABO-L2-002, 011, 012 | 1.0 |
| HELIXLABO-L1-003 | HELIXLABO-L2-003, 012, 013 | 1.0 |
| HELIXLABO-L1-004 | HELIXLABO-L2-004, 005, 013–015 | 1.0 |
| HELIXLABO-L1-005 | HELIXLABO-L2-006, 015, 016, 018 | 1.0。006の実験実行はOS割当Workerによる |
| HELIXLABO-L1-006 | HELIXLABO-L2-007, 008, 016, 017, 020 | 1.0 |
| HELIXLABO-L1-007 | HELIXLABO-L2-009, 010, 019, 034–042, 052 | 1.0。個別target接続はそのsource/target contractに従う |
| HELIXLABO-L1-008 | HELIXLABO-L2-050 | 1.0 |
| HELIXLABO-L1-009 | HELIXLABO-L2-033, 034, 051 | 2.0（外部知識経路の033/051）。034の内部generic evidenceは1.0で、051/033は1.0の必須依存ではない |
| HELIXLABO-L1-010 | HELIXLABO-L2-010, 019, 035, 052, 053 | 1.0評価材料（010/019/035/052）、3.0+学習・調整・評価材料循環（053） |
| HELIXLABO-L1-011 | HELIXLABO-L2-054, 055 | 1.0。Bench水準生成055とINTELLIGENCE接続054を分離 |

## LABO内の単体要求

各候補のpack identityはHARNESS-L2-010/011の共通契約に従う。ここではその契約を再定義しない。候補単位の識別子、契約版、成果物版、依存版、検証範囲、交換・更新条件は、採択後に当該契約に沿って結び付ける。単体の成果から接続・構成体の成立を推定しない。出力は根拠、source revision、適用範囲、未知・欠測、失敗時の戻し先、未完義務を含み、版不一致・部分成功を成功として扱わない。

### HELIXLABO-L2-001 — Aggregate Engine（集積）

- 親：HELIXLABO-L1-001。

入力は各機構・製品・運用環境から許可された観測情報。出力はsource identity/revisionと出典を保つLABO observationである。最低限、原文§3の`episode_id, requirement_revision, ticket_id, responsibility_id, product, mechanism, worker, provider, model, configuration, artifact, CI/test, release, deployment, runtime, failure, rework, cost, time, result`を結べる。開発ログ、Worker/AI判断、CI/test/review、backflow/recovery/incident/refactor、release/deployment/runtime、利用、再作業、費用、token/API、model/provider、correction/rollback/product resultを対象にする。成功のみを収集せず、`success, failure, rejected, cancelled, blocked, unknown, not_observed`を区別する。sourceの正本・state・authorityをLABOへ移さない。欠落や権限外情報は成功扱いせず、当該観測を保留しsource責務へ戻す。

- **単独成立・保証・version_target**：1.0。単独成立依存：1.0対象sourceの個別入力接続（L2-021〜030）。Web/WEB-OS source（L2-031/032）は各source contractが採択された場合に加える任意接続で、1.0の必須依存にしない。保証：source provenance・revision・状態分類を保持したobservationだけを出力し、source正本を変更しない。`version_target`は当該能力の目標版であり、実際の契約版・成果物版ではない。採択後の実版と互換範囲はHARNESS-L2-010/011の共通契約へ記録する。

### HELIXLABO-L2-002 — Correlation Engine（相関）

- 親：HELIXLABO-L1-002。

入力はsource付きobservation、出力は要求→ticket→Worker→実装→atomic CI→boundary integration→proof CI→release→deployment→runtime→incident→recovery等を結ぶepisodeである。requirement/revision、責務、product、mechanism、worker、provider/model/configuration、artifact、環境、結果を関連づけ、時間的近接だけで因果を断定しない。相関不能なeventは孤立・不明として保持する。部分episodeの不足項目と未完義務を明示し、相関が誤っていたと判明した場合は元eventを改変せずrelation訂正として戻す。

- **単独成立・保証・version_target**：1.0。単独成立依存：observation identity/field契約（L2-001）とAggregate→Correlate接続（L2-011）。保証：因果を断定せず、欠落を明示したepisodeを出力する。`version_target`は当該能力の目標版であり、実際の契約版・成果物版ではない。採択後の実版と互換範囲はHARNESS-L2-010/011の共通契約へ記録する。

### HELIXLABO-L2-003 — Structural Decomposition Engine（構造分解）

- 親：HELIXLABO-L1-003。

入力はepisodeとsource evidence、出力は良かった点、悪かった点、条件依存、汎用候補、product固有、system化候補、operationで補う候補、不明、不要の別々の評価である。全体を丸ごと採否せず、採用／不採用の二択へ丸めない。分類不能・反証・欠測は未確定として保持し、元の意味を変えずに根拠へ戻る。

- **単独成立・保証・version_target**：1.0。単独成立依存：source evidence付きepisode（L2-002）とCorrelate→Decompose接続（L2-012）。保証：分類軸を混ぜずunknownを維持する。`version_target`は当該能力の目標版であり、実際の契約版・成果物版ではない。採択後の実版と互換範囲はHARNESS-L2-010/011の共通契約へ記録する。

### HELIXLABO-L2-004 — Vector Shu-Ha-Ri Engine

- 親：HELIXLABO-L1-004。

入力は既存方式とそのsource evidence、出力は`purpose, structure, behavior, assumption, constraint, guarantee, cost`を含む比較仮説である。守では意味・目的・条件・構造を改変前に保持し、破では全体一致を要求せず部分構造と条件変化を比較し、離では有効部分の再構成をcandidateとして提示する。candidateはauthorityではない。原方式の意味を確認できない場合は変換へ進めず、source clarificationへ戻す。

- **単独成立・保証・version_target**：1.0。単独成立依存：根拠付き分類とDecompose→Vector接続（L2-013）、比較対象のsource本文。保証：改変前に元の目的・意味・条件を保持する。`version_target`は当該能力の目標版であり、実際の契約版・成果物版ではない。採択後の実版と互換範囲はHARNESS-L2-010/011の共通契約へ記録する。

### HELIXLABO-L2-005 — Transformation Engine

- 親：HELIXLABO-L1-004。

入力はL2-004等の仮説、出力は`KEEP, REDUCE, SPLIT, MERGE, REDEFINE, REPLACE, RELOCATE, ABSTRACT, SPECIALIZE, REFRAME, DEFER, RETIRE`の候補と、保つ意味・変わる意味・適用条件である。既存機構への吸収、責務移動、operationへの復帰、退役も比較対象にし、新機構の増加を目的化しない。意味変更を含む候補は上流の判断対象として示し、LABOが決定しない。

- **単独成立・保証・version_target**：1.0。単独成立依存：元意味と部分比較を保持するVector出力（L2-004/014）。保証：変更箇所と維持箇所を区別したcandidateを出し、意味変更を明示する。`version_target`は当該能力の目標版であり、実際の契約版・成果物版ではない。採択後の実版と互換範囲はHARNESS-L2-010/011の共通契約へ記録する。

### HELIXLABO-L2-006 — Experiment Engine

- 親：HELIXLABO-L1-005。

入力はbaseline/current、candidate、hybridの仮説・条件・oracleと、OSが割り当てたWorkerによる実験実行結果、出力は比較結果、失敗、反例、適用範囲、費用と限界である。実験実行はOSのassignmentに従うWorkerが担い、LABOはWorkerを選定・割当・起動しない。assignmentと実行結果の対応はL2-022/028のsource observationに結び、同じticket・experiment・対象版の証拠として評価する。品質、成功/失敗、false positive/negative、再作業、速度、CI/Worker時間、token/API費用、人間介入、context、複雑度、復旧時間、release lead time、運用負荷、cross-product再利用性を評価対象にする。「動いた」だけを改善としない。baselineやoracleの違い、比較不能、実験中断は結果へ記録し、無効比較を成功へ変換しない。

- **単独成立・保証・version_target**：1.0。単独成立依存：比較可能なbaseline/candidate/hybrid、oracle、評価条件（L2-005/015）、OS assignmentとWorker実行結果の対応（L2-022/028）。保証：OS割当Workerによる実験実行を前提に証拠を結び、判定不能・中断・反例を成功扱いせず結果に含める。LABOは割当を行わない。`version_target`は当該能力の目標版であり、実際の契約版・成果物版ではない。採択後の実版と互換範囲はHARNESS-L2-010/011の共通契約へ記録する。

### HELIXLABO-L2-007 — Assurance Allocation Engine

- 親：HELIXLABO-L1-006。

入力は反復episode、実験証拠、ルール候補とoracle、出力はoperation継続またはsystem化候補の評価である。同条件で再現可能、機械判定可能、oracleあり、副作用限定、retry/rollback可能、冪等化可能という条件を調べる。Operation→Repeated Stable Decision→Rule Candidate→Shadow→Mechanism Candidateは評価上の段階であり、自動昇格や新たな承認手続きではない。文脈依存、意味判断、例外多数、不完全oracle、高い誤検知、過剰拘束はoperationで保証する候補に残す。

- **単独成立・保証・version_target**：1.0。単独成立依存：比較可能性とoracleのあるexperiment evidence（L2-006/016）。保証：system化とoperation継続の両候補および適用限界を示し、自動昇格しない。`version_target`は当該能力の目標版であり、実際の契約版・成果物版ではない。採択後の実版と互換範囲はHARNESS-L2-010/011の共通契約へ記録する。

### HELIXLABO-L2-008 — Operational Fallback Engine

- 親：HELIXLABO-L1-006。

入力はsystem ruleの運用結果、例外、誤検知、回避運用、変更費用、出力はsystem継続・修正またはoperationへ戻す再評価候補である。systemは永続固定せず、system→operationを正規の改善候補として扱う。戻し先のoperation条件と未完義務を明示し、LABOは実行切替をしない。情報不足時は現行責務のownerへ評価を戻す。

- **単独成立・保証・version_target**：1.0。単独成立依存：現行systemの版、運用結果、例外/回避/費用証拠（L2-007/017）。保証：system→operation候補と未完義務を保持し、切替を実行しない。`version_target`は当該能力の目標版であり、実際の契約版・成果物版ではない。採択後の実版と互換範囲はHARNESS-L2-010/011の共通契約へ記録する。

### HELIXLABO-L2-009 — Generalization Engine

- 親：HELIXLABO-L1-005, HELIXLABO-L1-007。

入力は実験結果とepisode群、出力は適用範囲を`single episode → repeated episodes → cross-project → cross-product → general structure`のどこまで支持するか示す評価である。一事例から一般化しない。範囲ごとにFeedback先を分け、product固有意味はBRAINへ送らず、汎用構造も根拠なしに認定しない。反例や適用外条件が出たら範囲を狭め、元の証拠へ戻す。

- **単独成立・保証・version_target**：1.0。単独成立依存：評価済みexperiment群・反例・標本条件（L2-006/018）。保証：証拠の支持範囲を超えない適用範囲を出力する。`version_target`は当該能力の目標版であり、実際の契約版・成果物版ではない。採択後の実版と互換範囲はHARNESS-L2-010/011の共通契約へ記録する。

### HELIXLABO-L2-010 — Feedback Derivation Engine

- 親：HELIXLABO-L1-007, HELIXLABO-L1-010。

入力は評価済みepisode、実験、反例、適用範囲、出力は一つ以上のtarget-specific Feedback candidateである。各Feedbackは最低限`source_episode, source_revision, target_mechanism, target_responsibility, observation, evidence, failure_or_success, hypothesis, experiment, result, counterexample, scope, confidence, regression_risk, recommended_action, revalidation_condition`を持つ。推奨actionは`maintain, redefine, replace, split, merge, systemize, operational_fallback, retire`から選ぶ。Feedbackは提案でありauthorityではない。登録・routingはOS、変更はtarget ownerが担い、欠けた必須根拠は補完せず差戻す。

- **単独成立・保証・version_target**：1.0。単独成立依存：範囲付き知見・target responsibility・evidence/反例（L2-009/019）。保証：target別提案を作り、登録・routing・authority変更はしない。`version_target`は当該能力の目標版であり、実際の契約版・成果物版ではない。採択後の実版と互換範囲はHARNESS-L2-010/011の共通契約へ記録する。


### HELIXLABO-L2-055 — HELIX-Bench 作業水準生成（1.0）

HELIX-Benchは許可されたWorker作業履歴を作業種別・model classごとに集計し、対応可能性の水準、根拠、評価範囲を導く。評価していないmodel classは明示的に「未評価」とする。水準は配置案の材料であり、Benchは配置案を作成せず、Worker/modelの選定・指定・割当ても行わない。

- 親：HELIXLABO-L1-011。入力：Worker作業履歴、作業種別、model class、評価結果とそのsource revision/範囲。出力：作業種別・model class別水準、根拠、評価期間/適用範囲、評価済み/未評価状態。依存：許可されたLABO observation（L2-001/028）と評価可能な実績（必要に応じL2-006）、Worker historyの作業種別・model class identity。保証：履歴だけで未知作業の成功を保証せず、未評価を評価済みに変換せず、配置・割当て・権限を変更しない。範囲や実績が不足・不整合なら水準を確定せず該当履歴sourceへ戻す。`version_target: 1.0`。

## 接続要求


接続の版契約はHARNESS-L2-010/011に沿う。接続ごとに固有のconnectorを一つ対応づける。connectorは入力・出力、契約版、依存版、観測可能な進行・結果・証拠、失敗時の戻し先、未完義務を引き継ぐ。source authorityやtarget authorityを移さず、片側の成功だけで接続成功としない。以下の機構・source群の個別connectorは互いに代用しない。

各接続は個別identityであり、各接続に固有のHELIX-CONNECT connectorを一つ割り当てる。各接続packは下記の入力・出力・親L1・依存・保証・失敗時戻し先を持ち、共通contractの実版記録はHARNESS-L2-010/011に従う。各節で示す`version_target`は機能目標であってartifact versionではない。

### HELIXLABO-L2-011 — Aggregate → Correlate

- 親：HELIXLABO-L1-001, HELIXLABO-L1-002。入力：source付きobservationとfield/revision。出力：episode候補。依存：L2-001およびAggregate identity。保証：元source参照と欠測を保持し、因果を確定しない。relation不一致は元記録を保ってcorrelationへ戻す。`version_target: 1.0`。

### HELIXLABO-L2-012 — Correlate → Decompose

- 親：HELIXLABO-L1-002, HELIXLABO-L1-003。入力：episode/evidence/relation。出力：分類対象。依存：L2-002。保証：episodeの根拠・unknownを保持。relation版不一致は訂正sourceへ戻す。`version_target: 1.0`。

### HELIXLABO-L2-013 — Decompose → Vector Shu-Ha-Ri

- 親：HELIXLABO-L1-003, HELIXLABO-L1-004。入力：根拠付き分解結果。出力：意味・条件別の比較仮説入力。依存：L2-003。保証：分類軸と根拠を保持。欠落はsource evidenceへ戻す。`version_target: 1.0`。

### HELIXLABO-L2-014 — Vector → Transformation

- 親：HELIXLABO-L1-004（Vector）、HELIXLABO-L1-004（Transformation）。入力：元意味・目的・条件を含む部分比較candidate。出力：変換候補。依存：L2-004。保証：意味保持と変える部分を区別。元の意味不明ならL1/sourceへ戻す。`version_target: 1.0`。

### HELIXLABO-L2-015 — Transformation → Experiment

- 親：HELIXLABO-L1-004（Transformation）、HELIXLABO-L1-005（Experiment）。入力：変換candidate・適用条件。出力：baseline/current、candidate、hybridの比較条件。依存：L2-005、評価oracleと対象版。保証：版・条件の同一性を保持。oracle/比較条件不足なら実験を成立扱いせず戻す。`version_target: 1.0`。

### HELIXLABO-L2-016 — Experiment → Assurance Allocation

- 親：HELIXLABO-L1-005（Experiment）、HELIXLABO-L1-006（Assurance Allocation）。入力：比較結果・反例・oracle・中断状態。出力：system/operation評価材料。依存：L2-006。保証：比較可能性と反例を保持。判定不能はoperation候補として保留する。`version_target: 1.0`。

### HELIXLABO-L2-017 — Assurance Allocation → Operational Fallback

- 親：HELIXLABO-L1-006（Assurance Allocation／Operational Fallback）。入力：system/operation適格性と現行保証。出力：再評価候補・未完義務。依存：L2-007と現行版情報。保証：LABOは切替を実行しない。所有者の運転結果が不足すればownerへ戻す。`version_target: 1.0`。

### HELIXLABO-L2-018 — Experiment → Generalization

- 親：HELIXLABO-L1-005（Experiment）、HELIXLABO-L1-007（Generalization）。入力：比較結果、標本条件、反例。出力：支持される適用範囲。依存：L2-006。保証：適用範囲を証拠以上に広げない。反例・条件欠落は実験評価へ戻す。`version_target: 1.0`。

### HELIXLABO-L2-019 — Generalization → Feedback Derivation

- 親：HELIXLABO-L1-005（Generalizationの結果元）、HELIXLABO-L1-007（Feedback先）、HELIXLABO-L1-010（INTELLIGENCE評価材料）。入力：範囲付き知見とtarget/responsibility候補。出力：target別Feedback候補。依存：L2-009、target identity/evidence。保証：targetごとに提案を分ける。target不明はOS routing候補として戻す。`version_target: 1.0`。

### HELIXLABO-L2-020 — Operational Fallback → Aggregate

- 親：HELIXLABO-L1-001（Aggregate）、HELIXLABO-L1-006（Operational Fallback）。入力：operation復帰後の結果・旧新rule版。出力：新observation。依存：L2-008とL2-001。保証：復帰後も未完義務と前後版を保持する。欠落はsource ownerへ戻す。`version_target: 1.0`。

### HELIXLABO-L2-021 — HELIX-HARNESS → Aggregate

- 親：HELIXLABO-L1-001。入力：HARNESSから許可された過去工程・実績観測。出力：source identity/revision付きobservation。依存：HARNESS source contractと個別connector。保証：HARNESS authorityとraw recordを保持。data scope/版不明はHARNESS ownerへ戻す。`version_target: 1.0`。

### HELIXLABO-L2-022 — HELIX-OS → Aggregate

- 親：HELIXLABO-L1-001。入力：OSから許可されたticket/運転/証拠観測。出力：source identity/revision付きobservation。依存：OS source contractと個別connector。保証：OS正本を保持し未完/unknownを区別。stale/欠落はOSへ戻す。`version_target: 1.0`。

### HELIXLABO-L2-023 — BRAIN → Aggregate

- 親：HELIXLABO-L1-001。入力：許可された知識利用・適用結果の観測。出力：source版付きobservation。依存：BRAIN source contractと個別connector。保証：BRAIN知識正本を書き換えない。source identity不明はBRAINへ戻す。`version_target: 1.0`。

### HELIXLABO-L2-024 — INTELLIGENCE → Aggregate

- 親：HELIXLABO-L1-001。入力：許可された判断/予測/診断/reviewの結果観測。出力：観測事実と判断結果を区別したobservation。依存：INTELLIGENCE source contractと個別connector。保証：過去評価は現在のauthorityにならない。版不一致はINTELLIGENCEへ戻す。`version_target: 1.0`。

### HELIXLABO-L2-025 — SECURITY → Aggregate

- 親：HELIXLABO-L1-001。入力：SECURITYが許可した安全性・incident evidence。出力：範囲付きobservation。依存：SECURITY data-use scopeとconnector。保証：restricted dataとauthorityを移さない。scope不明はSECURITYへ戻す。`version_target: 1.0`。

### HELIXLABO-L2-026 — INFRASTRUCTURE → Aggregate

- 親：HELIXLABO-L1-001。入力：許可されたresource/runtime evidence。出力：source版付きobservation。依存：INFRASTRUCTURE source contractとconnector。保証：resource authorityはINFRASTRUCTUREに残る。stale/unknownはsourceへ戻す。`version_target: 1.0`。

### HELIXLABO-L2-027 — HELIX-CONNECT → Aggregate

- 親：HELIXLABO-L1-001。入力：HELIX-CONNECTを介した個別connection observationとtrace。出力：provenance/schema版を保つobservation。依存：元接続ごとのcontractと専用connector。保証：drift/unknownを明示する。contract不一致はCONNECT/source ownerへ戻す。`version_target: 1.0`。

### HELIXLABO-L2-028 — Worker → Aggregate

- 親：HELIXLABO-L1-001。入力：許可されたWorker作業結果。出力：task class/assignment/source付きobservation。依存：OS assignmentとWorker result contract。保証：Workerをauthority ownerとせず、未評価結果を評価済みにしない。assignment不明はOSへ戻す。`version_target: 1.0`。

### HELIXLABO-L2-029 — CI/test → Aggregate

- 親：HELIXLABO-L1-001。入力：許可されたCI/test結果と対象revision。出力：検査範囲付きobservation。依存：HARNESS verification contractとOS実行証拠。保証：未実行/stale/中断をpassとしない。検査範囲欠落はsource ownerへ戻す。`version_target: 1.0`。

### HELIXLABO-L2-030 — Product Core → Aggregate

- 親：HELIXLABO-L1-001。入力：各製品の許可利用・結果観測。出力：product/source identity別observation。依存：そのProduct Coreのsource contractと専用connector。保証：製品意味とauthorityを保つ。異なるsourceは同一identityに統合しない。`version_target`は接続対象製品の採択済みscopeに従う。

### HELIXLABO-L2-031 — Web product → Aggregate

- 親：HELIXLABO-L1-001。入力：Web productからの許可された利用結果。出力：source identity/revision/data scope付きobservation。依存：当該Web productの採択済みsource contractが存在するときだけ有効。HELIX-Webの未採択candidateや公開実績を1.0の前提・要求採択にしない。保証：source permission、revision、製品meaningをsource側に残す。未知scopeはWeb ownerへ戻す。`version_target`はWeb product側の上流判断に従い、LABO 1.0の必須依存ではない。

### HELIXLABO-L2-032 — WEB-OS → Aggregate

- 親：HELIXLABO-L1-001。入力：WEB-OSから許可されたtenant/job/deployment/runtime観測。出力：WEB-OS source identity/revision/data scope付きobservation。依存：WEB-OSの採択済みsource contractと個別connectorがある場合のみ。HELIX-WebのVision/candidateの状態をWEB-OS要求採択に変えず、Web/WEB-OS実運用をLABO 1.0の必須前提にしない。保証：tenant/customer scopeとWEB-OS authorityをsource側に保つ。scope不明はsource ownerへ戻す。`version_target`は上流決定に従う。

### HELIXLABO-L2-033 — External source acquisition → LABO (`version_target: 2.0`)

- 親：HELIXLABO-L1-009。入力：crawler/CONNECT等が取得したOSS/design/paper/Issue/PRとprovenance。出力：由来・時点・取得範囲・欠落・適用条件付き評価対象。依存：外部取得connectionの個別connector。保証：取得情報を評価境界として扱い、命令/patchを直接実行しない。provenance不明なら取得元へ戻す。`version_target: 2.0`で、LABO 1.0の成立に不要。

### HELIXLABO-L2-034 — LABO → BRAIN

- 親：HELIXLABO-L1-007, HELIXLABO-L1-009。入力：異なるproduct/meaning/episodeを横断して支持されたgeneric structure evidence。出力：BRAIN向け構造candidate。依存：L2-009、BRAINとの個別connector。保証：product固有meaningは渡さない。一事例・適用範囲不明はL2-009へ戻す。`version_target: 1.0`（内部evidence）。外部知識の評価loopは`version_target: 2.0`。

### HELIXLABO-L2-035 — LABO → INTELLIGENCE 評価材料境界

- 親：HELIXLABO-L1-007, HELIXLABO-L1-010, HELIXINTELLIGENCE-L1-018。入力：判断精度、failure corpus、counterexample、model/provider比較、FP/FN、diagnosis/review/bot評価等のLABO評価材料。HELIX-Benchの水準は専用接続L2-054で扱い、本接続のpayloadへ重複定義しない。出力：適用範囲・source revision・未評価状態付きpacketをINTELLIGENCE境界へ渡すこと。依存：評価済みevidenceとINTELLIGENCE connector。保証：この節は境界での受渡し契約を定義し、構成体の全材料収集・同一revisionの到達確認はL2-052が受け持つ。LABOは現在判断・配置・botを実行しない。未評価はそのまま渡す。`version_target: 1.0`（評価材料）。学習・調整は別の`version_target: 3.0+`。

### HELIXLABO-L2-036 — LABO → HELIX-HARNESS

- 親：HELIXLABO-L1-007。入力：V-model、要求形成、design obligation、verification contract、backflow、境界調整、refactor、release/maintenance工程のevidence。出力：HARNESS向けFeedback candidate。依存：対象revisionとHARNESS connector。保証：意味変更は上流candidateとして返し、LABOは要求・contractを書き換えない。target不明はrouting候補へ戻す。`version_target: 1.0`。

### HELIXLABO-L2-037 — LABO → HELIX-OS

- 親：HELIXLABO-L1-007。入力：ticket、WIP、worker placement、priority、CI profile、inspection/integration、release promotion、retry/recovery、cost/order/stateの運転evidence。出力：OS向けFeedback candidate。依存：OS target identity/connector。保証：ticket登録/routing/運転はOSに残す。scopeが不明ならOSへ戻す。`version_target: 1.0`。

### HELIXLABO-L2-038 — LABO → SECURITY

- 親：HELIXLABO-L1-007。入力：認可・隔離・credential・情報保護に関する許可evidence。出力：SECURITY向けFeedback candidate。依存：SECURITY data-handling/target contract。保証：LABOは権限を変更せずrestricted dataを通常packetへ流さない。scope不明はSECURITYへ戻す。`version_target: 1.0`。

### HELIXLABO-L2-039 — LABO → Worker execution

- 親：HELIXLABO-L1-007。入力：Worker実行、停止、復旧に関する許可結果。出力：OS/SECURITYを経たtarget-specific Feedback candidate。依存：Worker result identityとOS/SECURITY routing。保証：Worker assignment/executionをLABOが変更しない。責務不明はOSへ戻す。`version_target: 1.0`。

### HELIXLABO-L2-040 — LABO → HELIX-CONNECT

- 親：HELIXLABO-L1-007。入力：内外connection、retry、contract version、traceに関するevidence。出力：CONNECT向けFeedback candidate。依存：接続固有identityとCONNECT connector。保証：connector contractをLABOが変更しない。不一致はCONNECTへ戻す。`version_target`は対象接続の上流採択scopeに従う。

### HELIXLABO-L2-041 — LABO → Product Core

- 親：HELIXLABO-L1-007。入力：product固有meaning、要求、設計、domain、UXのevidence。出力：該当Product Core向けcandidate。依存：対象製品のidentity/版と個別connector。保証：product meaningをBRAINへ移さず、正本を製品側に残す。target不明はownerへ戻す。`version_target`は各製品の採択scopeに従う。

### HELIXLABO-L2-042 — LABO → WEB-OS

- 親：HELIXLABO-L1-007。入力：WEB-OSのtenant/job/deployment/runtime運転評価。出力：WEB-OS向けFeedback candidate。依存：WEB-OS authority/source contractと個別connectorが採択された場合のみ。Web/WEB-OS要求の採択はLABO 1.0の前提ではない。保証：LABOはstate/authorityを変更しない。`version_target`は上流判断に従う。
### HELIXLABO-L2-054 — HELIX-Bench水準のINTELLIGENCE接続（1.0）

L2-055が生成した作業種別・model class別の水準、根拠、適用範囲、未評価状態をINTELLIGENCEへ渡す専用接続である。水準生成は055、配置案の作成はINTELLIGENCE、指定・割当てはOSが担う。本節は接続・受領範囲を定義し、水準生成を重複定義しない。未評価を実績ありに見せた場合、model変更・scope拡大・権限拡大を直接行った場合は不成立としてLABO/INTELLIGENCE/OSの責務境界へ戻す。

- 親：HELIXLABO-L1-011, HELIXINTELLIGENCE-L1-010。入力：L2-055の水準生成結果。出力：同じ作業種別・model class・評価範囲・根拠・未評価状態を保ったINTELLIGENCE向け受渡し。依存：HELIX-BenchのL2-055、INTELLIGENCE connector。保証：接続は水準を変えず、配置案はINTELLIGENCE、指定・割当てはOSに残す。未評価や範囲不明は水準生成側の再評価へ戻す。`version_target: 1.0`。

## 構成体要求

### HELIXLABO-L2-050 — 内部改善循環（1.0）

入力は許可観測・episode・実験と評価済みFeedback候補、出力はOS登録/routing後のtarget変更、target検証、運用結果、LABO再観測を結ぶ追跡可能な循環である。段階はObserved→Correlated→Hypothesized→Experimented→Evaluated→Feedback Candidate→OS registration/target routing→target change process→verification→deployment/operation→LABO re-observation。登録、candidate数、変更、CI成功だけで改善完了としない。採択前は候補のまま保持し、target authorityはtarget ownerに残す。変更後の再観測と効果・退行評価がない場合は循環未完了として戻し、過去記録を上書きしない。

- 親：HELIXLABO-L1-008。依存：L2-001〜010と適用される個別接続（実験ではL2-022のOS assignment観測とL2-028のWorker結果観測を同ticket/experimentへ結ぶ）、OSによるFeedback登録/routing、各target ownerによる変更・検証。保証：循環の未完義務とsource/target revisionを保持し、実験評価はOS割当Workerの実行証拠に結び付く。変更後観測が欠ければLABOの再観測へ戻す。`version_target: 1.0`。

### HELIXLABO-L2-051 — 外部知識評価循環 (`version_target: 2.0`)

外部OSS/design/paper/Issue/PR等をcrawler/CONNECT等が取得し、LABOが由来・revision・取得範囲を確かめ、分解・Vector比較・実験評価し、汎用構造候補をBRAINへ返す構成体。外部で成功した方式の直接採用・BRAINへの無評価投入をしない。1.0内部改善循環の依存にしない。取得・由来が不明なら評価を保留し取得sourceへ戻す。

- 親：HELIXLABO-L1-009。入力：外部取得のprovenance付きsource。出力：評価済みgeneric structure candidateとBRAINへのconnection。依存：L2-033/034とcrawler/CONNECTのsource contract。保証：由来確認・分解・比較・実験を通す。由来不明は取得元へ戻す。`version_target: 2.0`であり1.0の前提ではない。

### HELIXLABO-L2-052 — INTELLIGENCE評価材料循環 (`version_target: 1.0`)

L2-035で定義した境界payloadを使い、LABOの評価済みsource revisionからINTELLIGENCEの受領まで同一revision・適用範囲・未評価状態を追跡する構成体である。035のpayload schemaや転送責務を再定義しない。INTELLIGENCEの現在判断、予測、配置案、bot稼働をLABOが所有しない。評価材料を渡すことはモデル変更・training許可ではない。source revision、範囲、受領の対応が不明なら該当source/evidenceへ戻し、循環を未完了とする。

- 親：HELIXLABO-L1-007, HELIXLABO-L1-010, HELIXINTELLIGENCE-L1-018。依存：L2-035と評価済みsource evidence。入力：L2-035のpayloadおよび同revisionのprovenance。出力：INTELLIGENCE側の受領証跡とLABO側から辿れる同一revisionの材料循環。保証：payloadの境界契約は035、評価から受領までの構成体追跡は052に分離し、INTELLIGENCEは評価範囲・未評価状態を受け取る。判断/配置/稼働はINTELLIGENCE側で行う。範囲・版・受領が不明ならLABO再評価へ戻す。`version_target: 1.0`（評価材料のみ）。

### HELIXLABO-L2-053 — ローカルLLM学習・調整評価材料循環 (`version_target: 3.0+`)

3.0以降に、L2-035の評価済み材料を、HELIXINTELLIGENCE-L1-021, HELIXINTELLIGENCE-L1-022, HELIXINTELLIGENCE-L1-023, HELIXINTELLIGENCE-L1-024, HELIXINTELLIGENCE-L1-025に対応する領域/能力別のローカルLLM学習・調整・評価へ利用し、その候補を同じ責務範囲・比較可能なcorpusで評価した結果をHELIXINTELLIGENCE-L1-026に従ってLABOへ返す構成体候補である。一つの万能モデルへの統合は要求しない。学習/調整の実行はOSがticket化しWorkerが行う。評価材料の利用区分を保ち、候補の由来・設定・評価結果・適用範囲・戻し先を追う。1.0の成立条件・依存に含めず、LABOが学習を直接実行したりmodel/providerを切り替えたりしない。後続版の能力がない場合も1.0評価材料の受け渡しは成立する。

- 親：HELIXLABO-L1-010（LABOからの3.0+評価材料接続）、HELIXINTELLIGENCE-L1-021, HELIXINTELLIGENCE-L1-022, HELIXINTELLIGENCE-L1-023, HELIXINTELLIGENCE-L1-024, HELIXINTELLIGENCE-L1-025, HELIXINTELLIGENCE-L1-026（学習・調整・評価側）。入力：LABO評価済みepisode・事例・反例・学習材料。出力：INTELLIGENCEの学習/調整評価に利用される材料と実績のLABO再観測。依存：L2-035、OS ticket、Worker実行、INTELLIGENCE側の学習/evaluation contract。保証：training/validation/evaluation/holdout/prohibited区分とmodel lineageを保つ。これらのsourceが未採択なら3.0候補へ戻し、1.0材料接続を止めない。`version_target: 3.0+`。

## HELIX-LABO不変条件

[PO原文§24](../sources/labo-core-engine-po-original-2026-09-26.md)の15条件を一つずつ保全し、対応するL2要求と同一IDのL11受入行に結ぶ。

1. LABOは全HELIXの観測結果を横断して扱える（HELIXLABO-L2-001, 021–032）。
2. 原state/authorityをLABOへ集中させない（HELIXLABO-L2-001, 021–042）。
3. 成功だけでなく失敗・拒否・不明も集積する（HELIXLABO-L2-001, 002）。
4. correlationを因果と決めつけない（HELIXLABO-L2-002）。
5. 一事例を一般化しない（HELIXLABO-L2-009）。
6. 外部方式をそのまま採用しない（HELIXLABO-L2-033, 051）。
7. Product固有意味をBRAINへ送らない（HELIXLABO-L2-009, 034, 041）。
8. BRAINには汎用構造のみをFeedbackする（HELIXLABO-L2-034）。
9. Intelligenceには判断・監査・bot・モデル改善に使える評価材料を返す（HELIXLABO-L2-035, 052）。HELIX-Bench水準生成とINTELLIGENCE接続はHELIXLABO-L2-055/054で分ける。
10. System化率最大化を目的にしない（HELIXLABO-L2-007）。
11. Operationを正規の保証手段として認める（HELIXLABO-L2-007, 008）。
12. SystemからOperationへの降格を認める（HELIXLABO-L2-008, 017, 020）。
13. LABO評価だけで変更を確定しない（HELIXLABO-L2-010, 050）。
14. 変更後は必ず再観測する（HELIXLABO-L2-020, 050）。
15. Feedbackの効果そのものもLABOで評価する（HELIXLABO-L2-050）。

## 既存候補と旧条件の対応

既存候補のID・文言・状態は変更しない。ここでのrelationは移管・採択・置換ではない。

| 既存source | 本書で関係するL2候補 | 保持の扱い |
|---|---|---|
| HELIXOS-L2-005の改善研究部分 | 006, 009, 010, 050 | 効果・退行をLABOで評価し、登録・routing・ticket化はOSに残す。元OS条件はOS本文に案内として保持 |
| HELIXOS-L2-012（技術調査） | 051、内部観測は001/002 | 既存candidateの出典・revision・取得範囲・欠落・適用条件・秘密送信禁止・命令/patch不実行・closed/mergedのみで解決扱いしない条件をcandidateのまま残す |
| HELIXOS-L2-013（横断診断） | 002, 006, 008, 050 | 原記録、原因候補、是正、再観測を関係づける。OS管理自身も評価対象。既存candidateの状態を変えない |
| RCLS-BR-001..006 | 001,002,006,007,009,010,052 | responsibility ownership、CASE/SCENE/PATTERN/LOG/VERIFY区分、最小packet、project→independent→cross-project→shadow→mechanism段階、stale/revoked/revalidation、authority非変更を候補条件として保持。新しい学習機構を重複定義しない |
| HELIXLABO-L2-WEB-001..014 | 001,002,006,009,010,050,054との関係候補 | WEB由来episode、比較条件、性能差と品質、観測/実験、総時間・費用、遅延障害窓、日次集計、公開母数/不確実性、残差、INTELLIGENCE連携、顧客秘密、Feedback再観測、実験分離の14条件は[候補文書](../candidates/improvement-research-requirements.md)に原文のまま保持。ここでは要求採択せず、別identity・所属・版は人判断候補として残す |

### 旧HELIX資産との照合

以下は対応する旧sourceを読んだ上で、保持・変更の範囲を示す。SHA-256は現在のarchive bytes。

| 旧asset ID・source（path:行） | SHA-256 | 本書で保持する条件 | 変える点と理由 |
|---|---|---|---|
| LEGACY-ASSET-D60AE87D9DFA0740F4A8 `archive/legacy-generation-2026-09-14/root/src/schema/harness-db-tables-evaluation.ts:32` | `d3f5f8b303cd9f568d7695d19c05d0e4b492f7df9caa60c929a749fa2990bbe2` | `improvement_episode_id`による改善評価とepisodeの関係 | 新L1は要求から運用・復旧までの機構横断episodeへ広げる。旧schemaの実行・採用はしない |
| LEGACY-ASSET-EE5DBACC7F28F7D1F605 `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/pillar-functional-requirements.md:46,92,49,95` | `7b49652eb96f73efc903a462264962ab1811819eee76a3fd952d1a1e03af6544` | HBR-P4計測に基づく改善評価、HBR-P8外部source provenance/security境界 | L1/PO原文の全体評価指標と外部知識評価境界へ整理。旧要求は新採択として扱わない |
| LEGACY-ASSET-F2C2755C8809C2C0DEAD `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/responsibility-centric-learning-requests.md:各RCLS-BR-001..006` | `c3d9f28a17ac8882f22b5cf86b6d0b16c457a996b3eb0682b6de1010d64ea29c` | responsibility ID、証拠種別、最小context、段階、失効、authority非変更 | RCLSは未承認candidateとして同候補文書に保持し、L2の新規採択に変換しない |
| LEGACY-ASSET-3A15E5645D2D2A59DFF5 `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/execution-ticket-requirements.md:349-351` | `f0d0d33a1cced1ad7c1bab061f0a36bcdb5bad122dc58c7e8e43b47032f37d6b` | HXB-FR-015: Benchの証拠状態・改善候補を返し、配置/権限は配車側が決定。履歴だけで現modelを保証しない | HELIX-BenchをLABO内へ置き、INTELLIGENCEの案・OSの指定に接続 |
| LEGACY-ASSET-50CA1C554747F12266D3 `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/resident-lane-orchestration-requirements.md:663-666` | `17bc83614d7f5f75b61831eb447a23ee706cb8a6d9e54477736e553ff956dcfd` | RLO-FR-040: 未評価を明示し、score単独で権限・branch・merge authorityを変えない | 適用先をINTELLIGENCE配置案とOSの割当てへ分離 |
| LEGACY-ASSET-719D5EC9C06FC4AAD0FF `archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:67,113` | `db31f424cc89cc4cc31058b2d03059e794ab2d63fa0b1f431dd38eced8f4c8fb` | HIL-BR-15/HIL-FR-23: product-data connectorの由来・版・権限方針 | PO判断でconnectionごとのconnectorへ拡張。各接続を疎結合化しCONNECTへ接続 |
| LEGACY-ASSET-C35E93F2D36777CD7462 `archive/legacy-generation-2026-09-14/root/docs/design/helix/L4-basic-design/infinity-loop-platform-basic-design.md:65,554-575` | `2a757a52082f823c4e52ae1e04887b62b8ac5f5df0d833d2b1c00516d6572357` | Connectorのsource/schema version、provenance/freshness、read/write policy、snapshot/cursor/event、lineage/quarantine/replay、credential参照と禁止値、stale/unknown停止 | 旧Product Data Connector Registryを実行・複製しない。現行の接続責務は個別L2接続とHELIX-CONNECTへ置く |

旧資産との対応は意味の再導出であり、旧CLI、DB、runtime、schema、testを現行実装・検証として使わない。旧source全体SHAとasset IDは[資産明細台帳](../../governance/legacy-asset-disposition.jsonl)で照合した。

## 保留する人間判断

1. L1の対象revisionをPOが確認すること。対象はHELIXLABO-L1-001〜011、特に観測sourceの許可範囲、外部知識2.0、INTELLIGENCEへの1.0/3.0材料、Benchの役割境界。
2. 各source→LABO接続、LABO→SECURITY/Worker/CONNECT/WEB-OS/Product Core接続の個別source identity・data scope・contractを確定すること。候補として個別connectorを要求するが、未定のscopeや数値閾値を本書で捏造しない。
3. HELIXLABO-L2-WEB-001..014の採否・版・LABO内のidentityを個別に判断すること。現在の候補文書を要求採択へ昇格させない。
4. RCLS-BR-001..006とHELIXOS-L2-012/013の既存候補状態・親付け替えを更新すること。本文記載のみでstatusを変更しない。

PO原文の集積対象、観測状態、episode順序、分解軸、Vector軸・操作、比較指標、system/operation条件、fallback、一般化段階、Feedback destination、minimum fields、lifecycle、15 invariantsと循環は、上記各要求と対のL11に分配して保持した。採択済み扱い・L3以降には進まない。
