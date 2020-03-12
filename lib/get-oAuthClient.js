var fs = require('fs');
var path = require('path');
var readline = require('readline');
var {google} = require('googleapis');
const jsonfile = require('jsonfile');


const SCOPES = ['https://mail.google.com'];

module.exports = function(env){
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

  /***********************
    ALTER EXPIRY_DATE
    does not affect operations => may be just info...
  ************************/

  // oAuth2Client.credentials.expiry_date = null; //new Date();

  return oAuth2Client;
}



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
