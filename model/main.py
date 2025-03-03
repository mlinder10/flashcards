from mlx_lm import load, generate

# model, tokenizer = load("mlx-community/DeepSeek-R1-Distill-Qwen-7B")
model, tokenizer = load("mlx-community/Meta-Llama-3-8B-Instruct-4bit")
prompt = "hello"

if tokenizer.chat_template is not None:
    messages = [{"role": "user", "content": prompt}]
    prompt = tokenizer.apply_chat_template(
        messages, add_generation_prompt=True
    )

response = generate(model, tokenizer, prompt=prompt, verbose=True)
