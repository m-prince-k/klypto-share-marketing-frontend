var BreezeConnect = require('breezeconnect').BreezeConnect;

var appKey ="907!43Jcq6+y43614W2J377w02x2847T";
var appSecret = "3110144#0986V25207748$83Z957c(15";

var breeze = new BreezeConnect({"appKey":appKey});


//Obtain your session key from https://api.icicidirect.com/apiuser/login?api_key=YOUR_API_KEY
//Incase your api-key has special characters(like +,=,!) then encode the api key before using in the url as shown below.
console.log("https://api.icicidirect.com/apiuser/login?api_key="+encodeURI("your_api_key"))

//Generate Session
breeze.generateSession(appSecret,"55445149").then(function(resp){
    apiCalls();
}).catch(function(err){
    console.log(err)
});

function apiCalls(){
    breeze.getFunds().then(function(resp){
        console.log("Final Response");
        console.log(resp);
        });
}