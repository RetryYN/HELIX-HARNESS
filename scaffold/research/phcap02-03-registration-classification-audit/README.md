# PHCAP-02/03 登録・分類の証拠gap候補

この候補は、現行 `origin/main=2fa9aca42ff3ffdd5dea9b2186c49ee50db7dc2c` で PHCAP-02（要求登録）と PHCAP-03（要求分類）を静的に監査した記録です。`status` は `research_premise_candidate`、`authority_effect` は `none` であり、要求採否、owner、successor、正式L3/L10、実装、受入を生成しません。候補成果物は `scaffold/` 配下だけに置いています。

## 登録・製品・phaseの欠落

現行の管理仮登録は32件すべて `source_holding` / `unassigned_cross_product` で、`requirement_candidate` は0件です。別の153件のproduct routing bootstrapは全件でHELIX-HARNESS、HELIX-OS、HELIX-Web、HELIX-Web-OSを評価し、4件のproduct evaluationを持ちますが、PHCAP-02/03とのphase fieldは全件にありません。routingの候補はsingle 87、split 65、connection 1で、successorは153件すべて未割当です。

PHCAP-02のcapability current/evidence productsはHELIX-OSだけ、PHCAP-03はHELIX-HARNESS/HELIX-OSだけです。このcapability scopeを変更する根拠はありません。欠落しているのは、登録されたrequirement origin／target productとsource atomを、四製品routingのincluded/excluded/unresolved評価へrevision付きでtraceするphase joinです。routing候補をphase capability targetやphase authorityへ昇格できません。

## 旧assetの実装・failure・consumer状態

phase/product bootstrapからPHCAP-02は42件、PHCAP-03は161件を集計しました。PHCAP-02は旧実装状態unknown 40件とnon-executable read-only source 2件、PHCAP-03はunknown 160件とnon-executable read-only source 1件です。両phaseとも全件で旧実行はfalse、consumer closureはpending、decision recordはnullです。

代表7assetは source digest と exact anchor を保持し、disposition は `Historical/unresolved`、asset-level implementation は `unknown`、consumer refs は空、execution はfalseです。旧sourceと旧testはfailure条件・設計契約・pure validatorの記述を調べるためにread-onlyで参照しました。旧runtime、test、CI、hookは実行せず、旧記述を現行oracle、pass、implementation、degraded/unimplemented観測へ変換していません。

## holding外67 pathとの重複

既存の67-path監査 report は全67件がpathベースの候補で、旧asset catalog recordは0件です。内訳はL1 4、L2 6、shared design 4、L11 5、upstream/crosswalk 48です。製品別pathは各4件、shared-cross-productは51件です。

この67件にはPHCAP-02/03の直接phase joinは0件です。L2の6件とupstream/crosswalkの48件は登録・分類の上流候補または隣接資料として残りますが、要件atom、登録identity、phase責務と断定しません。L1とL11の資料も今回の登録・分類の直接証拠ではありません。対応するdigestと分母は inventory の `outside_holding_67_audit` に固定しました。

## 検証

```text
python3 scaffold/phcap02-03-registration-classification-audit/generate.py
python3 scaffold/phcap02-03-registration-classification-audit/validate.py
python3 scaffold/phcap02-03-registration-classification-audit/selfcheck.py
python3 scaffold/tools/scfctl.py validate
python3 scaffold/tools/scfctl.py stale
python3 scaffold/tools/scfctl.py residuals
git diff --check
```

`validate.py` は現行台帳のdigest、phase snapshot、4製品routing、仮登録、代表assetのsource span、旧実行禁止、67 pathの隣接判定を静的に照合します。`selfcheck.py` はauthority・successor・Web製品・phase join・implementation・failure・consumer・decisionの昇格を21件の陰性例で拒否します。

正式な要求登録、製品責務、分類projection、実装、failure/degraded/unimplemented判定、consumer closure、L3/L10、外部API・Issue・PR・DB・CI・deploymentは未確定です。origin/mainが変化した場合は再baselineしてから使用します。
