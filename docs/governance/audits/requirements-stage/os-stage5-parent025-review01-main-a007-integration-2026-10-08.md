# OS Stage 5 parent 025 review01 修正後・main a007 統合追補

- 対象親: `HELIXOS-L2-025`、Stage 5のL3/L10本文。
- 修正commit: `37d74c7a29bbef783f818e21698259967c950388`。
- 最新main基点: `a00711ee8a0817cf6553b8a671a0abee54ce6e73`（#2690 OS Stage 3 parent 033 merge後）。
- 統合worktree HEAD: `da4104a869943e2cfb5156d9c0e7ba3e1514733d`。
- review01原文: PR #2692 comment `6046586065`。本文UTF-8 4,641 bytes、SHA-256 `6fc40e3e9fb50516a01d48ce921658f8db298a7c720cd7546e7f5c242571fad8`。
- 本追補でいう「Root」は**作成側検収担当**を表す役割名であり、独立review担当、PO、L3承認者を意味しない。先行する統合MDは時点記録としてbyte不変に保ち、この追補が「Root」の語義を明確にする。

## 固定根拠と版の区別

review01が指した採択済み親本文は `f6dad2a33e24f000b87d7f09b8d40288257e74cc` の次の箇所である。

- L2 `docs/helix-os/L2-requirements/governance-requirements.md:742–751`。全体SHA-256 `c92d3c052884c05fbbba89fc86f6e6e0c576846e87073327fb0917e32a1747cf`、raw LF span SHA-256 `b7166f6399db9a0f1d3a9db76977ec4ec0f1e7f708503ccc42beea0ec97121e1`。
- L11 `docs/helix-os/L11-acceptance/governance-acceptance.md:394–400`。全体SHA-256 `925e06cd08056d9569dd31703d7f76e5be59b34f85980646c733367af5edd680`、raw LF span SHA-256 `d21d7708fe09cbee17d37ad66444d99631f16e2c8198924da9b608a1117eda18`。

要求確定checkpoint `633bf12ea8f948db8ba3d6600179c4a9507377a7` は採択親本文の取得revisionと区別する。PO判断 `docs/governance/decisions/helix-os-requirements-po-decision-2026-09-28.md` は同checkpointで全体SHA-256 `5f54e68009fe291853d2d55df241e8220cfdd93eadd1b2a203bb126596b321da`、該当45–48行のraw span SHA-256 `ceb82a2a8174197bf5df3f3e918e2af1d452958354579ddc28e3b67f40031c7a`。採択register `docs/governance/management-provisional-requirement-register.jsonl` は全体SHA-256 `e7dc1180361869379966fb33f4ab263cabdfe1137ceea32dedc2b6edfea388d1`、line 59 SHA-256 `c7907da917d87aaf38e06f5d81a97906ab226b958956967dae151f2a392c2e69`。

旧source `archive/legacy-generation-2026-09-14/root/docs/process/forward/L00-L06-design-phase.md:148–169` はrevision `4084ab11560dc19e5c7bf74ae6df7adcd0e2e9c0`、全体SHA-256 `9f8fc48a087fa9ba6e629518fb376630d7863491d2f85be96a8b3fd0c6d2efc3`、raw LF span SHA-256 `b1875f9b1ba51be0d5f7509993c521b6db7ab4990612dbaf6f69111475c6fb52`。ここから旧L3/L10の対構造を形式比較し、025の業務意味は上記固定L2/L11から再導出している。

## review01 Minorへの対応

- Minor 1: CASE-OS-L10-025-050に `project A=project:campaign-site@r3`、`project B=project:data-migration@r8` を明示した。HELIX-selfを含むCASE-050の正常値は維持した。
- Minor 2: CASE-051〜057の各期待欄へ、trace未完、composite未完、HELIX-self/project A/他projectの成立状態と未完義務を保持することを明記した。CASE-056の欠落LABO評価はLABOの既存source ownerへ、CASE-057の欠落OS還流はOSの既存source ownerへ戻す。L1-011/012のLABO移管をOSへ戻さない既存境界もCASE-056に明記した。
- Minor 4: 本追補で「Root=作成側検収担当」と定義した。既存のmain049統合記録は変更していない。
- Minor 3のproject A単独欠落CASEは任意所見であり、追加していない。新しいID、owner、schema、gate、閾値、親意味は追加していない。

review01の対象HEAD `4a637324935fa03456dffef636ee7180493aaa90` からCASE-050〜057を修正した後、#2690の最新mainを統合した。main統合差分では6本文にOS-033の既存修正が加わっている。CASE-050〜057とその期待値は統合後も残り、単独欠落fixtureの意味と戻し先に変更はない。各文書の最終SHA-256とbyte数は隣接JSONに記録した。

## 時点記録・検証限界

- 旧repair auditとmain049 integration MD/JSONは、review01 HEAD時点からbyte不変である。各SHA-256は隣接JSONに固定した。
- review01は当時のHEAD `4a637324935fa03456dffef636ee7180493aaa90` を対象とし、その後本文修正と#2690統合が入った。このため同reviewのOpus/Fable所見を、統合後の6本文への承認や承認照合として継承しない。現6本文は独立再reviewと現revisionの委任条件照合を要する。
- CASE定義の静的確認では、025 fixture ID 50件が一意、CASE-050がA/Bを含む正常例、CASE-051〜057がproject Bの7段の各一段を欠く個別negativeであることを確認した。CASE-051〜057の期待欄はcomposite未完、既成立状態、未完義務の保持を明記し、056/057の戻し先も確認した。
- 統合後の静的検証は `scfctl validate` 147/0、`scfctl stale` 0、JSON parse成功、`git diff --check` clean。runtime、fixture実行、旧CLI/test/CI、L10実行は行わない。
- 本追補は監査記録であり、L3承認、PO事後確認、実装admission、L10の実行結果を生成しない。

機械可読の本文SHA、fixed source、正式comment、旧監査のbyte pinは同名JSONに記録する。
