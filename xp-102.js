#! /usr/bin/env node

var fs = require('fs');
var path = require('path');
//var readline = require('readline');
//var {google} = require('googleapis');
const jsonfile = require('jsonfile');
const gUtils = require('./lib/gmail-utils.js')
// If modifying these scopes, delete your previously saved credentials
// at TOKEN_DIR/gmail-nodejs.json
//var SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];
//const SCOPES = ['https://mail.google.com'];

// Change token directory to your system preference
//var TOKEN_DIR = ('/home/dkz/tmp/gmail-credentials/credentials/');
//var TOKEN_PATH = TOKEN_DIR + 'gmail-nodejs.json';


//const credentials = {};

const env = {
  client_secret: './client-secret-ultimheat-jj.json',
  token_path: './credentials/token.json',
  credentials: {}
}


const oAuth2Client = require('./lib/get-oAuthClient.js')(env);

//gUtils.listLabels(oAuth2Client);
//gUtils.send_mail1(oAuth2Client);


gUtils.send_a_mail(oAuth2Client,{
  to: 'dominique.klutz@gmail.com',
  from: 'xp102 <ultimheat@gmail.com>',
  subject: 'test xp102 @ ' + new Date(),
  message: 'another test'
})
.then((x)=>{
  console.log(`@41: x:`,x)
})
return

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 *
 * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback to call with the authorized
 *     client.
 */


authorize_v2(credentials, ()=>{
  console.log(`@119: authorize(credentials) -passed.`)
});

// authorize_v2(credentials, listLabels);

//listLabels(oAuth2Client)
send_a_mail(oAuth2Client)

console.log('@117 -stop-')
return;


/*****************************
// Load client secrets from a local file.
fs.readFile('client_secret.json', function processClientSecrets(err, content) {
  if (err) {
    console.log('Error loading client secret file: ' + err);
    return;
  }
  // Authorize a client with the loaded credentials, then call the
  // Gmail API.
  authorize(JSON.parse(content), listLabels);
});
***************/

authorize(credentials, listLabels);
authorize(credentials, send_a_mail);



function authorize_v2(credentials, callback) {
    var clientSecret = credentials.installed.client_secret;
    var clientId = credentials.installed.client_id;
    var redirectUrl = credentials.installed.redirect_uris[0];

    var OAuth2 = google.auth.OAuth2;

    var oauth2Client = new OAuth2(clientId, clientSecret,  redirectUrl);


    if (credentials.token) {
      oauth2Client.setCredentials(credentials.token); //credentials.token;
      callback(oauth2Client);
    } else {
      getNewToken(oauth2Client, callback);
    }
}




/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 *
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
    var clientSecret = credentials.installed.client_secret;
    var clientId = credentials.installed.client_id;
    var redirectUrl = credentials.installed.redirect_uris[0];

    var OAuth2 = google.auth.OAuth2;

    var oauth2Client = new OAuth2(clientId, clientSecret,  redirectUrl);



    // Check if we have previously stored a token.
    /*************************
    fs.readFile(TOKEN_PATH, function(err, token) {
      if (err) {
        getNewToken(oauth2Client, callback);
      } else {
        oauth2Client.credentials = JSON.parse(token);
        callback(oauth2Client);
      }
    });*/

    if (credentials.token) {
      oauth2Client.credentials = credentials.token;
      callback(oauth2Client);
    } else {
      getNewToken(oauth2Client, callback);
    }
}
