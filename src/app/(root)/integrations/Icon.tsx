"use client";

import { useTheme } from "next-themes";
import { ComponentProps, useEffect, useRef, useState } from "react";
import { HslColor, HslColorPicker } from "react-colorful";
import { useDebouncedCallback } from "use-debounce";

import IconWithBG from "@/app/components/icon/IconWithBG";
import cn from "@/app/util/cn";
import { formatHSLA, rgbToHsl } from "@/app/util/colors";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import ColorThief from "@neutrixs/colorthief";

const colorThief = new ColorThief();

const byteValueNumberFormatter = Intl.NumberFormat("en", {
  notation: "compact",
  style: "unit",
  unit: "byte",
  unitDisplay: "narrow",
});

export function Icon(
  props: {
    id: string;
    config: {
      url: string;
      size: number;
      type: string;
      bg: {
        light: HslColor | null;
        dark: HslColor | null;
      };
    };
    onColorChange?: (config: { light: HslColor; dark: HslColor }) => void;
  } & Pick<Partial<ComponentProps<typeof IconWithBG>>, "size">
) {
  const { id, config, onColorChange, ...restProps } = props;
  const ref = useRef<HTMLDivElement>(null);
  const [backgroundConfig, setBackgroundConfig] = useState(config.bg);
  const { theme } = useTheme();
  const backgroundColor =
    (theme === "dark" ? backgroundConfig.dark : backgroundConfig.light) ??
    undefined;
  return (
    <Box className={cn({ "outline outline-red-500": config.size > 10_000 })}>
      <Popover>
        <PopoverTrigger asChild>
          <IconWithBG
            ref={ref}
            {...restProps}
            icon={<img src={config.url} alt={config.url} />}
            color={backgroundColor ? formatHSLA(backgroundColor) : undefined}
            size={props.size}
          />
        </PopoverTrigger>
        <PopoverContent className="w-fit p-0">
          <ConfigureIntegration
            config={config}
            onSelectColor={(config) => {
              setBackgroundConfig(config);
              onColorChange?.(config);
            }}
          />
        </PopoverContent>
      </Popover>
      <div className="w-full text-sm truncate text-center">
        <span>{props.id}</span>
      </div>
      <div className="absolute top-0 left-0.5">
        <div className={cn("text-xs")}>{config.type}</div>
      </div>
      <div className="absolute top-0 right-0.5">
        <div className={cn("text-xs")}>
          {byteValueNumberFormatter.format(config.size)}
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
        "flex flex-col gap-1 items-center overflow-hidden border border-border/70 rounded-md pt-6 px-2 pb-2 relative",
        props.className
      )}
    >
      {props.children}
    </div>
  );
}

function ConfigureIntegration(props: {
  config: {
    url: string;
    size: number;
    type: string;
    bg: {
      light: HslColor | null;
      dark: HslColor | null;
    };
  };
  onSelectColor: (config: { light: HslColor; dark: HslColor }) => void;
}) {
  const [palette, setPalette] = useState<number[][]>([]);
  const [colorConfig, setColorConfig] = useState(props.config.bg);

  const onSelectColorDebounced = useDebouncedCallback((value) => {
    props.onSelectColor(value);
  }, 1000);

  useEffect(() => {
    async function fetchPalette() {
      const img = document.createElement("img");
      img.src = props.config.url;
      img.onload = () => {
        const palette = colorThief.getPalette(img, 8);
        const arrayStrings = palette.map((tuple) => JSON.stringify(tuple));
        const uniquePalette = Array.from(new Set(arrayStrings)).map((str) =>
          JSON.parse(str)
        );

        setPalette(
          uniquePalette.map(([r, g, b]) => {
            const [h, s, l] = rgbToHsl(r, g, b);
            return [h * 360, s, l];
          })
        );
      };
    }
    fetchPalette();
  }, [props.config.url]);

  return (
    <div>
      <div className="flex">
        <div id="light" className="light" style={{ colorScheme: "light" }}>
          <div className="bg-background p-4">
            <div className="flex justify-center mb-6">
              <IconWithBG
                icon={<img src={props.config.url} alt={props.config.url} />}
                color={
                  colorConfig.light ? formatHSLA(colorConfig.light) : undefined
                }
                size="xl"
              />
            </div>
            <ConfigureColorMode
              color={colorConfig.light}
              palette={palette}
              onSelectColor={(color) => {
                setColorConfig((prev) => ({
                  ...prev,
                  light: color,
                }));
                onSelectColorDebounced({
                  light: color,
                  dark: colorConfig.dark ?? color,
                });
              }}
            />
          </div>
        </div>
        <div id="dark" className="dark" style={{ colorScheme: "dark" }}>
          <div className="bg-background p-4">
            <div className="flex justify-center mb-6">
              <IconWithBG
                icon={<img src={props.config.url} alt={props.config.url} />}
                color={
                  colorConfig.dark ? formatHSLA(colorConfig.dark) : undefined
                }
                size="xl"
              />
            </div>
            <ConfigureColorMode
              color={colorConfig.dark}
              palette={palette}
              onSelectColor={(color) => {
                setColorConfig((prev) => ({
                  ...prev,
                  dark: color,
                }));
                onSelectColorDebounced({
                  dark: color,
                  light: colorConfig.light ?? color,
                });
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function ConfigureColorMode(props: {
  color: HslColor | null;
  palette: number[][];
  onSelectColor: (color: HslColor) => void;
}) {
  return (
    <div className="flex flex-col gap-4 items-center">
      <div className="flex">
        {props.palette.map(([h, s, l], i) => {
          return (
            <div
              key={i}
              style={{
                backgroundColor: `hsl(${h}, ${s * 100}%, ${l * 100}%)`,
              }}
              className="w-8 h-12"
              onClick={() => {
                props.onSelectColor({ h, s, l });
              }}
            />
          );
        })}
      </div>
      <HslColorPicker
        color={
          props.color
            ? {
                ...props.color,
                s: props.color.s * 100,
                l: props.color.l * 100,
              }
            : undefined
        }
        onChange={(value) => {
          const newColor = {
            ...value,
            s: value.s / 100,
            l: value.l / 100,
          };
          props.onSelectColor(newColor);
        }}
      />
    </div>
  );
}
