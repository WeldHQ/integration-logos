import fs from "fs";
import path from "path";
import stream, { Readable } from "stream";

import { NextApiRequest, NextApiResponse } from "next";
import { NextRequest, NextResponse } from "next/server";

import config from "@/../logos/config.json";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

const mimeTypes: Record<string, string> = {
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
};

export default async function getImage(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const integrationId = req.query.integrationId as string;
  if (!integrationId) {
    return NextResponse.json(
      { error: "404 Not Found" },
      { status: 404, headers: { ...corsHeaders } }
    );
  }

  const integrationsFolder = "/logos/integrations";
  const filePath = path.join(
    process.cwd(),
    integrationsFolder,
    integrationId,
    config[integrationId as keyof typeof config].fileName
  );

  const ext = path.extname(filePath);
  const stats = fs.statSync(filePath);

  res.setHeader("Content-Length", stats.size);
  res.setHeader("Content-Type", mimeTypes[ext]);

  const readStream = fs.createReadStream(filePath);
  const ps = new stream.PassThrough();
  stream.pipeline(readStream, ps, (err) => {
    if (err) {
      console.log(err); // No such file or any other kind of error
      return res.status(400);
    }
  });
  ps.pipe(res);
}
