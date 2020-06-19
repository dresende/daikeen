let strings = {
	model    : "model",
	type     : "type",
	mid      : "mid",
	adv      : "specialMode",
	mac      : "macAddress",
	adp_mode : "adapterMode",
	adp_kind : "adapterKind",
	id       : "id",
	name     : "name",
	icon     : "icon",
	location : "location",
	pw       : "password",
	f_rate   : "fanRate", // because there is A and B, not just ints
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

exports.modes = {
	auto    : 0,
	auto1   : 1,
	auto2   : 7,
	dehumid : 2,
	cold    : 3,
	hot     : 4,
	fan     : 6,
};

exports.fan_rates = {
	auto    : "A",
	silence : "B",
	lvl_1   : "3",
	lvl_2   : "4",
	lvl_3   : "5",
	lvl_4   : "6",
	lvl_5   : "7",
};

exports.fan_directions = {
	stop       : 0,
	vertical   : 1,
	horizontal : 2,
	both       : 3,
};

exports.parse = (key, value, result) => {
	if (typeof strings[key] != "undefined") {
		result[strings[key]] = value;
	} else if (typeof floats[key] != "undefined") {
		result[floats[key]] = parseFloat(value, 10);

		if (isNaN(result[floats[key]])) {
			result[floats[key]] = null;
		}
	} else if (typeof ints[key] != "undefined") {
		result[ints[key]] = parseInt(value, 10);

		if (isNaN(result[ints[key]])) {
			result[ints[key]] = null;
		}
	} else if (typeof bools[key] != "undefined") {
		result[bools[key]] = (value == "1");
	}

	if (key == "mode") {
		for (let k in exports.modes) {
			if (result.mode == exports.modes[k]) {
				result.mode = k;
				break;
			}
		}
	} else if (key == "f_rate") {
		for (let k in exports.fan_rates) {
			if (result.fanRate == exports.fan_rates[k]) {
				result.fanRate = k;
				break;
			}
		}
	} else if (key == "f_dir") {
		for (let k in exports.fan_directions) {
			if (result.fanDirection == exports.fan_directions[k]) {
				result.fanDirection = k;
				break;
			}
		}
	}
};

exports.convert = (params) => {
	let result = {};
	let done   = [];

	for (let k in floats) {
		if (typeof params[floats[k]] == "undefined") continue;

		result[k] = "" + params[floats[k]].toFixed(1);
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
	for (let k in strings) {
		if (typeof params[strings[k]] == "undefined") continue;

		result[k] = params[strings[k]];
		done.push(k);
		done.push(strings[k]);
	}

	Object.keys(params).filter((k) => (!done.includes(k))).map((k) => {
		result[k] = params[k];
	});

	if (typeof result.mode == "string") {
		result.mode = exports.modes[result.mode];

		if (typeof result.mode != "number") {
			delete result.mode;
		}
	}

	if (typeof result.f_rate != "undefined") {
		result.f_rate = exports.fan_rates[result.f_rate] || undefined;
	}

	if (typeof result.f_dir != "undefined") {
		result.f_dir = exports.fan_directions[result.f_dir] || undefined;
	}

	return result;
};
