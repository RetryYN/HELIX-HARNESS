# Scaffold研究束の公開前検証（2026-10-04）

Web統合PR #2558の正式merge後main `0c693b271bae23eb9c7cb7c65f79c9c155c18103`を取り込み、exact HEAD `fff122ada2eccddee11a5738512e2f3c4d8d48fe`で現行静的validator137件を実測した。82成功・55既存失敗、timeout0、所要241.3秒。Webの検証HEAD `1014ef9d0e39197dfa0e9d9cda77d58d3bc6c832`と移動対応を合わせた全137件のexit codeが一致し、新規失敗0件。既存55失敗を合格に置き換えていない。各readerの実SHAと出力は同梱JSONに保持する。

移動直後64beの79成功・58失敗と、3件のtargeted修正の記録は既存 `scaffold-reader-closure-2026-10-04.md` を参照する。本測定は全件の補正後結果であり、以前の7bや401の未測定状態を合格証拠に代用しない。旧CI・archive runtime/testは実行していない。

140 roots・1,198件の旧→新pathは `scaffold-web-local-integration-2026-10-03.json` の対応表を保持し、今回の正式base Git bytesと全targetを独立に照合した。同一bytes932、変更266、missing0。401から追加で変わった研究sourceは3 validatorのみで、旧／新SHAを本JSONへ記録した。固定sourceとsnapshotは不変で、現在の物理readだけを新pathへ追随した。

143 Bindingの401からのwhole-field比較はSCF-B-0048のcurrent validator SHA一leafだけの差で、意味fieldとreason/noteの変更0件。登録台帳1,075行は正式baseと全bytes同一、SHA-256 `520216521f09b7a9bc77a8c9b9a7d7a836f9ff457bfebcbd6560f17700eee5de`。scfctl validate143/fail0、stale0、residuals0、diff検査合格。

旧起点・配置判断・全移動SHA対応は既存local統合監査に記録した旧repository-structure（LEGACY-ASSET-FDBA655B1CFF75DCDC0E）、旧research D3D07、HIL-FR-53対応L3を参照する。過去監査を書き換えず、この時点測定を追補する。要求採択、L3承認、retire、formal artifact authorityはこの監査から生成しない。
