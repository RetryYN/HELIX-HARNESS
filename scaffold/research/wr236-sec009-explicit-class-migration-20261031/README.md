# WR236 SEC009 explicit-class 独立照合

status: scaffold research evidence; explicit four-way migration is not established
authority_effect: none
operation_effect: none
binding: [SCF-B-0197](../../bindings/SCF-B-0197.json)

## 固定したblindと比較範囲

blind classification と層化indexは、比較前にIssue #3510 comment 6533190026で固定されたbytesをそのまま収録した。各artifactのSHA-256はそれぞれ `b060f87a2c7963dac82e9ecf9a70ec7f486f28b4f2ce463418e310b3ce321c5b`、`380ec88fe03a2b5ebe34c2961e42bafdd2d90b46c586be92b0c52b7eb2685fa0`。収録先は `source/blind-classification.json` と `source/blind-sample-index.json`。

blindのL4/L3/L10根拠はbase `f38ee6f21a680a82ef5ecc1c6c4c25ba2f0bda52`。L4はmain `c8f20a4f91456f6d5e5c16e1be0083c34aab6651` と同じbytes（SHA-256 `c0a31c5c663d39854ed1df13b9bf2bfc439fdb46419d089bc617607d6e6ac5b6`）。層化indexのL9 sourceは旧revision `4ba3f600df75aa6e860e0ddf53db68644e1edf98`、SHA-256 `ed74cdc558bd8ba9cad5d8b075eee137bafba9c65e9a4a18bb862c728b646b4f`。比較対象L9は `c8f20a4f91456f6d5e5c16e1be0083c34aab6651`、SHA-256 `62913b58577cfc0f3c7e6682ad160d8f236157a0ceed9c88ef71822330ed60fc`。旧L9はflat `/cases/{i}`、現行L9はcontract別のcase配列であり、選定30件はIDで全件解決、全30件でpointerが変わった。選定30件のexpected projectionは旧/current間で差分0件。

## 比較結果と未決

blind class IDと既存assignmentは30件中29件一致、1件不一致。`SEC009-OS_ASSIGNMENT-ACTIONS-EMPTY` はblindがL4 `/failure_classifications/7`（actions unresolved）を選び、現L9 `/cases/1/negative_cases/35/negative_class_assignment` とexpectedは `/failure_classifications/8` 相当のactions conflictを指す。旧L9 `/cases/109/given/input/instructions/os_assignment/actions` は空list。L4のunresolved説明は非空listでない形を広く含み得る一方、conflict説明は既知action集合との不一致を指すため、空listの分類はL4内で重なりがある。期待値やassignmentを値合わせせず、意味の未決として保持する。

action conflict assignmentは5件で、層化blindはそのうちOS空listの1件を不一致に分類した。残る4 recipientのaction conflictはsample外であり、独立確認は未成立。2 ambiguousと71 multi-contract residualもblind sampleには含まず、割当を追加していない。30件は代表標本で、275 assignment全件のblind確認ではない。詳細pointer・期待差・層別限界は `comparison.json` に記録した。

QA §3のexplicit `owner_ref`規則は、L5 ruleが両方を宣言すると `function_ref` をownerに使い、contract内の宣言functionと整合させる。現L5 failure_rules 30件はsingular `function_ref` と `contract_ref` を持つ一方、3 contractは `function_refs` 配列（2/3/3件）だけでsingular `function` を持たない。明示mode checkerはsingular `contract.function` とruleのfunctionを比較する（`scaffold/tools/design_verification_checker.py` 1735–1743、2381–2394行）。checkerは変更せず、QA・schemaとの不整合を移行blockerとして残す。

運用モデルの `design_verification` は通常一つのV-pairを対象とする。QA §3のexplicit modeはL4/L5/L8/L9の4層markerを同時に要求し、部分markerを拒否する。commit `8125b6fee699dd22d14161f04c0a25e6416586b2` はPR #3897内でOS007の4層文書を同一PRに含めた先例だが、現行の一pair規則を一般に上書きするものではない。checker/schemaと空actions意味が未解決のため、正式4層移行は停止したままとする。

## 静的検証と境界

既存compact候補validatorはPASS：9 source pins、全356 case、30 unique six-attribute typed-owner keys、275 existing assignments、2 ambiguous、71 multi residualを照合し、expected/ID/phase/trigger差分なし。現行 `check-child` はpair照合と4 layer pin/ownership capがPASSだが、markerなしのlegacy modeでL4/L9/L8/L5 counts `30/277/277/30`、matched `0`、failures `310`。これは静的文書checkerの既存結果で、behavioral evidenceやformal four-way成立ではない。

`scfctl validate`は181 bindings / fail 0、`scfctl stale`は0、JSON構文と`git diff --check`はPASS。

正式L4/L5/L8/L9、checker、expected、assignmentは編集していない。認証・認可設定、credentials、実revoke/quarantine/recovery、本番・外部作用、旧runtime/test/CI/algorithm/new runtime/test/CI/L4/L5 algorithmの実行はない。人の上流authorityやoperational permissionは生成しない。actions空listの解釈が承認済み要求意味や操作権限を変える結論に至る場合は、その意味決定のauthority ownerへ戻す。
