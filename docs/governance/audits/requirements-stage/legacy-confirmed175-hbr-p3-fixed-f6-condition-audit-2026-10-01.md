# confirmed175 HBR-P3 fixed f6 条件照合監査（2026-10-01）

監査基準は`50a99ae13a46cf72fd333146ae8eb34c873284ab`、PO固定L2/L11 revisionは`f6dad2a33e24f000b87d7f09b8d40288257e74cc`。対象は`helix/L1-requirements/pillar-requirements.md::HBR-P3`の1 identityだけで、旧source asset `LEGACY-ASSET-18F7940E7994634D39A1`、状態`confirmed` / `preserved_pending_rehome`。read-only意味照合であり、formal successor 0、authority effect none、closure false、Step 5完了 false。行本文・SHA、監査基準/f6/current文書pin、PO判断、MPRおよび94候補decision row indexは[JSON証拠](legacy-confirmed175-hbr-p3-fixed-f6-condition-audit-2026-10-01.json)に記録した。旧CLI、workflow、hook、adapter、runtime、test、CIは実行していない。

## 旧sourceとconsumer

旧sourceは`archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/pillar-requirements.md` line 53、file SHA-256 `7a73fa86acd8e5a7b755a9479f67c4d2af1579e533df101b1b3294eeceb0d8cc`、line SHA-256 `b4bdd4e3b933bbea6e7d28cf0ef9f2f3b62caa6863f79362bf5c4d685a4f088b`。原文はpair closure、片肺禁止、機械/AI判定境界の強制、held-out外部真実照合を同じHBR-P3行に置き、既存FR-L1-02/03/05/21/22/25/45/50を接地先として示す。同じ行自身が専用formal FR・standalone片肺禁止・formal判定境界・held-out grounding FRの不足を明記している。

旧L3 consumer `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/pillar-functional-requirements.md` の対象行もline SHA付きで固定した。主consumer HR-FR-P3-01はL3-L7全gateでpair closureとmachine/AI境界をformalizeしcoverage単独passを拒否する。HR-FR-P3-02はURL/公開日/版/引用spanを記録し外部根拠のない外部事実claimをrejectする。HR-FR-P1-04とP2-04はL2合意前freeze禁止、test/oracle-firstと独立reviewの隣接条件を置く。P9-03/05は層別baseline/gate/regressionと中間層到達の集計、HR-NFR-P3-02/04はtrace/evidence対応とtest-firstを追加する。これらはconsumer条件の証拠であり、旧test実績ではない。HNFR-P3そのものは別identityとして本監査へ混入しない。

## 固定f6 L2/L11照合

| 原条件atom | 固定対象 | 照合結果と残差 |
|---|---|---|
| pair closure | HARNESS-L2-001/003/004/005、L11-001/003/004/005 | 正規pair構成、片側欠落識別、変更影響trace、risk/change別oracle・証拠、右側の実物と設計照合は接点。全対象を一括closeする単一runtime closureの意味・実行結果は示さない。 |
| 片肺禁止 | HARNESS-L2-001/003/005、L11-001/003/005 | L11-001はL2/L11とL3/L10の混同・片側欠落を識別し、L2-003/005は未合意・未検証を進行可能としない。pairごとの実行・acceptance receiptまでは証明しない。 |
| 機械判定とAI判定の境界 | HARNESS-L2-003/005、L11-003/005 | 適用oracle・検証義務・証拠条件、原子CIと意味を保つ変更の判定接点はある。L3-L7すべてのgateに対する機械deterministic判定とAI意味reviewの完全な分担/正式化は固定pairから導けない。 |
| external-truth / held-out | HARNESS-L2-005、L11-005 | 対象別oracle・expected failure・証拠・有効期限・省略検査回収は具体化。外部参照の独立性、held-out選定、測定・許容差の共通基準は定義されない。外部事実claim等の適用条件がある対象で下流oracleを定める問題として残し、全ticketへ一律に拡張しない。 |

