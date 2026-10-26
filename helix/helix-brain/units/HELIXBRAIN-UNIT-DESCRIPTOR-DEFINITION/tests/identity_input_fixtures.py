"""Identity/C3用の条件付き合成入力を組み立てる。

入力素材はL7のnormal_control_inputだけを起点にし、各呼出しで独立コピーする。
期待値、readerの判定、資格の成立はここで生成しない。

根拠: L4 /identity_version_trace_contract/schema/$defs/{QualifiedSource,
Qualification,CompatibilityRecord,LeftOwnerSourceBody,RangeDeclaration} と
/identity_version_trace_contract/raw_carriers/{left_owner,pack_range,provenance}。
LeftOwnerSourceBody.endpoint_owner_declaration.endpointがendpoint役割を明示し、
compatible_refsの位置からleft/rightを推定しない。
"""

import copy
import hashlib
import json

from supply_input_fixtures import base_input, load_document


def normal_input():
    """L7 fixtureのnormal inputを変更せず独立コピーで返す。"""
    return base_input(load_document())


def _same_ref_without_digest(left, right):
    if not isinstance(left, dict) or not isinstance(right, dict):
        return False
    return all(left.get(key) == right.get(key) for key in (
        "identity", "revision", "scope", "owner", "source_locator"
    ))


def _trace_carrier_input():
    """このtrace用コピー内だけ、facts/recordからsource0への原linkを揃える。

    L4 read_descriptor_identity_trace はfact→KnowledgeRecord.provenance_refs→
    semantic_json source→Qualification/rootの同一snapshot chainを読む。
    元normal fixtureのsource bytesは変更せず、source self-referenceのdigest-nullも保つ。
    """
    raw = normal_input()
    source = raw["sources"][0]
    source_ref = source["ref"]

    # Public factsはsource0の全15原factを指す。source.content内の同一bodyは
    # bytesの自己参照を避けてsha256:nullの論理Refのまま保持する。
    for slot in raw["descriptors"]:
        for fact in slot.get("facts", []):
            if _same_ref_without_digest(fact.get("source_ref"), source_ref):
                fact["source_ref"] = copy.deepcopy(source_ref)

    # 同Bindingの元KnowledgeRecordのprovenance出現だけをsource0へ結ぶ。
    knowledge_ref = raw["binding"]["knowledge_ref"]
    records = [row for row in raw["knowledge_records"] if row.get("ref") == knowledge_ref]
    if len(records) != 1:
        raise ValueError("trace fixtureには一意なBinding KnowledgeRecordが必要")
    record = records[0]
    linked = 0
    provenance = []
    for original_ref in record.get("provenance_refs", []):
        if _same_ref_without_digest(original_ref, source_ref):
            provenance.append(copy.deepcopy(source_ref))
            linked += 1
        else:
            provenance.append(copy.deepcopy(original_ref))
    if linked != 1:
        raise ValueError("normal fixtureの元provenance source出現が一つ必要")
    record["provenance_refs"] = provenance
    return raw


def trace_input(mode="positive"):
    """Identity trace用の独立input copyを返す。

    mode: positive, zero, equal_records, equal_qualifications。
    判定state/cause/資格結果を入力へ加えず、同値record/Qは原出現として保持する。
    """
    modes = {"positive", "zero", "equal_records", "equal_qualifications"}
    if mode not in modes:
        raise ValueError(f"unknown identity trace fixture mode: {mode}")
    raw = _trace_carrier_input()
    if mode == "zero":
        raw["knowledge_records"] = []
    elif mode == "equal_records":
        if len(raw["knowledge_records"]) != 1:
            raise ValueError("equal_records fixtureは元record一件から始める")
        raw["knowledge_records"].append(copy.deepcopy(raw["knowledge_records"][0]))
    elif mode == "equal_qualifications":
        # source0のQualificationを完全複写。rootは物理一出現のまま。
        qualification_ref = raw["sources"][0]["qualification_ref"]
        rows = [row for row in raw["qualifications"] if row.get("ref") == qualification_ref]
        if len(rows) != 1:
            raise ValueError("equal_qualifications fixtureは元Qualification一件から始める")
        raw["qualifications"].append(copy.deepcopy(rows[0]))
    return raw


def _json_bytes(value):
    """既存fixtureと同じUTF-8 compact JSON表現を作る。"""
    return json.dumps(value, ensure_ascii=False, separators=(",", ":")).encode("utf-8")


def _ref(identity, revision, scope, owner, sha256=None):
    return {
        "identity": identity,
        "revision": revision,
        "scope": copy.deepcopy(scope),
        "owner": owner,
        "source_locator": None,
        "sha256": sha256,
    }


