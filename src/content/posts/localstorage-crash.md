---
title: 'Why localStorage Still Crashes Your Website in 2023'
description: ''
published: 2023-01-28
draft: false
tags: ['web development', 'javascript']
---

In autumn 2022, I decided to migrate one of our work projects from the Create React App to NextJs. The goal of this was to increase the performance of a few pages, separate pages for mobile devices from the main app, and decrease the number of 3rd parties with access. Most of our goals were achieved successfully but according to our Airbrake notifier, localStorage was always breaking something. I hadn’t previously considered that localStorge would be a challenge, as I had been storing users’ phone numbers and i18n keys there and couldn't use a backend API instead.

So, I needed localStorage to work since it was the only option for me.

## My challenges

One problem I faced was an error at compile time.

```js
ReferenceError: localStorage is not defined
```

Yeah, I was definitely a newbie to NextJs and totally missed the fact that my pages perform server render first and foremost. Meaning that `window` and `localStorage` wouldn't be accessible until the page is loaded on the client’s side.

```js
import { useEffect } from 'react';

useEffect(() => {
  const phoneNumber = localStorage.getItem('phoneNumber');
}, []);

// and
const onChange = (value) => localStorage.setItem('phoneNumber', value);
```

The solution was quite simple, to put everything related to it into useEffect and onChange handlers to make sure it reflects in the browser.

The second and the third were my biggest problems because I managed to solve them only after reading lots of articles, posts, and documentation pages.

```js
SecurityError: The operation is insecure.
```

We received this error only from the Safari browser, so I decided to dig a little further. I found an interesting fact. If all cookies in privacy and security settings are blocked by the user, every time your website calls either `localStorage` or `sessionStorage` it will cause an error.

```js
// Even calling
console.log(localStorage);
// or
localStorage?.getItem('phoneNumber');
```

Wrapping everything in `try...catch` wasn’t a good option because it would increase the existing codebase, which is bad practice. Following the code snippet on [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API?ref=hackernoon.com#feature-detecting_localstorage), I decided to write a utility class that would cover all vital components related to the `localStorage`.

```js
class AppStorage {
  getItem(key) {
    if (this.storageAvailable()) {
      return window.localStorage?.getItem(key);
    }
    return undefined;
  }

  setItem(key, value) {
    if (this.storageAvailable()) {
      window.localStorage?.setItem(key, value);
    }
  }

  storageAvailable(type = 'localStorage') {
    let storage;
    try {
      storage = window[type];
      const x = '__storage_test__';
      storage.setItem(x, x);
      storage.removeItem(x);
      return true;
    } catch (e) {
      return (
        e instanceof DOMException &&
        // everything except Firefox
        (e.code === 22 ||
          // Firefox
          e.code === 1014 ||
          // test name field too, because code might not be present
          // everything except Firefox
          e.name === 'QuotaExceededError' ||
          // Firefox
          e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
        // acknowledge QuotaExceededError only if there's something already stored
        storage &&
        storage.length !== 0
      );
    }
  }
}
// and inside our components
const phoneNumber = AppStorage.getItem('phoneNumber');
```

Looks quite elegant, doesn’t it?

We have this utility class in a separate file and can use it across the app by applying the [DRY](https://en.wikipedia.org/wiki/Don%27t_repeat_yourself) strategy. By the way, this utility class also helped to solve the last problem:

```js
TypeError: Cannot read properties of null (reading 'setItem')
```

Airbrake sent us that error from Android on new versions of Chrome. I still haven’t figured out what caused it, because the operator `.?` didn't help, `window.localStorage` was defined. But it was `null`.

I really hope it will be fixed in the nearest months or years and Browser API will be unified across all browsers. Yes, I’m a dreamer. And of course, I believe this article and my experience will help someone who is struggling with `localStorage` crashes.
