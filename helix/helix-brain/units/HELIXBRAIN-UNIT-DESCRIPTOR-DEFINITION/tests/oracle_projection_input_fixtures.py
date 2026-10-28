"""Real FN0 typed inputs for the bounded FN4 rule-projection tests.

Fixtures use top-level OracleBinding fields and the qualified source mirror;
they never derive typed joins from MeaningFact.meaning RawValue.
"""

from __future__ import annotations

import copy

from oracle_binding_input_fixtures import (
    _other_ref,
    _rewrite_qualified_source_body,
    _slot_and_fact,
    _source_by_ref,
)
from supply_input_fixtures import base_input, load_document


_RULES = {"measurement", "completion"}


def _rule_row(raw, rule):
    if rule not in _RULES:
        raise ValueError(f"unsupported typed rule: {rule}")
    row = copy.deepcopy(raw["oracle_bindings"][0])
    kind = "measurement" if rule == "measurement" else "completion"
    _slot, fact = _slot_and_fact(raw, kind)
    row["subject_ref"] = copy.deepcopy(fact["ref"])
    row["obligation_ref"] = copy.deepcopy(fact["binding"]["requirement_ref"])
    if rule == "measurement":
        row["obligation_ref"] = _other_ref(
            row["obligation_ref"], "SYNTHETIC-UNRELATED-OBLIGATION"
        )
        row["ref"] = _other_ref(row["ref"], "SYNTHETIC-MEASUREMENT-ORACLE-BINDING")
    else:
        row["oracle_ref"] = copy.deepcopy(row["oracle_ref"])
        row["oracle_ref"]["revision"] = "synthetic-other-oracle-revision"
        row["ref"] = _other_ref(row["ref"], "SYNTHETIC-COMPLETION-ORACLE-BINDING")
    return row


def synchronize_oracle_binding_source(raw):
    """Mirror the typed rows and synchronize body bytes, digest, Q, and provenance."""
    if not isinstance(raw.get("oracle_bindings"), list) or not raw["oracle_bindings"]:
        raise ValueError("fixture requires at least one typed OracleBinding")
    source_ref = raw["oracle_bindings"][0].get("source_ref")
    source = _source_by_ref(raw, source_ref)
    original_mirror = source.get("content", {}).get("oracle_bindings")
    if not isinstance(original_mirror, list) or not original_mirror:
        raise ValueError("fixture requires a qualified OracleBinding source mirror")
    if any("source_ref" in entry for entry in original_mirror):
        raise ValueError("source-body OracleBinding mirrors do not self-reference")

    content = copy.deepcopy(source["content"])
    content["oracle_bindings"] = []
    for row in raw["oracle_bindings"]:
        content["oracle_bindings"].append(
            {
                key: copy.deepcopy(value)
                for key, value in row.items()
                if key != "source_ref"
            }
        )
    _old_ref, final_ref = _rewrite_qualified_source_body(raw, source, content)
    for row in raw["oracle_bindings"]:
        row["source_ref"] = copy.deepcopy(final_ref)
    return source, final_ref


def oracle_projection_input(
    *, rules=("measurement",), duplicate=False, competing=False
):
    """Make a source/qualification/provenance-synchronized R71/R72 input.

    ``rules`` preserves requested order. ``duplicate`` repeats a whole equal
    measurement OracleBinding. ``competing`` appends a distinct same-subject
    measurement OracleBinding and is intentionally not a valid positive case.
    """
    if (
        not isinstance(rules, (tuple, list))
        or not rules
        or any(rule not in _RULES for rule in rules)
    ):
        raise ValueError("rules must be a nonempty sequence of measurement/completion")
    raw = base_input(load_document())
    before = copy.deepcopy(raw)
    rows = [_rule_row(raw, rule) for rule in rules]
    if duplicate:
        if rules != ("measurement",) and list(rules) != ["measurement"]:
            raise ValueError(
                "duplicate fixture currently applies only to one measurement row"
            )
        rows.append(copy.deepcopy(rows[0]))
    if competing:
        if "measurement" not in rules:
            raise ValueError("competition fixture requires a measurement row")
        alternate = copy.deepcopy(
            next(
                row
                for row in rows
                if row["subject_ref"] == _slot_and_fact(raw, "measurement")[1]["ref"]
            )
        )
        alternate["ref"] = _other_ref(
            alternate["ref"], "SYNTHETIC-COMPETING-ORACLE-BINDING"
        )
        alternate["obligation_ref"] = _other_ref(
            alternate["obligation_ref"], "SYNTHETIC-SECOND-UNRELATED-OBLIGATION"
        )
        rows.append(alternate)
    raw["oracle_bindings"] = rows
    source, _final_ref = synchronize_oracle_binding_source(raw)
    return raw, before, source


def oracle_projection_public_context(raw, *, allow_fn0_issues=False):
    """Run the real fn0→fn1/fn3 producer chain for public FN4 integration tests."""
    from descriptor_definitions import (
        compare_descriptor_definitions,
        compare_identity_versions_and_trace,
        validate_supply_input,
    )

    raw_before = copy.deepcopy(raw)
    validated = validate_supply_input(raw)
    if validated["input"] is None or (
        validated["input_issues"] and not allow_fn0_issues
    ):
        raise AssertionError(
            "setup: typed oracle input must decode within the declared fixture boundary"
        )
    if validated["input"] != raw_before:
        raise AssertionError("setup: fn0 must preserve the selected raw input")
    definitions = compare_descriptor_definitions({"validated": validated})
    identity_trace = compare_identity_versions_and_trace({"validated": validated})
    if definitions["input_binding"] != raw_before["binding"]:
        raise AssertionError("setup: fn1 comparison uses the input Binding")
    if identity_trace["input_binding"] != raw_before["binding"]:
        raise AssertionError("setup: fn3 comparison uses the input Binding")
    context = {
        "validated": validated,
        "definitions": definitions,
        "identity_trace": identity_trace,
    }
    return validated, definitions, identity_trace, context
