# Wave12 direct semantic review 方法（2026-09-21）

対象はHELIX-HARNESSの `IRUNIT-HIL-BR-07-HELIX-HARNESS`、`IRUNIT-HIL-BR-21-HELIX-HARNESS`、`IRUNIT-HIL-FR-45-HELIX-HARNESS` である。parent `1c6062e4922b01bc0584aa76e902b737b65da25d` を固定し、Wave1〜11のunit、edge、design／plan／implementation assetを除外した。累計は35 unit／105 edge、残り183 unitである。

要求atomはproduct unit crosswalkの `source_text_spans` だけを無損失に分解する。別product unitへ分割された原要求の句をこのunitへ戻さない。BR07はAIの終端操作禁止、非actionable dispositionの非終端性、POのcancel/supersede authorityの3 atom、BR21は対象scope、DesignRefactor契約、Redesign/Retrofit rerouteの3 atom、FR45はLedger主体、stable ID、immutable revision、typed ledger obligation、requirement definition/revision、typed edgeの6 atomとした。FR45の `stable requirement IDとimmutable revision` に限り `と` を明示connectiveとし、主語・責務・意味句をconnectiveへ移さない。

requirement edgeは同一requirement ID、semantic digest、source snapshotのcontract根拠としてconfirmedにする。共通requirement assetのcatalog phase候補は個別requirementのphase分類ではないため、requirement roleにphase交差を要求しない。design／plan／implementation edgeはcatalogのphase・product候補と意味照合を分離する。classification conflictは隠さずrecordへ残し、candidate membershipからsemantic linkを生成しない。

confirmed／unresolved edgeはrecord単体で限界を復元できるようcounterevidenceを必須とする。requirement roleはRequirement IR snapshotが実装・実行証拠ではないこととconsumer closure未確認を、design roleはdesign文書が実装・実行証拠ではないことを明記する。design confirmedは、covered atomごとに要求atomの統制語を静的引用が直接含み、evidence bindingがそのexact spanへ接続する場合に限る。このconfirmedはdesign contractの意味証拠に限定し、implementation contribution、consumer closure、実行可能性を生成しない。

BR07のdesign／implementation候補はuniversal improvement finding dispositionでありBR07 atomを支えないためrejected、covered atom 0とした。BR21 designはexternalize／commonize／objectizeとRedesign／Retrofit rerouteを直接示すためA02/A03をconfirmed design evidenceとし、scope A01は未被覆のまま残す。BR21 implementation候補はV-model pair mapだけなのでrejected。FR45 planはRequirement JSON refinementの一部を扱うがunit atomへの直接bindingを確立しないためunresolved、covered atom 0。FR45 implementationは未使用asset `LEGACY-ASSET-E3E4D23A3AB9C149BE3D` を選び、stable requirement identityに限る静的部分証拠としてA02だけをunresolvedにした。catalog phase `PHCAP-02` とunit phase `PHCAP-03/05` は非交差、product候補は空であり、classification conflictを明記した。

verifierはparent blob、全入力digest、4,020 catalog、archive manifest、exact fields、role-kind、全roleのevidence path、exact line span／excerpt digest、atom binding、connective allowlist、shared boundary、bounded search、Wave1〜11とのunit／edge／design・plan・implementation asset非重複、coverage digest、文書countを検査する。negative mutationはparent、catalog、archive、asset、line、excerpt、kind、relation、phase、product、atom、connective、boundary、search、prior overlap、status、coverage、documentの各classを対象とする。これはmutation注入試験の実施を意味しない。

archiveは静的read-only参照だけに使用し、runtime、test、hook、CI、adapterは実行していない。
