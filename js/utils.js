(() => {
  "use strict";

  const Accent = Object.freeze({
    HIGH: "A",
    MEDIUM: "B",
    LOW: "C",
    SILENT: "D"
  });

  function parseNumber(s, min, max, defaultValue) {
    if (s === null || s === undefined) { return defaultValue; }
    const value = parseInt(s, 10);
    if (Number.isNaN(value)) { return defaultValue; }
    if (value < min) { return min; }
    if (value > max) { return max; }
    return value;
  }

  function parseOneOf(s, options, defaultValue) {
    if (s === null || s === undefined) { return defaultValue; }
    const value = parseInt(s, 10);
    if (Number.isNaN(value)) { return defaultValue; }
    return options.includes(value) ? value : defaultValue;
  }

  function makeDefaultPattern(beats, subdivisions) {
    let pattern = "";
    for (let i = 0; i < beats; ++i) {
      if (i === 0) {
        pattern += Accent.HIGH;
      } else {
        pattern += Accent.MEDIUM;
      }
      for (let j = 0; j < subdivisions - 1; ++j) {
        pattern += Accent.LOW;
      }
    }
    return pattern;
  }

  function parsePattern(s, beats, subdivisions) {
    const len = beats * subdivisions;
    return (s ?? "").substring(0, len).padEnd(len, "D");
  }

  function formatProgress(name, value, count, offset, getReady) {
    if (offset === undefined) { offset = null; }
    if (getReady === undefined) { getReady = false; }
    let s = offset === null ? name + " " + (value + 1) + " of " + count : name + " " + (value + offset + 1) + " (" + (value + 1) + " of " + count + ")";
    if (getReady) {
      s += " (get ready!)";
    }
    return s;
  }

  window.Accent = Accent;
  window.parseNumber = parseNumber;
  window.parseOneOf = parseOneOf;
  window.makeDefaultPattern = makeDefaultPattern;
  window.parsePattern = parsePattern;
  window.formatProgress = formatProgress;
})();
