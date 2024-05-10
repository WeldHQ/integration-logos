import Image from "next/image";

import config from "@weld/integration-logos";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <div className="flex gap-4 flex-wrap">
        {Object.keys(config).map((id) => (
          <IntegrationIcon key={id} id={id} />
        ))}
      </div>

      <div className="my-10">
        <h1 className="text-4xl font-bold mb-4">config.json</h1>
        <pre className="p-2 border rounded-md border-slate-400 code text-xs h-40 overflow-auto">
          {JSON.stringify(config, null, 2)}
        </pre>
      </div>
    </main>
  );
}

function IntegrationIcon(props: { id: string }) {
  const { id } = props;
  const c = config[id as keyof typeof config];
  try {
    const logo = require(`@weld/integration-logos/${id}${c.fileType}`);
    console.log(`@weld/integration-logos/${id}${c.fileType}`, logo);
    // return (
    //   <Image
    //     src={logo.default}
    //     alt={id}
    //     className="w-8 h-8 p-2 rounded"
    //     style={{ backgroundColor: c.bg }}
    //   />
    // );
  } catch (error) {
    console.error({ id, error });
  }
  return null;
}
