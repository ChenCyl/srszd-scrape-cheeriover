const http = require('http')
const cheerio = require('cheerio')
const axios = require('axios')
const key = require("./key.js")
const log4js = require('log4js');


//testLog4.js
/*
  dateFile，根据时间保存文件位置，文件自动创建
 */
log4js.configure({
    appenders: { schedule: { type: 'file', filename: 'logs/schedule', "pattern": "dd.log", alwaysIncludePattern: true } },
    categories: { default: { appenders: ['schedule'], level: 'info' } }
});

const logger = log4js.getLogger('schedule');
//   logger.trace('Entering cheese testing');
//   logger.debug('Got cheese.');
//   logger.info('Cheese is Comté.');
//   logger.warn('Cheese is quite smelly.');
//   logger.error('Cheese is too ripe!');
//   logger.fatal('Cheese was breeding ground for listeria.');

const url = 'http://www.etmskies.com/richeng.asp?natureA=4'
// 第一个月的活动数量
let activityNumOne = 3

function get_network_data(uri, callback) {
    http.get(uri, function (res) {
        // console.log(res)
        // 监听网络数据包事件
        let html = ''
        res.on('data', function (chunk) {
            // console.log(chunk.toString())
            html += chunk
        })
        // 监听响应结束事件
        res.on('end', function () {
            let $ = cheerio.load(html)
            callback($)
        })

    }).on("error", function (err) {
        logger.error('cheerio 获取网页数据失败')
        logger.error(err)
    })
}

function sharetoWeibo() {
    // 文案
    let text = []
    text.unshift('http://etmskies.com/richeng.asp?natureA=4')
    text.unshift('叮咚！Chic Chili 有新行程了！')
    logger.info(text.join('\n'))
    // console.log(text.join('\n'))
    let status = encodeURI(text.join('\n'))
    let url = 'https://api.weibo.com/2/statuses/share.json?access_token=' + key.token + '&status=' + status
    axios.post(url)
        .then(response => {
            // console.log("Share to weibo successfully");
            logger.info("Share to weibo successfully")
        }).catch(err => {
            logger.error('Fail to share to weibo')
            logger.error(err)
            logger.error('Try to share again')
            // console.log(err)
            sharetoWeibo()
        })
}

// 每30s刷新一次
setInterval(function () {
    get_network_data(url, function ($) {
        let newActivityNum = $(".onli").length
        logger.info("当前日程数为" + activityNumOne)
        logger.info("检测到实时日程数为" + newActivityNum)
        // console.log("检测到实时日程数为")
        // console.log(newActivityNum)
        if (newActivityNum > activityNumOne) {
            logger.info("检测到新的行程，接下来会发布到微博")
            // console.log("检测到新的行程，接下来会发布到微博")
            sharetoWeibo()
            activityNumOne = newActivityNum
        }
        else {
            logger.info("没有新行程哦，30s后刷新页面")
            // console.log("没有新行程哦，30s后刷新页面")
        }
    })
}, 30000)



