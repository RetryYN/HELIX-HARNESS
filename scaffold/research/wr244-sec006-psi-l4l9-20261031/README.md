# WR244 SEC006 project-scope-isolation L4/L9 source comparison

status: scaffold research evidence; authority_effect: none
base: `2684816ad6179cc3535e4a6c297e61d10fd75ca0`
binding: `SCF-B-0201`

## 比較前固定

許可されたL3/L10とL4の選択箇所だけから作ったblind source-only artifactを、既存L9の確認前に#3510 comment 6534222680へ固定した。`blind-source-only.json`はそのbytesのコピーで、SHA-256 `14b28cc8a9e4cee9727d458a6e7fbe175c02a46fed06a5fa57bacb983edd4e22` と一致する。

## 照合結果

比較前artifactの6つの候補意味はすべて、L9の既存negative caseに関連する実例がある。L9の実例から上流の意味を逆算せず、全98 case-negative行と16 residual-negative行をJSON PointerとID付きで`l9-assignment-audit.json`へ記録した。L9 `cases`の98行はいずれも単一findingである。個別のL3/L10義務とL4契約のidentity・tenant・fallback・operation境界は、それぞれ既存行へ結び付く。

L9 `/multi_contract_residual/negative_cases`には実在16行あり、うち13行は複数finding（12行が2件、1行が3件）。13行すべてが、比較後に読んだL4 `diagnostic_contract.sort`の`(code, pointer, return_owner)`順と一致する。この確認は現在の残余入力の順序に限る。blind artifactにあるsynthetic例の順序を正当化したり、新しいclass/caseを作ったりしない。L4のsortは完全一致3要素tupleの一意化を示すが、別occurrence間の意味上のleaf同一性とprovenance保持までは決めない。

## 比較modeとL4/L9の編集判断

L3/L10は失敗条件を示し、L4は比較境界、unknown/fallbackの扱い、集約return owner、およびfindingのsortを示す。QA §3の現行入力はmarkerなしの`legacy_casewise_four_layer`であり、L4/L9/L8/L5のnegative rowsをcasewiseに照合する。L9のfinding codeはcase row直下でなく`expected_observation.findings`内にあり、checkerはrow直下のIDへfallbackする。L8の52 unit IDsとも異なり、L5にfailure_rulesがないため、source-derived family rowをL4だけへ足してもcasewise matcherはL9/L8へ結べない。98行のL4複製で件数を合わせる方法は、既知の#3835重複失敗を再発させる。

QA §3のexplicit modeは4層すべてのmarkerがそろうまでFAILする。L4/L9だけのpartial markerを中間状態として使うこと自体は可能だが、このrevisionではL4/L9 class tableも`negative_class_ref` membershipもなく、完全な6要素key（特にrule宣言由来typed `owner_ref`）を作れる根拠がない。そこで本PR-Aの成果はsource comparisonと全割当監査に留め、partial marker・不完全class・case membershipを新設しない。L9既存expected/oracle、membership、L5/L8は変更していない。

L9 residualの複合negativeを個別integration caseへ昇格せず、L4 class候補も追加しなかった。class keyとownerが未確定のままL8/L9件数を合わせると、QA §3のcase/class区別を壊すためである。#3980 R1 F2/F3の同種指摘を踏まえ、未解決の意味、戻し先、PR-Bでの扱いを`comparison.json#/unmapped_or_unclosed`へ残した。特に、L9にcaseが無いことを理由に上流意味を捨てず、実在multi-findingをsingletonへ分解していない。

## 旧HELIXと失敗事例

旧資産台帳と該当sourceを読み、`comparison.json#/legacy_and_failure_basis`へ記録した。`LEGACY-ASSET-D461943347D372ECF6DA`（旧Security Authorization requirement 24–26、39–40行）および`LEGACY-ASSET-349061A71CEF2554B9A7`（旧 acceptance 14–15行）を意味再導出の起点にした。保持するのはscope軸の分離、missing/unknown時に推測しないこと、operation範囲の限定。旧特権engagement class、追加human gate、broker/runtime/DBは現行へ移さない。失敗事例は#3980 R1 F2（L9母集団を理由に上流意味を削らない）とF3（実在multi-findingを順序付きで保つ）で照合した。

## 検証

現行のscaffold design verification checkerでbefore/afterを計測した。canonical L4/L9を変えなかったため、両方ともlegacy modeで`L4=0, L9=98, L8=52, L5=0`, `matched=0`, `failures=152`, `passed=false`。これは未成立のまま残す結果であり、合格・完了を示さない。checkerは静的な文書照合で、L4 algorithm、runtime、test、CI、旧workflowは起動していない。

`comparison.json`はsource hash、候補意味、legacy/explicit mode評価、QA §3 keyの不足を、`l9-assignment-audit.json`は全rowのID・pointer・既存ordered findingsを、`verification-summary.json`はcheckerとbindingの実測値を、`blind-source-only.json`は固定artifact bytesを保持する。結論は比較前固定artifactの内容、指定baseのL3/L10/L4/L9、およびQA §3に限る。
