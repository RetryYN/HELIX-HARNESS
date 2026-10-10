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

validatorは固定BASE祖先性、holding／register／L1／L1 approval decision／product-boundary入力digest、pre/archive snapshotのbytes・digest・blob、4 path集合、11 candidate／2 contextの全field、raw L1 metadataとeffective approved decisionの分離、既存Binding IDの存在とselected path集合、source-itemごとの先行Binding ID、formal／authority境界を独立定数で検査する。重複Bindingの全体bytes digestは固定せず、selected path集合の実体照合で重複事実を保持する。selfcheckは宣言済み16 negative casesを期待error codeまで照合する。

## 固定入力と旧承認revisionの再照合（2026-10-10）

registerは記録済み期待digestの637行capture（`1c276ab2`）。boundary/作業入口はinventoryに実際に記録された当初BASE `e80cb07c`の固定本文、holdingは同一bytesの移動先を読む。後続のvalidator pin更新は候補/inventoryへ追随しておらず、現在本文と過去の研究入力を混同していた。当初BASEと後続register pin更新の時間的照合は未完。旧14 holdingは歴史metadataであり現在の生存holding数ではない。

11候補は9月17日decisionのWeb SHA `26815032…`／Web-OS SHA `600caa13…`を実際に保持している。validatorが後続の現行参照SHAを候補へ適用していた不整合を訂正し、候補本文とapproved表示を承認された旧exact bytesのsnapshotへ束縛する。Bindingの現行文書pinは比較contextとして別に保持する。上記本文の「current」「承認済み」はこの固定旧revisionの記録として読み、変更後本文や現行authorityへ承認を継承しない。Web/WEB-OSは既決のVision材料である。候補JSON/JSONL・ID・本文・unknown残差は不変。

生成スクリプトも同じ固定読取先へ整合させる。全研究の意味/source/consumer closure・正式successor・要求採否・holding解除・L3再開・Issue closeはこの再照合から生成しない。
