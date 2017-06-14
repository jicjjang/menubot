# menubot
NHNEnt messenger bot about launch, dinner menu.

# Install
~~~bash
$ brew install imagemagick
$ git clone https://github.com/bugsmusic/menubot
$ npm install
~~~

### If you want to use it, you need google vision settings.
[https://cloud.google.com/sdk/docs/quickstart-mac-os-x](https://cloud.google.com/sdk/docs/quickstart-mac-os-x)

# Usage

#### 1. Make `config` file.
~~~js
// config/favorite.js
// See the `example.favorite.js` file.
module.exports = {
  me: 'https://hook.dooray.com/services/[DoorayHookUrl]'  // hook url
  // If you need more hook url, append url and set to npm scripts.
}

~~~

#### 2. Start!

~~~bash
$ npm run start
~~~
