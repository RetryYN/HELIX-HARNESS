# Wave24 旧要求 semantic review status（2026-09-22）

Wave23 HEAD `1a7d1fc3cbece5bc0ad5c59687984a204269098a` をcandidate lineageとして保持し、PR #1960でorigin/mainへmergeされた後の最新main `4974e66e3890e41515004d18c49d59b3e49f8f68` を親とする新専用worktreeへWave24候補をrebaselineしました。merge parentsは `e85a549f96778fc79021710805f10723978ec668` / `fa8f5426882ee56a56e28975746e2db590cd515f` です。metadataのcurrent tree、main merge、parent、source base、stacked parent revisionを同一の最新mainへ更新し、成果物はresearch-premise candidateとして保持します。origin/mainが再度変化した場合は停止して再baselineします。

2 unit、6 edge（requirement 2、design 2、implementation_source 2）を保存し、confirmed 2、unresolved 4、rejected 0です。累積は74 unit／219 edge、残り144 unitです。FR03はIssue contractのfield分離とversioned digest、FR04はReverse GateのR0–R4順序、phase checks、skip拒否、空契約の探索記録を保持しました。FR04のR0–R4順序atomはFR04-OSとの共有候補としてholdしています。

共通要求asset `LEGACY-ASSET-A60CF91DD2AF6693E6F9`、IR/raw line span、semantic digest、atom literal、selected old design/source、catalog classification、bounded search receipt、Wave1–23 prior lineageをledger/metaへ固定しました。全authorityは `none`、consumer closureは `pending`、旧実行は `not_run`、new buildは `false` です。旧assetの存在や候補語近接から現行実装、採用、完了、consumer closureを主張していません。

検証は次の静的 verifier を実行しました。

- `python3 -m py_compile docs/governance/tools/verify_legacy_requirement_direct_semantic_review_wave24.py` — PASS
- `python3 docs/governance/tools/verify_legacy_requirement_direct_semantic_review_wave24.py` — `Wave24 static schema10 verification: PASS`
- verifierはrow/meta schema、source SHA、exact excerpt、atom provenance、bounded search ID/count/digest、phase pool、prior lineage、shared atom hold、stale-anchor negative caseを確認

旧archiveのruntime、test、CIは実行していません。PR #1967をDraftで提出し、exact HEADの独立reviewを待ちます。mergeとIssue closeはreviewer側の責務です。
