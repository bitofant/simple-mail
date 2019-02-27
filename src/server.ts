import smtp = require('smtp-server');
import { SSLConfig } from './ssl';


interface ServerConfiguration {
	hostnames : string[];
	emailHandler : (data : string, session : smtp.SMTPServerSession, callback : (err? : Error) => void) => void;
}


function createEMailServer (config : ServerConfiguration, port : number, sslConfig? : SSLConfig) {
	var serverConfig : smtp.SMTPServerOptions = {
		size: 100 << 20,
		logger: process.env.NODE_ENV !== 'production',
		authOptional: true,
		secure: !!sslConfig,
		onAuth: allowAnyCredentials,
		onRcptTo: allowGivenDestinations(config.hostnames),
		onData(stream, session, callback) {
			var chunks: Buffer[] = [];
			stream.on('data', chunk => {
				if (typeof (chunk) === 'string') {
					chunks.push(Buffer.from(chunk));
				} else {
					chunks.push(chunk);
				}
			});
			stream.on('end', () => {
				console.log('######');
				console.log('######');
				console.log('######');
				config.emailHandler(Buffer.concat(chunks).toString('utf8'), session, callback);
			});
		}
	}
	var server = new smtp.SMTPServer(Object.assign(serverConfig, sslConfig || {}));

	server.listen(port, () => {
		console.log(`${config.hostnames[0]} mail server listening on port ${port}`);
	});

	return server;
}


function allowAnyCredentials (auth : smtp.SMTPServerAuthentication, session : smtp.SMTPServerSession, callback : (err : Error, response? : smtp.SMTPServerAuthenticationResponse) => void) {
	callback(null, { user: 'local' });
}


function extractHostname(addr: smtp.SMTPServerAddress) {
	return addr.address.split('@').pop();
}


function allowGivenDestinations (hostnames : string[]) {
	return (address : smtp.SMTPServerAddress, session: smtp.SMTPServerSession, callback : (err?: Error) => void) => {
		let addressHost = extractHostname(address);
		if (hostnames.includes(addressHost)) {
			callback();
		} else {
			var allowRecipient = hostnames
				.filter(name => name.startsWith('/') && name.endsWith('/'))
				.find(regexHostname => {
					console.log('testing regex ' + regexHostname);
					var regex = new RegExp(regexHostname.substr(1, regexHostname.length - 2));
					console.log(regex.exec(addressHost));
					return regex.test(addressHost);
				}
			);
			if (allowRecipient) {
				callback();
			} else {
				callback(new Error('Unrecognized recipient'));
			}
		}
	};
}


export { createEMailServer, ServerConfiguration };
export default createEMailServer;
