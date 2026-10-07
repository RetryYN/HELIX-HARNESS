# SECURITY-031 意味監査（read-only）

対象本文: `786ee7c85c5454e3b2314c1d8ee3ca28f5178db1`（全て `git show <target>:<path>` で読取。作業tree HEAD `fa642cddc3c4446e3635f1c6badd90209862cfac`とは異なるため、tree本文を監査対象の証拠に使っていない）。作業treeへの編集なし。旧CLI/runtime/test/CIは実行していない。

## 所見 S031-1 — 条件付きpayload bindingがCASE-031-06で無条件に見える

**判定**: L3/L10内のscope記述不整合。親のより具体的な条件を用い、CASE-031-06のpayload変異を条件付きにする最小修正が妥当。L2の意味変更、POへの技術値質問、新gateは不要。誤受入ではなく、適用外taskを誤拒否し得るoracleの過剰適用であり、severityはL3/L10の同等級finding基準に委ねる。

| 根拠 | exact本文 | 意味 |
|---|---|---|
| 固定L2 `docs/helix-security/L2-requirements/security-requirements.md:440` | 依存区分3は「taskにファイル情報が必要な場合だけ」、選択・複製したpayloadのsource/revision/path-digest manifest/classificationを束縛する | payload bindingの適用条件を明示 |
| 固定L2 同:431 | 入力列挙に必要最小payload manifestを無限定で含む | 440の条件付き区分と並ぶため、失敗句同:442の無限定な`payload manifest identity`は条件3の適用時として読む必要がある |
| 固定L2 同:442 | 開始前にauthority/runtime/scope/**payload manifest identity**/isolation…の欠落時に停止 | 440を参照せず単独で読むと過剰適用の余地があるが、条件付きdependencyの具体化がある |
| 固定L11 `docs/helix-security/L11-acceptance/security-acceptance.md:107` | 正常例に許可済みpayload manifest/digestを含める | manifestありtaskの正常oracle。ここにはmanifestなし正常例がない |
| L3 `docs/helix-security/L3-requirements/functional-requirements.md:348` | ファイル情報が必要な場合だけpayload identity/revision/manifest/classificationを束縛し、不要なら要求しない | L2:440の条件を正しく保持 |
| L3 同:364 | FR-031-06の開始前missing/unknown列挙に`payload`を限定せず含める | FR-031-02にある適用条件を繰返さず、scope拡大の読みが残る |
| L10 `docs/helix-security/L10-verification/functional-verification.md:353-355` | CASE-031-02はファイル情報不要taskをmanifestなしで正常に扱い、payload欠落negativeはファイル情報必要taskに限る | 正常/negative双方でL2:440の条件を保つ |
| L10 同:384-385 | CASE-031-06のmissing変異列挙に`payload`、変更列挙にpayload identity/revision/digestを限定なしで記載 | CASE-031-02とCASE-031-06の間でpayload適用条件が明記上不一致。一般表現を文字どおりに取ると、CASE-031-02の正常taskがCASE-031-06のnegativeとなる |
| L3 NFR `docs/helix-security/L3-requirements/nfr-grade.md:53`; L10 NFR `docs/helix-security/L10-verification/nfr-verification.md:21-31` | 選択payloadの条件fixtureだけにmanifestを適用し、functional CASEの条件付きを参照 | NFR側は条件を保持しており、修正範囲をFR-031-06/CASE-031-06に限れる |

**最小差分案**: FR-031-06の開始前不足列挙と再照合条件でpayloadは「選択payloadが適用されるtaskに限る」と明示。CASE-031-06のpayload manifest/identity/revision/digest negativeも同じ条件付きtaskのfixtureと明示し、他の条件は正常のまま維持。CASE-031-02のfile-info-not-required正常fixtureは変更しない。L2:442の無限定失敗句は固定親のままとし、L2:440の条件区分を適用する読みをL3に明記すれば親本文の意味変更を避けられる。もしPO/ownerがline 431/442を全task必須と解釈するなら、それはL2:440と衝突するためこの監査から一方を選ばず上流へ戻す。

### 固定親・旧source起点の照合範囲

