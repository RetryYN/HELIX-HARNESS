# RDP-001 PREISOLATION 6経路 revision coherence 候補

status: scaffold_candidate_pending_semantic_equivalence_review
authority_effect: none
product_boundary: HELIX-HARNESS
diff_scope: selected_source_items_only

baseline `6fabd125` と pre-isolation `2d499104` の2 commit全体には400 files／492 hunksの差分がある。
このRDP-001候補は、そのうち選定した6 path／9 hunkだけを対象にする。commit全体の差分被覆や、
未選定pathの意味同値・採否は主張しない。

このdirectoryは、archive隔離前に変更された6つのsource pathについて、監査基準
（`baseline_commit`）と隔離直前（`pre_isolation_commit`）の両revisionを落とさず、
registry／catalogの参照digestと製品境界を同じ候補束へ固定するための仮組みである。

正本は`docs/governance/pre-isolation-revision-delta-source-holding.jsonl`であり、
`rdp001-revision-coherence-6path.json`はその6行をreview単位へ束ねた候補manifestである。
manifestはsourceの意味同値、採否、successor、current authority、実装、受入を決めない。
`archive_path`は来歴確認のための参照値として保持する。archive内runtime、test、CI、hookは
実行しない。

## 対象

| 台帳ID | path | 役割 |
|---|---|---|
| `PREISO-REV-000060` | `docs/plans/PLAN-L3-82-authority-vocabulary-separation.md` | authority語彙分離の旧PLAN source |
| `PREISO-REV-000026` | `docs/governance/helix-harness-requirements_v1.3.md` | 旧HARNESS requirements source |
| `PREISO-REV-000015` | `docs/design/helix/L3-requirements/workflow-classification-registry.v1.json` | workflow分類のregistry |
| `PREISO-REV-000001` | `config/workflow-classification-catalog.v1.json` | 分類registryからのgenerated catalog |
| `PREISO-REV-000016` | `docs/design/helix/L3-requirements/workflow-execution-policy-registry.v1.json` | execution policy registry |
| `PREISO-REV-000002` | `config/workflow-execution-policy.v1.json` | execution policy registryからのgenerated catalog |

## 静的確認

```text
python3 scaffold/pre-isolation/validate.py
```

検査は、6台帳行のID／path／カテゴリ／revision境界、baseline／pre-isolation／archive commitの
既知Git blob bytes、blob OIDとSHA-256、archive snapshotとのbyte一致、`authority_effect: none`、
successor／human decisionの空欄を確認する。さらに4つのconsumer JSONをpre-isolation blobから
read-onlyに解析し、registry／catalogの宣言path fieldとdigest fieldの実在・値一致を確認する。
検査合格は意味同値、要求採否、承認、L3 freeze、実装、CI green、受入の証拠ではない。

候補validatorの否定例は一時manifestだけを変更して確認する。

```text
python3 scaffold/pre-isolation/selfcheck.py
```

## 意味差分の候補インベントリ

`rdp001-6path-semantic-diff-inventory.json`は、6 pathのbaseline／pre-isolation blobを
静的に行spanへ分解した候補台帳である。変更断片は9件で、候補分類はrequirement 1件、
constraint 2件、provenance 4件、generated metadata 2件、unresolved 0件。分類は意味同値や
採否を示さず、各断片に未解決の意味、HARNESS／HELIX-OS／unresolvedのowner候補、保持すべき
negativeを記録する。8件のnegativeはfail-close、非完了、非authority、dual authority回避、
runtime自動適用拒否の境界を保持する。

インベントリvalidatorは候補に書かれたtextやdigestを正本とせず、既知のbaseline／pre-isolation
commitのGit blobから再抽出して照合する。空のbaseline spanも含め、行span、UTF-8 SHA-256、
fragment集合、分類数、negative集合を確認する。
さらに`git diff --unified=0`の9 hunk（6 path）を同じbaseline／pre-isolation span集合と完全照合し、
変更hunkの抜け・過剰・誤pathを候補から通さない。

各source item／fragmentのphaseは`phase_candidates: []`、
`phase_authority_status: unresolved_no_direct_phase_candidate`、
`legacy_implementation_status: unknown`として未確認に固定する。owner候補とnegative IDも固定集合へ
照合し、revision contract、review boundary、製品境界source、holding pathの改変はfail-closeする。

```text
python3 scaffold/pre-isolation/validate-semantic-diff.py
python3 scaffold/pre-isolation/selfcheck-semantic-diff.py
```

この検査の合格は、意味同値、closure、authority昇格、要求採否、実装、runtime／test／CI実行、
受入の証拠ではない。旧sourceはread-only referenceとして扱い、archive内runtime／test／CIは
実行しない。
