// Inspired by https://www.geeksforgeeks.org/javascript/how-to-create-stopwatch-using-html-css-and-javascript/

const DEFAULT_COUNTDOWN_DURATION = 120;
const DEFAULT_ALERT_DURATION = 10;
const DEFAULT_PAUSE_DURATION = 5;

const START_BUTTON = document.getElementById("start");
const STOP_BUTTON = document.getElementById("stop");
const RESET_BUTTON = document.getElementById("reset");
const COUNTDOWN = document.getElementById("countdown");
const COUNTDOWN_DURATION_INPUT = document.getElementById("countdown-duration");
const ALERT_DURATION_INPUT = document.getElementById("alert-duration");
const PAUSE_DURATION_INPUT = document.getElementById("pause-duration");

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

  start() {
    if (this.state != TimerState.IDLE) { return; }

    this.state = TimerState.RUNNING;
    this.setCountdownClass();
    this.startTime = Date.now();
    let self = this;
    this.intervalId = setInterval(function () { self.step() }, 10);
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

START_BUTTON.addEventListener("click", function () {
  TIMER.countdownDuration = parseInt(COUNTDOWN_DURATION_INPUT.value);
  TIMER.alertDuration = parseInt(ALERT_DURATION_INPUT.value);
  TIMER.pauseDuration = parseInt(PAUSE_DURATION_INPUT.value);
  TIMER.start();
});

STOP_BUTTON.addEventListener("click", function () {
  TIMER.stop();
});

window.onload = function () {
  COUNTDOWN_DURATION_INPUT.value = DEFAULT_COUNTDOWN_DURATION;
  ALERT_DURATION_INPUT.value = DEFAULT_ALERT_DURATION;
  PAUSE_DURATION_INPUT.value = DEFAULT_PAUSE_DURATION;
};
