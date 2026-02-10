(() => {
  "use strict";

  var passed = 0;
  var failed = 0;
  const messages = [];

  function assertEqual(actual, expected, m) {
    if (actual === expected) {
      passed += 1;
      console.log(`Test ${m} passed`);
      return true;
    }

    failed += 1;
    messages.push(`${m}: expected ${expected}, got ${actual}`);
    console.log(`Test ${m} failed`);
    return false;
  }

  function run() {
    const Accent = window.Accent;
    const parseNumber = window.parseNumber;
    const parseOneOf = window.parseOneOf;
    const makeDefaultPattern = window.makeDefaultPattern;
    const parsePattern = window.parsePattern;
    const formatProgress = window.formatProgress;

    assertEqual(Accent.HIGH, "A", "Accent.HIGH");
    assertEqual(Accent.MEDIUM, "B", "Accent.MEDIUM");
    assertEqual(Accent.LOW, "C", "Accent.LOW");
    assertEqual(Accent.SILENT, "D", "Accent.SILENT");

    assertEqual(parseNumber(null, 0, 100, 50), 50, "parseNumber(null)");
    assertEqual(parseNumber(undefined, 0, 100, 50), 50, "parseNumber(undefined)");
    assertEqual(parseNumber("x", 0, 100, 50), 50, "parseNumber(NaN string)");
    assertEqual(parseNumber("", 0, 100, 50), 50, "parseNumber(empty)");
    assertEqual(parseNumber("10", 20, 80, 50), 20, "parseNumber below min");
    assertEqual(parseNumber("90", 20, 80, 50), 80, "parseNumber above max");
    assertEqual(parseNumber("60", 0, 100, 50), 60, "parseNumber in range");
    assertEqual(parseNumber("120", 50, 250, 120), 120, "parseNumber in range 2");

    const options = [1, 2, 5, 10, 20, 50];
    assertEqual(parseOneOf(null, options, 20), 20, "parseOneOf(null)");
    assertEqual(parseOneOf(undefined, options, 20), 20, "parseOneOf(undefined)");
    assertEqual(parseOneOf("3", options, 20), 20, "parseOneOf not in options");
    assertEqual(parseOneOf("25", options, 20), 20, "parseOneOf not in options 2");
    assertEqual(parseOneOf("5", options, 20), 5, "parseOneOf in options");
    assertEqual(parseOneOf("50", options, 20), 50, "parseOneOf in options 2");

    assertEqual(makeDefaultPattern(2, 2), "ACBC", "makeDefaultPattern 2x2");
    assertEqual(makeDefaultPattern(2, 4), "ACCCBCCC", "makeDefaultPattern 2x4");
    assertEqual(makeDefaultPattern(4, 2), "ACBCBCBC", "makeDefaultPattern 4x2");

    assertEqual(parsePattern("ABCDEF", 2, 2), "ABCD", "parsePattern truncate");
    assertEqual(parsePattern("A", 2, 2), "ADDD", "parsePattern pad");
    assertEqual(parsePattern(null, 2, 2), "DDDD", "parsePattern null");
    assertEqual(parsePattern(undefined, 2, 2), "DDDD", "parsePattern undefined");
    assertEqual(parsePattern("ABCD", 2, 2), "ABCD", "parsePattern exact");
    assertEqual(parsePattern("ABCDEFGH", 4, 2), "ABCDEFGH", "parsePattern exact 2");

    assertEqual(formatProgress("bar", 0, 4), "bar 1 of 4", "formatProgress no offset");
    assertEqual(formatProgress("rep", 2, 20), "rep 3 of 20", "formatProgress no offset 2");
    assertEqual(formatProgress("exercise", 0, 24, 5), "exercise 6 (1 of 24)", "formatProgress with offset");
    assertEqual(formatProgress("bar", 3, 4, null, true), "bar 4 of 4 (get ready!)", "formatProgress get ready");
  }

  const element = document.getElementById("test-results");
  run();
  if (failed === 0) {
    element.innerHTML = "<span class=\"pass\">All " + passed + " tests passed.</span>";
  } else {
    element.innerHTML = "<span class=\"fail\">" + failed + " failed, " + passed + " passed.</span>\n\n" +
      messages.join("\n");
  }
})();
