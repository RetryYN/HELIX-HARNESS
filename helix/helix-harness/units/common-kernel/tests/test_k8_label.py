"""Focused private K8 pure-helper checks; these are not L9/owner execution."""
from __future__ import annotations

from pathlib import Path
import inspect
import sys
import unittest
from types import SimpleNamespace

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))

import _k8_label as k8  # noqa: E402
import common_kernel as k1  # noqa: E402
import permission as k3  # noqa: E402
import verification as k6  # noqa: E402


def ref(kind: str, identity: str, revision: str = "r1", fill: str = "1") -> k1.SubjectRef:
    return k1.SubjectRef(kind, identity, revision, "sha256:" + fill * 64)


def key() -> k1.ResultKey:
    built = k1.key_of("k8-test", "v1", ref("case", "case-a"), (), "scope-a")
    assert isinstance(built, k1.ResultKey)
    return built


def positive_combined(value: object = "ok") -> k1.Combined[object]:
    polarity = k1.PolarityMapping("test", "1", lambda _: k1.Polarity.POSITIVE)
    observed = k1.Value(value, key(), {"source": "synthetic"})
    combined = k1.combine(((observed, polarity),))
    assert isinstance(combined, k1.Combined)
    return combined


def negative_combined(value: object = "deny") -> k1.Combined[object]:
    polarity = k1.PolarityMapping("test", "1", lambda _: k1.Polarity.NEGATIVE)
    observed = k1.Value(value, key(), {"source": "synthetic"})
    combined = k1.combine(((observed, polarity),))
    assert isinstance(combined, k1.Combined)
    return combined


def permission_result(
    combined: k1.Combined[object], assurance: object | None = None
) -> k3.PermissionCheckResult:
    actor = ref("actor", "synthetic-actor")
    target = ref("target", "synthetic-target")
    revision = ref("revision", "synthetic-revision")
    environment = ref("environment", "synthetic-environment")
    context = k3.AuthorityContext(
        k3.OperationAuthorityTuple("actor", "target", "read", revision, environment, "scope", None),
        {}, actor, target, environment, revision, ref("authority", "decl"),
        ref("policy", "policy"), {}, ref("observed", "time"), (),
    )
    return k3.PermissionCheckResult(
        ref("query", "query"), k3.Resolved(context), ref("permission", "permit"),
        k1.Value(ref("decision", "allow"), key(), None), (), combined,
        {} if assurance is None else assurance, "none",
    )


def required_result(combined: k1.Combined[object], assurance: object | None = None) -> k6.RequiredResult:
    return k6.RequiredResult(combined, {} if assurance is None else assurance)


def components(
    *,
    saved: object | None = None,
    current: object | None = None,
    effect: object | None = None,
    permission: object | None = None,
    route: object | None = None,
) -> k8._TransitionComponents:
    k = key()
    return k8._TransitionComponents(
        saved if saved is not None else k1.Value("label", k, {"saved": 1}),
        current if current is not None else k1.Value("label", k, {"current": 1}),
        effect if effect is not None else k1.Value(
            k8._EffectObservation(
                ref("effect", "eff"), ref("event", "evt"), "occurred", "issuer",
                k8._EffectBinding(
                    ref("k8_input_label_observation", "saved"), ref("route", "route-a"),
                    ref("target", "target-a"), ref("query", "query-a"),
                ),
            ),
            k,
            {"effect": 1},
        ),
        permission if permission is not None else permission_result(positive_combined("permission")),
        route if route is not None else required_result(positive_combined("route")),
        k8._EffectIssuerDiagnostic("match", ref("effect", "eff"), "issuer", "issuer", None),
        (ref("source", "source-a"),),
    )


