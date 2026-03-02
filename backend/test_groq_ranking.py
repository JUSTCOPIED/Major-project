import os
import json
from groq import Groq

client = Groq(api_key=os.getenv("GROQ_API_KEY") or "")
prompt = "Return exactly a JSON list of integers [1, 2, 3] and nothing else."
completion = client.chat.completions.create(
    model="llama-3.3-70b-versatile",
    messages=[{"role": "user", "content": prompt}]
)
print(completion.choices[0].message.content)
