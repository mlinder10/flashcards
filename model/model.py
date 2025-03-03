from mlx_lm import load, generate


MODELS = {
    "Llama-3": "mlx-community/Meta-Llama-3-8B-Instruct-4bit",
    "DeepSeek-R1": "mlx-community/DeepSeek-R1-Distill-Qwen-7B"
}


class LLM:
    def __init__(self, model_path: str = MODELS["Llama-3"]):
        self.model, self.tokenizer = load(model_path)

    def prompt(self, prompts: str, max_tokens: int = 128):
        if self.tokenizer.chat_template is not None:
            messages = [
                {"role": "system", "content": "You are a helpful AI assistant. Provide direct answers."},
            ] + list(map(lambda prompt: {"role": "user", "content": prompt}, prompts))
            prompt = self.tokenizer.apply_chat_template(
                messages,
                add_generation_prompt=False
            )
        return generate(self.model, self.tokenizer, prompt=prompt, verbose=False, max_tokens=max_tokens)
