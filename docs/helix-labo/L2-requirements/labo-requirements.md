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

番号043〜049は、起草時に個別接続011〜042と構成体050以降の番号帯を分けた結果の未使用番号である。予約・要求の省略・延期ではなく、欠番から要求を生成しない。後から分離した054（Bench接続）と055（Bench単体）はidentityを維持する。

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

### HELIXLABO-L2-056 — 初回Worker結果のBench観測取込（単体候補、1.0）

- **PO起点**：[補強原文](../../helix-os/sources/body-reinforcement-po-original-2026-09-27.md)の第1点、[判断記録](../../governance/decisions/body-reinforcement-po-decisions-2026-09-27.md)。
- **親L1**：自機構primary parentはHELIXLABO-L1-011。接続contextはHELIXOS-L1-003、HELIXINTELLIGENCE-L1-010。
- **関係**：HELIXLABO-L2-055のWorker履歴からtask/model class別水準を生成する能力を補強する単体候補。観測取込は既存L2-028、Bench生成は055、INTELLIGENCEへの受渡しは054が所有し、本候補は配置・指定・割当・許可判定を重複所有しない。
- **入力**：OS assignment/ticket/task identity、Worker identityと実行契約revision、要求revisionとscope、attemptの成功/失敗/拒否/中断/unknown、予算・期限・検証状態、人確認、source/data-use classification、結果receipt。
- **提供**：評価履歴ゼロから届く許可済みWorker結果を、source・scope・revisionを保ったobservationとしてBench履歴へ追加し、評価前の状態を明示する。
- **保証**：初回実績は「観測済み」と「性能評価済み」を区別する。受入可能な結果でも一件を根拠に未知taskの成功を保証しない。評価済み状態を生成する場合は採用した評価oracle/基準のrevision、対象task/model classとscope、判定根拠、比較条件、結果・失敗/反例・unknownをreceiptに記録し、そのoracleが対象範囲を判定できる時だけ範囲を限定して評価済みにする。oracle、scope、判定根拠のいずれかが未提示・不明なら未評価/評価不能を維持する。失敗、拒否、停止、unknownも同一履歴へ状態を偽らず記録する。sourceのauthority・stateは書き換えない。LABOは結果からassignmentまたはWorker適格化を行わない。
- **単独成立の依存**：HELIXLABO-L2-001／028／055、OS assignment/evidence、該当するSECURITY data-use許可。HELIXLABO-L2-054は別の接続identityとして参照する。
- **失敗時の戻し先／未完義務**：assignment/source/scope不足はOS、許可/classification不足はSECURITY、結果/revision欠落はWorkerまたはOS、評価可能性不足は未評価状態のままBenchへ戻す。重複・矛盾・staleは自動統合せず訂正追跡へ戻す。
- **束ねる既存条件**：HELIXLABO-L2-001／028／055、およびRLO-FR-040の未評価明示、scoreによる権限非変更。新しい評価閾値やprovider固定を設けない。

### HELIXLABO-L2-057 — 初回実行結果のBench受領接続（接続候補、1.0）

- **PO起点**：[補強原文](../../helix-os/sources/body-reinforcement-po-original-2026-09-27.md)の第1点、[判断記録](../../governance/decisions/body-reinforcement-po-decisions-2026-09-27.md)。
- **親L1**：自機構primary parentはHELIXLABO-L1-001、HELIXLABO-L1-011。接続contextはHELIXOS-L1-003、HELIXOS-L1-006。
- **関係**：OS-L2-018/019/023の既存assignment・実行記録・handoff結果から、LABOの許可観測・Worker履歴へ渡す接続候補。HELIXOS-L2-027は当該runで使った構成candidateのprovenance参照欄に留め、dependencyにしない（027→057→027の循環を作らない）。LABOの観測受取は既存L2-028、集計は055、INTELLIGENCE受渡しは054に残し、責務を重複させない。
- **入力**：OSが受領したexact ticket/task/assignment/attempt identity、要求/Worker/契約revision、scope、result state、verification/human-confirmation receipt、data-use class。
- **提供**：同一identity/scopeの結果をHELIXLABO-L2-028へ渡し、LABO-056/055が履歴化・評価できる状態を作る。
- **保証**：connectionは受渡しとreceiptだけを担い、OS authorityやWorker結果を生成・修正せず、結果状態・scope・revision・未完義務を保つ。配送失敗は未受領として残す。観測受領はBench水準・評価済み判定や配置資格を生成しない。
- **単独成立の依存**：OS-L2-018／019／023のsource resultとreceipt、LABO-L2-001／028／056の受領条件、SECURITYのdata-use条件。HELIXOS-L2-027は任意のprovenance参照であり必須依存ではない。受渡しは採択済みHELIX-CONNECT契約、または同一のsource identity・revision・schema/contract version・scopeを照合し、acknowledgment、trace、重複抑止、stale時停止、失敗時の同一ID再送/未完保持を備えた明示的な人手receiptで成立させる。いずれの方式でも同一義務を満たす証拠がなければ未成立とする。
- **失敗時の戻し先／未完義務**：source/送達不一致はOSへ、受領schema/classification不一致はLABOまたはSECURITYへ返す。再送で二重観測を作らず、欠落receiptを保持する。
- **束ねる既存条件**：LABO-L2-028のWorker入力、055の履歴集計、054のINTELLIGENCE受渡しとは別のOS→LABO辺。接続契約不在を推測実装で埋めず、未解決として示す。

