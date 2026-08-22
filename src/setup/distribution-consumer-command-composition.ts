import {
  admitLiteConsumerCommand,
  type LiteConsumerCommandAdmission,
  type LiteConsumerCommandFailure,
  type LiteConsumerCommandId,
} from "./distribution-consumer-command-registry";

export interface LiteConsumerCommandExecution {
  command_id: LiteConsumerCommandId;
  exit_code: number;
  output: string;
}

export type LiteConsumerCommandHandler = (
  admission: LiteConsumerCommandAdmission,
) => LiteConsumerCommandExecution | Promise<LiteConsumerCommandExecution>;

export type LiteConsumerCommandHandlers = Record<LiteConsumerCommandId, LiteConsumerCommandHandler>;

export type LiteConsumerCommandDispatchResult =
  | { ok: true; execution: LiteConsumerCommandExecution }
  | { ok: false; failure: LiteConsumerCommandFailure };

export async function dispatchLiteConsumerCommand(
  argv: readonly string[],
  handlers: LiteConsumerCommandHandlers,
): Promise<LiteConsumerCommandDispatchResult> {
  const admission = admitLiteConsumerCommand(argv);
  if (!admission.ok) return { ok: false, failure: admission };
  const execution = await handlers[admission.command_id](admission);
  if (execution.command_id !== admission.command_id) {
    throw new Error(
      `lite_consumer_handler_identity_mismatch:${admission.command_id}:${execution.command_id}`,
    );
  }
  return { ok: true, execution };
}
