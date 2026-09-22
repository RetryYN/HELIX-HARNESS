# outside-67 第16〜30行の静的照合候補

outside-67正式source set候補（PR #1978）と先頭15件の監査をread-only入力とし、全67件の第16〜30行を既存13 live source holdingへ物理照合する。要求atom化、意味的包含判定、source holding登録は行わない。

対象15 pathはすべて`docs/governance/audits/l2-requirements/`配下にある。pathから得られるのは`shared-cross-product`と`upstream-governance-or-crosswalk`という**候補ラベル**だけで、製品ownerやphase authorityを確定しない。

| 項目 | 静的所見 |
|---|---|
| 対象 | `OUTSIDE67-PATH-016`〜`030`の15件 |
| 実装 | unknown。実装sourceを示すpath証拠なし、旧asset catalog一致0件 |
| 縮退 | unknown。archive blob差分から意味差分を推定しない |
| archive blob | 同一8件、相違7件 |
| archive root／現行capture `3df81ad` | 全15件に存在しない |
| 既存13 holding | path／blob／SHAの完全一致は全件0 |
| 新holding要否 | 未解決候補。意味的非包含は未証明 |

分類状態は`unknown_path_based_candidate_only`を維持する。物理的なblob／SHA関係から意味同値、要求identity、採否、successor、実装、受入、完了を生成しない。

既存13 holdingは`docs/governance/management-provisional-requirement-register-pre-append-3df81ad.jsonl`のhistorical 32行snapshotにある`supersedes`終端集合から再計算する。append後のcurrent registerは14 live holdingへ進んでいるが、この候補の13件の証拠境界を置換しない。`inventory.json`は正式67 item source set、coverage receipt、outside report、既存13 path holdingをdigestで固定する。登録appendや外部作用は行わない。

## 行schema

各行は`identity`、`candidate_classification`、`physical_revision`、`holding_relation`、`boundary`を分ける。候補product／phaseとauthority／dispositionを同じ状態値へ縮約しない。

## 静的検証

`validate.py`は`generator.build()`とinventoryの自己一致だけに依存しない。レビュー済みPR HEAD `480d1c2a027f065a4150853039f3141092a84b42` のgenerator／inventory Git blob OIDをbase objectとして固定し、historical-register correction後の作業tree generator／inventory bytesも候補digestで固定して同時改竄をfail-closedする。さらにreport、source set、historical 32行management registerから13 live holdingをvalidator自身で再計算し、各pathのGit objectと13 holdingのpath／blob／SHA関係を独立再計算する。

```text
python3 scaffold/pre-isolation-outside-holding-16-30/generate.py
python3 scaffold/pre-isolation-outside-holding-16-30/validate.py
python3 scaffold/pre-isolation-outside-holding-16-30/selfcheck.py
python3 scaffold/tools/scfctl.py validate
python3 scaffold/tools/scfctl.py stale
python3 scaffold/tools/scfctl.py residuals
git diff --check
```

selfcheckにはgeneratorとinventoryを同時に改竄した入力をGit object anchorが拒否するnegative caseを含め、product／phaseは従来どおりunknown候補境界を保持する。

旧archiveはGit objectの静的読取だけに使う。旧runtime、test、CI、hook、adapter、sourceを実行しない。本候補は`SCF-B-0045`へ束縛するresearch evidenceであり、正式設計・実装・CI・受入・source holding登録ではない。