### HELIXLABO-L2-058 — 観測集積の入力元ごとの依存条件（単体追補候補、1.0）

- **親L1**：HELIXLABO-L1-001。既存HELIXLABO-L2-001の集積能力に適用する依存区分の追補候補であり、新しい集積エンジンを作らない。現行L1/L2の採択状態は変えない。
- **起点**：[PO補強原文](../../helix-os/sources/body-reinforcement-po-original-2026-09-27.md)の第2点、HARNESS-L2-010／011とその依存区分追補候補HARNESS-L2-023。旧FRS-R-06の必要な依存欠落・暗黙包含拒否、FRS-R-13／14の安全閉包・不明時停止を保持し、対応能力全体と個別呼出しの必須入力を分離する意味の再導出である。旧資産の具体位置・digestはG10依存監査に記録する。旧実装・runtimeは利用しない。
- **受け取るもの**：集積対象scopeと選択source identity、操作、source/契約版、観測の利用許可、source別入力接続、既存001の観測状態・provenance・最低項目の契約。選択の根拠と未選択sourceも表示する。
- **提供するもの**：その呼出しに必要なsource別接続と安全・版条件を照合したLABO observation、未観測の入力元、受領失敗・不足の理由。元の001の観測本文・責務・出力項目を変更しない。
- **常時必須**：LABO001のprovenance、source identity/revision、状態区分、対象scope、適用するdata-use/authority、契約版、source正本を変更しない条件。入力元を選ばないことを、権限不明なデータの取込許可へ変えない。
- **選択した入力元に応じて必須**：001に列挙されたL2-021〜030は、当該呼出しが受け取る各sourceに対応する接続を要求する。例えばWorker観測のみならL2-028の入力・受領契約とその安全依存を必要とし、入力に含まれないBRAIN等の別source接続の稼働は当該呼出しの成立条件にしない。複数sourceを選べばその全部に対応する接続・許可・依存閉包を要求する。selected sourceの欠落を「未選択」へ変えて成功にしない。
- **特定操作時のみ必須**：Web/WEB-OS観測を加える操作では、既存L2-031／032に記したsource contractの採択と該当接続・安全条件を満たす。Webを選ばないLABO 1.0の呼出しへWeb実運用を前提にしない。2.0の外部取得入力は既存L2-033の版範囲に従い、1.0へ無断追加しない。
- **参照のみ**：全sourceに対応する1.0要求範囲の一覧、未選択sourceの契約説明、旧資産の比較資料は、個別呼出しの実行サービス依存ではない。ただし一覧にある1.0対象能力の完成義務は保持し、個別呼出しで不要という理由で削除・延期しない。
- **保証・失敗時**：未選択または未接続のsourceは未観測を保持し、成功・観測済みへ変換しない。選択sourceのversion/scope/許可/receiptが不足・不一致ならその入力の成立を拒みsource owner／SECURITYへ戻す。選択条件自体がunknownなら全部不要とせず呼出し条件の確認へ戻す。観測集積の成功をBench評価済み、割当許可、全source対応完成にしない。
- **単独成立の依存**：既存HELIXLABO-L2-001の契約本文、HARNESS-L2-010／011／023の依存区分契約、選択sourceの入力接続とその安全・版条件。この追補自身を001の実行前提に再帰的に要求せず、001の利用条件を補う。実契約版は採択後に入力へ束縛し、`version_target: 1.0`を実装版・採択状態と混同しない。

### HELIXLABO-L2-059 効果優先関係付き比較評価

**kind / parent / status**：unit、HELIXLABO-L1-005 primary、HELIXLABO-L1-011 context、version_target 1.0、draft_candidate。既存HELIXLABO-L2-006/055を補強する候補であり、親revisionの確認・要求採択・実験実行許可を生成しない。

