"""ul-app server.

Serves the built React (Vite) frontend from ./dist and exposes a download
route for large files stored in a Unity Catalog volume (files over 50 MB
cannot be part of the app source code).
"""

import os
import subprocess
from pathlib import Path
from urllib.parse import quote

import uvicorn
from databricks.sdk import WorkspaceClient
from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse, StreamingResponse

BASE_DIR = Path(__file__).resolve().parent
DIST_DIR = BASE_DIR / "dist"

# Unity Catalog volume that holds the large source files for this app
VOLUME_PATH = os.environ.get("UL_APP_FILES_VOLUME", "/Volumes/r2a/journal/ul_app_files").rstrip("/")

# Allow-list of downloadable files: key used in the URL -> file name in the volume
VOLUME_FILES = {
    "chep-accrual": "October 2026 CHEP Accrual.xlsx",
    "wh-accruals-sop": "EU_Deliver_WH_Accruals_V5_check2.docx",
}

CHUNK_SIZE = 1024 * 1024  # 1 MB

app = FastAPI(title="ul-app")
_ws: WorkspaceClient | None = None


def workspace() -> WorkspaceClient:
    # Uses the app service principal credentials injected by Databricks Apps
    global _ws
    if _ws is None:
        _ws = WorkspaceClient()
    return _ws


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.get("/api/files/{file_key}")
def download_volume_file(file_key: str):
    file_name = VOLUME_FILES.get(file_key)
    if not file_name:
        raise HTTPException(status_code=404, detail="Unknown file")
    path = f"{VOLUME_PATH}/{file_name}"
    try:
        resp = workspace().files.download(path)
    except Exception as exc:  # surface volume / permission problems clearly
        raise HTTPException(status_code=502, detail=f"Could not read {path}: {exc}")

    stream = resp.contents

    def iter_chunks():
        try:
            while True:
                chunk = stream.read(CHUNK_SIZE)
                if not chunk:
                    break
                yield chunk
        finally:
            stream.close()

    headers = {"Content-Disposition": f"attachment; filename*=UTF-8''{quote(file_name)}"}
    if getattr(resp, "content_length", None):
        headers["Content-Length"] = str(resp.content_length)
    return StreamingResponse(
        iter_chunks(),
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers=headers,
    )


@app.get("/{full_path:path}")
def spa(full_path: str):
    # Serve built static files (assets, /data/... from public/), else index.html for client routes
    if full_path:
        candidate = (DIST_DIR / full_path).resolve()
        if candidate.is_file() and DIST_DIR in candidate.parents:
            return FileResponse(candidate)
    index = DIST_DIR / "index.html"
    if not index.is_file():
        raise HTTPException(status_code=503, detail="Frontend not built")
    return FileResponse(index)


def ensure_frontend_built():
    # Databricks Apps normally runs `npm install` + `npm run build` during the build step
    if (DIST_DIR / "index.html").is_file():
        return
    if not (BASE_DIR / "node_modules").exists():
        print("Installing dependencies...")
        subprocess.run(["npm", "install"], check=True, cwd=BASE_DIR)
    print("Building the app...")
    subprocess.run(["npm", "run", "build"], check=True, cwd=BASE_DIR)


if __name__ == "__main__":
    ensure_frontend_built()
    # Databricks Apps injects DATABRICKS_APP_PORT — always use it
    port = int(os.environ.get("DATABRICKS_APP_PORT", "8000"))
    print(f"Starting server on port {port} (volume: {VOLUME_PATH})...")
    uvicorn.run(app, host="0.0.0.0", port=port)
