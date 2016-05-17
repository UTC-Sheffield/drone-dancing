import requests

filename = 'songs/DJ Casper - Cha Cha Slide.mp3'
url = 'http://devapi.gracenote.com/timeline/api/1.0/audio/extract/'

req = requests.post(url, files={
                                  "audio_file": open(filename, 'rb')
                               }
)

print(req) 
