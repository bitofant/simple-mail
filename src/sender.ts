import nodemailer = require('nodemailer');

async function sendEMail (from : string, to : string, email : string) {
	var transporter = nodemailer.createTransport({
		host: 'smtp.gmail.com',
		port: 587,
		secure: false
	});
	var mail : nodemailer.SendMailOptions = {
		from: from,
		to: to,
		subject: 'Hello',
		text: 'Heller!!!1',
		html: '<b>Heller!!!1</b>'
	};
	console.log('sending...');
	let info = await transporter.sendMail(mail);
	console.log('Message sent: %s', info.messageId);
	console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
}

export { sendEMail };
export default sendEMail;
