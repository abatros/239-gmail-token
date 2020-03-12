#! /usr/bin/env node

var fs = require('fs');
var path = require('path');
var readline = require('readline');
var {google} = require('googleapis');
const jsonfile = require('jsonfile');

// If modifying these scopes, delete your previously saved credentials
// at TOKEN_DIR/gmail-nodejs.json
//var SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];
const SCOPES = ['https://mail.google.com'];

// Change token directory to your system preference
//var TOKEN_DIR = ('/home/dkz/tmp/gmail-credentials/credentials/');
//var TOKEN_PATH = TOKEN_DIR + 'gmail-nodejs.json';


//const credentials = {};

const env = {
  client_secret: './client-secret-ultimheat-jj.json',
  token_path: './credentials/token.json',
  credentials: {}
}

const {credentials} = env;

if (!credentials.installed) {
  if (!fs.existsSync(env.client_secret)) {
    console.log(`@27: Missing client-secret. <${env.client_secret}> (exit)`)
    return;
  }
//  const _i = jsonfile.readFileSync('./client_secret-ultimheat.json')
  const _i = jsonfile.readFileSync(env.client_secret)
  Object.assign(credentials, _i)
}

if (!credentials.token) {
  if (fs.existsSync(env.token_path)) {
    const token = jsonfile.readFileSync(env.token_path)
    Object.assign(credentials, {token})
//    console.log(token)
  }
}

console.log(`@24:`,credentials)

var gmail = google.gmail('v1');

const {
  client_secret:clientSecret,
  client_id:clientId,
  redirect_uris:redirectUrl
} = env.credentials.installed;


const oAuth2Client = new google.auth.OAuth2(clientId, clientSecret,  redirectUrl[0]);

if (!credentials.token) {
  getNewToken(oAuth2Client, ()=>{
    console.log('done with newToken')
  });
  return;
} else {
  oAuth2Client.setCredentials(credentials.token)
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 *
 * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback to call with the authorized
 *     client.
 */
function getNewToken(oauth2Client, callback) {
  var authUrl = oauth2Client.generateAuthUrl({access_type: 'offline', scope: SCOPES});
  console.log('Authorize this app by visiting this url: ', authUrl);
  var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.question('Enter the code from that page here: ', function(code) {
    rl.close();
    oauth2Client.getToken(code, function(err, token) {
      if (err) {
        console.log('Error while trying to retrieve access token', err);
        return;
      }
//      oauth2Client.credentials = token;
      oAuth2Client.setCredentials(token);
      storeToken(env.token_path, token);
      callback(oauth2Client);
    });
  });
}


/**
 * Store token to disk be used in later program executions.
 *
 * @param {Object} token The token to store to disk.
 */
function storeToken(token_path,token) {
  const {dir} = path.parse(token_path)
  try {
    fs.mkdirSync(dir);
  } catch (err) {
    if (err.code != 'EEXIST') {
      throw err;
    }
  }
  fs.writeFileSync(token_path, JSON.stringify(token),'utf8');
  console.log('Token stored to ' + token_path);
}


authorize_v2(credentials, ()=>{
  console.log(`@119: authorize(credentials) -passed.`)
});

// authorize_v2(credentials, listLabels);

listLabels(oAuth2Client)
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



/**
 * Lists the labels in the user's account.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function listLabels(auth) {
  gmail.users.labels.list({auth: auth, userId: 'me',}, function(err, response) {
    if (err) {
      console.log('The API returned an error: ' + err);
      return;
    }

    var labels = response.data.labels;

    if (labels.length == 0) {
      console.log('No labels found.');
    } else {
      console.log('Labels:');
      for (var i = 0; i < labels.length; i++) {
        var label = labels[i];
        console.log('%s', label.name);
      }
    }
  });
}


async function send_a_mail(oAuth2Client) {
  console.log(`@168: send_a_mail oauth2Client=>`,oAuth2Client);
  await forward_email(oAuth2Client,{
      email:'jules@gmail.com',
      subject:'newtest',
      message:'Hello.'
    });
  console.log(`@175: message sent.`)
}


async function forward_email(oAuth2Client,vi) {
  console.log(`@57: forward_email visitor:`,{vi}) // uname, email, phone, subject, message

  return new Promise((resolve, reject)=>{
    if (!vi.email) {
      resolve(Object.assign(vi,{error:'missing-email'}))
      return;
    }
    //    const o = await email_forward(req.body)
    //    res.end(JSON.stringify(o));

    const encodedMail = build_Message(oAuth2Client, vi);

    gmail.users.messages.send({
        auth: oAuth2Client,
        userId: 'me',
//        sendAsEmail: 'jules@cesar3.com',
//        displayName: 'jules@cesar2.com',
//        replyToAddress: 'jules@cesar.com',
        resource: {
            raw: encodedMail
        }
    })
    .then(retv=>{
      console.log(`sendMessage:`,{retv})
      resolve({error:null, status:'email-sent'})
    })
    .catch(err =>{
      console.log(`sendMessage error:`,{err})
      resolve({error:err, status:'email-rejected'})
    })
  });
}


function build_Message(auth, form) {

  const _to = 'ultimheat@gmail.com'
//  const _to = 'dominique.klutz@gmail.com'

  const str = `Content-Type: text/html; charset=\"UTF-8\"
MIME-Version: 1.0
Content-Transfer-Encoding: 7bit
to: ${_to}
bcc: alan.gaspachio@gmail.com
From: ${form.email.split('@')[0]} [contact-us]<tests.bkk@gmail.com>
subject: ${form.subject}

${form.message}
`;

  var encodedMail = new Buffer(str).toString("base64").replace(/\+/g, '-').replace(/\//g, '_');

  return encodedMail;
}
