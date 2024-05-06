import fs from "fs";
import path from "path";

import { ComponentProps } from "react";

import IconWithBG from "./IconWithBG";

export default function IntegrationImage(
  props: Partial<ComponentProps<typeof IconWithBG>> & {
    src: string;
  }
) {
  const { src, ...restProps } = props;
  const p = path.join(process.cwd(), "public", src);
  if (fs.existsSync(p)) {
    const fileStats = fs.statSync(p);
    console.log(fileStats.size);
    return (
      <>
        <IconWithBG
          {...restProps}
          icon={<img src={src} alt={src} />}
          // color={getIntegrationIconColorInRgba(integrationId, 0.2)}
          size={props.size}
        />
        <div className="absolute top-1 right-1">
          <FileSizeAlert size={fileStats.size} />
        </div>
      </>
    );
  }
  return (
    <IconWithBG
      {...restProps}
      icon={<div>?</div>}
      // color={getIntegrationIconColorInRgba(integrationId, 0.2)}
      size={props.size}
    />
  );
}

function FileSizeAlert(props: { size: number }) {
  if (props.size > 10_000) {
    return <div className="rounded-full w-3 h-3 bg-red-500" />;
  }
  if (props.size > 5_000) {
    return <div className="rounded-full w-3 h-3 bg-orange-500" />;
  }
  return null;
}
