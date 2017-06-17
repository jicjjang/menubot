var menubot = require('./bot_menu');

menubot.sendMenu('https://hook.dooray.com/services/[DOORAY_MESSAGER_ID]', 'lunch', {
    botName: 'test',
    attachments: [{
        text: "zzzzzz"
    }]
});
