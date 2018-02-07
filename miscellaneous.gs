function getQuote() {
  var url = 'http://quotesondesign.com/wp-json/posts?filter[orderby]=rand&filter[posts_per_page]=1';
  var data = UrlFetchApp.fetch(url);
  var posts = JSON.parse(data);
  var post = posts.shift();
  
  // Delete the html tags and \n (newline)
  var cleanContent = post.content.replace(/<(?:.|\n)*?>/gm, "").replace(/\n/gm, "");
  
  // Format the quote
  var quote = '"' + cleanContent + '"\n — <strong>' + post.title + '</strong>';
  
  return quote;
}