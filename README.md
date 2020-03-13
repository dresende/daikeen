## NodeJS Daikin Air Conditioning HTTP API

This is yet another module to access the local HTTP API given by most of the recent
Daikin Air Conditioning devices. The goal is to be very simple to use and change to
feet your needs. It does not any dependency to fetch HTTP, just plain old NodeJS.

### Example

```js
const Daikeen = require("daikeen");

let daikin = Daikin.createConnection("192.168.0.124");

setTimeout(() => {
	// a few time later..
	console.log(daikin.sensorInformation());

	// turn on
	daikin.setControlInformation({ power: true });
}, 1000);
```
