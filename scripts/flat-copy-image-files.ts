import fs from "fs";
import path from "path";

import config from "@/../logos/config.json";

const imagesFolder = path.join(process.cwd(), process.argv[2]);
const distFolder = path.join(process.cwd(), process.argv[3]);

Object.entries(config).forEach(([integrationId, integrationConfig]) => {
  fs.copyFile(
    path.join(imagesFolder, integrationId, integrationConfig.fileName),
    path.join(distFolder, integrationConfig.fileName),
    (err) => {
      if (err) {
        console.error(err);
      }
    }
  );
});
