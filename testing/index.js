const nodemailer = require('nodemailer');

const USE_TLS_SERVER = Math.random() < .5;
const USE_AUTHENTICATION = Math.random() < .5;

async function main () {
	console.log('Sending message ' + JSON.stringify({USE_TLS_SERVER, USE_AUTHENTICATION},null,2).split('"').join(''));
	let account = null;
	if (USE_AUTHENTICATION) account = await nodemailer.createTestAccount();
	let transporter = nodemailer.createTransport({
		host: "localhost",
		port: USE_TLS_SERVER ? 465 : 587,
		secure: USE_TLS_SERVER,
		auth: USE_AUTHENTICATION ? account : undefined,
		// auth: {
		// 	user: account.user,
		// 	pass: account.pass
		// },
		tls: {
			rejectUnauthorized: false
		}
	});
	let mailOptions = {
		from: '"Heller" <heller@riuna.de>',
		to: 'Joeran <joeran@riuna.de>',
		subject: 'Hello',
		text: 'Heller!!!1',
		html: '<b>Heller!!!1</b>'
	}
	let info = await transporter.sendMail(mailOptions);
	console.log('Message sent: %s', info.messageId);
	console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
}
main().catch(err => {
	console.error(err);
	console.log(err.stack);
});
