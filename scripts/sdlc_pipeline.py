import os
import sys
import json
import urllib.request
import datetime

# --- Configuration ---
API_KEY = os.getenv("OPENROUTER_API_KEY", "")
URL = "https://openrouter.ai/api/v1/chat/completions"
MODEL = "openai/gpt-4o"
MAX_TOKENS = 1500

WORKSPACE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PROMPTS_DIR = os.path.join(WORKSPACE_DIR, "tools", "prompts")
EPICS_DIR = os.path.join(WORKSPACE_DIR, "docs", "epics")
USAGE_FILE = os.path.join(WORKSPACE_DIR, ".openrouter_usage.json")

STAGES = [
    "knowledge",
    "architect",
    "code_review",
    "qa",
    "runtime_validation",
    "security",
    "performance",
    "release_manager"
]

# --- Default Prompts ---
DEFAULT_PROMPTS = {
    "knowledge": """Role: Knowledge Agent

Responsibilities:
- Read project documentation.
- Read ADRs.
- Read architecture.
- Read interfaces.
- Read epics.
- Read previous implementations.
- Read implementation history.
- Read dependency graph.

Output:
- Relevant documents
- Dependencies
- Previous solutions
- Affected epics
- Affected packages
- Risks

Never write code.
Never propose architecture.
Never approve implementation.""",
    
    "architect": """Role: Principal Architect

Responsibilities:
- Review architecture.
- Review ownership.
- Review layering.
- Review abstractions.
- Detect architectural violations.
- Design implementation.
- Define interfaces.
- Define migration strategy.

Never write production code.

Output:
- Architecture Review
- Root Cause
- Implementation Plan
- Risks
- Acceptance Criteria""",

    "code_review": """Role: Staff Code Reviewer

Responsibilities:
- Review implementation.
- Detect regressions.
- Detect duplicate logic.
- Detect dead code.
- Detect placeholder code.
- Detect architecture violations.
- Detect misleading commits.

Never modify code.

Output:
- Review Report
- Issues
- Severity
- Required Fixes""",

    "qa": """Role: QA Automation Engineer

Responsibilities:
- Create Unit Tests.
- Create Integration Tests.
- Create Playwright E2E Tests.
- Map tests to Acceptance Criteria.
- Verify edge cases.

Never bypass UI.
Never call IPC directly in E2E.

Output:
- Test Plan
- Test Cases
- Coverage Report""",

    "runtime_validation": """Role: Runtime Validation Engineer

Responsibilities:
- Build project.
- Lint.
- Typecheck.
- Run tests.
- Run Electron.
- Execute Playwright.
- Capture screenshots.
- Capture videos.
- Capture traces.
- Capture logs.

Never assume success.

Output:
- Runtime Evidence
- Screenshots
- Videos
- Traces
- Logs
- Build Report""",

    "security": """Role: Security Architect

Responsibilities:
- Review IPC.
- Review preload.
- Review sandbox.
- Review secrets.
- Review permissions.
- Review file access.
- Review authentication.
- Review extension isolation.

Never modify architecture.

Output:
- Security Report
- Vulnerabilities
- Severity
- Recommendations""",

    "performance": """Role: Performance Engineer

Responsibilities:
- Measure startup.
- Measure memory.
- Measure IPC.
- Measure rendering.
- Measure virtualization.
- Measure large workspace performance.
- Detect bottlenecks.

Never optimize by removing functionality.

Output:
- Performance Report
- Metrics
- Bottlenecks
- Recommendations""",

    "release_manager": """Role: Release Manager

Responsibilities:
- Verify all previous reports.
- Verify documentation.
- Verify quality gates.
- Verify runtime evidence.
- Verify architecture compliance.
- Decide release readiness.

Quality Gates:
✓ Build
✓ Lint
✓ Typecheck
✓ Unit
✓ Integration
✓ E2E
✓ Runtime Validation
✓ Security
✓ Performance
✓ Documentation

Output:
- APPROVED
or
- REJECTED

Include exact reasons for rejection.

Never write code.
Never modify implementation."""
}

