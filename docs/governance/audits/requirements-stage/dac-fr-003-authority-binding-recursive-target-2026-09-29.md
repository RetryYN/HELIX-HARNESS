# DAC-FR-003 authority binding参照先の再帰検査候補監査（2026-09-29）

## 判定範囲

この記録は、`legacy-confirmed175-full-audit-2026-09-28.json`の`DAC-FR-003` OPEN行について、旧source atom一つとHELIXOS-L2/L11-106未採択候補の局所対応を記録する。基準監査のOPEN、`preserved_pending_rehome`、successor未割当という状態は履歴として維持する。対応候補の追加はDAC-FR-003全体のclosure、正式successor、採択、実装または旧source owner移管を示さない。

## 旧source atom

- Asset: `LEGACY-ASSET-D201753B1A0CC6EA3980`
- Archive source: `archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/document-authority-census-requests.md:50`
- Exact source text: `| \`DAC-FR-003\` | authority bindingの参照先を再帰検査し、存在するが失効・互換・履歴化したtargetへのcurrent edgeを拒否する。 |`
- File SHA-256: `81ac3006a11a087c069b196c1512b078ad5f19c1cff1da0ff34d8986ff2feb66`
- Line SHA-256: `77e1d9bc1f98f2a1f1cf0094dd280fb83d001ffe8ee422f1c951da2d72898212`
- Holding: `MPR-SH-CONFIRMED-003`、source-qualified identity `helix/L1-requirements/document-authority-census-requests.md::DAC-FR-003`、current carry state `preserved_pending_rehome`。同じID・path・digestは`legacy-migration/identity/legacy-confirmed-requirement-identity-carry-forward.jsonl`の該当rowで照合した。
- Selected input: `CONFIRMED-DAC-FR-003`一atomだけ。隣接FR/NFR、source document全体、旧scanner/runtime/test/design/consumerは入力集合に含めない。

## 現行責務・coverage

- **owner候補**：HELIX-OS management。採択済み`HELIXOS-L1-001`は対象ごとのConcept・要求・採否・合意revision・判断出所の管理、`HELIXOS-L1-008`はauthority/design/verification/runtime projection不整合の検出を掲げる。現行L1本文は`docs/helix-os/L1-planning/system-intent.md`（固定revisionのSHA-256 `2bb62571308aa1fde0351ca7242e961ddd25b9c4722196c7bb255cf3ad1cfe0e`）で確認した。旧source ownerのOSへの移管は未決。
- **既存対応**：`docs/helix-os/L2-requirements/governance-requirements.md`のHELIXOS-L2-015（管理・authority記録）はsource identity/revision/digest/判断出所と未解決状態を保持する。対応する`docs/helix-os/L11-acceptance/governance-acceptance.md`のHELIXOS-L11-015受入はidentity/revision/digestの追跡、projectionからauthorityを生成しない境界、stale/digest不一致の反例を持つ。どちらも参照先の再帰走査とownerが失効・互換・履歴と分類したtargetへのcurrent edge拒否をoracle化していない。
- **候補対応**：`HELIXOS-L2-106`は入力で特定したbinding/reference chain内の参照先を、既存target ownerの状態を使って確認する限定案。`HELIXOS-L11-106`はnormal、nested negative、unknownの静的fixtureを提案する。source/target statusの意味、owner、対象scope、要求採択は決めない。
- **受入証拠の限界**：`docs/governance/audits/requirement-registration/dac-fr-003-authority-binding-coverage-receipt-2026-09-29.json`は一atomの出典とcandidate input mapping、section/file digest、および静的oracleの提案だけを固定する。実装やruntimeのreceipt、実行済みL11、権限成立の証拠ではない。旧実行物は参照のみで、実行していない。

## 未解決と保存条件

1. POの対象revision判断とHELIX-OS候補の採否は未決。L2/L11本文、register、receipt、mergeまたはreviewからdecisionを生成しない。
2. 旧source ownerから現行ownerへの移管、binding/target適用集合、current edgeが意味するconsumer contextは未決。
3. `失効・互換・履歴`各statusの定義と付与主体はそれぞれ既存target ownerへ残す。本候補はそれらを決めず、`incompatible`等の新stateへ翻訳しない。
4. 全repository census/scanner、schema、探索深度・性能条件、finding分類、修復・削除・edge書換えは未提案・未決。未知・missing・stale・conflictをcurrent/acceptableへ補完しない。
5. `MPR-SH-CONFIRMED-003`を生存させ、旧source原文とpending atom statusを保つ。旧CLI/runtime/test/CIを実行・fallbackにしない。

## 登録・revision pins

- Candidate registration: `MPR-RC-HELIXOS-L2-106-001`、`registered_proposal`、`authority_effect: none`、PO未決。
- Candidate section digest: L2 `sha256:b1f3d62a007f954a788602fbff45fa70d3b8bb4b2fec547113a0db30d9598fcc`; L11 `sha256:bc577dcbe57f06daefe80618ee2787012794e2489d46b32c7b0fcb85d32bc835`.
- Current file SHA pins at this worktree revision: L2 `sha256:9b4a26cb92654b133b6154dffec903ab745132be96173cc049782c5faa6a5f3a`; L11 `sha256:8ac93048fbc05032e6b1e578a944620089c0eae528bd7fb1d3cf2a125faf4e2e`.
- Main basis: `238e5a07daed328f3202d327da6b6e5a2866e396`。source-linesとcoverage receiptはatom単位および候補section/file SHAを固定する。既存Scaffold Bindingの役割は変更せず、候補本文を採択済みruntimeとして扱わない。
