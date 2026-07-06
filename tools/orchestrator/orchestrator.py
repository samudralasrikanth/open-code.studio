#!/usr/bin/env python3
import os
import json
import urllib.request
import subprocess
import argparse
from pathlib import Path

# Using the OpenRouter API key found in scratchpad as a placeholder
API_KEY = os.environ.get("OPENROUTER_API_KEY", "")
URL = "https://openrouter.ai/api/v1/chat/completions"
MODEL = "openai/gpt-4o-mini" # Fast model for orchestration testing

class EpicState:
    def __init__(self, epic_id: str):
        self.epic_id = epic_id
        self.epic_dir = Path("docs") / "epics" / epic_id
        self.state_file = self.epic_dir / "state.json"
        self.automation_dir = self.epic_dir / "automation"
        
        self.epic_dir.mkdir(parents=True, exist_ok=True)
        self.automation_dir.mkdir(parents=True, exist_ok=True)
        self.state = self.load_state()

    def load_state(self):
        if self.state_file.exists():
            with open(self.state_file, "r") as f:
                return json.load(f)
        return {"status": "started", "next_stage": "knowledge", "history": []}

    def save_state(self):
        with open(self.state_file, "w") as f:
            json.dump(self.state, f, indent=2)

    def update_stage(self, stage: str, agent_result: dict):
        self.state["history"].append({
            "stage": stage,
            "result": agent_result
        })
        self.state["status"] = agent_result.get("status", "unknown")
        self.state["next_stage"] = agent_result.get("next_stage", "completed")
        self.save_state()
        
        # Save the full agent result as markdown or json log
        result_file = self.epic_dir / f"{stage}.json"
        with open(result_file, "w") as f:
            json.dump(agent_result, f, indent=2)

class AutomationRunner:
    def __init__(self, state: EpicState):
        self.state = state

    def run_all(self):
        print(f"[{self.state.epic_id}] Running automation layer...")
        tasks = {
            "git_diff": ["git", "diff", "HEAD"],
            "build": ["pnpm", "build"],
            "lint": ["pnpm", "lint"],
            "typecheck": ["pnpm", "typecheck"],
            "test": ["pnpm", "test", "--run"]
        }
        
        results = {}
        for name, cmd in tasks.items():
            print(f"  -> Running {name}...")
            try:
                # Run the process
                result = subprocess.run(
                    cmd, 
                    stdout=subprocess.PIPE, 
                    stderr=subprocess.STDOUT, 
                    text=True, 
                    check=False
                )
                output = result.stdout
                success = result.returncode == 0
            except Exception as e:
                output = str(e)
                success = False

            results[name] = {"success": success, "output": output}
            
            # Write to automation dir
            with open(self.state.automation_dir / f"{name}.txt", "w") as f:
                f.write(output)
        
        all_success = all(r["success"] for r in results.values())
        print(f"[{self.state.epic_id}] Automation layer complete. Success: {all_success}")
        return all_success

def invoke_agent(prompt_file: str, context: str) -> dict:
    prompt_path = Path("tools/prompts") / prompt_file
    if not prompt_path.exists():
        raise FileNotFoundError(f"Prompt file {prompt_path} not found")
        
    with open(prompt_path, "r") as f:
        system_prompt = f.read()

    data = {
        "model": MODEL,
        "max_tokens": 1000,
        "response_format": {"type": "json_object"},
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": context}
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
            content = result['choices'][0]['message']['content']
            return json.loads(content)
    except Exception as e:
        print(f"Error calling LLM for {prompt_file}: {e}")
        if hasattr(e, 'read'):
            print(e.read().decode('utf-8'))
        return {"status": "failed", "error": str(e), "next_stage": "failed"}

def run_pipeline(epic_id: str, description: str):
    state = EpicState(epic_id)
    print(f"Starting pipeline for {epic_id} at stage: {state.state['next_stage']}")

    # 1. Knowledge Stage
    if state.state["next_stage"] == "knowledge":
        print("Invoking Knowledge Agent...")
        context = f"Epic: {epic_id}\nDescription: {description}"
        result = invoke_agent("knowledge.md", context)
        state.update_stage("knowledge", result)

    # 2. Architect Stage
    if state.state["next_stage"] == "architect":
        print("Invoking Architect Agent...")
        with open(state.epic_dir / "knowledge.json", "r") as f:
            knowledge_ctx = f.read()
        context = f"Epic: {epic_id}\nDescription: {description}\nKnowledge:\n{knowledge_ctx}"
        result = invoke_agent("architect.md", context)
        state.update_stage("architect", result)

    # 3. Developer Stage
    if state.state["next_stage"] == "developer":
        print("Invoking Developer Agent...")
        with open(state.epic_dir / "knowledge.json", "r") as f:
            knowledge_ctx = f.read()
        with open(state.epic_dir / "architect.json", "r") as f:
            architect_ctx = f.read()
        context = f"Epic: {epic_id}\nDescription: {description}\nKnowledge:\n{knowledge_ctx}\nArchitect Plan:\n{architect_ctx}"
        result = invoke_agent("developer.md", context)
        state.update_stage("developer", result)

    # 4. Automation Stage
    if state.state["next_stage"] == "automation":
        runner = AutomationRunner(state)
        success = runner.run_all()
        # If automation fails, send it back to the developer in the state (though typically review handles this)
        # We will let the Reviewer look at it.
        state.update_stage("automation", {"status": "completed", "success": success, "next_stage": "review"})

    # 5. Review Stage
    if state.state["next_stage"] == "review":
        print("Invoking Reviewer Agent...")
        with open(state.epic_dir / "developer.json", "r") as f:
            dev_ctx = f.read()
        
        auto_logs = ""
        for log_file in state.automation_dir.glob("*.txt"):
            with open(log_file, "r") as f:
                auto_logs += f"\n--- {log_file.name} ---\n{f.read()[:2000]}" # truncate for context limits
                
        context = f"Epic: {epic_id}\nDeveloper Output:\n{dev_ctx}\nAutomation Logs:\n{auto_logs}"
        result = invoke_agent("review.md", context)
        state.update_stage("review", result)

    # 6. QA Stage
    if state.state["next_stage"] == "qa":
        print("Invoking QA Agent...")
        with open(state.epic_dir / "architect.json", "r") as f:
            arch_ctx = f.read()
        with open(state.epic_dir / "developer.json", "r") as f:
            dev_ctx = f.read()
        
        context = f"Epic: {epic_id}\nArchitect Plan:\n{arch_ctx}\nDeveloper Output:\n{dev_ctx}"
        result = invoke_agent("qa.md", context)
        state.update_stage("qa", result)

    print(f"Pipeline finished. Final State: {state.state['next_stage']}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="SDLC Orchestrator")
    parser.add_argument("epic_id", help="The Epic ID (e.g. IDE-TEST)")
    parser.add_argument("--desc", default="A mock epic for testing the SDLC orchestrator.", help="Epic description")
    
    args = parser.parse_args()
    run_pipeline(args.epic_id, args.desc)
