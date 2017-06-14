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
var today = ''; // day
var time = '';  // launch, dinner
const fileName = 'img/daily_menu/menu_part.png';  // [*커스텀수정필요] 이미지 잘라서 저장할 경로

// -------------------------- Function ---------------------------------------------------

var menubot = menubot || {
  getMenuTime: function() {
    var date = new Date();
    var hour = date.getHours();

    if (8 <= hour && hour <= 13) {  // before 13 p.m.
      time = 'lunch';
    } else {
      time = 'dinner';
    }

    if (cmd_time === 'lunch') {
      time = 'lunch';
    } else if (cmd_time === 'dinner') {
      time = 'dinner';
    }
  },
  getDayOffset: function() {
    var date = new Date();
    var day = date.getDay();

    var offsetMon = 88;
    var offSetTue = 221;
    var offSetWed = 351;
    var offSetThr = 484;
    var offSetFri = 618;

    var offset = 0;

    if(day === 0 || day === 6){
      return 0;
    } else if (day === 1) {
      offset = offsetMon;
    } else if (day === 2) {
      offset = offSetTue;
    } else if (day === 3) {
      offset = offSetWed;
    } else if (day === 4) {
      offset = offSetThr;
    } else if (day === 5) {
      offset = offSetFri;
    }

    return offset;
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
        attachments: [
          {
            text: attachText
          }
        ],
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
    var offSetX = this.getDayOffset();
    var offSetY = 0;
    var crop_menu = 0;

    if (offSetX === 0) {
      console.log('주말엔 쉽니다.');
      return;
    }

    var c_width = 115;
    var c_height = 200;

    var crop_3_menu = 600;
    var crop_2_menu = 500

    var offsetY_Lunch = 80;
    var offsetY_Dinner = 950;

    if (time === 'lunch') {
      crop_menu = crop_3_menu;
      offSetY = offsetY_Lunch;
    } else if (time === 'dinner') {
      crop_menu = crop_2_menu;
      offSetY = offsetY_Dinner;
    }

    easyimg.crop({
      src: 'img/all_menu/menu.png', dst: 'img/daily_menu/menu_part.png', // 큰 메뉴 이미지 경로, 메뉴 부분 이미지 경로
      cropwidth: c_width, cropheight: crop_3_menu,
      x: -370 + offSetX + c_width/2, y: -755 + offSetY + crop_menu/2 + 20
    }).then(image => {
      this.googleOCR(fileName);
    }, err => {
      console.log(err);
    });
  }
};

// -------------------------- Main ---------------------------------------------------

menubot.getMenuTime();
menubot.imagecrop();

console.log('[' + time + ']' + ' menu sent success!');