class K8PrivateProjectionTests(unittest.TestCase):
    def test_ck_k8_pure_observed_label_preserves_nonvalue_and_untrusted(self) -> None:
        k = key()
        unknown = k1.Unknown(k1.UnknownReason.UNREADABLE, k, {"bytes": "not read"})
        label = k8._project_observed_label(
            k8._InputSourceRef(ref("source", "source-a"), ref("project", "project-a")),
            unknown,
            k,
            {"evidence": "synthetic"},
        )
        self.assertEqual(label.trust, "untrusted")
        self.assertIs(label.classification, unknown)
        self.assertEqual(label.input.source.identity, "source-a")
        self.assertEqual(label.input.project.identity, "project-a")

    def test_ck_k8_pure_effect_projection_keeps_none_and_nulls(self) -> None:
        original = k8._EffectObservation(
            ref("effect", "eff"), None, "none", "issuer-a", None
        )
        self.assertIs(k8._retain_effect_observation(original), original)

    def test_ck_k8_operation_version_is_ref_order_independent_and_revision_bound(self) -> None:
        api = ref("api", "k8-api", "r1")
        owner_a = ref("owner", "a", "r2", "2")
        owner_b = ref("owner", "b", "r3", "3")
        version = k8._operation_version("classify_input_label", api, (owner_b, owner_a))
        self.assertEqual(version, k8._operation_version("classify_input_label", api, (owner_a, owner_b)))
        changed_api = ref("api", "k8-api", "r2")
        self.assertNotEqual(version, k8._operation_version("classify_input_label", changed_api, (owner_a, owner_b)))

    def test_ck_k8_case_binding_ref_excludes_result_pointers(self) -> None:
        owner_ref = ref("owner_binding", "owner-case", "r7")
        binding = k8._CaseInputBinding(
            ref("k8_input_label_observation", "saved", "r1"),
            ref("source", "s"), ref("project", "p"), ref("scope", "t"),
            "selected", ref("route", "r"), ref("target", "tgt"),
            ref("permission_query", "q"), ref("effect", "e"),
        )
        got = k8._case_binding_ref("owner", "case", owner_ref, binding)
        self.assertEqual(got.kind, "k8_case_binding")
        self.assertEqual(got.revision, owner_ref.revision)
        self.assertEqual(got.digest, k1._sha256_digest(k1._canonical_json_bytes(k1._canonical_value(binding))))
        pointer_a = k8._CaseResultPointers(key(), key(), None)
        pointer_b = k8._CaseResultPointers(key(), key(), key())
        case_a = k8._TransitionCase(got, pointer_a)
        case_b = k8._TransitionCase(got, pointer_b)
        self.assertNotEqual(case_a.result_pointers.validation_key, case_b.result_pointers.validation_key)
        self.assertEqual(case_a.input_binding_ref, case_b.input_binding_ref)
        self.assertNotIn("result_pointers", inspect.signature(k8._case_binding_ref).parameters)

    def test_ck_k8_role_aliases_preserve_roles_and_exact_dedupe(self) -> None:
        raw = ref("source", "same", "r1")
        bound = k8._bind_role_inputs(
            (("saved", "classification", raw), ("current", "classification", raw), ("saved", "classification", raw)),
            binding_kind="k8_binding", binding_identity="case-a",
        )
        self.assertIsInstance(bound, k1.AliasBinding)
        self.assertEqual(len(bound.aliases), 2)
        self.assertNotEqual(bound.aliases[0].alias_ref.identity, bound.aliases[1].alias_ref.identity)

    def test_ck_k8_same_alias_any_different_ref_is_prekey_rejection(self) -> None:
        first = ref("source", "same", "r1")
        for changed in (ref("source", "same", "r2"), ref("other", "same", "r1"), ref("source", "same", "r1", "2")):
            with self.subTest(changed=changed):
                result = k8._bind_role_inputs(
                    (("saved", "classification", first), ("saved", "classification", changed)),
                    binding_kind="k8_binding", binding_identity="case-a",
                )
                self.assertEqual(result, k1.Rejected("missing_key"))

    def test_ck_k8_role_bound_key_collision_rejects_before_k2_key_of(self) -> None:
        subject = ref("source", "s")
        exact = ref("project", "p")
        result = k8._key_from_resolved_refs("op", "v1", subject, (subject, exact, exact), "scope")
        self.assertIsInstance(result, k1.ResultKey)
        self.assertEqual(result.inputs, (exact,))
        collision = k8._key_from_resolved_refs(
            "op", "v1", subject, (ref("project", "p", "r1"), ref("project", "p", "r2")), "scope"
        )
        self.assertEqual(collision, k1.Rejected("missing_key"))
        subject_collision = k8._key_from_resolved_refs(
            "op", "v1", subject, (ref("source", "s", "r2"),), "scope"
        )
        self.assertEqual(subject_collision, k1.Rejected("missing_key"))
        kind_collision = k8._key_from_resolved_refs(
            "op", "v1", subject,
            (ref("project", "p", "r1"), ref("other_kind", "p", "r1")), "scope"
        )
        self.assertEqual(kind_collision, k1.Rejected("missing_key"))

    def test_ck_k8_mismatch_fields_use_closed_contract_order(self) -> None:
        pairs = {
            k8._MismatchField.TARGET: ("target-a", "target-b"),
            k8._MismatchField.INPUT_LABEL: ("label-a", "label-b"),
            k8._MismatchField.ISSUER: ("issuer-a", "issuer-b"),
        }
        mismatches, unavailable = k8._compare_transition_fields(pairs)
        self.assertEqual(mismatches, (k8._MismatchField.INPUT_LABEL, k8._MismatchField.TARGET, k8._MismatchField.ISSUER))
        self.assertEqual(unavailable, ())

    def test_ck_k8_null_comparison_is_unknown_not_mismatch(self) -> None:
        mismatch, unavailable = k8._compare_transition_fields({k8._MismatchField.ROUTE: (ref("route", "r"), None)})
        self.assertEqual(mismatch, ())
        self.assertEqual(unavailable, (k8._MismatchField.ROUTE,))
        result = k8._select_transition_result(
            key=key(), selected=True, validation_key_ready=True,
            mismatches=mismatch, null_comparison_fields=unavailable, components=components(),
        )
        self.assertIsInstance(result, k1.Unknown)
        self.assertEqual(result.reason, "missing_input")

    def test_ck_k8_polarity_mapping_is_versioned_by_resolved_api_ref(self) -> None:
        api = ref("api", "k8-validation", "r3", "3")
        mapping = k8._polarity_mapping(api)
        self.assertEqual(mapping.reference.identity, "k8_transition_polarity")
        self.assertEqual(mapping.reference.version, '{"digest":"sha256:' + "3" * 64 + '","revision":"r3"}')
        self.assertEqual(mapping(k8._Validated()), k1.Polarity.POSITIVE)
        self.assertEqual(mapping(k8._Mismatch((k8._MismatchField.TARGET,))), k1.Polarity.NEGATIVE)
        self.assertEqual(mapping(k8._Denied("permission_check")), k1.Polarity.NEGATIVE)

    def test_ck_k8_fresh_selector_precedence_mismatch_before_denial_and_unknown(self) -> None:
        k = key()
        permission = permission_result(negative_combined())
        stale = k1.Stale(k1.Value("old", k, {"prior": 1}), k, k)
        parts = components(current=stale, permission=permission)
        outcome = k8._select_transition_result(
            key=k, selected=True, validation_key_ready=True,
            mismatches=(k8._MismatchField.TARGET,), components=parts,
        )
        self.assertIsInstance(outcome, k1.Value)
        self.assertEqual(outcome.value.fields, (k8._MismatchField.TARGET,))
        self.assertEqual(outcome.evidence["mismatch_fields"], ("target",))

    def test_ck_k8_fresh_selector_k3_denial_precedes_unknown(self) -> None:
        k = key()
        parts = components(
            current=k1.Unknown(k1.UnknownReason.UNREADABLE, k, {"reader": "a"}),
            permission=permission_result(negative_combined()),
        )
        outcome = k8._select_transition_result(
            key=k, selected=True, validation_key_ready=True, mismatches=(), components=parts,
        )
        self.assertEqual(outcome, k1.Value(k8._Denied("permission_check"), k, {"source": "permission_check"}))

    def test_ck_k8_k3_denial_precedes_k6_denial(self) -> None:
        k = key()
        parts = components(
            permission=permission_result(negative_combined()),
            route=required_result(negative_combined("route")),
        )
        outcome = k8._select_transition_result(
            key=k, selected=True, validation_key_ready=True, mismatches=(), components=parts,
        )
        self.assertEqual(outcome, k1.Value(k8._Denied("permission_check"), k, {"source": "permission_check"}))

    def test_ck_k8_k6_denial_precedes_unknown(self) -> None:
        k = key()
        parts = components(
            current=k1.Unknown(k1.UnknownReason.UNREADABLE, k, {"classification": 1}),
            route=required_result(negative_combined("route")),
        )
        outcome = k8._select_transition_result(
            key=k, selected=True, validation_key_ready=True, mismatches=(), components=parts,
        )
        self.assertEqual(outcome, k1.Value(k8._Denied("route_verification"), k, {"source": "route_verification"}))

    def test_ck_k8_unknown_priority_and_all_candidate_retention(self) -> None:
        k = key()
        parts = components(
            saved=k1.Unknown(k1.UnknownReason.UNREGISTERED, k, {"saved": 1}),
            current=k1.Stale(k1.Value("old", k, None), k, k),
            effect=k1.Unknown(k1.UnknownReason.UNREADABLE, k, {"effect": 1}),
        )
        outcome = k8._select_transition_result(
            key=k, selected=True, validation_key_ready=True, mismatches=(), components=parts,
        )
        self.assertIsInstance(outcome, k1.Unknown)
        self.assertEqual(outcome.reason, "unreadable")
        self.assertEqual(len(outcome.evidence["candidates"]), 3)
        self.assertEqual({item[1] for item in outcome.evidence["candidates"]}, {"unregistered", "missing_input", "unreadable"})

    def test_ck_k8_required_not_applicable_and_fresh_stale_map_to_missing_input(self) -> None:
        k = key()
        n_a = k1.NotApplicable("not_applicable", {"decl": "x"}, "reenter", k)
        parts = components(saved=n_a)
        outcome = k8._select_transition_result(
            key=k, selected=True, validation_key_ready=True, mismatches=(), components=parts,
        )
        self.assertIsInstance(outcome, k1.Unknown)
        self.assertEqual(outcome.reason, "missing_input")
        self.assertTrue(any(candidate[1] == "missing_input" for candidate in outcome.evidence["candidates"]))

    def test_ck_k8_unobserved_priority_and_not_selected_boundary(self) -> None:
        k = key()
        parts = components(
            saved=k1.Unobserved(k, "pending_receipt"),
            effect=k1.Unobserved(k, "not_run"),
        )
        selected = k8._select_transition_result(
            key=k, selected=True, validation_key_ready=True, mismatches=(), components=parts,
        )
        self.assertIsInstance(selected, k1.Unobserved)
        self.assertEqual(selected.why, "not_run")
        not_selected = k8._select_transition_result(
            key=k, selected=False, validation_key_ready=True, mismatches=(), components=components(),
        )
        self.assertIsInstance(not_selected, k1.Unobserved)
        self.assertEqual(not_selected.why, k1.UnobservedWhy.NOT_SELECTED)

    def test_ck_k8_missing_key_boundary_is_keyunavailable_only_when_selected(self) -> None:
        selected = k8._select_transition_result(
            key=key(), selected=True, validation_key_ready=False, mismatches=(), components=components(),
        )
        self.assertEqual(selected, k8._KeyUnavailable("key_unavailable", k1.Rejected("missing_key")))
        explicit_not_selected = k8._select_transition_result(
            key=key(), selected=False, validation_key_ready=False, mismatches=(), components=components(),
        )
        self.assertEqual(explicit_not_selected, k1.Rejected("missing_key"))

    def test_ck_k8_effect_none_is_confirmed_mismatch_before_unknown(self) -> None:
        k = key()
        effect = k1.Value(k8._EffectObservation(ref("effect", "e"), None, "none", "issuer", None), k, {})
        parts = components(effect=effect, current=k1.Unknown(k1.UnknownReason.UNREADABLE, k))
        outcome = k8._select_transition_result(
            key=k, selected=True, validation_key_ready=True, mismatches=(), components=parts,
        )
        self.assertIsInstance(outcome, k1.Value)
        self.assertEqual(outcome.value.fields, (k8._MismatchField.EFFECT_EVENT,))

    def test_ck_k8_effect_event_and_binding_refs_missing_are_unknown(self) -> None:
        baseline = components()
        assert isinstance(baseline.effect, k1.Value)
        original = baseline.effect.value
        assert isinstance(original, k8._EffectObservation)
        assert isinstance(original.binding, k8._EffectBinding)
        cases = (
            (("event",), k8._EffectObservation(original.source, None, original.outcome, original.issuer, original.binding)),
            (("binding.input_label", "binding.route", "binding.target", "binding.permission_query"), k8._EffectObservation(original.source, original.event, original.outcome, original.issuer, None)),
            (("binding.input_label",), k8._EffectObservation(original.source, original.event, original.outcome, original.issuer, k8._EffectBinding(None, original.binding.route, original.binding.target, original.binding.permission_query))),
            (("binding.route",), k8._EffectObservation(original.source, original.event, original.outcome, original.issuer, k8._EffectBinding(original.binding.input_label, None, original.binding.target, original.binding.permission_query))),
            (("binding.target",), k8._EffectObservation(original.source, original.event, original.outcome, original.issuer, k8._EffectBinding(original.binding.input_label, original.binding.route, None, original.binding.permission_query))),
            (("binding.permission_query",), k8._EffectObservation(original.source, original.event, original.outcome, original.issuer, k8._EffectBinding(original.binding.input_label, original.binding.route, original.binding.target, None))),
        )
        for field_names, changed in cases:
            with self.subTest(fields=field_names):
                effect_value = k1.Value(changed, baseline.effect.key, baseline.effect.evidence)
                parts = k8._TransitionComponents(
                    baseline.saved_input_label, baseline.current_classification, effect_value,
                    baseline.permission_check, baseline.route_verification,
                    baseline.issuer_source_match, baseline.raw_read_refs,
                )
                outcome = k8._select_transition_result(
                    key=baseline.effect.key, selected=True, validation_key_ready=True,
                    mismatches=(), components=parts,
                )
                self.assertIsInstance(outcome, k1.Unknown)
                self.assertEqual(outcome.reason, k1.UnknownReason.MISSING_INPUT)
                self.assertIs(parts.effect, effect_value)
                candidates = outcome.evidence["candidates"]
                for field_name in field_names:
                    self.assertIn(("unknown", "missing_input", ("effect", field_name)), candidates)

    def test_ck_k8_validated_positive_requires_all_existing_dependencies(self) -> None:
        outcome = k8._select_transition_result(
            key=key(), selected=True, validation_key_ready=True, mismatches=(), components=components(),
        )
        self.assertIsInstance(outcome, k1.Value)
        self.assertIsInstance(outcome.value, k8._Validated)
        self.assertEqual(k8._polarity_mapping(ref("api", "k8", "r1"))(outcome.value), k1.Polarity.POSITIVE)

    def test_ck_k8_transition_validation_retains_components_and_assurance_by_identity(self) -> None:
        assurance = k8._EffectIssuerAssuranceDiagnostic("unproven", "no_existing_signature_or_anchor")
        permission_assurance = object()
        route_assurance = object()
        parts = components(
            permission=permission_result(positive_combined("permission"), {"synthetic": permission_assurance}),
            route=required_result(positive_combined("route"), {"synthetic": route_assurance}),
        )
        result = k1.Value(k8._Validated(), key(), {"result": "synthetic"})
        validation = k8._make_transition_validation(result, parts, assurance)
        self.assertIs(validation.result, result)
        self.assertIs(validation.components, parts)
        self.assertIs(validation.components.permission_check.assurance["synthetic"], permission_assurance)
        self.assertIs(validation.components.route_verification.assurance["synthetic"], route_assurance)
        self.assertIs(validation.issuer_authenticity, assurance)

    def test_ck_k8_untyped_dependency_object_is_not_treated_as_a_valid_result(self) -> None:
        for parts in (
            components(permission=SimpleNamespace(combined=positive_combined())),
            components(route=SimpleNamespace(combined=positive_combined())),
        ):
            with self.subTest(parts=parts), self.assertRaises(TypeError):
                k8._select_transition_result(
                    key=key(), selected=True, validation_key_ready=True, mismatches=(),
                    components=parts,
                )

    def test_ck_k8_closed_outcome_and_selector_inputs_reject_invalid_shapes(self) -> None:
        invalid_calls = (
            lambda: k8._select_transition_result(
                key=key(), selected=True, validation_key_ready=True,
                mismatches=("target",), components=components(),
            ),
            lambda: k8._select_transition_result(
                key=key(), selected=True, validation_key_ready=True,
                mismatches=(), null_comparison_fields=("route",), components=components(),
            ),
            lambda: k8._select_transition_result(
                key=key(), selected=1, validation_key_ready=True,
                mismatches=(), components=components(),
            ),
            lambda: k8._select_transition_result(
                key=key(), selected=True, validation_key_ready=1,
                mismatches=(), components=components(),
            ),
            lambda: k8._Mismatch(()),
            lambda: k8._Denied("unknown_source"),
        )
        for call in invalid_calls:
            with self.subTest(call=call), self.assertRaises(TypeError):
                call()

    def test_ck_k8_k3_k6_unknowns_retain_every_component_candidate(self) -> None:
        k = key()
        permission_unknown = k1.Unknown(k1.UnknownReason.CONFLICT, k, {"k3": 1})
        route_unknown = k1.Unknown(k1.UnknownReason.UNREGISTERED, k, {"k6": 1})
        permission = permission_result(k1.Combined(
            k1.Verdict.UNDETERMINED,
            components=(permission_unknown,),
            polarity=None,
            negatives=(),
            non_values=(0,),
            excluded=(),
            set_reason=None,
        ))
        route = required_result(k1.Combined(
            k1.Verdict.UNDETERMINED,
            components=(route_unknown,),
            polarity=None,
            negatives=(),
            non_values=(0,),
            excluded=(),
            set_reason=None,
        ))
        outcome = k8._select_transition_result(
            key=k, selected=True, validation_key_ready=True, mismatches=(),
            components=components(permission=permission, route=route),
        )
        self.assertIsInstance(outcome, k1.Unknown)
        self.assertEqual(outcome.reason, "conflict")
        self.assertEqual(outcome.evidence["candidates"], (
            ("unknown", "conflict", permission_unknown),
            ("unknown", "unregistered", route_unknown),
        ))

    def test_ck_k8_observer_priority_retains_every_unknown_candidate(self) -> None:
        k = key()
        dependencies = (
            k1.Unknown(k1.UnknownReason.UNREGISTERED, k, {"id": 1}),
            k1.Unknown(k1.UnknownReason.UNREADABLE, k, {"id": 2}),
            k1.Stale(k1.Value("old", k, None), k, k),
        )
        observed = k8._select_observation(k, "ignored-value", dependencies)
        self.assertIsInstance(observed, k1.Unknown)
        self.assertEqual(observed.reason, "unreadable")
        self.assertEqual(len(observed.evidence["candidates"]), 3)

    def test_ck_k8_observer_priority_maps_stale_and_notapplicable_exactly(self) -> None:
        k = key()
        stale = k1.Stale(k1.Value("old", k, None), k, k)
        result = k8._select_observation(k, "ignored", (stale,))
        self.assertEqual(result, k1.Unknown("missing_input", k, {"candidates": (("unknown", "missing_input", stale),)}))
        not_applicable = k1.NotApplicable("n/a", "authority", "reenter", k)
        result = k8._select_observation(k, "ignored", (not_applicable,))
        self.assertIsInstance(result, k1.Unknown)
        self.assertEqual(result.reason, "missing_input")

    def test_ck_k8_valid_k1_disposition_is_not_a_nonvalue_candidate(self) -> None:
        k = key()
        disposition = k1.NotApplicable("excluded", "authority", "reenter", k)
        positive_mapping = k1.PolarityMapping("positive", "1", lambda _: k1.Polarity.POSITIVE)
        combined = k1.combine((disposition, (k1.Value("ok", k, None), positive_mapping)))
        self.assertIsInstance(combined, k1.Combined)
        self.assertEqual(combined.verdict, k1.Verdict.POSITIVE)
        self.assertEqual(combined.excluded, (0,))
        target: list[tuple[str, str, object]] = []
        k8._combined_candidates(combined, target)
        self.assertEqual(target, [])

    def test_ck_k8_label_transition_projection_does_not_erase_stale(self) -> None:
        k = key()
        old = k1.Stale(k1.Value("prior", k, {"record": 1}), k, k)
        label = k8._project_observed_label(k8._InputSourceRef(ref("source", "s"), ref("project", "p")), k1.Value("c", k, None), k, None)
        projected = k8._project_label_transition(
            label, old, old, k8._make_transition_validation(old, components(), k8._EffectIssuerAssuranceDiagnostic()), (),
        )
        self.assertIs(projected.read_result, old)
        self.assertIs(projected.observed_effect, old)
        self.assertIs(projected.validated_transition.result, old)


if __name__ == "__main__":
    unittest.main()
