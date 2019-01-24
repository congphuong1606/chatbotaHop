var WebSocketServer = require("ws").Server
var http = require("http")
var express = require("express")
var app = express()
var port = process.env.PORT || 3333
app.use(express.static(__dirname + "/"))
var server = http.createServer(app)
server.listen(port)
var wss = new WebSocketServer({server: server})

wss.on("connection", function (ws) {
    var id = setInterval(function () {
        ws.send(JSON.stringify(new Date()), function () {
        })
    }, 1000)

    ws.on("close", function () {
        clearInterval(id)
    })
});

const TelegramBot = require('node-telegram-bot-api');
const token = '702836138:AAF-qi8CDLFbg5Mgwl3665TXAYxtmCetmL4';
const bot = new TelegramBot(token, {polling: true});
var callapi = require('request');
var moment = require('moment');
var change_alias = require("./char.js");
var timeStamp = 0;
var parsed = [];
var baseUrl = "https://script.google.com/macros/s/AKfycbxC_WcqUsMP6eM8H0j5IMi4pnVvhwEjKB9J13QOjezuT39kHVci";
//https://script.google.com/macros/s/AKfycbxC_WcqUsMP6eM8H0j5IMi4pnVvhwEjKB9J13QOjezuT39kHVci/exec?action=read-all-data&alt=json

reloadData();

var lastMsgGroup = {id: null, lastMsg: null, timeStamp: null};
var listLastMsg = [];
var stopOtherGroup = false;


//var userBoss = 398800833;
var userBoss = 470636583;
var userBoss1 = 612137896;
var groupBoss = -358847679;


function getMinSell(array) {
    let date = parseFloat(array[0].date);
    let buy = parseFloat(array[0].price);
    array.forEach(item => {
        if (date < parseFloat(item.date)) {
            date= parseFloat(item.date)
            buy = parseFloat(item.price);
        }
    });
    return buy;
}





function sendToGroupMe(msg) {
    let array =msg.text.split(' ');
    let flag =false;
    array.forEach(item=>{
        item=item.toLowerCase();
        if(item==='mua'||item==='ban'||item==='bán'||item==='buy'||item==='sell'){
            flag =true;
        }
    })
        if(flag){
            bot.forwardMessage(groupBoss, msg.chat.id, msg.message_id);

        }



}

bot.on('message', (msg) => {
    var request = change_alias(msg.text.toString());
    var idChat = msg.chat.id;

    console.log(msg);

    if (msg.chat.type === 'private' && msg.reply_to_message !== undefined) {

        if (msg.from.id === userBoss || msg.from.id === userBoss1) {
            let msgg = msg.text.toString();
            let iDD = msg.reply_to_message.forward_from.id;
            bot.sendMessage(iDD, msgg);

        }
    } else if (request === "reload data sheet") {
        reloadData();
    } else if (request === "/stopothergroup") {
        if (msg.from.id === userBoss || msg.from.id === userBoss1) {
            stopOtherGroup = true;
            bot.sendMessage(userBoss, "stoped other group");
            bot.sendMessage(userBoss1, "stoped other group");
        }

    } else if (request === "/openothergroup") {
        if (msg.from.id === userBoss || msg.from.id === userBoss1) {
            stopOtherGroup = false;
            bot.sendMessage(userBoss, "opened other group");
            bot.sendMessage(userBoss1, "opened other group");
        }

    } else if (request === "/chattoallgroup") {
        if (msg.from.id === userBoss || msg.from.id === userBoss1) {
           // chatToALLGroup();
        } else {
            bot.sendMessage(msg.from.id, "Lệnh này không dành cho bạn (/chattoallgroup)");
        }
    }
    else if (request === "/testchattoallgroup") {
        if (msg.from.id === userBoss || msg.from.id === userBoss1) {
           // testChatToALLGroup(idChat);

        } else {
            bot.sendMessage(msg.from.id, "Lệnh này không dành cho bạn (/chattoallgroup)");
        }
    } else {

        switch (msg.chat.type) {
            case "private":
                if (idChat !== userBoss && idChat !== userBoss1) {
                    bot.forwardMessage(userBoss, msg.chat.id, msg.message_id);
                    bot.forwardMessage(userBoss1, msg.chat.id, msg.message_id);
                }
                handling(msg, request, 'user');
                break;
            case "group":
              /*  sendToGroupMe(msg);*/
                if (stopOtherGroup) {
                    if (idChat === groupBoss) {
                        handling(msg, request, 'group');
                    }
                } else {
                    handling(msg, request, 'group');
                }
                updateGroupSheet(idChat, msg.chat.title, msg);

                break;
            case "supergroup":
               /* sendToGroupMe(msg);*/
                if (stopOtherGroup) {
                    if (idChat === groupBoss) {
                        handling(msg, request, 'group');
                    }
                } else {
                    handling(msg, request, 'group');
                }
                updateGroupSheet(idChat, msg.chat.title, msg);

                break;
            default:
                break;
        }

    }
});


