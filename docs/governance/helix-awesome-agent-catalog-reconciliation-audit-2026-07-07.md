# HELIX agent / spec orchestrator 追突 audit (2026-07-07)

本書は PO 指示に基づき、以下 11 repo と GitHub topic `agent-harness` を read-only source として取得し、HELIX の自走 AI agent 機構へ
取り込むべき capability を突合した監査記録である。個別 OSS / SaaS をそのまま導入せず、
HELIX の V モデル、gate、state DB、adapter、security 境界に従う仕組みへ変換して採用する。
外部 source は clone / refs 列挙 / blob 本文 hash の read-only 取得に限定し、外部 code 実行、
依存 install、credential 使用、secret / PII の保存、外部 API write は行わない。commit / push / main merge は
HELIX GitHub 運用ルールに従い、明示 path staging、`git status` / staged diff 確認、Conventional Commit、
必要な review / approval 境界を満たすまで実施しない。

対象:

- `bradAGI/awesome-cli-coding-agents`
- `andyrewlee/awesome-agent-orchestrators`
- `Fission-AI/OpenSpec`
- `statewright/statewright`
- `github/spec-kit`
- `AgentWrapper/agent-orchestrator`
- `first-fluke/oh-my-agent`
- `code-yeongyu/oh-my-openagent`
- `ai-boost/awesome-harness-engineering`
- `Picrew/awesome-agent-harness`
- `AutoJunjie/awesome-agent-harness`
- `https://github.com/topics/agent-harness`

## 1. 取得 refs

取得方法:

- `git ls-remote --heads --tags <repo>`
- `git ls-remote <repo> 'refs/pull/*'`
- `git clone --mirror <repo>`
- mirror 内の `refs/heads` / `refs/tags` / `refs/pull` を `for-each-ref` で count / sha256 化
- mirror 内の `refs/heads/main` file list と、`main` 非 ancestor refs の diff file list を count / sha256 化

| source | heads | tags | PR refs | main commit | main files | extra diff files |
|---|---:|---:|---:|---|---:|---:|
| `bradAGI/awesome-cli-coding-agents` | 1 | 0 | 215 | `5ac524be26cfcb2fd2864a5d379f28f278ad97a0` | README catalog | README additions |
| `andyrewlee/awesome-agent-orchestrators` | 5 | 0 | 111 | `8b83fc38f691083d64a72cbd439e58782af98c82` | README catalog | README additions |
| `Fission-AI/OpenSpec` | 201 | 39 | 842 | `5956a8e872f41a8f690922b5c9b6927970252b2a` | 917 | 3856 |
| `statewright/statewright` | 1 | 2 | 0 | `dae2dc58b6935d180e45c228735f565e3a1653bd` | 287 | 0 |
| `github/spec-kit` | 22 | 183 | 1738 | `5217206fdfde2886482541897418781f7d54aa1f` | 452 | 51173 |
| `AgentWrapper/agent-orchestrator` | 684 | 225 | 1628 | `863853e3ac8bbe04f215385da1f6cb4a3aa76477` | 932 | 3494202 |
| `first-fluke/oh-my-agent` | 7 | 492 | 566 | `220f79fc3a2a3c6da4b351c0dfa1f974f6972896` | 2530 | 2062285 |
| `code-yeongyu/oh-my-openagent` | 129 | 231 | 4000 | `fb811a5ce2f2342bcc4ed44940d4db6135b5b1d3` | 6814 | 29321328 |
| `ai-boost/awesome-harness-engineering` | 4 | 0 | 188 | `149fe19fa278045ea914686bfd520e1911ba631f` | 12 | 193 |
| `Picrew/awesome-agent-harness` | 1 | 0 | 50 | `85d6410079854334e50b2de8e8961b4ac09de1e7` | 53 | 856 |
| `AutoJunjie/awesome-agent-harness` | 3 | 0 | 40 | `1e3f26371ec1a765efe0268b1e63374bee2aaa04` | 22 | 52 |

