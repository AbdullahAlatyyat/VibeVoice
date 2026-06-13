# Graph Report - VibeVoice  (2026-06-13)

## Corpus Check
- 31 files · ~11,520 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 173 nodes · 186 edges · 24 communities (17 shown, 7 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `124f9ccd`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 23|Community 23]]

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 16 edges
2. `What You Must Do When Invoked` - 11 edges
3. `POST()` - 10 edges
4. `/graphify` - 10 edges
5. `graphify reference: extra exports and benchmark` - 8 edges
6. `scripts` - 7 edges
7. `VibeVoice` - 6 edges
8. `getAppConfig()` - 5 edges
9. `createRoom()` - 5 edges
10. `createLiveKitToken()` - 4 edges

## Surprising Connections (you probably didn't know these)
- `POST()` --calls--> `getAppConfig()`  [EXTRACTED]
  app/api/livekit-token/route.ts → lib/config.ts
- `POST()` --calls--> `createLiveKitToken()`  [EXTRACTED]
  app/api/livekit-token/route.ts → lib/livekit.ts
- `POST()` --calls--> `createParticipantIdentity()`  [EXTRACTED]
  app/api/livekit-token/route.ts → lib/livekit.ts
- `POST()` --calls--> `derivePrivateRoomName()`  [EXTRACTED]
  app/api/livekit-token/route.ts → lib/rooms.ts
- `POST()` --calls--> `isValidRoomId()`  [EXTRACTED]
  app/api/livekit-token/route.ts → lib/rooms.ts

## Import Cycles
- None detected.

## Communities (24 total, 7 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.20
Nodes (16): createLiveKitToken(), createParticipantIdentity(), cryptoRandomId(), TokenInput, CreatedRoom, createRoom(), derivePrivateRoomName(), isValidRoomId() (+8 more)

### Community 1 - "Community 1"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 2 - "Community 2"
Cohesion: 0.25
Nodes (8): dependencies, clsx, livekit-client, livekit-server-sdk, lucide-react, next, react, react-dom

### Community 3 - "Community 3"
Cohesion: 0.15
Nodes (8): CreatedRoom, HomeShell(), ChatMessage, ConnectionState, ParticipantView, RoomShell(), TokenResponse, PageProps

### Community 4 - "Community 4"
Cohesion: 0.14
Nodes (14): Part A - Structural extraction for code files, Part B - Semantic extraction (parallel subagents), Part C - Merge AST + semantic into final extraction, Step 0 - GitHub repos and multi-path merge (only if a URL or several paths), Step 1 - Ensure graphify is installed, Step 2.5 - Video and audio (only if video files detected), Step 2 - Detect files, Step 3 - Extract entities and relationships (+6 more)

### Community 5 - "Community 5"
Cohesion: 0.11
Nodes (17): devDependencies, eslint, eslint-config-next, jsdom, @testing-library/jest-dom, @testing-library/react, @testing-library/user-event, @types/node (+9 more)

### Community 6 - "Community 6"
Cohesion: 0.20
Nodes (9): For /graphify add and --watch, For /graphify query, For the commit hook and native CLAUDE.md integration, For --update and --cluster-only, /graphify, Honesty Rules, Interpreter guard for subcommands, Usage (+1 more)

### Community 7 - "Community 7"
Cohesion: 0.22
Nodes (8): graphify reference: extra exports and benchmark, Step 6b - Wiki (only if --wiki flag), Step 7 - Neo4j export (only if --neo4j or --neo4j-push flag), Step 7a - FalkorDB export (only if --falkordb or --falkordb-push flag), Step 7b - SVG export (only if --svg flag), Step 7c - GraphML export (only if --graphml flag), Step 7d - MCP server (only if --mcp flag), Step 8 - Token reduction benchmark (only if total_words > 5000)

### Community 8 - "Community 8"
Cohesion: 0.29
Nodes (6): ARM64 Docker Build, Development, Environment, Privacy Model, Required Services, VibeVoice

### Community 9 - "Community 9"
Cohesion: 0.29
Nodes (7): scripts, build, dev, lint, start, test, test:watch

### Community 11 - "Community 11"
Cohesion: 0.50
Nodes (3): For /graphify add, For --watch, graphify reference: add a URL and watch a folder

### Community 12 - "Community 12"
Cohesion: 0.50
Nodes (3): For git commit hook, For native CLAUDE.md integration, graphify reference: commit hook and native CLAUDE.md integration

### Community 13 - "Community 13"
Cohesion: 0.50
Nodes (3): For /graphify explain, For /graphify path, graphify reference: query, path, explain

### Community 14 - "Community 14"
Cohesion: 0.50
Nodes (3): For --cluster-only, For --update (incremental re-extraction), graphify reference: incremental update and cluster-only

### Community 23 - "Community 23"
Cohesion: 0.60
Nodes (4): AppConfig, getAppConfig(), parsePositiveInt(), requireEnv()

## Knowledge Gaps
- **102 isolated node(s):** `metadata`, `viewport`, `PageProps`, `CreatedRoom`, `ConnectionState` (+97 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **7 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `What You Must Do When Invoked` connect `Community 4` to `Community 6`?**
  _High betweenness centrality (0.014) - this node is a cross-community bridge._
- **Why does `dependencies` connect `Community 2` to `Community 5`?**
  _High betweenness centrality (0.013) - this node is a cross-community bridge._
- **What connects `metadata`, `viewport`, `PageProps` to the rest of the system?**
  _102 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.1 - nodes in this community are weakly interconnected._
- **Should `Community 3` be split into smaller, more focused modules?**
  _Cohesion score 0.14705882352941177 - nodes in this community are weakly interconnected._
- **Should `Community 4` be split into smaller, more focused modules?**
  _Cohesion score 0.14285714285714285 - nodes in this community are weakly interconnected._
- **Should `Community 5` be split into smaller, more focused modules?**
  _Cohesion score 0.1111111111111111 - nodes in this community are weakly interconnected._