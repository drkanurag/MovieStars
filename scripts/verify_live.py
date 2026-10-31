import urllib.request
import time

time.sleep(15)
try:
    resp = urllib.request.urlopen("https://movie-stars-kappa.vercel.app/celebs", timeout=30)
    print("Celebs Status:", resp.status)
    content = resp.read().decode("utf-8")
    print("Found Celebrities text:", "Celebrities" in content or "STARS DIRECTORY" in content)
except Exception as e:
    print("Error:", e)

try:
    resp2 = urllib.request.urlopen("https://movie-stars-kappa.vercel.app/", timeout=30)
    print("Home Status:", resp2.status)
    content2 = resp2.read().decode("utf-8")
    print("Found Light/Dark Toggle:", "light_mode" in content2 or "moviestars_theme" in content2)
except Exception as e:
    print("Error:", e)

