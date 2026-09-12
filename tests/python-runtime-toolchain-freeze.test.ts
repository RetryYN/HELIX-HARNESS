import { describe, expect, it } from "vitest";
import {
  type PythonRuntimeToolchainEntry,
  resolvePythonRuntimeToolchain,
} from "../src/runtime/python-runtime-toolchain-freeze";

// PLAN-L5-104-python-runtime-toolchain-freeze

const admitted: PythonRuntimeToolchainEntry = {
  python_version: "3.14.7",
  implementation: "cpython",
  free_threaded: "disabled",
  jit: "disabled",
};

describe("Python runtime toolchain freeze", () => {
  it("U-PYRT-001: exact runtime identityだけを解決しexperimental mode driftを拒否する", () => {
    expect(resolvePythonRuntimeToolchain(admitted, [admitted])).toEqual({
      ok: true,
      value: admitted,
    });
    expect(
      resolvePythonRuntimeToolchain({ ...admitted, free_threaded: "enabled" }, [admitted]),
    ).toEqual({ ok: false, reason: "PYTHON_RUNTIME_EXPERIMENTAL_MODE_MISMATCH" });
    expect(resolvePythonRuntimeToolchain({ ...admitted, jit: "enabled" }, [admitted])).toEqual({
      ok: false,
      reason: "PYTHON_RUNTIME_EXPERIMENTAL_MODE_MISMATCH",
    });
  });
});
