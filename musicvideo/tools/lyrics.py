import json, re
a=json.load(open('words_medium.json')); g=json.load(open('gaps_words.json'))
W=[(w['s'],w['e'],w['w'].strip()) for s in a for w in s['words']]
W+=[(w['s'],w['e'],w['w'].strip()) for k,l in g.items() for s in l for w in s['words']]
W.sort()
L = [
(0.72,4.6,"Tick-tock, tick-tock, blow up overnight"),
(7.88,11.3,"Viral, viral, if I get it right"),
(18.56,22.5,"Wake up, check my phone, before I check my face"),
(22.56,26.2,"47 likes, that's a total disgrace"),
(26.30,28.5,"Ring light on, it's retake number 12"),
(28.58,30.45,"Smile like I'm happy, put a filter on myself"),
(30.50,32.2,"15 seconds, that's the whole career"),
(32.28,34.3,"Teacher calls my name but I'm not really here"),
(34.34,36.1,"Phone in my lap, underneath the desk"),
(36.18,38.1,"Refresh, refresh, I can't give it a rest"),
(38.16,40.0,"Like it, share it, save it, stay"),
(40.04,41.9,"Don't you dare scroll past me today"),
(41.96,44.4,"Hold on... wait for it"),
(44.68,48.5,"I'm TikTok famous, I'm TikTok famous"),
(48.58,52.7,"Riding the algo, nobody can tame this"),
(52.74,56.5,"A million strangers know my bedroom walls"),
(56.64,59.8,"But nobody calls, nobody calls"),
(59.92,64.3,"I'm on your For You page, but I'm not in your contacts"),
(64.42,68.0,"A million followers and nobody texts back"),
(68.08,71.2,"TikTok famous, I'm TikTok famous"),
(71.34,75.8,"Nobody calls, nobody calls"),
(75.98,77.8,"Swipe, swipe, don't swipe me away"),
(77.88,79.7,"Swipe, swipe, I'm here every day"),
(79.78,81.6,"Swipe, swipe, don't swipe me away"),
(81.68,82.5,"Swipe"),
(91.00,92.9,"Group chat's quiet but my comments are loud"),
(92.98,94.8,"Strangers say I'm great, guess I'm making them proud"),
(94.88,96.5,"Mom yells dinner, I say one more take"),
(96.60,99.0,"Screen time says nine hours, that's gotta be a mistake"),
(99.04,101.0,"Gotta be extra, gotta be wild"),
(101.04,103.8,"Sold my soul for the views, I'm a child of the feed"),
(103.84,104.75,"I bleed for the need"),
(104.80,106.6,"Clout is my currency, comments my creed"),
(106.68,108.5,"Like it, share it, save it, stay"),
(108.60,111.5,"Don't you dare scroll past me today"),
(112.00,114.4,"Hold on... wait for it"),
(114.68,118.6,"I'm TikTok famous, I'm TikTok famous"),
(118.74,122.8,"Riding the algo, nobody can tame this"),
(122.88,126.4,"A million strangers know my bedroom walls"),
(126.52,129.8,"But nobody calls, nobody calls"),
(129.88,134.2,"I'm on your For You page, but I'm not in your contacts"),
(134.32,137.9,"A million followers and nobody texts back"),
(137.94,141.0,"TikTok famous, I'm TikTok famous"),
(141.10,145.2,"Nobody calls, nobody calls"),
(145.36,147.5,"Swipe, swipe, don't swipe me away"),
(147.66,149.4,"Swipe, swipe, I'm here every day"),
(149.46,151.4,"Swipe, swipe, don't swipe me away"),
(161.42,164.5,"It's 3 a.m., you're watching me cry"),
(164.58,167.8,"In a video I filmed five times"),
(167.92,170.6,"You comment, “this is so real”"),
(170.72,172.6,"And you keep scrolling"),
(173.28,174.6,"It was real"),
(175.38,177.5,"But what happens when the views run dry"),
(177.60,179.5,"When the next big thing catches every eye"),
(179.58,181.6,"Refresh, refresh, is anybody there?"),
(181.72,183.3,"300,000 followers in an empty chair"),
(183.34,185.1,"Deleted the app at a quarter to two"),
(185.12,187.1,"Downloaded it back by a quarter past two"),
(187.12,189.1,"Who am I when nobody's watching?"),
(189.20,191.0,"Who am I when the phone stops buzzing?"),
(191.76,195.5,"I'm TikTok famous, I'm TikTok famous"),
(195.62,199.4,"Riding the algo, nobody can tame this"),
(199.68,202.9,"A million strangers know my bedroom walls"),
(203.16,206.9,"But nobody calls, nobody calls"),
(207.00,211.1,"I'm on your For You page, but I'm not in your contacts"),
(211.24,215.0,"A million followers and nobody texts back"),
(215.18,218.9,"TikTok famous, am I still relevant?"),
(219.08,220.6,"TikTok famous"),
(222.28,224.4,"Swipe, swipe, don't swipe me away"),
(224.56,226.3,"Swipe, swipe, I'm here every day"),
(226.44,230.3,"Swipe, swipe, please don't swipe me away"),
(230.58,232.2,"TikTok"),
(233.80,237.1,"TikTok, TikTok, please don't stop"),
(237.32,240.0,"Viral, viral"),
]
norm=lambda s: re.sub(r"[^a-z0-9]","",s.lower())
out=[]; fallback=0
for s,e,txt in L:
    words=txt.split()
    cand=[w for w in W if s-0.08<=w[0]<e]
    times=None
    if len(cand)>=len(words):
        # greedy alignment by sequence
        j=0; t=[]
        for w in words:
            nw=norm(w)
            k=j
            while k<len(cand) and not (norm(cand[k][2])[:3]==nw[:3] and nw): k+=1
            if k<len(cand): t.append(cand[k][0]); j=k+1
            else: t.append(None)
        if all(x is not None for x in t) and all(t[i]<=t[i+1] for i in range(len(t)-1)): times=t
    if times is None:
        fallback+=1; d=(e-s)*0.85/len(words); times=[s+i*d for i in range(len(words))]
    out.append({"s":s,"e":e,"w":[[round(x,2),w] for x,w in zip(times,words)]})
print("lines",len(out),"fallback",fallback)
json.dump(out,open("lyrics.json","w"))
