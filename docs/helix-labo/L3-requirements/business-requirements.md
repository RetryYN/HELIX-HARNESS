# HELIX-LABO L3 業務要件（部分草稿）

**状態：部分草稿・未承認。** Stage 1/2a/2b割当36 identityおよびStage 4のLABO-L2-036/037/038/039/040/041/052/054について、この文書へ独立して配置できる機構業務成果の要求は、固定L2/L11 sourceから別個の業務outcomeとして確認できなかった。機能behaviorをbusiness-detailという旧ファイル名だけで分類しない。要求本文・分類・ownerの意味を変えず、対象identityの動作・ACは対の`functional-requirements.md`と`../L10-verification/functional-verification.md`に置く。

旧HELIX `business-detail.md` は、現行の業務要件候補を探す旧起点として参照した。次の旧BR-21等はHARNESS利用dashboardと集計batchの業務条件であり、本体機構の現行LABO/BRAIN/INFRASTRUCTURE業務責務へ直接一致しない。したがって移植・複製せず、LABO-001の部分source失敗時に有効sourceを保持するfailure類型のみfunctional ACへ再導出した。

今回対象の親L2 identity: `HELIXLABO-L2-001`〜`HELIXLABO-L2-030`, `HELIXLABO-L2-034`, `HELIXLABO-L2-035`, `HELIXLABO-L2-036`〜`HELIXLABO-L2-041`, `HELIXLABO-L2-052`, `HELIXLABO-L2-054`〜`HELIXLABO-L2-058`.

必要な業務成果条件が後続の承認済みL2から導かれる場合は本書へ追加する。今回、業務分類の新設やL2意味変更は行わない。Stage 2bの002–030、034、035、058はLABO内の分析・評価・入力接続/境界候補であり、固定親に独立した別の業務outcomeはない。実験実行はOS割当Worker、登録/routingはOS、変更判断はtarget ownerに残す。必要な業務outcomeが親から確認された場合のみ後続追補する。

Stage 4の036/037/038/039/040/041は各owner向けのfeedback candidate接続、052は評価材料の受渡し構成、054はBench水準接続であり、それぞれの業務成果条件は固定親の機能契約と同一で、別の業務outcomeはない。旧UIL/Bench起点の画面、dashboard、score、admission outcomeを持ち込まず、L10の機能oracleを業務総合oracleとして参照する。対象親はPO判断record `f6dad2a33e24f000b87d7f09b8d40288257e74cc`固定、PO判断記録の該当行84–94、L11行87–94/102（L11 full SHA-256 `bcd77438bf1afa4d33c31d35fa5138ea6f978f3d241d159bde35f0b0ccf83200`）で照合した。
