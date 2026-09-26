# 旧HELIXからの移行作業の記録・台帳

このフォルダには、旧HELIXから新世代へ要求と資産を移す作業で作った台帳、待ち行列、wave記録、inventoryを、種類ごとに置く。
現行の規則文書ではない。規則・運用・モデルは[`governance/`直下](../)の文書（[作業入口](../new-generation-start-here.md)、
[上流authority状態モデル](../authority-state-model.md)、[旧要求の無損失carry-forward方針](../legacy-requirement-carry-forward-policy.md)、
[旧資産の完全一致再利用統制](../legacy-asset-reuse-control.md)等）が持つ。

2026-09-26のPO判断で、これらを`governance/`直下からこのフォルダへ移した（[判断記録](../decisions/governance-legacy-migration-layout-po-decisions-2026-09-26.md)）。
移したのは置き場所だけで、台帳の行、ID、状態、digestは変えていない。Markdownの文書は、相対リンクを新しい深さに合わせた部分だけが変わった。
台帳の中や、判断記録・監査記録・研究記録の中にある旧path（`docs/governance/<file>`）は当時の記録であり、判断記録の対応表で新pathへ辿れる。

| フォルダ | 置いてあるもの |
|---|---|
| [`requirement/`](requirement/) | 旧要求153件・旧要求文書22件のcarry-forward台帳、semantic line・structural heading・補助sourceの保全台帳とinventory、atom化review queue、要求と旧実装のcrosswalk bootstrap、refinement・system contractのproduct routing候補 |
| [`semantic-review/`](semantic-review/) | 旧要求と旧資産のdirect semantic review wave 1〜36の台帳とmeta。wave 37〜50は`scaffold/legacy-semantic-review-wave*/`にある |
| [`ir/`](ir/) | 旧Requirement IR 153件のdocument source relation、product routing（bootstrap・訂正・queue）、product unit分解、システム群分類、再配置wave台帳と各waveの再配置queue、人間判断候補の意味分解、対象未解決の判断packet |
| [`identity/`](identity/) | confirmed文書で宣言された175 identityのcarry-forward台帳、product routing候補、システム群分類 |
| [`candidate/`](candidate/) | 旧candidate要求源の全行保全inventoryと行台帳 |
| [`delegated-document/`](delegated-document/) | v1.3が委任した旧要求文書のfile blob保全・参照holdingとinventory、同じ委任closureに含まれるScrum Reverse旧source行台帳とinventory |
| [`harness-workflow/`](harness-workflow/) | HARNESS工程要求の旧source条項台帳と被覆監査 |
| [`rule-atom/`](rule-atom/) | 旧ルール群の規則atom 7,622件の台帳と出どころfile台帳 |
| [`pre-isolation/`](pre-isolation/) | archive隔離直前までのrevision差分source holdingと、outside-67 source holding |
| [`asset/`](asset/) | 旧資産4,020件のphase・product分類bootstrapとmeta |

旧資産の明細台帳（`legacy-asset-disposition.jsonl`）、個別判断ログ（`legacy-asset-decisions.jsonl`）、copy read-after（`legacy-asset-copy-read-after.jsonl`）は、
[判断ログ契約](../legacy-asset-decision-log.md)がpathを参照形式として定める現行の台帳なので、`governance/`直下に残した。
