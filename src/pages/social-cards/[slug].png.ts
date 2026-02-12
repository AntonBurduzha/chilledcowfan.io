import siteConfig from '~/site.config';
import { Resvg } from '@resvg/resvg-js';
import type { APIContext, InferGetStaticPropsType } from 'astro';
import satori, { type SatoriOptions } from 'satori';
import { html } from 'satori-html';
import { dateString, getSortedPosts, resolveThemeColorStyles } from '~/utils';
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
  height: 630,
  width: 1200,
};

const markupHome = (title: string, author: string) =>
  html(`<div tw="flex w-full h-full items-center justify-center bg-[${bg}] text-[${fg}] p-12">
    <div style="border-width: 10px; border-radius: 60px;" tw="flex items-center px-16 py-12 border-[${accent}]/30">
      ${avatarBase64 ? `<img src="${avatarBase64}" tw="w-48 h-48 rounded-full mr-12" style="border-width: 4px; border-color: ${accent}40;" />` : ''}
      <div tw="flex flex-col">
        <h1 tw="text-7xl m-0">${title}</h1>
        <p tw="text-4xl mt-6 text-[${accent}]">${author}</p>
      </div>
    </div>
  </div>`);

const markupPost = (title: string, pubDate: string | undefined, author: string) =>
  html(`<div tw="flex flex-col w-full h-full bg-[${bg}] text-[${fg}] p-12">
    <div style="border-width: 10px; border-radius: 60px;" tw="flex flex-col flex-1 justify-between px-16 py-12 border-[${accent}]/30">
      <div tw="flex flex-col">
        ${pubDate ? `<p tw="text-3xl text-[${accent}]">${pubDate}</p>` : ''}
        <h1 tw="text-5xl leading-snug mt-4">${title}</h1>
      </div>
      <div tw="flex items-center">
        ${avatarBase64 ? `<img src="${avatarBase64}" tw="w-20 h-20 rounded-full mr-6" />` : ''}
        <p tw="text-3xl text-[${accent}]">${author}</p>
      </div>
    </div>
  </div>`);

type Props = InferGetStaticPropsType<typeof getStaticPaths>;

export async function GET(context: APIContext) {
  const { pubDate, title, author } = context.props as Props;
  const node = !pubDate ? markupHome(title, author) : markupPost(title, pubDate, author);
  const svg = await satori(node as ReactNode, {
    ...ogOptions,
    ...((!pubDate && { height: 360, width: 1040 }) as Partial<SatoriOptions>),
  });
  const png = new Resvg(svg).render().asPng();
  return new Response(new Uint8Array(png), {
    headers: {
      'Cache-Control': 'public, max-age=31536000, immutable',
      'Content-Type': 'image/png',
    },
  });
}

export async function getStaticPaths() {
  const posts = await getSortedPosts();
  return posts
    .map((post) => ({
      params: { slug: post.id },
      props: {
        pubDate: post.data.published ? dateString(post.data.published) : undefined,
        title: post.data.title,
        author: post.data.author || siteConfig.author,
      },
    }))
    .concat([
      {
        params: { slug: '__default' },
        props: {
          pubDate: undefined,
          title: siteConfig.title,
          author: siteConfig.author,
        },
      },
    ]);
}
