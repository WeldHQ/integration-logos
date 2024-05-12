import fs from "fs";
import path from "path";

import { extractColors } from "extract-colors";
import { FinalColor } from "extract-colors/lib/types/Color.js";
import getPixels from "get-pixels";
import svg2img, { svg2imgOptions } from "svg2img";

const configFilePath = path.join(process.cwd(), "config.json");
const integrationsPath = path.join(process.cwd(), "integrations");

type HSLColor = { h: number; s: number; l: number };

const imageExtensions = [".svg", ".png"];

function resolveIntegrationsFromDir() {
  const integrations = fs
    .readdirSync(integrationsPath)
    .map((x) => {
      const stat = fs.statSync(path.join(integrationsPath, x));
      let files: string[] = [];
      if (stat.isDirectory()) {
        files = fs
          .readdirSync(path.join(integrationsPath, x))
          .filter((x) => imageExtensions.includes(path.extname(x)));
      }
      return {
        integrationId: x,
        fileName: files[0],
        files,
      };
    })
    .filter((x) => x.fileName !== undefined);
  return integrations;
}

async function convertSvgToPng(svgPath: string): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    svg2img(
      svgPath,
      { format: "png" as NonNullable<svg2imgOptions["format"]> },
      (err, buffer: Uint8Array) => {
        if (err) {
          reject(err);
        } else {
          resolve(buffer);
        }
      }
    );
  });
}

async function extractColorsFromImage(
  imagePathOrBuffer: string | Uint8Array
): Promise<Awaited<ReturnType<typeof extractColors>>> {
  return new Promise(async (resolve, reject) => {
    getPixels(imagePathOrBuffer, "image/png", async (err, pixels) => {
      if (!err) {
        const data = Array.from(pixels.data);
        const width = Math.round(Math.sqrt(data.length));
        const height = width;
        const colors = await extractColors({ data, width, height });
        resolve(colors);
      } else {
        reject(err);
      }
    });
  });
}

function normalizeHSLColor(color: FinalColor): HSLColor {
  return {
    h: Math.floor(color.hue * 360),
    s: Math.floor(color.saturation * 100),
    l: Math.floor(color.lightness * 100),
  };
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

async function run() {
  const currentIntegrations = resolveIntegrationsFromDir();
  const previousConfig = (await import(configFilePath)).default;

  const newConfig: {
    integrationId: string;
    fileName: string;
    fileType: string;
    bg: string;
    bg_dark: string;
  }[] = [];

  const newIntegrationIds: typeof currentIntegrations = [];
  currentIntegrations.forEach((item) => {
    if (previousConfig.hasOwnProperty(item.integrationId)) {
      // Reuse config for existing integrations
      newConfig.push({
        integrationId: item.integrationId,
        fileName: item.fileName,
        fileType: path.extname(item.fileName),
        bg: previousConfig[item.integrationId as keyof typeof previousConfig]
          .bg,
        bg_dark:
          previousConfig[item.integrationId as keyof typeof previousConfig]
            .bg_dark,
      });
    } else {
      newIntegrationIds.push(item);
    }
  });

  const newIntegrationConfigPromises = newIntegrationIds.map(async (item) => {
    return new Promise<typeof item & { color: HSLColor }>(
      async (resolve, reject) => {
        const imagePath = path.join(
          integrationsPath,
          item.integrationId,
          item.fileName
        );

        if (imagePath.endsWith(".svg")) {
          try {
            const buffer = await convertSvgToPng(imagePath);
            const colors = await extractColorsFromImage(buffer);
            resolve({ ...item, color: normalizeHSLColor(colors[0]) });
          } catch (err) {
            console.log(err);
            reject(err);
          }
        } else {
          const colors = await extractColorsFromImage(imagePath);
          resolve({ ...item, color: normalizeHSLColor(colors[0]) });
        }
      }
    );
  });

  for (let newIntegration of await Promise.all(newIntegrationConfigPromises)) {
    const firstColor = newIntegration.color;

    const bg_light = blendHSLColorWithAlpha(
      {
        h: firstColor.h,
        s: firstColor.s,
        l: firstColor.l,
      },
      0.2
    );

    newConfig.push({
      integrationId: newIntegration.integrationId,
      fileName: newIntegration.fileName,
      fileType: path.extname(newIntegration.fileName),
      bg: `hsl(${bg_light.h} ${bg_light.s}% ${bg_light.l}%)`,
      bg_dark: `hsl(${bg_light.h} ${bg_light.s}% ${bg_light.l}% / 0.1)`,
    });
  }

  const obj = newConfig
    .sort((a, b) => a.integrationId.localeCompare(b.integrationId))
    .reduce((acc, item) => {
      acc[item.integrationId] = {
        fileName: item.fileName,
        fileType: item.fileType,
        bg: item.bg,
        bg_dark: item.bg_dark,
      };
      return acc;
    }, {} as { [key: string]: { bg: string; bg_dark: string; fileName: string; fileType: string } });

  fs.writeFileSync(configFilePath, JSON.stringify(obj, null, 2));
}

run();
