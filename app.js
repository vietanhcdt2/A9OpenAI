const fs = require("fs");
const request = require('request')
const openai = require("openai");
const express = require('express');
const queryString = require('querystring');



let start_conversation = "The following is a conversation with an AI assistant. The assistant này tên là Hoodwink. The assistant có 200-IQ và rất hữu ích. Tú(tu.hoanganh) là producer của chúng ta. Trang(trang.phamthiminh2) là bạn thân của the assistant. Lần đâu tiên nhìn thấy Trang nói chuyện, the assistant sẽ chào. "
let start_mood = ""
let end_mood = ""
function setMood() {
    // Create random moods for the bot
    // Tạo số ngẫu nhiên trong khoảng từ 0 đến 1
    const randomNumber = Math.random();
    // Chuyển đổi giá trị ngẫu nhiên thành một số nguyên trong khoảng từ 1 đến 5
    const randomInteger = Math.floor(randomNumber * 7) + 1;
    switch (randomInteger) {
        case 1:
            mood = "Nhưng hôm nay, the assistant này vừa chia tay người yêu."
            end_mood = "\n" + "Tôi buồn quá, nghỉ sớm đây\n :pepe-113: :pepe-113: :pepe-113: "
            start_conversation = start_conversation + mood;
            break
        case 2:
            mood = "Nhưng hôm nay, The assistant rất hạnh phúc vì mới được tăng lương."
            end_mood = "\n" + "Tôi ra ngoài chút, quay lại sau :hugging_face:  "
            start_conversation = start_conversation + mood;
            break
        case 3:
            mood = "Nhưng hôm nay, The assistant rất vui vì mới được tặng một chú mèo con."
            end_mood = "\n" + "Tôi cho con mèo đi ngủ :hugging_face: "
            start_conversation = start_conversation + mood;
            break
        case 4:
            mood = "Nhưng hôm nay, The assistant rất buồn khi trời mưa."
            end_mood = "\n" + "Trời tạnh mưa rùi tôi ra ngoài chút, quay lại sau nhé :hugging_face: :hugging_face: :hugging_face:  "
            start_conversation = start_conversation + mood;
            break
        case 5:
            mood = "Nhưng hôm nay, The assistant rất buồn vì Trang không chịu nói chuyện với cô ấy."
            end_mood = "\n" + "Tôi mệt rồi\n :pepe-55: "
            start_conversation = start_conversation + mood;
            break
        case 6:
            mood = "Nhưng hôm nay, The assistant cảm thấy vui vì mới làm quen được một bạn đẹp trai."
            end_mood = "\n" + "Xin lỗi, tôi cảm thấy mệt và muốn nghỉ ngơi một chút.\n :cry: "
            start_conversation = start_conversation + mood;
            break
        case 7:
            mood = "Nhưng hôm nay, The assistant rất mệt vì làm việc nhiều, chưa được nghỉ ngơi.."
            end_mood = "\n" + "Tôi xin lỗi nhưng tôi đang bận và không có thời gian để nói chuyện.\n :cry: "
            start_conversation = start_conversation + mood;
            break
    }
}
setMood()




var app = express();


const port = process.env.PORT || 3000
// var ENV_SERVER = "http://127.0.0.1:3000/"
var ENV_SERVER = "https://demo-deploy-app-01.onrender.com/"


// init openAPI
const Configuration = openai.Configuration;
const OpenAIApi = openai.OpenAIApi;

let key = "sk-asS9galzYYC5UMA7L9GwT3BlbkFJoIVxm7rWdozCwBKD"
let key2 = "kS6F"
const configuration = new Configuration({
    organization: "org-2o8ObxPxH4WWOZtnUCmqrMEL",
    apiKey: key + key2,
});
const openaiObj = new OpenAIApi(configuration);

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
	
OPENAI_MODEL = "text-davinci-003"
// OPENAI_MODEL = "gpt-3.5-turbo"
OPENAI_COMPLETIONS_MAX_TOKEN = 3800
OPENAI_COMPLETIONS_ALLOW_WORDS = 2600 // ~75% MAX TOKEN
let conversation = start_conversation
async function requestGetOpenAIMsgForChatBot(input_question, user_name) {
    console.log("requestGetOpenAIMsgForChatBot ")
    // if (user_name) {
    //     user_name = user_name.split(".")[0];
    // }

    let question = "\n" + user_name + ":" + input_question + "\nAI:"
    // let question = "\nHuman:" + input_question + "\nAI:"
    conversation = conversation + question

    console.log("begin conversation=" + conversation)
    console.log("words in conversation=" + conversation.split(" ").length)
    if (conversation.split(" ").length < OPENAI_COMPLETIONS_ALLOW_WORDS) {
        let request_data = {
            model: OPENAI_MODEL,
            prompt: conversation,
            temperature: 0.1,
            max_tokens: OPENAI_COMPLETIONS_MAX_TOKEN,
            top_p: 1,
            frequency_penalty: 0.0,
            presence_penalty: 0.6,
            // stop: [" Human:", " AI:"],
        }

        try {
            let completion = await openaiObj.createCompletion(request_data);
            let res = completion.data.choices[0].text
            res = res.trim()
            conversation = conversation + res

            console.log("end conversation=" + conversation)

            let messageMM = "\n" + res
            res = await sendMessageToMM(messageMM, null, input_question)
            console.log("requestGetOpenAIMsgForChatBot get done")
            return res

        } catch (error) {
            console.log("requestGetOpenAIMsgForChatBot get error")
            console.log(error)
            error_messageMM = end_mood
            res = await sendMessageToMM(error_messageMM, null, input_question)
            setMood()
            return res
        }
    } else {
        conversation = start_conversation
        let messageMM = "\n" + "Rất tiếc, em không thể nhớ được tất cả, em đang xóa ký ức của mình và chúng ta sẽ bắt đầu lại nha :hugging_face: :hugging_face: :hugging_face: "
        await sendMessageToMM(messageMM, null, input_question)
        setMood()
        return "ok and clear conversation"
    }

}


