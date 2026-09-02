const SCP_REMOTE = /^git@[A-Za-z0-9.-]+:[A-Za-z0-9._~/-]+$/;
const REVISION_ATOM = /^[A-Za-z0-9_./~^-]+$/;

function hasControlOrSpace(value: string): boolean {
  return [...value].some((character) => {
    const code = character.charCodeAt(0);
    return code <= 0x20 || code === 0x7f;
  });
}

/** git transport helper やoptionとして再解釈されないremote identityだけを返す。 */
export function requireSafeGitRemoteUrl(value: string): string {
  if (
    !value ||
    value.startsWith("-") ||
    value.toLowerCase().startsWith("ext::") ||
    hasControlOrSpace(value)
  ) {
    throw new Error("unsafe_git_remote_url");
  }
  if (SCP_REMOTE.test(value)) return value;

  if (!URL.canParse(value)) {
    throw new Error("unsafe_git_remote_url");
  }
  const parsed = new URL(value);
  if (parsed.protocol !== "https:" && parsed.protocol !== "ssh:") {
    throw new Error("unsafe_git_remote_url");
  }
  if (
    !parsed.hostname ||
    parsed.password ||
    (parsed.protocol === "https:" && parsed.username) ||
    parsed.search ||
    parsed.hash
  ) {
    throw new Error("unsafe_git_remote_url");
  }
  return value;
}

/** git optionとして再解釈されない単一revisionまたは二点rangeだけを返す。 */
export function requireSafeGitRevisionRange(value: string): string {
  if (!value || value.startsWith("-") || hasControlOrSpace(value)) {
    throw new Error("unsafe_git_revision_range");
  }
  const separator = value.includes("...") ? "..." : value.includes("..") ? ".." : null;
  const atoms = separator ? value.split(separator) : [value];
  if (
    atoms.length > 2 ||
    atoms.some(
      (atom) =>
        !atom ||
        !REVISION_ATOM.test(atom) ||
        atom.startsWith(".") ||
        atom.endsWith(".") ||
        atom.includes(".."),
    )
  ) {
    throw new Error("unsafe_git_revision_range");
  }
  return value;
}
