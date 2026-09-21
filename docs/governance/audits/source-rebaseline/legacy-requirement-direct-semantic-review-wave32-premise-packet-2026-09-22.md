# Wave32 旧HELIX要求直接semantic review premise packet（schema10 research-premise candidate）

## 状態

- batch: `LEGACY-SEMANTIC-WAVE32-2026-09-22`
- worktree: `/home/tenni/.helix-worktrees/legacy-semantic-review-wave32`
- HEAD／stacked parent: `e44a8f0cca1f1147e79753ec91cb404fe37cb772`
- main base: `fbeee47920ed8b2992ae123b00c224ff88987c50`
- main merge parents: `f122d65e1435b4709fbb7b07fbb8e42b70f0b110`、`81144b44b16064bc864b01bd83830455bb7bada3`
- shared input diff（旧main `f122d65e1435b4709fbb7b07fbb8e42b70f0b110` → 指定基準main `fbeee47920ed8b2992ae123b00c224ff88987c50`）: PHCAP04–05 scaffoldの5追加ファイルのみ。Wave32宣言入力は不変。
- admission前停止条件: 指定基準main `fbeee47920ed8b2992ae123b00c224ff88987c50` を維持し、最新mainとの差分とWave31親系譜を再確認する。
- 現行main再確認: `1d7f9a18dd89745b0ed0b9d6d3ed0f9437e47dff` との差分はSCF-B-0045とoutside-67 rows 16–30の6 scaffoldファイルのみ。Wave32の要求source、24 edge、8 product unit、Wave1–31 prior inputには影響なし。
- scope: 8 units / 24 asset edges / 8 confirmed requirement edges / 16 unresolved candidate edges
- cumulative: 111 units / 330 asset edges / 残り107 units（全218 units）
- authority effect: `none`; consumer closure: `pending`; legacy execution: `not_run`; new build: `false`

FR32・FR33は既レビューunitのため再選択せず、FR30・FR31・FR34・FR35・FR36の次の未レビュー要求source atom境界を保持しました。FR30とFR31はHARNESS／OS split、FR34〜36はOSまたはHARNESSの候補unitです。4製品denominatorは維持しますが、Web／Web-OSのunitを推測していません。

## 要求sourceとatom境界

| requirement | raw span | semantic digest | product unit / atom IDs |
|---|---:|---|---|
| HIL-FR-30 | `infinity-loop-platform-requirements.md:120` | `sha256:d4fa1ac2785a9989d6e783094a89324f908a0eb20ab53d3138f51677e4e2cd7c` | FR30-HARNESS A01–A03 / FR30-OS A01–A03 |
| HIL-FR-31 | `infinity-loop-platform-requirements.md:121` | `sha256:9982b94a7b289c1f852d5777f0cd06ee05058d272ef97d06bbc6c3acc720723d` | FR31-HARNESS A01–A02 / FR31-OS A01–A02 |
| HIL-FR-34 | `infinity-loop-platform-requirements.md:124` | `sha256:427b87551182dc6c28a31d4f9617b0625120b63e983b25663da667e3a404676a` | FR34-OS A01 |
| HIL-FR-35 | `infinity-loop-platform-requirements.md:125` | `sha256:bafd3fc712208ecdea2816ae95128150f13f1b918197c309dcb3acae78b013cd` | FR35-HARNESS A01–A02 / FR35-OS A01–A02 |
| HIL-FR-36 | `infinity-loop-platform-requirements.md:126` | `sha256:5a16d19ff108c767c18eac0db68f6af2c3f5400cf751e8e5b9d920cb33a67435` | FR36-OS A01 |

FR30はfinding disposition、局所修正／successor issue、typed disposition／writer return、Issue／Reverse／memory／queue joinへ分割しました。FR31はaffected layerのpair stale化／re-entry taskと、再承認前claim拒否／re-freeze receiptを分けました。FR34はcross-platform OS contract runnerとresult／adapter violationを一つのatomに保持しました。FR35はR0〜R4 stage schema／evidence digestと、空・placeholder・同digest・未被覆・根拠なしno-findingのreject／failure codeを分けました。FR36はdirective custody、duplicate／false-positive反証、accepted-risk／cancel／supersedeのPO receiptを一つのsource spanとして保持しました。

全atomは `product_boundary_pending_human_decision`、`shared_with_units: []` です。source spanは要求IR上で連続し、Wave1〜31既レビューunitのatom／非要求assetとの重複を verifier で拒否します。

## unit候補とunknown境界

| unit | product候補 | direct phase候補 | implementation / degradation |
|---|---|---|---|
| FR30-HARNESS | HELIX-HARNESS | PHCAP-12 | implementation `not_established`、unit degradation未評価 |
| FR30-OS | HELIX-OS | PHCAP-09 / PHCAP-20 | implementation `not_established`、unit degradation未評価 |
| FR31-HARNESS | HELIX-HARNESS | PHCAP-04 / 05 / 06 / 07 / 18 | implementation `not_established`、unit degradation未評価 |
| FR31-OS | HELIX-OS | unknown | phase pool 0、implementation unknown、unit degradation未評価 |
| FR34-OS | HELIX-OS | PHCAP-07 / PHCAP-11 | implementation `not_established`、unit degradation未評価 |
| FR35-HARNESS | HELIX-HARNESS | PHCAP-07 | implementation `not_established`、unit degradation未評価 |
| FR35-OS | HELIX-OS | PHCAP-07 | implementation candidate pool 0、implementation unknown、unit degradation未評価 |
| FR36-OS | HELIX-OS | PHCAP-02 / 04 / 12 | implementation `not_established`、unit degradation未評価 |

phase candidateはcrosswalkの静的候補でありauthorityや採用ではありません。design／implementation edgeはcandidate membershipを保存するだけで、legacy implementation、current implementation、degradation、failure、consumer closureを主張しません。

旧archiveのworkflow、CLI、hook、adapter、runtime、test、CIは実行していません。下流pair、新規build、採用判定、successor assignmentを生成していません。
