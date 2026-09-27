# G17 条件付き設計モデル計算の導出記録

record_id: HDEC-DESIGN-MODEL-CALCULATION-2026-09-27
status: candidate_derivation_record
authority_effect: none

## 原文と親

[PO原文](../../helix-harness/sources/capability-reinforcement-po-original-2026-09-27.md)第3項を起点とする。原文全体のSHA-256は `ab8bb6ae8cd418053d6baaafccaa80ee8ef2e715caab1576e5a00c306e97d1f8`。前書き1〜4行はClaude、区切り以降がPOである。[起点記録](capability-reinforcement-po-decisions-2026-09-27.md)は原文を保存しており、本記録で置き換えない。

Conceptの「設計から全体をシミュレーションする」と、HELIXINTELLIGENCE-L1-003/004/006/013を照合した。現在状態と変更候補から影響・性能・費用・時間を予測する既存の企画目的を、明示された有限モデルの規則で計算する能力へ具体化する。企画に「simulation」という単語がないことだけを理由に新しい企画目的とは扱わない。自由文による説明予測と、入力規則から再現できる有限モデル計算は別identityとする。

製品固有モデルの正本はProduct Core/HARNESS、派生scenarioの計算はINTELLIGENCE、結果の評価はLABO、実資源・実Workerの配置と運転はOSである。仮想Worker数の変更から実Worker起動・権限を生成しない。

## 旧sourceと保持・変更

旧資産台帳と `archive/legacy-generation-2026-09-14/root/docs/design/helix/`、`root/docs/governance/candidates/`、旧 `root/CLAUDE.md` を `simulation|simulate|シミュレーション|what-if|条件.*動か|負荷.*試算` で照合した。有限の設計モデルを条件変更して時間・費用・伝播を算出する同じ要求は確認できなかった。旧source不存在を実装許可にしない。

`LEGACY-ASSET-50CA1C554747F12266D3`、`archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/resident-lane-orchestration-requirements.md:1114–1124`、SHA-256 `17bc83614d7f5f75b61831eb447a23ee706cb8a6d9e54477736e553ff956dcfd` のpre-merge simulationは、PR差分のgovernance projectionを仮適用して違反を検出する旧機能であり、本候補の製品設計モデル計算とは異なる。旧commandやregistryの移植根拠にしない。

保持するのは、現行Concept/L1の変更前予測・根拠・不確実性・実測との区別。変更は、PO第3項に基づく有限モデル計算の新規候補化である。旧runtime・CI・CLI・hookは実行しない。旧atomの移管やretireを行わず、receiptのno_lossは旧atom入力空集合に限定する。

## 条件の行き先

| 原文の条件 | 要求と受入 |
|---|---|
| 説明的予測とは別の処理 | HELIXINTELLIGENCE-L2-069、既存006との能力・所有境界 |
| 状態遷移・依存・工程・負荷条件に限定 | 069のschema・有限規則・停止・未対応、070のsource authority |
| 利用量増加 | 069/071のqueue入力・独立算術oracle |
| DB接続断 | 069/071の明示edgeだけの伝播・recovery未定義は保留 |
| Worker 2→4 | 069/071の仮想並列度・共有DB上限・費用増も含む比較 |
| 詰まり・伝播・所要時間・費用を返す | 069出力と071のbaseline差。単位・係数なしはunknown |
| 範囲外は未対応、精密な全体再現は求めない | 各L2 scopeと未見L11、物理・全領域保証なし |
| LABO比較 | 070の既存033入力・040/024送達、G12の006 L11実測比較条件を保持 |

G12のHELIXINTELLIGENCE-L2-006対L11は、対象revision・scope・観測windowを先に固定し、予測方向/範囲と後続実測の一致差を記録する。これを再利用し、閾値が未決なら測定値を返して適格化を判定しない。既存受入の不在と誤認して新しい承認手続きを設けない。

## 人の判断が残る点

- 原文第3項に対し、有限モデルと上記所有境界の本文revisionを採択するか、対象範囲を限定するか、保留するか。推奨は限定範囲と反例をL2/L11対で確認すること。影響は069/070/071。
- 予測精度の許容値は有効なscope別判断がある場合は再利用し、未定の場合は一致差を測定値として提示する。新規閾値を本候補で決めない。
- version_target 1.0は能力範囲を保持する印で、v0.1収載・実装・release・tag・配布を決めない。
