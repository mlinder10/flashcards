from flask import Flask, request
from model import LLM, MODELS

app = Flask(__name__)

model = LLM(MODELS["Llama-3"])


@app.route("/", methods=["POST"])
def prompt_endpoint():
    body = request.json
    prompts = body.get("prompts")
    token_limit = body.get("tokenLimit", 128)
    response = model.prompt(prompts, max_tokens=token_limit)
    return {"response": response}, 200


if __name__ == "__main__":
    app.run(debug=True)