追加 repo の refs digest は `docs/governance/helix-agent-harness-explicit-repo-refs-2026-07-07.tsv` に固定した。
digest は `2857e2f0fadaaf6366f20ca43b6e4f9b8a6686af95db0f139053bac5d3d72e26`。
追加 repo の all-ref tree diff は `--filter=blob:none` mirror から default commit と各 head / tag / PR ref の
`git diff --name-only --no-renames` を repo/ref/path 単位に sort/digest し、
`docs/governance/helix-agent-harness-explicit-repo-pr-diff-digest-2026-07-07.tsv` に固定した。
rows は header 含め 7、sha256 は
`dc21d6b232c977cf20952fd9052291209ce4dc4c8d5e2bb7de500ffd417ee19c`。6 repo すべて `status=ok`。
詳細行は最大 29,321,328 行になるため repo には格納せず、line count、unique path count、detail digest を正本証跡とする。

GitHub topic `agent-harness` は git repo ではないため refs を持たない。GitHub Search API の
`topic:agent-harness` 結果を 2026-07-07 時点で全 437 件取得し、
`docs/governance/helix-agent-harness-topic-inventory-2026-07-07.tsv` に固定した。
digest は `e9dda5923e12197775d3c2827f1cc833d6b41a60c66f72d56ff95431fef9f063`。
topic 内訳は awesome 13、harness 109、sandbox 2、skill 11、memory 4、eval 2、workflow 8、MCP 3、
security 5、Codex 5、Claude/OpenClaw 系 22、generic 253 である。