- **受け取るもの**：同一のtask/work scope、要求・受入・quality oracleとそのrevision、対象期間、実験条件（baseline/current/candidate/hybrid）の各構成と版、task snapshot・scorer・run protocol・hardware/toolchain class、HELIX支援cohort（HELIXなし／historical旧版／新版）と各cohortの機構構成、許可されたOS assignment/実行receipt、Worker/model/effort別のresult、failure・retry・救援・再作業・人修正・review・CI等の実測、価格source/currency/effective time。cohort軸と実験条件軸は別属性として保持し、各cohortで実施した条件の対応を事前に定める。評価運転側のOS assignmentと、比較対象の仕事にHELIX支援があるかを区別する。現行の実験運転は既存LABO-L2-006のOS割当Worker責務に従うが、HELIXなしcohortの対象作業へHELIXの要求形成・計画・実装・review等の支援を混ぜない。共通の評価運転の費用・時間と対象作業の費用・時間を測定scopeに従い区分し、計測都合で片側だけ除外しない。歴史runは当時の実行者・authority・receiptをそのまま保持し、現在OSのassignmentを遡及生成しない。対象scope/revisionに有効な既決の必須品質、総費用・完了時間・人間介入の優先順または部分順、許容する悪化・禁止する劣化、判断者・根拠・適用期間を受け取る。有効な決定をrunごとに再確認させず、同じ適用範囲内で再利用する。scope/revisionが決定の適用境界を越えた変更、決定の失効、または未決の場合にだけ該当owner判断へ戻す。
- **提供するもの**：HELIX支援cohortごと、かつ対応づけた実験条件ごとの品質判定と違反、task受入oracleに結びつく結果、費用内訳、end-to-end elapsed time、worker/model effortと人間介入量、救援/retry/reworkを含む結果、欠測・未価格化項目・比較不能の範囲、優先関係ごとの比較結果、counterexample/uncertainty、継続比較または判断待ちの候補。入力された選好に沿う結論が導けない場合は「同順位/判定不能/要人判断」を返し、万能ランキングを出さない。
- **比較優先規則**：まず要求/受入oracleで必要品質とhard constraintsを満たすか個別判定し、品質不成立を安さや速度で相殺しない。品質を満たさないrunは「効果達成」の候補ではなく、失敗・trade-offとして報告する。品質を満たした候補間だけで、対象scope/revisionに有効な既決の目的優先関係と許容悪化を適用する。毎runの確認を新設しない。適用可能な決定がない、失効した、またはscope/revision変更がその境界を越えた場合に限り該当ownerへ戻す。priorityとtoleranceが欠ける指標は勝手に0、無制限、または最小化対象と解釈しない。
- **総費用**：provider/API/tokenだけでなく、Worker/parent effort、再試行、CI/rerun、review、上位Workerによる救援、統合、rollback/recovery、accepted changeに至る再作業、人の調査・修正・検証など実験範囲に含まれる資源をrun receiptから集計する。課金額には価格source・currency・effective timestamp・subscription/API-equivalent classを付ける。人間時間は実数量（time/interaction等）で費用金額と別掲し、POが承認した換算率がなければ費用総額へ0円として含めず「非貨幣化のhuman effortが残るため金額総額は不完全」とする。accepted change数0、未完run、missing costは低費用成功へ変換しない。
- **完了時間・介入量**：受入可能な結果に達するまでのwall-clock durationを開始/終了event・停止・待ち時間規則とともに示す。人間介入量は人が行った回数・実時間・介入種別等、入力scopeで採用した測り方を示し、人の救援・調査・修正・確認を含める。親・救援Workerの稼働はWorker effort/費用として別掲し、AIの稼働回数を人間介入回数へ混ぜない。定義/receiptの違うdurationや介入を黙って比較しない。
- **effort選択との接続**：LABOは同じtask class、snapshot、scope、quality oracle、run protocol下のeffort別実績を比較材料として返す。INTELLIGENCE-L2-010がtask scopeの優先入力とLABO evidenceを使うとき、候補Worker/model classとeffortの根拠をまとめて提案できる。LABOはeffortやWorkerを選ばず、INTELLIGENCEは実assignmentをしない。Bench evidenceが未評価なら未評価のまま候補を保留/表示し、旧RLO-FR-040の`provider_default_unbenchmarked`意味を保持する。assignment/進行/許可はOSの既存責務。
- **比較軸の独立性とHELIXなし／旧版／新版比較**：LABO-L2-006の実験条件（baseline/current/candidate/hybrid）は「何を試すか」の軸、HELIX支援cohort（HELIXなし／旧HELIX version／新HELIX version）は「どの支援構成で同じtaskを行うか」の軸とし、別のrun fieldとして記録する。各cohortにどの実験条件を適用し同じtask/scope/quality oracle・scorer・run protocol・hardware/toolchain条件の結果を対にするか、比較前に固定する。hybridはcohort種別ではなく実験条件であり、HELIX支援が一部残るno-Harness条件はHELIXなしcohortにしない。比較目的とその主張に必要な対照群を先に選ぶ。導入効果はHELIXあり／なし、改訂効果は旧版／新版、三者の関係を主張する場合だけHELIXなし／旧版／新版の三cohortを対象とする。選択した群について同じtask/scope/quality oracleと比較可能なscorer・run protocol・hardware/toolchain条件を揃える。未選択群は未測定・対象外として示し、別の比較目的の成立を主張しない。旧runtime/CLI/hook/CIを起動しないことは別の作業境界であり、旧版を選んだ比較の証拠条件を取り除かない。本要求整理で旧版の比較材料を読む場合は、保存済みの版・task・protocolに束縛されたhistorical resultに限定する。各cohortはHARNESSだけでなくOS・INTELLIGENCE等を含むHELIX支援の有無と構成を明示し、「no-Harness」だが他のHELIX支援が残る条件を「HELIXなし」と同一視しない。選択した比較群が同条件でない、または必要な証拠がない場合は、その比較を「未測定/比較不能」と記録する。三者の関係を評価する証拠が不足していても、目的を限定した二者の必要条件が揃えばその効果は評価できる。二者比較を三者比較の完了へ拡張しない。archive runtimeの起動禁止を理由に比較を達成済みにしたり、再実行を偽装したりしない。
- **依存・版**：LABO-L2-006実験条件/OS assignment receipt、LABO-L2-028 observation、LABO-L2-055のtask/model class evidence。LABO-059の一般評価結果をINTELLIGENCEへ渡す場合は既存LABO-L2-035/052→HELIXINTELLIGENCE-L2-034の評価材料経路を使い、HELIXLABO-L2-054はBench作業水準の別受渡しが必要な場合に限る。採用するHARNESS-L2-010/011 common contractの実版、HARNESS-L2-022の受入oracle/段階結果、INTELLIGENCE-L2-010/011のproposal/comparison contract。task, source, requirement, acceptance, artifact, worker/model/effort, run protocol, scorer, oracle, price sourceのrevision/version/digestを保持する。HARNESS-L2-010/011およびLABO-006/055の依存は入力証拠として使い、同一能力を複製しない。
- **保証と限界**：scope内の証拠に支持される比較のみ提供し、品質に適合する候補集合の中で選択入力に従う結果を示す。model/providerの固定優位、未見taskへの一般化、HELIX自体の採否、最適配置、金額総額の完全性を保証しない。LABO評価は提案/evidenceであり、優先値の決定、targetの変更、登録/routing、割当、ticket起票、権限・merge authorityを変更しない。
- **戻し先**：task/scope/assignment/result/receipt欠落はOSまたは観測sourceへ、price/effort/worker performance/適用範囲不足はLABO-055または該当sourceへ、placement proposal不足はINTELLIGENCE-010へ、model capability comparison不足はINTELLIGENCE-011へ、quality/acceptance oracleの不明はHARNESS/要求ownerへ返す。優先順・許容悪化・人時間の換算が未決なら人の判断待ちとして候補を閉じない。


