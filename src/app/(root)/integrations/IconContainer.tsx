import fs from "fs";
import path from "path";

import { ComponentProps } from "react";

import IconWithBG from "@/app/components/icon/IconWithBG";
import cn from "@/app/util/cn";

const byteValueNumberFormatter = Intl.NumberFormat("en", {
  notation: "compact",
  style: "unit",
  unit: "byte",
  unitDisplay: "narrow",
});

function useFile(integrationId: string) {
  const baseUrl = `/src/assets/integrations/${integrationId}`;
  // console.log(path.join(process.cwd(), baseUrl));
  const iconFiles = fs
    .readdirSync(path.join(process.cwd(), baseUrl))
    .filter((x) => x.startsWith("icon."));
  // console.log({ iconFiles });
  if (iconFiles.length === 0) {
    return null;
  }
  const iconFile = iconFiles[0];
  const filePath = path.join(process.cwd(), baseUrl, iconFile);
  const fileStats = fs.statSync(filePath);
  return {
    url: `/api/images/integrations/${integrationId}`,
    size: fileStats.size,
    type: path.extname(iconFile),
  };
}

export function IconContainer(
  props: {
    id: string;
  } & Pick<Partial<ComponentProps<typeof IconWithBG>>, "size">
) {
  const { id, ...restProps } = props;
  const file = useFile(id);
  if (file == null) {
    return (
      <Box>
        <IconWithBG {...restProps} icon={<div>?</div>} size={props.size} />
        <div className="w-full text-sm truncate text-center">
          <span>{props.id}</span>
        </div>
      </Box>
    );
  }
  return (
    <Box className={cn({ "outline outline-red-500": file.size > 10_000 })}>
      <IconWithBG
        {...restProps}
        icon={<img src={file.url} alt={file.url} />}
        // color={getIntegrationIconColorInRgba(integrationId, 0.2)}
        size={props.size}
      />
      <div className="w-full text-sm truncate text-center">
        <span>{props.id}</span>
      </div>
      <div className="absolute top-0 left-0.5">
        <div className={cn("text-xs")}>{file.type}</div>
      </div>
      <div className="absolute top-0 right-0.5">
        <div className={cn("text-xs")}>
          {byteValueNumberFormatter.format(file.size)}
        </div>
      </div>
    </Box>
  );
}

function Box(props: ComponentProps<"div">) {
  return (
    <div
      {...props}
      className={cn(
        "flex flex-col gap-1 items-center overflow-hidden border border-border/70 rounded-md p-2 relative",
        props.className
      )}
    >
      {props.children}
    </div>
  );
}
