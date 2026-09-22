# SCF-B-0121 outside67 Web／Web-OS L1 anchor research scaffold

固定BASE `e80cb07ce7c6d5d59da39ddacaf3694bdc951e6b` で outside67 の既存SCF-B-0096／0099でsource調査済みである4 path（PATH-007／009／010／012）について、追加のL1接続をholding／pre-isolation／archive の静的bytes・digestと current四製品L1候補へ照合する研究束である。Web L1 6件、Web-OS L1 5件の row-sized anchor候補と、README context 2件を保持する。候補は原文と現行L1の接続候補であり、formal requirement unit、phase、実装、縮退、failure、consumer、authorityを生成しない。

`source-items.jsonl` は4 pathのholding選択record、pre-isolation／archiveのcommit・blob・SHA・bytes・snapshotと、各pathを調査済みの先行Binding IDを保持する。`candidate-units.jsonl` は現行L1の11行をsource path／line／digestへ束縛し、phase／implementation／degradation／failure／consumerはすべてunknown、`formal_unit_status=not_generated` とする。`context-records.jsonl` はPATH-009／012 READMEの文脈だけで、unitへ数えない。`source-diffs.json` はarchiveとの差分を観測値として固定し意味変更へ昇格しない。

## 境界

四製品L1本文のraw metadataはdraft／awaiting_parent_approvalだが、`HDEC-CONCEPT-V4.1-AND-FOUR-L1-2026-09-17`の承認decisionと各HDEC-HELIXWEB／HELIXWEBOS-L1-01でeffective statusはapprovedである。このbundleは承認済みL1を入力として扱う一方、研究candidate自体のauthorityはnoneに保持し、outside67旧文書からの要求採択・phase分類・実装成立・縮退・failure／consumer closureを意味しない。既存SCF-B-0057／0062／0080／0081／0084／0088／0091に加え、SCF-B-0096／0099が選択済みのPATH-006〜015集合を重複として明示し、今回の4 pathは先行研究への再接続として保持する。旧資産・archiveは静的bytesの参照だけとし、旧workflow／runtime／test／CIを実行しない。

## 検証

```text
python3 scaffold/rdp001-outside67-web-webos-l1-anchor-0121/generate.py
python3 scaffold/rdp001-outside67-web-webos-l1-anchor-0121/validate.py
python3 scaffold/rdp001-outside67-web-webos-l1-anchor-0121/selfcheck.py
python3 scaffold/tools/scfctl.py validate
python3 scaffold/tools/scfctl.py stale
python3 scaffold/tools/scfctl.py residuals
git diff --check
```

validatorは固定BASE祖先性、holding／register／L1／L1 approval decision／product-boundary入力digest、pre/archive snapshotのbytes・digest・blob、4 path集合、11 candidate／2 contextの全field、raw L1 metadataとeffective approved decisionの分離、既存bindingのselected path集合とsource-itemごとの先行Binding ID、formal／authority境界を独立定数で検査する。selfcheckは宣言済み16 negative casesを期待error codeまで照合する。
