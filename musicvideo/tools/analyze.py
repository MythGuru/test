import librosa, numpy as np, json
y, sr = librosa.load("/root/.claude/uploads/88d87364-34d8-5003-8eed-c7759e266b12/77754a45-TikTok_Famous_Wild.mp3", sr=22050, mono=True)
dur = len(y)/sr
hop=512
oenv = librosa.onset.onset_strength(y=y, sr=sr, hop_length=hop)
tempo, beats = librosa.beat.beat_track(onset_envelope=oenv, sr=sr, hop_length=hop, tightness=120)
bt = librosa.frames_to_time(beats, sr=sr, hop_length=hop)
print("dur", dur, "tempo", tempo, "nbeats", len(bt))
ib = np.diff(bt); print("ibi median", np.median(ib), "std", ib.std(), "first beats", bt[:8])
rms = librosa.feature.rms(y=y, hop_length=hop)[0]
t = librosa.frames_to_time(np.arange(len(rms)), sr=sr, hop_length=hop)
# loudness per second
for s in range(0, int(dur), 4):
    m = (t>=s)&(t<s+4)
    print(f"{s:4d}s rms {rms[m].mean():.3f}", end=" | " if (s//4)%4!=3 else "\n")
print()
# bass / kick band energy
S = np.abs(librosa.stft(y, n_fft=2048, hop_length=hop))
freqs = librosa.fft_frequencies(sr=sr, n_fft=2048)
low = S[(freqs<150)].sum(0); mid=S[(freqs>=150)&(freqs<2000)].sum(0); high=S[freqs>=4000].sum(0)
# sections: novelty from chroma+mfcc recurrence
mf = librosa.feature.mfcc(y=y, sr=sr, hop_length=hop, n_mfcc=13)
ch = librosa.feature.chroma_cqt(y=y, sr=sr, hop_length=hop)
feat = np.vstack([librosa.util.normalize(mf,axis=1), ch])
bsync = librosa.util.sync(feat, beats)
bounds = librosa.segment.agglomerative(bsync, 14)
bound_t = bt[np.clip(bounds,0,len(bt)-1)]
print("section bounds", np.round(bound_t,2))
json.dump({"dur":dur,"tempo":float(np.atleast_1d(tempo)[0]),"beats":[round(float(x),3) for x in bt],
 "rms":[round(float(x),4) for x in rms[::2]], "low":[round(float(x),2) for x in (low/low.max())[::2]],
 "high":[round(float(x),3) for x in (high/high.max())[::2]], "fps": sr/hop/2,
 "bounds":[round(float(x),2) for x in bound_t]}, open("analysis.json","w"))
