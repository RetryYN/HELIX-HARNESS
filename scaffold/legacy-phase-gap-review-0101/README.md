# SCF-B-0101 旧要求30 unitのphase gap review

`status: research_candidate`、`authority_effect: none`の静的Scaffoldである。基準HEADは
`36784d25aa4cc53d89c28c2ff81b4009db234605`。対象は
`docs/governance/legacy-requirement-implementation-crosswalk-bootstrap.jsonl`の
`phase_classification_status=unresolved` 30 unit（HELIX-OS 24、HELIX-HARNESS 6）に固定する。

旧IRの原文statement、crosswalkのexact digest／source span、旧資産台帳のsource・history・failure・consumer、
Wave1–50のsemantic edge、PHCAP-20定義、四製品L1を静的に照合する。Wave1–50では対象30 unitに66 edge
（confirmed 30、unresolved 34、rejected 2）が存在するが、confirmed edgeは要求source契約の照合であり、
phase authorityを生成しない。asset edgeの`candidate_phase_targets`はbounded search候補にとどめる。

したがって30 unitすべてを`unresolved_phase_gap`として保持し、eligibleな直接phase候補は0件とした。各unitには
asset側の多phase候補を残すが、PHCAP-20を含む候補の存在、旧sourceやtestの存在、current L1／L2／L11参照から、
現行phase、製品owner、実装、consumer closure、successor、authorityを推定しない。PHCAP-20は
memory／continuation／handover／retentionの直接責務だけを対象とし、genericなstate・ledger・event・process語は
phase gapとして扱う。

`units.jsonl`がunit別の判断、`edges.jsonl`がWave1–50の対象edge、`inventory.json`が分母、固定base祖先、全source input digest、
PHCAP-20 definition refs digestを保持する。`generate.py`はこれらを再導出し、`validate.py`は30 ID網羅、旧IR原文digest／anchor、
edge coverage、候補とauthorityの分離、asset source/history/failure/consumer、Bindingの11負例コード同期をfail-closedで検査する。
`selfcheck.py`は各負例で期待error codeを照合する。

旧archive内のruntime、CI、test、workflow、hook、adapter、sourceは実行していない。正式crosswalk、phase inventory、
製品L1、successor、要求採否、実装を変更しない。#1813は進捗参照だけであり、close／完了判断を生成しない。

```text
python3 -B scaffold/legacy-phase-gap-review-0101/generate.py
python3 -B scaffold/legacy-phase-gap-review-0101/validate.py
python3 -B scaffold/legacy-phase-gap-review-0101/selfcheck.py
python3 scaffold/tools/scfctl.py validate
python3 scaffold/tools/scfctl.py stale
python3 scaffold/tools/scfctl.py residuals
git diff --check
```
