require('dotenv').config()
import request from 'request'
import chatbotService from '../services/chatbotService'
import homepageService from '../services/HomeService'
import pkg from 'node-wit'

const { Wit } = pkg
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN
const accessToken = process.env.WIT_AI_TOKEN
//process.env.NAME_VARIABLES
let getHomePage = (req, res) => {
    return res.render('homepage.ejs')
}

let postWebhook = (req, res) => {
    let body = req.body

    // Checks this is an event from a page subscription
    if (body.object === 'page') {
        // Iterates over each entry - there may be multiple if batched
        body.entry.forEach(function (entry) {
            // Gets the body of the webhook event
            let webhook_event = entry.messaging[0]
            console.log(webhook_event)

            // Get the sender PSID
            let sender_psid = webhook_event.sender.id
            console.log('Sender PSID: ' + sender_psid)

            // Check if the event is a message or postback and
            // pass the event to the appropriate handler function
            if (webhook_event.message) {
                handleMessage(sender_psid, webhook_event.message.text)
                // handleMessage(webhook_event.message.text);
            } else if (webhook_event.postback) {
                handlePostback(sender_psid, webhook_event.postback)
            }
        })

        // Returns a '200 OK' response to all requests
        res.status(200).send('EVENT_RECEIVED')
    } else {
        // Returns a '404 Not Found' if event is not from a page subscription
        res.sendStatus(404)
    }
}

let getWebhook = (req, res) => {
    // Your verify token. Should be a random string.
    let VERIFY_TOKEN = process.env.VERIFY_TOKEN

    // Parse the query params
    let mode = req.query['hub.mode']
    let token = req.query['hub.verify_token']
    let challenge = req.query['hub.challenge']

    // Checks if a token and mode is in the query string of the request
    if (mode && token) {
        // Checks the mode and token sent is correct
        if (mode === 'subscribe' && token === VERIFY_TOKEN) {
            // Responds with the challenge token from the request
            console.log('WEBHOOK_VERIFIED')
            res.status(200).send(challenge)
        } else {
            // Responds with '403 Forbidden' if verify tokens do not match
            res.sendStatus(403)
        }
    }
}

const handleMessage = async (sender_psid, message) => {
    try {
        const client = new Wit({ accessToken })
        // Send the message to the AI
        const response = await client.message(message, {})
        // CHECK RESPONSE
        if (response) {
            // HANDEL RESPONSE FUNCTION
            handleResponse(sender_psid, response)
        }
    } catch (error) {
        if (error) console.log(error)
    }
}

const handleResponse = async (sender_psid, response) => {
    let name = undefined
    let confidence = 0
    // Loop
    Array(response).forEach((r) => {
        if (r.intents.length > 0) {
            name = r.intents[0].name
            confidence = r.intents[0].confidence
        }
    })

    // SWITCH
    switch (name) {
        case 'tu_van_co_xuong_khop':
            await chatbotService.handleSendFoot(sender_psid)
            break
        case 'dat_lich':
            await chatbotService.handleSendBook(sender_psid)
            break
        case 'dau_dau':
            await chatbotService.handleSendHead(sender_psid)
            break
        case 'dau_bung':
            await chatbotService.handleSendBelly(sender_psid)
            break
        case 'bye':
            await chatbotService.handleSendBye(sender_psid)
            break
        default:
            await chatbotService.sendMessageDefault(sender_psid)
            break
    }
}

// Handles messages events
// async function handleMessage(sender_psid, message) {

//     // let response;

//     // // Checks if the message contains text
//     // if (received_message.text) {
//     //     // Create the payload for a basic text message, which
//     //     // will be added to the body of our request to the Send API
//     //     response = {
//     //         "text": `You sent the message: "${received_message.text}". Now send me an attachment!`
//     //     }
//     // } else if (received_message.attachments) {
//     //     // Get the URL of the message attachment
//     //     let attachment_url = received_message.attachments[0].payload.url;
//     //     response = {
//     //         "attachment": {
//     //             "type": "template",
//     //             "payload": {
//     //                 "template_type": "generic",
//     //                 "elements": [{
//     //                     "title": "Is this the right picture?",
//     //                     "subtitle": "Tap a button to answer.",
//     //                     "image_url": attachment_url,
//     //                     "buttons": [
//     //                         {
//     //                             "type": "postback",
//     //                             "title": "Yes!",
//     //                             "payload": "yes",
//     //                         },
//     //                         {
//     //                             "type": "postback",
//     //                             "title": "No!",
//     //                             "payload": "no",
//     //                         }
//     //                     ],
//     //                 }]
//     //             }
//     //         }
//     //     }
//     // }
//     // // Send the response message
//     // callSendAPI(sender_psid, response);

//     // handle text message
//     let entity = handleMessageWithEntities(message.text);

//     console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>')
//     console.log('message', message)
//     console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>')
//     console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>')
//     console.log('message.text', message.text)
//     console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>')
//     console.log('<<<<<<<<<<<<<<<<<<<<<<>>>>>>')
//     console.log('entity', entity)
//     console.log('<<<<<<<<<<<<<<<<<<<<<<>>>>>>')

