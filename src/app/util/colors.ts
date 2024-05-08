export interface HSLColor {
  h: number;
  s: number;
  l: number;
}

export function formatHSLA(color: HSLColor) {
  return `hsl(${Math.floor(color.h)} ${Math.floor(color.s * 100)}% ${Math.floor(
    color.l * 100
  )}%)`;
}

export function parseHSLA(colorString: string): HSLColor | null {
  // Regular expression to match the components of the HSLA color string
  const regex =
    /hsla?\(\s*([0-9.]+)\s+([0-9.]+)%\s+([0-9.]+)%(\s*\/\s*([0-9.]+))?\s*\)/;
  const match = colorString.match(regex);

  if (!match) {
    // If the string doesn't match the expected format, return null or handle the error accordingly
    return null;
  }

  // Extract the components and convert them into usable format
  const hue = parseFloat(match[1]);
  const saturation = parseFloat(match[2]) / 100;
  const lightness = parseFloat(match[3]) / 100;

  return {
    h: hue,
    s: saturation,
    l: lightness,
  };
}

export function rgbToHsl(
  r: number,
  g: number,
  b: number
): [number, number, number] {
  (r /= 255), (g /= 255), (b /= 255);

  const max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  let h = 0,
    s,
    l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return [h, s, l];
}

export function blendHSLColorWithAlpha(
  hslColor: { h: number; s: number; l: number },
  alpha: number
) {
  let colorObj: { h: number; s: number; l: number } = { h: 0, s: 0, l: 0 };
  if (typeof hslColor === "string") {
    const parsedColor = parseHSLA(hslColor);
    if (!parsedColor) {
      return hslColor;
    }
    colorObj = parsedColor;
  } else {
    colorObj = hslColor;
  }
  // Blend color with white background
  const blendedLightness = alpha * colorObj.l + (1 - alpha) * 100;
  return {
    h: colorObj.h,
    s: colorObj.s,
    l: blendedLightness,
  };
}
