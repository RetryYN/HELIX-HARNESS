"""BRAIN032の供給member形。L5 logical schemaを局所Python predicateへ対応付ける。

JSON正本の意味を所有せず、schema engine/DSLや外部IOを公開しない。
RawValueの原key/null/順序を変更せず、供給された構造memberだけを検査する。
"""

import math


def _issue(path, reason):
    return {"locator": path, "reason": reason, "source_ref": None}


def _pointer(path, key):
    return path + "/" + key.replace("~", "~0").replace("/", "~1")


def _json_tree(value, path, active):
    if value is None or type(value) in (bool, str, int):
        return []
    if type(value) is float:
        return [] if math.isfinite(value) else [_issue(path, "Non-finite number is not a JSON value.")]
    if type(value) not in (dict, list):
        return [_issue(path, "Value is outside the logical JSON domain.")]
    if id(value) in active:
        return [_issue(path, "Cyclic host structure is not a JSON value.")]
    active.add(id(value))
    issues = []
    try:
        if type(value) is list:
            for index, item in enumerate(value):
                issues.extend(_json_tree(item, path + "/" + str(index), active))
        else:
            for key, item in value.items():
                if type(key) is not str:
                    issues.append(_issue(path, "JSON object member name must be a string."))
                else:
                    issues.extend(_json_tree(item, _pointer(path, key), active))
    finally:
        active.remove(id(value))
    return issues


def _opaque(value, path):
    # 全treeのJSON形は先行検査済み。opaque mapをclosed carrierにしない。
    return []


def _string(value, path):
    return [] if type(value) is str else [_issue(path, "Supplied member must be a string.")]


def _boolean(value, path):
    return [] if type(value) is bool else [_issue(path, "Supplied member must be a boolean.")]


def _nullable(check):
    return lambda value, path: [] if value is None else check(value, path)


def _sequence(check):
    def inspect(value, path):
        if type(value) is not list:
            return [_issue(path, "Supplied member must be an array.")]
        issues = []
        for index, item in enumerate(value):
            issues.extend(check(item, path + "/" + str(index)))
        return issues
    return inspect


def _enum(choices):
    return lambda value, path: [] if type(value) is str and value in choices else [
        _issue(path, "Supplied member is outside the declared string enum.")
    ]


def _record(value, path, fields):
    if type(value) is not dict:
        return [_issue(path, "Supplied record must be an object.")]
    issues = []
    for key, member in value.items():
        check = fields.get(key)
        if check is None:
            issues.append(_issue(_pointer(path, key), "Undeclared supplied record member."))
        else:
            issues.extend(check(member, _pointer(path, key)))
    return issues


def _ref(value, path):
    return _record(value, path, {
        'identity': _nullable(_string),
        'revision': _nullable(_string),
        'scope': _opaque,
        'owner': _nullable(_string),
        'source_locator': _nullable(_string),
        'sha256': _nullable(_string),
    })


def _binding(value, path):
    return _record(value, path, {
        'template_ref': _ref,
        'knowledge_ref': _ref,
        'requirement_ref': _ref,
        'oracle_ref': _ref,
        'pack_ref': _ref,
        'pack_contract_version': _nullable(_string),
        'pack_artifact_version': _nullable(_string),
        'pack_dependency_versions': _sequence(_ref),
        'version_target': _nullable(_string),
    })


def _qualified_source(value, path):
    return _record(value, path, {
        'ref': _ref,
        'content': _opaque,
        'content_bytes': _string,
        'qualification_ref': _nullable(_ref),
        'role': _enum(('semantic_json', 'derived_view', 'explanation', 'reference_only')),
    })


def _qualification(value, path):
    return _record(value, path, {
        'ref': _ref,
        'subject_ref': _ref,
        'subject_sha256': _nullable(_string),
        'applicable_scope': _opaque,
        'qualification_body': _opaque,
        'root_ref': _ref,
    })


def _meaning_fact(value, path):
    return _record(value, path, {
        'source_ref': _ref,
        'owner': _nullable(_string),
        'binding': _binding,
        'meaning': _opaque,
        'condition': _opaque,
        'reason': _nullable(_string),
        'oracle_ref': _nullable(_ref),
        'ref': _ref,
    })


def _meaning_comparison(value, path):
    return _record(value, path, {
        'left_fact_ref': _ref,
        'right_fact_ref': _ref,
        'comparison_source_ref': _ref,
        'equivalent': _nullable(_boolean),
        'reason': _nullable(_string),
    })


def _descriptor_slot(value, path):
    return _record(value, path, {
        'slot_identity': _string,
        'descriptor_kind': _string,
        'binding': _binding,
        'facts': _nullable(_sequence(_meaning_fact)),
        'comparison_refs': _sequence(_ref),
        'definition_applicability_ref': _nullable(_ref),
    })


