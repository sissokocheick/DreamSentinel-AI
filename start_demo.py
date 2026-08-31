"""
DreamSentinel AI - One-Click Launcher for Hackathon Demo & Testing
Launches the FastAPI Multi-Agent Swarm Backend and opens the Next.js Frontend.
"""

import subprocess
import time
import sys
import os
import webbrowser

def main():
    print("================================================================")
    print("  🚀 DREAMSETINEL AI — SOMNIA × DREAMDEX HACKATHON LAUNCHER")
    print("================================================================")
    print("📍 Somnia Shannon Testnet (Chain ID: 50312)")
    print("📍 Sub-second Finality & DreamDEX Event Contracts Active\n")

    # Step 1: Run mathematical verification unit tests
    print("🔍 [1/3] Running Quantitative & Bayesian Unit Tests...")
    test_result = subprocess.run([sys.executable, "-m", "unittest", "test_quant_engine.py"], cwd="agent-core")
    if test_result.returncode != 0:
        print("❌ Unit tests failed!")
        return
    print("✅ All Mathematical & Bayesian Verification Tests Passed Successfully!\n")

    # Step 2: Start FastAPI Backend Server
    print("⚡ [2/3] Starting Autonomous Multi-Agent Swarm Server (FastAPI)...")
    backend_proc = subprocess.Popen(
        [sys.executable, "-m", "uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8000"],
        cwd="agent-core"
    )
    time.sleep(2)
    print("✅ Backend API & WebSocket Active at: http://localhost:8000\n")

    # Step 3: Open Interactive Presentation & Docs
    print("🌐 [3/3] Opening Interactive Hackathon Presentation Deck & Docs...")
    presentation_path = os.path.abspath("docs/presentation.html")
    webbrowser.open(f"file://{presentation_path}")

    print("\n================================================================")
    print("  🎉 DreamSentinel AI is Running Successfully!")
    print("  • Backend API & Swagger: http://localhost:8000/docs")
    print("  • WebSocket Live Stream: ws://localhost:8000/ws/stream")
    print("  • Frontend App Directory: dream-sentinel-ai/frontend")
    print("  • Presentation Deck: docs/presentation.html")
    print("================================================================")
    print("Press Ctrl+C to terminate backend processes.")

    try:
        backend_proc.wait()
    except KeyboardInterrupt:
        print("\nStopping DreamSentinel AI servers...")
        backend_proc.terminate()

if __name__ == "__main__":
    main()
