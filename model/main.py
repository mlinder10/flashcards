from mlx_lm import load, generate

# model, tokenizer = load("mlx-community/DeepSeek-R1-Distill-Qwen-7B")
model, tokenizer = load("mlx-community/Meta-Llama-3-8B-Instruct-4bit")
prompt = """
I'm going to send you a course syllabus.
I'd like you to generate flashcards to teach the course material.
Please respond in the following json format: [{ front: string, back: string }].
        Your response string should not include any markdown formatting.
        Please be sure to generate flashcards related to the course content, not the course syllabus.
        You will need to use external resources and hypothesize the specifics of the course.
        
        Course Syllabus:
"""

with open("./model/syllabus.txt", "r") as f:
    syllabus = f.read()

if tokenizer.chat_template is not None:
    messages = [
        {"role": "system", "content": "You are a helpful AI assistant. Provide direct answers."},
        {"role": "user", "content": prompt + syllabus}
    ]
    prompt = tokenizer.apply_chat_template(
        messages, add_generation_prompt=False
    )
response = generate(model, tokenizer, prompt=prompt, max_tokens=256, verbose=True)
