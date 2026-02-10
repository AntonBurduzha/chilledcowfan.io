import type { SiteConfig } from '~/types';

const config: SiteConfig = {
  // Absolute URL to the root of your published site, used for generating links and sitemaps.
  site: 'https://multiterm.stelclementine.com',
  // The name of your site, used in the title and for SEO.
  title: 'MultiTerm',
  // The description of your site, used for SEO and RSS feed.
  description:
    'A coder-ready Astro blog theme with 59 of your favorite color schemes to choose from',
  // The author of the site, used in the footer, SEO, and RSS feed.
  author: 'Katy Kookaburra',
  // Keywords for SEO, used in the meta tags.
  tags: ['Astro', 'Terminal', 'Theme', 'MultiTerm', 'stelcodes'],
  // Path to the image used for generating social media previews.
  // Needs to be a square JPEG file due to limitations of the social card generator.
  // Try https://squoosh.app/ to easily convert images to JPEG.
  socialCardAvatarImage: './src/content/avatar.jpg',
  // Font imported from @fontsource or elsewhere, used for the entire site.
  // To change this see src/styles/global.css and import a different font.
  font: 'JetBrains Mono Variable',
  // For pagination, the number of posts to display per page.
  // The homepage will display half this number in the "Latest Posts" section.
  pageSize: 6,
  // Whether Astro should resolve trailing slashes in URLs or not.
  // This value is used in the astro.config.mjs file and in the "Search" component to make sure pagefind links match this setting.
  // It is not recommended to change this, since most links existing in the site currently do not have trailing slashes.
  trailingSlashes: false,
  // The theming configuration for the site.
  themes: {
    mode: 'light-dark',
    default: 'catppuccin-mocha',
    include: ['catppuccin-latte', 'catppuccin-mocha'],
    overrides: {
      // Improve readability for aurora-x theme
      // 'aurora-x': {
      //   background: '#292929FF',
      //   foreground: '#DDDDDDFF',
      //   warning: '#FF7876FF',
      //   important: '#FF98FFFF',
      //   note: '#83AEFFFF',
      // },
      // Make the GitHub dark theme a little cuter
      // 'github-light': {
      //   accent: 'magenta',
      //   heading1: 'magenta',
      //   heading2: 'magenta',
      //   heading3: 'magenta',
      //   heading4: 'magenta',
      //   heading5: 'magenta',
      //   heading6: 'magenta',
      //   separator: 'magenta',
      //   link: 'list',
      // },
    },
  },
  // Social links to display in the footer.
  socialLinks: {
    github: 'https://github.com/AntonBurduzha',
    email: 'anton.burduzha@gmail.com',
    linkedin: 'https://www.linkedin.com/in/anton-burduzha/',
    x: 'https://x.com/chilledcowfan',
    rss: true, // Set to true to include an RSS feed link in the footer
  },
};

export default config;
