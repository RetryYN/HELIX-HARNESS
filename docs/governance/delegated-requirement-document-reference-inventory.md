# 旧委任要求文書の参照候補holding

status: preserved_pending_classification
machine_ledger: `delegated-requirement-document-reference-holding.jsonl`
ledger_sha256: `627a764420d54dd13df0b340605c25b9f977d36a31954ead35a94cccba0e54f7`
source_document_closure: `delegated-requirement-document-source-holding.jsonl`＋`scrum-reverse-source-line-carry-forward.jsonl`

## 目的

旧v1.3委任文書の意味relation closure 117文書が、frontmatterまたは本文から指す文書を、要求と決める前に見失わない。
各recordは参照元pathとfile SHA-256、参照origin、frontmatter keyまたは本文行、参照先path、archive path、参照先SHA-256、
分類、現在のholdingを保持する。GitHub Issue、旧文書status、参照数から要求採用やauthorityを生成しない。

## 全量

本台帳の抽出対象は、意味relation closure 117文書のうちMarkdown 116文書（file blob保持113文書＋Scrum Reverse行保持3文書）
に現れる、archive内に実在する`docs/`配下fileへのfrontmatter path参照と本文path参照である。同じ行の複数参照と再出現は
別edgeとして数える。非Markdown 1文書は参照元走査の対象外である。Markdown 116文書のうち2文書には該当参照が0件のため、
reference recordを持つ参照元は114文書となる。「117文書から788件」はこの抽出境界と0件の文書を含む表現として扱う。

| origin | record数 | 扱い |
|---|---:|---|
| 意味frontmatter relation | 265 | 117文書のclosureを形成し、file blobまたは既存行台帳でatom化待ちとして保持 |
| その他frontmatter参照 | 52 | PLAN 44、migration provenance 8。要求意味かは未判断 |
| 本文参照 | 471 | 同じ行の複数参照と同じ対象の再出現を別recordで保持 |
| 合計 | 788 | 要求件数ではなく参照edge件数 |

参照先は241文書である。117文書は意味relation closure内、残る124文書はarchive内の分類待ち候補である。分類待ちの
unique targetは、workflow PLAN 74、意味source候補34、process 8、migration provenance 4、その他supporting source 4である。

## 指摘対象の保持

- `docs/governance/ddd-tdd-rules.md`本文が指す`docs/governance/coding-rules.md`を、参照元行と両file digest付きで保持した。
- `docs/governance/l3-progression-authority-rebaseline-2026-07-19.md`本文の実在参照59件を59/59保持した。
  このうち11 targetは意味relation closure内、48 targetはarchive分類待ちである。
- 同文書が列挙するPLAN、process、`document-system-map.md`、`gate-design.md`、extraction plan、design catalog、
  L3 functional文書等を、要求ではないという理由で参照台帳から除外していない。

## 分類と停止条件

`target_class`は参照先の現在の取扱いを示し、要求採否ではない。`meaning_source_candidate`も、人間判断前は候補である。
後続要求PRが分類待ちtargetの意味を利用・縮退・retireするときは、対象blobからatom化して管理層へ別仮登録し、
元reference IDを入力sourceとして保持する。分類待ちを理由なく除外する、参照先がarchiveにあるだけで被覆済みにする、
PLANやprocessを一括して非要求と決める場合はfail-closeする。

`src/`、`scripts/`、`tests/`、`config/`等の`docs/`外path、directoryまたはglob、archiveに実在しない参照先、非Markdown参照元は
788 edgeの分母に含めない。実在するfileは4,020件のarchive asset台帳でbyteを保持し、除外を非要求判断として扱わない。
後続reviewで要求意味または意味sourceと判明した実在fileは、利用前にfile blobまたはatomを管理層へ仮登録する。実在しない参照は
欠落参照として出典行と採否を記録し、存在しないblobを保持済みとは主張しない。

分類待ちtargetを要求意味または意味sourceとして使うときは、そのtarget自身へ
[意味relation closure規則](delegated-requirement-document-source-inventory.md)を再適用する。そこから到達した実在文書は、要求PRの
入力に使う前にfile blobまたは既存行台帳で保持し、管理層へ仮登録する。第一段の参照targetだけを保持して二段目以降を黙って
切らない。
