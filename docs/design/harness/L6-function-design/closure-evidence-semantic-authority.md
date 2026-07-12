---
layer: L6
sub_doc: function-spec
status: confirmed
pair_artifact: docs/test-design/harness/closure-evidence-semantic-authority.md
plan: docs/plans/PLAN-L6-78-closure-evidence-semantic-authority.md
---

# closure証跡semantic authority 機能設計

## 1. 目的

`closure evidence-probe`のprocess receiptを、存在しないreview・oracle・runtime observationへ昇格させない。
probeはcommand、時刻、exit、output digest、session/correlationだけを証明する。reviewer identity、review verdict、
PLAN固有oracle/test case、requirement/claim、runtime class/accept statusは別のcanonical receiptまたはtyped reportが
exact joinできる場合だけmaterializeする。

## 2. 契約

- probe receiptだけを入力した場合、`<reviewer>`、`<oracle_id>`、`<test case name>`、`<requirement_id>`、
  `<test_oracle_id>`、`<runtime verification claim>`を未解決のまま残し、`blocked_placeholders`でfail-closeする。
- review evidenceはprobe完了後の独立review receiptへidentity・時刻・scope・verdictをexact joinする。
- structured test evidenceは実reportからcase名・oracle・duration・statusを読み、PLANのverification bindingへexact joinする。
- runtime evidenceはtest processと区別したruntime observation receiptを要求し、unit/fast suiteから
  `runtime_verified/accepted`を生成しない。
- rollbackはtracked evidenceを物理削除せず、rejection/supersede/compensation eventでappend-onlyに訂正する。
- generic fast suiteはgreen commandに記録できるが、PLAN全体DoDやruntime acceptanceを単独では証明しない。

## 3. Vペア

`U-CESA-001`、`U-CESA-002`、`U-CESA-003`、`U-CESA-004`、`U-CESA-005`を
`docs/test-design/harness/closure-evidence-semantic-authority.md`へ定義する。

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-CESA-001 | review authority | probe成功だけではreviewer・review時刻・verdictを確定しない | `tests/closure-evidence-semantic-authority.test.ts` |
| U-CESA-002 | test oracle | generic suiteからPLAN固有oracle・case・record時刻を確定しない | `tests/closure-evidence-semantic-authority.test.ts` |
| U-CESA-003 | runtime authority | probe時刻をruntime観測時刻へ流用せずacceptedへ昇格しない | `tests/closure-evidence-semantic-authority.test.ts` |
| U-CESA-004 | process receipt | command・probe完了時刻・output・provenanceだけを決定論的に埋める | `tests/closure-evidence-semantic-authority.test.ts` |
| U-CESA-005 | compensation | rollbackは物理削除せずappend-only訂正routeを返す | `tests/closure-evidence-semantic-authority.test.ts` |