def _matching_qualification(raw, source):
    qualification_ref = source.get("qualification_ref")
    matches = [
        row for row in raw["qualifications"]
        if row.get("ref") == qualification_ref
    ]
    if qualification_ref is None or len(matches) != 1:
        raise ValueError("合成sourceには一意なqualification_refが必要")
    return matches[0]


def _write_source_content(raw, source, content):
    """content bytesとsource/Q subject digestを入力内で同期する。"""
    encoded = _json_bytes(content)
    digest = hashlib.sha256(encoded).hexdigest()
    source["content"] = copy.deepcopy(content)
    source["content_bytes"] = encoded.decode("utf-8")
    source["ref"]["sha256"] = digest
    if source.get("qualification_ref") is not None:
        qualification = _matching_qualification(raw, source)
        qualification["subject_ref"] = copy.deepcopy(source["ref"])
        qualification["subject_sha256"] = digest


def _append_qualified_source(raw, *, identity, owner, scope, content,
                             qualification_identity, root_identity,
                             revision="synthetic-rev-A"):
    """合成sourceと対応するQualification/rootを末尾へ追加する。"""
    source_ref = _ref(identity, revision, scope, owner)
    encoded = _json_bytes(content)
    digest = hashlib.sha256(encoded).hexdigest()
    source_ref["sha256"] = digest
    qualification_ref = _ref(
        qualification_identity, revision, scope, owner
    )
    root_ref = _ref(root_identity, revision, scope, owner)
    source = {
        "ref": source_ref,
        "content": copy.deepcopy(content),
        "content_bytes": encoded.decode("utf-8"),
        "qualification_ref": copy.deepcopy(qualification_ref),
        "role": "semantic_json",
    }
    qualification = {
        "ref": copy.deepcopy(qualification_ref),
        "subject_ref": copy.deepcopy(source_ref),
        "subject_sha256": digest,
        "applicable_scope": copy.deepcopy(scope),
        "qualification_body": {
            "owner": owner,
            "subject": identity,
            "authority_effect": "fixture assumption only",
        },
        "root_ref": copy.deepcopy(root_ref),
    }
    raw["sources"].append(source)
    raw["qualifications"].append(qualification)
    raw["qualification_roots"].append(root_ref)
    return source


def _target_record(raw, index=0):
    try:
        return raw["compatibility_records"][index]
    except (KeyError, IndexError, TypeError) as exc:
        raise ValueError("normal inputに対象compatibility recordがない") from exc


def _right_source(raw, record):
    matches = [row for row in raw["sources"] if row.get("ref") == record.get("source_ref")]
    if len(matches) != 1:
        raise ValueError("record.source_refに対応するright sourceが一意でない")
    return matches[0]


def _left_body(raw, record, right_source, *, compatible, outside=False):
    """L4 LeftOwnerSourceBodyの閉じたpositive/outside形を返す。"""
    left_ref = copy.deepcopy(record["left_ref"])
    right_ref = copy.deepcopy(record["right_ref"])
    body = {
        "compatible_refs": [left_ref, right_ref],
        "compatible": compatible,
        "compatibility_record_ref": copy.deepcopy(record["ref"]),
        "counterpart_source_ref": copy.deepcopy(right_source["ref"]),
        "endpoint_owner_declaration": {
            "endpoint": "left",
            "endpoint_ref": copy.deepcopy(left_ref),
            "owner": left_ref["owner"],
            "compatible": compatible,
            "range_relation": "outside" if outside else "not_supplied",
            "range_reason": "synthetic owner declares pair outside its range" if outside else None,
        },
    }
    if outside:
        body["declared_range"] = {
            "pack_contract_versions": ["synthetic-other-contract"],
            "pack_artifact_versions": ["synthetic-other-artifact"],
        }
    return body


def _range_declaration(raw, record):
    binding = raw["binding"]
    left_ref = copy.deepcopy(record["left_ref"])
    right_ref = copy.deepcopy(record["right_ref"])
    pack_ref = copy.deepcopy(binding["pack_ref"])
    declared = {
        "pack_contract_versions": ["synthetic-other-contract"],
        "pack_artifact_versions": ["synthetic-other-artifact"],
    }
    return {
        "left_ref": left_ref,
        "right_ref": right_ref,
        "actual_pack_ref": pack_ref,
        "actual_contract_version": binding["pack_contract_version"],
        "actual_artifact_version": binding["pack_artifact_version"],
        "declared_range": declared,
        "relation": "outside",
        "reason": "synthetic pack owner declares actual pair outside its range",
        "owner_declarations": [
            {
                "endpoint_ref": copy.deepcopy(left_ref),
                "owner": left_ref["owner"],
                "relation": "outside",
            },
            {
                "endpoint_ref": copy.deepcopy(right_ref),
                "owner": right_ref["owner"],
                "relation": "outside",
            },
        ],
    }


