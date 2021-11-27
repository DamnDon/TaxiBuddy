const functions = require('firebase-functions');
const request = require('request-promise');
const admin = require('firebase-admin');
const { StatusCodeError } = require('request-promise/errors');
const { object } = require('firebase-functions/v1/storage');
admin.initializeApp();

const LINE_MESSAGING_API = 'https://api.line.me/v2/bot/message';
const LINE_HEADER = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer HPjfNHW8XXyYGoFiYLGOE89fJ6vCFWI2UheW+SG+aPv2T860T7OgTQRaNYJ4w9zDbZ1sMsPvyFFZEOOOKSjaICxUVdARMuC2M16jf4aAccbEBLZ6SnN/r4+iWnMDaZ4trQVVCxSInESelkrfripNCgdB04t89/1O/w1cDnyilFU=`
};


exports.LineBot = functions.https.onRequest(async (req, res) => {
    const payload =  req.body.originalDetectIntentRequest.payload.data
    var usermsg =  payload.message.text
    // console.log('usermsg= '+usermsg)
    const userID = payload.source.userId

    
    const parameters = req.body.queryResult.parameters
    console.log('parameters')
    console.log(parameters)
    // console.log('parameters')
    // console.log(parameters)
    console.log('req.body.queryResult.outputContexts')
    console.log(req.body.queryResult.outputContexts)


    const intentName = req.body.queryResult.intent.displayName
    console.log('req.body.queryResult =')
    console.log(intentName)

    //var for connect DB
    let Passenger_DB 
    let Passenger_DB_val 
    let FirstName = '-'
    let Lastname = '-'
    let name

    Passenger_DB = await admin.database().ref('Passenger').child(userID).once('value')
    Passenger_DB_val = Passenger_DB.val()
    Driver_DB = await admin.database().ref('Driver').child(userID).once('value')
    Driver_DB_val = Driver_DB.val()
    let userJson
    let DriverInfo
    let DBid_Driver
    let DBid_Passenger

    //stage
    let stage_user


    if(usermsg == 'ข้อมูลผู้โดยสาร'){
        //spilt FirstName/Lastname
        // const person_original = parameters.person_name
        // if(person_original.includes(' ')){
        //   name = person_original.split(/\s+/) 
        //   FirstName = name[0].trim() 
        //   Lastname = name[1].trim() 
        // }else {
        // 	console.log('Error Split FirstName/Lastname not have " " ')
        //   FirstName = person_original.trim()
        // }
 
        // const phone = parameters['phone-number'].trim() 
        // const address = parameters.address.trim() 
        // const phoneSOS = parameters.telsos.trim() 
        // console.log('name= '+name)
        // console.log('phone= '+phone)
        // console.log('address= '+address)
        // if(Passenger_DB_val!==null){
        //   //data
        //   console.log('Passenger_DB_val')
        //   console.log(Passenger_DB_val)
          
        //   Object.keys(Passenger_DB_val).forEach((key,index) =>{
        //     DBid_Passenger = key
        //   })
        //   userJson = {UserID:userID,FirstName:FirstName,Lastname:Lastname ,Tel:phone,Address:address ,TelSOS:phoneSOS}
        //   await admin.database().ref('Passenger').child(userID+'/'+DBid_Passenger).set(userJson);
        // }else{
        //   //No data
        //   userJson = {UserID:userID,FirstName:FirstName,Lastname:Lastname ,Tel:phone,Address:address ,TelSOS:phoneSOS}
        //   await admin.database().ref('Passenger').child(userID).push(userJson);
        // }
        if(Passenger_DB_val==null){
          //No data
          stage_user = 1
          const save_stage = await admin.database().ref('save_stage').child(userID+'/stage_user/stage_now').set(stage_user);
          reply2(payload,'รบกวนขอข้อมูลมูลส่วนตัวของผู้โดยสารเผื่อกรณีเกิดเหตุฉุกเฉินเราจะได้มีข้อมูลเพื่อที่จะได้ให้การช่วยเหลือคุณได้','รบกวนบอกชื่อ-นามสกุลของผู้โดยสาร');

        }else{
          //Have data
          // userJson = {UserID:userID,FirstName:FirstName,Lastname:Lastname ,Tel:phone,Address:address ,TelSOS:phoneSOS}
          // await admin.database().ref('Passenger').child(userID).push(userJson);
          reply(payload,'คุณกรอกข้อมูล User เรียบร้อยแล้ว');
        }
        

    }else if (intentName =='ดูข้อมูลของฉัน'){
      if(Passenger_DB_val!==null){
        console.log('Passenger_DB_val')
        console.log(Passenger_DB_val)
        Object.keys(Passenger_DB_val).forEach((key,index) =>{
          console.log('Passenger_DB_val[key]')
          console.log(Passenger_DB_val[key])
          UserInfo = Passenger_DB_val[key]
        })
        replyflex(payload,UserInfo)
      }else{
        reply(payload,'คุณยังไม่ได้กรอกข้อมูล User กรุณาพิมพ์คำว่า "ข้อมูลผู้โดยสาร"')
      }
      
        

    }else if(intentName=='SaveLicense'){

      const license = parameters.license.trim() 
      const licenseNo = parameters.licenseNo.trim() 
      const driverJson = {license:license,licenseNo:licenseNo}
      if(Driver_DB_val!==null){
        
        Object.keys(Driver_DB_val).forEach((key,index) =>{
            DBid_Driver = key
          })
        await admin.database().ref('Driver').child(userID+'/'+DBid_Driver).set(driverJson);

      }else{
      await admin.database().ref('Driver').child(userID).push(driverJson);
      }
      
      

    }else if(usermsg=='ดูข้อมูลคนขับ'){
      if(Driver_DB_val !== null){
        console.log('Passenger_DB_val')
        console.log(Driver_DB_val)
        Object.keys(Driver_DB_val).forEach((key,index) =>{
          console.log('Passenger_DB_val[key]')
          console.log(Driver_DB_val[key])
          DriverInfo = Driver_DB_val[key]
        })
        replyflex_DriverInfo(payload,DriverInfo)
      }else{
        reply(payload,'คุณยังไม่ได้กรอกข้อมูล ทะเบียนรถ')
      }
    }
    
    res.sendStatus(200)
});

function close(message){
  
}

const reply = (bodyResponse,msg) => {
  return request({
    method: `POST`,
    uri: `${LINE_MESSAGING_API}/reply`,
    headers: LINE_HEADER,
    body: JSON.stringify({
      replyToken: bodyResponse.replyToken,
      messages: [
        {
          type: `text`,
          text: msg
        }
	  ]
    })
  });
};

const reply2 = (bodyResponse,msg1,msg2) => {
  return request({
    method: `POST`,
    uri: `${LINE_MESSAGING_API}/reply`,
    headers: LINE_HEADER,
    body: JSON.stringify({
      replyToken: bodyResponse.replyToken,
      messages: [
        {
          type: `text`,
          text: msg1
        },
        {
          type: `text`,
          text: msg2
        }
	  ]
    })
  });
};

const replyflex = (bodyResponse,UserInfo) => {
  return request({
    method: `POST`,
    uri: `${LINE_MESSAGING_API}/reply`,
    headers: LINE_HEADER,
    body: JSON.stringify({
      replyToken: bodyResponse.replyToken,
      messages: [
        {
          "type": "flex",
          "altText": "ข้อมูล User",
          "contents": {
            "type": "bubble",
            "header": {
              "type": "box",
              "layout": "vertical",
              "contents": [
                {
                  "type": "text",
                  "text": "ข้อมูล User",
                  "weight": "bold",
                  "size": "xl",
                  "align": "center",
                  "color": "#a26fb8"
                }
              ],
              "backgroundColor": "#ebe1ef"
            },
            "body": {
              "type": "box",
              "layout": "vertical",
              "contents": [
                {
                  "type": "box",
                  "layout": "vertical",
                  "margin": "lg",
                  "spacing": "sm",
                  "contents": [
                    {
                      "type": "box",
                      "layout": "horizontal",
                      "contents": [
                        {
                          "type": "text",
                          "text": "Name :",
                          "size": "md",
                          "color": "#a26fb8",
                          "flex": 0
                        },
                        {
                          "type": "text",
                          "text": UserInfo.FirstName+' '+UserInfo.Lastname,
                          "size": "sm",
                          "color": "#a26fb8",
                          "align": "end"
                        }
                      ]
                    },
                    {
                      "type": "separator",
                      "margin": "md"
                    },
                    {
                      "type": "box",
                      "layout": "horizontal",
                      "contents": [
                        {
                          "type": "text",
                          "text": "Tel. :",
                          "size": "md",
                          "color": "#a26fb8",
                          "flex": 0
                        },
                        {
                          "type": "text",
                          "text": UserInfo.Tel,
                          "size": "sm",
                          "color": "#a26fb8",
                          "align": "end"
                        }
                      ],
                      "margin": "lg"
                    },
                    {
                      "type": "separator",
                      "margin": "md"
                    },
                    {
                      "type": "box",
                      "layout": "horizontal",
                      "contents": [
                        {
                          "type": "text",
                          "text": "Address :",
                          "size": "md",
                          "color": "#a26fb8",
                          "flex": 0
                        },
                        {
                          "type": "text",
                          "text": UserInfo.Address,
                          "size": "sm",
                          "color": "#a26fb8",
                          "align": "end",
                          "wrap": true
                        }
                      ],
                      "margin": "lg"
                    },
                    {
                      "type": "separator",
                      "margin": "md"
                    }
                  ]
                }
              ],
              "backgroundColor": "#f6f2f8"
            },
            "styles": {
              "footer": {
                "separator": true
              }
            }
          }
         }
	  ]
    })
  });

  
};

const replyflex_DriverInfo = (bodyResponse,DriverInfo) => {
  return request({
    method: `POST`,
    uri: `${LINE_MESSAGING_API}/reply`,
    headers: LINE_HEADER,
    body: JSON.stringify({
      replyToken: bodyResponse.replyToken,
      messages: [
        {
          "type": "flex",
          "altText": "ข้อมูล User",
          "contents": {
            "type": "bubble",
            "header": {
              "type": "box",
              "layout": "vertical",
              "contents": [
                {
                  "type": "text",
                  "text": "ข้อมูล Driver",
                  "weight": "bold",
                  "size": "xl",
                  "align": "center",
                  "color": "#447597"
                }
              ],
              "backgroundColor": "#fffff0"
            },
            "body": {
              "type": "box",
              "layout": "vertical",
              "contents": [
                {
                  "type": "box",
                  "layout": "vertical",
                  "margin": "lg",
                  "spacing": "sm",
                  "contents": [
                    {
                      "type": "box",
                      "layout": "horizontal",
                      "contents": [
                        {
                          "type": "text",
                          "text": "License :",
                          "size": "md",
                          "color": "#447597",
                          "flex": 0
                        },
                        {
                          "type": "text",
                          "text": DriverInfo.license,
                          "size": "sm",
                          "color": "#447597",
                          "align": "end"
                        }
                      ]
                    },
                    {
                      "type": "separator",
                      "margin": "md"
                    },
                    {
                      "type": "box",
                      "layout": "horizontal",
                      "contents": [
                        {
                          "type": "text",
                          "text": "LicenseNo. :",
                          "size": "md",
                          "color": "#447597",
                          "flex": 0
                        },
                        {
                          "type": "text",
                          "text": DriverInfo.licenseNo,
                          "size": "sm",
                          "color": "#447597",
                          "align": "end"
                        }
                      ],
                      "margin": "lg"
                    },
                    {
                      "type": "separator",
                      "margin": "md"
                    }
                  ]
                }
              ],
              "backgroundColor": "#fffed7"
            },
            "styles": {
              "footer": {
                "separator": true
              }
            }
          }
         }
	  ]
    })
  });

  
};