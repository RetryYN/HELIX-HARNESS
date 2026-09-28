---
title: "旧HIL-FR-51の自動Admission境界と受入oracle監査"
audit_id: HIL-FR51-POSITIVE-ADMISSION-BOUNDARY-2026-09-29
audit_status: bounded_read_only_audit
scope: "HIL-FR-51とHOT-HIL-48の正負境界のみ"
source_main: b72399eef5c3e6745a0769d1578420b8583c2814
authority_effect: none
---

# 旧HIL-FR-51の自動Admission境界と受入oracle監査

## 判定

旧sourceには、既定policy内の可逆な変更を自動Admissionし、上位目的・安全境界の変更を人の判断へ送り、根拠不足の変更をCanonical化しない、という正負の境界がある。現行の採択済み要求とL11は、人間が持つ要求意味と、既決権限の再利用・生成projectionの追随を別々に保つが、この境界を一つの対照fixtureで受け入れる条件は明記していない。

未充足として特定したoracleは、**非意味的な修復または既に許可された範囲内の機械的追随が、同じ理由の人間確認を再要求せずに処理される一方、要求意味を変えるproposalは人間判断を経ないと現行要求にならず、根拠欠落・stale・conflictはCanonical化されない**ことを同時に判定する境界である。

これは旧`auto_admit` enumを現行へ持ち込む要求ではなく、要求meaningの自動採択を推奨するものでもない。監査時点の現行authorityでは、要求意味の変更はPOが決める上流に属する。旧sourceは過去の設計要求であり、その存在から現在の自動採択権限を推定しない。

## 旧sourceとoracle

| 参照 | 内容 | source識別 |
|---|---|---|
| `archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:141` | HIL-FR-51。Proposalの意味差分、authority、revision、trace、pair、impact、安全境界、rollback routeを調べ、6種のAdmission結果を区別する | asset `LEGACY-ASSET-719D5EC9C06FC4AAD0FF`; file SHA-256 `db31f424cc89cc4cc31058b2d03059e794ab2d63fa0b1f431dd38eced8f4c8fb`; line SHA-256 `321e7cf7be89621eaa0d63ece9863fb714bbd4a800f46057545cf8a1c51388b0` |
| `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L1-infinity-loop-operational-test-design.md:75` | HOT-HIL-48。可逆修正、L0目的変更、安全境界緩和、authority/impact/rollback欠落を対照入力にする | asset `LEGACY-ASSET-AFE91778057B7E76BEEC`; file SHA-256 `4f8f67664e360dcb8b40f9c834953d026c9bf3b359a79a64e68fa2296689e576`; line SHA-256 `efa60d678f90a47a15acedd1ce43c5507cb79ed13327e259b71e3b8bb65e5e7d` |

HOT-HIL-48の期待結果は、可逆な修正だけを自動Admissionし、上位目的・安全境界の変更は人間判断へ送り、検査欠落をCanonical化しないこと。旧sourceが設計した結果ラベルは現行の権限・状態モデルを定義しない。

## 現行の責務と採択範囲

- **HARNESS意味責務**：`docs/helix-harness/L2-requirements/product-requirements.md:59`の採択済みHARNESS-L2-008は、要求形成、意味差分、対象粒度、scope逸脱、変更影響を扱い、出力を合意済み要求や操作権限へ自動昇格させない。対応する`docs/helix-harness/L11-acceptance/product-acceptance.md:123-125`は、否定・取消・保留・対象変更時の自動採用拒否、意味の追加・欠落・別製品規則の混入、構造化結果の決定性を確認する。
- **OS記録・operation責務**：`docs/helix-os/L2-requirements/governance-requirements.md:517-525`はOS-L2-001/002/007/009への具体化として、policy・根拠・scopeに基づく自動適用、修復、人判断、拒否、競合の区別、許可済み変更への不要な再質問の抑止、および部分更新を現行正本として公開しない条件を記す。実証は未取得と明記する。
- **writer境界の例**：2026-09-29 PO判断の`docs/governance/decisions/po-decision-2026-09-29-57candidates.md`はHELIXOS-L2-038のrevision `MPR-RC-HELIXOS-L2-038-001`と対L11を採択している（L2 section digest `603b5db48045408a85d116071a4ad0f8a470064cd073a05beb9bc118f386fd6c`、L11 section digest `eabb68eaafc76f0080fbe9cb9c6904005c88b72e7cee9563f2515b4488de2e5d`）。receipt `docs/governance/audits/requirement-registration/os-layer-ledger-writer-coverage-receipt-2026-09-28.json`は範囲を旧HIL-FR-46/47の運転・保存部分に限定し、HARNESS意味契約を入力責務に置く。OS writerの保存・append・再開契約をHIL-FR-51のsemantic admissionと同一視しない。

