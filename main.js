var menubot = require('./bot_menu');

menubot.sendMenu('https://hook.dooray.com/services/[DOORAY_MESSAGER_ID]', 'lunch', {
        src: './img/all_menu/menu.png',
        dst: './img/daily_menu/menu_part.png'
    }, {
        botName: 'test',
        attachments: [{
            text: "zzzzzz"
        }]
    }
);