**起点と旧資産**：[PO補強原文](../../helix-os/sources/body-reinforcement-po-original-2026-09-27.md)第5項、[判断記録](../../governance/decisions/body-reinforcement-po-decisions-2026-09-27.md)。旧Bench R-03〜08 / AC-003〜014の同条件比較・oracle/receipt・失敗保持・再試行込み費用・価格provenanceを保持し、作業範囲ごとの優先入力、救援と人修正込み評価を再導出する。requirementsは `LEGACY-ASSET-28FB139B26CD61CC51EE`、`archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/helix-bench-evaluation.md:76-147`、SHA-256 `a1a5fea1fb89434fb025a9c0541f5cacb10ac9be66e97e7e7964975d2469b116`。acceptanceは `LEGACY-ASSET-A952A3A175EB82A4781B`、`archive/legacy-generation-2026-09-14/root/docs/test-design/helix/helix-bench-evaluation-acceptance.md:30-41`、SHA-256 `6b5a72da16fe56130350b6e8b8fc2606cb8c90015ff73f34ffb3b93625a0c185`。旧RLO-FR-040 / AC-030のtask-class別effort、未評価表示、scoreから権限を生成しない意味も保持する（既存G9判断記録のasset/path/digest参照）。固定schema/provider・旧runtime・根拠のない数値は導入しない。旧no-Harness軸と今回のHELIXなし条件の違いを残し、他のHELIX支援があるrunをHELIXなしへ丸めない。

**人の判断が残る点**
- **原文要求**：必要qualityを満たすことを前提に、作業scopeごとの総費用・completion time・human interventionの優先と許容悪化を与える。原文は「HELIXなし／旧版／新版などの比較から効果を確認する」。目的に応じた比較群を選び、archive runtimeを起動せず、選択した比較に必要なevidenceが得られない部分を比較不足として残す。固定numeric target、public rankingは不要。
- **選択肢候補**：①quality gateを先にして費用優先、②quality gateを先にして時間優先、③quality gateを先にして人介入優先、④scope固有の順序/部分順/許容条件を指定。いずれも必要qualityはtrade-off対象外。
- **推奨提示**：一律defaultも毎runの人間確認も置かない。対象scope/revisionに有効な決定があれば再利用し、その根拠と適用境界を保持する。未決・失効・境界を越えるscope/revision変更の場合に限って該当ownerへ提示する。
- **影響**：適用可能な選択がない間、集計値は提示できても「何を改善と選ぶか」は未決。human timeの換算率がなければtime quantityとmonetary chargesを別掲し、完全なtotal costと主張しない。旧版を選んだ比較にevidenceがないなら、その比較の欠落を表示する。
- **scope**：値はPOが対象scope・version・quality oracle・有効期間ごとに決める。有効な決定は適用境界内で再利用し、新しいrunごとの再確認を求めない。境界外変更・失効・未決時はownerへ戻す。あるproject/cohortでの優先や効果を別scopeへ一般化しない。

