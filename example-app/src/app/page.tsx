import Image from "next/image";

import config from "@weld/integration-logos";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <div className="flex gap-4 flex-wrap">
        <Image
          src={require("@weld/integration-logos/activecampaign.svg").default}
          alt="asd"
          width={100}
          height={100}
        />
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
