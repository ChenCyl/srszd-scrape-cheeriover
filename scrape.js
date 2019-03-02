const http = require('http')
const cheerio = require('cheerio')
const axios = require('axios')
const key = require("./key.js")

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
        console.log(err.message)
    })
}

function sharetoWeibo() {
    // 文案
    let text = []
    text.unshift('http://etmskies.com/richeng.asp?natureA=4')
    text.unshift('叮咚！Chic Chili 有新行程了！')
    console.log(text.join('\n'))
    let status = encodeURI(text.join('\n'))
    let url = 'https://api.weibo.com/2/statuses/share.json?access_token=' + key.token + '&status=' + status
    axios.post(url)
        .then(response => {
            console.log("Share to weibo successfully");
        }).catch(err => {
            console.log(err)
            sharetoWeibo()
        })
}

// 每30s刷新一次
setInterval(function () {
    get_network_data(url, function ($) {
        let newActivityNum = $(".onli").length
        console.log("检测到实时日程数为")
        console.log(newActivityNum)
        if (newActivityNum > activityNumOne) {
            console.log("检测到新的行程，接下来会发布到微博")
            sharetoWeibo()
            activityNumOne = newActivityNum
        }
        else {
            console.log("没有新行程哦，30s后刷新页面")
        }
    })
}, 30000)



