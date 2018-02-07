function doPost(e) {
  
  var apiToken = PropertiesService.getScriptProperties().getProperty('apiToken');;
  
  var update = JSON.parse(e.postData.contents);

  // Make sure this is update is a type message
  if (update.hasOwnProperty('message')) {
    var msg = update.message;
    var chatId = msg.chat.id;

    // Make sure the update is a command.
    if (msg.hasOwnProperty('entities') && msg.entities[0].type == 'bot_command') {

      // If the user sends the /quote command
      if (msg.text == '/quote') {
        

        var payload = {
          'method': 'sendMessage',
          'chat_id': String(chatId),
          'text': getQuote(),
          'parse_mode': 'HTML'
        }

        sendToTelegram(apiToken, chatId, payload)
      } else if (msg.text == '/fetch') {
        fetchFromCoinMarketCap()
      } else {
        var payload = {
          'method': 'sendMessage',
          'chat_id': String(chatId),
          'text': 'Unkown command!',
          'parse_mode': 'HTML'
        }

        sendToTelegram(apiToken, chatId, payload)
      }
    }
  }
}