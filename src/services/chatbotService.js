require('dotenv').config()
import request from 'request'

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN
const DOMAIN = process.env.DOMAIN
const IMAGE_GET_STARTED = '../public/images/background.jpg'
const IMAGE_GET_BOOKING =
    'https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExbnptOTNybnJ0bTJ3bzE4NTR3ZHljaXVwZ2hqcXFidzZlamZ1b2cxMiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/mWrFWSdUpwlMvbC59G/giphy.gif'
const IMAGE_CHANGE_BOOKING =
    'https://media.tenor.co/9D8Fi0egkJoAAAAC/arzt-ueberlegen.gif?t=AAYGuuuhhHoKSnGYPQQ1aQ&c=VjFfZmFjZWJvb2s&itemid=11428885'
const IMAGE_DEFAULT = 'https://cdn.muabannhanh.com/asset/frontend/img/gallery/2016/09/30/57ed4fcba7804_1475170251.gif'

let callSendAPI = (sender_psid, response) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Construct the message body
            let request_body = {
                recipient: {
                    id: sender_psid
                },
                message: response
            }

            await sendMarkReadMessage(sender_psid)
            await sendTypingOn(sender_psid)

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
                        resolve('message sent!')
                    } else {
                        console.error('Unable to send message:' + err)
                    }
                }
            )
        } catch (e) {
            reject(e)
        }
    })
}

let sendTypingOn = (sender_psid) => {
    return new Promise((resolve, reject) => {
        try {
            // Construct the message body
            let request_body = {
                recipient: {
                    id: sender_psid
                },
                sender_action: 'typing_on'
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
                        resolve('sendTypingOn sent!')
                    } else {
                        reject('Unable to send sendTypingOn:' + err)
                    }
                }
            )
        } catch (e) {
            reject(e)
        }
    })
}

let sendMarkReadMessage = (sender_psid) => {
    return new Promise((resolve, reject) => {
        try {
            // Construct the message body
            let request_body = {
                recipient: {
                    id: sender_psid
                },
                sender_action: 'mark_seen'
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
                        resolve('sendTypingOn sent!')
                    } else {
                        reject('Unable to send sendTypingOn:' + err)
                    }
                }
            )
        } catch (e) {
            reject(e)
        }
    })
}

let getUserName = (sender_psid) => {
    return new Promise((resolve, reject) => {
        request(
            {
                uri: `https://graph.facebook.com/${sender_psid}?fields=first_name,last_name,profile_pic&access_token=${PAGE_ACCESS_TOKEN}`,
                method: 'GET'
            },
            (err, res, body) => {
                if (!err) {
                    body = JSON.parse(body)
                    let username = `${body.last_name} ${body.first_name}`
                    resolve(username)
                } else {
                    console.error('Unable to send message:' + err)
                    reject(err)
                }
            }
        )
    })
}

let handleGetStarted = (sender_psid) => {
    return new Promise(async (resolve, reject) => {
        try {
            let username = await getUserName(sender_psid)
            let response1 = {
                text: `Xin chào ${username}! Tôi là trợ lý ảo của DoctorCare. Tôi có thể giúp gì cho bạn hôm nay?`
            }
            let response2 = getStartedTemplate()

            //send text message
            await callSendAPI(sender_psid, response1)

            //send generic template message
            await callSendAPI(sender_psid, response2)
            resolve('done')
        } catch (e) {
            reject(e)
        }
    })
}

let getStartedTemplate = () => {
    let response = {
        attachment: {
            type: 'template',
            payload: {
                template_type: 'generic',
                elements: [
                    {
                        title: 'Doctorcare kính chào quý khách',
                        subtitle: 'Dưới đây là các lựa chọn của Doctorcare',
                        image_url: IMAGE_GET_STARTED,
                        buttons: [
                            {
                                type: 'postback',
                                title: 'Đặt khám',
                                payload: 'BOOKING'
                            },
                            {
                                type: 'postback',
                                title: 'Thay đổi lịch',
                                payload: 'CHANGE_SCHEDULE'
                            },
                            {
                                type: 'postback',
                                title: 'Khiếu nại/Báo lỗi',
                                payload: 'COMPLAINTS_ERROR'
                            }
                        ]
                    }
                ]
            }
        }
    }

    return response
}