さらに topic 配下 437 repo すべてに対して、認証不要の `git ls-remote --heads --tags --refs`、
`git ls-remote <repo> 'refs/pull/*'`、raw README 取得を実行し、head/tag refs count、PR refs count、
refs digest、README digest を
`docs/governance/helix-agent-harness-topic-ref-readme-digest-2026-07-07.tsv` に固定した。
rows は header 含め 438、sha256 は
`d44089f6b17be3198d914b16c992ecf99cf314201ae92dbdbe750e339aea5a8d`。
加えて、437 repo すべての default branch を `git clone --bare --filter=blob:none --single-branch` で取得し、
file tree count と tree digest を
`docs/governance/helix-agent-harness-topic-tree-digest-2026-07-07.tsv` に固定した。
rows は header 含め 438、sha256 は
`4ed449c22cf2d5e1811ccbfe3fcc0a102be8cd5b89feba4a5af805d976374c65`。437 repo すべて `tree_status=ok`。
README 本文は keyword classifier で 22 family へ機械分類し、
`docs/governance/helix-agent-harness-topic-readme-capability-map-2026-07-07.tsv` に固定した。
rows は header 含め 438、sha256 は
`12db850f6a9d83a64c99845b9769bcdf278d7ff22da07d39874ca5a848e41481`。437 repo すべて
`readme_status=ok`、unclassified は 0。classifier は漏れ検知の補助であり、採用判断は本書の
HELIX family 写像と PLAN 起票に従う。
さらに、437 repo すべての default branch を size class 別 chunk に分けて shallow clone し、
tracked file content count と content digest を
`docs/governance/helix-agent-harness-topic-full-content-digest-2026-07-07.tsv` に固定した。
rows は header 含め 438、sha256 は
`e122394b1b4255a9f666068d70c324cc46f8105e8a044989bc25125b9efd6688`。437 repo すべて
`status=ok`。この証跡は default branch の full blob content digest であり、all-ref blob content までは含まない。
all-ref blob content は chunk 0001 / 0002 / 0003 / 0004 / 0005 / 0006 / 0007 / 0008 / 0009 / 0010 / 0011 / 0012 / 0013 / 0014 / 0015 / 0016 / 0017 / 0018 / 0019 / 0020 / 0021 / 0022 で full mirror し、各 ref の各 blob 本文を
`git cat-file` で sha256 化した aggregate を
`docs/governance/helix-agent-harness-topic-all-ref-content-chunk-0001-2026-07-07.tsv` に固定した。
rows は header 含め 31、sha256 は
`4f070292b6befd7b8ed7b6c1bc76aa4a608b2680396dd9d01157bfb3f98252dd`。30 repo すべて `status=ok`、
content entries は 701。chunk 0002 は
`docs/governance/helix-agent-harness-topic-all-ref-content-chunk-0002-2026-07-07.tsv` に固定した。
rows は header 含め 51、sha256 は
`ace3c6c999e91e47367ce6846d821a598ec3bf994e0569db524ebab01ed0ab38`。50 repo すべて `status=ok`、
content entries は 4851。chunk 0003 は
`docs/governance/helix-agent-harness-topic-all-ref-content-chunk-0003-2026-07-07.tsv` に固定した。
rows は header 含め 76、sha256 は
`d4c5ab8910d8e044c5275fd8ba628f1b063e193d6d43f19e52e96b60e42294d2`。75 repo すべて `status=ok`、
content entries は 56919。chunk 0004 は
`docs/governance/helix-agent-harness-topic-all-ref-content-chunk-0004-2026-07-07.tsv` に固定した。
rows は header 含め 76、sha256 は
`959c2cd025dc344033dafc6d29189c7680a533e70f440ce69c9217683c765496`。75 repo すべて `status=ok`、
content entries は 168690。chunk 0005 は
`docs/governance/helix-agent-harness-topic-all-ref-content-chunk-0005-2026-07-07.tsv` に固定した。
rows は header 含め 51、sha256 は
`5fb5a53f97a1689b21e0c23430305716c523cdb4b8675bace800110f55e18e46`。50 repo すべて `status=ok`、
content entries は 1038274。chunk 0006 は、repo 内で unique blob object を一度だけ hash して
ref/path と join する方式で
`docs/governance/helix-agent-harness-topic-all-ref-content-chunk-0006-2026-07-07.tsv` に固定した。
rows は header 含め 26、sha256 は
`7c0c0d6c90966c1ad4830479237b8ca939e579517b4e8424aa6ba12bbad8428c`。25 repo すべて `status=ok`、
content entries は 366503。chunk 0007 は
`docs/governance/helix-agent-harness-topic-all-ref-content-chunk-0007-2026-07-07.tsv` に固定した。
rows は header 含め 11、sha256 は
`8740e038dd6e1a8ad410e6152670ae66629fe5a163c903f65b133d2c763a36ce`。10 repo すべて `status=ok`、
content entries は 360418。chunk 0008 は
`docs/governance/helix-agent-harness-topic-all-ref-content-chunk-0008-2026-07-07.tsv` に固定した。
rows は header 含め 11、sha256 は
`4e1366a891cff607ed9299ada744c7d30217c254bdec013b638314739888f213`。10 repo すべて `status=ok`、
content entries は 273567。chunk 0009 は
`docs/governance/helix-agent-harness-topic-all-ref-content-chunk-0009-2026-07-07.tsv` に固定した。
rows は header 含め 11、sha256 は
`6badab798f0eb15ce9646a4783611e87c0ab831ede21d0040e49e80776f77ae7`。10 repo すべて `status=ok`、
content entries は 422423。chunk 0010 は
`docs/governance/helix-agent-harness-topic-all-ref-content-chunk-0010-2026-07-07.tsv` に固定した。
rows は header 含め 11、sha256 は
`8635e163463c24129f64be39971219f4656c3a06fca698027aaccbd6d05afdf4`。10 repo すべて `status=ok`、
content entries は 109799。chunk 0011 は
`docs/governance/helix-agent-harness-topic-all-ref-content-chunk-0011-2026-07-07.tsv` に固定した。
rows は header 含め 11、sha256 は
`1114c492964a9cb71b0825778df1075e664df6775fcc5c79c9d5260b8f2c6524`。10 repo すべて `status=ok`、
content entries は 767782。chunk 0012 は
`docs/governance/helix-agent-harness-topic-all-ref-content-chunk-0012-2026-07-07.tsv` に固定した。
rows は header 含め 11、sha256 は
`db43749c30a1479cee68859fd8b9d40bc299b5916d9cbbcdabcf35d1b2416de8`。10 repo すべて `status=ok`、
content entries は 995495。chunk 0013 は
`docs/governance/helix-agent-harness-topic-all-ref-content-chunk-0013-2026-07-07.tsv` に固定した。
rows は header 含め 11、sha256 は
`deca67c6d3dcf53066bcccc1dfd33275e0a199b3d64af824f4f397794d8740fd`。10 repo すべて `status=ok`、
content entries は 842763。chunk 0014 は
`docs/governance/helix-agent-harness-topic-all-ref-content-chunk-0014-2026-07-07.tsv` に固定した。
rows は header 含め 11、sha256 は
`85bfcbe0ac08a96999c3de9a65bc6b3f62a4c05562fcba25291b789b5d6e54db`。10 repo すべて `status=ok`、
content entries は 940101。chunk 0015 は
`docs/governance/helix-agent-harness-topic-all-ref-content-chunk-0015-2026-07-07.tsv` に固定した。
rows は header 含め 11、sha256 は
`54598ee24c907634f633321cba335b70487dd1860cd97f3eef6a703b2b11a9b6`。10 repo すべて `status=ok`、
content entries は 1229148。chunk 0016 は
`docs/governance/helix-agent-harness-topic-all-ref-content-chunk-0016-2026-07-07.tsv` に固定した。
rows は header 含め 11、sha256 は
`54a58f79864c30f555a7cb36e34a17d3ea11bc2d166df60a2a93519a35cf91d3`。10 repo すべて `status=ok`、
content entries は 1135289。chunk 0017 は
`docs/governance/helix-agent-harness-topic-all-ref-content-chunk-0017-2026-07-07.tsv` に固定した。
rows は header 含め 11、sha256 は
`a92d01bc403926ed43dcb67db870eb3044ec3af42da77f893972489008de708d`。10 repo すべて `status=ok`、
content entries は 3514854。chunk 0018 は
`docs/governance/helix-agent-harness-topic-all-ref-content-chunk-0018-2026-07-07.tsv` に固定した。
rows は header 含め 11、sha256 は
`e1098ee22b3a6efea06175009df8fd5b2d92518cb495a4400906ce9422233efa`。9 repo は `status=ok`、
`agentscope-ai/QwenPaw` は aggregate detail の一括文字列構築で `Invalid string length` となったため、
完了扱いにせず retry 対象へ残した。chunk 0019 は同じ対象を streaming digest 方式で再取得し、
`docs/governance/helix-agent-harness-topic-all-ref-content-chunk-0019-2026-07-07.tsv` に固定した。
rows は header 含め 11、sha256 は
`621feb543f2236d4c708d0ef07d17bf6f2644c2c4163064047879dca37ac6f79`。10 repo すべて `status=ok`、
content entries は 8071256。chunk 0020 は streaming digest 方式で
`docs/governance/helix-agent-harness-topic-all-ref-content-chunk-0020-2026-07-07.tsv` に固定した。
rows は header 含め 11、sha256 は
`fa662bc276fbb9f36ba27fc40bfe79e26041649516938dce16402135df53512d`。10 repo すべて `status=ok`、
content entries は 5528229。chunk 0021 は file-backed streaming digest 方式で
`docs/governance/helix-agent-harness-topic-all-ref-content-chunk-0021-2026-07-07.tsv` に固定した。
rows は header 含め 2、sha256 は
`42a636d141259ea6bba46ccc11ec44eec6a4b0ba53d943a23f29c8522417abe0`。`lobehub/lobehub` は `status=ok`、
content entries は 82163840、unique blob は 150236。chunk 0022 は同じく file-backed streaming digest 方式で
`docs/governance/helix-agent-harness-topic-all-ref-content-chunk-0022-2026-07-07.tsv` に固定した。
rows は header 含め 2、sha256 は
`ec68d9a4c9852cca5a14251117885740a0757396c55b0e8c597a8438bf877cf8`。`openexec/openexec` は `status=ok`、
content entries は 1047381、unique blob は 12372。全 437 repo の all-ref content status は
`docs/governance/helix-agent-harness-topic-all-ref-content-ledger-2026-07-07.tsv` に固定し、sha256 は
`66f8df015b1b4f3ab813151678f1b8f97f67fe9354485b9bcfaf77c9e51feab7`。内訳は `ok=437`、`pending=0`。
topic `agent-harness` 437 repo の all-ref blob content mirror は全件完了した。

