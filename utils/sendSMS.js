const axios = require('axios');

require('dotenv').config();

function sendSMS({ number, text, time }) {
  this.token = process.env.TURBOSMS_TOKEN;
  
  let params = {
    recipients: [number],
    sms: {
      sender: 'BEAUTY',
      text: text
    },
    start_time: time,
    token: this.token,
  };
  
  let config = {
    headers: {
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json'
    }
  };
  
  return axios.post(`https://api.turbosms.ua/message/send.json`, params, config);
}

module.exports = sendSMS;


// const querystring = require('querystring');