/*function testChatToALLGroup(idChat) {
    var url2 = baseUrl + "/exec?action=get-all-group";
    var request = require('request');
    request(url2, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            var listGroup = JSON.parse(body).Data;
            var tinNhan = JSON.parse(body).msgToGroup;
            if (tinNhan !== "") {
                bot.sendMessage(idChat, "TO: " + listGroup[0].id + " \n" + tinNhan, {parse_mode: "HTML"});
            }
        } else {
            bot.sendMessage(idChat, "Vui lòng kiểm tra sheet hoặc lỗi, không thể chat");
        }
    });
}*/

/*
function chatToALLGroup() {
    var url2 = baseUrl + "/exec?action=get-all-group";
    var request = require('request');
    request(url2, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            var listGroup = JSON.parse(body).Data;
            var tinNhan = JSON.parse(body).msgToGroup;
            if (tinNhan !== "") {
                listGroup.forEach(item => {
                    bot.sendMessage(item.id, tinNhan, {parse_mode: "HTML"});
                });
                bot.sendMessage(userBoss1, tinNhan, {parse_mode: "HTML"});

            }
        } else {
            bot.sendMessage(userBoss1, "Vui lòng kiểm tra sheet hoặc lỗi, không thể chat");
        }
    });
}
*/

function updateGroupSheet(idChat, title, msg) {
    title = change_alias(title);
    title = title.replace(/[^a-zA-Z0-9]/g, ' ').trim().replace(/ /g, "+");
    const request = require('request');
   /* const url2 = baseUrl + "/exec?action=update-group&id=" + idChat + "&title=" + title;


    request(url2, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            if (body === "exist") {

            }
            if (body === "success") {

                bot.sendMessage(userBoss, "Có một group mới đã được thêm vào sheet");
                bot.sendMessage(userBoss1, "Có một group mới đã được thêm vào sheet");
            }

        } else {

            bot.sendMessage(userBoss1, "Kiểm tra lỗi : " + url2);
        }
    });*/
    const userName = msg.from.username !== undefined ? "@" + change_alias(msg.from.username) : "__";
    const lastName = msg.from.last_name !== undefined ? msg.from.last_name : "__";
    let fullName = msg.from.first_name + " " + lastName;
    fullName = change_alias(fullName);
    fullName = fullName.replace(/[^a-zA-Z0-9]/g, ' ').replace(/ /g, "+");
    const userId = msg.from.id;
    const isbot = msg.from.is_bot === true ? "bot" : "member";
   /* const url23 = baseUrl + "/exec?action=insert-sheet&sheet_name=" + idChat + "&user_id=" + userId + "&user_full_name=" + fullName + "&user_name=" + userName + "&is_bot=" + isbot + "&title=" + title;

    request(url23, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            if (body === "fail") {

            }
            if (body === "success") {

            }

        } else {

            bot.sendMessage(userBoss1, "Kiểm tra lỗi : " + url2);
        }
    });*/


}


function reloadData() {
    const urlGetALL = baseUrl + "/exec?action=read-all-data";
    callapi(urlGetALL, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            console.log(body)
            parsed = JSON.parse(body).Data;
            bot.sendMessage(userBoss, "server update succesfuly!");
            bot.sendMessage(userBoss1, "server update succesfuly!");
        } else {
            bot.sendMessage(userBoss1, "Loading data ....");
            bot.sendMessage(userBoss, "Loading data ....");
            reloadData();

        }
    });

}