### HELIXLABO-L2-060 Worker支援有無の同一設定比較（単体候補、1.0）

- **PO起点**：[補強原文](../../helix-harness/sources/capability-reinforcement-po-original-2026-09-27.md)第5項、[判断記録](../../governance/decisions/worker-support-derivation-2026-09-27.md)。
- **親L1**：HELIXLABO-L1-005 primary、HELIXLABO-L1-011 context。比較評価とWorker水準の境界に接続する。
- **関係**：同じ軽量Worker/model/provider/version/effort設定、同じtask/scope/oracleの下で、作業中支援の有無だけを変えた結果を比較する単体能力。支援がどれほど有用だったかの評価であり、支援経路を実行・割当する能力ではない。G13のHELIXLABO-L2-059が定めるtask/effect comparisonと全費用、人介入の比較原則を使い、評価内容を重複所有しない。
- **受け取るもの**：同一のtask snapshot・要求/設計revision/scope・HARNESS quality oracle revision・環境/toolchain/run protocol、同一のWorker/model identityとmodel/provider/version/effort設定、支援有無の対応runとOS assignment/result receipt、使われた設計/code/failure/knowledge source・INTELLIGENCE proposalとOS handoff、全runの成功/失敗/unknown、retry/rework/review/CI、上位Worker・相談者・人の介入時間と実費、価格source/currency/effective time、比較不能/欠測情報。
- **提供するもの**：品質gate結果、同一設定に対する支援有無別のaccepted outcome、再作業・失敗・所要時間・費用、上位Worker/model救援・追加実行・人の相談/調査/修正/確認を含むeffortとcost、欠測・比較可能範囲・unknownを示すtask class/scope限定の評価材料。採用・割当・配置水準は決めない。
- **保証すること**：両群で変える要因は対象支援経路の利用有無のみ。元Worker/model/provider/version/effort、task scope、oracle、実験条件、toolchainと結果の計測規則が異なる場合は同条件と主張しない。必要qualityを費用/速度で相殺しない。支援側に上位Worker、別model/provider利用、相談、再試行、CI/review、人手修正があれば、対応する時間・費用と人介入をscope内に含める。価格換算が不明な人時間は量を報告し、0円としない。評価結果はINTELLIGENCE/OSへの材料に限り、LABOはWorkerを割当/実行しない。
- **常時必須**：task/scope/対象revision、同一のmodel/provider/version/effort設定、開始前に固定したHARNESS-L2-022 quality/acceptance oracle契約、OS assignment、比較条件・支援有無のsource/evidence、計測した費用/人介入・欠測範囲。assignmentとoracle契約は入力、OS result receiptsとoracle実行結果は各run後の比較観測である。片方の結果receiptや適用可能なoracle契約がない場合は比較成立を主張しない。
- **操作時必須**：新しい比較runを行う場合は支援あり/なし双方の対応可能runについてOS assignmentと必要なSECURITY許可があり、HARNESS oracleと計測条件を先に固定する。既存historyを使う場合は当時のsource/authority/model/provider/version/scope/receiptを保持する。測定の実行、修正、相談をLABOが開始しない。
- **選択入力時必須**：支援側で実際に選択・使用したpacket/source/相談/分解/修正指示と支援者のidentity/version/effortを、そのrunへ記録する。なし群へ支援用contextや専門家助言が漏れた場合はなし群としない。未選択の支援経路は当該比較の実行依存ではない。
- **参照のみ**：今回比較しない支援候補、未選択source、一般的な効果説明は背景参照に限る。比較対象に選択したsource、品質条件、救援・人作業・費用の実績は参照のみへ落とさない。
- **版・単独成立の依存**：`version_target: 1.0`（候補能力の版印）。v0.1等の段階収載有無は別判断で、本候補は決めない。HELIXLABO-L2-001／HELIXLABO-L2-006／HELIXLABO-L2-028／HELIXLABO-L2-055、既存HELIXLABO-L2-059の比較原則、HELIXOS-L2-018／HELIXOS-L2-019／HELIXOS-L2-023 assignment/result, HARNESS-L2-022 oracle、HELIXINTELLIGENCE-L2-068の支援sourceと利用証拠、SECURITY data-use/実行許可を使う。HELIXOS-L2-028の相談receiptは実相談を選択したrunだけに必要で、事前test/指示だけの支援比較には要求しない。HELIXOS-L2-029は支援往復まで成立したcompositeの結果を評価対象に選ぶ場合のsourceであり、評価単体の常時依存ではない。
- **失敗時の戻し先／未完義務**：task/run receiptはOS、支援proposal/利用証拠はINTELLIGENCE/OS、oracleはHARNESS/requirement owner、data-useはSECURITY、comparison scope/evaluation capabilityはLABOへ戻す。片群欠落、異なるmodel/provider/version/effort、scope/oracle差、救援/人的費用欠落、stale evidenceは未評価/比較不能に保ち、未完理由を記録する。固定試行数や性能閾値は設けない。
- **束ねる既存条件**：HELIXLABO-L2-001／HELIXLABO-L2-006／HELIXLABO-L2-028／HELIXLABO-L2-055／HELIXLABO-L2-059およびHELIXINTELLIGENCE-L1-018／HELIXINTELLIGENCE-L1-010、HELIXOS-L2-018/HELIXOS-L2-019/HELIXOS-L2-023、HARNESS-L2-022。G13の総費用とquality-firstの比較意味を保持し、支援有無だけを比較因子に追加する。

