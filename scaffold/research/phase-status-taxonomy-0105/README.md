# SCF-B-0105 30 unit phase-status taxonomy研究

`SCF-B-0101`で直接phase gapとして保持した30 unitを、phase authorityへ昇格させず、二つの研究分類へ分ける
research-only Scaffoldである。基準HEADは`5562f04da0f3205f9aa58205ec0d478419fc4f2e`。

- `CROSS_CUTTING_PHASE_REVIEW_PENDING`（20 unit）: 原文がprotocol、security、custody、gate、portability、atomicity、identity、工程制約などの横断条件に見えるが、PHCAP-20の不在だけでphase非適用を導かず、PHCAP-01〜20の全境界をunit原文・Wave候補・追加sourceで照合するまでレビュー保留とする。
- `UNRESOLVED_SOURCE_OR_HUMAN_REVIEW`（10 unit）: re-entry、snapshot、retention、state、prototype、walkthrough、screen gate、canonicalization、source custody、authority境界などについて、追加sourceまたはhuman判断なしにはphase非適用も直接phaseも確定できない未解決。FR-18 Prototype Builder、FR-19 Walkthrough Loop、FR-20 Screen Gateは、Waveのunit-level candidate phase evidenceがPHCAP-01／04／05／06／07／11／15〜20へ接続するため、この分類に保持する。

二分類とも正式phaseは`unchanged_unresolved`、`formal_phase_candidate=null`、`authority_effect=none`、`new_build_allowed=false`である。taxonomyの候補は判断準備のための記録であり、未解決を解消したとの主張、PHCAP／product authorityの変更、要求採否、successor、実装、consumer closureを生成しない。

`units.jsonl`は30 unit全件について、旧IR原文のJSON pointer・line anchor・semantic digest・exact span、Wave1–50の66 edge、旧asset 38件のsource／history／failure／consumer、PHCAP-01〜20全境界のレビュー保留（非適用立証なし）、四製品L1 context、研究候補、判断待ち項目を保持する。`decision-matrix.json`は二分類と、source／authority待ちを分ける三つの排他的ruleを定義する。

`generate.py`と`validate.py`は固定BASEのGit object bytesから再導出・照合する。入力digestはcrosswalk、旧IR、decomposition、asset disposition／decision／copy-read-after、phase-product classificationとmeta、SCF-B-0101の親bundle、Wave1–50、PHCAP-01〜20を含むphase capability inventory、PHCAP-20補助定義、phase分類契約、四製品L1、product boundaryを含む。validatorは固定BASEの30 unit rule map、matrixのrequired_evidenceとunit evidenceのjoin、validate.py内の独立candidate_statement／judgment_waiting.items期待値、inventory宣言leaf、unit識別子・product・PHCAP文脈を完全比較する。旧archiveは静的参照だけで、runtime、CI、test、workflow、hook、adapter、sourceを実行しない。

## 検証

```text
python3 -B scaffold/phase-status-taxonomy-0105/generate.py
python3 -B scaffold/phase-status-taxonomy-0105/validate.py
python3 -B scaffold/phase-status-taxonomy-0105/selfcheck.py
python3 scaffold/tools/scfctl.py validate
python3 scaffold/tools/scfctl.py stale
python3 scaffold/tools/scfctl.py residuals
git diff --check
```

validatorは30 ID網羅、入力digest、BASE祖先性、原文anchor、Wave edge、asset evidence、固定taxonomy map、required_evidence join、inventory／unit宣言、PHCAP／product authority昇格禁止をfail-closedで検査する。selfcheckは22件のtamper負例で期待error codeを照合し、15 unitのrule再割当とstatus_counts追随、phase非適用・phase確定・実装成立の断定を検出する。
