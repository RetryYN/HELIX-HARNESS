# outside67 製品境界 source research（Scaffold）

この束は `MPR-SH-OUTSIDE67-001` の67 `path_revision_pair`から、製品境界に直接関係する5件を静的に調査する候補です。既レビューの`OUTSIDE67-PATH-008`／`011`は#2007の選択済みとして除外し、同PR差分内に参照が混入する`001`／`010`もsource／unit重複回避の除外リストへ置きました。分母67、既レビュー2件、今回5件、今回後の未調査60件を固定します。今回の検証幅は5件で、安全な拡大上限は断定しません。

今回の選択は次の5件です。

- `059`: HARNESS、HELIX-OS、HELIX-Web、HELIX-Web-OSの責務、所有、runtime、改善loop、状態分離を直接記録する境界文書。
- `063`: HARNESS L11。外部提供、複数productの検証、製品別L11/L10/L12、WebをHARNESS完成へ混入させない条件を含む。
- `064`: HELIX-OS L11。内部統制、製品scope、HARNESS外部提供、Web／Web-OSとの要求・state・log境界を含む。
- `065`: HELIX-Web-OS L11。tenant／service runtime、HARNESS能力、HELIX-OSへの許可log連携を含む。
- `066`: HELIX-Web L11。Web利用、Web-OSからHELIX-OSへの運用log、HARNESS Version 1前提の分離を含む。

pre-isolation revision `2d4991042be55268bac30a8bbcdac45b3865030a` と旧archive revision `064280b5c1c5c98f949e6e3be5ef87cbe4a4b658`をGit objectからread-onlyで取得し、各source snapshot、blob OID、SHA-256、bytes、line anchor、diffを保持しました。`059`は旧Concept link pathが変化し、`064`はroute拒否の反例追加と旧L11候補link pathの変化があります。差分の意味同値や採否は判断していません。旧資産のruntime／test／CI／hook／adapterは実行していません。

`product-units.jsonl`はsource全体を要求atom化した台帳ではありません。製品境界に直接関係するsource lineを、四製品候補とpath由来phase候補へ束縛した研究候補です。actor／action／condition／guard／sequenceはsource fragment外から補完せず`unresolved`で保持し、選択lineを重複計上しません。残りのsource lineはsnapshotに保存したまま未調査です。

各product unitの`normalized_statement`、`retained_meaning`、`unresolved_questions`、`diff_observation`は独立recordとして固定し、固定keyset・status・source referenceをvalidatorで検査します。validatorにはsource IDごとの独立canonical tableを置き、candidate product、phase、source path、selection reason、pre／archive line anchorとcommitをproduct-units側の値とは別に照合します。inventory scope、source_anchor直下keyset、revision commit、holding/register pathを固定し、scopeの全非digest文字列をcanonical定数と照合します。`source_fragment`はpre-isolation anchorと一致し、normalized statementはその逐語fragmentだけを保持します。inventoryの`findings`（F001–F007）、`unresolved_questions`（Q001–Q007）、`prohibited_inference`（P001–P007）もid／status／textの固定record配列です。未知key、件数、順序、statusの改変は負例で拒否します。

旧資産明細、判断ログ、copy/read-after、phase/product分類、implementation crosswalkのpath／pre blob／archive blobを静的に照会しました。選択5件は既存holdingでcatalog record 0、human decision ref null、exact ledger key matchなしです。この観測は「不在」「未実装」「正常」「廃止」「consumer不要」を意味しません。legacy／current implementation、legacy／current degradation、failure、consumer、decision、phase authorityはunknownのままです。

この束は正式要求、current requirement、successor、L2／L11合意、L3／L10設計、実装、受入、release、deploymentを生成しません。bindingは`SCF-B-0062`です。旧binding 0058はmain側で既使用、0061は別束が予約しているため、0062を使用します。

## 検証

```text
python3 scaffold/rdp001-outside67-product-boundary-062/validate.py
python3 scaffold/rdp001-outside67-product-boundary-062/selfcheck.py
python3 scaffold/tools/scfctl.py validate
python3 scaffold/tools/scfctl.py stale
python3 scaffold/tools/scfctl.py residuals
git diff --check
```
