import fs from "fs";
import path from "path";

import config from "../config.json";

const imagesFolder = path.join(process.cwd(), process.argv[2]);
const distFolder = path.join(process.cwd(), process.argv[3]);

if (!fs.existsSync(distFolder)) {
  fs.mkdirSync(distFolder, { recursive: true });
}

Object.entries(config).forEach(([integrationId, integrationConfig]) => {
  fs.copyFile(
    path.join(imagesFolder, integrationId, integrationConfig.fileName),
    path.join(
      distFolder,
      `${integrationId}${path.extname(integrationConfig.fileName)}`
    ),
    (err) => {
      if (err) {
        console.error(err);
      }
    }
  );
});
