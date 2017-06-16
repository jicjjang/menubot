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

~~~javascript
menubot = require('bot_menu');
               
menubot.getMenuTime('dinner');  // 'dinner' or 'lunch'. If not both, bot look the time. 
menubot.imagecrop('https://hook.dooray.com/services/[DOORAY_MESSENGER_ID]');

~~~
