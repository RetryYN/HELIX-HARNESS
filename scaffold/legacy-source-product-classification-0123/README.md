# SCF-B-0123: 五つの旧実装source領域59件の製品責務候補研究

固定BASE `5562f04da0f3205f9aa58205ec0d478419fc4f2e` の phase-product bootstrapから、`product_classification_status=unresolved` かつ `artifact_evidence_kind=implementation_source` の旧assetを、次の五つのsource領域で全件再導出した。

- `src/workflow/` 15件
- `src/setup/` 14件
- `src/cli/` 10件
- `src/requirements/` 10件
- `src/shared/` 10件

旧source本文はBASEのGit objectから静的に読み、各assetにsource blob／bytes／SHA-256、具体的なline spanとline text digest、phase、disposition、旧decision／failure／consumer参照、四製品L1と`product-boundary`の反証を保持した。旧archiveのruntime、test、CI、workflow、hook、adapterは実行していない。

分類候補は、具体的なsource spanが製品境界を説明できるものだけを`direct_product_basis`とした。責務が複数境界にまたがるものは単一ownerへ寄せず`multi_product_conflict`、共有utility・型・re-exportなど製品境界の証拠が足りないものは`insufficient_basis`とした。候補は正式asset分類、product route、phase authority、successor、implementation成立、consumer closureを変更しない。

候補分類は direct 30件、multi-product conflict 15件、insufficient basis 14件である。directはHARNESS 11件、OS 19件。conflictはHARNESS+OS 13件、HARNESS+Web 1件、OS+Web-OS 1件。phase候補はPHCAP-03が7件、PHCAP-03+PHCAP-04が1件、PHCAP-05が1件、PHCAP-12が2件、PHCAP-14が13件、空が35件で、いずれも正式phase admissionではない。全59件の旧asset dispositionはunresolved、implementation_statusはunknownのまま保持する。

Wave1–50は598 edge／355 unique assetで、今回の対象は14 edge／11 linked assetである。Waveで観測されたproduct scopeは候補へ継承せず、rejected／unresolvedをcounter-evidenceまたは未解決観測として記録した。#2059（Wave64）、#2063（lint95）、#2071（runtime73）、#2074（schema31）との重複は、今回の対象とWave64が11件、lint/runtime/schemaが0件である。4束union232に今回59件を加え、重複11件を除いたunionは280件である。

`generate.py`は固定BASEから入力path／blob／bytes／digest、旧source anchor、Wave edge、候補分類、縮退解釈を再導出する。`validate.py`はgeneratorをoracleとしてimportせず、59 asset ID、source path、category、候補product、reason、source line span、legacy縮退証拠、boundary／L1 receipt、phase／edge分母をvalidator内の固定期待値から独立検査する。recordの全top-level keyとnested field、history／failure／consumer、source/profile/manual review、inventoryのtop-level keyと全nested declaration、target/overlap集合を完全比較する。`selfcheck.py`は対象・edge・source digest／anchor／line、profile／候補／分類、legacy縮退証拠、boundary、history／human judgment、input set、authority、inventory、BASE pin／ancestor、generator改竄を含む44負例を期待error codeで検査する。

成果物はすべて`scaffold/`配下に置き、Binding `SCF-B-0123`へ登録する。`authority_effect=none`、`new_build_allowed=false`を維持し、正式台帳、formal route、successor、実装成立を更新しない。