let handleSendBooking = (sender_psid) => {
    return new Promise(async (resolve, reject) => {
        try {
            // send an image gif
            let response1 = getImageBookingTemplate()

            //send a button templates
            let response2 = getBookingTemplate()

            await callSendAPI(sender_psid, response1)
            await callSendAPI(sender_psid, response2)
            resolve('done')
        } catch (e) {
            reject(e)
        }
    })
}

let getImageBookingTemplate = () => {
    let response1 = {
        attachment: {
            type: 'image',
            payload: {
                url: IMAGE_GET_BOOKING
                // "is_reusable": true
            }
        }
    }

    return response1
}

let getBookingTemplate = () => {
    let response = {
        attachment: {
            type: 'template',
            payload: {
                template_type: 'button',
                text: 'Vui lòng chọn một trong các mục khám dưới đây',
                buttons: [
                    {
                        type: 'postback',
                        title: 'Chuyên khoa',
                        payload: 'SPECIALTY'
                    },
                    {
                        type: 'postback',
                        title: 'Bác sĩ',
                        payload: 'DOCTOR'
                    },
                    {
                        type: 'postback',
                        title: 'Bệnh viện/Phòng khám',
                        payload: 'CLINIC'
                    }
                ]
            }
        }
    }

    return response
}

let handleSendSpecialty = (sender_psid) => {
    return new Promise(async (resolve, reject) => {
        try {
            let response = getSpecialtyTemplate()
            await callSendAPI(sender_psid, response)
            resolve('done')
        } catch (e) {
            reject(e)
        }
    })
}

let getSpecialtyTemplate = () => {
    let response = {
        text: `Để khám chuyên khoa, vui lòng chọn chuyên khoa theo đường dẫn: ${DOMAIN}/getall-specialty/`
    }

    return response
}

let handleSendDoctor = (sender_psid) => {
    return new Promise(async (resolve, reject) => {
        try {
            let response = getDoctorTemplate()
            await callSendAPI(sender_psid, response)
            resolve('done')
        } catch (e) {
            reject(e)
        }
    })
}

let getDoctorTemplate = () => {
    let response = {
        text: `Để khám bác sĩ, vui lòng chọn bác sĩ theo đường dẫn: ${DOMAIN}/getall-doctor/`
    }

    return response
}

let handleSendComplaints = (sender_psid) => {
    return new Promise(async (resolve, reject) => {
        try {
            let response = {
                text: 'Để khiếu nại/báo lỗi, bạn vui lòng điền thông tin theo đường dẫn sau: https://forms.gle/dqys28ENzeQj3Qsp7'
            }
            await callSendAPI(sender_psid, response)
            resolve('done')
        } catch (e) {
            reject(e)
        }
    })
}

let handleSendChangeSchedule = (sender_psid) => {
    return new Promise(async (resolve, reject) => {
        try {
            // send an image gif
            let response1 = getImageSendChangeScheduleTemplate()

            //send a button templates
            let response2 = getChangeScheduleTemplate()

            await callSendAPI(sender_psid, response1)
            await callSendAPI(sender_psid, response2)
            resolve('done')
        } catch (e) {
            reject(e)
        }
    })
}

let getImageSendChangeScheduleTemplate = () => {
    let response1 = {
        attachment: {
            type: 'image',
            payload: {
                url: IMAGE_CHANGE_BOOKING
                // "is_reusable": true
            }
        }
    }

    return response1
}