### HELIXLABO-L2-061 比較評価のtask・oracle隔離と履歴の完全性（単体追補候補、1.0）

- **親・状態**：HELIXLABO-L1-005 primary／HELIXLABO-L1-011 context。`version_target: 1.0`、未採択の追補候補。既存059の比較評価における入力の完全性を補う。同じ評価エンジンを新設せず、採択済み059の固定revisionへ本追補の採択を遡及しない。
- **入力**：比較目的と選択群、適用するtask契約、task／fixture／oracle／protocol／scorerのidentity・version・digest、実際にWorkerへ提示したcontextの参照と可視範囲、benchmark authorと評価judgeのidentity・session・context境界、実行者・権限・run receiptを受け取る。secret等の生値を監査記録へ複写しない。hidden oracle利用の有無と根拠はtask契約から読み、不明を「利用なし」にしない。
- **提供**：比較scope内の各runについてtaskと判定根拠の対応、情報漏洩・版不一致・役割混同の有無、比較に使用可能な範囲と不成立理由を返す。既存059の品質・効果判定へ入力するもので、scoreやreceiptからWorker割当・資格・権限を生成しない。
- **task snapshot**：旧Bench R04を用いるtask比較の候補では、task ID、task version、fixture digest、requirement IDs、acceptance IDs、base HEAD、allowed paths、forbidden paths、hidden oracle digest、seed、toolchain versions、timeout policy、retry policy、cache policy、hardware classの15条件をそれぞれ識別できるsnapshotへ束縛する。値・対象範囲・版の不明は比較不足として返す。旧schemaの文字列名やruntimeを実装方式として要求せず、条件を失わない対応をL3へ渡す。hidden oracleを用いない別の比較では適用するtask契約と非適用理由を記録し、欠落を非適用へ置き換えない。
- **情報隔離**：public task／fixtureとhidden oracleを別の可視範囲へ置く。hidden oracleをWorker contextへ渡さず、future answer、secret、PII、private review contextをWorker-visible fixtureへ入れない。hidden値を含む派生説明・添付からの漏洩も同じ境界で扱う。情報分類と取込許可は既存SECURITY契約に従う。実際に渡したcontextを検証できない場合は隔離済みと推定しない。
- **独立評価**：benchmark authorとblind judgeを分離し、同一作成contextを独立評価と扱わない。identity・session・contextの分離根拠と、judgeに与えたtask・oracleの版を評価receiptへ結ぶ。judgeに判定用oracleを与えることとWorkerへの答え漏洩を区別する。LABOがWorkerを起動・割当したり、入力receiptからjudge任命の権限を作ったりしない。
- **版と不成立の扱い**：task／fixture／oracle／protocol／scorerのversion・digestを照合し、異なる版を同じ比較へ混ぜない。漏洩、版不一致、author／judge混同のrunは有効な比較・qualification evidenceに用いず、不成立理由と元receiptを保全する。失敗を削除したり、平均点・安さ・速度で相殺したりしない。historical resultは当時のmodel／runtime／version、toolchain、task snapshot、実行者と権限の証拠として保持し、current性能や現行assignmentを遡及生成しない。
- **依存と適用範囲**：常時必須は対象runのsource・revision・scope・完全性を確かめる証拠と059の比較規則。hidden oracle利用時は当該oracleの隔離とblind評価の証拠を必須にする。使用した観測入力元とその安全条件のみを実行依存とし、未選択taskや旧portfolioは参照のみ。055の通常Worker履歴すべてへhidden task・blind judge・15項目snapshotを一律に課さない。059/060で当該task比較を選んだ範囲に適用する。
- **失敗時**：task／oracleの不明・不一致はtask／oracle ownerへ、漏洩は入力元とSECURITYへ、実行context・assignment証拠不足は実行主体へ戻す。LABOは比較不能範囲と未完の再評価義務を保持し、配送・登録成功を情報隔離の成功へ変換しない。
- **旧source**：`LEGACY-ASSET-28FB139B26CD61CC51EE`、`archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/helix-bench-evaluation.md:96-120,143-147`（SHA-256 `a1a5fea1fb89434fb025a9c0541f5cacb10ac9be66e97e7e7964975d2469b116`）のR04/R08、`LEGACY-ASSET-A952A3A175EB82A4781B`、`archive/legacy-generation-2026-09-14/root/docs/test-design/helix/helix-bench-evaluation-acceptance.md:32-33,39-40`（SHA-256 `6b5a72da16fe56130350b6e8b8fc2606cb8c90015ff73f34ffb3b93625a0c185`）のAC005/006/012/013を意味再導出する。旧文書はdraft候補であり自動採択しない。全旧BenchやREG-06の被覆完了ではなく、この選定条件のみの追補である。

