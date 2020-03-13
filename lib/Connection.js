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
		address         : "127.0.0.1",
		sensorInterval  : 5000, // ms
		controlInterval : 2000, // ms
	}

	constructor(uri) {
		uri = url.parse(uri, true);

		this.#options.address = uri.host;

		if (uri.query) {
			if (typeof uri.query.sensorInterval != "undefined") {
				this.#options.sensorInterval = +uri.query.sensorInterval;
			}
			if (typeof uri.query.controlInterval != "undefined") {
				this.#options.controlInterval = +uri.query.controlInterval;
			}
		}

		this.getModelInformation((err, modelInformation) => {
			if (err) {
				debug(err);
			} else {
				this.#modelInformation = modelInformation;
			}

			if (this.#options.sensorInterval > 0) {
				this.updateSensorInformation();
			}

			if (this.#options.controlInterval > 0) {
				this.updateControlInformation();
			}
		});
	}

	updateSensorInformation() {
		this.getSensorInformation((err, sensorInformation) => {
			if (err) {
				debug(err);
			} else {
				this.#sensorInformation = sensorInformation;
			}

			setTimeout(() => (this.updateSensorInformation()), this.#options.sensorInterval);
		});
	}

	updateControlInformation() {
		this.getControlInformation((err, controlInformation) => {
			if (err) {
				debug(err);
			} else {
				this.#controlInformation = controlInformation;
			}

			setTimeout(() => (this.updateControlInformation()), this.#options.controlInterval);
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
		this.get("/aircon/get_model_info", (err, data, raw_data) => {
			if (err) return next(err);

			return next(null, data, raw_data);
		});
	}

	getSensorInformation(next = () => {}) {
		this.get("/aircon/get_sensor_info", (err, data, raw_data) => {
			if (err) return next(err);

			return next(null, data, raw_data);
		});
	}

	getControlInformation(next = () => {}) {
		this.get("/aircon/get_control_info", (err, data, raw_data) => {
			if (err) return next(err);

			return next(null, data, raw_data);
		});
	}

	setControlInformation(changes, next = () => {}) {
		this.getControlInformation((err, _, raw_data) => {
			for (let k in changes) {
				raw_data[k] = changes[k];
			}

			this.set("/aircon/set_control_info", raw_data, (err) => {
				if (err) return next(err);

				this.getControlInformation((err, controlInformation) => {
					if (err) return next(err);

					this.#controlInformation = controlInformation;

					return next();
				});
			});
		});
	}

	set(path, data, next) {
		let request = Data.convert(data);

		http.get(`http://${this.#options.address}${path}?${qs.stringify(request)}`, (res) => {
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
