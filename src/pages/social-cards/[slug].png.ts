import siteConfig from '~/site.config';
import { Resvg } from '@resvg/resvg-js';
import type { APIContext, InferGetStaticPropsType } from 'astro';
import satori, { type SatoriOptions } from 'satori';
import { html } from 'satori-html';
import { resolveThemeColorStyles } from '~/utils';
import path from 'path';
import fs from 'fs';
import type { ReactNode } from 'react';

// Load the font file as binary data
const fontPath = path.resolve(
  './node_modules/@expo-google-fonts/jetbrains-mono/400Regular/JetBrainsMono_400Regular.ttf',
);
const fontData = fs.readFileSync(fontPath); // Reads the file as a Buffer

const avatarPath = path.resolve(siteConfig.socialCardAvatarImage);
let avatarBase64: string | undefined;
if (
  fs.existsSync(avatarPath) &&
  (path.extname(avatarPath).toLowerCase() === '.jpg' ||
    path.extname(avatarPath).toLowerCase() === '.jpeg')
) {
  avatarBase64 = `data:image/jpeg;base64,${fs.readFileSync(avatarPath).toString('base64')}`;
}

const defaultTheme = siteConfig.themes.default;

const themeStyles = await resolveThemeColorStyles(
  [defaultTheme],
  siteConfig.themes.overrides,
);
const bg = themeStyles[defaultTheme]?.background;
const fg = themeStyles[defaultTheme]?.foreground;
const accent = themeStyles[defaultTheme]?.accent;

if (!bg || !fg || !accent) {
  throw new Error(`Theme ${defaultTheme} does not have required colors`);
}

const ogOptions: SatoriOptions = {
  // debug: true,
  fonts: [
    {
      data: fontData,
      name: 'JetBrains Mono',
      style: 'normal',
      weight: 400,
    },
  ],
  height: 360,
  width: 1040,
};

const markupHome = (title: string, author: string) =>
  html(`<div tw="flex w-full h-full items-center justify-center bg-[${bg}] text-[${fg}] py-10 px-20">
    <div style="border-width: 10px; border-radius: 60px;" tw="flex items-center px-10 py-10 border-[${accent}]/30">
      ${avatarBase64 ? `<img src="${avatarBase64}" tw="w-48 h-48 rounded-full mr-12" style="border-width: 4px; border-color: ${accent}40;" />` : ''}
      <div tw="flex flex-col">
        <h1 tw="text-7xl m-0">${title}</h1>
        <p tw="text-4xl mt-6 text-[${accent}]">${author}</p>
      </div>
    </div>
  </div>`);

type Props = InferGetStaticPropsType<typeof getStaticPaths>;

export async function GET(context: APIContext) {
  const { title, author } = context.props as Props;
  const node = markupHome(title, author);
  const svg = await satori(node as ReactNode, ogOptions);
  const png = new Resvg(svg).render().asPng();
  return new Response(new Uint8Array(png), {
    headers: {
      'Cache-Control': import.meta.env.PROD
        ? 'public, max-age=31536000, immutable'
        : 'no-cache',
      'Content-Type': 'image/png',
    },
  });
}

export async function getStaticPaths() {
  return [
    {
      params: { slug: '__default' },
      props: {
        title: siteConfig.title,
        author: siteConfig.author,
      },
    },
  ];
}
