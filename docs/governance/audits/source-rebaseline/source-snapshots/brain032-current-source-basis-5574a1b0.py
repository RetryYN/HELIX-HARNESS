#!/usr/bin/env python3
"""BRAIN032 8..28向け静的source-first監査reader。製品runtimeではない。"""
from __future__ import annotations
import copy, hashlib, json
from pathlib import Path
ROOT=next((p for p in Path(__file__).resolve().parents if (p/'docs/helix-brain/L8-unit-verification/template-semantic-supply.json').exists()), None)
if ROOT is None: raise RuntimeError('repository root not found')
L8_REL='docs/helix-brain/L8-unit-verification/template-semantic-supply.json'
L4_REL='docs/helix-brain/L4-basic-design/template-semantic-supply.json'
L5_REL='docs/helix-brain/L5-detail-design/template-semantic-supply.json'
L4_SHA='4ef60d6c0d15fa0339f525ad92c5754994dc83b56bb70b3397635e74c9bd88c2'
L5_SHA='449bc77b9775566dd516e006c5f2ee274e1493547f0e7e153f01c38d4de3c577'
L8_BASE_RAW_SHA='6cd0dc78d931154f9931f950a4fceca68806dde03f5da6a0a22deb7cbca3d084'
RAW_PATCH_PROJECTION_SHA={
 '8':'87bdf3783754fab07d6867987aa8134dc984d4ab2e1c215e928c23bc02803998',
 '9':'e0a64ea52e305717ce8b9772dc637c3d892b803282d45e84c221470939e04869',
 '10':'361af43aec1f9fe96bc04d43638b4d1578e09caa3827237b04e8282a6616a2d5',
 '11':'d340014c99e7a9a7656cf26202e21d75099a31b870b00d9e4ddd1d151870fd1f',
 '12':'4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945',
 '13':'8e8a176fd3689c89bd6122903f210e4bb86ce9a46b6995c46a3252976d07dd84',
 '14':'0916ee51729071ddd239ef073191426cd8295ce4bab08a42c2b3aed443aa6d89',
 '15':'8b58f1719581ada83678088ab8fab3b60f752a16ec926c3b8bbcb7e753b030a3',
 '16':'8d937176cc54128b221644aed4ae37cb0f7ac40e5a5257fca3d4bc1065b2672a',
 '17':'28ca9b1a71a87971a26c8ddd0f855234b6710782855bf85a438267ebeab2f7d6',
 '18':'a6f689c8c9532c90eee1f53af87f633c698b3ac8120ccbca9c33dafac1377a42',
 '19':'45d56be8f13f3f53f7888fe686d83496916d1049e26297f6241afda1b4f1bae3',
 '20':'40ff43095d106900f6c194e5d3fe5a20d7937fc9abe9422a114f60c1a81cbac0',
 '21':'277cc00c1102e4f83311834fefd16e6ade5763263a9d3b855c3eb090f7e41004',
 '22':'d0a1fe4abf03f2141706f142deba686a6d6a830f87c82ab7bcd579266e0dcb54',
 '23':'932af17f316ad5de13a6aaf1ccdccbd26f9f78df1caa88b6267aeb5592c04daa',
 '24':'c761ec0c00d6b7a1e8406fba0ed83ca121279c7cad3f840bfb936b0a4eeebfa6',
 '25':'adf13917a40d1be34b3838de7245220a261a83b33ad5473e55be6481b7ffdd15',
 '26':'9969ff46ead5567d7f79b9158d0d78566f1b04627b69a705e716d3bed0e960eb',
 '27':'97311ea0272e6a7c47a9a53f0bd41e3a360b0cb916a0815d4f992f2094e7689a',
 '28':'78a5bcce128942d27cd41b40dd1d9d0ebe7867b190d3aafce75ef9aa623003f1'}
