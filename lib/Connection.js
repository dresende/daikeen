const qs    = require("querystring");
const url   = require("url");
const http  = require("http");
const debug = require("debug")("daikeen");

const Data = require("./Data");

class Connection {
	#modelInformation   = {};
	#sensorInformation  = {};
	#controlInformation = {};
	#options            = {
		interval : 2000,
	}

	constructor(uri) {
		uri = url.parse(uri, true);

		this.#options = {
			address  : (uri.host || "127.0.0.1"),
			interval : (uri.query ? (+uri.query.interval || 2000) : 2000),
		};

		this.getModelInformation((err, modelInformation) => {
			if (err) {
				debug(err);
			} else {
				this.#modelInformation = modelInformation;
			}

			if (this.#options.interval > 0) {
				this.update();
			}
		});
	}

	update() {
		this.getSensorInformation((err, sensorInformation) => {
			if (err) {
				debug(err);
			} else {
				this.#sensorInformation = sensorInformation;
			}

			this.getControlInformation((err, controlInformation) => {
				if (err) {
					debug(err);
				} else {
					this.#controlInformation = controlInformation;
				}

				setTimeout(() => (this.update()), this.#options.interval);
			});
		});
	}

	modelInformation() {
		return this.#modelInformation;
	}

	sensorInformation() {
		return this.#sensorInformation;
	}

	controlInformation() {
		return this.#controlInformation;
	}

	getModelInformation(next = () => {}) {
		this.get("/aircon/get_model_info", (err, data) => {
			if (err) return next(err);

			return next(null, data);
		});
	}

	getSensorInformation(next = () => {}) {
		this.get("/aircon/get_sensor_info", (err, data) => {
			if (err) return next(err);

			return next(null, data);
		});
	}

	getControlInformation(next = () => {}) {
		this.get("/aircon/get_control_info", (err, data) => {
			if (err) return next(err);

			return next(null, data);
		});
	}

	setControlInformation(changes, next = () => {}) {
		this.get("/aircon/get_control_info", (err, _, raw_data) => {
			for (let k in changes) {
				raw_data[k] = changes[k];
			}

			this.set("/aircon/set_control_info", raw_data, (err, result) => {
				console.log(err, result);
			});
		});
	}

	set(path, data, next) {
		let request = Data.convert(data);
		// console.log(request);
		return;

		http.get(`http://${this.#options.address}${path}?${qs.stringify(request)}`, (res) => {
			let buffer = "";

			res.on("data", (data) => {
				buffer += data;
			}).on("end", () => {
				console.log(buffer);
			});
		}).on("error", next);
	}

	get(path, next) {
		http.get(`http://${this.#options.address}${path}`, (res) => {
			let buffer = "";

			res.on("data", (data) => {
				buffer += data;
			}).on("end", () => {
				let params = qs.parse(buffer, ",", "=");

				debug(params);
				switch (params.ret) {
					case "PARAM NG":
						return next(new Error(`Wrong request parameters: '${buffer}'`));
					case "ADV NG":
						return next(new Error(`Wrong ADV: '${buffer}'`));
					case "OK":
						let response = {};

						for (let k in params) {
							Data.parse(k, params[k], response);
						}

						return next(null, response, params);
					default:
						return next(new Error(`Unknown response: '${buffer}'`));
				}
			});
		}).on("error", next);
	}
}

module.exports = Connection;
