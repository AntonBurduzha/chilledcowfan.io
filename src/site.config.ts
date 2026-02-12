import type { SiteConfig } from '~/types';

const config: SiteConfig = {
  // Absolute URL to the root of your published site, used for generating links and sitemaps.
  site: 'https://chilledcow.fan',
  // The name of your site, used in the title and for SEO.
  title: 'Chilledcow.fan',
  // The description of your site, used for SEO and RSS feed.
  description:
    'Personal website by Anton Burduzha — a senior software engineer sharing deep dives into web development',
  // The author of the site, used in the footer, SEO, and RSS feed.
  author: 'Anton Burduzha',
  // Keywords for SEO, used in the meta tags.
  tags: [
    'JavaScript',
    'TypeScript',
    'React',
    'Next.js',
    'Frontend Development',
    'Software Engineering',
    'Web Development',
    'Programming Tutorials',
    'Tech Blog',
  ],
  // Path to the image used for generating social media previews.
  // Needs to be a square JPEG file due to limitations of the social card generator.
  // Try https://squoosh.app/ to easily convert images to JPEG.
  socialCardAvatarImage: './src/content/avatar.jpeg',
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
    include: ['min-light', 'catppuccin-mocha'],
    overrides: {
      'min-light': {
        accent: '#6f51a6',
        heading1: '#6f51a6',
        heading2: '#6f51a6',
        heading3: '#6f51a6',
        heading4: '#6f51a6',
        heading5: '#6f51a6',
        heading6: '#6f51a6',
        separator: '#6f51a6',
        link: '#6f51a6',
      },
    },
  },
  socialLinks: {
    github: 'https://github.com/AntonBurduzha',
    email: 'anton.burduzha@gmail.com',
    linkedin: 'https://www.linkedin.com/in/anton-burduzha/',
    x: 'https://x.com/chilledcowfan',
    rss: true, // Set to true to include an RSS feed link in the footer
  },
};

export default config;
