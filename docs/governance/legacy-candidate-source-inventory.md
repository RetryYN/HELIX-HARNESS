# 旧candidate要求源の全量保全inventory

status: preserved_pending_atomization
ledger: [旧candidate source line台帳](legacy-candidate-source-line-carry-forward.jsonl)
source_root: `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/`

旧candidate要求源を系列名の要約だけで再採否せず、archiveに存在する92文書・非空4,755行を原文・source path・行番号・file digest・line digest付きで保持する。

全行は`source_authority_state: historical_candidate`、`target_authority_state: draft_candidate`、`atomization_status: preserved_pending_atomization`である。意味変更、successor、decisionは0件である。

これは4,755要求の確定でも、candidateの採用でもない。要求、受入、制約、根拠、例、旧方式、navigationを分類する前の過包含source集合である。旧方式や旧CIを含む行も削除せず保持し、新世代へ採る意味と採らない実現方式を後続proposalで分離する。

過去の[source audit](audits/source-rebaseline/source-audit.md)にある「97文書」は当時の作業集合の記録である。現在のarchive manifest配下の旧candidate実体は92文書である。現行`docs/governance/candidates/`の新世代候補は11文書（2026-09-17時点の閉じた集合8文書と、2026-09-18に追加した仮設束縛候補、旧ルール群由来の要求候補、WBS台帳候補の3文書。件数の正本は[上流authority register](upstream-authority-register-2026-09-14.md)）であり、92文書とはfile名でもfile digestでも重複しない。92と11を混ぜて旧要求件数や採用数を生成しない。

## 不合格条件

- 系列台帳の要約だけで原文条件をcoveredにする。
- 現行の新世代候補（上記11文書。今後追加される候補を含む）に記載がない旧candidate行を削除・棄却扱いにする。
- GitHub Issue、PR、実装、旧CIからcandidateの採否を逆算する。
- 原文行へのtraceなしに要求atom、対象product、successorを確定する。
