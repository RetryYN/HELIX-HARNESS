# 現行AI文書consumer relation inventory

確認日: 2026-09-14

## 目的

現行AI読取り入口38件が、どの仕組みによって読まれ、生成され、配布され、整合を強制されるかを要求源として分類する。
文字列参照数をconsumer数にせず、relationの種類、読取り主体、適用時点、移管先を記録する。本inventoryは旧実装の
再利用設計ではなく、要求整理完了前の見落としを防ぐための適用待ち差分である。

## 確認したrelation family

| Relation ID | relation | 現行の代表source／consumer | 適用時点 | 採取する意味 | 新しい要求owner |
|---|---|---|---|---|---|
| AICR-01 | session rule input | `AGENTS.md`、`CLAUDE.md`、`.claude/CLAUDE.md` | AI session開始・作業中 | 対象scope、工程、禁止、停止、必須read | HARNESS工程契約＋HELIX-OS session context |
| AICR-02 | sealed Worker context input | `src/runtime/worker-context-packet.ts`の固定authority／rule path | Worker委譲前 | revision固定、source digest、未解決時の停止 | HELIX-OS assignment／Worker context |
| AICR-03 | native role／command discovery | `.claude/agents/*.md`、`.claude/commands/*.md` | providerがrole／commandを発見するとき | capability、入力、成果形式、停止条件 | HELIX-OS Worker／command。工程意味はHARNESS参照 |
| AICR-04 | registry binding | `config/specialist-agent-registry.json`、`config/document-agent-metadata-scope.json` | role選定・文書scope判定 | role identity、capability、source digest、対象文書 | HELIX-OS assignment／capability registry |
| AICR-05 | hook／adapter activation | `.claude/settings.json`、`.codex/hooks.json`、`.codex/config.toml` | provider event・操作前後・session lifecycle | event、拒否、記録、provider差 | HELIX-OS adapter／実行統制 |
| AICR-06 | generated consumer adapter | `src/setup/templates.ts`、`docs/templates/adapter/`の34ファイル | consumer setup／更新 | upstreamから生成すべきinstruction、role、command、hook設定 | HELIX-OS生成・適用統制。HARNESS契約は参照のみ |
| AICR-07 | distribution projection | `config/distribution-capability-artifact-catalog.json`、setup／distribution処理 | package生成・consumer導入 | 配布対象、source、生成物、適用scope | HELIX-OS配布統制 |
| AICR-08 | drift／admission enforcement | `src/lint/rule-drift.ts`、`src/lint/codex-hook-adapter.ts`、agent／asset関連lint | 診断・admission | source-output不一致、欠落、provider mapping不一致の拒否 | HELIX-OS適用統制。必要oracleはHARNESS |
| AICR-09 | recovery／resurrection scan | `src/audit/handover-resurrection-source.ts`、`config/legacy-orchestration-surface-inventory.json` | 復元・退役確認 | 旧instruction再出現、生成・配布経路の残存検出 | HELIX-OS archive／復旧統制 |
| AICR-10 | design／test／history citation | `docs/`、`tests/`、PLAN、research内の参照 | 設計・検証・履歴参照 | provenance、既知failure、判断史 | 要求候補またはhistorical evidence。runtime inputではない |

`src/`と`config/`で対象path文字列を含む55ファイル、`docs/templates/adapter/`で34ファイルを発見した。55件は
コメント、fixture、診断、生成、実読込みが混在するため、consumer closure件数として扱わない。34件は現行templateの物理集合であり、
新世代template数や構成を固定しない。

## relationごとのarchive前確認

| relation | archive前に必要な確認 |
|---|---|
| input | 新世代session／Workerの実測read setに旧pathが含まれない |
| registry | role／capability／source digestが承認済みOS要求から再導出され、旧promptをauthorityにしない |
| activation | provider eventから新世代の承認済み統制だけへ到達し、旧hookをfallbackにしない |
| generation | source→generator→output→consumerのrevisionとdigestが追跡できる |
| distribution | 配布対象と適用scopeが製品別に決まり、HARNESSとOSを一括所有しない |
| enforcement | 新世代要求から導いたnegative oracleを使い、旧byte／shape parityを合格条件にしない |
| recovery | archive済みsourceがcurrent input、生成物、配布物、復元経路へ再出現しない |
| citation | current authority、compatibility、historicalを区別し、引用だけで実行可能性を生成しない |

## 未完境界

- AICR-01..10はrelation familyの分類であり、全symbol、call graph、外部providerの暗黙read、machine-local設定を閉じていない。
- 実consumer closureは、承認済みAIDOC要求からL3 manifest契約を導出した後、静的graphと実測read evidenceの両方で閉じる。
- GitHub Issue／PR、現行test green、既存CI、旧inventoryの最大出現数を、新世代consumerの正本や完全性証拠にしない。
- 現段階では現行文書、template、registry、hook、adapter、runtime、test、配布物を変更・移動・実行しない。

## 要求への適用待ち差分

AICR-01..10の意味は`AIDOC-OS-008`へまとめ、HELIXOS-L2-002／003／004／006／007／009へ接続する。
受入では、同一旧pathをinput、registry、generation、distribution、enforcement、recoveryの異なるrelationとして与え、
一件の文字列参照や一つの置換で全consumer移管済みと判定しないことを確認する。