def ensure_prompts():
    os.makedirs(PROMPTS_DIR, exist_ok=True)
    for stage, content in DEFAULT_PROMPTS.items():
        path = os.path.join(PROMPTS_DIR, f"{stage}_agent.md")
        if not os.path.exists(path):
            with open(path, "w") as f:
                f.write(content)

def check_quota():
    today = datetime.date.today().isoformat()
    if os.path.exists(USAGE_FILE):
        with open(USAGE_FILE, "r") as f:
            data = json.load(f)
    else:
        data = {"date": today, "calls": 0}
        
    if data.get("date") != today:
        data = {"date": today, "calls": 0}
        
    if data["calls"] >= 50:
        print(f"❌ [BLOCKED] Daily API quota exceeded (50/50) for {today}. Cannot proceed.")
        sys.exit(1)
        
    return data

def increment_quota(data):
    data["calls"] += 1
    with open(USAGE_FILE, "w") as f:
        json.dump(data, f)
    print(f"ℹ️  Quota usage: {data['calls']}/50 for {data['date']}")

def read_prompt(stage):
    path = os.path.join(PROMPTS_DIR, f"{stage}_agent.md")
    with open(path, "r") as f:
        return f.read()

def query_openrouter(system_prompt, user_prompt):
    data = {
        "model": MODEL,
        "max_tokens": MAX_TOKENS,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ]
    }
    
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    }
    
    req = urllib.request.Request(URL, data=json.dumps(data).encode('utf-8'), headers=headers, method='POST')
    
    try:
        with urllib.request.urlopen(req) as response:
            result = json.loads(response.read().decode('utf-8'))
            return result['choices'][0]['message']['content']
    except Exception as e:
        print(f"❌ Error calling OpenRouter: {e}")
        if hasattr(e, 'read'):
            print(e.read().decode('utf-8'))
        sys.exit(1)

def main():
    if len(sys.argv) < 3:
        print("Usage: python sdlc_pipeline.py --epic <EPIC_ID> --stage <stage_name> [--context-file <path>]")
        print(f"Available stages: {', '.join(STAGES)}")
        sys.exit(1)
        
    args = sys.argv[1:]
    epic_id = None
    stage = None
    context_file = None
    
    for i in range(len(args)):
        if args[i] == "--epic" and i + 1 < len(args):
            epic_id = args[i + 1]
        elif args[i] == "--stage" and i + 1 < len(args):
            stage = args[i + 1]
        elif args[i] == "--context-file" and i + 1 < len(args):
            context_file = args[i + 1]
            
    if not epic_id or not stage:
        print("Error: --epic and --stage are required.")
        sys.exit(1)
        
    if stage not in STAGES:
        print(f"Error: Unknown stage '{stage}'. Must be one of {STAGES}")
        sys.exit(1)

    ensure_prompts()
    quota_data = check_quota()
    
    print(f"🚀 Starting {stage} agent for {epic_id}...")
    
    # Gather context
    epic_dir = os.path.join(EPICS_DIR, epic_id)
    os.makedirs(epic_dir, exist_ok=True)
    
    user_prompt = f"Please perform your role for {epic_id}.\n\n"
    
    # Always feed the previous stages as context
    user_prompt += "### Previous Stage Outputs ###\n"
    for s in STAGES:
        if s == stage: break
        out_file = os.path.join(epic_dir, f"{s}.md")
        if os.path.exists(out_file):
            user_prompt += f"--- {s.upper()} OUTPUT ---\n"
            with open(out_file, "r") as f:
                user_prompt += f.read() + "\n\n"
                
    if context_file and os.path.exists(context_file):
        user_prompt += "### Attached Additional Context ###\n"
        with open(context_file, "r") as f:
            user_prompt += f.read() + "\n\n"
            
    system_prompt = read_prompt(stage)
    
    print("⏳ Calling OpenRouter API...")
    output = query_openrouter(system_prompt, user_prompt)
    increment_quota(quota_data)
    
    out_path = os.path.join(epic_dir, f"{stage}.md")
    with open(out_path, "w") as f:
        f.write(output)
        
    print(f"✅ {stage.capitalize()} Agent finished. Output saved to {out_path}")

if __name__ == "__main__":
    main()
