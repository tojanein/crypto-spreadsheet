function updateCryptoSpreadsheet() {
  
  var spreadsheet = SpreadsheetApp.openByUrl(PropertiesService.getScriptProperties().getProperty('spreadsheetUrl'));
  
  var apiToken = PropertiesService.getScriptProperties().getProperty('apiToken');
  var chatId   = PropertiesService.getScriptProperties().getProperty('chatId');
   
  updatePriceSheetFromCoinMarketCap(spreadsheet);
  
  sendPriceSheetViaTelegram(spreadsheet, apiToken, chatId);
  sendBalanceViaTelegram(spreadsheet, apiToken, chatId);
}

function updatePriceSheetFromCoinMarketCap(spreadsheet) {
  
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
        }
        
    }

    // Flush the array to the spreadsheet in 1 go
    priceSheet.getRange(RANGE).setValues(trackedCoins);
}

function sendPriceSheetViaTelegram(spreadsheet, apiToken, chatId) {
  
  const PRICE_SHEET_NAME = "Prices"
  const RANGE = "A:I";
  
  var priceSheet = spreadsheet.getSheetByName(PRICE_SHEET_NAME);
  
  var trackedCoins = priceSheet.getRange(RANGE).getValues();
  
  var coins = ''
  
  for(var i = 1; i < trackedCoins.length; i++) {
    
    // skip empty lines
    if(trackedCoins[i][1] == "")
      continue;
    
    coins += '<b>'+ trackedCoins[i][1] + '</b>: ' + trackedCoins[i][2] + '$ / ' + trackedCoins[i][3] + '€\n';
  }
  
  var payload = {
    'method': 'sendMessage',
    'chat_id': String(chatId),
    'text': coins,
    'parse_mode': 'HTML'
  }
        
  sendToTelegram(apiToken, chatId, payload);
}

function sendBalanceViaTelegram(spreadsheet, apiToken, chatId) {
  
  const PRICE_SHEET_NAME = "Balance"
  const RANGE = "A:D";
  
  var priceSheet = spreadsheet.getSheetByName(PRICE_SHEET_NAME);
  
  var trackedCoins = priceSheet.getRange(RANGE).getValues();
  
  var coins = ''
  
  var sampleData = Charts.newDataTable()
       .addColumn(Charts.ColumnType.STRING, "Month")
       .addColumn(Charts.ColumnType.NUMBER, "Total")
       .addColumn(Charts.ColumnType.STRING, "Color")

  
  for(var i = 1; i < trackedCoins.length; i++) {
    
    // skip empty lines
    if(trackedCoins[i][0] == "")
      continue;
    
    var coinSymbol = trackedCoins[i][0]
    var value = (trackedCoins[i][3]*100).toFixed(2)
    
    coins += '<b>'+ trackedCoins[i][0] + '</b>: ' + value +'%\n';
    
    if(value > 0) {
      sampleData.addRow([coinSymbol, value, 'green']);
    } else {
      sampleData.addRow([coinSymbol, value, 'red']);
    }
      
  }
   
  var payload = {
    'method': 'sendMessage',
    'chat_id': String(chatId),
    'text': coins,
    'parse_mode': 'HTML'
  }
        
  sendToTelegram(apiToken, chatId, payload);
  
  var view = Charts.newDataViewDefinition().setColumns([
    0,
    1,
    { sourceColumn: 2, role: 'style'},
    { calc: "stringify",
      sourceColumn: 1,
      type: "string",
      role: "annotation" }
  ]);

 var chart = Charts.newBarChart()
       .setTitle('Balance')
       .setXAxisTitle('Change in %')
       .setYAxisTitle('Coin')
       .setDimensions(600, 400)
       .setLegendPosition(Charts.Position.NONE)
       .setDataTable(sampleData.build())
       .setDataViewDefinition(view)
       .build();  
  
  var payload2 = {
    'method': 'sendPhoto',
    'chat_id': String(chatId),
    'photo': chart.getAs('image/png')
  }
        
  sendToTelegram(apiToken, chatId, payload2);
}