- 固定L2: `security-requirements.md:427-446`（031の対象、operation dependency 4区分、payload条件、credential/isolation、failure route、旧source/範囲外記述）。L2-031は主Worker以外の追加runtimeを実際に選んだoperationに限る。
- 固定L11: `security-acceptance.md:104-115`全文。未採択候補の文書oracle、synthetic-only、payload正常、proposal-only、copy/canonical/credential/data boundary、owner別戻し、旧source限定対応を確認。manifestなしのfile-info-not-required normalはL11には見当たらないため、L10 CASE-031-02の補足fixtureである。
- 旧source（read-onlyで該当箇所を直接読取）:
  - `archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:84` — HIL-BR-32。旧runtime対象、proposal-only、隔離、canonical/credential非到達、秘密・機密委譲禁止。新しいruntime名・実装は持ち込まず、現行L2のscopeと権限へ再導出。
  - `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md:57,86` — HR-FR-HIL-23とHAC-HIL-23a/b/c。隔離内完走・proposal再検証、egress/scope/confidential/bypass拒否、quota/egress fail-close。今回この引用行を確認。旧HR-FR全文および旧NFR-37–40全体のclosureは主張しない。
  - `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L3-infinity-loop-acceptance-test-design.md:55` — HAT-HIL-23のsandbox/egress/payload/FS diff/audit oracle。旧testは設計資料であり実行していない。
  - 現行L3 `functional-requirements.md:338-340` の対応記述も確認。P2-05/HAT、WCC、HIL-FR-67の補助範囲とHR23の範囲外条件はL3記述を確認したが、今回の判定でP2-05/HATおよびHIL-FR-67原文全体の再読はしていない。

## 6 canonical文書とStageの照合

- BR `docs/helix-security/L3-requirements/business-requirements.md:7-9`: 031独立business identity/ACなし。既存HARNESS/OS/業務ownerの意味保持。
- BV `docs/helix-security/L10-verification/business-verification.md:7-9`: 031 business ACなし。CASE-031-03/05から承認・保存・業務成功を作らない。
- FR `docs/helix-security/L3-requirements/functional-requirements.md:330-364`: 031-01〜06。採択scope/owner/Stage、旧source限定、条件付きpayload（FR-02）、proposal/canonical/credential/isolation/owner境界（FR-03〜06）。
- NFR `docs/helix-security/L3-requirements/nfr-grade.md:47-61`: SEC-NFR-031-01。100%/0候補は選択scopeの文書fixture coverage/誤受入oracleであり、製品SLOや実測値ではない。条件付きpayload分母を保持。
- FV `docs/helix-security/L10-verification/functional-verification.md:339-392`: CASE-031-01〜06。synthetic fixture、条件別開始入力、proposal-only、copy/canonical、conditional operation/receipt、owner failure/independent mutations。S031-1のみ具体的不整合。
- NFRV `docs/helix-security/L10-verification/nfr-verification.md:21-31`: SEC-NFR-031-01 coverage measurement。選択payloadに限るmanifest、条件付き依存の事前分母、未観測/missingをpassにしない。

**他の確認事項**: CASE-031-01は条件付き006/009/022/023/HARNESS/OS後段を実際に選んだfixtureへ限定。CASE-031-02はfile-info-required/omittedの正常経路を分離し、前成果receiptを開始条件にしない。CASE-031-03/04はproposal受領とauthority/canonical write、credential valueと限定capabilityを分離。CASE-031-05は送信・stop/deviation・verification/adoption条件を選択時だけ適用し、verification receipt単独の採択を拒否。CASE-031-06は無関係operation継続、quota閾値新設なし、owner routeを明記。旧sourceで本Stageが担わないquota閾値、環境浄化、permanent bypass、runtime固有audit等をStage 2cがclosureしたとは扱わない。

## 未確認範囲

Rootの最終指示により本監査はSECURITY-031へ限定した。OS Stage2a 8親（015/016/017/018/019/020/023/027）およびOS Stage2c 028/029については、先行作業で部分的に本文を参照した箇所はあるが、6文書・旧sourceごとの同深度照合を完了していない。本監査からそれらの完了・意味健全性は主張しない。全274文書、実装、実行試験、実secret/credential/runtimeも対象外。
