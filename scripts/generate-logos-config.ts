import fs from "fs";
import path from "path";

import { extractColors } from "extract-colors";
import { FinalColor } from "extract-colors/lib/types/Color.js";
import getPixels from "get-pixels";
import svg2img, { svg2imgOptions } from "svg2img";

import { blendHSLColorWithAlpha } from "@/app/util/colors";

const configFilePath = path.join(process.cwd(), "logos/config.json");
const integrationsPath = path.join(process.cwd(), "logos/integrations");

type HSLColor = { h: number; s: number; l: number };

function resolveIntegrationsFromDir() {
  const integrations = fs
    .readdirSync(integrationsPath)
    .map((x) => {
      const stat = fs.statSync(path.join(integrationsPath, x));
      let files: string[] = [];
      if (stat.isDirectory()) {
        files = fs
          .readdirSync(path.join(integrationsPath, x))
          .filter((x) => x.startsWith("icon."));
      }
      return {
        integrationId: x,
        isDirectory: stat.isDirectory(),
        files,
      };
    })
    .filter((x) => x.isDirectory && x.files.length > 0);
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

async function run() {
  const currentIntegrations = resolveIntegrationsFromDir();
  const previousConfig = (await import(configFilePath)).default;

  const newConfig: { integrationId: string; bg: string; bg_dark: string }[] =
    [];

  const newIntegrationIds: typeof currentIntegrations = [];
  currentIntegrations.forEach((item) => {
    if (previousConfig.hasOwnProperty(item.integrationId)) {
      // Reuse config for existing integrations
      newConfig.push({
        integrationId: item.integrationId,
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
          process.cwd(),
          "logos/integrations",
          item.integrationId,
          item.files[0]
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

    const bg_dark = firstColor;
    bg_dark.l *= 0.4;
    bg_dark.s *= 0.8;

    newConfig.push({
      integrationId: newIntegration.integrationId,
      bg: `hsl(${bg_light.h} ${bg_light.s}% ${bg_light.l}%)`,
      bg_dark: `hsl(${bg_dark.h} ${bg_dark.s}% ${bg_dark.l}%)`,
    });
  }

  const obj = newConfig
    .sort((a, b) => a.integrationId.localeCompare(b.integrationId))
    .reduce((acc, item) => {
      acc[item.integrationId] = {
        bg: item.bg,
        bg_dark: item.bg_dark,
      };
      return acc;
    }, {} as { [key: string]: { bg: string; bg_dark: string } });

  fs.writeFileSync(configFilePath, JSON.stringify(obj, null, 2));
}

run();
