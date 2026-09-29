# 旧candidate 5件のreplacement route proposal

- 対象母集団: #2360の訂正を反映した#2361の再選択で確定する5件（`000492/000496/000497/000499/000500`）。`000180`を含む15件を保持し、`000501`は選択対象から外す。対象sourceはすべて旧candidateであり、authority effectは`none`。
- 位置づけ: 以下のrouteは、現行のexact adopted L2/L11と照合した限定的な監査提案である。旧行の採択、formal successor、source coverage、実装・受入・Stage 5完了を生成しない。
- #2361は対象5行の意味relationを評価していない。本記録で追加するのは5行の意味relation提案のみで、#2361の分類・集計値は変更しない。

## authorityと読み方

HARNESS-L2-004/005および対L11は、`docs/governance/decisions/helix-harness-requirements-po-decision-2026-09-28.md`がcommit `f6dad2a33e24f000b87d7f09b8d40288257e74cc`のL2 SHA `aed75cb4bdd644eedd9d3eb408cf522af2c4fbf4272db7b775edc62fc383100a`、L11 SHA `09b2963187f9aaddbb1ad189d77e517e91914bd5ccdf2499dd9c11855139bcd4`を固定して合意した。HELIXOS-L2-019/020/023および対L11は、`docs/governance/decisions/helix-os-requirements-po-decision-2026-09-28.md`が同commitのL2 SHA `c92d3c052884c05fbbba89fc86f6e6e0c576846e87073327fb0917e32a1747cf`、L11 SHA `925e06cd08056d9569dd31703d7f76e5be59b34f85980646c733367af5edd680`を固定したL2 001–029/L11一式のうち該当範囲で合意済み。HARNESS 004/005は要求・検証義務のtraceと条件を、OS 019/020/023はevidence、CI運転、handoffを担う。これらとの関係は部分的であり、後述のCIG固有条件を閉じない。

`NCI-HARNESS-001..004`と`NCI-OS-001..008`は現行candidate文書に残る未採択の具体化である。これらへの関係はcandidate-onlyとして記録し、adopted relationへ昇格させない。

`HELIXINTELLIGENCE-L2-073`は2026-09-29 PO decisionの`MPR-RC-HELIXINTELLIGENCE-L2-073-002`により、特定L2/L11 revisionで採択済みである。本文・古いreceiptのcandidate表示は判断前snapshotである。ただし同要求の旧AAFD-R-04 source atomsと本5行にはrelationがないため、本proposalはL2-073をsource routeに使わない。

## 行別提案

| source ID | 限定的な採択済みpartial relation | candidate-only relation | 残差・unknown |
|---|---|---|---|
| `000492` | HARNESS-L2-005/L11: 必要検証義務を保ち、全件実行を既定にしない契約に関連。OS-L2-020/L11: CI profileの組立・実行状態の境界に関連。 | NCI-HARNESS-001..004; NCI-OS-005 | event classごとの証明義務、並列数・queue/cost上限、古い証拠を無制限化しない具体policyは固定されていない。 |
| `000496` | HARNESS-L2-004/005/L11: 変更revisionと再検証義務のtraceに関連。OS-L2-020/L11: exact head/run identityとstale状態を扱う。 | NCI-HARNESS-004; NCI-OS-001/003/005 | current-main検収を保護しつつ、stale generationをどの単位・規則でbounded replacementするか、event class間の非干渉は未確定。 |
| `000497` | OS-L2-019/020/L11: event/source revision・実行結果を保持し、cancel/interrupted等と成功を区別して再構築する契約に関連。 | NCI-OS-003/004/008 | CIG固有のterminal evidence schema、cancel/handoffの因果関係とevent class別の終端規則は未確定。 |
| `000499` | HARNESS-L2-005/L11: 検証義務と証拠条件。OS-L2-019/020/L11: source revision、exact head/run identity、実行結果の証拠化に関連。 | NCI-HARNESS-002/004; NCI-OS-003 | canonical HEADの定義・更新競合・terminal evidenceの安定取得条件は、この粒度では確定していない。 |
| `000500` | HARNESS-L2-005/L11およびOS-L2-020/L11: 必要oracleを維持し、stale結果を区別する一般契約に関連。 | NCI-OS-003/005/008 | stale PRとduplicate scheduleの同一/別event class境界、bounded supersedeと影響隔離は未確定。 |

「採択済みpartial relation」はこの提案の意味照合結果であり、既存decisionに旧行IDやこのrelationが記録済みという意味ではない。特定L2/L11 revisionの適用範囲に限る。

## 旧source・監査pin

旧source `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/ci-event-concurrency-generation-requests.md` の物理file SHA-256は `7117dfb59c0c0529f3434c32d50a23684efca8db22c6a6629d1dc859347e06dc`。行本文、archive行番号、newlineを含むphysical-line SHA-256は隣接JSONに固定した。asset IDは`legacy-asset-disposition.jsonl`のpath照会が必要であり、このproposalではIDを推測しない。

`#2360`と#2361はいずれもmerge/read-after済みで、JSONの`audit_pins`に直接入力をpath/commit/実SHA-256で固定した。#2361 final pinは15 retained（000180を含む）と5 replacementの確定selectionを反映する。これらのpinはrelation提案の入力を特定するもので、旧要求採択やcoverageを意味しない。

## 依存pinと選択の確認

- #2360の最終JSON: `docs/governance/audits/requirements-stage/legacy-candidate-seven-classification-reconciliation-2026-09-29.json`; merge commit `5ca82b8ff4122a6f2141ed15e25420fafc01e4e0`; SHA-256 `4cedbd4504626c05e511e7e5c67ecb7462cccd82ae9377e29d8ca54b6d6047bb`.
- #2361の最終JSON: `docs/governance/audits/requirements-stage/legacy-candidate4755-cumulative-stage5-recount-after-2353-2356-2360-2026-09-29.json`; merge commit `132a56f3f2cbb1d02ad3bc08bab4f23ef93369cc`; SHA-256 `e29aadd8c84dda8fcfca65010ffa62331b6631ffce3ac22ef5d174270bb92b20`. 内容は000180を含む15 retainedとreplacement 000492/000496/000497/000499/000500を示す。
- R2362-02で要求された全直接入力を隣接JSONの`audit_pins`にpath/commit/SHA-256で固定し、各file bytesを照合した。

## 境界

- `unknown`は具体CIG条件に対する未決を指し、現行の一般的なL2/L11契約の不在を意味しない。
- 「candidate-only」は新世代CI candidateへの参照だけを示す。#2361の`route_status: unknown`を、この作業だけで上書きしない。
- sourceの歴史的candidate authorityは維持する。PR、近接行、同一family、current L2参照から旧source adoptionやcoverageを推定しない。
- 新世代CIは未構築。旧CI、workflow、runtime、test、CLI、hookは実行していない。
