import fs from "fs";
import path from "path";

function resolveIntegrations() {
  const integrations = fs
    .readdirSync(path.join(process.cwd(), "logos/integrations"))
    .filter((x) =>
      fs
        .statSync(path.join(process.cwd(), "logos/integrations", x))
        .isDirectory()
    );
  return integrations;
}

const integrations = resolveIntegrations();

const config = integrations.reduce((acc, integrationId) => {
  acc[integrationId] = {
    backgroundColor: "hsl(200 50% 80%)",
  };
  return acc;
}, {});
console.log(config);

fs.writeFileSync(
  "logos/config.ts",
  `const integrations = ${JSON.stringify(config, null, 2)};
export default integrations;`
);
