import fs from "fs";
import path from "path";

import { IconContainer } from "./IconContainer";

async function Page() {
  const imagesDirectory = path.join(process.cwd(), "src/assets/integrations");
  const integrationsIds = fs
    .readdirSync(imagesDirectory)
    .filter((x) => !x.includes("."));
  return (
    <main className="p-8">
      <div className="grid grid-cols-8 gap-4">
        {integrationsIds.map((id) => (
          <IconContainer key={id} id={id} size="lg" />
        ))}
      </div>
    </main>
  );
}

export default Page;
