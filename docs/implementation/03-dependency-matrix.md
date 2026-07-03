# 03. Dependency Matrix

This document provides a complete dependency matrix for all 110 Epics. It tracks the chronological ordering, blocking relationships, and prerequisites.

---

## 1. Core IDE & Agent Platform Dependency Matrix (Epics 0001 - 0064)

| Epic ID       | Topic                        | Depends On                                 | Blocks                                     |
| ------------- | ---------------------------- | ------------------------------------------ | ------------------------------------------ |
| **EPIC-0001** | Repository Foundation        | _None_                                     | EPIC-0002                                  |
| **EPIC-0002** | Core Platform                | EPIC-0001                                  | EPIC-0003, EPIC-0004                       |
| **EPIC-0003** | Desktop Bootstrap            | EPIC-0002                                  | EPIC-0004                                  |
| **EPIC-0004** | Workspace Management         | EPIC-0002, EPIC-0003                       | EPIC-0005, EPIC-0006, EPIC-0007            |
| **EPIC-0005** | Explorer Platform            | EPIC-0004                                  | EPIC-0006, EPIC-0008                       |
| **EPIC-0006** | Document & Editor Platform   | EPIC-0004, EPIC-0005                       | EPIC-0007, EPIC-0009                       |
| **EPIC-0007** | Terminal Integration         | EPIC-0004, EPIC-0005, EPIC-0006            | EPIC-0008, EPIC-0015                       |
| **EPIC-0008** | Git Integration              | EPIC-0007                                  | EPIC-0015                                  |
| **EPIC-0009** | Command Palette              | EPIC-0006                                  | EPIC-0014                                  |
| **EPIC-0010** | Global Search                | EPIC-0004, EPIC-0007                       | EPIC-0015                                  |
| **EPIC-0011** | Settings                     | EPIC-0004                                  | EPIC-0015                                  |
| **EPIC-0012** | Theme System                 | EPIC-0011                                  | _None_                                     |
| **EPIC-0013** | Notifications                | EPIC-0002                                  | _None_                                     |
| **EPIC-0014** | Keyboard Shortcuts           | EPIC-0009                                  | _None_                                     |
| **EPIC-0015** | Session Restore              | EPIC-0007, EPIC-0008, EPIC-0010, EPIC-0011 | EPIC-0016                                  |
| **EPIC-0016** | Runtime Service              | EPIC-0015                                  | EPIC-0017, EPIC-0019, EPIC-0021, EPIC-0022 |
| **EPIC-0017** | Model Registry               | EPIC-0016                                  | EPIC-0018, EPIC-0023                       |
| **EPIC-0018** | Model Downloader             | EPIC-0017                                  | EPIC-0019                                  |
| **EPIC-0019** | Model Installer              | EPIC-0018                                  | EPIC-0020                                  |
| **EPIC-0020** | GPU Detection                | EPIC-0019                                  | EPIC-0024                                  |
| **EPIC-0021** | Memory Manager               | EPIC-0016                                  | EPIC-0023                                  |
| **EPIC-0022** | Context Manager              | EPIC-0016                                  | EPIC-0023, EPIC-0035                       |
| **EPIC-0023** | Token Engine                 | EPIC-0017, EPIC-0021, EPIC-0022            | EPIC-0025, EPIC-0035, EPIC-0049            |
| **EPIC-0024** | Runtime Monitoring           | EPIC-0020                                  | _None_                                     |
| **EPIC-0025** | Gateway Core                 | EPIC-0023                                  | EPIC-0026, EPIC-0029                       |
| **EPIC-0026** | Provider SDK                 | EPIC-0025                                  | EPIC-0027, EPIC-0028                       |
| **EPIC-0027** | Local Provider               | EPIC-0026                                  | EPIC-0030                                  |
| **EPIC-0028** | Cloud Provider               | EPIC-0026                                  | EPIC-0030                                  |
| **EPIC-0029** | Provider Registry            | EPIC-0025                                  | EPIC-0030                                  |
| **EPIC-0030** | Provider Policy Engine       | EPIC-0027, EPIC-0028, EPIC-0029            | EPIC-0031                                  |
| **EPIC-0031** | Cost & Usage Tracking        | EPIC-0030                                  | EPIC-0032                                  |
| **EPIC-0032** | Auth & Credential Management | EPIC-0031                                  | EPIC-0033                                  |
| **EPIC-0033** | Streaming Platform           | EPIC-0025                                  | EPIC-0034                                  |
| **EPIC-0034** | Resiliency Engine            | EPIC-0033                                  | EPIC-0035, EPIC-0049                       |
| **EPIC-0035** | Workspace Scanner            | EPIC-0022, EPIC-0023, EPIC-0034            | EPIC-0036                                  |
| **EPIC-0036** | File Watcher                 | EPIC-0035                                  | EPIC-0037                                  |
| **EPIC-0037** | Language Parsers             | EPIC-0036                                  | EPIC-0038                                  |
| **EPIC-0038** | Symbol Extraction            | EPIC-0037                                  | EPIC-0039                                  |
| **EPIC-0039** | Dependency Graph             | EPIC-0038                                  | EPIC-0040, EPIC-0042                       |
| **EPIC-0040** | Embedding Engine             | EPIC-0039                                  | EPIC-0041                                  |
| **EPIC-0041** | Semantic Search              | EPIC-0040                                  | EPIC-0042                                  |
| **EPIC-0042** | Context Builder              | EPIC-0039, EPIC-0041                       | EPIC-0043, EPIC-0050                       |
| **EPIC-0043** | Knowledge Store              | EPIC-0042                                  | EPIC-0044                                  |
| **EPIC-0044** | Memory Store                 | EPIC-0043                                  | EPIC-0045, EPIC-0046                       |
| **EPIC-0045** | Memory Classification        | EPIC-0044                                  | EPIC-0046                                  |
| **EPIC-0046** | Memory Promotion             | EPIC-0045                                  | EPIC-0047                                  |
| **EPIC-0047** | Memory Retrieval             | EPIC-0046                                  | EPIC-0048, EPIC-0051                       |
| **EPIC-0048** | Organization Memory          | EPIC-0047                                  | EPIC-0049                                  |
| **EPIC-0049** | Agent Registry               | EPIC-0023, EPIC-0034, EPIC-0048            | EPIC-0050                                  |
| **EPIC-0050** | Planner Agent                | EPIC-0042, EPIC-0049                       | EPIC-0051                                  |
| **EPIC-0051** | Coding Agent                 | EPIC-0047, EPIC-0050                       | EPIC-0052, EPIC-0053                       |
| **EPIC-0052** | Review Agent                 | EPIC-0051                                  | EPIC-0054                                  |
| **EPIC-0053** | Testing Agent                | EPIC-0051                                  | EPIC-0054                                  |
| **EPIC-0054** | Documentation Agent          | EPIC-0052, EPIC-0053                       | EPIC-0055                                  |
| **EPIC-0055** | Refactoring Agent            | EPIC-0054                                  | EPIC-0056                                  |
| **EPIC-0056** | Debugging Agent              | EPIC-0055                                  | EPIC-0057                                  |
| **EPIC-0057** | Agent Metrics                | EPIC-0056                                  | EPIC-0058                                  |
| **EPIC-0058** | Workflow Core                | EPIC-0057                                  | EPIC-0059, EPIC-0060                       |
| **EPIC-0059** | Scheduler                    | EPIC-0058                                  | EPIC-0060                                  |
| **EPIC-0060** | Task Engine                  | EPIC-0058, EPIC-0059                       | EPIC-0061                                  |
| **EPIC-0061** | Approval Gates               | EPIC-0060                                  | EPIC-0062                                  |
| **EPIC-0062** | Rollback Engine              | EPIC-0061                                  | EPIC-0063                                  |
| **EPIC-0063** | Execution History            | EPIC-0062                                  | EPIC-0064                                  |
| **EPIC-0064** | Workflow Analytics           | EPIC-0063                                  | EPIC-0065                                  |

