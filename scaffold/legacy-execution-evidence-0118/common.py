"""Shared fail-closed source observation state machine for SCF-B-0118."""
from __future__ import annotations

import json
import re


SUMMARY_KEYS = (
    "numTotalTestSuites",
    "numPassedTestSuites",
    "numFailedTestSuites",
    "numPendingTestSuites",
    "numTodoTestSuites",
    "numTotalTests",
    "numPassedTests",
    "numFailedTests",
    "numPendingTests",
    "numTodoTests",
)
REQUIRED_TEST_COUNTS = (
    "numTotalTests",
    "numPassedTests",
    "numFailedTests",
    "numPendingTests",
    "numTodoTests",
)
PASS_RE = re.compile(r"^\s*(?:Test Files|Tests)\s+(\d+)\s+passed(?:\s+\(\d+\))?\s*$", re.IGNORECASE)
EXIT_MARKER_RE = re.compile(r"\b(?P<marker>vitest\s+exit|exit(?:\s+code)?|exited\s+with\s+code)\b", re.IGNORECASE)
STRICT_EXIT_VALUE_RE = re.compile(r"-?[0-9]+")
# Existing receipt lines attach this timestamp annotation after the decimal code.
EXIT_TIMESTAMP_SUFFIX_RE = re.compile(r"(-?[0-9]+)\s+at\s+[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}Z")
# A marker must stand on its own.  Path separators, dots, and hyphens bind
# adjacent words into a path or compound identifier and must not create a
# failure marker (for example, src/error-handling.test.ts or fail-safe).
FAIL_RE = re.compile(
    r"(?<![\w./-])(?:fatal|error|failure|fail|failed|segmentation\s+fault|npm\s+ERR!)(?![\w./-])",
    re.IGNORECASE,
)
ZERO_FAILURE_LINE_RE = re.compile(r"^\s*0\s+(?:errors?|fail(?:ed|ure)s?)\s*$", re.IGNORECASE)
FAILED_COUNT_RE = re.compile(r"(?<!\d)(\d+)\s+failed\b", re.IGNORECASE)


def _count(parsed: dict, key: str) -> int | None:
    value = parsed.get(key)
    if isinstance(value, bool) or not isinstance(value, int) or value < 0:
        return None
    return value


def _failure(status: str, markers: list[str]) -> dict:
    return {
        "status": status,
        "marker_lines": markers[:32],
        "reason": (
            "static asset contains failure/error/nonzero-exit marker; it is not a unit-level degradation or failure verdict"
            if markers
            else "no failure/error marker was observed in this asset; absence does not prove success"
        ),
        "unit_level_verdict": None,
    }


def _exit_marker_observations(line: str) -> list[dict]:
    matches = list(EXIT_MARKER_RE.finditer(line))
    observations = []
    for index, marker_match in enumerate(matches):
        has_next_marker = index + 1 < len(matches)
        end = matches[index + 1].start() if has_next_marker else len(line)
        tail = line[marker_match.end():end]
        value_match = re.match(r"\s*(?:[=:]\s*)?(?P<value>.*)", tail)
        value = value_match.group("value").strip() if value_match else ""
        boundary_ok = not has_next_marker or bool(
            tail and (tail[-1].isspace() or tail.rstrip().endswith((",", ";", "|")))
        )
        parse_value = value
        if has_next_marker and parse_value.endswith((",", ";", "|")):
            parse_value = parse_value[:-1].rstrip()
            value = parse_value
        observation = {
            "line": line.strip(),
            "marker": marker_match.group("marker"),
            "value": value,
        }
        decimal_match = STRICT_EXIT_VALUE_RE.fullmatch(parse_value)
        timestamp_match = EXIT_TIMESTAMP_SUFFIX_RE.fullmatch(parse_value)
        if boundary_ok and (decimal_match or timestamp_match):
            code = int(decimal_match.group(0) if decimal_match else timestamp_match.group(1))
            observation.update({"status": "parsed", "code": code})
        else:
            observation.update({
                "status": "unparseable",
                "reason": (
                    "exit markers are not separated by a recognized boundary"
                    if not boundary_ok
                    else "exit value region is not a strict signed decimal integer"
                ),
            })
        observations.append(observation)
    return observations