function handling(msg, request, mode) {

    if (parsed === []) {
        reloadData();
    } else {
        let reply = {number: 0, value: []};
        parsed.forEach(item => {
            const newNumber = checkStringAsAnswer(request, change_alias(item.keyword));
            if (newNumber >= reply.number && newNumber !== 0) {
                var items = [];
                items.push(item.answer);
                if (item.answer2 !== '') {
                    items.push(item.answer2)
                }
                ;
                if (item.answer3 !== '') {
                    items.push(item.answer3)
                }
                ;
                if (item.answer4 !== '') {
                    items.push(item.answer4)
                }
                ;
                if (item.answer5 !== '') {
                    items.push(item.answer5)
                }
                ;
                reply = {number: newNumber, value: items};
            }
        });
        if (reply.number > 0) {
            if (reply.value.length === 1) {
                sendMsg(msg.chat.id, reply.value[0]);
            }
            if (reply.value.length > 1) {
                getRandom(reply.value, msg);
            }
        }

    }
}


function checkStringAsAnswer(request, keyword) {
    const arrayRequest = request.split(" ");
    const arrayKeyword = keyword.split(" ");
    let number = 0;
    arrayRequest.forEach(itemRequest => {
        arrayKeyword.forEach(itemKeyword => {
            if (itemRequest === itemKeyword) {
                number++;
            }
        });
    });
    if (number === 1) {

        if (request.charAt(0) !== '/') {

            if (arrayRequest.length > 1 && arrayKeyword.length > 1) {
                number = 0;
            }
        }
    }
    return number;
}

var tam = "";

function getRandom(items, msg) {
    const messs = items[Math.floor(Math.random() * items.length)];
    if (tam !== messs) {
        sendMsg(msg.chat.id, messs);
        tam = messs;
    } else {
        getRandom(items, msg);
    }
}

var listTime = [20, 25, 30, 15];

let listMsgOld = [];

function saveResult(result) {
    const chatId = result.chat.id;
    const date = Date.now();
    const msgOld = {id: result.message_id, chatId: chatId, time: date, from: result.from}
    listMsgOld.push(msgOld);
    listMsgOld.forEach(item => {
        if (item.chatId === chatId) {
            if ((date - item.time) > (3 * 60 * 500)) {
                deleteMsgOld(item);
            }
        }
    });

}

function deleteMsgOld(item) {
     console.log('XOA tin nhaws cu'+JSON.stringify(item));
    bot.deleteMessage(item.chatId, '' + item.id, item.from);
}

function sendMsg(id, msss) {
    if (listLastMsg.length > 0) {
        let flag = true;
        listLastMsg.forEach(element => {
            if (id === element.id) {
                if (msss === element.lastMsg) {
                    const duration = parseInt((moment().valueOf() - element.timeStamp) / 1000);
                    if (duration > 50) {
                        bot.sendMessage(id, msss, {parse_mode: "HTML"}).then(result => {
                            saveResult(result)
                        });
                        listLastMsg = listLastMsg.filter(obj => id !== obj.id);
                        listLastMsg.push({id: id, lastMsg: msss, timeStamp: moment().valueOf()});
                    }
                } else {
                    const duration = parseInt((moment().valueOf() - element.timeStamp) / 1000);
                    if (duration > 20) {
                        bot.sendMessage(id, msss, {parse_mode: "HTML"}).then(result => {
                            saveResult(result)
                        });
                        listLastMsg = listLastMsg.filter(obj => id !== obj.id);
                        listLastMsg.push({id: id, lastMsg: msss, timeStamp: moment().valueOf()});
                    }
                }
                flag = false;
                return;
            }
        });
        if (flag) {
            bot.sendMessage(id, msss, {parse_mode: "HTML"}).then(result => {
                saveResult(result)
            });
            listLastMsg.push({id: id, lastMsg: msss, timeStamp: moment().valueOf()});
        }

    } else {
        bot.sendMessage(id, msss, {parse_mode: "HTML"}).then(result => {
            saveResult(result)
        });
        listLastMsg.push({id: id, lastMsg: msss, timeStamp: moment().valueOf()});
    }
}

























































