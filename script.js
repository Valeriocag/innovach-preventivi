// STEP WIZARD
const steps = document.querySelectorAll(".step");
const progressBar = document.getElementById("progress-bar");
const resultSection = document.getElementById("result-section");
const resultRangeEl = document.getElementById("result-range");
const calculateBtn = document.getElementById("calculate-btn");
const yearEl = document.getElementById("year");

let currentStep = 1;
const totalSteps = steps.length - 1; // l'ultimo è il risultato, non contato nella barra

if (yearEl) {
  yearEl.textContent = new Date().getFullYear().toString();
}

function showStep(step) {
  currentStep = step;

  steps.forEach((s) => {
    const stepNumber = Number(s.dataset.step);
    s.classList.toggle("active", stepNumber === step);
  });

  // Aggiorna barra progresso (solo per i primi 6 step)
  const progressPercent = Math.min((step / totalSteps) * 100, 100);
  if (progressBar) {
    progressBar.style.width = `${progressPercent}%`;
  }

  // Nascondi risultato se si torna indietro
  if (step !== 6 && !resultSection.classList.contains("hidden")) {
    resultSection.classList.add("hidden");
  }
}

function getSelectedValue(name) {
  const checked = document.querySelector(`input[name="${name}"]:checked`);
  return checked ? checked.value : null;
}

function getCheckboxValue(name) {
  const el = document.querySelector(`input[name="${name}"]`);
  return el ? el.checked : false;
}

function validateStep(step) {
  // Controllo minimo per evitare di andare avanti senza risposta
  if (step === 1 && !getSelectedValue("propertyType")) return false;
  if (step === 2 && !getSelectedValue("areas")) return false;
  if (step === 3 && !getSelectedValue("locationType")) return false;
  if (step === 4 && !getSelectedValue("quality")) return false;
  if (step === 6) {
    const name = document.getElementById("name");
    const phone = document.getElementById("phone");
    if (!name.value.trim() || !phone.value.trim()) return false;
  }
  return true;
}

function attachStepButtons() {
  document.querySelectorAll("[data-next]").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (!validateStep(currentStep)) {
        alert("Compila i campi richiesti prima di proseguire.");
        return;
      }
      if (currentStep < 6) {
        showStep(currentStep + 1);
      }
    });
  });

  document.querySelectorAll("[data-prev]").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (currentStep > 1) {
        showStep(currentStep - 1);
      }
    });
  });
}

function calculateQuote() {
  const propertyType = getSelectedValue("propertyType"); // casa / negozio / capannone
  const areas = getSelectedValue("areas"); // 2,4,6,8+
  const locationType = getSelectedValue("locationType"); // interno/esterno/entrambi
  const quality = getSelectedValue("quality"); // 1080p/4k/lowlight
  const remoteView = getCheckboxValue("remoteView");
  const recording = getCheckboxValue("recording");

  if (!propertyType || !areas || !locationType || !quality) {
    alert("Compila tutte le domande prima di calcolare il preventivo.");
    return;
  }

  // BASE PRICE (domestico standard 2 camere 1080p)
  let baseMin = 320;
  let baseMax = 620;

  // Tipo di immobile
  if (propertyType === "negozio") {
    baseMin += 80;
    baseMax += 180;
  } else if (propertyType === "capannone") {
    baseMin += 260;
    baseMax += 520;
  }

  // Numero di aree
  switch (areas) {
    case "2":
      // già coperto dalla base
      break;
    case "4":
      baseMin += 220;
      baseMax += 420;
      break;
    case "6":
      baseMin += 420;
      baseMax += 820;
      break;
    case "8+":
      baseMin += 720;
      baseMax += 1320;
      break;
  }

  // Posizionamento
  if (locationType === "esterno") {
    baseMin += 140;
    baseMax += 280;
  } else if (locationType === "entrambi") {
    baseMin += 240;
    baseMax += 480;
  }

  // Qualità
  if (quality === "4k") {
    baseMin += 220;
    baseMax += 420;
  } else if (quality === "lowlight") {
    baseMin += 360;
    baseMax += 720;
  }

  // Funzioni extra
  if (remoteView) {
    baseMin += 90;
    baseMax += 180;
  }

  if (recording) {
    baseMin += 130;
    baseMax += 260;
  }

  // Arrotonda alle decine
  const roundedMin = Math.round(baseMin / 10) * 10;
  const roundedMax = Math.round(baseMax / 10) * 10;

  resultRangeEl.textContent = `Indicativamente tra ${roundedMin.toLocaleString(
    "it-IT"
  )} € e ${roundedMax.toLocaleString("it-IT")} €`;

  resultSection.classList.remove("hidden");

  // QUI in futuro puoi fare una chiamata a una API, a un form backend o a un webhook
  // per mandare i dati a Odoo, email, Telegram, ecc.
}

// Inizializza
attachStepButtons();
showStep(1);

if (calculateBtn) {
  calculateBtn.addEventListener("click", () => {
    if (!validateStep(6)) {
      alert("Inserisci almeno nome e telefono per essere ricontattato.");
      return;
    }
    calculateQuote();
  });
}