### HELIXLABO-L2-062 外部調査の主張と原文箇所の照合（単体追補候補、2.0）

- **親・状態**：HELIXLABO-L1-009。`version_target: 2.0`、未採択の追補候補。033/051で受け取る外部sourceの評価を具体化する。内部観測の1.0循環に外部検索を必須化せず、既決の候補採用や外部取得・実行の許可を継承しない。
- **入力**：取得済み外部検索・公式文書・OSS等のsource identity、URL、公開日、版/revision、取得時点・取得範囲と由来、そこから導く個別の主張、根拠となる原文箇所を受け取る。URLだけを内容の証拠とせず、同じ版の原文を特定できる引用箇所（span locator）と本文を照合できることを要する。取得・参照に必要な既存の許可と制約は保持し、ここから追加権限を生成しない。
- **提供・保証**：調査成果に主張ごとの出典・対象版・支持箇所・照合結果・不明点を保存する。原文箇所がその主張を支持するかを確認し、別箇所、別版、部分的な支持、条件の欠落、反例を区別する。source全体の出所が分かるだけでは個別の主張を検証済みにしない。外部由来の設計上の主張も対象とし、引用から適用範囲を無条件に広げない。
- **不明・古い可能性への対応**：出典不明、公開日/版/箇所の欠落、取得範囲外、改版による箇所不一致、古い可能性が高く現行への適用を確認できない主張は、採用を保留し、一次資料で確かめる作業義務を出す。具体的な数値の有効期限を推測しない。作業義務は主張・source・対象版・不足条件・再確認先を保持してOSの既存登録/振り分けへ渡す。task発行やURL到達だけで検証済みに戻さない。
- **責務と依存**：033の取得source契約と該当個別connector、LABOの分解・比較・評価、051の外部知識評価循環へ接続する。外部情報の取得主体とLABOの意味照合、BRAINへの汎用構造候補の採否、OSの作業登録を分ける。検証済み主張であっても051の分解・比較・実験を省いてBRAINへ直接採用しない。外部テキストを命令へ昇格させない。
- **失敗時の戻し先／未完義務**：source identity・取得不足は取得主体へ、主張と箇所の不一致はLABOの評価へ戻し、一次検証義務と採用保留を引き継ぐ。原文が読めない場合に別版や要約で補って成功としない。対象revision変更時は当該主張の根拠を再照合し、過去結果と現在の未検証状態を分けて保持する。
- **旧sourceとの対応**：`LEGACY-ASSET-EE5DBACC7F28F7D1F605` の旧 `docs/design/helix/L3-requirements/pillar-functional-requirements.md`、HR-FR-P8-01とHAC-P8-01a/b。`PREISO-REV-000013`のbaseline `6fabd12512a3659fff4a956692cdd61faeeb16ce`（162/252/253行、file SHA-256 `665dbbfc09ac27369c102ad1963f03cab16e44bb57cd80e0efe1e89dc6325393`）とpre-isolation `2d4991042be55268bac30a8bbcdac45b3865030a`（168/261/262行、file SHA-256 `7b49652eb96f73efc903a462264962ab1811819eee76a3fd952d1a1e03af6544`）を別入力として保持する。該当3条件の原文bytesは一致するが、文書全体の同等性は推定しない。source attribution、span照合、URL/公開日/版、出典不明・陳腐化時の採用保留と一次検証義務を現行LABO/OS責務へ再導出する。旧L3層名や旧runtimeを現行実装にコピーしない。

### HELIXLABO-L2-063 修復手順の再発評価と予防候補への還流（構成体追補候補、1.0）

