# SCF-B-0105 30 unit phase-status taxonomy研究

`SCF-B-0101`で直接phase gapとして保持した30 unitを、phase authorityへ昇格させず、二つの研究分類へ分ける
research-only Scaffoldである。基準HEADは`5562f04da0f3205f9aa58205ec0d478419fc4f2e`。

- `CROSS_CUTTING_PHASE_NA_CANDIDATE`（20 unit）: 原文がprotocol、security、custody、gate、portability、atomicity、identity、工程制約などの横断条件を要求し、PHCAP-20のmemory／continuation／handover／retention機構を直接要求しないという研究候補。unit自身の原文とPHCAP候補がphase境界へ接続する場合はこの分類へ倒さない。
- `UNRESOLVED_SOURCE_OR_HUMAN_REVIEW`（10 unit）: re-entry、snapshot、retention、state、prototype、walkthrough、screen gate、canonicalization、source custody、authority境界などについて、追加sourceまたはhuman判断なしにはphase非適用も直接phaseも確定できない未解決。FR-18 Prototype Builder、FR-19 Walkthrough Loop、FR-20 Screen Gateは、Waveのunit-level candidate phase evidenceがPHCAP-01／04／05／06／07／11／15〜20へ接続するため、この分類に保持する。

二分類とも正式phaseは`unchanged_unresolved`、`formal_phase_candidate=null`、`authority_effect=none`、`new_build_allowed=false`である。taxonomyの候補は判断準備のための記録であり、未解決を解消したとの主張、PHCAP／product authorityの変更、要求採否、successor、実装、consumer closureを生成しない。

`units.jsonl`は30 unit全件について、旧IR原文のJSON pointer・line anchor・semantic digest・exact span、Wave1–50の66 edge、旧asset 38件のsource／history／failure／consumer、PHCAP-20直接判定、四製品L1 context、研究候補、判断待ち項目を保持する。`decision-matrix.json`は二分類と、source／authority待ちを分ける三つの排他的ruleを定義する。

`generate.py`と`validate.py`は固定BASEのGit object bytesから再導出・照合する。入力digestはcrosswalk、旧IR、decomposition、asset disposition／decision／copy-read-after、phase-product classificationとmeta、SCF-B-0101の親bundle、Wave1–50、PHCAP-20、phase分類契約、四製品L1、product boundaryを含む。旧archiveは静的参照だけで、runtime、CI、test、workflow、hook、adapter、sourceを実行しない。

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

validatorは30 ID網羅、入力digest、BASE祖先性、原文anchor、Wave edge、asset evidence、taxonomy重複／欠落、PHCAP／product authority昇格禁止をfail-closedで検査する。selfcheckは13件のtamper負例で期待error codeを照合する。
