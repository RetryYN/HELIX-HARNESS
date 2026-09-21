# RDP-001 未評価 source holding 静的監査候補

これは `MPR-SH-PREISOLATION-002` のatom展開前分母を固定する `scaffold` 候補である。対象は `RDP-001` / `L2D-S1-01`。同packet v2でatom展開未完とされる3集合は次のとおりで、優先監査は333件のpre-isolation holdingとした。

| holding | 未処理分母 | 状態 |
| --- | ---: | --- |
| `MPR-SH-PREISOLATION-002` | 333 | `unassessed_pending_atomization`（本候補） |
| `MPR-SH-DELEGATED-DOC-003` | 114 file blobs | `preserved_pending_atomization` |
| `MPR-SH-DELEGATED-REF-001` | 614（atomization pending）、174（classification pending） | 未展開・未分類 |

選定理由は、RDP-001の333 pathについてbaseline、pre-isolation、archiveのGit objectを同一holdingで対応付けられ、packet v2が指す `docs/plans/PLAN-L3-82-authority-vocabulary-separation.md` を含むためである。旧原文はarchive commitからread-onlyで照合し、現行へコピーしていない。

監査結果は [report.json](report.json) にある。333/333件でbaseline/pre-isolation blob、archive旧原文、asset disposition source pathを照合した。333/333件でbaseline/pre-isolationのbyte差分があり、旧原文の取得も333/333件で成功した。source register上のproduct targetは333/333件が `unassigned_cross_product`、authority effectは `none`。asset dispositionは324件が `historical / unresolved / unknown / unreviewed`、9件がsource snapshot correction由来のread-only分類である。
旧原文は3,141,428 bytes／44,964行である。333件すべての終端改行を余分な行として数えないよう、行数は各Git blobの`splitlines()`で再計算した。

既存PR #1951、#1955、#1957との境界は、reportの分母・旧原文・source register/screen/projection・asset dispositionの判断史を上位で照合することに限る。これらのPRの変更、実装、atom化、review結論、authority付与、完了、merge、Issue closeを再評価または生成しない。

read-onlyで確認したPR状態は、#1951がmerge commit `4007b22dbcad45640ba0ee87393f6d2e290640ad`、#1955がmerge commit `569d7373c32287bbafadeec6043472563937c5c7`、#1957がOPEN（未merge）である。これは候補の境界確認であり、PR状態から要求authorityや完了を生成しない。

`failure`、`degraded`、`consumer` は旧原文に対する語彙検索の集計であり、意味上のfailure・consumer確定数ではない。structured failure/degraded fieldは0件である。path由来のproduct/phaseは候補であり、要求採否、owner、successor、実装状態を確定しない。capture HEADでsource pathが333件とも不在なのはarchive隔離・移設と整合するが、未実装の証明には使わない。

検証は候補reportの再計算validatorと否定例selfcheckに限定する。

```sh
python3 -B scaffold/rdp001-unassessed-atom-audit/validate.py
python3 -B scaffold/rdp001-unassessed-atom-audit/selfcheck.py
python3 -B scaffold/tools/scfctl.py validate
python3 -B scaffold/tools/scfctl.py stale
python3 -B scaffold/tools/scfctl.py residuals
git diff --check
```

`SCF-B-0027` に登録済みだが、authority effectは `none`、stateは `registered` のままである。origin/mainのtracked最大は`SCF-B-0020`で、旧候補worktreeに残る未コミット`SCF-B-0026`との衝突を避けるため、新候補は`SCF-B-0027`へ分離した。調査時点の `origin/main` capture HEAD は `569d7373c32287bbafadeec6043472563937c5c7` であり、検証器はPRのHEADがその子孫であることを確認する。PRはread-only検証結果と上流digestをreview対象として扱い、mergeとpost-merge read-afterは許可されたレビュー対応側に委ねる。旧archive内の実行は行わない。正式なatom化・意味等価review・product routing・human decision・下流実装が成立した場合だけ、別の明示された移管手順を検討する。
