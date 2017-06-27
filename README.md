# menubot
NHNEnt messenger bot about lunch, dinner menu.

# Install
~~~bash
$ brew install imagemagick
$ git clone https://github.com/jicjjang/menubot
$ npm install
~~~

### If you want to use it, you need google vision settings.
[https://cloud.google.com/sdk/docs/quickstart-mac-os-x](https://cloud.google.com/sdk/docs/quickstart-mac-os-x)

# Usage

~~~javascript
menubot = require('bot_menu');

/**
 * Crop the image, find the letter, and send the menu.
 * @param DoorayId
 * @param menuType
 * @param options {
 *   botName,
 *   botIconImage,
 *   attachments: [{
 *     text
 *   }]
 * }
 */
menubot.sendMenu('https://hook.dooray.com/services/[DOORAY_MESSENGER_ID]', 'lunch', {
    src: './img/all_menu/menu.png',
    dst: './img/daily_menu/menu_part.png'
}, {
    botName: 'test',
    botIconImage: 'http://blahblah.com/test.jpg',
    attachments: [{
        text: 'Let\'s lunch time~!'
    }]
});

~~~
