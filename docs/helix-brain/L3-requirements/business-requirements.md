# HELIX-BRAIN L3 業務要件（1.0対象親40件の草稿）

**状態：部分草稿・未承認。** Stage 1の3 identityおよび今回のStage 2b 28 identity、Stage 4の7 identity、Stage 5の2 identityについて、この文書へ独立して配置できる機構業務成果は、固定L2/L11 sourceから確認できなかった。機能behaviorをbusiness-detailという旧ファイル名だけで分類しない。要求本文・分類・ownerの意味を変えず、対象各itemの動作・ACは`functional-requirements.md`の対応節に置く。

旧HELIX `business-detail.md` は、現行の業務要件候補を探す旧起点として参照した。次の旧BR-21等はHARNESS利用dashboardと集計batchの業務条件であり、本体機構の現行LABO/BRAIN/INFRASTRUCTURE業務責務へ直接一致しない。したがって移植・複製せず、LABO-001の部分source失敗時に有効sourceを保持するfailure類型のみfunctional ACへ再導出した。

今回対象の親L2 identity: `HELIXBRAIN-L2-007`, `HELIXBRAIN-L2-008`, `HELIXBRAIN-L2-028`, `HELIXBRAIN-L2-024`, `HELIXBRAIN-L2-025`。Stage 4対象は`HELIXBRAIN-L2-018/019/020/021/022/023/030`。

今回のStage 2b 28件（basic 11件およびInfrastructure 17件）およびStage 4対象7件も固定L2/L11から独立した機構業務outcomeを確認できなかった。functional requirementとACはfunctional文書に置き、業務分類の新設や機能条件の二重定義はしない。Infrastructure対象は `HELIXBRAIN-L2-INFRA-001`〜`HELIXBRAIN-L2-INFRA-017`。

必要な業務成果条件が後続の承認済みL2から導かれる場合は本書へ追加する。今回、業務分類の新設やL2意味変更は行わない。


## Stage 4 — connection候補の業務分類

固定L2/L11のconnection意味から独立したbusiness outcomeは確認できないため、業務分類の新設や別business oracleは行わない。機能動作の正本はfunctional L3の個別FR/ACである。

| 親L2 | 業務分類 | 対応する機能正本 |
|---|---|---|
| `HELIXBRAIN-L2-018` | 独立business outcomeなし。業務要件の追加・複製なし。 | `BRAIN-018-FR-01` / `BRAIN-018-AC-01,AC-02` (`functional-requirements.md`) |
| `HELIXBRAIN-L2-019` | 独立business outcomeなし。業務要件の追加・複製なし。 | `BRAIN-019-FR-01` / `BRAIN-019-AC-01,AC-02` (`functional-requirements.md`) |
| `HELIXBRAIN-L2-020` | 独立business outcomeなし。業務要件の追加・複製なし。 | `BRAIN-020-FR-01` / `BRAIN-020-AC-01,AC-02` (`functional-requirements.md`) |
| `HELIXBRAIN-L2-021` | 独立business outcomeなし。業務要件の追加・複製なし。 | `BRAIN-021-FR-01` / `BRAIN-021-AC-01,AC-02` (`functional-requirements.md`) |
| `HELIXBRAIN-L2-022` | 独立business outcomeなし。業務要件の追加・複製なし。 | `BRAIN-022-FR-01` / `BRAIN-022-AC-01,AC-02` (`functional-requirements.md`) |
| `HELIXBRAIN-L2-023` | 独立business outcomeなし。業務要件の追加・複製なし。 | `BRAIN-023-FR-01` / `BRAIN-023-AC-01,AC-02` (`functional-requirements.md`) |
| `HELIXBRAIN-L2-030` | 独立business outcomeなし。業務要件の追加・複製なし。 | `BRAIN-030-FR-01` / `BRAIN-030-AC-01,AC-02` (`functional-requirements.md`) |

Stage 5のHELIXBRAIN-L2-024/025も独立business outcomeを持つとは固定L2/L11から確認できないため、business ACは増やさず、各parentの機能flowと同じACを`functional-requirements.md`および`../L10-verification/functional-verification.md`へ追跡する。