---

## 2. Security, Extension, & Expansion Dependency Matrix (Epics 0065 - 0110)

| Epic ID       | Topic                   | Depends On                 | Blocks                                   |
| ------------- | ----------------------- | -------------------------- | ---------------------------------------- |
| **EPIC-0065** | Policy Engine           | EPIC-0064                  | EPIC-0066                                |
| **EPIC-0066** | RBAC                    | EPIC-0065                  | EPIC-0067, EPIC-0077                     |
| **EPIC-0067** | Workspace Trust         | EPIC-0066                  | EPIC-0068                                |
| **EPIC-0068** | Secret Management       | EPIC-0067                  | EPIC-0069, EPIC-0077                     |
| **EPIC-0069** | Audit Logs              | EPIC-0068                  | EPIC-0070                                |
| **EPIC-0070** | Compliance              | EPIC-0069                  | EPIC-0071                                |
| **EPIC-0071** | Plugin SDK              | EPIC-0070                  | EPIC-0072                                |
| **EPIC-0072** | Extension Loader        | EPIC-0071                  | EPIC-0073, EPIC-0074                     |
| **EPIC-0073** | Marketplace             | EPIC-0072                  | EPIC-0075                                |
| **EPIC-0074** | Plugin Sandbox          | EPIC-0072                  | EPIC-0076                                |
| **EPIC-0075** | Theme Marketplace       | EPIC-0073                  | _None_                                   |
| **EPIC-0076** | Workflow Marketplace    | EPIC-0074                  | _None_                                   |
| **EPIC-0077** | Enterprise Auth         | EPIC-0066, EPIC-0068       | EPIC-0078, EPIC-0084                     |
| **EPIC-0078** | Organization Mgmt       | EPIC-0077                  | EPIC-0079                                |
| **EPIC-0079** | Team Management         | EPIC-0078                  | EPIC-0084                                |
| **EPIC-0080** | Enterprise Policies     | EPIC-0078                  | EPIC-0081                                |
| **EPIC-0081** | Licensing               | EPIC-0080                  | EPIC-0082                                |
| **EPIC-0082** | Usage Analytics         | EPIC-0081                  | EPIC-0083                                |
| **EPIC-0083** | Administration Console  | EPIC-0082                  | _None_                                   |
| **EPIC-0084** | Shared Workspaces       | EPIC-0077, EPIC-0079       | EPIC-0085                                |
| **EPIC-0085** | Live Presence           | EPIC-0084                  | EPIC-0086                                |
| **EPIC-0086** | Shared Reviews          | EPIC-0085                  | EPIC-0087                                |
| **EPIC-0087** | Team Memory             | EPIC-0086                  | _None_                                   |
| **EPIC-0088** | Prompt Library          | EPIC-0049                  | EPIC-0089                                |
| **EPIC-0089** | Prompt Versioning       | EPIC-0088                  | EPIC-0090                                |
| **EPIC-0090** | Evaluation Framework    | EPIC-0089                  | EPIC-0091                                |
| **EPIC-0091** | Benchmark Suite         | EPIC-0090                  | EPIC-0092                                |
| **EPIC-0092** | AI Quality Metrics      | EPIC-0091                  | _None_                                   |
| **EPIC-0093** | Telemetry               | EPIC-0002                  | EPIC-0094                                |
| **EPIC-0094** | Logging                 | EPIC-0093                  | EPIC-0095                                |
| **EPIC-0095** | Metrics                 | EPIC-0094                  | EPIC-0096                                |
| **EPIC-0096** | Distributed Tracing     | EPIC-0095                  | EPIC-0097                                |
| **EPIC-0097** | Health Monitoring       | EPIC-0096                  | _None_                                   |
| **EPIC-0098** | Build Pipeline          | EPIC-0001                  | EPIC-0099                                |
| **EPIC-0099** | Release Pipeline        | EPIC-0098                  | EPIC-0100                                |
| **EPIC-0100** | Auto-Updates            | EPIC-0099                  | EPIC-0101                                |
| **EPIC-0101** | Crash Reporting         | EPIC-0100                  | EPIC-0102                                |
| **EPIC-0102** | Backup and Restore      | EPIC-0101                  | EPIC-0103                                |
| **EPIC-0103** | Browser IDE             | EPIC-0107 (Public API)     | EPIC-0104, EPIC-0108                     |
| **EPIC-0104** | CLI                     | EPIC-0107 (Public API)     | EPIC-0108                                |
| **EPIC-0105** | Remote Runtime          | EPIC-0058 (Workflow Core)  | EPIC-0107 (Public API)                   |
| **EPIC-0106** | Mobile Companion        | EPIC-0103                  | _None_                                   |
| **EPIC-0107** | Public API              | EPIC-0105 (Remote Runtime) | EPIC-0103 (Browser IDE), EPIC-0104 (CLI) |
| **EPIC-0108** | SDK Samples             | EPIC-0103, EPIC-0104       | EPIC-0109                                |
| **EPIC-0109** | AI Benchmark Lab        | EPIC-0108                  | EPIC-0110                                |
| **EPIC-0110** | Distributed Multi-Agent | EPIC-0109                  | _None_                                   |
