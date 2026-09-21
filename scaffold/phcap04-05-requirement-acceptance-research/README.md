# PHCAP-04/05 requirement adoption and L11 acceptance research premise candidate

PHCAP-04（要求採否／L2）とPHCAP-05（L11受入）について、旧assetのsource・判断史・failure・consumer、現行4製品のL2／L11境界、candidate phase joinを静的に照合するresearch premise候補である。`authority_effect: none`、両phaseの`new_build_allowed: false`を保持し、要求採否、successor、product owner、実装、受入、CI、release、deployment、consumer closureを生成しない。

基準は`origin/main` `b27e61f079edf64eeddc43eb8095159b19730b94`である。現行PHCAP-04は`draft_containers`、旧側は`documented_with_runtime_support`だが保存source snapshot／旧design／旧codeの状態が混在する。PHCAP-05は`draft`、旧側は`documented_with_test_design_partial`で、test-designとevidence boundaryはあるが全件未実行である。両方ともtransitionは縮退したdraft候補として保持する。

## 旧assetと判断史

選択した代表assetはphase inventory記載の8件である。

| phase | asset | source種別 | 台帳状態 |
|---|---|---|---|
| PHCAP-04 | `LEGACY-ASSET-9F48ADEEB477DCA54039` | L1 business requirements | RequirementSourceSnapshot／source preservation／non-executable |
| PHCAP-04 | `LEGACY-ASSET-B5B5E71B2AF1459D59A1` | L3 functional requirements | Historical／unresolved／implementation unknown |
| PHCAP-04 | `LEGACY-ASSET-02319C2481B9E01698D5` | v1.3 requirement document | RequirementSourceSnapshot／source preservation／non-executable |
| PHCAP-04 | `LEGACY-ASSET-D6339A02201B20481C3F` | requirement authority code | Historical／unresolved／implementation unknown |
| PHCAP-04 | `LEGACY-ASSET-F17ABDB90E1340D09746` | requirement discovery code | Historical／unresolved／implementation unknown |
| PHCAP-05 | `LEGACY-ASSET-B3866EECAF22235E9EB5` | L11 UAT evidence boundary | Historical／unresolved／implementation unknown |
| PHCAP-05 | `LEGACY-ASSET-EA8C51BDF69B34E896AA` | L12 acceptance evidence index | Historical／unresolved／implementation unknown |
| PHCAP-05 | `LEGACY-ASSET-2CA9EFB00A24A7346674` | L12 acceptance test design | Historical／unresolved／implementation unknown |

9F48と02319にはappend-only decisionが各2件あり、source snapshotの保存と訂正履歴を示す。最新のtarget productはunresolved、`draft_candidate`、`pending_human_confirmation`であり、L2採用・product owner・実装・受入のdecisionではない。他の6件にasset ID一致のdecision recordはない。全8件のphase classificationは候補で、PHCAP-04またはPHCAP-05へのadmissionを意味しない。

旧sourceの本文にある「confirmed」「accepted」「test」「authority」「runtime」などの語は、旧revisionの記述・設計・コード形状としてbytes、line span、digestを保持する。selected ledgerの`legacy_execution_performed`は全件falseで、旧runtime、test、CI、hook、adapter、sourceは実行していない。failure／incident／rollbackのreceipt、current implementation、runtime consumerのread-afterはunknownである。

## 現行4製品の境界

- **HELIX-HARNESS**: L2はV-model、要求・設計・検証契約、提供範囲を候補として示す。L11は全件未実行で、旧要求のrouting containerだけでは移管完了にしない。
- **HELIX-OS**: L2は要求正本、採否、trace、Worker／CI／ログ／改善統制を候補として示す。L11は全件未実行で、Issue close、PR merge、旧成功を要求受入へ変換しない。
- **HELIX-Web**: L2は利用者体験と個別要求の候補を示し、L11は対象revision・構成・操作・実結果が未実行である。Web完成、公開、外部サービス操作は成立していない。
- **HELIX-Web-OS**: L2はtenant／job／service runtimeと配備・監視・rollbackの要求候補を示す。L11はHARNESS Version 1と要求合意後の評価を予定する全件未実行案である。

4製品すべてをcandidate unitとし、L2↔L11 pair、HARNESS→OS、OS→Web／Web-OS、Web→Web-OSの関係をcandidate edgeとして保持する。owner、authority、unit／connection／composite split、L2採否、L11実行、acceptance closureは未確定である。

## 未実装・縮退・現行状態の分離

`inventory.json`は、旧phaseの`documented_with_runtime_support`／`documented_with_test_design_partial`、`degraded_to_unapproved_routing_containers`／`degraded_to_draft`、保存sourceの`non_executable_read_only_source`、旧code／design／test-designの`implementation unknown`を別々に保持する。現行L2はdraft、現行L11はdraft、現行implementationとacceptanceは4製品すべてunknownである。旧文書の存在、旧codeの存在、test-designの定義、source preservation decisionから、実装済み・未実装・受入済みを推定しない。

`inventory.json`には8 assetのledger／phase snapshot、23 exact source anchor、8 current L2/L11 ref、8 candidate phase join、decision 4件、failure receipt 0、runtime consumer refs空／closure pendingを収録する。`validate.py`は各snapshot、archive span、current ref、decision、4製品境界、phase join、unknownを再照合し、`selfcheck.py`は34種以上の昇格・改変を拒否する。

```text
python3 -B scaffold/phcap04-05-requirement-acceptance-research/validate.py
python3 -B scaffold/phcap04-05-requirement-acceptance-research/selfcheck.py
python3 -B scaffold/tools/scfctl.py validate
python3 -B scaffold/tools/scfctl.py stale
python3 -B scaffold/tools/scfctl.py residuals
git diff --check
```

正式なL2採否・L11受入・実装・consumer closureが成立した場合は、SCF-B-0039のreplacement手順で差し替える。候補のvalidator合格は、採択、承認、実装、受入、release、deployment、外部作用を意味しない。
