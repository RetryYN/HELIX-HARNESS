import {
  activateHelixVisualizationExtension,
  type HelixVisualizationExtensionDeps,
  type RegisteredHelixVisualization,
  registerHelixVisualization,
  type VscodeApiLike,
  type VscodeExtensionContextLike,
} from "./extension-adapter";

let registeredVisualization: RegisteredHelixVisualization | undefined;

async function importVscodeApi(): Promise<VscodeApiLike> {
  const dynamicImport = new Function("specifier", "return import(specifier)") as (
    specifier: string,
  ) => Promise<unknown>;
  return (await dynamicImport("vscode")) as VscodeApiLike;
}

export async function activate(
  context: VscodeExtensionContextLike,
  vscodeApi?: VscodeApiLike,
  input: {
    repoRoot?: string;
    helixCommand?: string;
  } & Partial<HelixVisualizationExtensionDeps> = {},
): Promise<RegisteredHelixVisualization> {
  const vscode = vscodeApi ?? (await importVscodeApi());
  registeredVisualization = input.loadTree
    ? await registerHelixVisualization(context, vscode, { loadTree: input.loadTree })
    : await activateHelixVisualizationExtension(context, vscode, input);
  return registeredVisualization;
}

export function deactivate(): void {
  registeredVisualization = undefined;
}
