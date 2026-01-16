// Inspired by https://www.geeksforgeeks.org/javascript/how-to-create-stopwatch-using-html-css-and-javascript/

const DEFAULT_COUNTDOWN_DURATION = 120;
const DEFAULT_ALERT_DURATION = 10;
const DEFAULT_PAUSE_DURATION = 5;
const DEFAULT_TEMPO = 100;
const DEFAULT_REPETITIONS = 20;
const DEFAULT_RATE = 8;

function h(s) {
  return new Option(s).innerHTML;
}

function attr(s) {
  return new Option(s).innerHTML.replace("\"", "&quot;");
}

class Ui {
  constructor() {
    this.startButton = document.getElementById("start");
    this.stopButton = document.getElementById("stop");
    this.resetButton = document.getElementById("reset");
    this.countdownSpan = document.getElementById("countdown");
    this.countdownDurationInput = document.getElementById("countdown-duration");
    this.alertDurationInput = document.getElementById("alert-duration");
    this.pauseDurationInput = document.getElementById("pause-duration");
    this.tempoSelect = document.getElementById("tempo");
    this.repetitionsSelect = document.getElementById("repetitions");
    this.applyButton = document.getElementById("apply");
  }

  populateSettings(presets) {
    for (let tempo = 60; tempo <= 200; tempo += 5) {
      const e = document.createElement("option");
      e.value = tempo;
      e.innerText = tempo.toString();
      if (tempo == DEFAULT_TEMPO) {
        e.selected = true;
      }
      this.tempoSelect.appendChild(e);
    }

    for (const repetitions of [1, 2, 5, 10, 20, 50]) {
      const e = document.createElement("option");
      e.value = repetitions;
      e.innerText = repetitions.toString();
      if (repetitions == DEFAULT_REPETITIONS) {
        e.selected = true;
      }
      this.repetitionsSelect.appendChild(e);
    }

    this.applyButton.addEventListener("click", e => {
      const tempo = parseInt(this.tempoSelect.value);
      const repetitions = parseInt(this.repetitionsSelect.value);
      const countdownDuration = Math.round(60 / tempo * DEFAULT_RATE * repetitions);
      this.countdownDurationInput.value = countdownDuration;
      this.alertDurationInput.value = DEFAULT_ALERT_DURATION;
      this.pauseDurationInput.value = DEFAULT_PAUSE_DURATION;
    });

    const presetsSpan = document.getElementById("presets");
    for (const preset of presets) {
      const button = document.createElement("button");
      button.countdownDuration = preset.countdownDuration;
      button.alertDuration = preset.alertDuration;
      button.pauseDuration = preset.pauseDuration;
      const descriptor = `${preset.countdownDuration}/${preset.alertDuration}/${preset.pauseDuration}`;
      button.innerText = `${preset.name} (${descriptor})`;
      presetsSpan.appendChild(button);

      button.addEventListener("click", e => {
        this.countdownDurationInput.value = e.target.countdownDuration;
        this.alertDurationInput.value = e.target.alertDuration;
        this.pauseDurationInput.value = e.target.pauseDuration;
      });
    }
  }
}

const TimerState = Object.freeze({
  IDLE: 0,
  RUNNING: 1,
  ALERTING: 2,
  PAUSED: 3
});

class Timer {
  constructor(ui, countdownDuration, alertDuration, pauseDuration, pauseMessage) {
    this.ui = ui;
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
    this.ui.countdownSpan.innerHTML = "&ndash;&ndash;&ndash;";
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
          this.ui.countdownSpan.innerHTML = remaining.toFixed(1);
        }
        break;
      }
      case TimerState.ALERTING: {
        const remaining = this.countdownDuration - seconds;
        if (remaining <= 0) {
          this.state = TimerState.PAUSED;
          this.setCountdownClass();
          this.ui.countdownSpan.innerHTML = this.pauseMessage;
          this.startTime = Date.now();
        } else {
          this.ui.countdownSpan.innerHTML = remaining.toFixed(1);
        }
        break;
      }
      case TimerState.PAUSED: {
        const remaining = this.pauseDuration - seconds;
        if (remaining <= 0) {
          this.state = TimerState.RUNNING;
          this.setCountdownClass();
          this.ui.countdownSpan.innerHTML = this.countdownDuration.toFixed(1);
          this.startTime = Date.now();
        }
        break;
      }
    }
  }

  setCountdownClass() {
    let cls;
    switch (this.state) {
      case TimerState.IDLE: cls = "idle"; break;
      case TimerState.RUNNING: cls = "running"; break;
      case TimerState.ALERTING: cls = "alerting"; break;
      case TimerState.PAUSED: cls = "paused"; break;
    }
    this.ui.countdownSpan.classList.remove("idle", "running", "alerting", "paused");
    this.ui.countdownSpan.classList.add(cls);
  }
}

const UI = new Ui();
const TIMER = new Timer(UI, DEFAULT_COUNTDOWN_DURATION, DEFAULT_ALERT_DURATION, DEFAULT_PAUSE_DURATION, "next");

UI.startButton.addEventListener("click", () => {
  const countdownDuration = parseInt(UI.countdownDurationInput.value);
  const alertDuration = parseInt(UI.alertDurationInput.value);
  const pauseDuration = parseInt(UI.alertDurationInput.value);
  TIMER.start(countdownDuration, alertDuration, pauseDuration);
});

UI.stopButton.addEventListener("click", () => {
  TIMER.stop();
});

window.onload = () => {
  UI.countdownDurationInput.value = DEFAULT_COUNTDOWN_DURATION;
  UI.alertDurationInput.value = DEFAULT_ALERT_DURATION;
  UI.pauseDurationInput.value = DEFAULT_PAUSE_DURATION;
};

fetch("data.json")
  .then(response => response.json())
  .then(data => {
    UI.populateSettings(Object.hasOwn(data, "presets") ? data.presets : []);
  })
  .catch(e => alert(`Could not parse JSON from server: ${e}\n\nPlease ask Richard to fix this!`));