def source_observation(data: bytes, anchors: list[dict]) -> tuple[dict, dict, dict]:
    """Classify only asset-level observation; every unit-level verdict stays None."""
    text = data.decode(errors="replace")
    lines = text.splitlines()
    anchor_lines = [a["line"] for a in anchors]
    parsed = None
    try:
        parsed = json.loads(text)
    except json.JSONDecodeError:
        pass

    if isinstance(parsed, dict) and "head_sha" in parsed:
        identity = {key: parsed.get(key) for key in ("head_sha", "base_sha", "tested_merge_head")}
        execution = {
            "status": "observed_asset_level",
            "kind": "ci_merge_head_receipt",
            "fields": identity,
            "unit_level_verdict": None,
        }
        complete = all(identity[key] not in (None, "") for key in identity)
        result = {
            "status": "asset_level_identity_only",
            "verdict": None,
            "reason": (
                "head/base/tested merge identity is recorded without a test verdict or acceptance verdict"
                if complete
                else "identity receipt is incomplete and has no test verdict or acceptance verdict"
            ),
            "anchor_lines": anchor_lines,
        }
        return execution, _failure("not_observed_in_asset", []), result

    if isinstance(parsed, dict) and "numTotalTestSuites" in parsed:
        fields = {key: parsed[key] for key in SUMMARY_KEYS if key in parsed}
        execution = {
            "status": "observed_asset_level",
            "kind": "vitest_json_summary",
            "fields": fields,
            "unit_level_verdict": None,
        }
        counts = {key: _count(parsed, key) for key in REQUIRED_TEST_COUNTS}
        suite_required = ("numTotalTestSuites", "numPassedTestSuites", "numFailedTestSuites", "numPendingTestSuites")
        suite_counts = {key: _count(parsed, key) for key in suite_required}
        suite_todo = _count(parsed, "numTodoTestSuites")
        suite_complete = all(value is not None for value in suite_counts.values()) and (
            ("numTodoTestSuites" not in parsed or suite_todo is not None)
        ) and (
            suite_counts["numPassedTestSuites"]
            + suite_counts["numFailedTestSuites"]
            + suite_counts["numPendingTestSuites"]
            + (suite_todo or 0)
            == suite_counts["numTotalTestSuites"]
        )
        failed_count = (suite_counts["numFailedTestSuites"] or 0) + (counts["numFailedTests"] or 0)
        pending_count = (suite_counts["numPendingTestSuites"] or 0) + (counts["numPendingTests"] or 0)
        todo_count = (suite_todo or 0) + (counts["numTodoTests"] or 0)
        positive_success = (counts["numPassedTests"] or 0) > 0 and (suite_counts["numPassedTestSuites"] or 0) > 0
        markers = [lines[0].strip()] if failed_count else []
        failure = _failure("observed_asset_level" if markers else "not_observed_in_asset", markers)
        result_base = {
            "status": "asset_level_test_result_only",
            "verdict": None,
            "fields": fields,
            "anchor_lines": anchor_lines,
        }
        if failed_count:
            result = {**result_base, "reason": "contradictory success and failure counts prevent a pass verdict" if positive_success else "explicit failure count prevents a pass verdict"}
        elif any(value is None for value in counts.values()) or not suite_complete:
            result = {**result_base, "reason": "required test counts are missing or invalid; result is unknown"}
        elif sum(counts[key] for key in ("numPassedTests", "numFailedTests", "numPendingTests", "numTodoTests")) != counts["numTotalTests"]:
            result = {**result_base, "reason": "test counts are inconsistent; result is unknown"}
        elif not positive_success:
            result = {**result_base, "reason": "no positive successful test count is present; result is unknown"}
        elif pending_count or todo_count:
            result = {**result_base, "verdict": "pass_with_pending", "reason": "explicit pending or todo count prevents a complete pass verdict"}
        else:
            result = {**result_base, "verdict": "pass_observed", "reason": "complete zero-failure counts are observed only at asset level"}
        return execution, failure, result

    passed = [line.strip() for line in lines if PASS_RE.search(line)]
    passed_counts = [int(match.group(1)) for line in lines if (match := PASS_RE.search(line))]
    exit_marker_observations = [
        observation
        for line in lines
        for observation in _exit_marker_observations(line)
    ]
    exit_matches = list(dict.fromkeys(
        observation["line"] for observation in exit_marker_observations
    ))
    exit_observations = [
        {"line": observation["line"], "code": observation["code"]}
        for observation in exit_marker_observations
        if observation["status"] == "parsed"
    ]
    unparseable_exit_observations = [
        observation for observation in exit_marker_observations
        if observation["status"] == "unparseable"
    ]
    failed_counts = [int(match.group(1)) for line in lines if (match := FAILED_COUNT_RE.search(line)) and int(match.group(1)) > 0]
    failures = []
    for line in lines:
        match = FAILED_COUNT_RE.search(line)
        if (FAIL_RE.search(line) and not ZERO_FAILURE_LINE_RE.search(line)) or (match and int(match.group(1)) > 0):
            if line.strip() not in failures:
                failures.append(line.strip())
    execution = {
        "status": "observed_asset_level" if passed or exit_matches or failures else "unknown",
        "kind": "vitest_text_summary" if passed or exit_matches or failures else "unclassified_log",
        "fields": {
            "passed_summary_lines": passed,
            "passed_counts": passed_counts,
            "failed_counts": failed_counts,
            "exit_lines": exit_matches,
            "exit_observations": exit_observations,
            "exit_marker_observations": exit_marker_observations,
            "unparseable_exit_observations": unparseable_exit_observations,
        },
        "unit_level_verdict": None,
    }
    nonzero = []
    for observation in exit_observations:
        if observation["code"] != 0:
            nonzero.append(observation["line"])
    explicit_zero = any(observation["code"] == 0 for observation in exit_observations)
    failure_markers = list(failures)
    for line in nonzero:
        if line not in failure_markers:
            failure_markers.append(line)
    failure = _failure("observed_asset_level" if failure_markers else "not_observed_in_asset", failure_markers)
    positive_pass = any(count > 0 for count in passed_counts)
    if unparseable_exit_observations:
        reason = "unparseable exit marker prevents a pass verdict"
    elif failures and nonzero:
        reason = "contradictory failure marker and nonzero exit code prevent a pass verdict"
    elif failures and positive_pass:
        reason = "contradictory pass summary and failure marker prevent a pass verdict"
    elif nonzero and positive_pass:
        reason = "contradictory pass summary and nonzero exit code prevent a pass verdict"
    elif failures:
        reason = "explicit failure/error text prevents a pass verdict"
    elif nonzero:
        reason = "nonzero exit code prevents a pass verdict"
    elif positive_pass and not explicit_zero:
        reason = "text pass summary has no explicit exit code 0; result is unknown"
    elif positive_pass:
        reason = "text pass summary has no failure marker or nonzero exit, and remains asset-level only"
    else:
        reason = "no positive test pass summary is present"
    if failures or nonzero or unparseable_exit_observations:
        result = {
            "status": "asset_level_test_result_only",
            "verdict": None,
            "reason": reason,
            "anchor_lines": anchor_lines,
        }
    elif positive_pass and explicit_zero:
        result = {
            "status": "asset_level_test_result_only",
            "verdict": "pass_observed",
            "reason": reason,
            "anchor_lines": anchor_lines,
        }
    else:
        result = {
            "status": "asset_level_test_result_only" if passed or exit_matches else "no_result_marker",
            "verdict": None,
            "reason": reason,
            "anchor_lines": anchor_lines,
        }
    return execution, failure, result
