# WR258 SEC006 L4/L9 source classes and cross-layer integration candidate

status: scaffold evidence; authority_effect: none
base: `3e469f273817af640a2adafa50b8548b22a107fd`
binding: `SCF-B-0218`

`integration-candidate.json` records the source-derived six-class design for the nine L8 rows without a receiving L4 class, the row references, and the L8/L9 fallback pairing issue. The L4/L9 documents carry only this V-pair. No explicit four-layer marker is set because QA §3 requires complete markers across L4/L5/L8/L9.

The six L9 primary-tree fallback rows remain distinct. The existing L8 unit row reads only `/request/fallback`; PR #4000 R1 removed six candidate rows with the same projected input and outcome. A one-to-one mapping therefore needs a separate source-level decision about caller-kind unit coverage or the application of QA's pair contract. This artifact leaves the conflict unresolved and does not change the QA contract.
