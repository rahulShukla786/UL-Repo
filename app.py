import subprocess
import sys
import os

if __name__ == "__main__":
    # Databricks Apps injects DATABRICKS_APP_PORT — always use it
    port = os.environ.get("DATABRICKS_APP_PORT", "8000")

    # Install dependencies if needed
    if not os.path.exists("node_modules"):
        print("Installing dependencies...")
        subprocess.run(["npm", "install"], check=True)

    # Build the app
    print("Building the app...")
    subprocess.run(["npm", "run", "build"], check=True)

    # Serve via preview on the correct port
    print(f"Starting preview server on port {port}...")
    subprocess.run(
        ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", port],
        check=True,
    )
