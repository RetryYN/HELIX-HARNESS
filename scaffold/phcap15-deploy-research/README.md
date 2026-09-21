# PHCAP-15 Deploy static research premise candidate

PHCAP-15（Deploy）の旧asset、現行4製品の責務境界、phase join、failure／consumer残差を静的に束ねるresearch premise候補である。`authority_effect: none`、`new_build_allowed: false`相当の境界を維持し、要求採否、product owner、successor、実装、受入、deployment実行、consumer closureを生成しない。

基準は最新`origin/main` `b27e61f079edf64eeddc43eb8095159b19730b94`である。PHCAP-15のinventoryは`draft_requirement`、旧代表assetはL13 post-deploy／plan、`documented_partial`、`degraded_to_draft`、`deployment authority、tenant/runtime境界、実装・検証は未成立`と記録する。

## 旧assetと判断境界

選択した代表assetは、PHCAP-15のphase inventoryに記載された次の3件である。

| asset | 種別 | phase join | 台帳状態 |
|---|---|---|---|
| `LEGACY-ASSET-54330A68064B58B22259` | HELIX L13 post-deploy evidence boundary | `PHCAP-15` | Historical／unresolved／implementation unknown |
| `LEGACY-ASSET-1251704E0BE627232E00` | Harness L13 post-deploy evidence boundary | `PHCAP-15` | Historical／unresolved／implementation unknown |
| `LEGACY-ASSET-189702B332643A3BFDAF` | PLAN-L13-00 post-deploy verification master | `PHCAP-07`／`PHCAP-15` | Historical／unresolved／implementation unknown |

3件ともasset ledgerの`consumer_refs`は空、phase ledgerのconsumer closureはpending、`legacy_execution_performed`はfalse、append-only decision ledgerのasset ID一致は0件である。旧sourceに書かれたsmoke、consumer setup、rollback、monitoring、approval、review evidenceは候補契約と歴史的記述として保持する。実行receipt、failure outcome、rollback pass、現行runtime consumerは確認済みと扱わない。

旧sourceはarchiveからbytes、line count、exact span、SHA-256を読み取った。旧workflow、runtime、test、CI、hook、adapterは実行していない。plan本文に残る旧test greenやreview evidenceも、実行の再現や現行oracle適合へ昇格させない。

## 4製品のcandidate boundary

- **HELIX-HARNESS**: V-model、提供範囲、検証契約の境界候補。deployment runtime、Worker、CI、ログ運転の実装証拠はunknown。
- **HELIX-OS**: release準備、artifact受渡し、deployment evidenceの統制候補。展開先runtimeのexecution authorityを吸収しない。現行実装・運用・受入はunknown。
- **HELIX-Web**: 利用者向け操作・表示・サービス体験の境界候補。PHCAP-15の直接deployment evidenceはなく、欠落を未実装とは判定しない。
- **HELIX-Web-OS**: tenant、service runtime、配備、監視、更新、復旧、rollbackの責務候補。L2／L11はdraft／全件未実行で、実装・運用・受入はunknown。

4製品はcandidate unitとedgeとして列挙するが、product owner、unit／connection／composite split、phase admissionは未確定である。Web-OSからOSへの許可log／telemetry exportもcandidate relationに留め、consumer identity、scope、同意、revision、read-after、採否を閉じない。

## 未確定と禁止する推論

deployment authority、tenant／runtime境界の実装、release／配備／監視／復旧／rollbackの実行結果、failure／incident receipt、consumer closure、現行L13／L11成立、意味等価、successor、要求採否、人間decision、旧asset再利用は未確定である。`confirmed`、`accepted`、旧review green、sourceにあるcommand名、current L2／L11 draftの存在から、現行capabilityや完了を生成しない。

`inventory.json`はphase record、3 assetのledger／phase snapshot、12 exact source anchor、4製品9 current ref、5 candidate edge、PHCAP-07を含むphase join、failure／consumer unknownを固定する。validatorはrootから各配列要素までの期待key集合を固定し、failure／consumerのunresolved本文、各anchorのmeaning、verification negative_cases本文を改変不能な期待値として照合する。`validate.py`はこれらのdigest・span・状態・4製品境界・unknownをread-onlyで検査し、`selfcheck.py`はauthority、実装、decision、failure、consumer、product、phase join、inventory key、anchor meaningの昇格・改竄を41件のnegative caseで否定する。

```text
python3 -B scaffold/phcap15-deploy-research/validate.py
python3 -B scaffold/phcap15-deploy-research/selfcheck.py
python3 -B scaffold/tools/scfctl.py validate
python3 -B scaffold/tools/scfctl.py stale
python3 -B scaffold/tools/scfctl.py residuals
git diff --check
```

正式なphase／product／要求成果物が成立した場合は、SCF-B-0037のreplacement手順で差し替える。候補の検証合格は、採択、承認、実装、deployment、rollback、受入、公開を意味しない。