- **親・状態**：HELIXLABO-L1-007／008。`version_target: 1.0`、未採択の追補候補。050の内部改善循環のうち、成功した修復の知見を保持し、同種の再発から予防候補へ返す条件を具体化する。既存の要求採用、修復の実行許可、個々の改善採否は継承しない。
- **入力**：修復対象と版、問題・原因候補・適用条件、実際の修復手順と結果証拠、検証結果、再発防止として確認できた範囲、失敗・反例を受け取る。INTELLIGENCEのrepair案、OS割当Workerの実行、HARNESSの検証、LABOの効果評価を区別し、案や単一のgreenだけを成功手順にしない。
- **記録の引継ぎ**：修復の成功と再発防止の根拠が明確になった時点で、その手順（recipe）・適用範囲・対象版・原証拠・残る義務をLABOの評価対象知識として保持し、OSの既存Feedback登録/振り分けを通じてimprovement backlogへ対応を残す。修復作業の終結だけで知見の保存や改善側への引継ぎが済んだことにしない。移管不能・登録失敗は未完義務として保持する。
- **反復の評価**：同種修復の反復を、問題・手順・適用条件・版・episodeの同一性を確認して集計する。再送・重複観測を別の成功事例へ水増しせず、異なる原因や適用条件を同じ手順の実績へ無条件に混ぜない。適用する反復閾値・観測範囲とその根拠を入力として保持し、数値をこの候補で新設しない。母集団や閾値が不明なら不明を表示し、頻出または頻出していないと断定しない。
- **提供・保証**：閾値以上の同種反復を確認した場合、gate／detectorへ予防条件を組み込む候補と、元手順・反復根拠・適用範囲・反例・検証義務を返す。未処理の頻出問題は少なくとも警告として可視化し、成功修復数だけを見せて放置を隠さない。LABO-010のFeedback契約でOSへ渡し、OSが該当HARNESS工程契約等のownerへ登録・振り分ける。候補発行・backlog登録・採用・対象変更・再検証・運用後再観測は別状態で追い、LABOがgateを直接強制しない。
- **責務・依存**：常時必要なのは許可された修復観測、LABO-009/010/050の範囲評価・Feedback・循環追跡、OSの登録/振り分け。再実験・修正を選ぶ場合だけ該当OS割当Workerと対象HARNESS検証契約を使う。過去結果を評価するだけの操作に新規修復実行を強制しない。汎用構造として評価できた場合のBRAIN向け候補と、特定問題の修復知見を区別し、後者を無条件にBRAINへ一般化しない。
- **失敗時の戻し先**：観測・対象版の欠落は提供主体へ、修復成功/再発防止の根拠不足はLABO評価へ、登録・振り分け不成立はOSへ返す。ownerによる変更や運用後観測が欠けた予防候補は循環未完のまま保持する。手順や対象契約の改版で適用条件が変わった場合は旧頻度・成功結果の適用を再評価し、古い結果から現行の有効性を生成しない。
- **旧sourceと既決の意味変更**：旧Pillar HR-FR-P4-02/HAC-P4-02a/b（`LEGACY-ASSET-EE5DBACC7F28F7D1F605`）を起点にする。`PREISO-REV-000013`のbaseline `6fabd12512a3659fff4a956692cdd61faeeb16ce`（149/230/231行）とpre-isolation `2d4991042be55268bac30a8bbcdac45b3865030a`（155/239/240行）の原文を別入力として保存し、成功手順・backlog・反復・予防候補・放置への警告を保持する。旧harness memoryへの知識保存は、[2026-09-24 PO判断](../../governance/decisions/concept-requirement-po-decisions-2026-09-24.md)「HMC-BR-003」の、知識を1.0〜2.xではLABOが評価して保持する責務へ再導出する。harness memoryを連携通知へ限定する判断を変更せず、旧Learning／Skill authorityやprovider標準memoryを復活させない。旧doctorというCLIは使わず、LABO評価とOS運転へ責務を分ける。

### HELIXLABO-L2-064 Worker比較評価の候補名遮蔽と再現条件（単体候補、1.0）
- 入力：比較対象run、元runtime/modelのidentityと版へ戻せる対応、judgeに実際に提示した資料と可視範囲、fixture/rubric/judge version/sample/retry条件。
- 提供：候補名を伏せた比較の成立範囲、固定条件の一致、情報漏洩や比較不成立の理由。評価記録の元identityを消さず、judgeへの提示と記録側の追跡を分ける。
- 保証：評価judgeへ候補runtime名を提示せず、添付や出力metadata等から候補名が漏れたrunをblind評価済みとしない。fixture/rubric/judge version/sample/retryを比較前の条件へ束縛し、途中変更を同条件比較へ混ぜない。sample/retryの数値や実装方式はここで発明しない。
- smoke成功だけで完全な適格性を主張せず、security failure、scope逸脱、検証不能出力を平均点で相殺しない。LABOの評価結果は水準・配置案の材料でありassignment/admissionは生成しない。
- 不明・漏洩・不一致を理由付きで比較不能へ戻す。元run/条件を保存し、再評価義務をtask/evaluation ownerへ引き継ぐ。未実行の通常履歴へ後付けblind済みの印を付けない。

- **親・状態**：HELIXLABO-L1-005／011、未採択追補候補。既存055/059/060/061の評価責務を補い、通常履歴集計へblindを一律必須化しない。比較実施を許可するものではない。
- **依存・戻し先**：常時は評価対象run/比較条件/証拠、比較を実施する場合だけOS assignmentとSECURITYの許可が必要。未選択taskは参照に限り、LABOはWorkerを起動しない。元identityの追跡不能は観測元、judge可視範囲や固定条件不明は評価ownerへ戻す。
- **旧source**：LEGACY-ASSET-719D5EC9C06FC4AAD0FF、`archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:215` HIL-NFR-35を起点とし、runtime名遮蔽と再現条件・相殺禁止を保持する。旧admission engineは採用せず、評価と割当権限を分離する。
