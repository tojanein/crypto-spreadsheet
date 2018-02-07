function formatPercent(value) {
    return value.replace('.', ',') + "%";
}

function sendEmail(to, subject, htmlBody) {
  MailApp.sendEmail({
    to: to, 
	subject: subject, 
	htmlBody: htmlBody
  });
}