//     // callSendAPI(sender_psid, response);

//     // if (entity.name === "wit$greetings") {
//     //     await homepageService.sendResponseGreetings(sender_psid, locale);
//     // } else if (entity.name === "wit$thanks") {
//     //     await homepageService.sendResponseThanks(sender_psid, locale);
//     // } else if (entity.name === "wit$bye") {
//     //     await homepageService.sendResponseBye(sender_psid, locale);
//     // } else {
//     //     //default reply
//     //     await chatbotService.sendMessageDefaultForTheBot(sender_psid);
//     // }

//     //handle attachment message
// }

// Handles messaging_postbacks events

async function handlePostback(sender_psid, received_postback) {
    let response

    // Get the payload for the postback
    let payload = received_postback.payload

    // Set the response based on the postback payload
    switch (payload) {
        case 'yes':
            response = { text: 'Thanks!' }
            break
        case 'no':
            response = { text: 'Oops, try sending another image.' }
            break
        case 'RESTART_BOT':
        case 'GET_STARTED':
            await chatbotService.handleGetStarted(sender_psid)
            break
        case 'BOOKING':
            await chatbotService.handleSendBooking(sender_psid)
            break
        case 'SPECIALTY':
            await chatbotService.handleSendSpecialty(sender_psid)
            break
        case 'DOCTOR':
        case 'CLINIC':
            await chatbotService.handleSendDoctor(sender_psid)
            break
        case 'COMPLAINTS_ERROR':
            await chatbotService.handleSendComplaints(sender_psid)
            break
        case 'CHANGE_SCHEDULE':
            await chatbotService.handleSendChangeSchedule(sender_psid)
            break
        case 'CHANGE_SCHEDULE_RES':
            await chatbotService.handleSendChangeScheduleRes(sender_psid)
            break
        case 'CANCEL_SCHEDULE':
            await chatbotService.handleSendCancelSchedule(sender_psid)
            break

        default:
            response = { text: `oop! I don't know response with postpack ${payload}` }
            break
    }

    // Send the message to acknowledge the postback
    // callSendAPI(sender_psid, response);
}

// Sends response messages via the Send API
function callSendAPI(sender_psid, response) {
    // Construct the message body
    let request_body = {
        recipient: {
            id: sender_psid
        },
        message: response
    }

    // Send the HTTP request to the Messenger Platform
    request(
        {
            uri: 'https://graph.facebook.com/v18.0/me/messages',
            qs: { access_token: PAGE_ACCESS_TOKEN },
            method: 'POST',
            json: request_body
        },
        (err, res, body) => {
            if (!err) {
                console.log('message sent!')
            } else {
                console.error('Unable to send message:' + err)
            }
        }
    )
}

let setupProfile = async (req, res) => {
    //call api facebook
    // Construct the message body
    let request_body = {
        get_started: { payload: 'GET_STARTED' },
        whitelisted_domains: ['https://facebook-messenger-doctorcare-bot-nodejs.onrender.com']
    }

    // Send the HTTP request to the Messenger Platform
    await request(
        {
            uri: `https://graph.facebook.com/v18.0/me/messenger_profile?access_token=${PAGE_ACCESS_TOKEN}`,
            qs: { access_token: PAGE_ACCESS_TOKEN },
            method: 'POST',
            json: request_body
        },
        (err, res, body) => {
            console.log(body)
            if (!err) {
                console.log('Setup user profile succeeds!')
            } else {
                console.error('Unable to Setup user profile:' + err)
            }
        }
    )

    return res.send('Setup user profile succeeds!')
}

let setupPersistentMenu = async (req, res) => {
    let request_body = {
        persistent_menu: [
            {
                locale: 'default',
                composer_input_disabled: false,
                call_to_actions: [
                    {
                        type: 'web_url',
                        title: 'Facebook Page Doctorcare',
                        url: 'https://www.facebook.com/profile.php?id=61551508547521',
                        webview_height_ratio: 'full'
                    },
                    {
                        type: 'postback',
                        title: 'Khởi động lại bot',
                        payload: 'RESTART_BOT'
                    }
                ]
            }
        ]
    }

    // Send the HTTP request to the Messenger Platform
    await request(
        {
            uri: `https://graph.facebook.com/v18.0/me/messenger_profile?access_token=${PAGE_ACCESS_TOKEN}`,

            method: 'POST',
            json: request_body
        },
        (err, res, body) => {
            console.log(body)
            if (!err) {
                console.log('Setup persistent menu succeeds!')
            } else {
                console.error('Unable to Setup persistent menu:' + err)
            }
        }
    )

    return res.send('Setup persistent menu succeeds!')
}

let test = async (req, res) => {
    return res.status(200).send('Test success')
}

module.exports = {
    getHomePage: getHomePage,
    postWebhook: postWebhook,
    getWebhook: getWebhook,
    setupProfile: setupProfile,
    setupPersistentMenu: setupPersistentMenu,
    test: test
}
