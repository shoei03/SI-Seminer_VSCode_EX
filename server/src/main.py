from fastapi import FastAPI
import change

app = FastAPI()

@app.get("/")
async def root() -> dict:
  return {"response":"Put the code you want to convert in the URL."}

@app.get("/{slow_code_plain}")
async def change_code(slow_code_plain: str) -> dict:
    cc = change.ChangeCode(slow_code_plain)
    fast_code_plain = cc.main()
    return {"response": fast_code_plain}