Refs digest:

| source | heads sha256 | tags sha256 | PR refs sha256 | main files sha256 | extra diff files sha256 |
|---|---|---|---|---|---|
| `Fission-AI/OpenSpec` | `5d55b1316a484410e0947e872f37721a82760a36f253cf8a43aa967e49a5b71e` | `a8a8aaa9dff556d275f1adc64f0a1e29db4fe6a1cdf524350735e41194ade589` | `e090b29a64c5fb2875b2f85c9da806755926bdfbaf95bedde58187e0101ebad0` | `f33d4c93d3b1cbbe1b1afdb23ee00ba326a8b2cb95d338afdf2f7b379ed094fb` | `0ac6e26b0155d1dfcb53b783d86c4f2b959f088276abcf3b6a6ec4b48fde097c` |
| `statewright/statewright` | `2cb4fc1f9592a7bbbd2551a41e055ee1a9e5faedd0233895b14301fc7a573d32` | `93ff0b9bcd41c1cc28beb35f81740036d4f1fb0e101f8d6e11438f07cfc2a81a` | `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855` | `41207e8358c53c33fad4f0d0d667c5215c5c8594b37dc20d4df90073745a8019` | 該当なし |
| `github/spec-kit` | `803c950ec1bda34cd10e85adf95f9629dccf6b7042d754a1b70779909f94e256` | `21a740c547a60925314d66ecbaf811615cc2fa4fbadcf78295860ecff7148793` | `4d9156f08ee0914e965cc0903bc2dc9d8b376dac645a8f621e3dee9db6bd16b4` | `1b2961b37261c0318990bce5a6e7bcb739b4d96812e0e6c522f8587b3ffbbe88` | `887999784d4e59dcfdb121c0db32483b2c4edf269acb94c6ee799f59fe99a14d` |

