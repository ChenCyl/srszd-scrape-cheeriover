const http = require('http')
const cheerio = require('cheerio')
const axios = require('axios')
const key = require("./key.js")
const log4js = require('log4js');

// 需要每个月改的地方用>>>标出<<<

// >>>已经有行程的日期对应的data值<<<
let plannedSchedules = [

]
// 需要发起请求的 dataA 们
let dataAs = []
// 官网中的 dataB 就是 4
let dataB = 4
// 发送到微博的内容
let text = []
// log设置
log4js.configure({
    appenders: { schedule: { type: 'file', filename: 'logs/schedule.next', "pattern": "dd.log", alwaysIncludePattern: true } },
    categories: { default: { appenders: ['schedule'], level: 'info' } }
});
const logger = log4js.getLogger('schedule');
// >>>请求一个月的行程的链接<<<
const month = 11
const url = 'http://www.etmskies.com/richeng.asp?typesB=' + month + '&natureA=4'

// 利用 cheerio 请求网络资源的封装函数
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

// 分享到微博
function sharetoWeibo() {
    text.push('http://etmskies.com/richeng.asp?typesB=' + month + '&natureA=4')
    logger.info(text.join(""))
    // 注意文本中的特殊符号& # 
    let status = encodeURI(text.join("")).replace(/\&/g, "%26").replace(/\#/g, "%23")
    let url = 'https://api.weibo.com/2/statuses/share.json?access_token=' + key.token + '&status=' + status
    axios.post(url)
        .then(response => {
            logger.info("Share to weibo successfully")
            console.log("Share to weibo successfully")
            // 发送成功清空文案
            text = []
        }).catch(err => {
            logger.error('Fail to share to weibo, Try again')
            logger.error(err.response.data)
            console.log("Fail to share, Try again")
            // 发送失败重新编辑文案再发送
            text.pop()
            if (text.join("") == "叮咚！Chic Chili 有新行程啦！在 " + (month - 1) + " 月哦~\n") {
                logger.error("Try again, fail, stop to share!!!")
                text = []
            }
            else {
                text = ["叮咚！Chic Chili 有新行程啦！在 " + (month - 1) + " 月哦~\n"]
                sharetoWeibo()
            }
        })
}

// 获得行程，编辑微博文案
function getNewSchedules() {
    let scheduleUrl = 'http://www.etmskies.com/richeng_con.asp?natureA=' + dataB + '&id='
    for (let dataA of dataAs) {
        get_network_data(scheduleUrl + dataA, function ($) {
            // 行程日期
            text.push($(".ricE_riqi").text() + ": \n")
            // 具体行程可能在p中也可能在.rcliq中 保险起见两个都要
            // 先去除空格，然后将连续的换行用一个换行替代，去除行首的换行
            text.push($("p").text().replace(/[\t\x20]/g, "").replace(/[\n]+/g, "\n").replace(/^\n/g, "")
                .replace("刘人语", "刘语").replace("苏芮琪", "苏琪").replace("罗奕佳", "罗老师").replace("张静萱", "泡泡").replace("吉利", "大吉"))
            text.push($(".rcliq").text().replace(/[\t\x20]/g, "").replace(/[\n]+/g, "\n").replace(/^\n/g, "")
                .replace("刘人语", "刘语").replace("苏芮琪", "苏琪").replace("罗奕佳", "罗老师").replace("张静萱", "泡泡").replace("吉利", "大吉"))
        })
    }
}

// 每60s刷新一次
setInterval(function () {
    // 抓取第一个月的数据
    get_network_data(url, function ($) {
        // 检测到新行程标志
        let schedules = $(".onli")
        let newActivityNum = $(".onli").length
        logger.info("上次请求日程数为 " + plannedSchedules.length)
        logger.info("本次请求日程数为 " + newActivityNum)
        // 如果检测到新行程
        if (newActivityNum > plannedSchedules.length) {
            logger.info(">>> 检测到新的行程")
            // 对象不能迭代
            for (let key of Object.keys(schedules)) {
                // $onli返回的对象中有属性length不是对象 它.hasOwnProperty会报错
                if (typeof (schedules[key]) == "object" && schedules[key].hasOwnProperty("attribs")) {
                    let dataA = schedules[key].attribs.data
                    if (plannedSchedules.indexOf(dataA) == -1) {
                        dataAs.push(dataA)
                    }
                }
            }
            console.log(dataAs)
            getNewSchedules()
            // 等待获取数据10s后发送到微博
            setTimeout(function () {
                // 将新的dataA合并到旧的中并把新的清空
                plannedSchedules = plannedSchedules.concat(dataAs)
                dataAs = []
                sharetoWeibo()
                console.log(text)
            }, 10000)
        }
        else {
            logger.info(":(没有新行程哦")
            // console.log("没有新行程哦，30s后刷新页面")
        }
    })

}, 60000)

// logger 的使用:
//   logger.trace('Entering cheese testing');
//   logger.debug('Got cheese.');
//   logger.info('Cheese is Comté.');
//   logger.warn('Cheese is quite smelly.');
//   logger.error('Cheese is too ripe!');
//   logger.fatal('Cheese was breeding ground for listeria.');



