# PHCAP-15/17 candidate-pool membership semantic edge audit

これは `legacy-requirement-implementation-crosswalk-bootstrap.jsonl` の候補集合だけで
接続された二つの旧assetについて、69件の requirement-unit membership を逐語 source 契約と
旧sourceへ静的照合した research scaffold である。候補 phase／製品 membership、一般語の一致、
asset の存在だけでは direct semantic link を作らない。

対象は次の二つである。

| 旧asset | candidate membership | source | 結果 |
| --- | ---: | --- | --- |
| `LEGACY-ASSET-189702B332643A3BFDAF` | 68 | `PLAN-L13-00-post-deploy-verification-master.md` | 68 unknown |
| `LEGACY-ASSET-4618C7243C283228809A` | 1 | `incident-runbook.md` | 1 unknown |

crosswalk の各行に保存された `source_text_spans`、`source_requirement_id`、semantic digest を
validator が逐語で読み直す。69 membership 全件について旧source内の requirement ID および
source span の exact match は 0 件であり、candidate pool の所属だけから affirmative や
negative を導かないため、分類は `unknown` である。`negative` は明示的な契約矛盾を示す
証拠がある場合だけ使うが、この bounded audit ではその証拠も無かった。

旧sourceの anchor は inventory に行範囲、逐語本文、SHA-256、意味上の役割を記録した。
Plan asset の P1/P2 は source の接続候補（historical review／embedded commands）を、P3/P4 は
scope と外部 rollout exception を、runbook asset の R1/R2 は runbook scope／observability を、
R3/R4 は production connection／recovery を、R5 は未完了 checklist／exception を表す。
これらは source 契約の読解 anchor であり、現行 authority、実装、運用、acceptance、consumer
closure を生成しない。

asset ledger は両方とも `Historical`、`disposition=unresolved`、`implementation_status=unknown`、
consumer refs 空、decision record 無、execution false／unreviewed である。failure、consumer、
decision の証拠は bounded search で 0 件とし、consumer closure は pending のまま保持する。
runbook の `FR-L1-16` は旧文書中のスキル記載であり、`HIL-NFR-17` の requirement-unit との
直接契約にはしない。

この成果物は `scaffold/` 内だけの research premise で、authority effect は `none`、正式要求・
successor・実装採用・phase admission は生成しない。archive は静的 bytes と行spanを読むだけで、
旧workflow、runtime、CLI、hook、adapter、source、test、CI は実行しない。

## 検証

```text
python3 -B scaffold/phcap15-17-membership-edges/validate.py
python3 -B scaffold/phcap15-17-membership-edges/selfcheck.py
python3 -B scaffold/tools/scfctl.py validate
python3 -B scaffold/tools/scfctl.py stale
python3 -B scaffold/tools/scfctl.py residuals
git diff --check
```

Binding は `SCF-B-0053`。置換先、正式artifact、human decision、consumer closure は未設定である。