`bradAGI/awesome-cli-coding-agents` と `andyrewlee/awesome-agent-orchestrators` は README catalog と
visible branch / PR refs の README 追加行を抽出し、重複を tool name + URL で統合した。完全棚卸しは
`docs/governance/helix-awesome-agent-catalog-inventory-2026-07-07.tsv` に置く。

Inventory digest:

- rows: 385 unique tools
- sha256: `a6fdf8b34ffee1c9efc64aa9b598553469f1cb1a59f2c094e2aa9cc05c2fbaea`

## 2. source 別の採用観点

`awesome-cli-coding-agents` / `awesome-agent-orchestrators` は、個別 agent CLI の導入ではなく、
runtime capability、sandbox、session manager、mailbox、loop、parallel verifier、observability、
skill hygiene、security、tool augmentation の pattern source として採る。

`OpenSpec` は、artifact-guided workflow、change package、delta / archive、proposal / design / tasks、
cross-repo Stores、profile / command generation、validate / bulk archive、既存 brownfield 採用の
pattern source として採る。HELIX では V モデル層と PLAN を正本にするため、OpenSpec の軽量さは
bulk import せず、HELIX の additive change / trace freeze / archive contract へ変換する。

`statewright` は、state machine による allowed tools、per-state model routing、approval gate、
interrupt、fork/join、session isolation、hard/advisory enforcement 区分、MCP gateway の pattern source として採る。
HELIX では Rust engine / FSL gateway を取り込まず、workflow state policy と adapter enforcement contract へ変換する。

`spec-kit` は、constitution、specify / plan / tasks / implement、clarify / analyze / checklist / converge、
extension / preset / bundle、template resolution、hash-tracked idempotent install、offline-first CLI の
pattern source として採る。HELIX では Python 実装や `.specify/` を取り込まず、HELIX L0-L14 と
TypeScript/Bun 実装へ変換する。

`AgentWrapper/agent-orchestrator` は、parallel agent IDE、git worktree isolation、live terminal control、
PR / CI / review comment / merge conflict feedback loop、agent adapter registry、reviewer harness、
daemon / CDC / status derivation の pattern source として採る。HELIX では Electron UI や Go backend を
取り込まず、state DB read model、review feedback intake、session supervisor contract へ変換する。

`first-fluke/oh-my-agent` は、`.agents/` SSoT、runtime projection、preset、agent/skill/rule pack、
keyword detection hook、state boundary hook、persistent mode、runtime execution protocol、multi-language docs の
pattern source として採る。HELIX では `.agents/` を正本にせず、HELIX adapter template と skill registry へ変換する。

`code-yeongyu/oh-my-openagent` は、Codex / OpenCode QA skill、fake provider server、SSE hook probe、
TUI smoke、DB session search、with-skill / without-skill eval grading、evidence ledger の pattern source として採る。
HELIX では外部 package publishing flow は採らず、skill efficacy evaluation と harness self-test fixture へ変換する。

