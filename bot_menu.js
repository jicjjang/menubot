// -------------------------- Require ---------------------------------------------------
const easyimg = require('easyimage');
const Vision = require('@google-cloud/vision');
const request = require('request');

const projectId = 'menu-ocr';
const visionClient = Vision({
  projectId: projectId
});

// -------------------------- Globbal Var ---------------------------------------------------
var time = '';  // lunch, dinner
var fileName = '';  // [*커스텀수정필요] 이미지 잘라서 저장할 경로

// -------------------------- Function ---------------------------------------------------

module.exports = {
  getMenuTime: function(timeParam) {
    const hour = new Date().getHours();
    if (timeParam !== 'lunch' && timeParam !== 'dinner') {
      time = (8 <= hour && hour <= 13)? 'lunch': 'dinner';
    } else {
      time = timeParam;
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
    const offsetYLunch = -340;
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
  sendMenu: function (sendUrl, timeParam, paths, optionsParam) {
    this.getMenuTime(timeParam);

    var attachText = "";

    if (time === 'lunch') {
      attachText = '점심 메뉴';
    } else if (time === 'dinner') {
      attachText = '저녁 식사 하실 분?';
    }

    var menuResult = this._imagecrop(paths.src, paths.dst);
    if (menuResult) {
      var menu = menuResult.then((menu) => {
        var options = {
          botName: '메뉴봇 베타',
          botIconImage: 'http://www.howtoboil.net/wp-content/uploads/2012/05/boil-rice.jpg',
          attachments: [{
            text: attachText
          }],
          text: ' ' + menu
        };

        Object.assign(options, optionsParam);

        request({
          uri: sendUrl,
          method: 'POST',
          json: options
        }, function (error, response, body) {
          if (!error && response.statusCode == 200) {
            console.log('[' + time + ']' + ' menu sent success!');
          }
        });
      });
    }
  },
  _googleOCR: function (fileName) {
    var that = this;
    return visionClient.detectText(fileName).then(results => {
      console.log('[' + time + ']' + ' menu sending...');
      return that.split(results[0][0]);
    });
  },
  _imagecrop: function (src, dst) {
    fileName = dst;

    var offsetX = this.getDayOffset();
    var offsetY = this.getTimeOffset();
    var cropMenu = this.getCropHeight();

    if (offsetX === 0) {
      console.log('주말엔 쉽니다.');
      return false;
    }

    return easyimg.crop({
      src, dst, // base menu image path, croped menu image path
      cropwidth: 115, cropheight: cropMenu,
      x: offsetX, y: offsetY
    }).then(image => {
      console.log('[' + time + ']' + ' menu detecting...');
      return this._googleOCR(fileName);
    }, err => {
      console.log(err);
    });
  }
};
