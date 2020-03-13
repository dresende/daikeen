const Connection = require("./lib/Connection");

exports.createConnection = (address) => {
	return new Connection(address, {
		interval : 5000,
	});
};
