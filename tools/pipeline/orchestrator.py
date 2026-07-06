import os
import sys
import json
import yaml
import urllib.request
import datetime
import subprocess
import time

# --- Setup Paths ---
WORKSPACE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
PIPELINE_DIR = os.path.join(WORKSPACE_DIR, "tools", "pipeline")
PROMPTS_DIR = os.path.join(WORKSPACE_DIR, "tools", "prompts")
CONFIG_FILE = os.path.join(PIPELINE_DIR, "config.yaml")
STAGES_FILE = os.path.join(PIPELINE_DIR, "stages.yaml")

# --- Load Configs ---
with open(CONFIG_FILE, "r") as f:
    config = yaml.safe_load(f)
with open(STAGES_FILE, "r") as f:
    stages = yaml.safe_load(f)

API_KEY = os.environ.get(config["openrouter"]["api_key_env_var"], "")
URL = config["openrouter"]["base_url"]
MAX_CALLS = config["openrouter"]["daily_quota_limit"]
USAGE_FILE = os.path.join(WORKSPACE_DIR, config["openrouter"]["usage_file"])
EPICS_DIR = os.path.join(WORKSPACE_DIR, config["pipeline"]["epics_dir"].lstrip("../"))

def check_quota():
    today = datetime.date.today().isoformat()
    if os.path.exists(USAGE_FILE):
        with open(USAGE_FILE, "r") as f:
            data = json.load(f)
    else:
        data = {"date": today, "calls": 0}
        
    if data.get("date") != today:
        data = {"date": today, "calls": 0}
        
    if data["calls"] >= MAX_CALLS:
        print(f"❌ [BLOCKED] Daily API quota exceeded ({MAX_CALLS}/{MAX_CALLS}) for {today}.")
        sys.exit(1)
    return data

def increment_quota(data):
    data["calls"] += 1
    with open(USAGE_FILE, "w") as f:
        json.dump(data, f)

def get_epic_dir(epic_id):
    path = os.path.join(EPICS_DIR, epic_id)
    os.makedirs(path, exist_ok=True)
    return path

def get_state(epic_id):
    state_file = os.path.join(get_epic_dir(epic_id), "state.json")
    if os.path.exists(state_file):
        with open(state_file, "r") as f:
            return json.load(f)
    return {"current_stage": "knowledge", "history": []}

def save_state(epic_id, state):
    state_file = os.path.join(get_epic_dir(epic_id), "state.json")
    with open(state_file, "w") as f:
        json.dump(state, f, indent=2)

def generate_dashboard(epic_id, state):
    epic_dir = get_epic_dir(epic_id)
    dash_path = os.path.join(epic_dir, "dashboard.html")
    
    html = f"""<html>
<head>
    <title>Pipeline Dashboard: {epic_id}</title>
    <style>body {{ font-family: system-ui, sans-serif; padding: 20px; }} .stage {{ margin-bottom: 20px; padding: 10px; border: 1px solid #ccc; border-radius: 5px; }}</style>
</head>
<body>
    <h1>SDLC Pipeline: {epic_id}</h1>
    <p><strong>Current Stage:</strong> {state['current_stage']}</p>
    <hr/>
"""
    for entry in reversed(state.get("history", [])):
        html += f"""
    <div class="stage">
        <h3>Stage: {entry['stage']}</h3>
        <p><strong>Status:</strong> {entry.get('status', 'N/A')}</p>
        <p><strong>Time:</strong> {entry.get('timestamp')}</p>
        <p><strong>Model:</strong> {entry.get('model', 'N/A')}</p>
        <p><strong>Duration:</strong> {entry.get('duration_sec', 0)}s</p>
    </div>
"""
    html += "</body></html>"
    with open(dash_path, "w") as f:
        f.write(html)

def run_automation(epic_id, stage_config):
    auto_dir = os.path.join(get_epic_dir(epic_id), "automation")
    os.makedirs(auto_dir, exist_ok=True)
    
    print("⚙️ Running Automation Layer...")
    success_all = True
    for cmd_def in stage_config.get("commands", []):
        print(f"  -> Executing: {cmd_def['name']} ({cmd_def['cmd']})")
        out_file = os.path.join(auto_dir, cmd_def['output_file'])
        
        try:
            result = subprocess.run(
                cmd_def['cmd'],
                shell=True,
                cwd=WORKSPACE_DIR,
                capture_output=True,
                text=True
            )
            with open(out_file, "w") as f:
                f.write(f"--- STDOUT ---\n{result.stdout}\n\n--- STDERR ---\n{result.stderr}")
                
            if result.returncode != 0:
                print(f"     ❌ Failed (Code {result.returncode})")
                success_all = False
            else:
                print(f"     ✅ Success")
        except Exception as e:
            print(f"     ❌ Exception: {e}")
            with open(out_file, "w") as f:
                f.write(str(e))
            success_all = False
            
    return success_all

