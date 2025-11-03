// #1 - import the request module, which is used to download data over http
const cowsay = require("cowsay");


const request = require('request');

// #2 - set our URL -- we've switched to a less offensive URL here, but uncomment what you prefer.
// let url = 'https://geek-jokes.sameerkumar.website/api';
let url = 'https://api.forismatic.com/api/1.0/?method=getQuote&format=text&lang=en';

// #3 - make the request
// the second parameter below is a callback function (an ES6 arrow function in this case)
// which is called when the data is downloaded
request(url, (err, response, body) => {
    // if there's no error, and if the server's status code is 200 (i.e. "Ok")
    if(!err && response.statusCode == 200){
    	// log out the plain-text joke - no parsing required!
        console.log(cowsay.say({
	text : body,
	e : "oO"
}));
    }
});


