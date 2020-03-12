const assert = require('assert')
const {google} = require('googleapis');
const gmail = google.gmail('v1');


/**
 * Lists the labels in the user's account.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */

function listLabels(oAuth2Client) {
  gmail.users.labels.list({auth: oAuth2Client, userId: 'me',}, function(err, response) {
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



function send_mail1(oAuth2Client) {
//  console.log(`@168: send_mail1 oauth2Client=>`,oAuth2Client);
  console.log(`@36: send_mail1 expiry_date=>`,new Date(oAuth2Client.credentials.expiry_date));

  const mail = {
    to: 'dominique.klutz@gmail.com',
    bcc: 'alan.gaspachio@gmail.com',
    from: '[contact-us] <ultimheat.com>',
    subject: '239-gmail-token tests',
    message: 'another test @'+new Date()
  };

  const str = `Content-Type: text/html; charset=\"UTF-8\"
MIME-Version: 1.0
Content-Transfer-Encoding: 7bit
to: ${mail.to}
bcc: alan.gaspachio@gmail.com
From: ${mail.from}
subject: ${mail.subject}

${mail.message}
`;

var encodedMail = new Buffer.from(str).toString("base64").replace(/\+/g, '-').replace(/\//g, '_');

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
//    console.log(`send_mail1.then retv:`,{retv})
//    resolve({error:null, status:'email-sent'})
    console.log(`@76: send_mail1 message sent OK.`)
  })
  .catch(err =>{
    console.log(`send_mail1 error:`,{err})
//    resolve({error:err, status:'email-rejected'})
  })
  console.log(`@76: send-mail1 going async`)
  return;
/*
  await send_a_mail(oAuth2Client,{
      email:'jules@gmail.com',
      subject:'newtest',
      message:'Hello.'
    });*/
}


function send_a_mail(oAuth2Client, fdata) {
  console.log(`@57: forward_email visitor:`,{fdata}) // uname, email, phone, subject, message

  return new Promise((resolve, reject)=>{
    /*
    if (!fdata.email) {
      resolve(Object.assign(fdata,{error:'missing-email'}))
      return;
    }*/
    //    const o = await email_forward(req.body)
    //    res.end(JSON.stringify(o));

    const encodedMail = build_encodedMail(fdata);
    console.log(`@101 fdata:`,fdata)
    // console.log(`@102 encodedMail:`,encodedMail)

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
      console.log(`@115: sendMessage:`,{retv})
      resolve({error:null, status:'email-sent'})
    })
    .catch(err =>{
      console.log(`@119: sendMessage error:`,{err})
      resolve({error:err, status:'email-rejected'})
    })
  });
} // send-a-mail


function build_encodedMail(fdata) {

//  const _to = 'ultimheat@gmail.com'
//  const _to = 'dominique.klutz@gmail.com'
//  From: ${form.email.split('@')[0]} [contact-us]<tests.bkk@gmail.com>

  const {to,from,subject,message} = fdata;
  assert (to);
  assert (from);
  assert (subject);
  assert (message);

  const str = `Content-Type: text/html; charset=\"UTF-8\"
MIME-Version: 1.0
Content-Transfer-Encoding: 7bit
to: ${to}
bcc: alan.gaspachio@gmail.com
From: ${from}
subject: ${subject}

${fdata.message}
`;

  var encodedMail = new Buffer.from(str).toString("base64").replace(/\+/g, '-').replace(/\//g, '_');

  return encodedMail;
}


module.exports = {
  listLabels,
  send_mail1,
  send_a_mail,
  build_encodedMail
}