`awesome-harness-engineering` / `awesome-agent-harness` 系と topic `agent-harness` は、harness engineering taxonomy、
curation policy、query template、source verification、landscape report、reference taxonomy の pattern source として採る。
HELIX では star ranking を採用根拠にせず、capability family と source freshness の監査 ledger へ変換する。

## 3. HELIX への capability 写像

11 repo と topic ledger の内容は以下の 23 family に写像する。外部 catalog item / refs は少なくとも 1 family に属し、
HELIX に既存実装があるものは gap ではなく hardening / watch 対象へ落とす。

| family | 外部 source の代表 pattern | HELIX 現状 | 採用判断 |
|---|---|---|---|
| external agent catalog watch | awesome list、PR 追加候補、agent readiness list | 外部 upstream 監査は個別 repo 単位であり、agent catalog の継続 watch がない | 採用: PLAN-L7-361 |
| runtime capability matrix | multi-runtime、provider router、profile switch、supported integration list | `role` / adapter はあるが runtime capability catalog が薄い | 採用: PLAN-L7-362 |
| isolated worktree / sandbox runner | worktree、container、checkpoint、tmux panes | setup / git guard はあるが、agent run の物理分離が薄い | 採用: PLAN-L7-363 |
| session command center | kanban、dashboard、needs-you triage、resume | `handover` / status はあるが、multi-session board は未統合 | 採用: PLAN-L7-364 |
| mailbox / conflict locks | message bus、mailbox、file/function lock、heartbeat | team run と handover はあるが、競合制御と agent 間通信が薄い | 採用: PLAN-L7-365 |
| autonomous loop receipts | wake-work-sleep、budget stop、retry/backoff、run receipt | loop / budget / heartbeat PLAN はあるが receipt と restart contract が不足 | 採用: PLAN-L7-366 |
| verifier council / candidate selection | parallel candidate runs、neutral verifier、blind review | worker/verifier 分離はあるが、候補比較 merge selection がない | 採用: PLAN-L7-367 |
| observability / provenance | transcript browser、cost/latency/anomaly、diff attribution | telemetry はあるが session transcript / attribution の観測面が弱い | 採用: PLAN-L7-368 |
| skill / memory hygiene | skill optimizer、skill reaper、self-improving rules、retention memory | skill suggestion と memory はあるが、skill 発火率・死蔵 skill 整理が弱い | 採用: PLAN-L7-369 |
| security / credential / egress | credential broker、prompt-injection guard、microVM、network egress | P8 と git/secret guard はあるが agent 実行境界の統合 policy が不足 | 採用: PLAN-L7-370 |
| tool augmentation | LSP MCP、browser automation、issue tracker、agent-ready search | MCP/profile と task lens はあるが typed context / browser / issue tools の採用基準が薄い | 採用: PLAN-L7-371 |
| change package / delta archive | OpenSpec proposal/design/tasks/spec delta、archive、bulk validate | HELIX PLAN と archive はあるが delta package と archive validator が薄い | 採用: PLAN-L7-373 |
| cross-repo spec store | OpenSpec Stores、separate planning repo、read-only shared requirements | distribution と source は分離済みだが multi-repo plan store がない | 採用: PLAN-L7-374 |
| spec-driven constitution / template stack | Spec Kit constitution、template resolution、override/preset priority | AGENTS/CLAUDE/ADR はあるが runtime artifact template governance が弱い | 採用: PLAN-L7-375 |
| artifact convergence analyzer | clarify/analyze/checklist/converge、unit tests for English | plan lint はあるが spec/plan/tasks/code の cross-artifact gap 検査が薄い | 採用: PLAN-L7-376 |
| state-machine tool policy | Statewright allowed_tools、approval gates、interrupts、hard/advisory enforcement | workflow phases はあるが state 別 tool/model enforcement の明示 contract が薄い | 採用: PLAN-L7-377 |
| state-machine template planner | `gen_sm => llm_solve`、workflow template library、training triples | role/lens はあるが task-specific workflow machine generator がない | 採用: PLAN-L7-378 |
| extension / preset / bundle registry | Spec Kit extension/preset/bundle catalog、manifest、priority、hash tracked install | HELIX setup/templates はあるが opt-in extension lifecycle と bundle registry が薄い | 採用: PLAN-L7-379 |
| PR / CI / review feedback intake | AO の CI failure、review comment、merge conflict route-back | GitHub ops guard はあるが worker session への feedback intake が薄い | 採用: PLAN-L7-380 |
| agent SSoT projection | oh-my-agent の `.agents/` SSoT と runtime native projection | HELIX adapter はあるが skill/rule/agent pack の投影 manifest が弱い | 採用: PLAN-L7-381 |
| skill efficacy evaluation | oh-my-openagent の with/without skill grading、fixture、timing | skill 推薦はあるが効果測定と regression fixture が薄い | 採用: PLAN-L7-382 |
| harness taxonomy / curation policy | awesome harness 系の taxonomy、query templates、source verification | 外部 source watch はあるが分類基準と curation policy が独立していない | 採用: PLAN-L7-383 |
| source content mirror completeness | topic 437 repo の refs / README / tree / default branch full content digest と、all-ref blob mirror chunk 0001-0022 / complete ledger | 大量外部 source の all-ref content mirror を安全に完了する protocol がない | 採用: PLAN-L7-384 |

