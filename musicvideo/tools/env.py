import librosa, numpy as np, json
y, sr = librosa.load("/root/.claude/uploads/88d87364-34d8-5003-8eed-c7759e266b12/77754a45-TikTok_Famous_Wild.mp3", sr=22050, mono=True)
FPS=30; hop=int(sr/FPS)
S=np.abs(librosa.stft(y,n_fft=2048,hop_length=hop)); f=librosa.fft_frequencies(sr=sr,n_fft=2048)
low=S[f<130].sum(0); hi=S[(f>2000)].sum(0)
rms=librosa.feature.rms(y=y,frame_length=2048,hop_length=hop)[0]
def norm(x,p=98): x=x/np.percentile(x,p); return np.clip(x,0,1)
# kick transient: positive flux in low band
flux=np.maximum(0,np.diff(low,prepend=low[0])); kick=norm(flux,99)
# smoothed loudness 0..1
from numpy.lib.stride_tricks import sliding_window_view
def smooth(x,k): 
    w=np.ones(k)/k; return np.convolve(x,w,mode='same')
loud=norm(smooth(rms,9),99)
hif=norm(np.maximum(0,np.diff(hi,prepend=hi[0])),99)
q=lambda a:[int(round(v*99)) for v in a]
json.dump({"fps":FPS,"kick":q(kick),"loud":q(loud),"hat":q(hif)},open("env.json","w"))
print(len(kick))
