export interface ToolBasis {
  from?: string;
  to?: string;
  asOf: string;
  filters?: Record<string, unknown>;
  rowCount: number;
}

export interface ToolResult<T = unknown> {
  data: T;
  basis: ToolBasis;
  assumptions: string[];
}

export interface ITool<TInput = Record<string, unknown>, TOutput = unknown> {
  readonly name: string;
  readonly description: string;
  readonly roles: string[];
  execute(input: TInput, userContext: { userId: string; role: string; customerId?: string }): Promise<ToolResult<TOutput>>;
}