def _append_left_owner(raw, record, right_source, suffix, *, compatible,
                       outside=False, source_scope=None):
    left_ref = record["left_ref"]
    scope = copy.deepcopy(source_scope if source_scope is not None else left_ref["scope"])
    owner = left_ref["owner"]
    body = _left_body(raw, record, right_source, compatible=compatible, outside=outside)
    return _append_qualified_source(
        raw,
        identity=f"SYNTHETIC-C3-LEFT-OWNER-SOURCE-{suffix}",
        owner=owner,
        scope=scope,
        content=body,
        qualification_identity=f"SYNTHETIC-C3-LEFT-OWNER-QUALIFICATION-{suffix}",
        root_identity=f"SYNTHETIC-C3-LEFT-OWNER-ROOT-{suffix}",
    )


def _append_right_range_source(raw, record, suffix):
    """既存pack ownerの原carrierを基にoutside range sourceを追加する。"""
    base_right = _right_source(raw, record)
    content = copy.deepcopy(base_right["content"])
    content["compatible"] = False
    content["compatibility_range_declaration"] = _range_declaration(raw, record)
    right_ref = record["right_ref"]
    return _append_qualified_source(
        raw,
        identity=f"SYNTHETIC-C3-RIGHT-RANGE-SOURCE-{suffix}",
        owner=base_right["ref"]["owner"],
        scope=base_right["ref"]["scope"],
        content=content,
        qualification_identity=f"SYNTHETIC-C3-RIGHT-RANGE-QUALIFICATION-{suffix}",
        root_identity=f"SYNTHETIC-C3-RIGHT-RANGE-ROOT-{suffix}",
        revision=base_right["ref"]["revision"],
    )


def _add_left_for_record(raw, record, right_source, suffix, *, compatible,
                         outside=False, source_scope=None):
    return _append_left_owner(
        raw, record, right_source, suffix, compatible=compatible,
        outside=outside, source_scope=source_scope,
    )


def _set_record_source(record, source):
    record["source_ref"] = copy.deepcopy(source["ref"])


def _outside_record(record):
    record["compatible"] = False
    record["reason"] = "synthetic owner declarations are outside the pair range"


def bilateral_input(mode):
    """L4 bilateral C3条件の独立合成raw inputを返す。

    mode: positive, scope, outside, opposing, source_null, one_owner。
    これはfixture入力の組立だけで、reader結果/期待値/資格成立を作らない。
    """
    modes = {"positive", "scope", "outside", "opposing", "source_null", "one_owner"}
    if mode not in modes:
        raise ValueError(f"unknown bilateral fixture mode: {mode}")
    raw = normal_input()
    record = _target_record(raw)

    if mode == "one_owner":
        # normal inputにはqualified right pack sourceだけがあり、left owner bodyは無い。
        return raw
    if mode == "source_null":
        # explicit nullを保つ。別Refやqualified sourceで補完しない。
        record["source_ref"] = None
        return raw

    if mode == "opposing":
        right_positive = _right_source(raw, record)
        _add_left_for_record(raw, record, right_positive, "OPPOSING-POSITIVE", compatible=True)

        second = copy.deepcopy(record)
        second["ref"] = copy.deepcopy(record["ref"])
        second["ref"]["identity"] = "SYNTHETIC-C3-OPPOSING-RECORD"
        second["ref"]["sha256"] = None
        _outside_record(second)
        right_outside = _append_right_range_source(raw, second, "OPPOSING-OUTSIDE")
        _set_record_source(second, right_outside)
        raw["compatibility_records"].append(second)
        _add_left_for_record(raw, second, right_outside, "OPPOSING-OUTSIDE",
                             compatible=False, outside=True)
        return raw

    if mode == "scope":
        right = _right_source(raw, record)
        mismatch_scope = copy.deepcopy(record["left_ref"]["scope"])
        mismatch_scope["environment"] = "synthetic-C3-outside-environment"
        _add_left_for_record(raw, record, right, "SCOPE-DIFFERS", compatible=True,
                             source_scope=mismatch_scope)
        return raw

    if mode == "outside":
        right = _right_source(raw, record)
        outside_right = _append_right_range_source(raw, record, "OUTSIDE")
        _set_record_source(record, outside_right)
        _outside_record(record)
        _add_left_for_record(raw, record, outside_right, "OUTSIDE",
                             compatible=False, outside=True)
        return raw

    # positive: retain the original right source and add only its explicit left owner.
    right = _right_source(raw, record)
    _add_left_for_record(raw, record, right, "POSITIVE", compatible=True)
    return raw
