/**
 * Text formatting utilities for terminal output
 *
 * Breaks a string into lines of length n, respecting word boundaries.
 *
 * This code will add line breaks to a long string, breaking it into a
 * multiline string. It breaks at spaces, unless doing so would result in a
 * line with an abnormally large gap at the end. In that case, it will
 * hyphenate the last word in the line and continue on the next line.
 */

/**
 * Break text into lines with intelligent word wrapping and hyphenation
 * @param {string} str - Text to break into lines
 * @param {number} maxLineLength - Maximum line length (default: 60)
 * @returns {string} Formatted text with line breaks
 */
function breakText(str, maxLineLength = 60) {
  if (maxLineLength <= 0) return str;

  const words = str.split(' ');
  const wordLengths = words.map((word) => word.length);

  const average =
    wordLengths.reduce((sum, length) => sum + length, 0) / wordLengths.length;

  const sumOfSquaredDifferences = wordLengths.reduce(
    (sum, length) => sum + Math.pow(length - average, 2),
    0
  );
  const standardDeviation = Math.sqrt(
    sumOfSquaredDifferences / wordLengths.length
  );

  const maxWordLength = Math.min(maxLineLength, average + standardDeviation);

  const lines = [];
  let line = '';
  let word = '';
  let indentation = '';
  let hasDeterminedIndentation = false;
  const whitespace = /[\s\n]/;

  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    word += char;

    if (whitespace.exec(char) || i === str.length - 1) {
      if (!hasDeterminedIndentation) {
        indentation += char;
      }
      if (line.length + word.length < maxLineLength) {
        line += word;
        word = '';
      } else {
        if (
          line.length + word.length > maxLineLength &&
          word.length > maxWordLength
        ) {
          const firstCharacter = word[0];
          const minsplit = Math.max(2, Math.floor(word.length * 0.3));
          const maxsplit = Math.min(
            word.length - 3,
            Math.ceil(word.length * 0.7)
          );
          const middle = maxLineLength - line.length - 1;
          if (
            firstCharacter.toLowerCase() != firstCharacter.toUpperCase() &&
            word.length > maxWordLength &&
            middle > minsplit &&
            middle < maxsplit
          ) {
            const part = word.substring(0, middle);
            const remaining = word.substring(middle);
            lines.push(line + part + (remaining.length > 0 ? '-' : ''));
            line = indentation + remaining;
            word = '';
          } else {
            lines.push(line.trimEnd());
            line = indentation + word;
            word = '';
          }
        } else {
          lines.push(line.trimEnd());
          line = indentation + word;
          word = '';
        }
      }
      if (char === '\n') {
        lines.push(line.trimEnd());
        line = '';
        indentation = '';
        hasDeterminedIndentation = false;
      } else {
        if (line.length >= maxLineLength || i === str.length - 1) {
          lines.push(line.trimEnd());
          line = '';
        }
      }
    } else {
      hasDeterminedIndentation = true;
    }
  }
  if (line) lines.push(line);
  return lines.join('\n');
}

/**
 * Get the current terminal width
 * @returns {number} Terminal width in columns (default: 80)
 */
function getTerminalWidth() {
  return process.stdout.columns || 80;
}

module.exports = {
  breakText,
  getTerminalWidth
};
