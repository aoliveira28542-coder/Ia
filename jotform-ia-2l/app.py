from fastapi import FastAPI
from pydantic import BaseModel
import uuid
import json
import os

app = FastAPI()

STATUS_DIR = "queue/status"
os.makedirs(STATUS_DIR, exist_ok=True)

class Request(BaseModel):
    prompt: str

@app.post("/generate")
def generate(data: Request):

    job_id = str(uuid.uuid4())

    job = {
        "id": job_id,
        "prompt": data.prompt,
        "status": "queued",
        "progress": 0
    }

    with open(f"{STATUS_DIR}/{job_id}.json", "w") as f:
        json.dump(job, f)

    return job


@app.get("/status/{job_id}")
def status(job_id: str):

    path = f"{STATUS_DIR}/{job_id}.json"

    if not os.path.exists(path):
        return {"error": "not found"}

    with open(path) as f:
        return json.load(f)
