function fetchFromCoinMarketCap() {
  
  var apiToken = PropertiesService.getScriptProperties().getProperty('apiToken');
  var chatId   = PropertiesService.getScriptProperties().getProperty('chatId');
 
  const SPREADSHEET = SpreadsheetApp.openByUrl("XXX")
  
    //const SPREADSHEET = SpreadsheetApp.getActiveSpreadsheet();
    const PRICE_SHEET = SPREADSHEET.getSheetByName("Prices");
    const RANGE = "A:I";
  
    var trackedCoins = PRICE_SHEET.getRange(RANGE).getValues();

    // Make the single request
    var response = UrlFetchApp.fetch("https://api.coinmarketcap.com/v1/ticker/?convert=EUR");
    response = JSON.parse(response);

    for(var i = 1; i < trackedCoins.length; i++){
        if(trackedCoins[i][1] == "")
          continue;

        // Get the correct coin from the response
        var coin = response.filter(function(coin){
            return coin.symbol === trackedCoins[i][1];
        })[0];

        // Update the values in the virtual array
        if(coin){
            trackedCoins[i][0] = coin.name;
            //trackedCoins[i][1] = coin.symbol;
            trackedCoins[i][2] = coin.price_usd.replace('.',',');
            trackedCoins[i][3] = coin.price_eur.replace('.',',');
            trackedCoins[i][4] = coin.price_btc.replace('.',',');
            trackedCoins[i][5] = formatPercent(coin.percent_change_1h);
            trackedCoins[i][6] = formatPercent(coin.percent_change_24h);
            trackedCoins[i][7] = formatPercent(coin.percent_change_7d);
            trackedCoins[i][8] = coin.last_updated;
          
          	//MailApp.sendEmail({ to:"dssds6666@gmail.com", subject:"Coins", htmlBody:"" + coin});
          
          var payload = {
             'method': 'sendMessage',
             'chat_id': String(chatId),
            'text': coin.symbol + ': ' + coin.price_usd.replace('.',','),
             'parse_mode': 'HTML'
          }
          
            sendToTelegram(apiToken, chatId, payload);
          
        }
        
    }

    // Flush the array to the spreadsheet in 1 go
    PRICE_SHEET.getRange(RANGE).setValues(trackedCoins);
}