# HELIX-INFRASTRUCTURE Stage 1 L3/L10確認資料

対象本文revision: `98c79e0e15e50b371db83e0a2a9829d6fbf89ffd`。ローカル草稿・独立レビュー前・PO未承認。

対象は採択済み001（実行資源と環境の識別・観測）と006（停止中HELIXから独立した限定起動・復旧経路）の2親です。資源の7属性、通信pathの8軸、storageの6属性と復旧参照、対象に含むModel/Worker Runtimeの状態を出典・revision・environmentへ結びます。読み取り不能・部分更新時は過去観測をcurrentにせず、未完範囲を残します。

006はbootstrap、health check、service stop、rollback、recoveryの5操作を別々に照合し、通常control planeが停止していても別SECURITY authorityと限定対象を確認する条件です。最終適格revision、結果、未完義務を保持し、独立pathまたはauthority不明では提供ownerへ戻して停止します。通常の万能経路、完全自動failover、復旧後OS同期の新規必須化は加えていません。

技術候補は宣言scopeの属性可視化100%、network 8/8・storage 6/6、論理接続とphysical path混同0、authority等6条件の個別照合、operation 5/5です。health probeは1秒×1回・5秒×3回・10秒×5回を比較し、有限の観測上限として5秒×3回を初期候補にしています。未応答分類は個別operation観測に限り、service全体の障害・incident・自動failoverを決めません。未観測を0にする要求ではなくunknownを可視化する候補です。

固定L2の意味・範囲・owner・版を変えていません。L2-005は006の採択済み依存入力で、本StageのL3対象には加えません。旧OPS-R-01/OPS-AC-001等を起点に一部意味を再利用・再導出し、旧provider schema、運用lifecycle、値・gateは移しません。独立business outcomeがなく、重複ACは設けません。

6文書292行、2親・7機能AC・30機能CASE・6NFR候補を収録します。旧findingの未確認範囲を保持し、独立reviewは未実施です。Claudeのexact HEAD review結果を添えて通常のPO L3承認へ渡します。

静的監査: [l3-l10-infra-stage1-static-validation-2026-10-05-98c79e0e1.json](l3-l10-infra-stage1-static-validation-2026-10-05-98c79e0e1.json)（SHA-256 `18976cd08d5c1df878f40eba7e62286744ca2b738251348c78930ab8578963b0`）。

| 文書 | SHA-256 |
|---|---|
| `docs/helix-infrastructure/L3-requirements/functional-requirements.md` | `127992ba5cda5964a3ecf847295da5e2fbd97c8f390ce1bdca4a54de30fbf204` |
| `docs/helix-infrastructure/L3-requirements/business-requirements.md` | `c2b22bc5af8bf721c9f6e4594e81046dde2ed2a9555fa0643accb76f8a37f97e` |
| `docs/helix-infrastructure/L3-requirements/nfr-grade.md` | `1b5f2f3ee6d44ed095efd018b4ab03d548cba7b46bdf66b16a45d8a0966bdd1e` |
| `docs/helix-infrastructure/L10-verification/functional-verification.md` | `d467ee3c5ea4d7537d13425ef4e320ca98d4c04b7ba918768b3f95062880a3ac` |
| `docs/helix-infrastructure/L10-verification/business-verification.md` | `8801b848f6b16d5214a45b3652446a228e829c687f9203e50c02ad2bf5ddbe70` |
| `docs/helix-infrastructure/L10-verification/nfr-verification.md` | `eaadd079c205564a84a9b221d9ca3c0393e79ac7ff98cc96f8603e5eba69b4d5` |
