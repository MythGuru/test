import soundfile as sf, json
from faster_whisper import WhisperModel
a,sr = sf.read("song16k.wav", dtype="float32")
m = WhisperModel("medium.en", device="cpu", compute_type="int8", cpu_threads=4)
res={}
for s,e in [(82,112),(113,128),(127,143)]:
    seg = a[int(s*sr):int(e*sr)]
    out, _ = m.transcribe(seg, language="en", word_timestamps=True, beam_size=5, condition_on_previous_text=False, no_speech_threshold=0.95, log_prob_threshold=-3)
    print(f"--- {s}-{e}")
    lst=[]
    for x in out:
        print(f"[{x.start+s:7.2f}-{x.end+s:7.2f}] {x.text}", flush=True)
        lst.append({"start":x.start+s,"end":x.end+s,"text":x.text,"words":[{"w":w.word,"s":w.start+s,"e":w.end+s} for w in x.words]})
    res[f"{s}"]=lst
json.dump(res, open("gaps_words.json","w"), indent=1)