## 4. 採らないもの

- 個別 CLI agent の runtime 本体: HELIX core は TypeScript/Bun 実装であり、他 agent を product runtime として
  bulk import しない。必要なら adapter capability として扱う。
- Closed-source / SaaS-only: CI/headless、needs-you、remote session などの pattern だけ採る。
- leak 由来 rewrite / guardrail stripping を売りにする repo: security posture が HELIX P8 と逆方向のため source 採用しない。
- OpenSpec / Spec Kit の Python / shell runtime: HELIX の ADR-001 に従い TypeScript/Bun で再実装する。
- Statewright の FSL-1.1-ALv2 gateway: license / distribution boundary を越えるため source 採用しない。
  Apache 2.0 部分も現時点では code import せず、state-machine policy pattern の参考に限定する。
- External API / issue tracker / hosted cloud / managed dashboard: action-binding approval と credential / egress policy がない限り有効化しない。
- Star count / popularity: 採用根拠にしない。HELIX の穴を塞ぐ capability と検証可能性だけを判断軸にする。

## 5. HELIX 自身の穴

今回の追突で、HELIX の自走 agent 機構に残る穴は次の 23 点に収束した。

1. 外部 agent/orchestrator catalog を定期再確認し、差分を HELIX capability backlog へ流す ledger がない。
2. 複数 runtime / provider / CLI の capability と制約を機械的に比較する matrix が薄い。
3. 並列 agent run を git worktree / container / VM / network policy と結びつける隔離 runner がない。
4. 複数 session の状態、needs-you、resume、handover を一画面または JSON board で見る surface が薄い。
5. agent 間の mailbox、heartbeat、file/symbol lock、衝突検知が workflow contract として薄い。
6. 長時間 loop の restartability、receipt、budget stop、retry/backoff が closure evidence として弱い。
7. 複数候補実装を中立 verifier が replay/test し、採用候補を選ぶ council がない。
8. transcript / cost / latency / failure / diff attribution を cross-runtime に検索する observability 面が弱い。
9. skill / memory が増えた後の発火率、死蔵、圧縮、自己改善ルール昇格の hygiene が薄い。
10. credential broker、egress policy、prompt-injection guard、OS sandbox を agent 実行境界として束ねる contract が薄い。
11. LSP / browser / issue tracker / runbook compiler などの tool augmentation を採用する判断基準が薄い。
12. proposal / design / tasks / spec delta / archive を 1 change package として validate する contract が薄い。
13. 複数 repo にまたがる企画・要件・PLAN を read-only shared store として扱う仕組みがない。
14. constitution / template / override / preset の優先順位を runtime artifact へ機械適用する governance が薄い。
15. spec / plan / tasks / code / tests の gap を横断検査し、残作業へ converge する analyzer が薄い。
16. workflow phase ごとの allowed tools / model / approval / interrupt を state machine として enforce する contract が薄い。
17. task type から workflow state machine を生成・再利用・学習する template planner がない。
18. extension / preset / bundle を manifest、catalog、install policy、hash manifest で安全に扱う lifecycle が薄い。
19. CI failure、review comment、merge conflict を正しい worker session へ戻す feedback intake が薄い。
20. agent / skill / rule / hook pack を runtime native layout へ投影する SSoT manifest が薄い。
21. skill が本当に効いたかを with/without fixture、grading、timing で測る仕組みが薄い。
22. harness engineering source を分類する taxonomy と curation policy が PLAN から独立していない。
23. topic のような大量外部 source を default branch full content から all-ref content まで安全に mirror・精読し、pending を残さず完走する chunked protocol が未実装である。

