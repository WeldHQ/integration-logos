import fs from "fs";
import path from "path";

const integrationFolders = fs.readdirSync(
  path.join(process.cwd(), "src/assets/integrations")
);

const integrations = new Map();

integrationFolders.forEach((integrationId) => {
  const stats = fs.statSync(
    path.join(process.cwd(), "src/assets/integrations", integrationId)
  );
  if (stats.isDirectory()) {
    const iconFiles = fs
      .readdirSync(
        path.join(process.cwd(), "src/assets/integrations", integrationId)
      )
      .filter((x) => x.startsWith("icon."));
    const iconFile = iconFiles[0];
    integrations.set(
      integrationId,
      `src/assets/integrations/${integrationId}/${iconFile}`
    );
  }
});
console.log(integrations);

fs.mkdir(path.join(process.cwd(), "dist"), { recursive: true }, (err) => {
  if (err) throw err;
});
fs.writeFileSync(
  path.join(process.cwd(), "dist", "index.mjs"),
  `
  export * as ${"airtable"} from "${integrations.get("airtable")}";
`
);

export {};