let getChangeScheduleTemplate = () => {
    let response = {
        attachment: {
            type: 'template',
            payload: {
                template_type: 'button',
                text: 'Vui lòng chọn một trong các mục khám dưới đây',
                buttons: [
                    {
                        type: 'postback',
                        title: 'Đổi lịch',
                        payload: 'CHANGE_SCHEDULE_RES'
                    },
                    {
                        type: 'postback',
                        title: 'Hủy lịch',
                        payload: 'CANCEL_SCHEDULE'
                    }
                ]
            }
        }
    }

    return response
}

let handleSendChangeScheduleRes = (sender_psid) => {
    return new Promise(async (resolve, reject) => {
        try {
            let response1 = getChangeScheduleResTemplate()
            let response2 = getCancelScheduleTemplate()

            await callSendAPI(sender_psid, response1)
            await callSendAPI(sender_psid, response2)
            resolve('done')
        } catch (e) {
            reject(e)
        }
    })
}

let getChangeScheduleResTemplate = () => {
    let response = {
        text: 'Nếu bạn muốn thay đổi lịch khám, vui lòng đặt lại lịch khám trên website: ${DOMAIN}'
    }
    return response
}

let getCancelScheduleTemplate = () => {
    let response = {
        text: 'Bạn có thể hủy lịch khám qua SĐT 0123 456 789 hoặc điền vào form: https://forms.gle/dqys28ENzeQj3Qsp7'
    }
    return response
}

let handleSendCancelSchedule = (sender_psid) => {
    return new Promise(async (resolve, reject) => {
        try {
            let response = getCancelScheduleTemplate()
            await callSendAPI(sender_psid, response)
            resolve('done')
        } catch (e) {
            reject(e)
        }
    })
}

let handleSendFoot = (sender_psid) => {
    return new Promise(async (resolve, reject) => {
        try {
            let response = getFootTemplate()

            await callSendAPI(sender_psid, response)
            resolve('done')
        } catch (e) {
            reject(e)
        }
    })
}

let getFootTemplate = () => {
    let response = {
        text: `Bạn đang gặp vấn đề về cơ xương khớp, xem thêm danh sách bác sĩ chuyên khoa CƠ XƯƠNG KHỚP: ${DOMAIN}/detail-specialty/2`
    }

    return response
}

let handleSendBook = (sender_psid) => {
    return new Promise(async (resolve, reject) => {
        try {
            let response1 = getBookTemplate()
            let response2 = {
                text: `Bằng cách cung cấp thông tin chi tiết như trên, bạn sẽ giúp bác sĩ hoặc chuyên gia y tế hiểu rõ hơn về tình trạng sức khỏe của bạn và có thể đưa ra đúng chuyên khoa để bạn được chăm sóc và điều trị tốt nhất.`
            }

            await callSendAPI(sender_psid, response1)
            await callSendAPI(sender_psid, response2)
            resolve('done')
        } catch (e) {
            reject(e)
        }
    })
}

