function updateCryptoSpreadsheet() {
  
  var spreadsheet = SpreadsheetApp.openByUrl(PropertiesService.getScriptProperties().getProperty('spreadsheetUrl'));
  
  var apiToken = PropertiesService.getScriptProperties().getProperty('apiToken');
  var chatId   = PropertiesService.getScriptProperties().getProperty('chatId');
   
  updatePriceSheetFromCoinMarketCap(spreadsheet, apiToken, chatId);
}

function updatePriceSheetFromCoinMarketCap(spreadsheet, apiToken, chatId) {
  
    const PRICE_SHEET_NAME = "Prices"
    const RANGE = "A:I";
  
    var priceSheet = spreadsheet.getSheetByName(PRICE_SHEET_NAME);
  
    var trackedCoins = priceSheet.getRange(RANGE).getValues();

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
            trackedCoins[i][8] = Utilities.formatDate(new Date(coin.last_updated*1000), "GMT+1", "yyyy-MM-dd HH:mm:ss");
          
            var payload = {
              'method': 'sendMessage',
              'chat_id': String(chatId),
              'text': coin.symbol + ': ' + coin.price_usd.replace('.',',') + '$ / ' + coin.price_eur.replace('.',',') + '€',
              'parse_mode': 'HTML'
            }
          
            sendToTelegram(apiToken, chatId, payload);
        }
        
    }

    // Flush the array to the spreadsheet in 1 go
    priceSheet.getRange(RANGE).setValues(trackedCoins);
}