def _section_field(value, path):
    return _record(value, path, {
        'ref': _ref,
        'descriptor_slot_ref': _ref,
        'parent_section_ref': _nullable(_ref),
        'meaning_fact_refs': _sequence(_ref),
        'requiredness_fact_refs': _sequence(_ref),
        'normative_rule_refs': _sequence(_ref),
        'oracle_refs': _sequence(_ref),
        'value_fact_refs': _sequence(_ref),
        'applicability_ref': _nullable(_ref),
    })


def _value_fact(value, path):
    return _record(value, path, {
        'subject_ref': _ref,
        'binding': _binding,
        'value': _opaque,
        'source_ref': _nullable(_ref),
        'reason': _nullable(_string),
        'origin': _enum(('project_owner', 'reference_fixture', 'absent')),
        'applicability_ref': _nullable(_ref),
        'ref': _ref,
    })


def _applicability_record(value, path):
    return _record(value, path, {
        'ref': _ref,
        'subject_ref': _ref,
        'binding': _binding,
        'owner': _nullable(_string),
        'decision': _enum(('applicable', 'not_applicable', 'unknown')),
        'reason': _nullable(_string),
        'reentry_condition': _opaque,
        'source_ref': _nullable(_ref),
    })


def _relation_record(value, path):
    return _record(value, path, {
        'ref': _ref,
        'binding': _binding,
        'kind': _nullable(_string),
        'from_ref': _nullable(_ref),
        'to_ref': _nullable(_ref),
        'direction': _nullable(_string),
        'source_ref': _nullable(_ref),
    })


def _oracle_binding(value, path):
    return _record(value, path, {
        'ref': _ref,
        'subject_ref': _ref,
        'obligation_ref': _ref,
        'oracle_ref': _nullable(_ref),
        'viewpoint': _opaque,
        'evidence_refs': _sequence(_ref),
        'source_ref': _nullable(_ref),
    })


def _compatibility_record(value, path):
    return _record(value, path, {
        'ref': _ref,
        'left_ref': _ref,
        'right_ref': _ref,
        'source_ref': _nullable(_ref),
        'compatible': _nullable(_boolean),
        'reason': _nullable(_string),
    })


def _knowledge_record(value, path):
    return _record(value, path, {
        'ref': _ref,
        'operational_state': _opaque,
        'provenance_refs': _sequence(_ref),
        'limited_adoption_ref': _nullable(_ref),
        'evaluation_scope': _opaque,
        'evaluation_ref': _nullable(_ref),
        'os_registration_ref': _nullable(_ref),
        'independent_verification_ref': _nullable(_ref),
        'adoption_ref': _nullable(_ref),
        'limits': _opaque,
        'counterexamples': _opaque,
    })


def _dependency_selection(value, path):
    return _record(value, path, {
        'core_return_requested': _boolean,
        'core_source_selected': _boolean,
        'labo_evaluation_selected': _boolean,
        'always_refs': _sequence(_ref),
        'core_return_refs': _sequence(_ref),
        'selected_source_refs': _sequence(_ref),
        'selected_evaluation_refs': _sequence(_ref),
        'unselected_refs': _sequence(_ref),
    })


def _handoff_record(value, path):
    return _record(value, path, {
        'subject_ref': _ref,
        'binding': _binding,
        'state': _enum(('not_requested', 'not_received', 'received', 'unknown', 'conflict')),
        'source_ref': _nullable(_ref),
        'reason': _nullable(_string),
    })


def _claim(value, path):
    return _record(value, path, {
        'subject_ref': _ref,
        'binding': _binding,
        'actor': _nullable(_string),
        'kind': _string,
        'proposed_value': _opaque,
        'basis_refs': _sequence(_ref),
    })


def _supply_input(value, path):
    return _record(value, path, {
        'binding': _binding,
        'required_descriptor_kinds': _sequence(_string),
        'sources': _sequence(_qualified_source),
        'qualification_roots': _sequence(_ref),
        'qualifications': _sequence(_qualification),
        'descriptors': _nullable(_sequence(_descriptor_slot)),
        'meaning_comparisons': _sequence(_meaning_comparison),
        'section_fields': _sequence(_section_field),
        'values': _sequence(_value_fact),
        'applicability_records': _sequence(_applicability_record),
        'relations': _sequence(_relation_record),
        'oracle_bindings': _sequence(_oracle_binding),
        'compatibility_records': _sequence(_compatibility_record),
        'knowledge_records': _sequence(_knowledge_record),
        'dependencies': _dependency_selection,
        'handoff_records': _sequence(_handoff_record),
        'claims': _sequence(_claim),
        'candidates': _sequence(_ref),
    })


def validate_supplied_shape(raw):
    """SupplyInputの既存provided-member形を検査する。値を補完しない。"""
    issues = _json_tree(raw, "", set())
    return issues if issues else _supply_input(raw, "")