f6と監査基準HEADのHARNESS L2/L11 whole-file digestおよび選択行digestをJSONに別々に保存した。HARNESS-L2-001/003/004/005はf6のPO固定本文と監査時current本文を各々比較できる。現行文書にある後発候補・追補本文をf6固定revisionの一部とは扱っていない。

## 2026-09-29/30後発判断の近接screen

候補57件・11件・live26件の全94 decision rowを行本文/line SHA・登録ID・処置付きで索引化した。decision処置は採択88（53/10/25）、保留または非採択6（4/1/1）。以下はHBR-P3に意味近接するものだけの個別screenで、他の行はcohort completeness indexに含めたが、HBR-P3へ個別meaning-mapしたとは主張しない。

| Decision対象 | 採択/適用範囲 | HBR-P3近接と残差 |
|---|---|---|
| HARNESS-L2-036 | 57件、採択。CORE unit・`version_target: 1.0`。 | 選択profile内の観点抜け/重複と同一dev-local/CI gate契約を扱う。全pair closureやheld-out oracleを定義しない。 |
| HARNESS-L2-041 | 57件および11件の各decision rowを別々にpin。 | active templateのpair contractをatom/gapへ抽出する条件。抽出候補・ledger接続でありpair実行/closeではない。2つのdecision/MPR登録はHBR-P3のsuccessorにならない。 |
| HARNESS-L2-047 | 57件、条件付き採択A配置、`version_target: 1.0`。 | 対象taskのspecialist必要性、scope/riskとverification contract/oracleを限定する。普遍pair closure、external-truth groundingではない。 |
| HELIXLABO-L2-062 | 57件、採択対象revision `version_target: 2.0`。 | 主張ごとのsource span/版/支持・反証/primary confirmation。外部claim provenanceに近接するが、held-out評価や1.0範囲の根拠にはしない。 |
| HARNESS-L2-056 | live26、選択・承認行。 | canonical 6 V-pairをpair別atomic oracleで照合し、片側edge/実行結果欠落またはoracle mismatchをcomplete/greenにしない。静的候補oracleは実行結果でなく、external truthを扱わない。 |
| HARNESS-L2-057 | live26、OS-L2-054との同一判断単位。 | 選択scope/revision内のclosure条件。旧HIL-FR-07の8候補atomのみでmemory atomはholding。旧HBR-P3 identity全体や他のclosureを閉じない。 |
| HARNESS-L2-060 + HELIXOS-L2-103 | live26、A案を一体選択。 | 適用が決まった工程の入力revision、段階evidence/event/causeを結ぶ。旧工程全列を全件必須化しない。provenance接点は外部truth oracleでもHBR-P3 closureでもない。 |

Decision row、対象現行L2/L11 section, MPR registration row, `registered_proposal` / `authority_effect:none`, source atom scopeおよびversion/applicabilityをJSONでpinした。特にcandidate本文の「未採択」等の古い表示と後発PO判断は別状態として読んだ。採択88件は実装・実行・受入を意味せず、version targetも前倒ししない。6 held/nonadopted rowsは未採択のまま保持した。

## 結果

HBR-P3の4 atomには固定f6で限定的なV-pair、trace、verification oracle/evidence条件の接点がある。旧consumerのpair closureとexternal claim evidenceは一部再導出されているが、機械/AI判定境界の全gate formalizationとheld-out external-truth基準は残る。後発の採択候補がcloseするのは各候補の明示scopeだけである。HBR-P3は`preserved_pending_rehome`を維持し、formal successor 0・closure false。要求意味の変更・retireは本記録で決めない。

静的確認はsource/consumer/fixed/current/decision/MPR line SHA、whole-file SHA、94 decision row count/adoption counts、JSON構文、`scfctl validate`、`git diff --check`に限る。実装、旧runtime/test/CI、要求stage完了を主張しない。
