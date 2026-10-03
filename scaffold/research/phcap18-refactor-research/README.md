# PHCAP-18 Refactor research premise candidate

`status: research_premise_candidate`、`authority_effect: none` の静的候補である。基準HEADは
`c354b7d9177ad3ea92dec30c66c36e6ce2d66ae3`（`origin/main`）であり、base SHAは取得時点のmetadataである。
Issue #1906 は作業projectionとして記録するが、semantic authority、要求採否、完了証拠には使わない。

## 調査範囲

PHCAP-18（Refactor）の候補scopeはHELIX-HARNESS、HELIX-OS、HELIX-Web、HELIX-Web-OSである。inventoryが
直接current evidenceとして示すのはHARNESSとOSの2製品だけで、WebとWeb-OSは直接ref欠落を
`unknown`として保持する。隣接L2境界文書の存在から、Web／Web-OSの実装・運用成立を推定しない。

代表旧assetは次の5件に限定した。

1. `LEGACY-ASSET-12E2CD9B07EFAC343ED0`: Refactoring Trigger admission requirements
2. `LEGACY-ASSET-603D0E8D8193914F4AC0`: L5 design refactoring domain model
3. `LEGACY-ASSET-3B8F5F0230F7469B5D11`: L6 design refactoring domain model
4. `LEGACY-ASSET-7EBF2130DE1840722A6B`: 旧 `refactor-candidates.ts`
5. `LEGACY-ASSET-E56701056732E5CF9A1C`: 旧 feedback refactor disposition test

inventoryのphase-level historical summaryは旧到達層をcandidate requirements／L5／L6／L7 implementation/test、
`capability_status: implemented_with_tests`として記録するが、これは旧assetの存在・種別の要約である。個別5件の
ledgerは全件 `implementation_status: unknown`、`disposition: unresolved`、`consumer_refs: []`であり、現行実装・pass・
consumer closureへ昇格しない。

台帳上の5件はすべて `disposition: unresolved`、`implementation_status: unknown`、
`consumer_refs: []` で、append-only判断ログの該当行は0件である。source本文にある
`approved`、設計契約、候補state、test assertionは歴史的記述として行spanとdigestを保全する。
旧runtime、旧test、旧CI、hook、adapterは実行せず、旧testを現行oracleやpass証拠にしない。

## 製品と移行の候補境界

- HELIX-HARNESSは、構造改善の意味保存判定、変更種別、上流・V-pair影響、再検証、差戻し条件を持つ工程契約の候補である。
- HELIX-OSは、観測、finding、候補、scope、採否、割当、結果、効果、失効を管理する候補である。
- HELIX-Webは利用者向けproduct experience、HELIX-Web-OSはservice runtimeとbounded exportの境界候補である。

これらは候補unit／connectionであり、正式owner、successor、要求採否、L2／L11適用、L3／L10実装、
受入、releaseを確定しない。移行判定はinventoryの `degraded_to_candidate` を保持し、旧実装の
再利用・復活・現行oracle化を行わない。

## 残差と検証

source spanは代表5件のbounded sliceで、未選択のrefactor／redesign／retrofit／performance／feedback
assetと全consumer closureは残差である。L5/L6のmulti-phase候補、PHCAP-19との意味分割、4製品の
unit／connection／composite分解、正式な要求・pair・ownerは未解決である。

`validate.py` はarchive bytes、exact span、asset／phase ledger、判断ログ0件、current ref digest、
製品unknown、矛盾保持を静的に検査する。`selfcheck.py` はauthority、実装・consumer・decisionの昇格、
Web／Web-OS direct evidenceの捏造、source改変、旧実行、矛盾削除を陰性例として拒否する。
