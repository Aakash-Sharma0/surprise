/* =========================================================
   EDIT ME — everything personal lives in this CONFIG object.
   ========================================================= */
const CONFIG = {
  names: { him: "Aakash", her: "Komal" },

  // Words the puzzle unscrambles, in order. Keep them UPPERCASE.
  puzzleWords: ["AAKASH", "KOMAL"],

  questions: [
    {
      type: "slider",
      text: "How much do you like him? 😏",
      min: 0,
      max: 100,
      start: 80,
      whyPlaceholder: "Why? (be honest 👀)"
    },
    {
      text: `How much does ${"Aakash"} love ${"Komal"}?`,
      options: ["A little", "A lot", "More than his WiFi signal near you 📶❤️"],
      correct: 2,
      wrongReplies: ["Way off. Try again.", "Come on, you know this one 😏"]
    },
    {
      text: "Rate our chemistry:",
      options: ["Meh, it's okay", "Pretty good", "Absolutely off the charts 💥"],
      correct: 2,
      wrongReplies: ["Rude. Try again.", "That's not it 😄"]
    },
    {
      text: "Ready for your surprise?",
      options: ["Maybe later", "YES!! 🎁"],
      correct: 1,
      wrongReplies: ["Too bad, you're getting it anyway. Tap the other one 😄"]
    }
  ],

  letter: {
    // paragraphs render one below another, fading in
    paragraphs: [
      "My Dearest Komal,",
      "Happy Girlfriend's Day. Today's just a date on the calendar, but you turn every ordinary day into something worth remembering — and I wanted to make one day that's entirely, unmistakably about you.",
      "Every little thing about us — the dumb jokes, the late-night calls, the way you make hard days feel lighter just by being there — I don't take any of it for granted. This tiny website is nowhere near enough to show it, but it's a start.",
      "Thank you for being exactly who you are. I love you more today than yesterday, and I'm just getting started.",
      "And whatever happens, wherever life takes us — I need you to know I will always be with you. Just trust me on that. Everything will be fine, and I am never going to break your trust. You're not just a girl to me, Komal. You are my whole world.",
    ],
    signature: "Forever yours, Aakash 🤍"
  }
};

/* ============ utilities ============ */
const $ = (sel) => document.querySelector(sel);
const $all = (sel) => document.querySelectorAll(sel);