RAW_CASE_BINDINGS={'8': {'id': 'NA-REQUEST-EXPLICIT-NULL', 'base_pointer': '/definition_meaning_walk_verification/materials/1', 'raw_canonical_sha256': '8bd07c5e73b49b77ffb5dcd2cf2a54bdbfd8204dd8204a447dda6350a534438a'}, '9': {'id': 'NA-REQUEST-REF-UNRESOLVED', 'base_pointer': '/definition_meaning_walk_verification/materials/1', 'raw_canonical_sha256': 'a56cb8fc6003d6d9f16e2cfc2c813ef50f599a9f71993466ac0d0e171a0e9160'}, '10': {'id': 'NA-NATIVE-OWNER-UNKNOWN', 'base_pointer': '/definition_meaning_walk_verification/materials/1', 'raw_canonical_sha256': 'def3e45c65795491bb7a4e884f505b789acef7087685492976f7a2c6d7e9700e'}, '11': {'id': 'NA-NATIVE-OWNER-APPLICABLE', 'base_pointer': '/definition_meaning_walk_verification/materials/1', 'raw_canonical_sha256': '8b58aa02b176c0ccca52c52e0036c92f7817b686a09ae1af6f72cd0e61d31c5f'}, '12': {'id': 'NA-ORIGINAL-NOT-APPLICABLE-REENTRY-FALSE', 'base_pointer': '/definition_meaning_walk_verification/materials/1', 'raw_canonical_sha256': '6cd0dc78d931154f9931f950a4fceca68806dde03f5da6a0a22deb7cbca3d084'}, '13': {'id': 'NA-ORIGINAL-DECISION-ABSENT', 'base_pointer': '/definition_meaning_walk_verification/materials/1', 'raw_canonical_sha256': '1a0b5bbda84f698cedaebabf9eb5358dbddc9d3af95b029d87c897acabebd9c0'}, '14': {'id': 'NA-REASON-ABSENT', 'base_pointer': '/definition_meaning_walk_verification/materials/1', 'raw_canonical_sha256': '6f4640fda63c411b8c85e3d2530feb8fce44c35d6e9ecb4fda28bb0815b6c095'}, '15': {'id': 'NA-REASON-NULL', 'base_pointer': '/definition_meaning_walk_verification/materials/1', 'raw_canonical_sha256': 'bb884e836c6df403a9b6a3b3788491c23f239d80b104113db3ebb6299e0d420a'}, '16': {'id': 'NA-REASON-EMPTY-STRING', 'base_pointer': '/definition_meaning_walk_verification/materials/1', 'raw_canonical_sha256': '4475c9bc1afaf33013a9d9a683728e6170bca53cd7b5d5c295b9f920ddad7256'}, '17': {'id': 'NA-REENTRY-ABSENT', 'base_pointer': '/definition_meaning_walk_verification/materials/1', 'raw_canonical_sha256': '3ef90f8dd923fda869c2bbb784e16d22cf11c772f37eeee2fc379095ab6f4290'}, '18': {'id': 'NA-REENTRY-NULL', 'base_pointer': '/definition_meaning_walk_verification/materials/1', 'raw_canonical_sha256': '0934868d71af04f031eca193f5321c263b3bc3fd707ae11c9fae4f2913b93fc5'}, '19': {'id': 'NA-REENTRY-ZERO', 'base_pointer': '/definition_meaning_walk_verification/materials/1', 'raw_canonical_sha256': '82b3ad50701d0a9a1019c3a2110a4a64363d8267dd5a2c0f7acebb9cbcda77d2'}, '20': {'id': 'NA-REENTRY-EMPTY-STRING', 'base_pointer': '/definition_meaning_walk_verification/materials/1', 'raw_canonical_sha256': 'e7ae5278e0e10ace7dfdd774164900258970152ba63f3fd34fc410f548d50d09'}, '21': {'id': 'NA-REENTRY-EMPTY-ARRAY', 'base_pointer': '/definition_meaning_walk_verification/materials/1', 'raw_canonical_sha256': 'c8b343a7788c4c4489e59cb2acd4ed02cd40b2f472b66e134ba00bc2293fbe94'}, '22': {'id': 'NA-REENTRY-EMPTY-OBJECT', 'base_pointer': '/definition_meaning_walk_verification/materials/1', 'raw_canonical_sha256': '033fb13eb72beb69ae6cce89a27eee6035a6d5eaafcd8ba3fbe5437692a240ec'}, '23': {'id': 'NA-TWO-ORIGINAL-RECORDS-FALSE-AND-ZERO', 'base_pointer': '/definition_meaning_walk_verification/materials/1', 'raw_canonical_sha256': 'e7acb466ce6f02969e8578b6a974b5d9f755493802141c2970b2fe3776b07e92'}, '24': {'id': 'NA-IDENTICAL-ORIGINAL-SOURCE-RECORD-REPEATED', 'base_pointer': '/definition_meaning_walk_verification/materials/1', 'raw_canonical_sha256': '175a0007077122d32bc65896919c86354f9a05641242b0e9166b556860c89600'}, '25': {'id': 'NA-FOREIGN-SUBJECT-RECORD', 'base_pointer': '/definition_meaning_walk_verification/materials/1', 'raw_canonical_sha256': 'f974c93f129e9b25d9b910c9e2cd8f682a5474defd7519cc90e7158dda5d8574'}, '26': {'id': 'NA-QUALIFICATION-WRONG-SCOPE', 'base_pointer': '/definition_meaning_walk_verification/materials/1', 'raw_canonical_sha256': 'f483025d2dd7619569fd0173f21cfd42614f04dd0a3a9d91f8772538b44904cf'}, '27': {'id': 'NA-MATERIAL-PRESENT-REQUEST-ABSENT', 'base_pointer': '/definition_meaning_walk_verification/materials/1', 'raw_canonical_sha256': '3e9b0d295092d69ff4aff57db4c78f288150496334715f87df4f8515f82bc6de'}, '28': {'id': 'NA-SOURCE-ZERO-ROOT-FALSE-MIRROR-DIFFERS', 'base_pointer': '/definition_meaning_walk_verification/materials/1', 'raw_canonical_sha256': '9569840f1072c6748868a72def2b3a6cf1018af756235c28a36cc50d0fe120ff'}}
FROZEN_CANONICAL_SHA256={'8': '72a91bb4a4b064cbb4a757e7f13cb59b96fc6afacd29c7c4456420ad7765d241', '9': '9d801939deee864ecd6ab30a81c55e86aac8d88dd0bf59f9992bf2356a94f74f', '10': 'bfeae27fc5eee2e6c2a6d9e2b08c674f90f3332dcde119c88afe27837bdc537b', '11': 'cd2d8e7442273aa36e6d8bd02fc8604f4a7dc1a33bf20c1a02248f0ebfe97d7b', '12': '7ed321eba6fed564640cca7e9b8b3319a6e50942e86661d790a3414bffcde6bf', '13': '416979ce0d9c67399ff7b24685651e1e4dd19ad1f6ecb011cf47310fb8d6ef7f', '14': '65ce3b57a7c535059b5b321001e28d757879f80f5f25e64d1350c40166422748', '15': '32b05eef3b9f81ab1ecde00d9728a200533d64a2b69120839d7340b6046823d0', '16': 'a585f5caa5fe4568f4156234f9523a9e2e5ebed87502b9565bf7867214bd5c45', '17': '6831aaf70aca1465e69c1ab11d2faa2889ee1a8e01397435784baf0fd42fd1cf', '18': 'e952ea77813721881c17f838af6b92418ce4e368281fe7fb6fb17ff9cd19c9a8', '19': '2fcd1adf545645c91469e14b91b9dd39e42f1b680cf61a1be34b2b7bd784603a', '20': 'fc9b03a4e0ecf57f563f07663abda25f13394cf012dde1ec202a81d2353f006f', '21': 'ac6906c525c240fe1c4584bbf4079e545ef6dab2bde41ba2d8367c38334d24ea', '22': '7a189c77ad745e75086b9bce8aafa8e3c838b8cea51bd98ebeced3186cecb0dc', '23': '0d0df4b185f475547e3415f07092982851c9932655df16623fbd3ac7df1f51be', '24': '59783e93d9d253fee62d832f3b8913e9eae740b23898389f3a9ee600028fbeff', '25': '33b1d482ecfb24749d324b4df5410b58ff727ff5b9bf304efe3e688bb83d21be', '26': 'e4d5c4307b2ee0a384aac5b45f3350b2f71105589a22e4b172b0ff3e1dd997ae', '27': '3d20ae14439bd4e748e07429d5e4a3c141b30625d0687e8e870bfb1d17645e8b', '28': '53e79fa870390ffb12d9474ee30ceaa9d885e8da0dd1424f89253333da961a78'}
APPROVED_OBJECTS=[
 ('docs/helix-brain/L3-requirements/functional-requirements.json','HELIXBRAIN-L3-032-F01','ebc2da3936a606c23ff1c2e08eefd549eb99d2cb51e45cc17e4cd003663cda35'),
 ('docs/helix-brain/L3-requirements/functional-requirements.json','HELIXBRAIN-L3-032-F02','e1c325353009052758b9707e509f652fa63def733c3c4c5a82d3fc4d2a640a3e'),
 ('docs/helix-brain/L3-requirements/nfr-grade.json','HELIXBRAIN-L3-032-N01','de8c3d4e53c0b8c4cf0c43bc9cb90430c23f9ed96d6a81cc6c44cca68b538905'),
 ('docs/helix-brain/L3-requirements/business-requirements.json','HELIXBRAIN-L3-032-B01','f40d88606a3d1373a447e4067b93d82c9c7754867348dc4694e345b88812d7a2'),
 ('docs/helix-brain/L10-verification/functional-verification.json','HELIXBRAIN-L10-032-F01','ee86fd3f61e9252dbc07b2d92b6dbb571820e7cf3cf4fcfefe2941333cedffd2'),
 ('docs/helix-brain/L10-verification/functional-verification.json','HELIXBRAIN-L10-032-F02','19a2fbf38750ddddfd9ff26b6f8f564bd3860ab513fa4dc0a9a8b44293caf739'),
 ('docs/helix-brain/L10-verification/nfr-verification.json','HELIXBRAIN-L10-032-N01','e00b4bb11cfc69b34e50a0333fb0b5efce59e5de7086041df781edd3eeb07d84'),
 ('docs/helix-brain/L10-verification/business-verification.json','HELIXBRAIN-L10-032-B01','396415ca46e2480b26904724646a3502de4903d7190eb9cdda17f92feca16906')]
