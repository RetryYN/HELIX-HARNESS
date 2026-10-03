# RDP-001 — DOC-005/014・DOC-011/018 source atom scaffold

`origin/main` の `ec80948df480d144022ff5e510ff94f0839f8a7a` を固定した独立候補である。既候補10文書・22 edgeを除外し、次のL3/L10 pairを2組、source/reference holdingからread-onlyで束ねた。

- `DELEGATED-DOC-005`（L3 GitHub運用投影、188行） ↔ `DELEGATED-DOC-014`（L10 test design、56行）。原IDはL3 27件、L10 11件、semantic atomは2件／11件、edgeは `DELEGATED-REF-0305`／`0763`。
- `DELEGATED-DOC-011`（L3 worker共通契約、146行） ↔ `DELEGATED-DOC-018`（L10 test design、65行）。原IDはL3 16件、L10 9件、semantic atomは2件／9件、edgeは `DELEGATED-REF-0373`／`0783`。

今回の分母は4 source document／455 source lines／24 semantic atoms／43 L3 original IDs／20 L10 original IDs／4 reference edgesである。全blobは各ファイルの1..N spanで保持し、atom span unionの被覆はDOC-005=120/188、DOC-014=11/56、DOC-011=16/146、DOC-018=9/65、未被覆はそれぞれ68/45/130/56行としてinventoryにline listとdigestを記録した。validatorはfull blobとatom spanを別々に再計算し、未被覆分母の変更をfail-closeする。

固定blobから再計算したAC集合とL10 test行の明示参照は、GOP pairが `GOP-AC-01..11` と `GOP-T-01..11` の対応に加え、L3だけの `GOP-AC-04a` を未解決差分として保持する。WCC pairは `WCC-AC-01..07` と各 `HAT-WCC` 行の明示AC参照を保持する。AC/T対応、未解決差分、cross-document citeは推測で閉じない。

source assetのlegacy implementationはunknown、legacy executionはfalse、phase authorityはunconfirmed、consumerはpendingである。product ownerとconsumerは `HELIX-HARNESS`／`HELIX-OS` 候補だけを記録し、採用、owner確定、phase authority、実装、consumer closure、acceptance完了、L3/L10 freeze、runtime/CI readinessは生成しない。`closure_guard`の全9 field、top-level整合、`equivalence_claim: null`を固定する。

source holding 114文書／788 edgeに対して、既候補10文書／22 edgeを差し引いた着手前は104文書／766 edge。今回4文書／4 edgeを束ねた後の残分母は**100文書／762 edge**である。SCF-B-0013はこの候補だけを登録し、既存Bindingは変更しない。

検証は旧archiveのruntime・test・CIを実行せず、次だけを静的に行う。

```text
python3 scaffold/delegated-doc-005-014-011-018/validate.py
python3 scaffold/delegated-doc-005-014-011-018/selfcheck.py
python3 scaffold/tools/scfctl.py validate
python3 scaffold/tools/scfctl.py stale
python3 scaffold/tools/scfctl.py residuals
git diff --check
```

scaffold検証の合格は、要求採否、人間承認、意味確定、採用、holding closure、実装、consumer closure、acceptance、CI、releaseを意味しない。commit、push、PR、merge、Issue更新は行わない。
