(function(){
const $ = s => document.querySelector(s);
const esc = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const pick = a => a[Math.floor(Math.random()*a.length)];
const shuffle = a => { a = a.slice(); for (let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];} return a; };

/* ---------- the crew ----------
   Five mascots, each a standalone SVG file in assets/ traced straight from
   the user's Figma Make file ("Boli Basha — Water Theme Cartoon Characters"):
   assets/finn.svg (clownfish), assets/ollie.svg (octopus), assets/luna.svg
   (jellyfish), assets/pip.svg (teal crab), assets/sandy.svg (turtle).
   Roles/personalities below reuse the user's original five character briefs,
   now voiced by these five creatures. */
const CRITTER_IDS = ['finn','ollie','luna','pip','sandy'];
const CREW = {
  luna:{name:'Luna', tag:'The warm & wise guide',
    role:'Nurturing and deeply rooted, with timeless wisdom. The comforting voice that shows you how the language lives in real homes.',
    does:['Daily blessings','Streak saver','Hospitality phrases','Proverbs']},
  ollie:{name:'Ollie', tag:'The precision pro',
    role:'Sharp, minimal and high-performing. Focuses on absolute accuracy so mistakes never turn into mix-ups.',
    does:['Answer check','Grammar tips','Spelling notes','Contextual phrasing']},
  finn:{name:'Finn', tag:'The friendly guide',
    role:'Approachable, encouraging and empathetic. A peer-like companion who keeps learning low-pressure and fun — introducing new words and running the everyday listening drills.',
    does:['New words','Listening drills','Everyday chat','Encouragement']},
  pip:{name:'Pip', tag:'The playful mascot',
    role:'Hyper, curious and cheeky. Keeps things light and gamified.',
    does:['Quizzes','Match pairs','Celebrations','Streak nudges']},
  sandy:{name:'Sandy', tag:'The revision & streak coach',
    role:'Calm, patient and a little wise. Resurfaces words you’ve already learned before you forget them, and keeps your streak safe on slow days.',
    does:['Recap rounds','Spaced review','Streak protection']}
};
const CREW_ORDER = ['luna','ollie','finn','pip','sandy'];
function avatar(id, size){
  size = size || 44;
  if (CRITTER_IDS.includes(id)) return '<span class="av critter" data-mascot="'+id+'" style="width:'+size+'px;height:'+size+'px"><img src="assets/'+id+'.svg" alt="'+CREW[id].name+'"></span>';
  return '<span class="av" style="--c:#999;width:'+size+'px;height:'+size+'px;font-size:'+Math.round(size*.46)+'px">?</span>';
}

/* ---------- course content ----------
   Every unit word is stored as [spokenForm, English-letter spelling].
   The app always DISPLAYS the English-letter spelling; the spokenForm is only
   ever handed to the speech synthesiser, so the voice you hear is the real
   regional language even though every screen reads in English letters. */
const UNITS = [
  {title:'Say hello',    guide:'finn', en:['Hello','Thank you','Yes','No','How are you?',"I'm fine"]},
  {title:'Count to ten', guide:'pip',  en:['One · 1','Two · 2','Three · 3','Four · 4','Five · 5','Ten · 10']},
  {title:'My family',    guide:'luna', en:['Mother','Father','Big brother','Big sister','Grandmother','Friend']},
  {title:'At the table', guide:'finn', en:['Water','Rice','Milk','Mango','Banana','Curd']}
];
const LESSON_NAMES = ['New words','More words',"Pip's quiz"];

const LANGS = {
  te:{name:'Telugu', code:'TE', tts:'te-IN', where:'Andhra Pradesh · Telangana',
    units:[
      [['నమస్కారం','Namaskāram'],['ధన్యవాదాలు','Dhanyavādālu'],['అవును','Avunu'],['కాదు','Kādu'],['ఎలా ఉన్నారు?','Elā unnāru?'],['బాగున్నాను','Bāgunnānu']],
      [['ఒకటి','Okaṭi'],['రెండు','Reṇḍu'],['మూడు','Mūḍu'],['నాలుగు','Nālugu'],['ఐదు','Aidu'],['పది','Padi']],
      [['అమ్మ','Amma'],['నాన్న','Nānna'],['అన్నయ్య','Annayya'],['అక్క','Akka'],['నానమ్మ','Nānamma'],['స్నేహితుడు','Snēhituḍu']],
      [['నీళ్ళు','Nīḷḷu'],['అన్నం','Annam'],['పాలు','Pālu'],['మామిడి పండు','Māmiḍi paṇḍu'],['అరటి పండు','Araṭi paṇḍu'],['పెరుగు','Perugu']]],
    phrases:[['Please come in, sit down','రండి, కూర్చోండి','Raṇḍi, kūrcōṇḍi'],['Have you eaten?','భోజనం చేశారా?','Bhōjanam cēśārā?']],
    respect:'<b>Mīru</b> is the respectful “you” for elders and teachers; <b>nuvvu</b> is for friends. Adding <b>-ṇḍi</b> makes a request polite: <b>raṇḍi</b> means “please come”.',
    fact:'Almost every Telugu word ends in a vowel sound — that’s why travellers once called it “the Italian of the East”.'},
  kn:{name:'Kannada', code:'KN', tts:'kn-IN', where:'Karnataka',
    units:[
      [['ನಮಸ್ಕಾರ','Namaskāra'],['ಧನ್ಯವಾದಗಳು','Dhanyavādagaḷu'],['ಹೌದು','Haudu'],['ಇಲ್ಲ','Illa'],['ಹೇಗಿದ್ದೀರಾ?','Hēgiddīrā?'],['ಚೆನ್ನಾಗಿದ್ದೀನಿ','Chennāgiddīni']],
      [['ಒಂದು','Ondu'],['ಎರಡು','Eraḍu'],['ಮೂರು','Mūru'],['ನಾಲ್ಕು','Nālku'],['ಐದು','Aidu'],['ಹತ್ತು','Hattu']],
      [['ಅಮ್ಮ','Amma'],['ಅಪ್ಪ','Appa'],['ಅಣ್ಣ','Aṇṇa'],['ಅಕ್ಕ','Akka'],['ಅಜ್ಜಿ','Ajji'],['ಸ್ನೇಹಿತ','Snēhita']],
      [['ನೀರು','Nīru'],['ಅನ್ನ','Anna'],['ಹಾಲು','Hālu'],['ಮಾವಿನ ಹಣ್ಣು','Māvina haṇṇu'],['ಬಾಳೆಹಣ್ಣು','Bāḷehaṇṇu'],['ಮೊಸರು','Mosaru']]],
    phrases:[['Please come in, sit down','ಬನ್ನಿ, ಕುಳಿತುಕೊಳ್ಳಿ','Banni, kuḷitukoḷḷi'],['Have you eaten?','ಊಟ ಆಯ್ತಾ?','Ūṭa āytā?']],
    respect:'<b>Nīvu</b> is the respectful “you”; <b>nīnu</b> is for close friends. <b>Banni</b> (“please come”) is the polite form of <b>bā</b>.',
    fact:'Kannada and Telugu are cousin languages — they grew from the same older tongue, so plenty of words sound alike.'},
  bn:{name:'Bengali', code:'BN', tts:'bn-IN', where:'West Bengal · Tripura',
    units:[
      [['নমস্কার','Nomoshkar'],['ধন্যবাদ','Dhonnobad'],['হ্যাঁ','Hyã'],['না','Na'],['কেমন আছেন?','Kemon achhen?'],['ভালো আছি','Bhalo achhi']],
      [['এক','Ek'],['দুই','Dui'],['তিন','Tin'],['চার','Char'],['পাঁচ','Pãch'],['দশ','Dosh']],
      [['মা','Ma'],['বাবা','Baba'],['দাদা','Dada'],['দিদি','Didi'],['ঠাকুমা','Thakuma'],['বন্ধু','Bondhu']],
      [['জল','Jol'],['ভাত','Bhat'],['দুধ','Dudh'],['আম','Aam'],['কলা','Kola'],['দই','Doi']]],
    phrases:[['Please come in, sit down','আসুন, বসুন','Asun, bosun'],['Have you eaten?','খেয়েছেন?','Kheyechhen?']],
    respect:'<b>Apni</b> is the respectful “you”; <b>tumi</b> is for friends and family. The verb changes too: <b>asun</b> goes with apni, <b>esho</b> with tumi.',
    fact:'Bengali vowels shift a lot from their spelling — “Dhonnobad” has a softer “o” sound than the Hindi “Dhanyavad”.'},
  ml:{name:'Malayalam', code:'ML', tts:'ml-IN', where:'Kerala · Lakshadweep',
    units:[
      [['നമസ്കാരം','Namaskāram'],['നന്ദി','Nandi'],['അതെ','Athe'],['ഇല്ല','Illa'],['സുഖമാണോ?','Sukhamāṇō?'],['സുഖമാണ്','Sukhamāṇ']],
      [['ഒന്ന്','Onnu'],['രണ്ട്','Raṇṭu'],['മൂന്ന്','Mūnnu'],['നാല്','Nālu'],['അഞ്ച്','Añcu'],['പത്ത്','Pattu']],
      [['അമ്മ','Amma'],['അച്ഛൻ','Acchan'],['ചേട്ടൻ','Chēṭṭan'],['ചേച്ചി','Chēcchi'],['അമ്മൂമ്മ','Ammūmma'],['കൂട്ടുകാരൻ','Kūṭṭukāran']],
      [['വെള്ളം','Veḷḷam'],['ചോറ്','Chōṟu'],['പാൽ','Pāl'],['മാമ്പഴം','Māmpazham'],['വാഴപ്പഴം','Vāzhappazham'],['തൈര്','Thairu']]],
    phrases:[['Please come in, sit down','വരൂ, ഇരിക്കൂ','Varū, irikkū'],['Have you eaten?','ഭക്ഷണം കഴിച്ചോ?','Bhakṣaṇam kazhiccō?']],
    respect:'<b>Niṅṅaḷ</b> is the respectful (and plural) “you”; <b>nī</b> is for close friends. Elders are often called <b>chēṭṭan</b> / <b>chēcchi</b> even outside the family.',
    fact:'“Malayalam” is a palindrome — it reads the same forwards and backwards. Try it!'},
  or:{name:'Odia', code:'OD', tts:'or-IN', where:'Odisha',
    units:[
      [['ନମସ୍କାର','Namaskāra'],['ଧନ୍ୟବାଦ','Dhanyabāda'],['ହଁ','Hã'],['ନା','Nā'],['ଆପଣ କେମିତି ଅଛନ୍ତି?','Āpaṇa kemiti achhanti?'],['ମୁଁ ଭଲ ଅଛି','Mũ bhala achhi']],
      [['ଏକ','Eka'],['ଦୁଇ','Dui'],['ତିନି','Tini'],['ଚାରି','Chāri'],['ପାଞ୍ଚ','Pāñcha'],['ଦଶ','Dasha']],
      [['ମା','Mā'],['ବାପା','Bāpā'],['ବଡ଼ ଭାଇ','Baḍa bhāi'],['ବଡ଼ ଭଉଣୀ','Baḍa bhauṇī'],['ଜେଜେମା','Jejemā'],['ସାଙ୍ଗ','Sāṅga']],
      [['ପାଣି','Pāṇi'],['ଭାତ','Bhāta'],['କ୍ଷୀର','Khīra'],['ଆମ୍ବ','Āmba'],['କଦଳୀ','Kadaḷī'],['ଦହି','Dahi']]],
    phrases:[['Please come in, sit down','ଆସନ୍ତୁ, ବସନ୍ତୁ','Āsantu, basantu'],['Have you eaten?','ଖାଇଲେଣି?','Khāileṇi?']],
    respect:'<b>Āpaṇa</b> is the respectful “you”; <b>tumē</b> is for friends. Polite requests often end in <b>-ntu</b>: <b>āsantu</b> means “please come”.',
    fact:'Odia is one of India’s classical languages, with written records going back over 1,500 years.'},
  sa:{name:'Sanskrit', code:'SA', tts:'sa-IN', where:'The root of many Indian languages',
    units:[
      [['नमस्ते','Namastē'],['धन्यवादः','Dhanyavādaḥ'],['आम्','Ām'],['न','Na'],['त्वं कथम् असि?','Tvaṃ katham asi?'],['अहं कुशली अस्मि','Ahaṃ kuśalī asmi']],
      [['एकम्','Ēkam'],['द्वे','Dvē'],['त्रीणि','Trīṇi'],['चत्वारि','Catvāri'],['पञ्च','Pañca'],['दश','Daśa']],
      [['माता','Mātā'],['पिता','Pitā'],['अग्रजः','Agrajaḥ'],['अग्रजा','Agrajā'],['पितामही','Pitāmahī'],['मित्रम्','Mitram']],
      [['जलम्','Jalam'],['ओदनः','Ōdanaḥ'],['दुग्धम्','Dugdham'],['आम्रम्','Āmram'],['कदली','Kadalī'],['दधि','Dadhi']]],
    phrases:[['Please come in, sit down','एहि, उपविश','Ēhi, upaviśa'],['Have you eaten?','भवान् भोजनं कृतवान्?','Bhavān bhōjanaṃ kṛtavān?']],
    respect:'<b>Tvam</b> is used for friends and equals; <b>bhavān</b> / <b>bhavatī</b> is the respectful “you” for elders and teachers.',
    fact:'Sanskrit is the root many Indian languages borrow words from — you already know more Sanskrit than you think.'}
};
const LANG_ORDER = ['te','kn','bn','ml','or','sa'];

const BLESSINGS = [
  'Every word you learn opens a door into someone’s home.',
  'A lotus opens one petal at a time. So will your new language.',
  'Speak even if you make mistakes. Elders smile at the effort, not the grammar.',
  'Learn one word today and use it at dinner tonight.',
  'A language is a gift from your neighbours. Receive it with both hands.'
];
const PIP_NUDGES = ['Psst! Your streak is looking hungry.','Three minutes. That’s all I ask. Maybe four.','I learned a new word today. Your turn!','Tap the glowing circle. I dare you.'];
const PRAISE = {finn:['Nice! You’re getting it.','That’s right. Well done!','Yes! Keep going.'], pip:['Boom! Correct!','Nailed it!','Too easy for you!']};

/* ---------- levels ----------
   Account level derived from lifetime XP (spec §3.2). Levels 1-9 use the
   named thresholds below; level 10+ costs a flat +1200 XP each and is
   titled "Ocean Sage" with a roman numeral. */
const LEVEL_TITLES = ['Tide Pool Beginner','Shallow Water Swimmer','Reef Explorer','Current Rider','Coral Navigator','Deep Sea Diver','Pearl Collector','Current Master','Abyss Wanderer'];
const LEVEL_BASE_XP = [0,100,250,500,900,1400,2000,2800,3800];
function xpForLevel(level){ return level<=9 ? LEVEL_BASE_XP[level-1] : 3800 + (level-9)*1200; }
function levelForXP(xp){ let lvl=1; while(xpForLevel(lvl+1)<=xp) lvl++; return lvl; }
function toRoman(n){ const vals=[[10,'X'],[9,'IX'],[5,'V'],[4,'IV'],[1,'I']]; let r=''; vals.forEach(([v,s])=>{ while(n>=v){ r+=s; n-=v; } }); return r||'I'; }
function levelTitle(level){ return level<=9 ? LEVEL_TITLES[level-1] : 'Ocean Sage '+toRoman(level-9); }

/* ---------- badges (spec §3.7) ---------- */
const BADGE_META = [
  {id:'first', name:'First Steps', desc:'Finish your first lesson', icon:'🐚'},
  {id:'week', name:'Week One', desc:'Keep a 7-day streak', icon:'🔥'},
  {id:'century', name:'Century', desc:'Keep a 100-day streak', icon:'🏆'},
  {id:'perfectionist', name:'Perfectionist', desc:'10 lessons in a row at 100% accuracy', icon:'✨'},
  {id:'polyglot', name:'Polyglot-in-training', desc:'Reach crown 1 in three languages', icon:'🌐'},
  {id:'checkmate', name:'Checkmate', desc:'Win your first chess game', icon:'♞'},
  {id:'intune', name:'In Tune', desc:'Complete your first music sing-along', icon:'🎵'}
];

/* ---------- state ---------- */
const KEY = 'boli-bhasha-v3';
const dayStr = d => d.toISOString().slice(0,10);
const today = () => dayStr(new Date());
const yesterday = () => dayStr(new Date(Date.now()-864e5));
function demoState(){
  return {lang:'te', grade:6, xp:45, streak:3, longestStreak:3, lastDay:yesterday(), hearts:5, heartsDay:today(), refillDay:'',
    done:{te:{'0-0':true,'0-1':true}}, crowns:{}, badges:{}, perfectStreak:0, demo:true, tab:'learn'};
}
let S;
try { S = JSON.parse(localStorage.getItem(KEY)) || demoState(); } catch(e){ S = demoState(); }
if (!LANGS[S.lang]) S.lang = 'te';
if (S.tab === 'crew') S.tab = 'me';
if (!['learn','games','leaderboard','luna','me'].includes(S.tab)) S.tab = 'learn';
S.crowns = S.crowns || {};
S.badges = S.badges || {};
S.longestStreak = S.longestStreak || S.streak || 0;
S.perfectStreak = S.perfectStreak || 0;
function save(){ try{ localStorage.setItem(KEY, JSON.stringify(S)); }catch(e){} }
if (S.heartsDay !== today()){ S.hearts = 5; S.heartsDay = today(); }
if (S.lastDay !== today() && S.lastDay !== yesterday()) S.streak = 0;
const L = () => LANGS[S.lang];
const doneMap = () => (S.done[S.lang] = S.done[S.lang] || {});

/* ---------- crowns (spec §3.3) ---------- */
function crownsFor(lang, unit){ return (S.crowns[lang] && S.crowns[lang][unit]) || 0; }
function setCrown(lang, unit, n){ S.crowns[lang] = S.crowns[lang] || {}; S.crowns[lang][unit] = n; }
function checkBadges(){
  const totalDone = Object.values(S.done).reduce((n,m)=>n+Object.keys(m).length,0);
  if (totalDone>0) S.badges.first = true;
  if (S.longestStreak>=7) S.badges.week = true;
  if (S.longestStreak>=100) S.badges.century = true;
  if (S.perfectStreak>=10) S.badges.perfectionist = true;
  const langsWithCrown = LANG_ORDER.filter(k => Object.values(S.crowns[k]||{}).some(c=>c>=1));
  if (langsWithCrown.length>=3) S.badges.polyglot = true;
}
checkBadges();

/* ---------- speech ---------- */
let voices = [];
function loadVoices(){ try{ voices = speechSynthesis.getVoices() || []; }catch(e){ voices = []; } }
if ('speechSynthesis' in window){ loadVoices(); speechSynthesis.onvoiceschanged = loadVoices; }
const VOICE_PROFILES = {
  luna:{pitch:1.28, rate:.76, names:['Samantha','Aditi','Lekha']},
  ollie:{pitch:.84, rate:.88, names:['Daniel','Rishi','Alex']},
  finn:{pitch:1.08, rate:.94, names:['Karen','Veena','Moira']},
  pip:{pitch:1.42, rate:1.02, names:['Tara','Siri','Ava']},
  sandy:{pitch:.72, rate:.72, names:['Oliver','Rishi','Tom']}
};
function voiceFor(code, speaker){
  const c = code.toLowerCase(), profile = VOICE_PROFILES[speaker] || VOICE_PROFILES.finn;
  const locale = voices.filter(v => v.lang.replace('_','-').toLowerCase() === c || v.lang.toLowerCase().startsWith(c.slice(0,2)+'-') || v.lang.toLowerCase() === c.slice(0,2));
  return profile.names.reduce((found,name)=>found || locale.find(v=>v.name.toLowerCase().includes(name.toLowerCase())),null) || locale[0];
}
function hasVoice(){ return !!voiceFor(L().tts); }
function setSpeaking(speaker, active){
  document.querySelectorAll('.av[data-mascot]').forEach(el=>el.classList.toggle('speaking', active && el.dataset.mascot===speaker));
}
function speak(spokenForm, shownSpelling, speaker){
  speaker = speaker || 'finn';
  const v = voiceFor(L().tts, speaker);
  if (!v){ toast('No '+L().name+' voice on this device yet. Say it aloud: “'+shownSpelling+'”'); return; }
  try{
    speechSynthesis.cancel(); setSpeaking(speaker,true);
    const profile = VOICE_PROFILES[speaker] || VOICE_PROFILES.finn;
    const u = new SpeechSynthesisUtterance(spokenForm); u.voice = v; u.lang = v.lang; u.rate = profile.rate; u.pitch = profile.pitch; u.volume = .96;
    u.onend = u.onerror = ()=>setSpeaking(speaker,false);
    speechSynthesis.speak(u);
  }catch(e){ setSpeaking(speaker,false); }
}
let toastT;
function toast(msg){ let t = $('#toast'); if(!t){ t = document.createElement('div'); t.id='toast'; t.className='toast'; t.setAttribute('role','status'); document.body.appendChild(t);} t.textContent = msg; t.hidden=false; clearTimeout(toastT); toastT = setTimeout(()=>t.hidden=true, 3200); }

/* ---------- icons ---------- */
const I = {
  flame:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2c1 3.5 5.5 6 5.5 11a5.5 5.5 0 0 1-11 0c0-2.4 1.2-4 2.5-5 .1 1.6.8 2.8 2 3.3C10.5 8 11 5 12 2z"/></svg>',
  bolt:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M13.5 2 5 13.5h6L10 22l9-12h-6.2z"/></svg>',
  heart:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 21s-7.5-4.6-9.5-9.3C1 8 3.4 4.5 7 4.5c2 0 3.5 1.1 5 3 1.5-1.9 3-3 5-3 3.6 0 6 3.5 4.5 7.2C19.5 16.4 12 21 12 21z"/></svg>',
  check:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>',
  lock:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><rect x="5" y="10.5" width="14" height="10" rx="2.5" fill="currentColor" stroke="none"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/></svg>',
  star:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="m12 2.5 2.9 6 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.2 1.3-6.6-4.9-4.6 6.6-.8z"/></svg>',
  book:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 4.5A1.5 1.5 0 0 1 5.5 3H11v17H5.5A1.5 1.5 0 0 1 4 18.5zM13 3h5.5A1.5 1.5 0 0 1 20 4.5v14a1.5 1.5 0 0 1-1.5 1.5H13z"/></svg>',
  play:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 9.5h3.5L12 5v14l-4.5-4.5H4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M18 6a8.5 8.5 0 0 1 0 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  close:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>'
};

/* ---------- top bar ---------- */
function topBar(){
  return '<header class="top">'
    +'<button class="langchip" id="langchip" aria-label="Change language, currently '+L().name+'"><span class="glyph">'+L().code+'</span><b>'+L().name+'</b></button>'
    +'<div class="stats">'
    +'<span class="stat streak" title="Day streak">'+I.flame+S.streak+'</span>'
    +'<span class="stat xp" title="XP">'+I.bolt+S.xp+'</span>'
    +'<span class="stat hearts" title="Hearts">'+I.heart+S.hearts+'</span>'
    +'</div></header>';
}
const dayIndex = () => Math.floor(Date.now()/864e5);

/* ---------- learn tab ---------- */
function currentKey(){
  const d = doneMap();
  for (let u=0;u<UNITS.length;u++) for (let l=0;l<3;l++) if(!d[u+'-'+l]) return u+'-'+l;
  return null;
}
function renderLearn(){
  const d = doneMap(), cur = currentKey();
  let h = topBar();
  const nextLabel = cur ? LESSON_NAMES[+cur.split('-')[1]] : 'Review your reef';
  h += '<div class="ocean-hero"><div class="hero-row"><div><p class="eyebrow" style="color:rgba(255,255,255,.72);font-size:12px;letter-spacing:.1em;text-transform:uppercase;font-weight:700">Your reef · day '+S.streak+'</p><h1>Make waves in '+L().name+'</h1><p>Small lessons. Real voices. A whole ocean of words.</p></div>'+avatar('finn',58)+'</div>'
    +'<button class="hero-action" id="heroStart">'+nextLabel+' <span aria-hidden="true">→</span></button></div>';
  h += '<div class="daily-goal"><div class="daily-goal-copy"><span class="eyebrow">Today’s goal</span><b>Keep your streak afloat</b><span class="note">One short lesson is enough.</span></div><div class="goal-ring" aria-label="Streak day '+S.streak+'">'+S.streak+'<small>days</small></div></div>';
  if (S.demo){
    h += '<div class="card welcome">'+avatar('finn',40)+'<div class="grow"><p><b>Sample progress loaded.</b> Pick your school’s third language and grade to start fresh.</p></div><button class="linkbtn" id="setup">Set up</button></div>';
  }
  h += '<div class="card blessing">'+avatar('luna',44)+'<div><p class="who">Luna’s blessing</p><q>'+esc(BLESSINGS[dayIndex()%BLESSINGS.length])+'</q></div></div>';
  if (Object.keys(d).length >= 2){
    h += '<div class="card" style="display:flex;gap:12px;align-items:flex-start;margin-bottom:16px">'+avatar('sandy',44)
      +'<div style="flex:1;min-width:10em"><h3 style="font-size:17px">Sandy’s Recap</h3><p class="note" style="margin:4px 0 10px">Slow and steady — a quick round on words you’ve already learned, so they stick.</p>'
      +'<button class="btn ghost" id="recap">Start recap</button></div></div>';
  }
  UNITS.forEach((u,ui)=>{
    const unlocked = ui===0 || d[(ui-1)+'-2'];
    const words = L().units[ui].slice(0,3).map(w=>w[1]).join(' · ');
    const crowns = crownsFor(S.lang, ui);
    const crownRow = '<div class="crown-row" aria-label="'+crowns+' of 5 crowns">'+[0,1,2,3,4].map(i=>'<span class="crown-icon'+(i<crowns?' on':'')+'">'+I.star+'</span>').join('')+'</div>';
    h += '<section class="unit'+(unlocked?'':' locked')+'"><div class="unit-head"><div><p class="eyebrow">Unit '+(ui+1)+'</p><h2>'+u.title+'</h2><p class="preview">'+esc(words)+'</p>'+crownRow+'</div><div class="guide">'+avatar(u.guide,40)+'<div>'+CREW[u.guide].name+'</div></div></div><div class="nodes">';
    const offs = [0,56,-56];
    for (let l=0;l<3;l++){
      const k = ui+'-'+l, st = d[k] ? 'done' : (k===cur ? 'current' : 'locked');
      const icon = st==='done' ? I.check : st==='locked' ? I.lock : (l===2 ? I.star : I.book);
      h += '<div class="nodewrap" style="transform:translateX('+offs[l]+'px)">'
        +'<button class="node '+st+'" data-k="'+k+'" aria-label="Unit '+(ui+1)+', '+LESSON_NAMES[l]+(st==='locked'?' (locked)':st==='done'?' (done, practise again)':'')+'">'
        +(st==='current'?'<span class="start-tag">Start</span>':'')+icon+'</button>'
        +'<span class="node-label">'+LESSON_NAMES[l]+'</span></div>';
      if (st==='current') h += '<div class="pipnudge" style="transform:translateX('+(-offs[l]*.4)+'px)">'+avatar('pip',40)+'<p class="bubble">'+esc(PIP_NUDGES[dayIndex()%PIP_NUDGES.length])+'</p></div>';
    }
    h += '</div></section>';
  });
  if (!cur) h += '<div class="card" style="text-align:center;margin-bottom:24px"><h3>Course complete!</h3><p class="note">More units (school, colours, festivals) would slot in here.</p></div>';
  return h;
}

/* ---------- luna tab ---------- */
function renderLuna(){
  const Lg = L();
  let h = topBar() + '<h1 class="section-title">Luna’s Cove</h1><p class="lede">Phrases you’ll hear the moment you step into a '+Lg.name+'-speaking home — written in English letters, spoken the real way.</p><div class="stack">';
  Lg.phrases.forEach((p,i)=>{
    h += '<div class="card phrase"><p class="en">'+(i===0?'Welcoming a guest':'Showing you care')+'</p><p class="word">'+esc(p[2])+'</p><p class="tr">“'+esc(p[0])+'”</p>'
      +'<div class="row" style="margin-top:8px"><button class="iconbtn" data-say="'+i+'" aria-label="Hear it">'+I.play+'</button><span class="note">'+(i===0?'Said at the door, often before hello.':'Across India, asking whether you’ve eaten is a warm way of asking how you are.')+'</span></div></div>';
  });
  const refilled = S.refillDay === today();
  h += '<div class="card"><div class="row" style="align-items:flex-start">'+avatar('luna',44)+'<div style="flex:1;min-width:10em"><h3 style="font-size:19px">Streak saver</h3><p class="note" style="margin:4px 0 12px">Ran out of hearts? Say today’s phrase aloud to Luna and she’ll refill them, once a day.</p>'
    +'<button class="btn '+(refilled||S.hearts>=5?'':'accent')+'" id="refill" '+(refilled||S.hearts>=5?'disabled':'')+'>'+(refilled?'Refilled today':S.hearts>=5?'Hearts are full':'I said it, refill my hearts')+'</button></div></div></div>';
  h += '<div class="card"><div class="row" style="align-items:flex-start">'+avatar('ollie',44)+'<div style="flex:1;min-width:10em"><h3 style="font-size:19px">Ollie’s note: polite or friendly?</h3><p class="tip" style="margin-top:8px">'+Lg.respect+'</p></div></div></div>';
  h += '</div><div style="height:16px"></div>';
  return h;
}

/* ---------- crew tab ---------- */
function renderCrew(){
  let h = topBar() + '<h1 class="section-title">Meet the crew</h1><p class="lede">Five ocean friends turn each class 6 story, word, and practice round into a small conversation.</p><div class="stack">';
  CREW_ORDER.forEach(id=>{
    const c = CREW[id];
    h += '<div class="card crew-card">'+avatar(id,60)+'<div><p class="tag">'+c.tag+'</p><h3>'+c.name+'</h3><p class="role">'+c.role+'</p><div class="does">'+c.does.map(x=>'<span class="chip">'+x+'</span>').join('')+'</div></div></div>';
  });
  return h + '</div><div style="height:16px"></div>';
}

/* ---------- games + leaderboard ---------- */
const RANKERS = [
  ['Aarav','pip',1280],['Meera','luna',1160],['Kabir','ollie',1045],['Ishita','finn',980],['Rohan','sandy',865],
  ['Diya','luna',790],['Vihaan','pip',735],['Anaya','finn',690],['Arjun','ollie',640],['Tara','sandy',575]
];
function renderGames(){
  const level = levelForXP(S.xp);
  const chessOn = level>=3, musicOn = level>=2;
  return topBar()+'<div class="ocean-hero"><div class="hero-row"><div><p class="eyebrow" style="color:rgba(255,255,255,.72);font-size:12px;letter-spacing:.1em;text-transform:uppercase;font-weight:700">Pip’s games zone</p><h1>Play between lessons</h1><p>Two little adventures to keep your learning tide moving.</p></div>'+avatar('pip',58)+'</div></div>'
    +'<div class="game-grid"><button class="game-card'+(chessOn?'':' locked')+'" data-game="chess" data-unlocked="'+chessOn+'"><span class="game-icon">♞</span><h3>Chess</h3><p>'+(chessOn?'Ollie’s strategy board':'Unlocks at level 3 · Ollie’s strategy board')+'</p></button>'
    +'<button class="game-card'+(musicOn?'':' locked')+'" data-game="music" data-unlocked="'+musicOn+'"><span class="game-icon">♫</span><h3>Learn music</h3><p>'+(musicOn?'Sing with Luna':'Unlocks at level 2 · sing with Luna')+'</p></button>'
    +'<div class="game-card locked"><span class="game-icon">✦</span><h3>More soon</h3><p>New reef games are swimming over.</p></div></div>'
    +'<div class="card" style="margin-top:14px"><div class="row" style="align-items:flex-start">'+avatar('pip',44)+'<div><h3 style="font-size:18px">A reward, not a detour</h3><p class="note" style="margin-top:4px">Finish a lesson to earn XP. Games are a place to recharge and explore.</p></div></div></div>';
}
function renderLeaderboard(){
  const weekly = S.rankView !== 'all';
  const rows = RANKERS.map((r,i)=>'<div class="rank-row '+(i<3?'top-rank':'')+'"><span class="rank">'+(i+1)+'</span>'+avatar(r[1],34)+'<span class="rank-name">'+r[0]+'<span class="rank-meta">Level '+levelForXP(r[2])+'</span></span><span class="points">'+(weekly?Math.round(r[2]*.62):r[2])+' XP</span></div>').join('');
  const yourRank = weekly ? 18 : 24, yourPoints = weekly ? Math.max(0,S.xp) : S.xp;
  return topBar()+'<div class="ocean-hero"><div class="hero-row"><div><p class="eyebrow" style="color:rgba(255,255,255,.72);font-size:12px;letter-spacing:.1em;text-transform:uppercase;font-weight:700">Global reef</p><h1>Find your current</h1><p>Climb the Tide Pool league one lesson at a time.</p></div>'+avatar('sandy',58)+'</div></div>'
    +'<div class="screen-tabs" role="tablist"><button class="screen-tab" data-rank-view="week" aria-selected="'+weekly+'">This week</button><button class="screen-tab" data-rank-view="all" aria-selected="'+(!weekly)+'">All-time</button></div>'
    +'<div class="card" style="margin-bottom:12px"><div class="row" style="justify-content:space-between"><div><p class="note">Current league</p><h2 style="font-size:23px">Tide Pool</h2></div><span class="chip" style="background:var(--accent-soft);border-color:transparent">Top 10 promote</span></div></div>'
    +'<div class="rank-list">'+rows+'<div class="rank-row you"><span class="rank">'+yourRank+'</span>'+avatar('finn',34)+'<span class="rank-name">You<span class="rank-meta">Level '+levelForXP(S.xp)+' · '+Math.max(0, RANKERS[9][2]-(weekly?Math.round(RANKERS[9][2]*.62):RANKERS[9][2])-yourPoints)+' XP to next</span></span><span class="points">'+yourPoints+' XP</span></div></div>';
}

/* ---------- me tab ---------- */
function renderMe(){
  let h = topBar() + '<h1 class="section-title">My learning</h1><p class="lede">Third language · Grade '+S.grade+'</p>';
  const total = Object.values(S.done).reduce((n,m)=>n+Object.keys(m).length,0);
  const level = levelForXP(S.xp), curBase = xpForLevel(level), nextBase = xpForLevel(level+1);
  const lvlPct = Math.round((S.xp-curBase)/(nextBase-curBase)*100);
  h += '<div class="card" style="margin-bottom:14px"><div class="row" style="justify-content:space-between;align-items:flex-start"><div><p class="note">Level '+level+'</p><h2 style="font-size:21px">'+esc(levelTitle(level))+'</h2></div>'+avatar('pip',48)+'</div>'
    +'<div class="xpbar"><i style="width:'+lvlPct+'%"></i></div>'
    +'<p class="note" style="margin-top:6px">'+(nextBase-S.xp)+' XP to Level '+(level+1)+' · '+esc(levelTitle(level+1))+'</p></div>';
  h += '<div class="card bigstats" style="margin-bottom:14px"><div class="bigstat"><b>'+S.streak+'</b><span>day streak</span></div><div class="bigstat"><b>'+S.xp+'</b><span>total XP</span></div><div class="bigstat"><b>'+total+'</b><span>lessons done</span></div></div>';
  h += '<div class="card" style="margin-bottom:14px"><h3 style="font-size:18px;margin-bottom:10px">Grade</h3><div class="grades">'+[5,6,7,8].map(g=>'<button class="grade" data-grade="'+g+'" aria-pressed="'+(S.grade===g)+'">'+g+'</button>').join('')+'</div></div>';
  h += '<div class="card" style="margin-bottom:14px"><h3 style="font-size:18px;margin-bottom:12px">Progress by language</h3><div class="progress-list">';
  const maxCrowns = UNITS.length*5;
  LANG_ORDER.forEach(k=>{ const n = UNITS.reduce((sum,_,ui)=>sum+crownsFor(k,ui),0), pct = Math.round(n/maxCrowns*100);
    h += '<div class="prog"><span>'+LANGS[k].name+'</span><span class="bar"><i style="width:'+pct+'%"></i></span><span class="n">'+n+'/'+maxCrowns+'</span></div>'; });
  h += '</div></div>';
  h += '<div class="card" style="margin-bottom:14px"><h3 style="font-size:18px;margin-bottom:12px">Badges</h3><div class="badge-grid">'
    + BADGE_META.map(b=>'<div class="badge-chip'+(S.badges[b.id]?' on':'')+'" title="'+esc(b.desc)+'"><span class="badge-icon">'+b.icon+'</span><span class="badge-name">'+esc(b.name)+'</span></div>').join('')
    + '</div></div>';
  h += '<div class="card tip" style="margin-bottom:14px;border:0"><b>Why a third language?</b> Under the three-language formula, many state boards ask students in Classes 5–8 to learn a third Indian language. Boli keeps each lesson to about three minutes so it fits around school.</div>';
  h += '<div class="card" style="margin-bottom:14px"><div class="row" style="align-items:flex-start">'+avatar('pip',44)+'<div style="flex:1"><h3 style="font-size:18px">Your five learning friends</h3><p class="note" style="margin:4px 0 10px">They appear inside lessons, so children always know who is helping.</p><button class="btn ghost" id="meetcrew">Meet the crew</button></div></div></div>';
  h += '<div class="row" style="margin-bottom:24px"><button class="btn ghost" id="setup2">Change language &amp; grade</button><button class="btn ghost" id="reset">Reset progress</button></div>';
  return h;
}

/* ---------- main render ---------- */
function render(){
  const app = $('#app');
  app.innerHTML = S.tab==='games'?renderGames():S.tab==='leaderboard'?renderLeaderboard():S.tab==='luna'?renderLuna():S.tab==='crew'?renderCrew():S.tab==='me'?renderMe():renderLearn();
  document.querySelectorAll('.tab').forEach(t=>t.setAttribute('aria-current', t.dataset.tab===S.tab?'page':'false'));
  $('#langchip').onclick = openLangSheet;
  app.querySelectorAll('.node').forEach(n=>n.onclick=()=>{ if(n.classList.contains('locked')){ toast('Finish the lesson before this one to unlock it.'); return; } const [u,l]=n.dataset.k.split('-').map(Number); startLesson(u,l); });
  const s1 = $('#setup'), s2 = $('#setup2'); if(s1) s1.onclick = openOnboarding; if(s2) s2.onclick = openOnboarding;
  const mc = $('#meetcrew'); if(mc) mc.onclick = ()=>{ S.tab='crew'; save(); render(); window.scrollTo(0,0); };
  const hs = $('#heroStart'); if(hs) hs.onclick = ()=>{ const next = currentKey(); if(next) { const [u,l] = next.split('-').map(Number); startLesson(u,l); } else { S.tab='me'; save(); render(); } };
  const rc = $('#recap'); if(rc) rc.onclick = startRecap;
  app.querySelectorAll('[data-say]').forEach(b=>b.onclick=()=>{ const p=L().phrases[+b.dataset.say]; speak(p[1],p[2],'luna'); });
  app.querySelectorAll('[data-rank-view]').forEach(b=>b.onclick=()=>{ S.rankView=b.dataset.rankView; save(); render(); });
  app.querySelectorAll('[data-game]').forEach(b=>b.onclick=()=>{
    const unlocked = b.dataset.unlocked === 'true';
    if (!unlocked){ toast(b.dataset.game==='chess'?'Chess unlocks at level 3. Keep exploring!':'Learn Music unlocks at level 2. Keep exploring!'); return; }
    toast(b.dataset.game==='chess'?'Chess is coming soon!':'Music mode is coming soon!');
  });
  const rf = $('#refill'); if(rf) rf.onclick = ()=>{ S.hearts=5; S.refillDay=today(); save(); toast('Luna refilled your hearts. Shabash!'); render(); };
  app.querySelectorAll('[data-grade]').forEach(b=>b.onclick=()=>{ S.grade=+b.dataset.grade; save(); render(); });
  const rs = $('#reset'); if(rs) rs.onclick = ()=>{ if(confirm('Reset all progress, XP and streak?')){ S = Object.assign(demoState(),{done:{},crowns:{},badges:{},perfectStreak:0,xp:0,streak:0,longestStreak:0,lastDay:'',demo:false,lang:S.lang,grade:S.grade,tab:'me'}); save(); render(); } };
}
document.querySelectorAll('.tab').forEach(t=>t.onclick=()=>{ S.tab=t.dataset.tab; save(); render(); window.scrollTo(0,0); });

/* ---------- language sheet ---------- */
function langCards(sel){
  return '<div class="lang-grid">'+LANG_ORDER.map(k=>{ const g=LANGS[k];
    return '<button class="lang-card" data-lang="'+k+'" aria-pressed="'+(k===sel)+'"><span class="code">'+g.code+'</span><span class="name">'+g.name+'</span><span class="where">'+g.where+'</span></button>'; }).join('')+'</div>';
}
function openLangSheet(){
  const layer = $('#layer');
  layer.innerHTML = '<div class="sheet-bg" id="sbg"><div class="sheet" role="dialog" aria-modal="true" aria-label="Choose language"><h2 style="font-size:22px">Switch language</h2><p class="note">Progress is kept separately for each language.</p>'+langCards(S.lang)+'</div></div>';
  $('#sbg').onclick = e=>{ if(e.target.id==='sbg') layer.innerHTML=''; };
  layer.querySelectorAll('[data-lang]').forEach(b=>b.onclick=()=>{ S.lang=b.dataset.lang; save(); layer.innerHTML=''; render(); });
}

/* ---------- onboarding ---------- */
function openOnboarding(){
  let step = 0, lang = S.lang, grade = S.grade;
  const layer = $('#layer');
  function draw(){
    let body = '';
    if (step===0) body = '<h1 style="font-size:28px">Which language is your school’s third language?</h1><p class="note">You can learn the others any time.</p>'+langCards(lang);
    if (step===1) body = '<h1 style="font-size:28px">Which class are you in?</h1><p class="note">We’ll pace '+LANGS[lang].name+' for your grade.</p><div class="grades" style="margin-top:8px">'+[5,6,7,8].map(g=>'<button class="grade" data-g="'+g+'" aria-pressed="'+(grade===g)+'">'+g+'</button>').join('')+'</div>'
      +'<div class="speaker" style="margin-top:24px">'+avatar('finn',52)+'<div class="bubble"><p class="say">Hi, I’m Finn! Three minutes a day is all it takes. I’ll introduce every new word.</p></div></div>';
    if (step===2) body = '<h1 style="font-size:28px">Your crew</h1><p class="note">They’ll pop up exactly when you need them.</p><div class="stack">'
      +CREW_ORDER.map(id=>'<div class="row">'+avatar(id,44)+'<div style="flex:1;min-width:0"><b style="font-family:var(--display);font-size:17px">'+CREW[id].name+'</b><p class="note">'+CREW[id].does.slice(0,2).join(' · ')+'</p></div></div>').join('')+'</div>';
    layer.innerHTML = '<div class="overlay" role="dialog" aria-modal="true" aria-label="Set up Boli"><div class="inner">'
      +'<div class="row" style="padding-top:12px"><button class="iconbtn" id="obx" aria-label="Close">'+I.close+'</button></div>'
      +'<div class="ob-steps">'+[0,1,2].map(i=>'<i class="'+(i<=step?'on':'')+'"></i>').join('')+'</div>'
      +'<div class="stack" style="gap:14px">'+body+'</div>'
      +'<div class="ob-foot"><button class="btn wide" id="obnext">'+(step<2?'Continue':'Start learning '+LANGS[lang].name)+'</button></div></div></div>';
    $('#obx').onclick = ()=>layer.innerHTML='';
    layer.querySelectorAll('[data-lang]').forEach(b=>b.onclick=()=>{ lang=b.dataset.lang; draw(); });
    layer.querySelectorAll('[data-g]').forEach(b=>b.onclick=()=>{ grade=+b.dataset.g; draw(); });
    $('#obnext').onclick = ()=>{
      if (step<2){ step++; draw(); return; }
      if (S.demo){ S.done={}; S.xp=0; S.streak=0; S.lastDay=''; S.demo=false; }
      S.lang=lang; S.grade=grade; S.tab='learn'; save(); layer.innerHTML=''; render(); window.scrollTo(0,0);
    };
  }
  draw();
}

/* ---------- lessons ---------- */
let X = null; // active lesson
function makeItem(u,i){ return {id:u+'-'+i, s:L().units[u][i][0], t:L().units[u][i][1], e:UNITS[u].en[i]}; }
function buildLesson(u,l){
  const all = [0,1,2,3,4,5].map(i=>makeItem(u,i));
  const listenType = hasVoice() ? 'listen' : 'meaning';
  const ex = [];
  const q = (type,item) => ex.push({type,item,pool:all});
  if (l<2){
    const nw = all.slice(l*3, l*3+3);
    q('intro',nw[0]); q('intro',nw[1]); q('meaning',nw[0]); q('spell',nw[1]);
    q('intro',nw[2]); q(listenType,nw[2]); q('meaning',nw[1]); q('spell',nw[2]); q(listenType,nw[0]);
    if (l===1) q('meaning', pick(all.slice(0,3)));
  } else {
    ex.push({type:'match', items:shuffle(all).slice(0,4)});
    shuffle(all).forEach((it,i)=>q(['meaning','spell',listenType][i%3],it));
    ex.push({type:'match', items:shuffle(all).slice(0,4)});
  }
  return ex;
}
function startLesson(u,l){
  X = {u,l,ex:buildLesson(u,l),i:0,graded:0,right:0,sel:null,checked:false};
  drawEx();
}
function buildRecapExercises(pool){
  const items = shuffle(pool).slice(0, Math.min(6, pool.length));
  const listenType = hasVoice() ? 'listen' : 'meaning';
  const ex = [{type:'match', items:shuffle(items).slice(0,4)}];
  items.forEach((it,i)=> ex.push({type:['meaning','spell',listenType][i%3], item:it, pool:items}));
  return ex;
}
function startRecap(){
  const d = doneMap();
  const doneUnits = new Set();
  Object.keys(d).forEach(k=>doneUnits.add(+k.split('-')[0]));
  let pool = [];
  doneUnits.forEach(ui=>{ for (let i=0;i<6;i++) pool.push(makeItem(ui,i)); });
  if (pool.length < 4){ toast('Finish a couple more lessons first — Sandy needs more words to quiz you on!'); return; }
  X = {recap:true, ex:buildRecapExercises(pool), i:0, graded:0, right:0, sel:null, checked:false};
  drawEx();
}
function optionsFor(e){
  const others = shuffle(e.pool.filter(p=>p.id!==e.item.id)).slice(0,3);
  return shuffle([e.item].concat(others));
}
function drawEx(){
  const e = X.ex[X.i], layer = $('#layer');
  const pct = Math.round(X.i / X.ex.length * 100);
  let body = '', foot = '';
  if (e.type==='intro'){
    body = '<p class="lx-kind">New word</p><div class="speaker">'+avatar('finn',48)+'<div class="bubble"><p class="say">Here’s a new one. Tap the speaker and say it out loud with me!</p></div></div>'
      +'<div class="card intro" style="display:flex;flex-direction:column"><span class="word">'+esc(e.item.t)+'</span><span class="en">'+esc(e.item.e)+'</span>'
      +'<button class="iconbtn" id="say" aria-label="Hear it" style="margin-top:10px">'+I.play+'</button></div>';
    foot = '<button class="btn wide" id="go">Got it</button>';
  } else if (e.type==='match'){
    const left = shuffle(e.items), right = shuffle(e.items);
    body = '<p class="lx-kind">Match the pairs</p><div class="speaker">'+avatar('pip',48)+'<div class="bubble"><p class="say">Speed round! Tap a word, then its meaning.</p></div></div>'
      +'<div class="match"><div class="col">'+left.map(it=>'<button class="opt" data-side="L" data-id="'+it.id+'"><span class="word">'+esc(it.t)+'</span></button>').join('')+'</div>'
      +'<div class="col">'+right.map(it=>'<button class="opt" data-side="R" data-id="'+it.id+'"><span class="en">'+esc(it.e)+'</span></button>').join('')+'</div></div>';
    foot = '<div class="fb" id="fb" hidden></div><button class="btn wide" id="go" disabled>Continue</button>';
    X.opts = null; X.matchMiss = 0; X.matchLeft = e.items.length; X.pickL = null; X.pickR = null;
  } else {
    X.opts = optionsFor(e);
    let kind, speaker, optHtml;
    if (e.type==='meaning'){
      kind = 'What does this mean?';
      speaker = avatar('finn',48)+'<div class="bubble row"><button class="iconbtn" id="say" aria-label="Hear it">'+I.play+'</button><span class="word" style="flex:1">'+esc(e.item.t)+'</span></div>';
      optHtml = X.opts.map((o,i)=>'<button class="opt" data-i="'+i+'"><span class="en">'+esc(o.e)+'</span></button>').join('');
    } else if (e.type==='spell'){
      kind = 'Which spelling matches “'+esc(e.item.e)+'”?';
      speaker = avatar('ollie',48)+'<div class="bubble"><p class="say">Think of the word you just learned, then pick how it’s spelled in English letters.</p></div>';
      optHtml = X.opts.map((o,i)=>'<button class="opt" data-i="'+i+'"><span class="word">'+esc(o.t)+'</span></button>').join('');
    } else {
      kind = 'What did you hear?';
      speaker = avatar('finn',48)+'<div class="bubble row"><button class="iconbtn" id="say" aria-label="Play again">'+I.play+'</button><p class="say" style="flex:1">Quick one! Listen and tap what you heard.</p></div>';
      optHtml = X.opts.map((o,i)=>'<button class="opt" data-i="'+i+'"><span class="word">'+esc(o.t)+'</span></button>').join('');
    }
    body = '<p class="lx-kind">'+kind+'</p><div class="speaker">'+speaker+'</div><div class="opts">'+optHtml+'</div>';
    foot = '<div class="fb" id="fb" hidden></div><button class="btn wide" id="go" disabled>Check</button>';
    X.sel = null; X.checked = false;
  }
  layer.innerHTML = '<div class="overlay" id="lx" role="dialog" aria-modal="true" aria-label="Lesson"><div class="inner">'
    +'<div class="lx-top"><button class="iconbtn" id="quit" aria-label="Quit lesson">'+I.close+'</button><div class="pbar" role="progressbar" aria-valuenow="'+pct+'" aria-valuemin="0" aria-valuemax="100"><i style="width:'+pct+'%"></i></div>'
    +'<span class="stat hearts">'+I.heart+S.hearts+'</span></div>'
    +'<div class="lx-body">'+body+'</div><div class="lx-foot" id="foot">'+foot+'</div></div></div>';
  $('#quit').onclick = ()=>{ if(X.i===0 || confirm('Quit? Your progress in this lesson will be lost.')){ X=null; layer.innerHTML=''; render(); } };
  const say = $('#say');
  if (say) say.onclick = ()=>speak(e.item.s, e.item.t, e.type==='spell'?'ollie':'finn');
  if (e.type==='listen') setTimeout(()=>speak(e.item.s,e.item.t,'finn'), 350);
  if (e.type==='intro'){ $('#go').onclick = next; return; }
  if (e.type==='match'){ wireMatch(e); return; }
  layer.querySelectorAll('.opts .opt').forEach(b=>b.onclick=()=>{
    if (X.checked) return;
    layer.querySelectorAll('.opts .opt').forEach(o=>o.setAttribute('aria-pressed','false'));
    b.setAttribute('aria-pressed','true'); X.sel = +b.dataset.i; $('#go').disabled = false;
  });
  $('#go').onclick = ()=> X.checked ? next() : check();
}
function wireMatch(e){
  const layer = $('#layer');
  const btns = layer.querySelectorAll('.match .opt');
  btns.forEach(b=>b.onclick=()=>{
    const side = b.dataset.side;
    layer.querySelectorAll('.match .opt[data-side="'+side+'"]').forEach(o=>o.setAttribute('aria-pressed','false'));
    b.setAttribute('aria-pressed','true');
    if (side==='L'){ X.pickL=b; const it=e.items.find(i=>i.id===b.dataset.id); speakQuiet(it); } else X.pickR=b;
    if (X.pickL && X.pickR){
      const a=X.pickL, c=X.pickR; X.pickL=X.pickR=null;
      if (a.dataset.id===c.dataset.id){ [a,c].forEach(o=>{o.classList.add('right'); setTimeout(()=>{o.classList.remove('right');o.classList.add('matched');o.setAttribute('aria-pressed','false');},250);}); X.matchLeft--; }
      else { X.matchMiss++; [a,c].forEach(o=>{o.classList.add('wrong','flash'); setTimeout(()=>{o.classList.remove('wrong','flash');o.setAttribute('aria-pressed','false');},450);}); }
      if (X.matchLeft===0){
        X.graded++; if (X.matchMiss===0) X.right++;
        showFeedback(true, X.matchMiss===0 ? pick(PRAISE.pip) : 'All matched! ('+X.matchMiss+' slip'+(X.matchMiss>1?'s':'')+')', '', 'pip');
        const go=$('#go'); go.disabled=false; go.onclick=next;
      }
    }
  });
}
function speakQuiet(it){ if (hasVoice()) speak(it.s, it.t, 'pip'); }
function check(){
  const e = X.ex[X.i], chosen = X.opts[X.sel], ok = chosen.id===e.item.id;
  X.checked = true; X.graded++;
  const layer = $('#layer');
  layer.querySelectorAll('.opts .opt').forEach((b,i)=>{ if (X.opts[i].id===e.item.id) b.classList.add('right'); else if (i===X.sel) b.classList.add('wrong'); });
  if (ok){ X.right++; const who = Math.random()<.5?'finn':'pip'; showFeedback(true, pick(PRAISE[who]), '<span class="word">'+esc(e.item.t)+'</span> = '+esc(e.item.e), who); }
  else {
    S.hearts = Math.max(0,S.hearts-1); save();
    const hs = layer.querySelector('.lx-top .hearts'); if (hs) hs.innerHTML = I.heart+S.hearts;
    showFeedback(false, 'Not quite. Correct answer:', '<span class="word">'+esc(e.item.t)+'</span> = '+esc(e.item.e), 'ollie');
  }
  $('#go').textContent = 'Continue';
  if (!ok && S.hearts===0){ $('#go').onclick = outOfHearts; }
}
function showFeedback(ok, title, detail, who){
  const foot = $('#foot'), fb = $('#fb');
  foot.classList.add(ok?'good':'bad');
  fb.innerHTML = avatar(who,40)+'<div><h3>'+esc(title)+'</h3>'+(detail?'<p>'+detail+'</p>':'')+'</div>';
  fb.hidden = false;
}
function outOfHearts(){
  const layer = $('#layer');
  const canRefill = S.refillDay !== today();
  layer.innerHTML = '<div class="overlay"><div class="inner"><div class="done-screen">'+avatar('luna',96)
    +'<h2 style="color:var(--bad)">Out of hearts</h2><p style="max-width:32ch">“Rest a moment, dear one. Even a river rests at the ghat.” Come back tomorrow for five fresh hearts'+(canRefill?', or let me refill them now.':'.')+'</p>'
    +'<div class="stack" style="width:100%">'+(canRefill?'<button class="btn accent wide" id="dref">Refill with Luna (once a day)</button>':'')+'<button class="btn ghost wide" id="dend">End lesson</button></div></div></div></div>';
  const r = $('#dref'); if (r) r.onclick = ()=>{ S.hearts=5; S.refillDay=today(); save(); next(); };
  $('#dend').onclick = ()=>{ X=null; layer.innerHTML=''; render(); };
}
function next(){
  X.i++;
  if (X.i < X.ex.length){ drawEx(); $('#layer .overlay').scrollTop = 0; return; }
  finish();
}
function finish(){
  const recap = !!X.recap;
  const k = recap ? null : X.u+'-'+X.l;
  const wasDoneBefore = !recap && !!doneMap()[k];
  const first = recap ? false : !wasDoneBefore;
  const acc = X.graded ? Math.round(X.right/X.graded*100) : 100;
  const xp = recap ? (8 + (acc===100?4:0)) : ((X.l===2?15:10) + (acc===100?5:0));
  const prevXp = S.xp;
  if (!recap) doneMap()[k] = true;
  S.xp += xp;
  if (S.lastDay !== today()){ S.streak = (S.lastDay===yesterday() ? S.streak : 0) + 1; S.lastDay = today(); }
  S.longestStreak = Math.max(S.longestStreak, S.streak);
  S.perfectStreak = acc===100 ? S.perfectStreak+1 : 0;
  if (!recap && X.l===2){
    const d = doneMap();
    const allDone = d[X.u+'-0'] && d[X.u+'-1'] && d[X.u+'-2'];
    const cur = crownsFor(S.lang, X.u);
    if (!wasDoneBefore && allDone && cur<1) setCrown(S.lang, X.u, 1);
    else if (wasDoneBefore && acc===100 && cur<5) setCrown(S.lang, X.u, cur+1);
  }
  checkBadges();
  const newLevel = levelForXP(S.xp), oldLevel = levelForXP(prevXp);
  save();
  const layer = $('#layer');
  const mascot = recap ? 'sandy' : 'pip';
  const heading = recap ? 'Recap complete!' : (X.l===2?'Quiz cleared!':'Lesson complete!');
  const tipText = recap ? 'Little and often beats one long cram — Sandy will bring these words back again soon.' : (X.l===1?L().respect:L().fact);
  layer.innerHTML = '<div class="overlay"><div class="inner"><div class="done-screen"><div class="bounce">'+avatar(mascot,120)+'</div>'
    +'<h2>'+heading+'</h2>'
    +'<div class="done-tiles"><div class="card"><b style="color:var(--primary)">+'+xp+'</b><span>XP</span></div><div class="card"><b style="color:var(--good)">'+acc+'%</b><span>accuracy</span></div><div class="card"><b style="color:var(--accent-deep)">'+S.streak+'</b><span>day streak</span></div></div>'
    +'<div class="card" style="text-align:left;width:100%"><div class="row" style="align-items:flex-start">'+avatar('ollie',40)+'<div style="flex:1;min-width:0"><p class="tip" style="background:none;padding:0">'+tipText+'</p></div></div></div>'
    +'<button class="btn wide" id="fin">'+(first?'Continue':'Back to path')+'</button></div></div></div>';
  $('#fin').onclick = ()=>{ X=null; if (newLevel>oldLevel){ showLevelUp(newLevel); return; } layer.innerHTML=''; S.tab='learn'; render(); };
}
function showLevelUp(level){
  const layer = $('#layer');
  const unlockNote = level===2 ? 'Learn Music just unlocked in the Games Zone.'
    : level===3 ? 'Chess just unlocked in the Games Zone.' : '';
  layer.innerHTML = '<div class="overlay"><div class="inner"><div class="done-screen"><div class="bounce">'+avatar('pip',120)+'</div>'
    +'<h2>Level up!</h2><p style="font-family:var(--display);font-weight:700;font-size:20px;color:var(--primary)">Level '+level+' · '+esc(levelTitle(level))+'</p>'
    +(unlockNote?'<p class="note">'+unlockNote+'</p>':'')
    +'<button class="btn wide" id="finlvl">Nice!</button></div></div></div>';
  $('#finlvl').onclick = ()=>{ layer.innerHTML=''; S.tab='learn'; render(); };
}
document.addEventListener('keydown', e=>{
  if (e.key==='Escape' && $('#sbg')) $('#layer').innerHTML='';
  if (e.key==='Enter' && X && $('#go') && !$('#go').disabled && document.activeElement && !document.activeElement.classList.contains('opt')) $('#go').click();
});

render();
})();
