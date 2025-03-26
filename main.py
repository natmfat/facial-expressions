from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

import model

api_app = FastAPI(name="api_app")


@api_app.get("/ping")
def root():
    return {"success": True, "message": "pcyc-facial-expressions is online"}


class Payload(BaseModel):
    img: str


@api_app.post("/predict/")
def predict(payload: Payload):
    predictions = model.predict(payload.img)

    if predictions is None:
        return {"success": False, "message": "Could not retrieve emotions"}

    return {
        "success": True,
        "predictions": predictions,
        "message": "Successfully retrieved emotions",
    }


app = FastAPI(name="app")

app.mount("/api", api_app)
app.mount("", StaticFiles(directory="static", html=True), name="static")
