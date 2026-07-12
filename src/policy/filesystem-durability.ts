export type SupportedPlatform = NodeJS.Platform;

export function supportsDirectoryFsync(platformName: SupportedPlatform): boolean {
  return platformName !== "win32";
}

export function isAtomicRenameCollision(input: {
  platformName: SupportedPlatform;
  errorCode: string | undefined;
  targetExists: boolean;
}): boolean {
  if (input.errorCode === "EEXIST" || input.errorCode === "ENOTEMPTY") return true;
  return (
    input.platformName === "win32" &&
    input.targetExists &&
    (input.errorCode === "EPERM" || input.errorCode === "EACCES")
  );
}

export function parseWindowsProcessStartIdentity(output: string): string {
  const ticks = output.trim();
  if (!/^\d+$/.test(ticks)) throw new Error("Windows process start identity malformed");
  return `win32:${ticks}`;
}
