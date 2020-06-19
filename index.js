const Connection = require("./lib/Connection");
const Data       = require("./lib/Data");

exports.createConnection = (address) => {
	return new Connection(address, {
		interval : 5000,
	});
};

exports.Modes    = Data.modes;
exports.FanRates = Data.fan_rates;