## 6. 起票結果

本 pass で、HELIX 式に変換した採用 PLAN を 23 件起票または拡張した。

| PLAN | 目的 |
|---|---|
| `PLAN-L7-361-agent-catalog-watch` | 外部 agent catalog の ledger / diff / freshness gate |
| `PLAN-L7-362-runtime-capability-matrix` | runtime capability matrix と adapter routing hardening |
| `PLAN-L7-363-isolated-worktree-sandbox-runner` | worktree / sandbox runner contract |
| `PLAN-L7-364-agent-session-command-center` | session board / needs-you triage / resume surface |
| `PLAN-L7-365-agent-mailbox-conflict-locks` | mailbox / heartbeat / file-symbol conflict locks |
| `PLAN-L7-366-autonomous-loop-run-receipts` | loop receipt / restart / retry / budget evidence |
| `PLAN-L7-367-parallel-candidate-verifier-council` | parallel candidate verifier and council |
| `PLAN-L7-368-agent-observability-provenance` | transcript / cost / latency / diff attribution observability |
| `PLAN-L7-369-skill-memory-hygiene` | skill firing / reaper / memory retention hygiene |
| `PLAN-L7-370-security-credential-egress-guard` | credential broker / egress / prompt-injection execution guard |
| `PLAN-L7-371-tool-augmentation-registry` | LSP / browser / issue / runbook tool augmentation registry |
| `PLAN-L7-373-change-package-delta-archive` | change package / delta / archive validator |
| `PLAN-L7-374-cross-repo-spec-store` | cross-repo spec / PLAN store and read-only consumption |
| `PLAN-L7-375-spec-driven-constitution-template-stack` | constitution / template / override / preset stack governance |
| `PLAN-L7-376-artifact-convergence-analyzer` | clarify / analyze / checklist / converge style cross-artifact analyzer |
| `PLAN-L7-377-state-machine-tool-policy` | state-machine tool/model/approval enforcement |
| `PLAN-L7-378-state-machine-template-planner` | workflow state-machine template planner and learning triples |
| `PLAN-L7-379-extension-preset-bundle-registry` | extension / preset / bundle catalog and safe install lifecycle |
| `PLAN-L7-380-review-feedback-session-intake` | PR / CI / review / merge-conflict feedback intake |
| `PLAN-L7-381-agent-ssot-runtime-projection` | agent / skill / rule SSoT projection to runtime layouts |
| `PLAN-L7-382-skill-efficacy-evaluation` | with/without skill eval fixture and grading evidence |
| `PLAN-L7-383-harness-taxonomy-curation-policy` | harness source taxonomy and curation policy |
| `PLAN-L7-384-source-content-mirror-completeness` | default branch full blob digest と all-ref external source mirror protocol |

この監査は上記 PLAN 起票までを完了とし、各 PLAN の実装完了を claim しない。
外部 source は変化するため、future pass では refs digest と inventory digest を更新して差分のみを追突する。

## 7. GitHub publish 状態

2026-07-07 の本 pass は、混在 worktree から今回の意図ファイルだけを明示 path staging し、
Conventional Commit `docs: audit agent harness source catalogs` として commit した。

- branch: `codex/helix-l3-pillar-descent`
- commit: `da83c8c1a8048fe881ca16509ac28cb123bd7196`
- remote branch: `origin/codex/helix-l3-pillar-descent`
- push: `git push origin codex/helix-l3-pillar-descent` 成功
- base branch at push verification: `origin/main` = `7014aff62041dc9d7808c8986990a68611c85b2c`

PR 作成は GitHub 運用ルールどおり draft PR を優先したが、local `gh auth status` は未ログインであり、
GitHub connector の `_create_pull_request` も `Resource not accessible by integration` (`403`) で拒否された。
このため PR 作成と main merge は未実施である。main への直接 merge は review / approval 境界を越えるため実施しない。
