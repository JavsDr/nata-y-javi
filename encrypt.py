"""Cifra las fotos con la clave del sitio.

Uso:  python3 encrypt.py "nueva-clave"
Lee private/plain/*.jpg y escribe img/*.bin + img/check.bin + secure.json.
La clave se normaliza igual que en script.js (minúsculas, sin espacios ni tildes).
"""
import hashlib, json, os, subprocess, sys, unicodedata, glob

ITER = 150000

def norm(p):
    p = unicodedata.normalize("NFD", p.lower())
    return "".join(c for c in p if not unicodedata.combining(c) and not c.isspace())

def enc(key, data):
    iv = os.urandom(16)
    out = subprocess.run(["openssl", "enc", "-aes-256-cbc", "-K", key.hex(), "-iv", iv.hex()],
                         input=data, capture_output=True, check=True).stdout
    return iv + out

pw = norm(sys.argv[1])
salt = os.urandom(16)
key = hashlib.pbkdf2_hmac("sha256", pw.encode(), salt, ITER, 32)
for old in glob.glob("img/*.bin"):
    os.remove(old)
for f in sorted(glob.glob("private/plain/*.jpg")):
    name = os.path.splitext(os.path.basename(f))[0]
    open(f"img/{name}.bin", "wb").write(enc(key, open(f, "rb").read()))
open("img/check.bin", "wb").write(enc(key, b"nata&javi"))
json.dump({"salt": salt.hex(), "iter": ITER}, open("secure.json", "w"))
print("ok:", len(glob.glob("img/*.bin")), "archivos cifrados")
