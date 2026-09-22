# Draft PR

## Title

research: add selected legacy implementation evidence strength scaffold (SCF-B-0115)

## 目的

固定BASE `0d51a994f418450efc40438244f0552e428fc207` の正本crosswalk候補218 unit（BR 49、FR 93、TR 16、NFR 60、153 source ID）から各family 5 unitを選び、旧実装状況をunknown一律で終わらせないための追加研究束を作成する。選定した20 unit（HELIX-OS 16、HELIX-HARNESS 4）について、旧source本文・test候補・判断史・failure finding／receipt・consumer参照を固定BASEの静的bytesで読み、旧implementation、degradation、failure、consumer、current implementation、acceptanceを別partitionで記録する。

この変更はresearch-only Scaffoldであり、formal crosswalk、authority、successor、実装claim、受入、完了を変更しない。candidate／source／design／test候補／implementation／failure／acceptanceを混同せず、直接証拠のないstatusはunknown／pendingのまま保持する。旧code／test／runtime／CIは実行しない。

## 変更内容

- `inventory.json`へ候補218 unit／153 source IDと、family quota 5・score順・unit ID順の固定選定規則を記録し、20 unit／60 edge／38 old asset／598 Wave scan row／180 current context refの分母を固定する。
- `evidence.jsonl`へunit別source anchor、Wave1〜50 edge、edge別anchor hash provenance、旧assetのsource path／Git blob／body byte・line数・body digest、ledger／判断史／failure／consumer、counter-evidence、未解決を記録する。
- 旧implementation_sourceとtest_designは候補source存在の静的証拠として保持する。旧unit実装成立はunknown、旧degradationはunknown、旧failureはreceipt不在のためunknown、consumer closureはpending、現行implementation／acceptanceはunknown、未実装はnot_assessedとする。
- unit edge／assetの件数・多重集合・重複、代表asset完全record、旧asset ledger、partition、strength assessment、inventory宣言、固定BASE祖先性・input digestをvalidatorで再導出する。
- 25負例でsource／anchor／edge／asset／ledger／partition／strength assessment／current／未実装／inventory／BASEの改竄を期待error codeと照合する。
- bundle全成果物をBinding `SCF-B-0115`へ登録する。

## 検証

```text
python3 scaffold/implementation-evidence-strength-0115/build.py
python3 scaffold/implementation-evidence-strength-0115/validate.py
python3 scaffold/implementation-evidence-strength-0115/selfcheck.py
python3 scaffold/tools/scfctl.py validate
```

期待値は `20 selected units / 60 semantic review edges / 38 old assets / 598 Wave scan rows / 180 current context refs`、validator PASS、selfcheck 25負例PASS、scfctl fail 0である。stale／residual／diff checkも実施する。

#1813は進捗参照のみとし、Issue close、merge、formal crosswalk／authority／successorの変更は行わない。旧code／test／runtime／CIと現行runtime／CIは実行しない。

## 未解決

旧unit implementation成立、旧unit-level degradation、旧failure receipt、consumer closure、current implementation／operation／acceptance、未実装判定、product／phase authority、successor assignmentは保留する。source本文の存在、catalog implementation_source、test_design、phase transition、coverage.failure、consumer refs、validator合格から実装・縮退・failure・未実装・受入・完了を生成しない。
