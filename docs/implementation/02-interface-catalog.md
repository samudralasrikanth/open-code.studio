# 02. Interface Catalog

This document defines the high-level, technology-neutral abstract interfaces and contracts for the core IDE, Runtime, and Agent Platform services. Implementation packages must conform to these definitions.

---

## 1. IDE Platform Interfaces

### IWorkspaceService

Manages workspace state, mounting, directory structures, and file queries.

```typescript
interface IWorkspaceService {
  getWorkspaceRoot(): WorkspaceUri;
  findFiles(globPattern: string, ignorePattern?: string): Promise<WorkspaceUri[]>;
  readFile(uri: WorkspaceUri): Promise<string>;
  writeFile(uri: WorkspaceUri, content: string): Promise<void>;
  createFile(uri: WorkspaceUri): Promise<void>;
  deleteFile(uri: WorkspaceUri): Promise<void>;
  exists(uri: WorkspaceUri): Promise<boolean>;
  onWorkspaceChanged: IEvent<WorkspaceChangedPayload>;
}
```

### IDocumentService

Coordinates open file buffers, reference counts, save loops, and dirty flags.

```typescript
interface IDocumentService {
  openDocument(uri: WorkspaceUri): Promise<IDocument>;
  closeDocument(uri: WorkspaceUri): void;
  updateDocumentText(uri: WorkspaceUri, text: string): void;
  saveDocument(uri: WorkspaceUri): Promise<void>;
  revertDocument(uri: WorkspaceUri): Promise<void>;
  getOpenDocuments(): IDocument[];
  onDocumentChanged: IEvent<DocumentChangedEventPayload>;
  onDocumentSaved: IEvent<WorkspaceUri>;
}
```

### IEditorService

Manages active tabs, editor groups, and split viewport nodes.

```typescript
interface IEditorService {
  openEditor(input: EditorInput, group: EditorGroupId): Promise<void>;
  closeEditor(input: EditorInput, group: EditorGroupId): Promise<void>;
  splitGroup(group: EditorGroupId, direction: "horizontal" | "vertical"): EditorGroupId;
  getActiveGroup(): EditorGroupId;
  getEditorGroups(): IEditorGroup[];
  serializeLayout(): SerializedLayoutState;
  restoreLayout(state: SerializedLayoutState): Promise<void>;
  onEditorStateChanged: IEvent<EditorStateChangedPayload>;
}
```

---

## 2. Runtime & PTY Interfaces

### IPtyService (Subprocess Wrapper)

Interface run by the PTY Host process to spawn and manage native OS terminals.

```typescript
interface IPtyService {
  createSession(shellPath: string, cwd: string, cols: number, rows: number): Promise<PtySessionId>;
  write(sessionId: PtySessionId, data: string): void;
  resize(sessionId: PtySessionId, cols: number, rows: number): void;
  kill(sessionId: PtySessionId): void;
  onData(sessionId: PtySessionId): IEvent<string>;
  onExit(sessionId: PtySessionId): IEvent<{ exitCode: number }>;
}
```

### IRuntimeService

Manages language servers, test runners, local runtimes, and GPU diagnostic detection.

```typescript
interface IRuntimeService {
  detectGpu(): Promise<GpuCapabilities>;
  runDiagnostic(target: string): Promise<DiagnosticReport>;
  executeProcess(
    cmd: string,
    args: string[],
    options: ProcessOptions
  ): Promise<ProcessExecutionResult>;
}
```

### ITokenEngine

Enforces tokenizer boundaries, counts prompt tokens, and evaluates LLM budgets.

```typescript
interface ITokenEngine {
  countTokens(text: string, modelId: string): Promise<number>;
  countTokensAsync(text: string, modelId: string, token: CancellationToken): Promise<number>;
  validateContextWindow(text: string, limit: number, modelId: string): Promise<boolean>;
  getPromptBudget(limit: number, reserve: number): number;
}
```

---

## 3. Gateway & AI Interfaces

### IGatewayService

Routes requests across providers, manages failovers, caching, and rate limiting.

```typescript
interface IGatewayService {
  generateCompletion(
    request: CompletionRequest,
    options?: RequestOptions
  ): Promise<CompletionResponse>;
  streamCompletion(
    request: CompletionRequest,
    options?: RequestOptions
  ): Promise<ReadableStream<CompletionChunk>>;
  registerProvider(providerId: string, provider: ILlmProvider): void;
}
```

### IMemoryService (Semantic RAG Store)

Index and retrieve workspace files and user query memory vectors.

```typescript
interface IMemoryService {
  storeVector(text: string, metadata: Record<string, any>): Promise<void>;
  querySimilarity(vector: number[], limit: number): Promise<MemoryItem[]>;
  searchWorkspaceContext(query: string, options: SearchOptions): Promise<ContextSnippet[]>;
}
```

---

## 4. Agent Platform Interfaces

### IPlannerService

Generates task execution lists based on high-level goals.

```typescript
interface IPlannerService {
  generatePlan(goal: string, context: AgentContext, token: CancellationToken): Promise<IPlanStep[]>;
  evaluateExecution(step: IPlanStep, outcome: string): Promise<PlanEvaluation>;
}
```

### IAgentHostService

Sandbox execution harness orchestrating Planner, Coder, and Reviewer sub-agents in isolated subprocesses.

```typescript
interface IAgentHostService {
  spawnAgent(agentId: string, profile: AgentProfile): Promise<AgentSessionId>;
  executeAgentTask(
    sessionId: AgentSessionId,
    task: string,
    token: CancellationToken
  ): Promise<TaskResult>;
  onAgentStateChanged: IEvent<AgentStatePayload>;
}
```
