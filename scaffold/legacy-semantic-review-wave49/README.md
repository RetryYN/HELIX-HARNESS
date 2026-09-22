# Wave49 legacy semantic review Scaffold

Wave48/#2042 の merge commit `15c2a145c06aedb4e1a081e288e5b302dc4182cf` と後続 merge を含む最新 main base `d340ea82723c01fece5610dceea8eff81e03b686` を起点に、残8 unitから HIL-TR-04／05／06／11 の6 unitを bounded research candidate として静的照合する。Binding は `SCF-B-0094`。先行 Wave48 の candidate HEAD `3feadfbc3be690bed7cf7b98c41a4ab50d40a5c0` を lineage に固定する。

選定理由は、platform 優先順位、OS adapter と cross-platform smoke、dependency／runtime 再現性、Node/Bun cutover の技術的境界を同じ TR 系列で照合できるためである。TR-04 は phase candidate が未確定であり、NFR-20／NFR-22 は意味系列が異なるため次候補へ残す。TR-04 の両製品行と TR-05 の HARNESS／OS 行は、decomposition が示す共有 source span を `shared_source_span` の typed relation として保持し、製品ownerを推定しない。

対象unitは次の6件である。

- `IRUNIT-HIL-TR-04-HELIX-HARNESS`
- `IRUNIT-HIL-TR-04-HELIX-OS`
- `IRUNIT-HIL-TR-05-HELIX-HARNESS`
- `IRUNIT-HIL-TR-05-HELIX-OS`
- `IRUNIT-HIL-TR-06-HELIX-OS`
- `IRUNIT-HIL-TR-11-HELIX-OS`

旧 requirements 原文、decomposition、保存 markdown の exact source span を保持し、旧 asset catalog、source、decision/disposition、failure/read-after、consumer を静的に照合した。Wave49 は10 role edge、11 semantic atom、6 composite unresolved、4 selected role asset、8 inspected legacy asset、8 missing evidence receiptである。累計は216 unit／595 edge、残2 unitとなる。この数字は旧IR reviewの進捗であり、四製品の完了率・owner・現行実装率ではない。

missing role ごとに candidate／consumed／examined-not-selected／unexamined asset ID を再計算して記録する。unexamined 候補も selected asset も、正式 authority、current implementation、degradation、consumer closure、phase admission の証拠へ昇格しない。authority effect は none、implementation／degradation は unknown、consumer closure は pending、legacy execution は not run とする。

archive は source、判断史、failure、consumer の静的 reference として読むだけで、旧 runtime、test、CI、workflow、hook、adapter は実行しない。新規実装、owner決定、successor割当、release、deploymentは生成しない。

Wave48 exact HEAD または main が変わった場合は rebaseline してから review 依頼へ進む。merge、close、post-merge read-after は実行しない。

検証経路:

```text
python3 -B scaffold/legacy-semantic-review-wave49/generate.py
python3 -B scaffold/legacy-semantic-review-wave49/validate.py
python3 -B scaffold/legacy-semantic-review-wave49/selfcheck.py
python3 scaffold/tools/scfctl.py validate
python3 scaffold/tools/scfctl.py stale
python3 scaffold/tools/scfctl.py residuals
git diff --check
```

`validate.py` は最新 main merge lineage、Wave48 exact HEAD、source／asset／decision／failure／consumer receipt、unit／edge／atom、独立 phase／product pool、candidate accounting、shared source relation、authority／implementation／degradation boundaryを fail-closed に検査する。`selfcheck.py` は同じ validator 経路で負例を検査し、Wave48 の template 残留も拒否する。
