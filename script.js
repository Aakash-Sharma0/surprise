/* =========================================================
   EDIT ME — everything personal lives in this CONFIG object.
   ========================================================= */
const CONFIG = {
  names: { him: "Aakash", her: "Komal" },

  // Words the puzzle unscrambles, in order. Keep them UPPERCASE.
  puzzleWords: ["AAKASH", "KOMAL"],

  questions: [
    {
      text: "Guess what today is... 🤔",
      options: ["Just another Tuesday", "National Holiday", "Girlfriend's Day ❤️"],
      correct: 2,
      wrongReplies: ["Nope, try again 😏", "Not even close, silly."]
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
  let wordIndex = 0;

  function renderWord(){
    area.innerHTML = "";
    const word = CONFIG.puzzleWords[wordIndex];
    const label = wordIndex === 0 ? "his name" : "her name";

    const wrap = document.createElement("div");
    wrap.className = "puzzle-word";

    const lbl = document.createElement("div");
    lbl.className = "puzzle-label";
    lbl.textContent = `Unscramble ${label}`;
    wrap.appendChild(lbl);

    const slots = document.createElement("div");
    slots.className = "slots";
    const slotEls = [...word].map(() => {
      const s = document.createElement("div");
      s.className = "slot";
      slots.appendChild(s);
      return s;
    });
    wrap.appendChild(slots);

    const tiles = document.createElement("div");
    tiles.className = "tiles";
    const letters = shuffle([...word]);
    let filled = [];

    letters.forEach((letter) => {
      const tile = document.createElement("button");
      tile.className = "tile";
      tile.type = "button";
      tile.textContent = letter;
      tile.addEventListener("click", () => {
        if(tile.classList.contains("used")) return;
        filled.push(letter);
        tile.classList.add("used");
        const idx = filled.length - 1;
        slotEls[idx].textContent = letter;
        slotEls[idx].classList.add("filled");

        if(filled.length === word.length){
          const attempt = filled.join("");
          if(attempt === word){
            setTimeout(() => {
              wordIndex++;
              if(wordIndex < CONFIG.puzzleWords.length){
                renderWord();
              } else {
                area.innerHTML = `<p class="puzzle-solved-badge">✓ Solved! It's you two 💕</p>`;
                continueBtn.hidden = false;
              }
            }, 400);
          } else {
            setTimeout(() => {
              filled = [];
              slotEls.forEach(s => { s.textContent = ""; s.classList.remove("filled"); });
              tiles.querySelectorAll(".tile").forEach(t => t.classList.remove("used"));
            }, 500);
          }
        }
      });
      tiles.appendChild(tile);
    });
    wrap.appendChild(tiles);
    area.appendChild(wrap);
  }

  renderWord();
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
