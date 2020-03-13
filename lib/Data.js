let strings = {
	model : "model",
	type  : "type",
	mid   : "mid",
	adv   : "specialMode",
};
let floats = {
	htemp : "indoorTemperature",
	otemp : "outoorTemperature",
	stemp : "targetTemperature",
	hhum  : "indoorHumidity",
	shum  : "targetHumidity",
};
let ints = {
	s_fdir  : "sFanDirection",
	f_rate  : "fanRate",
	f_dir   : "fanDirection",
	cmpfreq : "cmpfreq",
	mode    : "mode",
	pv      : "pv",
	cpv     : "cpv",
	err     : "error",
	alert   : "error",
};
let bools = {
	pow : "power",
};

exports.parse = (key, value, result) => {
	if (typeof strings[key] != "undefined") {
		result[strings[key]] = value;
	} else if (typeof floats[key] != "undefined") {
		result[floats[key]] = parseFloat(value, 10) || null;
	} else if (typeof ints[key] != "undefined") {
		result[ints[key]] = parseInt(value, 10) || null;
	} else if (typeof bools[key] != "undefined") {
		result[ints[key]] = !!value;
	}
};

exports.convert = (params) => {
	let result = {};
	let done   = [];

	for (let k in floats) {
		if (typeof params[floats[k]] == "undefined") continue;

		result[k] = params[floats[k]].toFixed(1);
		done.push(k);
		done.push(floats[k]);
	}
	for (let k in ints) {
		if (typeof params[ints[k]] == "undefined") continue;

		result[k] = "" + params[ints[k]];
		done.push(k);
		done.push(ints[k]);
	}
	for (let k in bools) {
		if (typeof params[bools[k]] == "undefined") continue;

		result[k] = (params[bools[k]] ? "1" : "0");
		done.push(k);
		done.push(bools[k]);
	}

	Object.keys(params).filter((k) => (!done.includes(k))).map((k) => {
		result[k] = params[k];
	});

	return result;
};
