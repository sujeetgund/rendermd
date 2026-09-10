/**
 * Computes exact pixel coordinates (left, top, height) of a caret position in a native HTMLTextAreaElement.
 * Uses mirror element technique with viewport flipping and React Portal compatibility.
 */

export interface CaretCoordinates {
  top: number;
  left: number;
  height: number;
}

export function getTextareaCaretCoordinates(
  element: HTMLTextAreaElement,
  position: number
): CaretCoordinates {
  if (typeof window === "undefined" || !element) {
    return { top: 120, left: 100, height: 22 };
  }

  // Create mirror element
  const div = document.createElement("div");
  div.id = "input-textarea-caret-position-mirror-div";

  const style = window.getComputedStyle(element);

  // Copy font, padding, and layout styles
  const propertiesToCopy = [
    "direction",
    "boxSizing",
    "width",
    "height",
    "overflowX",
    "overflowY",
    "borderTopWidth",
    "borderRightWidth",
    "borderBottomWidth",
    "borderLeftWidth",
    "borderStyle",
    "paddingTop",
    "paddingRight",
    "paddingBottom",
    "paddingLeft",
    "fontStyle",
    "fontVariant",
    "fontWeight",
    "fontStretch",
    "fontSize",
    "fontSizeAdjust",
    "lineHeight",
    "fontFamily",
    "textAlign",
    "textTransform",
    "textIndent",
    "textDecoration",
    "letterSpacing",
    "wordSpacing",
    "tabSize",
    "whiteSpace",
    "wordBreak",
  ] as const;

  propertiesToCopy.forEach((prop) => {
    // @ts-ignore
    div.style[prop] = style[prop];
  });

  div.style.position = "absolute";
  div.style.visibility = "hidden";
  div.style.top = "0px";
  div.style.left = "0px";
  div.style.whiteSpace = "pre-wrap";
  div.style.wordBreak = "break-word";

  document.body.appendChild(div);

  // Set content up to caret position
  div.textContent = element.value.substring(0, position);

  // Append span marker at caret
  const span = document.createElement("span");
  span.textContent = element.value.substring(position, position + 1) || ".";
  div.appendChild(span);

  const rect = element.getBoundingClientRect();
  const spanOffsetTop = span.offsetTop;
  const spanOffsetLeft = span.offsetLeft;

  document.body.removeChild(div);

  const fontSize = parseFloat(style.fontSize) || 14;
  const parsedLineHeight = parseFloat(style.lineHeight);
  const lineHeight = isNaN(parsedLineHeight) ? fontSize * 1.6 : parsedLineHeight;

  // Viewport-relative coordinates for fixed portal positioning
  const rawTop = rect.top + spanOffsetTop - element.scrollTop + lineHeight + 4;
  const rawLeft = rect.left + spanOffsetLeft - element.scrollLeft;

  const winWidth = window.innerWidth || 1200;
  const winHeight = window.innerHeight || 800;

  // Flip menu above line if caret is near screen bottom
  let finalTop = rawTop;
  if (rawTop + 320 > winHeight) {
    finalTop = rect.top + spanOffsetTop - element.scrollTop - 324;
  }
  finalTop = Math.max(10, Math.min(finalTop, winHeight - 330));

  const finalLeft = Math.max(16, Math.min(rawLeft, winWidth - 320));

  return {
    top: isNaN(finalTop) ? 120 : finalTop,
    left: isNaN(finalLeft) ? 100 : finalLeft,
    height: lineHeight,
  };
}
