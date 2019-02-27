import fs = require('fs');
import path =require('path');
import { EventEmitter } from 'events';

interface SSLConfig {
	key: string;
	cert: string;
}

class SslCertificate {
	private readonly eventBus : EventEmitter;
	private readonly sslCertPath : string;
	private readonly sslKeyPath : string;
	private isFirstTimeToReadCertFiles : boolean = true;

	
	constructor (sslCertPath: string, sslKeyPath: string) {
		this.eventBus = new EventEmitter();
		this.sslCertPath = sslCertPath;
		this.sslKeyPath = sslKeyPath;
		this.hasCerts()
		.then(hasCerts => {
			if (hasCerts) this.readCertificateFiles();
			this.watchDirectory();
		})
		.catch(err => {
			console.log (err);
		});
	}


	private async hasCerts () {
		return new Promise<Boolean> ((resolve, reject) => {
			fs.exists(this.sslCertPath, certExists => {
				if (!certExists) resolve(false);
				else {
					fs.exists(this.sslKeyPath, resolve);
				}
			});
		});
	}


	private readCertificateFiles () {
		fs.readFile(this.sslCertPath, 'ascii', (err, certData) => {
			if (err) {
				console.error(err);
				return;
			}
			fs.readFile(this.sslKeyPath, 'ascii', (err, keyData) => {
				if (err) {
					console.error(err);
					return;
				}
				var config : SSLConfig = {
					cert: certData,
					key: keyData
				};
				if (this.isFirstTimeToReadCertFiles) {
					this.isFirstTimeToReadCertFiles = false;
					this.eventBus.emit('cert:found', config);
				} else {
					this.eventBus.emit('cert:changed', config);
				}
			});
		});
	}


	private scheduleTimer : NodeJS.Timeout = null;
	private scheduleReadCertificateFiles () {
		if (this.scheduleTimer) clearTimeout(this.scheduleTimer);
		this.scheduleTimer = setTimeout (() => {
			this.readCertificateFiles();
		}, 200);
	}

	private async watchDirectory () {
		var directory = path.join(path.dirname(this.sslCertPath), '..');
		var watcher = fs.watch(directory, { recursive: true }, (event, filename) => {
			if (filename.startsWith('cert')) {
				this.hasCerts()
				.then(certsExist => {
					if (certsExist) {
						this.scheduleReadCertificateFiles();
					}
				})
				.catch(err => {
					console.error(err);
				})
			}
		});
	}
	

	public on (event : 'cert:found', listener : (cert : SSLConfig) => void) : SslCertificate;
	public on (event : 'cert:changed', listener : (cert : SSLConfig) => void) : SslCertificate;
	public on (event : string, listener : (...args : any[]) => void) : SslCertificate {
		this.eventBus.on(event, listener);
		return this;
	}
	public once (event : 'cert:found', listener : (cert : SSLConfig) => void) : SslCertificate;
	public once (event : 'cert:changed', listener : (cert : SSLConfig) => void) : SslCertificate;
	public once (event : string, listener : (...args : any[]) => void) : SslCertificate {
		this.eventBus.once(event, listener);
		return this;
	}
	public removeListener (event : 'cert:found', listener : (cert : SSLConfig) => void) : SslCertificate;
	public removeListener (event : 'cert:changed', listener : (cert : SSLConfig) => void) : SslCertificate;
	public removeListener (event : string, listener : (...args : any[]) => void) : SslCertificate {
		this.eventBus.removeListener(event, listener);
		return this;
	}

}



export { SslCertificate, SSLConfig };
export default SslCertificate;