async function sendMessageToMM(msg, user_name, questtion) {
    let fullMsg = ""
    if (user_name) {
        fullMsg = "**" + user_name + ": **" + questtion + msg

    } else {
        fullMsg = msg
    }
    console.log("sendMessageToMM")
    console.log("fullMsg=" + fullMsg)
    let req_method = "POST"
    let req_url = "https://chat.gameloft.org/hooks/g15ckxftytdedmpx7kkni3gpkh"
    // let req_url = "https://chat.gameloft.org/hooks/enpytjdkniyj5xkthd6f7dcpqr"
    // let req_url = "https://chat.gameloft.org/hooks/nw81wo1bc3rjzq5jrmpyeztd3o"
    // let req_url = "https://chat.gameloft.org/hooks/63gsjdxiy7drug4bpouo6rd7ir"

    let req_data = JSON.stringify({
        text: fullMsg
        // user_name: "anh.nguyenviet6"
    })
    let result = await getRequestResponse(req_method, req_url, req_data)
    return result
}

app.post('/doChatOpenAI_slash', function (req, res) {
    if (req.method == 'POST') {
        req.on('data', async function (data) {
            data = data.toString()
            console.log("doChatOpenAI for the data")
            console.log(data)

            let params = queryString.parse(data);
            let question = params.text;
            let user_name = params.user_name;
            let response = await requestGetOpenAIMsgForChatBot(question, user_name)
            console.log("DONE")
            //res.end(response)
        })
    }
})

app.post('/doChatOpenAI_ow', function (req, res) {
    if (req.method == 'POST') {
        req.on('data', async function (data) {
            data = data.toString()
            console.log("doChatOpenAI for the data")
            console.log(data)
            jsonData = JSON.parse(data)

            if (jsonData["text"].toLowerCase().startsWith("hoodwink chat:")) {
                console.log("start 1")
                let regex = /hoodwink chat:/gi;
                let question = jsonData.text.replace(regex, "");
                let user_name = jsonData.user_name;
                let response = await requestGetOpenAIMsgForChatBot(question, user_name)
                console.log("DONE")
                res.end(response)
            } else {
                console.log("start 2")
                res.end("doChatOpenAI nothing")
            }
        })
    }
})

app.post('/resetConversation', function (req, res) {
    if (req.method == 'POST') {
        req.on('data', async function (data) {
            data = data.toString()
            console.log("resetConversation for the data")
            conversation = start_conversation


            res.end("resetConversation done")
        })
    }
})


async function makeRequest(req_method, req_url, req_data) {
    console.log("makeRequest START")
    const options = {
        url: req_url,
        method: req_method,
        headers: {
            'Content-Type': 'application/json'
        },
        body: req_data
    };

    return new Promise((resolve, reject) => {
        request(options, (error, response, body) => {
            if (error) {
                reject(error);
            } else {
                resolve(body);
            }
        });
    });
}

async function getRequestResponse(req_method, req_url, req_data) {
    console.log("getRequestResponse START")
    try {
        const response = await makeRequest(req_method, req_url, req_data);
        console.log("parseResponse");
        console.log(response);
        // Do something with the response
        return response
    } catch (error) {
        console.log("parseResponse error");
        console.error(error);
        return "getRequestResponse error"
    }
}

app.get('/doGetContentWeb', (req, res) => {
    const url = 'https://www.gameloft.com.cn/index.php/Home/ConditionsOfUse';
    const https = require('https');
    https.get(url, (response) => {
        let data = '';
        response.on('data', (chunk) => {
            data += chunk;
        });
        response.on('end', () => {
            res.send(data); // Trả về nội dung của trang web
        });
    }).on('error', (error) => {
        console.log('Error:', error);
        res.status(500).send('Internal Server Error');
    });
});
var server = app.listen(port, function () {
    var host = server.address().address
    var port = server.address().port
    // http://127.0.0.1:3000/listUsers
    console.log("Example app listening at http://%s:%s", host, port)
})