import path = require('path');
import createEMailServer, { ServerConfiguration } from "./server";
import SslCertificate from "./ssl";
import { SMTPServer } from 'smtp-server';
import sendEMail from './sender';

const hostnames = (process.env.HOSTNAMES || 'localhost,host.local').split(',');
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 587;
const SSL_PORT = process.env.SSL_PORT ? parseInt(process.env.SSL_PORT) : 465;
const SSL_CERT = path.join(__dirname, '../cert', process.env.SSL_CERT || './fullchain.cer');
const SSL_KEY  = path.join(__dirname, '../cert', process.env.SSL_KEY  || (hostnames[0] + '.key'));

const basicConfig : ServerConfiguration = {
	hostnames,
	emailHandler (data, session, callback) {
		var from = session.envelope.mailFrom;
		var strFrom = '';
		if (from !== false) strFrom = from.address;
		var toArr = session.envelope.rcptTo;
		var strTo = toArr.map(address => address.address).join(',');
		console.log ('email from ' + strFrom + ' to ' +strTo);
		sendEMail(strFrom, 'forward-to@other-host.com', 'hellerrr!!!!');
		callback();
	}
};

var basicServer = createEMailServer(basicConfig, PORT);

var sslServer : SMTPServer;
new SslCertificate (SSL_CERT, SSL_KEY)
.on('cert:found', cert => {
	sslServer = createEMailServer(basicConfig, SSL_PORT, cert);
})
.on('cert:changed', cert => {
	sslServer.close(() => {
		sslServer = createEMailServer(basicConfig, SSL_PORT, cert);
	});
});