CAN=lambda x: json.dumps(x,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()
def file_sha(path): return hashlib.sha256((ROOT/path).read_bytes()).hexdigest()
def find_id(value, identity):
 if isinstance(value,dict):
  if value.get('id')==identity: return value
  for child in value.values():
   found=find_id(child,identity)
   if found is not None: return found
 elif isinstance(value,list):
  for child in value:
   found=find_id(child,identity)
   if found is not None: return found
 return None
def verify_sources(l8):
 # L4/L5 are pinned as current source documents. L8 is pinned only at the
 # exact input objects consumed below, so a sibling audit object may be added.
 for rel,want in ((L4_REL,L4_SHA),(L5_REL,L5_SHA)):
  actual=file_sha(rel)
  if actual!=want: raise ValueError(f'source pin mismatch {rel}: {actual}')
 material=resolve_pointer(l8,'/definition_meaning_walk_verification/materials/1/raw_input')
 if hashlib.sha256(CAN(material)).hexdigest()!=L8_BASE_RAW_SHA:
  raise ValueError('L8 base raw_input object pin mismatch')
 cases=resolve_pointer(l8,'/definition_meaning_walk_verification/cases')
 for i in range(8,29):
  if i>=len(cases): raise ValueError(f'L8 case absent: {i}')
  binding=RAW_CASE_BINDINGS[str(i)]
  if cases[i]['fixture_base_pointer']!=binding['base_pointer'] or cases[i]['id']!=binding['id']: raise ValueError(f'L8 case identity/base source mismatch: {i}')
  selected=[]
  for index,op in enumerate(cases[i].get('fixture_patch',[])):
   path=op.get('path','')
   if path=='/raw_input' or path.startswith('/raw_input/'):
    selected.append((index,op))
   elif path.startswith('/raw_input'):
    raise ValueError(f'non-canonical raw_input patch path case={i} index={index}')
  got=hashlib.sha256(CAN(selected)).hexdigest()
  if got!=RAW_PATCH_PROJECTION_SHA[str(i)]: raise ValueError(f'L8 raw patch projection mismatch case={i}')
 for rel,identity,want in APPROVED_OBJECTS:
  obj=find_id(json.loads((ROOT/rel).read_text(encoding='utf-8')),identity)
  if obj is None or hashlib.sha256(CAN(obj)).hexdigest()!=want: raise ValueError(f'approved target object mismatch: {identity}')
def resolve_pointer(value,pointer):
 cur=value
 for part in pointer.strip('/').split('/'):
  key=part.replace('~1','/').replace('~0','~')
  cur=cur[int(key)] if isinstance(cur,list) else cur[key]
 return cur
def apply_patch(doc,op):
 parts=[x.replace('~1','/').replace('~0','~') for x in op['path'].lstrip('/').split('/')]
 parent=doc
 for key in parts[:-1]: parent=parent[int(key)] if isinstance(parent,list) else parent[key]
 key=parts[-1]; action=op['op']
 if isinstance(parent,list):
  index=len(parent) if key=='-' else int(key)
  if action=='replace': parent[index]=copy.deepcopy(op['value'])
  elif action=='remove': parent.pop(index)
  elif action=='add': parent.insert(index,copy.deepcopy(op['value']))
  else: raise ValueError(f'unsupported patch op {action}')
 elif action=='remove': parent.pop(key)
 elif action in ('add','replace'): parent[key]=copy.deepcopy(op['value'])
 else: raise ValueError(f'unsupported patch op {action}')
def raw_input_for(l8,case):
 # Only the raw input object enters the constructor; expected_* and other
 # fixture material are never copied into this wrapper.
 base=resolve_pointer(l8,case['fixture_base_pointer'])
 wrapper={'raw_input':copy.deepcopy(base['raw_input'])}
 selected=[]
 for index,op in enumerate(case['fixture_patch']):
  path=op.get('path','')
  if path=='/raw_input' or path.startswith('/raw_input/'):
   apply_patch(wrapper,op); selected.append(index)
  elif path.startswith('/raw_input'):
   raise ValueError(f'non-canonical raw_input patch path index={index}')
 raw=wrapper['raw_input']
 return raw,selected
def canonical(value: object) -> bytes:
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode()


def sha(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def presence(value: object) -> dict:
    return {"presence": "supplied", "value": copy.deepcopy(value)}


def absent() -> dict:
    return {"presence": "absent"}


def pointer_escape(s: str) -> str:
    return s.replace("~", "~0").replace("/", "~1")


def sorted_refs(refs: list[dict]) -> list[dict]:
    # Existing sorted_values primitive: canonical JSON Unicode order; duplicates remain.
    return sorted((copy.deepcopy(x) for x in refs), key=lambda x: canonical(x).decode("utf-8"))


def normative_frame(l4: dict, index: int) -> dict:
    snap = l4["definition_meaning_resolution_contract"]["normative_basis_snapshot"]
    entry = snap["entries"][index]
    return {
        "revision": snap["revision"],
        "path": snap["path"],
        "file_sha256": snap["file_sha256"],
        "catalog_pointer": snap["pointer"],
        "catalog_canonical_sha256": snap["canonical_sha256"],
        "scope": copy.deepcopy(snap["scope"]),
        "entry_pointer": entry["pointer"],
        "entry_canonical_sha256": entry["canonical_sha256"],
        "entry_value": copy.deepcopy(entry["value"]),
    }


def source_first_guard(raw: dict, l4: dict) -> None:
    assert len(raw["descriptors"]) == len(raw["sources"]) == len(raw["qualifications"]) == 15
    assert raw["required_descriptor_kinds"] == [x["value"]["descriptor"] for x in l4["definition_meaning_resolution_contract"]["normative_basis_snapshot"]["entries"]]
    assert len(raw["qualification_roots"]) == 1
    assert len(raw["applicability_records"]) == 0
    assert all(not raw[k] for k in ("meaning_comparisons", "claims", "relations", "section_fields", "values", "oracle_bindings", "compatibility_records", "handoff_records"))
    for i, (slot, source, qualification) in enumerate(zip(raw["descriptors"], raw["sources"], raw["qualifications"])):
        fact = slot["facts"][0]
        operation = source["content"]["definition_meaning_operations"][0]
        assert source["role"] == "semantic_json"
        assert source["qualification_ref"] == qualification["ref"]
        assert qualification["root_ref"] == raw["qualification_roots"][0]
        assert qualification["subject_ref"] == source["ref"]
        assert qualification["subject_sha256"] == source["ref"]["sha256"]
        assert hashlib.sha256(source["content_bytes"].encode()).hexdigest() == source["ref"]["sha256"]
        assert canonical(json.loads(source["content_bytes"])) == canonical(source["content"])
        assert source["content"]["binding"] == slot["binding"]
        group = source["content"]["descriptor_facts"][0]
        assert group["slot_identity"] == slot["slot_identity"]
        assert group["descriptor_kind"] == slot["descriptor_kind"]
        assert group["facts"] == [fact]
        args = operation["arguments"]
        assert args["binding"] == slot["binding"] == fact["binding"]
        assert args["slot_identity"] == slot["slot_identity"]
        assert args["descriptor_kind"] == slot["descriptor_kind"] == raw["required_descriptor_kinds"][i]
        assert args["fact_ref"] == fact["ref"]
        assert args["fact_body"] == fact["meaning"]
        frame = normative_frame(l4, i)
        assert args["normative_argument"] == frame
        assert operation["decision"]["relation"] == "defines_descriptor"
        assert operation["decision"]["reason"]["presence"] == "supplied"
        assert operation["decision"]["raw_semantic_basis"]["presence"] == "supplied"
    assert "definition_applicability_ref" not in raw["descriptors"][0]
    assert raw["descriptors"][5]["definition_applicability_ref"] is None
    assert all("definition_applicability_ref" not in x for i, x in enumerate(raw["descriptors"]) if i != 5)


def key_for(slot: dict) -> dict:
    return {
        "binding": presence(slot["binding"]),
        "slot_identity": presence(slot["slot_identity"]),
        "descriptor_kind": slot["descriptor_kind"],
    }


def meaning_read(raw: dict, l4: dict, i: int, base: str) -> tuple[dict, dict]:
    slot = raw["descriptors"][i]
    fact = slot["facts"][0]
    src = raw["sources"][i]
    op = src["content"]["definition_meaning_operations"][0]
    frame = normative_frame(l4, i)
    fact_loc = f"{base}/descriptors/{i}/facts/0"
    op_loc = f"/sources/{i}/content/definition_meaning_operations/0"
    occurrence = {
        "source_ref": copy.deepcopy(src["ref"]),
        "source_index": i,
        "record_index": 0,
        "locator": op_loc,
        "original_record": copy.deepcopy(op),
        "decoded_record": presence(op),
    }
    support = {
        "source_ref": copy.deepcopy(src["ref"]),
        "source_index": i,
        "record_index": 0,
        "locator": op_loc,
        "operation": copy.deepcopy(op),
        "normative_frame": frame,
    }
    read = {
        "slot_locator": f"{base}/descriptors/{i}",
        "fact_locator": fact_loc,
        "binding": presence(slot["binding"]),
        "normative_frame": frame,
        "acquisition_state": "resolved",
        "occurrences": [occurrence],
        "supports": [support],
        "problems": [],
    }
    origin = {
        "problem_scopes": [],
        "support_origins": [{"support_index": 0, "problem_indices": []}],
    }
    return read, origin


def applicability_read(raw: dict, i: int, base: str) -> tuple[dict, list[dict]]:
    slot = raw["descriptors"][i]
    loc = f"{base}/descriptors/{i}"
    if "definition_applicability_ref" not in slot:
        read = {
            "slot_locator": loc,
            "request": absent(),
            "acquisition_state": "not_requested",
            "source_occurrences": [],
            "supports": [],
            "problems": [],
        }
        return read, []
    assert slot["definition_applicability_ref"] is None
    problem = {
        "cause": "applicability_request_null",
        "source_ref": absent(),
        "source_index": None,
        "locator": f"{loc}/definition_applicability_ref",
        "original_value": presence(None),
        "reason": "定義非適用の原参照が明示nullであり、当該原判断を解決できない。",
    }
    read = {
        "slot_locator": loc,
        "request": presence(None),
        "acquisition_state": "unknown",
        "source_occurrences": [],
        "supports": [],
        "problems": [problem],
    }
    knowledge_ref = slot["binding"]["knowledge_ref"]
    judgment = {
        "state": "unknown",
        "origin_branch": "source_unresolved",
        "cause": "applicability_request_null",
        "axis": f"{slot['descriptor_kind']}.definition_applicability",
        "reason": "定義非適用の原参照が明示nullであり、当該原判断を解決できない。",
        "source_refs": [],
        "subject_ref": presence(knowledge_ref),
        "binding": presence(slot["binding"]),
        "backflow_owner": knowledge_ref.get("owner"),
        "slot_locator": loc,
        "record_locator": None,
    }
    return read, [judgment]


def helper_axis(slot: dict, fact: dict) -> dict:
    refs = sorted_refs([fact["source_ref"], fact["ref"]])
    return {
        "subject_ref": copy.deepcopy(fact["ref"]),
        "binding": copy.deepcopy(slot["binding"]),
        "axis": "descriptor.attribution",
        "state": "known",
        "original_refs": refs,
        "reason": "同じowner source内のidentity・kind・fact Ref/bodyが各caller slotへ一致する。",
        "backflow_owner": None,
    }


def definition_axis(slot: dict, fact: dict, source: dict, op: dict) -> dict:
    refs = [fact["ref"], fact["source_ref"], source["ref"], op["operation_ref"]]
    refs.extend(op["decision"]["basis_refs"])
    return {
        "subject_ref": copy.deepcopy(fact["ref"]),
        "binding": copy.deepcopy(slot["binding"]),
        "axis": f"{slot['descriptor_kind']}.definition",
        "state": "known",
        "original_refs": copy.deepcopy(refs),
        "reason": "当該原factへのowner意味解釈が、固定規範descriptorとの対応を支持している。",
        "backflow_owner": slot["binding"]["knowledge_ref"].get("owner"),
    }


def axis_sort_key(event: dict) -> tuple:
    slot = event["key"]["slot_identity"]["value"]
    binding = event["key"]["binding"]["value"]
    tr = binding["template_ref"]
    kr = binding["knowledge_ref"]
    source_presence = event["sort_source_refs"]
    # All supplied in this case; presence rank and canonical JSON as declared.
    assert source_presence["presence"] == "supplied"
    return (
        canonical(tr["identity"]).decode(),
        canonical(tr["revision"]).decode(),
        canonical(kr["identity"]).decode(),
        canonical(kr["revision"]).decode(),
        canonical(slot).decode(),
        canonical(source_presence["value"]).decode(),
        canonical(event["axis"]).decode(),
        event["ordinal"],
    )


def event_origin(event: dict) -> dict:
    keys = [
        "ordinal", "assessment_key", "branch", "state", "cause", "slot_locators",
        "fact_locators", "meaning_read_indices", "applicability_read_indices", "subject_ref",
        "binding", "axis_name", "original_refs", "reason", "backflow_owner",
        "finding_rule_indices", "sort_source_refs", "special_read_indices", "pair_origin_links",
        "applicability_judgment_links", "meaning_support_links", "meaning_problem_links",
        "special_support_links",
    ]
    result = {k: copy.deepcopy(event[k]) for k in keys if k != "assessment_key"}
    result["assessment_key"] = copy.deepcopy(event["key"])
    return {k: result[k] for k in keys}


def same_ref(a,b):
    if not isinstance(a,dict) or not isinstance(b,dict): return False
    for k in ('identity','revision','scope','owner'):
        if a.get(k) is None or b.get(k) is None or a.get(k)!=b.get(k): return False
    return not (a.get('sha256') is not None and b.get('sha256') is not None and a['sha256']!=b['sha256'])
def same_binding(a,b): return isinstance(a,dict) and isinstance(b,dict) and canonical(a)==canonical(b)
def qualified(raw,si):
    s=raw['sources'][si]
    if s.get('role')!='semantic_json' or not isinstance(s.get('content_bytes'),str): return False
    if hashlib.sha256(s['content_bytes'].encode()).hexdigest()!=s.get('ref',{}).get('sha256'): return False
    try:
        if canonical(json.loads(s['content_bytes']))!=canonical(s.get('content')): return False
    except Exception: return False
    qi=next((i for i,q in enumerate(raw['qualifications']) if same_ref(q.get('subject_ref'),s.get('ref'))),None)
    if qi is None: return False
    q=raw['qualifications'][qi]
    return (same_ref(s.get('qualification_ref'),q.get('ref')) and
        same_ref(q.get('root_ref'),raw['qualification_roots'][0]) and
        q.get('subject_sha256')==s['ref'].get('sha256') and
        q.get('applicable_scope')==s['ref'].get('scope') and
        q.get('qualification_body',{}).get('owner')==s['ref'].get('owner'))
def problem(cause,source_ref,source_index,locator,raw_value,reason):
    if cause=='applicability_unresolved': reason='当該原NA判断又は現在の対象への対応を解決できない。'
    return {'cause':cause,'source_ref':source_ref,'source_index':source_index,'locator':locator,'original_value':raw_value,'reason':reason}
def app_read_and_judgments(raw,slot_index):
    slot=raw['descriptors'][slot_index]; slotloc=f'/descriptors/{slot_index}'; ptr=slotloc+'/definition_applicability_ref'
    if 'definition_applicability_ref' not in slot:
        return {'slot_locator':slotloc,'request':{'presence':'absent'},'acquisition_state':'not_requested','source_occurrences':[],'supports':[],'problems':[]},[]
    req=slot['definition_applicability_ref']
    if req is None:
        p=problem('applicability_request_null',{'presence':'absent'},None,ptr,{'presence':'supplied','value':None},'定義非適用の原参照が明示nullであり、当該原判断を解決できない。')
        read={'slot_locator':slotloc,'request':{'presence':'supplied','value':None},'acquisition_state':'unknown','source_occurrences':[],'supports':[],'problems':[p]}
        return read,[judgment(slot,None,None,'unknown','source_unresolved','applicability_request_null','定義非適用の原参照が明示nullであり、当該原判断を解決できない。',[],slotloc,None)]
    root_matches=[(ri,r) for ri,r in enumerate(raw.get('applicability_records',[])) if same_ref(req,r.get('ref'))]
    occurrences=[]; supports=[]; problems=[]
    if not root_matches:
        problems.append(problem('applicability_unresolved',{'presence':'absent'},None,'/applicability_records',{'presence':'supplied','value':copy.deepcopy(raw.get('applicability_records',[]))},'定義非適用の原判断又は当該対象への対応を解決できない。'))
    source_rows=[]
    source_problem_rows=[]
    seen_source_indices=set()
    for ri,rootrec in root_matches:
        srcmatches=[(si,s) for si,s in enumerate(raw['sources']) if same_ref(rootrec.get('source_ref'),s.get('ref'))]
        if not srcmatches:
            problems.append(problem('applicability_unresolved',{'presence':'absent'},None,f'/applicability_records/{ri}/source_ref',{'presence':'supplied','value':copy.deepcopy(rootrec.get('source_ref'))},'定義非適用の原判断又は当該対象への対応を解決できない。'))
            continue
        for si,src in srcmatches:
            if si in seen_source_indices: continue
            seen_source_indices.add(si)
            carrier=src.get('content',{}).get('definition_applicability_records',[])
            if not isinstance(carrier,list):
                cause='container_absent' if 'definition_applicability_records' not in src.get('content',{}) else ('container_null' if src['content']['definition_applicability_records'] is None else 'container_type')
                val={'presence':'absent'} if cause=='container_absent' else {'presence':'supplied','value':copy.deepcopy(src['content']['definition_applicability_records'])}
                reason={'container_absent':'当該原sourceの要求されたcarrier memberが供給されていない。','container_null':'当該原sourceの要求されたcarrier memberが明示nullである。','container_type':'当該原sourceの要求されたcarrier memberが要求配列型でない。'}[cause]
                problems.append(problem(cause,{'presence':'supplied','value':copy.deepcopy(src['ref'])},si,f'/sources/{si}/content/definition_applicability_records',val,reason)); continue
            for ei,entry in enumerate(carrier):
                rec=entry.get('record') if isinstance(entry,dict) else None
                if not isinstance(rec,dict) or not same_ref(req,rec.get('ref')): continue
                loc=f'/sources/{si}/content/definition_applicability_records/{ei}'
                source_rows.append((si,src,ei,entry,rec,loc))
            if not qualified(raw,si):
                problems.append(problem('source_unresolved',{'presence':'supplied','value':copy.deepcopy(src['ref'])},si,f'/sources/{si}',{'presence':'supplied','value':copy.deepcopy(src)},'当該原source又はその既存owner資格を解決できない。'))
                source_problem_rows.append(si)
                continue
            for rsi,rsrc,rei,rentry,rrec,rloc in source_rows:
                if rsi==si:
                    occ={'source_ref':copy.deepcopy(src['ref']),'source_index':si,'record_index':rei,'locator':rloc,'original_value':copy.deepcopy(rentry)}
                    if not any(x['source_index']==si and x['record_index']==rei for x in occurrences): occurrences.append(occ)
    matched_root_indices=set()
    for si,src,ei,entry,rec,loc in source_rows:
        if si in source_problem_rows: continue
        exact=[(ri,rr) for ri,rr in root_matches if same_ref(rr.get('source_ref'),src.get('ref')) and canonical(rec)==canonical(rr)]
        if not exact:
            same_ref_roots=[(ri,rr) for ri,rr in root_matches if same_ref(rr.get('source_ref'),src.get('ref')) and same_ref(req,rr.get('ref'))]
            if same_ref_roots:
                problems.append(problem('applicability_unresolved',{'presence':'supplied','value':copy.deepcopy(src['ref'])},si,loc,{'presence':'supplied','value':copy.deepcopy(rec)},'当該原NA判断又は現在の対象への対応を解決できない。'))
            continue
        ri,rootrec=exact[0]; matched_root_indices.add(ri)
        if entry.get('slot_identity')!=slot.get('slot_identity') or entry.get('descriptor_kind')!=slot.get('descriptor_kind') or not same_binding(rec.get('binding'),slot.get('binding')):
            problems.append(problem('applicability_unresolved',{'presence':'supplied','value':copy.deepcopy(src['ref'])},si,loc,{'presence':'supplied','value':copy.deepcopy(rec)},'当該原NA判断又は現在の対象への対応を解決できない。'))
            continue
        subject=rec.get('subject_ref')
        if not any(same_ref(subject,f.get('ref')) for f in slot.get('facts',[])):
            problems.append(problem('applicability_subject_differs',{'presence':'supplied','value':copy.deepcopy(src['ref'])},si,loc+'/record/subject_ref',{'presence':'supplied','value':copy.deepcopy(subject)},'原NA判断のsubjectが現在の原fact又は明示owner targetに対応しない。'))
            continue
        supports.append({'source_ref':copy.deepcopy(src['ref']),'source_index':si,'record_index':ei,'locator':loc,'original_entry':copy.deepcopy(entry),'subject_refs':[copy.deepcopy(subject)]})
    for ri,rootrec in root_matches:
        if ri in matched_root_indices or any(si in source_problem_rows and same_ref(rootrec.get('source_ref'),raw['sources'][si].get('ref')) for si in range(len(raw['sources']))): continue
        if not any(same_ref(rootrec.get('source_ref'),src.get('ref')) and same_ref(req,rec.get('ref')) for _,src,_,_,rec,_ in source_rows):
            problems.append(problem('applicability_unresolved',{'presence':'absent'},None,f'/applicability_records/{ri}',{'presence':'supplied','value':copy.deepcopy(rootrec)},'当該原NA判断又は現在の対象への対応を解決できない。'))
    judgments=[]
    if supports:
        for sup in supports:
            rec=sup['original_entry']['record']; d=rec.get('decision','__ABSENT__')
            if d=='unknown': state,cause,reason='unknown','original_applicability_unknown','原ownerの定義適用判断がunknownである。'
            elif d=='applicable': state,cause,reason='known','original_applicability_applicable','原ownerは当該定義内容を適用対象としている。元定義状態は別に保持する。'
            elif d=='not_applicable':
                rv=rec.get('reason'); re=rec.get('reentry_condition')
                if isinstance(rv,str) and rv!='' and 'reentry_condition' in rec and re is not None:
                    state,cause,reason='not_applicable','original_definition_not_applicable','原ownerの理由と再評価条件を伴う定義内容の非適用を保持する。'
                else: state,cause,reason='unknown','applicability_basis_unresolved','原非適用判断の理由又は再評価条件が不足している。'
            else: state,cause,reason='unknown','applicability_unresolved','定義非適用の原判断又は当該対象への対応を解決できない。'
            src_refs=[req,sup['source_ref'],rec.get('ref'),rec.get('subject_ref'),rec.get('source_ref')]
            src_refs=[copy.deepcopy(r) for r in src_refs if isinstance(r,dict)]
            judgments.append(judgment(slot,rec,sup,state,'existing_definition_result',cause,reason,src_refs,slotloc,sup['locator']+'/record'))
    else:
        # A supplied request with no usable support produces one diagnostic NA axis.
        joined=[copy.deepcopy(req)]
        cause='applicability_unresolved'; reason='定義非適用の原判断又は当該対象への対応を解決できない。'
        if problems and all(p['cause']=='source_unresolved' for p in problems): cause='applicability_unresolved'
        judgments.append(judgment(slot,None,None,'unknown','source_unresolved',cause,reason,joined,slotloc,None))
    read={'slot_locator':slotloc,'request':{'presence':'supplied','value':copy.deepcopy(req)},'acquisition_state':'resolved' if supports else 'unknown','source_occurrences':occurrences,'supports':supports,'problems':problems}
    return read,judgments
def judgment(slot,rec,support,state,branch,cause,reason,source_refs,slotloc,recordloc):
    if rec is not None and isinstance(rec.get('subject_ref'),dict): subject={'presence':'supplied','value':copy.deepcopy(rec['subject_ref'])}
    else: subject={'presence':'supplied','value':copy.deepcopy(slot['binding']['knowledge_ref'])}
    owner=rec.get('owner') if rec is not None else slot['binding']['knowledge_ref'].get('owner')
    return {'state':state,'origin_branch':branch,'cause':cause,'axis':slot['descriptor_kind']+'.definition_applicability','reason':reason,'source_refs':copy.deepcopy(source_refs),'subject_ref':subject,'binding':{'presence':'supplied','value':copy.deepcopy(slot['binding'])},'backflow_owner':owner,'slot_locator':slotloc,'record_locator':recordloc}
def construct_case8(raw,l4):
    source_first_guard(raw,l4)
    base = ""
    slots = raw["descriptors"]
    meaning_reads, read_origins = [], []
    applicability_reads, applicability_batches, pair_reads = [], [], []
    axes_events = []

    for i, slot in enumerate(slots):
        fact = slot["facts"][0]
        src = raw["sources"][i]
        op = src["content"]["definition_meaning_operations"][0]
        slotloc = f"{base}/descriptors/{i}"
        factloc = f"{slotloc}/facts/0"

        # Existing helper's known attribution event.
        a = helper_axis(slot, fact)
        axes_events.append({
            "ordinal": len(axes_events), "axis": a["axis"], "axis_value": a,
            "key": key_for(slot), "branch": "existing_definition_result", "state": "known",
            "cause": "owner_descriptor_attribution", "slot_locators": [slotloc],
            "fact_locators": [factloc], "meaning_read_indices": [], "applicability_read_indices": [],
            "subject_ref": presence(fact["ref"]), "binding": presence(slot["binding"]),
            "axis_name": a["axis"], "original_refs": copy.deepcopy(a["original_refs"]),
            "reason": a["reason"], "backflow_owner": a["backflow_owner"],
            "finding_rule_indices": [],
            "sort_source_refs": presence(sorted_refs([fact["source_ref"]])),
            "special_read_indices": [], "pair_origin_links": [], "applicability_judgment_links": [],
            "meaning_support_links": [], "meaning_problem_links": [], "special_support_links": [],
        })

        read, sidecar = meaning_read(raw, l4, i, base)
        meaning_index = len(meaning_reads)
        meaning_reads.append(read)
        read_origins.append({"meaning_read_index": meaning_index, **sidecar})
        d = definition_axis(slot, fact, src, op)
        axes_events.append({
            "ordinal": len(axes_events), "axis": d["axis"], "axis_value": d,
            "key": key_for(slot), "branch": "existing_definition_result", "state": "known",
            "cause": "owner_interpretation_positive_supported", "slot_locators": [slotloc],
            "fact_locators": [factloc], "meaning_read_indices": [meaning_index], "applicability_read_indices": [],
            "subject_ref": presence(fact["ref"]), "binding": presence(slot["binding"]),
            "axis_name": d["axis"], "original_refs": copy.deepcopy(d["original_refs"]),
            "reason": d["reason"], "backflow_owner": d["backflow_owner"],
            "finding_rule_indices": [],
            "sort_source_refs": presence(sorted_refs([fact["source_ref"], src["ref"]])),
            "special_read_indices": [], "pair_origin_links": [], "applicability_judgment_links": [],
            "meaning_support_links": [{"meaning_read_index": meaning_index, "support_index": 0}],
            "meaning_problem_links": [], "special_support_links": [],
        })

        appread, judgments = applicability_read(raw, i, base)
        app_index = len(applicability_reads)
        applicability_reads.append(appread)
        applicability_batches.append({"applicability_read_index": app_index, "slot_locator": slotloc, "judgments": judgments})
        for j, judgement in enumerate(judgments):
            axes_events.append({
                "ordinal": len(axes_events), "axis": judgement["axis"], "axis_value": {
                    "subject_ref": copy.deepcopy(judgement["subject_ref"]["value"]),
                    "binding": copy.deepcopy(judgement["binding"]["value"]),
                    "axis": judgement["axis"], "state": judgement["state"],
                    "original_refs": copy.deepcopy(judgement["source_refs"]),
                    "reason": judgement["reason"], "backflow_owner": judgement["backflow_owner"],
                },
                "key": key_for(slot), "branch": judgement["origin_branch"], "state": judgement["state"],
                "cause": judgement["cause"], "slot_locators": [slotloc], "fact_locators": [],
                "meaning_read_indices": [], "applicability_read_indices": [app_index],
                "subject_ref": copy.deepcopy(judgement["subject_ref"]),
                "binding": copy.deepcopy(judgement["binding"]), "axis_name": judgement["axis"],
                "original_refs": copy.deepcopy(judgement["source_refs"]), "reason": judgement["reason"],
                "backflow_owner": judgement["backflow_owner"], "finding_rule_indices": [],
                "sort_source_refs": presence([]), "special_read_indices": [], "pair_origin_links": [],
                "applicability_judgment_links": [{"batch_index": app_index, "judgment_index": j}],
                "meaning_support_links": [], "meaning_problem_links": [], "special_support_links": [],
            })

        # One fact => no pair exists; save the complete helper result.
        pair_reads.append({"slot_locator": slotloc, "result": {"axes": [], "origins": []}})

    # Exact stable axis sort, with event handles retained for assessments.
    sorted_events = sorted(axes_events, key=axis_sort_key)
    axes = [copy.deepcopy(e["axis_value"]) for e in sorted_events]
    axis_index_by_ordinal = {e["ordinal"]: i for i, e in enumerate(sorted_events)}
    assessments = []
    for event in axes_events:
        idx = axis_index_by_ordinal[event["ordinal"]]
        assessments.append({
            "key": copy.deepcopy(event["key"]),
            "state": event["state"],
            "origin_branch": event["branch"],
            "slot_locators": copy.deepcopy(event["slot_locators"]),
            "fact_locators": copy.deepcopy(event["fact_locators"]),
            "comparison_axis_indices": [idx],
            "comparison_finding_indices": [],
            "original_axes": [copy.deepcopy(axes[idx])],
            "axis_name": event["axis_name"],
        })

    whole = {
        "evaluation": {
            "comparison": {
                "axes": axes,
                "findings": [],
                "producer_symbol": "compare_descriptor_definitions",
                "input_binding": copy.deepcopy(raw["binding"]),
            },
            "assessments": assessments,
        },
        "native_material": {
            "meaning_reads": meaning_reads,
            "applicability_reads": applicability_reads,
            "special_reads": [],
            "judgment_origins": [event_origin(e) for e in axes_events],
            "pair_reads": pair_reads,
            "applicability_judgment_batches": applicability_batches,
            "meaning_read_origins": read_origins,
        },
        "target_reads": [],
        "intent_reads": [],
    }
    return whole


def construct_case_after_8(raw, basewhole, rawbase):
    typed_content_checks=[]
    for si, source in enumerate(raw.get('sources', [])):
        if not isinstance(source.get('content_bytes'), str): continue
        decoded=json.loads(source['content_bytes'])
        equal=canonical(decoded)==canonical(source.get('content'))
        if hashlib.sha256(source['content_bytes'].encode()).hexdigest()!=source.get('ref',{}).get('sha256'):
            raise ValueError(f"source bytes digest mismatch /sources/{si}")
        typed_content_checks.append({'source_index':si,'type_sensitive_equal':equal})
        if not equal: raise ValueError(f"type-sensitive source content mismatch /sources/{si}")
    assert all(canonical(raw['sources'][i])==canonical(rawbase['sources'][i]) for i in range(15))
    whole=copy.deepcopy(basewhole)
    appread,judgments=app_read_and_judgments(raw,5)
    whole['native_material']['applicability_reads'][5]=appread
    whole['native_material']['applicability_judgment_batches'][5]={'applicability_read_index':5,'slot_locator':'/descriptors/5','judgments':judgments}
    evs=whole['native_material']['judgment_origins']
    old=[e for e in evs if e.get('cause')=='applicability_request_null']
    assert len(old)==1
    evs.remove(old[0])
    ordinal_delta=len(judgments)-1
    for e in evs:
        if e.get('ordinal',-1)>12: e['ordinal']+=ordinal_delta
    new_orig=[]; axes_events=[]
    for j,jdg in enumerate(judgments):
        axis={'subject_ref':copy.deepcopy(jdg['subject_ref']['value']),'binding':copy.deepcopy(jdg['binding']['value']),'axis':jdg['axis'],'state':jdg['state'],'original_refs':copy.deepcopy(jdg['source_refs']),'reason':jdg['reason'],'backflow_owner':jdg['backflow_owner']}
        new_orig.append({'ordinal':12+j,'key':key_for(raw['descriptors'][5]),'branch':jdg['origin_branch'],'state':jdg['state'],'cause':jdg['cause'],'slot_locators':['/descriptors/5'],'fact_locators':['/descriptors/5/facts/0'] if jdg.get('record_locator') else [],'meaning_read_indices':[],'applicability_read_indices':[5],'subject_ref':copy.deepcopy(jdg['subject_ref']),'binding':copy.deepcopy(jdg['binding']),'axis_name':jdg['axis'],'original_refs':copy.deepcopy(jdg['source_refs']),'reason':jdg['reason'],'backflow_owner':jdg['backflow_owner'],'finding_rule_indices':[],'sort_source_refs':{'presence':'supplied','value':sorted_refs([oc['source_ref'] for oc in appread['source_occurrences'] if isinstance(oc['source_ref'],dict)]+[sup['original_entry']['record'].get('source_ref') for sup in appread['supports'] if sup['locator']+'/record'==jdg.get('record_locator') and isinstance(sup['original_entry']['record'].get('source_ref'),dict)])},'special_read_indices':[],'pair_origin_links':[],'applicability_judgment_links':[{'batch_index':5,'judgment_index':j}],'meaning_support_links':[],'meaning_problem_links':[],'special_support_links':[]})
        evs.insert(12+j,event_origin(new_orig[-1])); axes_events.append((jdg,axis,12+j))
    axes=whole['evaluation']['comparison']['axes']; assessments=whole['evaluation']['assessments']
    removed_indexes=[ai for ai,a in enumerate(axes) if a['axis'].endswith('.definition_applicability')]
    assert len(removed_indexes)==1; old_idx=removed_indexes[0]; base_items=[]
    for ai,a in enumerate(axes):
        if ai==old_idx: continue
        matching=[(ei,ass) for ei,ass in enumerate(assessments) if ai in ass['comparison_axis_indices']]
        assert len(matching)==1
        ei,ass=matching[0]; axisname=a['axis']; slotidx=int(ass['slot_locators'][0].split('/')[-1]); sl=raw['descriptors'][slotidx]; fact=sl['facts'][0]; src=raw['sources'][slotidx]
        src_refs=sorted_refs([fact['source_ref']]) if axisname=='descriptor.attribution' else sorted_refs([fact['source_ref'],src['ref']])
        event={'key':ass['key'],'axis':axisname,'ordinal':ei if ei<=12 else ei+ordinal_delta,'sort_source_refs':{'presence':'supplied','value':src_refs}}
        ordn=ei if ei<=12 else ei+ordinal_delta
        base_items.append((axis_sort_key(event),copy.deepcopy(a),ordn,copy.deepcopy(ass)))
    for j,(jdg,a,ordinal) in enumerate(axes_events):
        sr=[oc['source_ref'] for oc in appread['source_occurrences'] if isinstance(oc.get('source_ref'),dict)]
        for sup in appread['supports']:
            rec=sup['original_entry']['record']
            if sup['locator']+'/record'==jdg.get('record_locator') and isinstance(rec.get('source_ref'),dict): sr.append(rec['source_ref'])
        sortrefs=sorted_refs(sr); ev={'key':key_for(raw['descriptors'][5]),'axis':a['axis'],'ordinal':ordinal,'sort_source_refs':{'presence':'supplied','value':sortrefs}}
        base_items.append((axis_sort_key(ev),a,ordinal,None))
    base_items.sort(key=lambda x:x[0]); new_axes=[x[1] for x in base_items]
    by_ord={}
    for fi,(_,a,ordn,ass) in enumerate(base_items): by_ord[ordn]=(fi,a,ass)
    event_order=[]
    for ordn,ass in sorted(((x[2],x[3]) for x in base_items),key=lambda x:x[0]):
        fi,a,original_ass=by_ord[ordn]
        if original_ass is None:
            j=ordn-12; jdg=judgments[j]
            out={'key':key_for(raw['descriptors'][5]),'state':jdg['state'],'origin_branch':jdg['origin_branch'],'slot_locators':['/descriptors/5'],'fact_locators':['/descriptors/5/facts/0'] if jdg.get('record_locator') else [],'comparison_axis_indices':[fi],'comparison_finding_indices':[],'original_axes':[copy.deepcopy(a)],'axis_name':jdg['axis']}
        else:
            out=copy.deepcopy(original_ass); out['comparison_axis_indices']=[fi]; out['original_axes']=[copy.deepcopy(a)]
        event_order.append((ordn,out))
    whole['evaluation']['comparison']['axes']=new_axes
    whole['evaluation']['assessments']=[x[1] for x in sorted(event_order,key=lambda x:x[0])]
    return whole

def main(l8_override=None):
 l8=(json.loads((ROOT/L8_REL).read_text(encoding='utf-8')) if l8_override is None else copy.deepcopy(l8_override))
 verify_sources(l8)
 l4=json.loads((ROOT/L4_REL).read_text(encoding='utf-8'))
 l5=json.loads((ROOT/L5_REL).read_text(encoding='utf-8'))
 cases=l8['definition_meaning_walk_verification']['cases']
 results=[]; whole_by_index={}; raw_by_index={}; recipe_by_index={}
 for i in range(8,29):
  case=cases[i]
  if case.get('id') is None: raise ValueError(f'case id absent at {i}')
  raw,patch_indices=raw_input_for(l8,case)
  if hashlib.sha256(canonical(raw)).hexdigest()!=RAW_CASE_BINDINGS[str(i)]['raw_canonical_sha256']: raise ValueError(f'L8 reconstructed raw input pin mismatch: {i}')
  raw_by_index[i]=raw; recipe_by_index[i]=patch_indices
  # Raw/source verification is performed before any case result is emitted.
  for si,source in enumerate(raw.get('sources',[])):
   if isinstance(source.get('content_bytes'),str):
    parsed=json.loads(source['content_bytes'])
    if canonical(parsed)!=canonical(source.get('content')): raise ValueError(f'type-sensitive source content mismatch case={i} index={si}')
    if hashlib.sha256(source['content_bytes'].encode()).hexdigest()!=source.get('ref',{}).get('sha256'): raise ValueError(f'source content digest mismatch case={i} index={si}')
  if i==8: whole=construct_case8(raw,l4)
  else:
   if not whole_by_index.get(8): raise AssertionError('case 8 must be constructed first')
   whole=construct_case_after_8(raw,whole_by_index[8],raw_by_index[8])
  whole_by_index[i]=whole
  results.append({'case_index':i,'case_id':case['id'],'input_base_pointer':case['fixture_base_pointer'],'input_patch_indices':patch_indices,'raw_input_patch_count':len(patch_indices),'other_patch_operations_excluded':len(case['fixture_patch'])-len(patch_indices),'raw_input_canonical_sha256':hashlib.sha256(canonical(raw)).hexdigest(),'whole_canonical_sha256':hashlib.sha256(canonical(whole)).hexdigest(),'axis_count':len(whole['evaluation']['comparison']['axes']),'assessment_count':len(whole['evaluation']['assessments'])})
 output={'status':'static_source_derived_candidate_hashes_pending_independent_review','basis_revision':'5574a1b00812dc9dae56d54631c5dcd53a3e5cb1','source_pins':{'L8_base_raw_input_canonical_sha256':L8_BASE_RAW_SHA,'L8_case_raw_patch_projection_canonical_sha256':RAW_PATCH_PROJECTION_SHA,'L8_historical_full_file_sha256_at_basis':'c10297a78422e3a759e1e1a9b9bbb044d0bf8f1525f1393cc22ce092eef2a1cd','L4_sha256':L4_SHA,'L5_sha256':L5_SHA,'approved_target_object_count':len(APPROVED_OBJECTS)},'input_recipe':'Each case is reconstructed from only the tracked L8 fixture_base_pointer/raw_input object plus its ordered /raw_input or /raw_input/* patches. The constructor wrapper starts as {raw_input: deepcopy(base.raw_input)}; expected_* and non-input patch values never enter it. L8 input objects are pinned canonically, not by whole-file hash, so adding the sibling does not stale this reader.','constructor_rules':{'case8':'The exact oracle-side case8 source-first reader helpers in this source snapshot, driven by reconstructed raw input and current pinned L4 normative snapshot.','cases9_28':'Reuse the case8 meaning branches only after exact equality of first 15 source records; replace slot5 NA read/judgments; recompute event sort from all read occurrences plus that specific judgment support record.source_ref; retain event-specific source links and assessment indices.','qualification_content':'Compare parsed source.content_bytes to source.content via canonical JSON encoding, which distinguishes JSON booleans from numeric values; also verify content bytes SHA against source Ref.'},'cases':results,'limits':['Historical L8 expected values are not read by this source-side constructor; prior v1-v6 comparison history remains known and this is not a clean-room chronology claim.','Original adopted authority/revision for d0c896... remains unrecovered.','Static audit source only: no product runtime, network, database, old CLI, old CI, or candidate reader invocation.','Does not establish independent semantic review or overall BRAIN032 completion.']}
 for row in results:
  if row['whole_canonical_sha256']!=FROZEN_CANONICAL_SHA256[str(row['case_index'])]: raise ValueError(f"frozen whole canonical mismatch case={row['case_index']}")
 print(json.dumps(output,ensure_ascii=False,indent=2))
if __name__=='__main__': main()
