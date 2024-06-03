import fs from "fs";
import path from "path";

import { createSVGWindow } from "svgdom";

import { SVG, registerWindow } from "@svgdotjs/svg.js";

import config from "../config.json";

type LogoConfig = (typeof config)[keyof typeof config];

if (!fs.existsSync("foobar")) {
  fs.mkdirSync("foobar", { recursive: true });
}

function processLogo(id: string, config: LogoConfig) {
  // returns a window with a document and an svg root node
  const window = createSVGWindow();
  const document = window.document;

  // register window and document
  registerWindow(window, document);

  const filePath = path.join(
    process.cwd(),
    "integrations",
    id,
    config.fileName
  );
  const file = fs
    .readFileSync(filePath, "utf-8")
    .replace(/^[\s\S]*?(?=<svg)/, "");

  // create canvas
  const canvas = SVG(document.documentElement) as any;
  canvas.size(48, 48);

  const rect = canvas.rect("100%", "100%").rx(4).fill(config.bg);
  const className = `logo-${id}__box`;
  rect.addClass(className);

  const logo = SVG(file);
  logo.size("100%", "100%");

  const logoViewBox = logo.attr("viewBox");
  if (logoViewBox == null || logoViewBox === "" || logoViewBox === "0 0 0 0") {
    logo.attr("viewBox", logo.bbox().toString());
  }

  const group = canvas.group();
  group.scale(0.6).attr("transform-origin", "50% 50%");

  logo.addTo(group);

  const style = canvas.style();
  style.rule(`.${className}`, {
    fill: config.bg,
  });
  style.rule(`.dark .${className}`, {
    fill: config.bg_dark,
  });

  fs.writeFileSync(path.join("foobar", `${id}_boxed.svg`), canvas.svg());
}

async function run() {
  Object.entries(config).forEach(([id, logo]) => {
    try {
      processLogo(id, logo);
    } catch (e) {
      console.error(`Error processing logo for ${id}:`, e);
    }
  });
  // processLogo("email", config["email"]);
}

run();
