/**
 * Returns the value a tool's `execute` function resolves with.
 *
 * The current WebMCP draft serializes the resolved value as JSON and hands it to the agent,
 * so no wrapper object is needed. The helper keeps tool code readable and gives one place
 * to adapt if the result format changes. The data must be JSON serializable.
 *
 * @example
 * execute: async ({ id }) => toolResult({ id, status: 'shipped' })
 */
export function toolResult<T>(data: T): T {
  return data;
}

/**
 * Creates the error to report a failed tool call. In the current WebMCP draft a rejected
 * promise marks the call as failed, so throw the returned error from `execute`.
 *
 * @example
 * execute: async ({ id }) => { throw toolError(`Order ${id} not found`); }
 */
export function toolError(message: string): Error {
  return new Error(message);
}
