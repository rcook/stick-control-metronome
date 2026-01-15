// Inspired by https://www.geeksforgeeks.org/javascript/how-to-create-stopwatch-using-html-css-and-javascript/

const START_BUTTON = document.getElementById("start");
const STOP_BUTTON = document.getElementById("stop");
const RESET_BUTTON = document.getElementById("reset");
const COUNTDOWN = document.getElementById("countdown")

const PAUSE_MESSAGE = "next";
const COUNTDOWN_DURATION = 120;
const PAUSE_DURATION = 5;

const TimerState = Object.freeze({
  COUNTING_DOWN: 0,
  PAUSED: 1
});

const TIMER_INFO = {
  state: TimerState.COUNTING_DOWN,
  startTime: null
};

function step() {
  if (!TIMER_INFO.startTime) { return; }

  const elapsed = Date.now() - TIMER_INFO.startTime;
  const seconds = elapsed / 1000;

  switch (TIMER_INFO.state) {
    case TimerState.COUNTING_DOWN: {
      const remaining = COUNTDOWN_DURATION - seconds;
      if (remaining <= 0) {
        COUNTDOWN.innerHTML = PAUSE_MESSAGE;
        TIMER_INFO.state = 1;
        TIMER_INFO.startTime = Date.now();
      } else {
        COUNTDOWN.innerHTML = remaining.toFixed(1);
      }
      break;
    }
    case TimerState.PAUSED: {
      const remaining = PAUSE_DURATION - seconds;
      if (remaining <= 0) {
        COUNTDOWN.innerHTML = COUNTDOWN_DURATION.toFixed(1);
        TIMER_INFO.state = 0;
        TIMER_INFO.startTime = Date.now();
      }
      break;
    }
  }
}

START_BUTTON.addEventListener("click", function () {
  TIMER_INFO.startTime = Date.now();
});

STOP_BUTTON.addEventListener("click", function () {
  COUNTDOWN.innerHTML = "&ndash;&ndash;&ndash;";
  TIMER_INFO.startTime = null;
});

window.onload = function () {
  setInterval(step, 10);
};
