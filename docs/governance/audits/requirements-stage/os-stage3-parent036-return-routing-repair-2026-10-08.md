# HELIX-OS Stage 3 親036：戻し先とpolicy source境界の限定補強監査（2026-10-08）

## 対象

baseはremote main exact `3c6372ebd57674b90310843ea2454eda659558ad`。変更は `HELIXOS-L2-036` のFR AC-02/03/04、FV CASE-036-02/04/08bだけです。固定L2/L11、PO採択行、G0、旧sourceとpolicy source/owner関連の既存親を再読し、本文と根拠のsource revisionを分けてpinしました。

## Fixed sourceへの整合

固定親のauthority basisは633bf12（#2554統合時点）、PO row `po-decision-2026-09-29-57candidates.md:59`、採択registration `MPR-RC-HELIXOS-L2-036-001`、version target 1.0、G0 Stage 3です。633bf12でのL2全ファイルSHA-256は `c530b01d…`、L2:1033–1064 raw spanは `1db82b6f…` です。base d629での全L2ファイルSHAは `97f9158b…` でしたが、先行限定監査のJSONでこれを固定633bf12の全ファイルSHAとして誤記していました。新監査JSONで役割を分離し、旧監査は時点記録として変更していません。633bf12とd629で036 spanは同一bytesです。L11:624–636も633bf12の正しいrevisionに対して全file/span SHAを再計算しました。

固定L2:1053のreturn分類に従い、ticket identity・source/target revision・選択scopeのtuple mismatchだけをOS-L2-010へ戻す期待をAC-02/04とCASE-036-02/04に明記しました。oracle/duty不足はHARNESS-L2-005、preflight source/evidenceまたは技術的適用性/result unknownは該当する既存source/domain owner、authority/resourceは既存SECURITY/INFRASTRUCTURE/OS経路に残し、他failureの返却先は変更していません。

## policy selectionの範囲

固定HARNESS-L2-005はticket/change/layer/riskに基づくverification dutyと証拠条件を導き、CIの構成・運転はOS検収が担います。固定OS-L2-010はHARNESS工程部品をticketへcompositionする規則、OS-L2-019はprovenance/未完義務の継続、SECURITY-L2-007/008は実行制約とoperation authorityを定めます。いずれも他のread-only verify policy一般の選択主体とは読めません。固定L11:634は、非upgradeに該当する既存HARNESS dutiesと「他のread-only verify policies」を維持することを受け入れますが、選択主体を特定していません。

旧registryの `RETROFIT_STANDARD_SAFE` はHistorical/unresolvedなread-only `HELIX_DOCTOR` verify bindingで、限定された `applies_when` を持ちます。これを現行policy-selection authorityにしません。そこでAC-03はHARNESSが導くverification dutiesと、入力で選択・適用済みと示される他のread-only policyを分けます。CASE-036-08bはその入力済みpolicy一件だけを抑止する単独負例とし、欠落を当該既存policy source/domain責務へ返します。source/owner自体がunknownならunknownのままsource/domainへ戻し、HARNESS/OSにselector authorityやownerを新設しません。

旧requirements v1.3:624は全upgrade preflightの直接起点、旧Retrofit手順:30–39,84–87は影響評価中の順序とfail時のplan停止、旧Concept:445,470–479はupgrade/high-risk/config_driftの歴史上の区別として読みました。旧ConceptにあるTL approvalを復活させず、旧registryやconsumerの実行は行っていません。旧L5/L6 consumerの限定読みは前段の不変監査に記録しており、この補強では対象外です。

## 監査・検証の限界

JSONに633bf12固定parent全file/span SHA、最新mainでのcurrent six body SHA、L2-010/L2-019/HARNESS-005/SECURITY-007/008の支援span、旧source/台帳、各変更行の前後raw SHAを記録しました。CASE-036の10 IDは一意で、親036関連行は六本文すべてで対象を限定して再pinしています。

この変更は既存の固定戻し先を明記する追補であり、新しいowner、selector、gate、承認、数値閾値を導入しません。旧限定監査の誤ったL2 full-file hash claimは本追補だけで訂正し、旧ファイルは変更していません。`git diff --check` とJSON/pin静的検査以外の実行はせず、fixture、旧runtime/CLI/hook/CIは起動していません。新本文の独立review待ちです。condition 3、PO事後確認、L10実行、実装許可や274親意味完了は生成しません。