let getBookTemplate = () => {
    let response = {
        text: `Để chọn đúng chuyên khoa, bạn cần cung cấp thông tin chi tiết về triệu chứng, vấn đề sức khỏe hoặc tình trạng cụ thể mà bạn đang gặp phải. Dưới đây là một số câu hỏi bạn có thể trả lời để cung cấp thông tin chi tiết hơn:
1. Bạn gặp phải triệu chứng gì? Ví dụ: đau đầu, sốt, ho, đau bụng, mệt mỏi, khó thở, đau ngực, chảy máu, nôn mửa, tiêu chảy, táo bón, v.v.
2. Triệu chứng xuất hiện trong bao lâu? Ví dụ: một vài giờ, một vài ngày, một vài tuần, v.v.
3. Triệu chứng có xuất hiện liên tục hay chỉ trong một khoảng thời gian nhất định?
4. Bạn có bất kỳ yếu tố nguyên nhân nào gây ra triệu chứng không? Ví dụ: tiếp xúc với chất gây dị ứng, ăn uống gì đó, hoạt động cụ thể, v.v.
5. Bạn có bất kỳ bệnh lý nền nào không? Ví dụ: tiểu đường, huyết áp cao, bệnh tim mạch, v.v.
6. Bạn đã thử bất kỳ biện pháp tự chữa nào chưa? Ví dụ: uống thuốc, nghỉ ngơi, áp dụng phương pháp tự chăm sóc sức khỏe, v.v.
7. Bạn có bất kỳ yếu tố di truyền nào liên quan đến vấn đề sức khỏe của bạn không? Ví dụ: gia đình có tiền sử bệnh lý nào tương tự, v.v.
8. Bạn có bất kỳ yếu tố rủi ro nào liên quan đến vấn đề sức khỏe của bạn không? Ví dụ: hút thuốc, uống rượu, tiếp xúc với chất độc hại, v.v.
9. Bạn có bất kỳ triệu chứng khác nào không liên quan đến vấn đề sức khỏe hiện tại không?
10. Bạn có bất kỳ câu hỏi hoặc lo lắng nào khác không?
`
    }

    return response
}

let sendMessageDefault = (sender_psid) => {
    return new Promise(async (resolve, reject) => {
        try {
            let response1 = getImageDefaultTemplate()
            let response2 = getMessageDefaultTemplate()

            await callSendAPI(sender_psid, response1)
            await callSendAPI(sender_psid, response2)
            resolve('done')
        } catch (e) {
            reject(e)
        }
    })
}

let getMessageDefaultTemplate = () => {
    let response = {
        text: `Rất tiếc bot chưa được hướng dẫn để trả lời câu hỏi của bạn. Để được hỗ trợ vui lòng liên hệ: 0123 456 789`
    }

    return response
}

let getImageDefaultTemplate = () => {
    let response = {
        attachment: {
            type: 'image',
            payload: {
                url: IMAGE_DEFAULT
                // "is_reusable": true
            }
        }
    }

    return response
}

let handleSendBye = (sender_psid) => {
    return new Promise(async (resolve, reject) => {
        try {
            let response = {
                text: `Cảm ơn đã sử dụng dịch vụ của DoctorCareHA!`
            }

            await callSendAPI(sender_psid, response)
            resolve('done')
        } catch (e) {
            reject(e)
        }
    })
}

let handleSendHead = (sender_psid) => {
    return new Promise(async (resolve, reject) => {
        try {
            let response = {
                text: `Bạn đang gặp vấn đề về thần kinh, xem thêm danh sách bác sĩ chuyên khoa THẦN KINH: ${DOMAIN}/detail-specialty/3`
            }

            await callSendAPI(sender_psid, response)
            resolve('done')
        } catch (e) {
            reject(e)
        }
    })
}

let handleSendBelly = (sender_psid) => {
    return new Promise(async (resolve, reject) => {
        try {
            let response = {
                text: `Bạn đang gặp vấn đề về tiêu hóa, xem thêm danh sách bác sĩ chuyên khoa TIÊU HÓA: ${DOMAIN}/detail-specialty/4`
            }

            await callSendAPI(sender_psid, response)
            resolve('done')
        } catch (e) {
            reject(e)
        }
    })
}

module.exports = {
    handleGetStarted: handleGetStarted,
    handleSendBooking: handleSendBooking,
    handleSendSpecialty: handleSendSpecialty,
    handleSendDoctor: handleSendDoctor,
    handleSendComplaints: handleSendComplaints,
    handleSendChangeSchedule: handleSendChangeSchedule,
    handleSendChangeScheduleRes: handleSendChangeScheduleRes,
    handleSendCancelSchedule: handleSendCancelSchedule,
    handleSendFoot: handleSendFoot,
    handleSendBook: handleSendBook,
    sendMessageDefault: sendMessageDefault,
    handleSendBye: handleSendBye,
    handleSendHead: handleSendHead,
    handleSendBelly: handleSendBelly
}
