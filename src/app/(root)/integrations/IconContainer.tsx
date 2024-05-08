import fs from "fs";
import path from "path";

import { ComponentProps, use } from "react";

import config from "@/../logos";
import IconWithBG from "@/app/components/icon/IconWithBG";
import { HSLColor, formatHSL, parseHSLA } from "@/app/util/colors";

import { Icon } from "./Icon";

const getIntegrationConfig = (integrationId: string) => {
  return config[integrationId as keyof typeof config];
};

const defaultBackground = { h: 0, s: 0, l: 0.95, a: 1 };

function useIntegrationConfig(integrationId: string) {
  const baseUrl = `/logos/integrations/${integrationId}`;
  const integrationConfig = getIntegrationConfig(integrationId);
  const filePath = path.join(
    process.cwd(),
    baseUrl,
    integrationConfig.fileName
  );
  const fileStats = fs.statSync(filePath);
  return {
    url: `/api/images/integrations/${integrationId}`,
    size: fileStats.size,
    type: path.extname(filePath),
    bg: {
      light: integrationConfig.bg
        ? parseHSLA(integrationConfig.bg)
        : defaultBackground,
      dark: integrationConfig.bg_dark
        ? parseHSLA(integrationConfig.bg_dark)
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
      ...config[integrationId as keyof typeof config],
      bg: formatHSL(colorConfig.light),
      bg_dark: formatHSL(colorConfig.dark),
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