HARNESS-L2-008は2026-09-28のHARNESS判断記録が固定したL2/L11一式に含まれる。現行L2ファイルは候補追補後の全体bytesであるため、PO判断の適用は判断記録が固定するidentity/revisionと採択集合に限定して読む。OS-L2-038の2026-09-29採択は同IDの`-001` revisionだけを対象とし、後続の`-002`追補候補を採択しない。

HARNESSの2026-09-28判断記録は確認対象source revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`、その時点のL2全体SHA-256 `aed75cb4bdd644eedd9d3eb408cf522af2c4fbf4272db7b775edc62fc383100a`、L11全体SHA-256 `09b2963187f9aaddbb1ad189d77e517e91914bd5ccdf2499dd9c11855139bcd4`を記録する。`f6dad2a`と監査対象main `b72399e`の双方で、HARNESS-L2-008行のSHA-256は`8408b5461d54355389a0ec3006fbbca412f94cb6721c15adb95e2384c07b9024`、L11の該当3行はそれぞれ`4abc46360ab2506eb17a36e54e299e23bf4128787fa14e7a6012d590bf7759de`、`2984c81fbf785c84d26d85adf57692931a8a21e08019d1718c29e93ffa876166`、`e2b42e73cb13fbec46962364f10862f124a552b5018aef9b6257950aa46ae1e6`で一致した。よって今回の差分判定は、後続追補を遡及採択した扱いにはせず、採択済みHARNESS-L2-008の同一行に対して行った。

## 差分

採択済みHARNESS-L2-008のL11は、要求内容を勝手に採用する経路を拒否する側に具体例がある。一方、同じ対の受入に、既定の意味契約内で非意味的修復・生成projection追随を行うとき、既に有効な判断を再質問せずに進めるpositive caseは見当たらない。OSのL2管理条件は既決許可の再利用を示すが、HARNESS要求意味のAdmission判定や、受入時の二方向oracleを代替しない。

したがって未解消点は「要件本文が人間承認を省いている」ことではない。**許可済みの機械的追随と、人間判断を要する要求意味変更との間を、同一L11で区別して検証するoracleが欠けている**ことである。未実行であること自体を意味欠落とはしていない。

## 候補にする場合の最小受入例

| Fixture | 入力 | 期待する判定 |
|---|---|---|
| 正常 | 採択済み要求意味・対象revision・適用policyを変えない生成projectionの修復または追随。scope、既存authority、base revision、trace、必要なpair/impact/rollback根拠が揃う | 既存の有効な許可を再利用し、同一理由の人間確認を追加要求しない。projection/operation receiptは要求意味の採択・変更を表さない |
| 誤り | 要求意味、Concept/L1の目的、安全境界の変更を含むproposal | Proposalと差分・影響を保持して該当するPO判断へ戻す。人の判断前に現行要求へ昇格しない |
| 誤り | authority、base revision、trace、pair/impact、rollback根拠のいずれかがmissing/unknown/stale/conflict | Canonical/currentとして公開せず、未完・理由・戻し先を残す。欠落を推測で補完しない |

このfixtureは新しい操作許可やadmission enumを定義せず、適用可能な既存policyとauthorityが既にある場合の処理を確かめる。上記の正常条件に当たる機械的追随の対象・限度を現行契約から確定できない場合、正常例を追加する前にその境界を補う。

## PO判断の要否、選択肢、推奨

受入例の書き方だけであれば、既存の「人間が要求意味を持つ」「出力は自動昇格しない」「有効な既決権限を再利用する」の境界を明示する作業であり、POの追加判断は要しない。

ただし「自動Admission」を**意味が変わるL2要求の自動採択**まで広げる意図がある場合は、現行authorityと衝突するためPO判断が要る。選択肢は次のとおり。

1. **推奨**：自動経路を、既存意味の範囲内にある非意味的な修復・projection追随と、明示済みpolicy/authority内の操作に限定する。要求meaningの変更は人間判断へ送る。この範囲でHARNESS-L2-008に正常/誤り/未見のL11対照例を追補する。
2. **拡張案**：特定の要求meaning変更を自動採択可能にする。採択可能なidentity、適用policy、可逆性の判定、上流との矛盾時の停止、rollback、PO権限との境界をPOが先に決め、対象revision付きで判断記録へ残す。
3. **非採用**：旧HIL-FR-51の自動Admission能力は現行要求へ再導出しない。旧sourceは未移管として保持し、この機能を要求stageの保証対象から外す判断を明示する。

この監査は選択肢1を推奨するが、新規要求、要求採択、formal successor割当を作らない。選択肢2または3を選ぶ場合はPO判断が必要。要求本文または対L11を実際に変更する場合、その訂正revisionは既存の独立reviewと対象revision確認に回す。

## 範囲外

本監査はHIL-FR-52/53、旧transaction/runtime/DB実装、全source atom移管、実行時の合格を評価しない。FR-52の複数artifact原子更新とFR-53のidentity/revision lineageは別監査で照合する。旧CI、test runner、runtimeは実行していない。
