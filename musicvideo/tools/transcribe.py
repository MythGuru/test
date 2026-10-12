import json, sys
from faster_whisper import WhisperModel
m = WhisperModel(sys.argv[2], device="cpu", compute_type="int8", cpu_threads=4)
import soundfile as sf; a,_ = sf.read(sys.argv[1], dtype="float32")
segs, info = m.transcribe(a, language="en", word_timestamps=True, vad_filter=False, beam_size=5, condition_on_previous_text=False)
out=[]
for s in segs:
    out.append({"start":s.start,"end":s.end,"text":s.text,"words":[{"w":w.word,"s":w.start,"e":w.end,"p":w.probability} for w in (s.words or [])]})
    print(f"[{s.start:7.2f}-{s.end:7.2f}] {s.text}", flush=True)
json.dump(out, open(sys.argv[3],"w"), indent=1)
