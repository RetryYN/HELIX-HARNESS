# PHCAP-14 Release research premise candidate

`status: research_premise_candidate`、`authority_effect: none`の静的候補である。基準は
`569d7373c32287bbafadeec6043472563937c5c7`（`origin/main`、2026-09-22取得）であり、Issue #1902は意味authorityに使わない。

PHCAP-14のinventoryはphase全体を`L3`、`L7 implementation`、`L10 system test design`、
`implemented_partial_with_test_design`と記録する。この値は旧phaseの代表assetに対する歴史的要約であり、
個別assetの現行実装、release、publish、promotion、rollback passを示さない。選択した4 assetは台帳で全件
`disposition: unresolved`、`implementation_status: unknown`、`consumer_refs: []`、判断ログ該当0件である。

## 固定した旧assetと証拠境界

代表assetは次の4件である。archive本文は実行せず、`inventory.json`へ15個のexact source spanとbytes digestを保存した。

| asset | 役割 | source span |
|---|---|---:|
| `LEGACY-ASSET-9B7682EBDEA171005D45` `distribution-package-release-requirements.md` | artifact、consumer、promotion、rollback、authorization | 5 |
| `LEGACY-ASSET-A2F6A697D7FFFD490B57` `release-module-bundle-composition-requirements.md` | module／bundle、static failure、promotion、rollback、deploy分離 | 6 |
| `LEGACY-ASSET-6C9D2BE4E3C77D78F8EB` `distribution-package-release-system-test-design.md` | L10 oracle、negative、evidence schema | 2 |
| `LEGACY-ASSET-4C97F9E72F120F6B664E` `release-automation-decision.ts` | dry-run、approval、apply禁止のdecision候補 | 2 |

旧ADR-008、ADR-005、rollout roadmap、artifact/profile catalog、rollback plan、distribution acceptance testも
decision／failure／consumerの対応referenceとして読み、`related_reference_assets`へ記録した。いずれも現行へcopyせず、
台帳状態を変更していない。旧runtime、旧test、旧CI、hook、adapterは実行していない。

## 製品別のcandidate boundary

- **HELIX-HARNESS**: release composition crosswalkとartifact契約のcurrent candidate refがある。提供機能の構成、依存、artifact identity、検証義務、組合せ受入の候補を保持する。正式publishや実装の成立は未確認である。
- **HELIX-OS**: HARNESS提供版の導入・更新・復旧とartifact受渡し・運用証拠を担うcurrent candidate refがある。展開先runtimeのexecution authorityを吸収しない。
- **HELIX-Web**: L1/L2/L11は利用者向け構成版・依存・成果表示の隣接候補で、PHCAP-14のartifact identity、promotion chain、rollback authorityのdirect refはない。欠落は`unknown`であり、未実装とは判定しない。
- **HELIX-Web-OS**: L1/L2/L11はservice release、deployment、monitoring、restore、rollbackの隣接候補である。文書はdraft／未実行で、PHCAP-14のcurrent implementation、promotion evidence、rollback passは未確定である。

製品対象の母集団は4製品、inventoryのcurrent.evidence_productsはHARNESS／OSの2製品、direct current refは5 span、
Web／Web-OSのadjacent refは7 spanである。phase candidate assetは123件、phase×product candidateは31件で、
この候補の代表asset 4件以外は残差として扱う。

## 未確定と禁止する推論

製品unit／connection／compositeのsplit、formal owner、successor、要求採否、L2／L11 freeze、L3／L10実装、
current release、production applicability、意味等価、置換・退役、consumer closureは未確定である。旧sourceの
`confirmed`／`accepted`／test assertion／plan-only decisionをcurrent authority、implementation、oracle、passへ昇格しない。
Web／Web-OSのdirect ref欠落から未実装を推定しない。promotion actor separation、artifact digest continuity、
consumer bytes preservation、rollback evidenceは歴史的candidate obligationのままである。

`inventory.json`はphase／asset ledger、decision history、failure／consumer evidence、current product boundary、
4つの矛盾、12個の残差を固定する。`validate.py`はarchive bytes、exact span、ledger状態、current ref digest、
product gap、矛盾と未確定を検査し、`selfcheck.py`はauthority／direct evidence捏造、digest改変、実装／consumer closure昇格、
decision履歴捏造、旧実行、矛盾削除を陰性例として拒否する。
