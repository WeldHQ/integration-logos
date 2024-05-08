import fs from "fs";
import path from "path";

import { ComponentProps } from "react";

import config from "@/../logos";
import IconWithBG from "@/app/components/icon/IconWithBG";
import { HSLColor, formatHSLA, parseHSLA } from "@/app/util/colors";

import { Icon } from "./Icon";

const defaultBackground = { h: 0, s: 0, l: 0.95, a: 1 };

function useIntegrationConfig(integrationId: string) {
  const baseUrl = `/logos/integrations/${integrationId}`;
  const iconFiles = fs
    .readdirSync(path.join(process.cwd(), baseUrl))
    .filter((x) => x.startsWith("icon."));

  if (iconFiles.length === 0) {
    return null;
  }
  const iconFile = iconFiles[0];
  const filePath = path.join(process.cwd(), baseUrl, iconFile);
  const fileStats = fs.statSync(filePath);

  const colorConfig: {
    bg?: string;
    bg_dark?: string;
  } = config[integrationId as keyof typeof config];
  return {
    url: `/api/images/integrations/${integrationId}`,
    size: fileStats.size,
    type: path.extname(iconFile),
    bg: {
      light: colorConfig.bg ? parseHSLA(colorConfig.bg) : defaultBackground,
      dark: colorConfig.bg_dark
        ? parseHSLA(colorConfig.bg_dark)
        : defaultBackground,
    },
  };
}

function useUpdateColorConfig() {
  return async (
    integrationId: string,
    colorConfig: {
      light: HSLColor;
      dark: HSLColor;
    }
  ) => {
    "use server";
    const configFilePath = path.join(process.cwd(), "logos/config.json");
    const config = (await import("@/../logos/config.json")).default;

    config[integrationId as keyof typeof config] = {
      bg: formatHSLA(colorConfig.light),
      bg_dark: formatHSLA(colorConfig.dark),
    };

    fs.writeFileSync(configFilePath, JSON.stringify(config, null, 2));
  };
}

export function IconContainer(
  props: {
    id: string;
  } & Pick<Partial<ComponentProps<typeof IconWithBG>>, "size">
) {
  const { id, ...restProps } = props;
  const config = useIntegrationConfig(id);
  const update = useUpdateColorConfig();

  console.log("file", config);

  async function updateColor(config: { light: HSLColor; dark: HSLColor }) {
    "use server";
    update(id, config);
  }

  if (config == null) {
    return (
      <IconWithBG
        {...restProps}
        icon={<div>?</div>}
        color="hsl(0 0% 25%)"
        size={props.size}
      />
    );
  }

  return (
    <Icon id={id} config={config} onColorChange={updateColor} {...restProps} />
  );
}
