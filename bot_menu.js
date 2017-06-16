// -------------------------- Command ARGV ---------------------------------------------------
var command_args = process.argv[2];
var cmd_time = process.argv[3];

// -------------------------- Require ---------------------------------------------------
const easyimg = require('easyimage');
const Vision = require('@google-cloud/vision');
const request = require('request');
const favorite = require('./config/favorite')

const projectId = 'menu-ocr';
const visionClient = Vision({
  projectId: projectId
});

// -------------------------- Globbal Var ---------------------------------------------------
var time = '';  // launch, dinner
const fileName = './img/daily_menu/menu_part.png';  // [*커스텀수정필요] 이미지 잘라서 저장할 경로

// -------------------------- Function ---------------------------------------------------

module.exports = {
  getMenuTime: function() {
    const hour = new Date().getHours();

    time = (8 <= hour && hour <= 13)? 'lunch': 'dinner';

    if (cmd_time === 'lunch') {
      time = 'lunch';
    } else if (cmd_time === 'dinner') {
      time = 'dinner';
    }
  },
  getDayOffset: function() {
    const day = new Date().getDay();

    const offsetXMon = -224;
    const offsetXTue = -91;
    const offsetXWed = 39;
    const offsetXThr = 172;
    const offsetXFri = 306;

    var offsetX = 0;

    if(day === 0 || day === 6){
      return 0;
    } else if (day === 1) {
      offsetX = offsetXMon;
    } else if (day === 2) {
      offsetX = offsetXTue;
    } else if (day === 3) {
      offsetX = offsetXWed;
    } else if (day === 4) {
      offsetX = offsetXThr;
    } else if (day === 5) {
      offsetX = offsetXFri;
    }

    return offsetX;
  },
  getTimeOffset: function () {
    const offsetYLunch = -345;
    const offsetYDinner = 420;

    if (time === 'lunch') {
      return offsetYLunch;
    } else if (time === 'dinner') {
      return offsetYDinner;
    }
  },
  getCropHeight: function () {
    const cropLunchHeight = 600;
    const cropDinnerHeight = 440;

    if (time === 'lunch') {
      return cropLunchHeight;
    } else if (time === 'dinner') {
      return cropDinnerHeight;
    }
  },
  split: function(text) {
    var tokens = text.split('\n');
    var menu = '';
    var course_cnt = 0;

    for(var x = 0; x < tokens.length; x++) {
      if (tokens[x].includes('Kcal')) {
        menu += tokens[x] + '\n';
        menu += '-------------------\n';
        course_cnt++;
      } else {
        menu += tokens[x] + '\n';
      }

      if (time === 'dinner' && course_cnt >= 2) {
        return menu;
      } else if (time === 'lunch' && course_cnt >= 3) {
        return menu;
      }
    }
    return menu;
  },
  sendBot: function (menu) {
    var send_uri = "";
    var attachText = "";

    if (command_args === "all") {
      send_uri = favorite.all;
    } else if (command_args === "team") {
      send_uri = favorite.team;
    } else {
      send_uri = favorite.me;
    }

    if (time === 'lunch') {
      attachText = '점심 메뉴';
    } else if (time === 'dinner') {
      attachText = '저녁 식사 하실 분?';
    }

    var options = {
      uri: send_uri,
      method: 'POST',
      json: {
        botName: '메뉴봇 베타',
        botIconImage: 'http://www.howtoboil.net/wp-content/uploads/2012/05/boil-rice.jpg', // 봇 이미지 url
        attachments: [{
          text: attachText
        }],
        text: ' ' + menu
      }
    };

    request(options, function (error, response, body) {
      if (!error && response.statusCode == 200) {
      }
    });
  },
  googleOCR: function (fileName) {
    var that = this;
    visionClient.detectText(fileName).then(results => {
      that.sendBot(that.split(results[0][0]));
    });
  },
  imagecrop: function () {
    var offsetX = this.getDayOffset();
    var offsetY = this.getTimeOffset();
    var cropMenu = this.getCropHeight();

    if (offsetX === 0) {
      console.log('주말엔 쉽니다.');
      return;
    }

    easyimg.crop({
      src: './img/all_menu/menu.png', dst: './img/daily_menu/menu_part.png', // 큰 메뉴 이미지 경로, 메뉴 부분 이미지 경로
      cropwidth: 115, cropheight: cropMenu,
      x: offsetX, y: offsetY
    }).then(image => {
      this.googleOCR(fileName);
      console.log('[' + time + ']' + ' menu sent success!');
    }, err => {
      console.log(err);
    });
  }
};
