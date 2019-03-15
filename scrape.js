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

// 下一个月（4月）的链接拼接字符串（每个月改一次）
const nextMonth = 5
// 第一个月的链接
const url = 'http://www.etmskies.com/richeng.asp?natureA=4'
// 下一个月的链接
const urlNext = 'http://www.etmskies.com/richeng.asp?natureA=4&typesB=' + nextMonth
// 第一个月的活动数量
let activityNumOne = 10
// 下一个月的活动数量
let activityNumNext = 0

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

function sharetoWeibo(flag, flagNext) {
    // 文案
    let text = []
    // 如果当月有行程则链接到当月
    if (flag) {
        text.unshift('http://etmskies.com/richeng.asp?natureA=4')
    }
    // 否则链接到次月
    else {
        text.unshift('http://etmskies.com/richeng.asp?natureA=4&typesB=' + nextMonth)
    }
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
    // 抓取第一个月的数据
    get_network_data(url, function ($) {
        // 检测到新行程标志
        let flag = false
        let newActivityNum = $(".onli").length
        logger.info("当月日程数为 " + activityNumOne)
        logger.info("当月实时日程数为 " + newActivityNum)
        // 如果检测到新行程
        if (newActivityNum > activityNumOne) {
            flag = true
            logger.info("检测到当月新的行程")
            // sharetoWeibo()
            activityNumOne = newActivityNum
        }
        else {
            logger.info("当月没有新行程哦")
            // console.log("没有新行程哦，30s后刷新页面")
        }
        // 抓取下一个月的数据
        get_network_data(urlNext, function ($) {
            // 检测到下个月新行程标志
            let flagNext = false
            let newActivityNumNext = $(".onli").length
            logger.info("下个月日程数为 " + activityNumNext)
            logger.info("下个月实时日程数为 " + newActivityNumNext)
            // 如果有新行程
            if (newActivityNumNext > activityNumNext) {
                flagNext = true
                logger.info("检测到下个月的新行程")
                activityNumNext = newActivityNumNext
            }
            else {
                logger.info("下个月没有新行程哦")
                // console.log("没有新行程哦，30s后刷新页面")
            }
            if (flag || flagNext) {
                logger.info("正在发布到微博...")
                sharetoWeibo(flag, flagNext)
            }
            logger.info("----------------")
        })
    })

}, 60000)



