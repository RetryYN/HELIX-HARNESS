# RDP-001 PREISOLATION-002 semantic atomization scaffold

この scaffold は、#1951 候補 `PREISO-REV-000085..000144` に含まれる review-only subunit 8件だけを、意味atom化できるか確認した記録である。選択した source は `000089`、`000096`、`000103`、`000110`、`000117`、`000124`、`000131`、`000138` で、いずれも `registry_source_digest` の一行変更だった。旧 Git object、asset disposition、phase/product ledger、decision log、旧 plan の failure／consumer候補を静的に照合した。

8件とも、変更行単独から actor、authority、enforced-by、failure、consumer を持つ独立 predicateを確定できなかった。したがって semantic atom は **0**、compound hunk hold は **8**、未解決 atomization は **8** とした。各レコードには exact baseline／pre-isolation span、source digest、candidate product／phase、legacy implementation、consumer closure、decision absence、failure／consumer候補、counterevidenceを保持している。候補 product／phaseは ledger の候補値であり、正式な製品責務、owner、要求採否、authority、実装、意味同値、consumer closureを生成しない。

## 分母と境界

- Git object denominator: 全体 **400 files / 492 hunks**。
- #1951 parent candidate: **60 files / 60 hunks**、review-only subunit **8**、semantic atom **0**。
- #1951 より前の selected scope: **84 files / 152 hunks**。parent candidate を含む selected scope は **144 files / 212 hunks**。
- parent candidate 後の residual: **256 files / 280 hunks**。source holding は **333 records**、先行84とparent候補60を合わせた選定は **144 records**、残りは **189 records**。
- この成果物が判定する atomization denominator: **8 subunits / 8 candidate decisions**、成立 **0**、未解決 **8**。

#1951 の source artifact は `a14310ad225d02727f046da03963ae94ead0718a` の Git object から読み、今回の新規 worktree は作成時の `origin/main` `c354b7d9177ad3ea92dec30c66c36e6ce2d66ae3` に置いた。source input digestは固定し、base freshnessを意味上のgateにしていない。#1951 worktreeは変更していない。parent candidateはこの時点で `unmerged_candidate` として記録する。

| review-only subunit | source path | phase candidate / status | product candidate / status | legacy / consumer boundary |
| --- | --- | --- | --- | --- |
| `PREISO-REV-000089` | `PLAN-L7-570-design-elicitation-typed-classification.md` | `PHCAP-03` / classified_candidate | `[]` / unresolved | implementation unknown / closure pending |
| `PREISO-REV-000096` | `PLAN-L7-577-github-execution-episode-location-projection.md` | `PHCAP-18` / unresolved_with_candidate | 4製品 / candidate_needs_semantic_review | implementation unknown / closure pending |
| `PREISO-REV-000103` | `PLAN-L7-584-current-location-workflow-identity.md` | `[]` / unresolved | `[]` / unresolved | implementation unknown / closure pending |
| `PREISO-REV-000110` | `PLAN-L7-639-luna-worker-model-registry.md` | `PHCAP-10` / classified_candidate | `HELIX-OS` / candidate_needs_semantic_review | implementation unknown / closure pending |
| `PREISO-REV-000117` | `PLAN-L7-647-typed-backfill-pending-routing.md` | `[]` / unresolved | `[]` / unresolved | implementation unknown / closure pending |
| `PREISO-REV-000124` | `PLAN-L7-654-distribution-devos-instruction-authority.md` | `PHCAP-14` / classified_candidate | `[]` / unresolved | implementation unknown / closure pending |
| `PREISO-REV-000131` | `PLAN-L7-661-lite-requirements-manifest-oracle.md` | `PHCAP-03,07,14` / multi_phase_candidate | `[]` / unresolved | implementation unknown / closure pending |
| `PREISO-REV-000138` | `PLAN-L7-668-project-hook-authority-surface-projector.md` | `[]` / unresolved | `[]` / unresolved | implementation unknown / closure pending |

## ファイル

- `rdp001-preiso002-atomization.json`: selected 8 subunit、source holding／asset／phase snapshot、failure／consumer候補、分母、未解決境界。
- `rdp001-preiso002-semantic-atom-inventory.json`: atom判定。8件すべて `semantic_atom: null`、`atom_status: unresolved_not_atomized`。
- `validate.py`: holding、Git diff、exact span／SHA-256、parent candidate Git object、asset／phase、decision 0件、atom 0、negative集合をread-only静的検証する。
- `selfcheck.py`: digest改変、atom昇格、phase／implementation／consumer closure昇格、decision absence改変、review-only欠落、hunk／atom混同、旧実行フラグ、parent scope driftを陰性検査する。

旧 archive は Git object の source reference としてだけ読み、archive 内 runtime／test／CI／hookは実行していない。`validate.py` の合格は意味同値、要求採否、current authority、実装、受入、releaseの証拠ではない。
