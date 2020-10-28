#!C:\Users\Matej\AppData\Local\Programs\Python\Python38\python.exe
import requests
import sys
import re
import json

print()
query = sys.stdin.read()
USER_AGENT = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:79.0) Gecko/20100101 Firefox/79.0"}
url = f"https://www.google.com/search?q={query}&source=lnms&tbm=isch"
response = requests.get(url=url, headers=USER_AGENT).text
pattern = "\[\"https://.*\.jpg\",[0-9]+,[0-9]+\]"
images = re.findall(pattern, response)
to_return = {}
for i, img in enumerate(images[:3]):
    to_return[i] = eval(img)[0]
print(json.dumps(to_return))
