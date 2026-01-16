// Inspired by https://www.geeksforgeeks.org/javascript/how-to-create-stopwatch-using-html-css-and-javascript/

const DEFAULT_COUNTDOWN_DURATION = 120;
const DEFAULT_ALERT_DURATION = 10;
const DEFAULT_PAUSE_DURATION = 5;
const DEFAULT_TEMPO = 100;
const DEFAULT_REPETITIONS = 20;
const DEFAULT_RATE = 8;

const START_BUTTON = document.getElementById("start");
const STOP_BUTTON = document.getElementById("stop");
const RESET_BUTTON = document.getElementById("reset");
const COUNTDOWN = document.getElementById("countdown");
const COUNTDOWN_DURATION_INPUT = document.getElementById("countdown-duration");
const ALERT_DURATION_INPUT = document.getElementById("alert-duration");
const PAUSE_DURATION_INPUT = document.getElementById("pause-duration");

function h(s) {
  return new Option(s).innerHTML;
}

function attr(s) {
  return new Option(s).innerHTML.replace("\"", "&quot;");
}

function populateSettings(tempoSelectId, repetitionsSelectId, applyButtonId, presets) {
  const tempoSelect = document.getElementById(tempoSelectId);
  for (let tempo = 60; tempo <= 200; tempo += 5) {
    const e = document.createElement("option");
    e.value = tempo;
    e.innerText = tempo.toString();
    if (tempo == DEFAULT_TEMPO) {
      e.selected = true;
    }
    tempoSelect.appendChild(e);
  }

  const repetitionsSelect = document.getElementById(repetitionsSelectId);
  for (const repetitions of [1, 2, 5, 10, 20, 50]) {
    const e = document.createElement("option");
    e.value = repetitions;
    e.innerText = repetitions.toString();
    if (repetitions == DEFAULT_REPETITIONS) {
      e.selected = true;
    }
    repetitionsSelect.appendChild(e);
  }

  const applyButton = document.getElementById(applyButtonId);
  applyButton.addEventListener("click", e => {
    const tempo = parseInt(tempoSelect.value);
    const repetitions = parseInt(repetitionsSelect.value);
    const countdownDuration = Math.round(60 / tempo * DEFAULT_RATE * repetitions);
    COUNTDOWN_DURATION_INPUT.value = countdownDuration;
    ALERT_DURATION_INPUT.value = DEFAULT_ALERT_DURATION;
    PAUSE_DURATION_INPUT.value = DEFAULT_PAUSE_DURATION;
  });

  const presetsSpan = document.getElementById("presets");
  for (const preset of presets) {
    const button = document.createElement("button");
    presetsSpan.appendChild(button);

    button.countdownDuration = preset.countdownDuration;
    button.alertDuration = preset.alertDuration;
    button.pauseDuration = preset.pauseDuration;
    const descriptor = `${preset.countdownDuration}/${preset.alertDuration}/${preset.pauseDuration}`;
    button.innerText = `${preset.name} (${descriptor})`;
    button.addEventListener("click", e => {
      COUNTDOWN_DURATION_INPUT.value = e.target.countdownDuration;
      ALERT_DURATION_INPUT.value = e.target.alertDuration;
      PAUSE_DURATION_INPUT.value = e.target.pauseDuration;
    });
  }
}

const TimerState = Object.freeze({
  IDLE: 0,
  RUNNING: 1,
  ALERTING: 2,
  PAUSED: 3
});

class Timer {
  constructor(countdownDuration, alertDuration, pauseDuration, pauseMessage) {
    this.countdownDuration = countdownDuration;
    this.alertDuration = alertDuration;
    this.pauseDuration = pauseDuration;
    this.pauseMessage = pauseMessage;
    this.state = TimerState.IDLE;
    this.intervalId = null;
    this.startTime = null;
  }

  start(countdownDuration, alertDuration, pauseDuration) {
    if (this.state != TimerState.IDLE) { return; }

    this.countdownDuration = countdownDuration;
    this.alertDuration = alertDuration;
    this.pauseDuration = pauseDuration;
    this.state = TimerState.RUNNING;
    this.setCountdownClass();
    this.startTime = Date.now();
    let self = this;
    this.intervalId = setInterval(() => { self.step() }, 10);
  }

  stop() {
    if (this.state == TimerState.IDLE) { return; }

    clearInterval(this.intervalId);
    this.intervalId = null;
    this.startTime = null;
    this.state = TimerState.IDLE;
    this.setCountdownClass();
    COUNTDOWN.innerHTML = "&ndash;&ndash;&ndash;";
  }

  step() {
    if (this.state == TimerState.IDLE) { return; }

    const elapsed = Date.now() - this.startTime;
    const seconds = elapsed / 1000;

    switch (this.state) {
      case TimerState.RUNNING: {
        const remaining = this.countdownDuration - seconds;
        if (remaining <= this.alertDuration) {
          this.state = TimerState.ALERTING;
          this.setCountdownClass();
        } else {
          COUNTDOWN.innerHTML = remaining.toFixed(1);
        }
        break;
      }
      case TimerState.ALERTING: {
        const remaining = this.countdownDuration - seconds;
        if (remaining <= 0) {
          this.state = TimerState.PAUSED;
          this.setCountdownClass();
          COUNTDOWN.innerHTML = this.pauseMessage;
          this.startTime = Date.now();
        } else {
          COUNTDOWN.innerHTML = remaining.toFixed(1);
        }
        break;
      }
      case TimerState.PAUSED: {
        const remaining = this.pauseDuration - seconds;
        if (remaining <= 0) {
          this.state = TimerState.RUNNING;
          this.setCountdownClass();
          COUNTDOWN.innerHTML = this.countdownDuration.toFixed(1);
          this.startTime = Date.now();
        }
        break;
      }
    }
  }

  setCountdownClass() {
    COUNTDOWN.classList.remove("idle", "running", "alerting", "paused");
    switch (this.state) {
      case TimerState.IDLE:
        COUNTDOWN.classList.add("idle");
        break;
      case TimerState.RUNNING:
        COUNTDOWN.classList.add("running");
        break;
      case TimerState.ALERTING:
        COUNTDOWN.classList.add("alerting");
        break;
      case TimerState.PAUSED:
        COUNTDOWN.classList.add("paused");
        break;
    }
  }
}

const TIMER = new Timer(DEFAULT_COUNTDOWN_DURATION, DEFAULT_ALERT_DURATION, DEFAULT_PAUSE_DURATION, "next");

START_BUTTON.addEventListener("click", () => {
  const countdownDuration = parseInt(COUNTDOWN_DURATION_INPUT.value);
  const alertDuration = parseInt(ALERT_DURATION_INPUT.value);
  const pauseDuration = parseInt(PAUSE_DURATION_INPUT.value);
  TIMER.start(countdownDuration, alertDuration, pauseDuration);
});

STOP_BUTTON.addEventListener("click", () => {
  TIMER.stop();
});

window.onload = () => {
  COUNTDOWN_DURATION_INPUT.value = DEFAULT_COUNTDOWN_DURATION;
  ALERT_DURATION_INPUT.value = DEFAULT_ALERT_DURATION;
  PAUSE_DURATION_INPUT.value = DEFAULT_PAUSE_DURATION;
};

fetch("data.json")
  .then(response => response.json())
  .then(data => {
    const presets = Object.hasOwn(data, "presets") ? data.presets : [];
    populateSettings("tempo", "repetitions", "apply", presets);
  })
  .catch(e => alert(`Could not parse JSON from server: ${e}\n\nPlease ask Richard to fix this!`));
