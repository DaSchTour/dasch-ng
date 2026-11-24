/**
 * Minimal types for the WebMCP browser proposal.
 *
 * Based on the W3C Web Machine Learning Community Group draft
 * (https://github.com/webmachinelearning/webmcp, `index.bs`, revision aa1b51c of 2026-11-10).
 * The proposal is still changing, so only the parts this library uses are typed.
 */

/** JSON Schema object describing tool input or output. */
export type WebMcpSchema = Record<string, unknown>;

/** Hints that help an agent decide how to treat a tool. */
export interface WebMcpToolAnnotations {
  /** The tool does not change any state. */
  readOnlyHint?: boolean;
  /** The result may contain content written by untrusted users. */
  untrustedContentHint?: boolean;
  /** Calling the tool has effects that are hard to undo. */
  consequentialHint?: boolean;
  /** The tool is meant for debugging only. */
  debugging?: boolean;
}

/** A tool that is offered to AI agents. */
export interface WebMcpTool {
  /** Unique name: letters, digits, `_`, `-` and `.`, at most 128 characters. */
  name: string;
  /** Human readable title. */
  title?: string;
  /** Plain-language description the agent reads to decide when to call the tool. */
  description: string;
  /** JSON Schema of the argument object. */
  inputSchema?: WebMcpSchema;
  /** JSON Schema of the result. */
  outputSchema?: WebMcpSchema;
  annotations?: WebMcpToolAnnotations;
  /**
   * Runs the tool. The resolved value is serialized as JSON for the agent; a rejected
   * promise reports a failure. The signal aborts when the agent cancels the call.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  execute(input: any, options: { signal: AbortSignal }): Promise<unknown>;
}

/** Options of `ModelContext.registerTool`. */
export interface WebMcpRegisterToolOptions {
  /** Unregisters the tool when aborted. */
  signal?: AbortSignal;
  /** Origins the tool is exposed to in the document tree. */
  exposedTo?: string[];
}

/** The part of the `ModelContext` interface used by this library. */
export interface WebMcpModelContext {
  /** Returns a promise in the current draft; older previews returned nothing. */
  registerTool(tool: WebMcpTool, options?: WebMcpRegisterToolOptions): Promise<void> | void;
}