function showScreen(id){
  $all(".screen").forEach(s => s.classList.remove("active"));
  $(id).classList.add("active");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

/* ============ floating hearts background ============ */
function spawnHeart(){
  const el = document.createElement("div");
  el.className = "floating-heart";
  el.textContent = ["💗","💕","💖","❤️","💘"][Math.floor(Math.random()*5)];
  el.style.left = Math.random()*100 + "vw";
  const duration = 6 + Math.random()*6;
  el.style.animationDuration = duration + "s";
  el.style.fontSize = (1 + Math.random()*1.2) + "rem";
  $("#hearts-bg").appendChild(el);
  setTimeout(() => el.remove(), duration*1000 + 200);
}
setInterval(spawnHeart, 700);
for(let i=0;i<6;i++) setTimeout(spawnHeart, i*300);

function burstConfetti(count = 80){
  const colors = ["#ff5c8a","#e8b86d","#ff9db8","#7a1f3d","#fff"];
  const layer = $("#confetti-layer");
  for(let i=0;i<count;i++){
    const p = document.createElement("div");
    p.className = "confetti-piece";
    p.style.left = Math.random()*100 + "vw";
    p.style.background = colors[Math.floor(Math.random()*colors.length)];
    p.style.animationDuration = (2.5 + Math.random()*2) + "s";
    p.style.transform = `rotate(${Math.random()*360}deg)`;
    layer.appendChild(p);
    setTimeout(() => p.remove(), 5000);
  }
}

/* =========================================================
   SCREEN 1 — PUZZLE
   ========================================================= */
function shuffle(arr){
  const a = [...arr];
  for(let i=a.length-1;i>0;i--){
    const j = Math.floor(Math.random()*(i+1));
    [a[i],a[j]] = [a[j],a[i]];
  }
  return a;
}

function initPuzzle(){
  const area = $("#puzzle-area");
  const continueBtn = $("#puzzle-continue");
  const meetWrap = $("#puzzle-meet");
  const words = CONFIG.puzzleWords;
  const labels = ["his name", "her name"];

  area.innerHTML = "";
  meetWrap.hidden = true;
  continueBtn.hidden = true;

  const intro = document.createElement("p");
  intro.className = "puzzle-hint";
  intro.textContent = "Tap the letters below to spell out both names — they're all mixed together 👇";
  area.appendChild(intro);

  const rowsWrap = document.createElement("div");
  const slotRows = words.map((word, wi) => {
    const row = document.createElement("div");
    row.className = "puzzle-word";

    const lbl = document.createElement("div");
    lbl.className = "puzzle-label";
    lbl.textContent = labels[wi];
    row.appendChild(lbl);

    const slots = document.createElement("div");
    slots.className = "slots";
    const slotEls = [...word].map(() => {
      const s = document.createElement("div");
      s.className = "slot";
      slots.appendChild(s);
      return s;
    });
    row.appendChild(slots);
    rowsWrap.appendChild(row);
    return { lbl, slotEls };
  });
  area.appendChild(rowsWrap);

  const tilesWrap = document.createElement("div");
  tilesWrap.className = "tiles";
  area.appendChild(tilesWrap);

  const hint = document.createElement("p");
  hint.className = "puzzle-hint";
  area.appendChild(hint);

  const progressIdx = words.map(() => 0);
  const allLetters = shuffle(words.flatMap(w => [...w]));

  function wordDone(wi){ return progressIdx[wi] === words[wi].length; }
  function bothDone(){ return words.every((_, wi) => wordDone(wi)); }

  allLetters.forEach((letter) => {
    const tile = document.createElement("button");
    tile.className = "tile";
    tile.type = "button";
    tile.textContent = letter;
    tile.addEventListener("click", () => {
      if(tile.classList.contains("used")) return;

      let targetWord = -1;
      for(let wi = 0; wi < words.length; wi++){
        if(!wordDone(wi) && words[wi][progressIdx[wi]] === letter){ targetWord = wi; break; }
      }

      if(targetWord === -1){
        tile.classList.remove("wrong-tap");
        void tile.offsetWidth;
        tile.classList.add("wrong-tap");
        hint.textContent = "Not that one yet — try a different letter 😊";
        return;
      }

      hint.textContent = "";
      tile.classList.add("used");
      const { lbl, slotEls } = slotRows[targetWord];
      const idx = progressIdx[targetWord];
      slotEls[idx].textContent = letter;
      slotEls[idx].classList.add("filled");
      progressIdx[targetWord]++;

      if(wordDone(targetWord)){
        lbl.classList.add("solved");
        lbl.textContent = `${labels[targetWord]} ✓`;
      }

      if(bothDone()){
        setTimeout(showMeeting, 500);
      }
    });
    tilesWrap.appendChild(tile);
  });

  function showMeeting(){
    area.hidden = true;
    meetWrap.hidden = false;
    $("#meet-him").textContent = CONFIG.names.him;
    $("#meet-her").textContent = CONFIG.names.her;
    burstConfetti(50);
    setTimeout(() => { continueBtn.hidden = false; }, 1500);
  }

  continueBtn.addEventListener("click", () => {
    initQuestions();
    showScreen("#screen-questions");
  });
}

/* =========================================================
   SCREEN 2 — QUESTIONS
   ========================================================= */
function initQuestions(){
  const progress = $("#q-progress");
  const qText = $("#q-text");
  const qOptions = $("#q-options");
  const qHint = $("#q-hint");
  let current = 0;

  progress.innerHTML = CONFIG.questions.map(() => "<span></span>").join("");

  function renderProgress(){
    [...progress.children].forEach((dot, i) => {
      dot.classList.toggle("done", i < current);
      dot.classList.toggle("current", i === current);
    });
  }

  function renderQuestion(){
    if(current >= CONFIG.questions.length){
      showScreen("#screen-videos");
      return;
    }
    renderProgress();
    const q = CONFIG.questions[current];
    qText.textContent = q.text;
    qHint.textContent = "";
    qOptions.innerHTML = "";

    if(q.type === "slider"){
      renderSliderQuestion(q);
    } else {
      renderChoiceQuestion(q);
    }
  }

  function renderChoiceQuestion(q){
    q.options.forEach((opt, i) => {
      const btn = document.createElement("button");
      btn.className = "btn-option";
      btn.type = "button";
      btn.textContent = opt;
      btn.addEventListener("click", () => {
        if(i === q.correct){
          btn.classList.add("correct");
          qHint.textContent = "";
          setTimeout(() => {
            current++;
            renderQuestion();
          }, 450);
        } else {
          btn.classList.remove("wrong");
          void btn.offsetWidth;
          btn.classList.add("wrong");
          const replies = q.wrongReplies || ["Try again 😊"];
          qHint.textContent = replies[Math.floor(Math.random()*replies.length)];
        }
      });
      qOptions.appendChild(btn);
    });
  }

  function renderSliderQuestion(q){
    const wrap = document.createElement("div");
    wrap.className = "slider-wrap";

    const value = document.createElement("div");
    value.className = "slider-value";
    value.textContent = `${q.start}%`;
    wrap.appendChild(value);

    const range = document.createElement("input");
    range.type = "range";
    range.className = "q-range";
    range.min = q.min;
    range.max = q.max;
    range.value = q.start;
    range.style.setProperty("--fill", `${q.start}%`);
    range.addEventListener("input", () => {
      value.textContent = `${range.value}%`;
      range.style.setProperty("--fill", `${range.value}%`);
    });
    wrap.appendChild(range);

    const labels = document.createElement("div");
    labels.className = "slider-labels";
    labels.innerHTML = `<span>not really</span><span>obsessed 💗</span>`;
    wrap.appendChild(labels);

    qOptions.appendChild(wrap);

    const why = document.createElement("textarea");
    why.className = "q-why";
    why.placeholder = q.whyPlaceholder || "Why?";
    qOptions.appendChild(why);

    const nextBtn = document.createElement("button");
    nextBtn.className = "btn btn-primary";
    nextBtn.type = "button";
    nextBtn.textContent = "Next ➜";
    nextBtn.addEventListener("click", () => {
      if(why.value.trim().length === 0){
        qHint.textContent = "Tell him why first 😊";
        why.focus();
        return;
      }
      qHint.textContent = "";
      current++;
      renderQuestion();
    });
    qOptions.appendChild(nextBtn);
  }

  renderQuestion();
}

/* =========================================================
   SCREEN 3 — VIDEOS
   ========================================================= */
function initVideos(){
  const startBtn = $("#video-start-btn");
  const gate = $("#video-gate");
  const wrap = $("#video-wrap");
  const v1 = $("#video1");
  const v2 = $("#video2");
  const fallback = $("#video-fallback");
  const tapContinue = $("#video-tap-continue");

  function offerSkip(label, action){
    fallback.hidden = false;
    tapContinue.textContent = label;
    tapContinue.hidden = false;
    tapContinue.onclick = action;
  }

  function hideSkip(){
    fallback.hidden = true;
    tapContinue.hidden = true;
  }

  function goToLetter(){
    hideSkip();
    initLetter();
    showScreen("#screen-letter");
    burstConfetti();
  }

  function toVideo2(){
    hideSkip();
    v1.hidden = true;
    v2.hidden = false;
    v2.muted = false;
    v2.controls = true;
    v2.play().catch(() => offerSkip("Tap to continue ▶", goToLetter));
  }

  startBtn.addEventListener("click", () => {
    gate.hidden = true;
    wrap.hidden = false;
    v1.hidden = false;
    v1.muted = false;
    v1.controls = true;
    v1.play().catch(() => offerSkip("Video 1 unavailable — tap to continue ▶", toVideo2));
  });

  v1.addEventListener("error", () => {
    offerSkip("Video 1 unavailable — tap to continue ▶", toVideo2);
  });

  v1.addEventListener("ended", toVideo2);

  v2.addEventListener("error", () => {
    offerSkip("Video 2 unavailable — tap to continue ▶", goToLetter);
  });

  v2.addEventListener("ended", goToLetter);
}

/* =========================================================
   SCREEN 4 — LETTER
   ========================================================= */
function initLetter(){
  $("#letter-name").textContent = `${CONFIG.names.her} ❤️`;
  const body = $("#letter-body");
  body.innerHTML = "";
  CONFIG.letter.paragraphs.forEach((p, i) => {
    const el = document.createElement("p");
    el.textContent = p;
    el.style.animationDelay = (i * 0.5) + "s";
    body.appendChild(el);
  });
  $("#letter-signature").textContent = CONFIG.letter.signature;
}

$("#replay-btn").addEventListener("click", () => {
  location.reload();
});

/* ============ boot ============ */
initPuzzle();
initVideos();
