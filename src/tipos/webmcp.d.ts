/**
 * Declaraciones ambientales mínimas de la API WebMCP (draft W3C WebML CG).
 * La API real la expone el navegador/agente: https://webmachinelearning.github.io/webmcp/
 */

interface WebmcpAnnotations {
  readOnlyHint?: boolean;
  untrustedContentHint?: boolean;
}

interface WebmcpTool {
  name: string;
  title?: string;
  description: string;
  inputSchema?: Record<string, unknown>;
  execute: (
    input: Record<string, unknown>,
    options: { signal: AbortSignal },
  ) => Promise<unknown>;
  annotations?: WebmcpAnnotations;
}

interface WebmcpRegisteredTool {
  name: string;
  title?: string;
  description: string;
  inputSchema?: Record<string, unknown>;
  annotations?: WebmcpAnnotations;
}

interface WebmcpModelContext {
  registerTool(tool: WebmcpTool): Promise<void>;
  getTools(): Promise<WebmcpRegisteredTool[]>;
}

interface Document {
  readonly modelContext?: WebmcpModelContext;
}
