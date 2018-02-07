function sendToTelegram(apiToken, chatId, payload) {
  
  /*var payload = {
    'method': 'sendMessage',
    'chat_id': String(chatId),
    'text': quote,
    'parse_mode': 'HTML'
  }*/
  
  var data = {
    "method": "post",
    "payload": payload
  }
  
  // send message via telegram api
  UrlFetchApp.fetch('https://api.telegram.org/bot' + apiToken + '/', data);    
}
