---
title: 'Implementing i18n in Next.js: A Guide to Non-Route-Based Localization'
description: ''
published: 2023-02-22
draft: false
tags: ['web development', 'nextjs', 'javascript']
---

## Motivation

Recently, we migrated our sub-project from `react-localization` to `i18next`. During that migration, the main goal was to keep the previous behavior of setting and changing language in our app.

Storing language in a route path is a commonly used practice for the Nextjs framework. But for our project, that was an inappropriate solution. Our main application allows businesses to generate QR codes for their customers with a link to the sub-application where the end user can leave feedback regarding service quality and satisfaction. All QR codes had already been printed, and new ones would cost a fortune for the business. The previous version of the sub-app used to be built on the base of CRA, and only half a year ago, it was migrated to Nextjs. So, we were looking for library or libraries which could provide us with non-route-based internationalization and API similar to `react-i18next`. We found `ni18n`. This is a library specifically designed for use with Nextjs. `ni18n` provides a simple and flexible way to add i18n functionality to Nextjs projects, including support for server-side rendering and other advanced features.

## Basic Setup

Let’s install all necessary dependencies to start working on our project.

```shell
npm install i18next react-i18next ni18n
```

The next step is to expand the existing `next.config.js` with the default i18n config.

Basically, we need only a few fields for a quick start. `locales` is required to show all the locales we want to support in the app, and `defaultLocale` will be used when visiting a non-locale prefixed path (for us, it’s just the default language).

```js title="next.config.js"
module.exports = {
  ...yourNextConfig,
  i18n: {
    defaultLocale: 'GB',
    locales: ['GB', 'UA', 'PT'],
  },
};
```

Then we are required to create a new file in the root or utils/plugins/etc. directory named `ni18n.config.js`. `supportedLngs` - names which show us supported languages, and `ns` - namespaces, which we can use in some cases.

```js title="ni18n.config.js"
export const ni18nConfig = {
  supportedLngs: ['GB', 'UA', 'PT'],
  ns: ['namespace-name'],
};
```

A few more things left. Our application requires `I18nextProvider`, so let’s wrap the `App` with the high-order component imported from `i18n`.

It will initialize the `i18nex` instance and provide it as a context for all the children.

```js title="pages/_app.jsx"
import { appWithI18Next } from 'ni18n';
import { ni18nConfig } from '../ni18n.config';

const App = ({ Component, pageProps }) => <Component {...pageProps} />;

export default appWithI18Next(App, ni18nConfig);
```

And the last preparation step before we started using translation into our components is a filling of translation files. The important thing - keep the following file structure.

```js title="./public"
└── locales
    ├── GB
    │   ├── namespace-name.json  // { "key1": "Test" }
    │
    ├── UA
    │   ├── namespace-name.json  // { "key1": "Тест" }
    │
    ├── PT
		    ├── namespace-name.json  // { "key1": "Teste" }
```

Finally, we’ve done with the setup and are ready to start integration of the i18n feature into components. Let’s take a look at the example in `ComponentName.jsx`.

We extract the `t` function from `useTranslation` hook which will return translated string for the selected language. Looks simple, doesn’t it?

```js title="ComponentName.jsx"
import { useTranslation } from 'react-i18next';

export const MyComponent = () => {
  const { t } = useTranslation();
  return <div>{t('key1')}</div>;
};
```

If you store user language in DB, don’t forget to create a context with `React.Context` or any other solution to wrap pages and set the language in `useEffect`. Below, I’ll show you a simple snippet of how it could be implemented.

```js title="ContextName.jsx"
const I18nProvider = ({ children, data }) => {
  const { i18n } = useTranslation();

  const { language = 'GB' } = data;

  useEffect(() => {
    i18n.changeLanguage(language);
  }, [language]);

  return <I18nContext.Provider>{children}</I18nContext.Provider>;
};
```

That’s it. I hope it helped you to save some time, as always. In the future, we are going to migrate the existing i18n approach to route based. The reason is pretty simple - a unification of all our applications. I’ll definitely describe it in one of my next articles.
