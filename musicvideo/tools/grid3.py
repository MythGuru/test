import librosa, numpy as np, json
y, sr = librosa.load("/root/.claude/uploads/88d87364-34d8-5003-8eed-c7759e266b12/77754a45-TikTok_Famous_Wild.mp3", sr=22050, mono=True)
hop=128
oenv = librosa.onset.onset_strength(y=y, sr=sr, hop_length=hop)
tempo, beats = librosa.beat.beat_track(onset_envelope=oenv, sr=sr, hop_length=hop, start_bpm=127, tightness=400)
bt = librosa.frames_to_time(beats, sr=sr, hop_length=hop)
idx=np.arange(len(bt))
p=np.polyfit(idx,bt,3); sm=np.polyval(p,idx); r=bt-sm
print(len(bt), "resid std", r.std(), "max", abs(r).max(), "first", bt[:4], "last", bt[-3:])
bad=np.where(abs(r)>0.05)[0]; print("outliers", [(round(bt[i],2), round(r[i],3)) for i in bad[:30]])
# downbeat: low (kick) and snare at beat k mod 4
S=np.abs(librosa.stft(y,n_fft=2048,hop_length=hop)); f=librosa.fft_frequencies(sr=sr,n_fft=2048)
low=S[f<120].sum(0); sn=S[(f>1500)&(f<6000)].sum(0)
fr=sr/hop
def at(env,t): i=int(t*fr); return env[max(0,i-3):i+4].max()
for name,env in [('low',low),('snare',sn)]:
    sc=[np.mean([at(env,sm[i]) for i in range(k,len(sm),4) if 45<sm[i]<160]) for k in range(4)]
    print(name, np.round(np.array(sc)/max(sc),3))
json.dump({"raw":[round(float(x),4) for x in bt],"beats":[round(float(x),4) for x in sm], "poly":list(map(float,p))}, open("beats_smooth.json","w"))
