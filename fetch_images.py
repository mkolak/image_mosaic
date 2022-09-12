#!C:\Users\Matej\AppData\Local\Programs\Python\Python38\python.exe
import requests
import sys
import re
import json
from pprint import pprint

print()
query = sys.stdin.read()
NUM_OF_IMGS = 3
USER_AGENT = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:79.0) Gecko/20100101 Firefox/79.0",
}

cookies = {"CONSENT": "YES+shp.gws-20210330-0-RC1.de+FX+412"}
image_ext = [
    ".jpg",
    ".jpeg",
    ".jpe",
    ".jif",
    ".jfif",
    ".jfi",
    ".png",
    ".gif",
    ".tiff",
    ".tif",
    ".heif",
]

url = f"https://www.google.hr/search?q={query}&hl=en&tbm=isch&source=hp&biw=1920&bih=941&ei=y0AfY5bwOriFhbIP7vyJqA4&iflsig=AJiK0e8AAAAAYx9O2165PN77GWpNV_O1tX49HhaTf_s8&ved=0ahUKEwjWgeGTuo_6AhW4QkEAHW5-AuUQ4dUDCAc&uact=5&oq=matej&gs_lcp=CgNpbWcQAzIFCAAQgAQyBQgAEIAEMgUIABCABDIFCAAQgAQyBQgAEIAEMgUIABCABDIFCAAQgAQyBQgAEIAEMgUIABCABDIFCAAQgARQiwVYsAdgugloAHAAeACAAUuIAeACkgEBNZgBAKABAaoBC2d3cy13aXotaW1nsAEA&sclient=img"
response = requests.get(url=url, headers=USER_AGENT, cookies=cookies).text
pattern = '\["https://.*\.jpg",[0-9]+,[0-9]+\]'
images = re.findall(pattern, response)[0]
urls = []
follow = False
current_word = ""

for symb in images[:-100]:
    if len(urls) == NUM_OF_IMGS:
        break
    if follow and symb != '"':
        current_word += symb
        continue

    if follow and symb == '"':
        if current_word[-4:] in image_ext or current_word[-5:] in image_ext:
            urls.append(current_word)
        follow = False
        current_word = ""
        continue

    if symb == "[" and current_word == "":
        current_word = "["
    elif symb == '"' and current_word == "[":
        current_word = '["'
    elif symb == "h" and current_word == '["':
        current_word = '["h'
    elif symb == "t" and current_word == '["h':
        current_word = '["ht'
    elif symb == "t" and current_word == '["ht':
        current_word = '["htt'
    elif symb == "p" and current_word == '["htt':
        current_word = "http"
        follow = True

print(json.dumps(dict(enumerate(urls))))