def query_openrouter(system_prompt, user_prompt, model):
    system_prompt += "\n\nCRITICAL INSTRUCTION: You must respond in pure JSON format matching this schema:\n"
    system_prompt += '{\n  "status": "approved" | "rejected",\n  "severity": "none" | "low" | "high",\n  "summary": "...",\n  "issues": ["..."]\n}\n'
    
    data = {
        "model": model,
        "response_format": {"type": "json_object"},
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
    
    start_time = time.time()
    try:
        with urllib.request.urlopen(req) as response:
            result = json.loads(response.read().decode('utf-8'))
            duration = time.time() - start_time
            content = result['choices'][0]['message']['content']
            usage = result.get('usage', {})
            try:
                parsed = json.loads(content)
            except:
                # Fallback if model ignored json_object
                parsed = {"status": "rejected", "summary": "Failed to parse JSON from model", "raw": content}
            
            return parsed, duration, usage
    except Exception as e:
        print(f"❌ API Error: {e}")
        if hasattr(e, 'read'):
            print(e.read().decode('utf-8'))
        sys.exit(1)

def run_pipeline(epic_id, auto=False):
    state = get_state(epic_id)
    quota = check_quota()
    
    while True:
        current = state["current_stage"]
        if current == "done":
            print("🎉 Pipeline complete for", epic_id)
            break
            
        stage_config = stages.get(current)
        if not stage_config:
            print(f"❌ Unknown stage: {current}")
            break
            
        print(f"\n🚀 === Stage: {current.upper()} ===")
        
        # Manual Gate
        if stage_config.get("is_manual"):
            print("✋ Paused for manual Developer intervention.")
            if auto:
                print("Auto mode: Exiting so Developer can work. Run script again to advance.")
                break
            else:
                resp = input("Type 'continue' when ready to advance to automation, or 'exit' to quit: ")
                if resp.lower() == 'continue':
                    state["current_stage"] = stage_config["on_success"]
                    save_state(epic_id, state)
                    continue
                else:
                    break
                
        # Automation Gate
        if stage_config.get("is_automation"):
            success = run_automation(epic_id, stage_config)
            next_stage = stage_config["on_success"] if success else stage_config.get("on_failure", "developer")
            
            state["history"].append({
                "stage": current,
                "status": "approved" if success else "rejected",
                "timestamp": datetime.datetime.now().isoformat()
            })
            state["current_stage"] = next_stage
            save_state(epic_id, state)
            generate_dashboard(epic_id, state)
            
            if not success:
                print("🛑 Automation failed. Looping back to", next_stage)
                break
            continue

        # AI Agent Gate
        prompt_path = os.path.join(WORKSPACE_DIR, stage_config["prompt"])
        if not os.path.exists(prompt_path):
            print(f"❌ Prompt missing: {prompt_path}")
            break
            
        with open(prompt_path, "r") as f:
            system_prompt = f.read()
            
        epic_dir = get_epic_dir(epic_id)
        user_prompt = f"Analyze {epic_id}.\n\n"
        
        # Feed previous markdown outputs
        for s in stages.keys():
            if s == current: break
            out_md = os.path.join(epic_dir, f"{s}.md")
            if os.path.exists(out_md):
                with open(out_md, "r") as f:
                    user_prompt += f"\n--- {s.upper()} CONTEXT ---\n" + f.read()
                    
        # Feed automation outputs if available
        auto_dir = os.path.join(epic_dir, "automation")
        if os.path.exists(auto_dir):
            for f_name in os.listdir(auto_dir):
                with open(os.path.join(auto_dir, f_name), "r") as f:
                    user_prompt += f"\n--- AUTOMATION: {f_name} ---\n" + f.read()

        print("🧠 Querying agent...")
        model = stage_config.get("model", config["openrouter"]["default_model"])
        result_json, duration, usage = query_openrouter(system_prompt, user_prompt, model)
        increment_quota(quota)
        
        # Save output
        out_md = os.path.join(epic_dir, f"{current}.md")
        with open(out_md, "w") as f:
            f.write(json.dumps(result_json, indent=2))
            
        # Log History
        status = result_json.get("status", "rejected").lower()
        state["history"].append({
            "stage": current,
            "status": status,
            "timestamp": datetime.datetime.now().isoformat(),
            "model": model,
            "duration_sec": round(duration, 2),
            "tokens": usage
        })
        
        print(f"Result: {status.upper()}")
        
        # Human Approval
        if stage_config.get("require_approval") and status == "approved":
            print(f"🟡 {current.upper()} requires HUMAN APPROVAL.")
            if auto:
                print("Auto mode: Automatically approved.")
            else:
                resp = input("Type 'approve' to proceed, or anything else to reject: ")
                if resp.lower() != 'approve':
                    status = "rejected"
        
        # Transition
        if status == "approved":
            state["current_stage"] = stage_config.get("on_success", "done")
        else:
            state["current_stage"] = stage_config.get("on_failure", "developer")
            print(f"🛑 Stage rejected. Looping back to {state['current_stage']}")
            
        save_state(epic_id, state)
        generate_dashboard(epic_id, state)
        
        if status != "approved":
            break

if __name__ == "__main__":
    if len(sys.argv) < 3 or "--epic" not in sys.argv:
        print("Usage: python orchestrator.py --epic <EPIC_ID> [--auto]")
        sys.exit(1)
        
    epic_idx = sys.argv.index("--epic") + 1
    epic_id = sys.argv[epic_idx]
    auto_mode = "--auto" in sys.argv
    
    run_pipeline(epic_id, auto=auto_mode)
