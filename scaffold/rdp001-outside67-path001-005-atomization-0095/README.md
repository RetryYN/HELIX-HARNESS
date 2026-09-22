# RDP-001 outside67 PATH-001..005 source-line atomization (SCF-B-0095)

holding 67件から選んだ5つのpath_revision_pairを、旧本文の意味を変更せずに静的照合した研究束です。固定基準HEADは`72b9f368a044709437841c5e862f01802b1a88ec`、pre-isolationは`2d4991042be55268bac30a8bbcdac45b3865030a`、archive revisionは`064280b5c1c5c98f949e6e3be5ef87cbe4a4b658`です。旧archiveのruntime、test、CI、workflow、hook、adapter、sourceは実行していません。

選択5経路のarchive行分母863行を`line-inventory.jsonl`と`semantic-atoms.jsonl`で一行一記録にし、各行を相互排他的に`atomized_candidate`、`metadata_only`、`composite_unresolved`のいずれかへ分類しました。分類数は`atomized_candidate=10`、`metadata_only=350`、`composite_unresolved=503`です。要求・制約・失敗条件を含む行は、分割根拠が足りない場合も`composite_unresolved`として原文を保持し、`metadata_only`へ落としていません。

四製品はcandidate boundaryだけで、formal product／owner／phase authority／successor／implementation／degradation／failure／consumer／decision／adoptionはunknownです。旧資産台帳のexact hit/no-hit、current counterpartの移設・差分、source／decision／failure／consumer ledgerは証拠境界として記録し、採択・完了・不在を生成しません。semantic atomizationのline partitionは完了していますが、正式要求の採否・再配置・authorityは未完了です。

成果物: `source-pairs.jsonl`（pre/archive/current revision）、`source-snapshots/`（exact static snapshots）、`semantic-atoms.jsonl`、`line-inventory.jsonl`、`legacy-evidence.jsonl`、`source-diffs.json`、`inventory.json`、`plan.json`、`validate.py`、`selfcheck.py`。

```text
python3 -B scaffold/rdp001-outside67-path001-005-atomization-0095/generate.py
python3 -B scaffold/rdp001-outside67-path001-005-atomization-0095/validate.py
python3 -B scaffold/rdp001-outside67-path001-005-atomization-0095/selfcheck.py
python3 scaffold/tools/scfctl.py validate
python3 scaffold/tools/scfctl.py stale
python3 scaffold/tools/scfctl.py residuals
git diff --check
```
