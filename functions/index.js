const { google } = require("googleapis");
const functions = require("firebase-functions");
const nodemailer = require("nodemailer");

const credentials = require("./credentials.json");

const authClient = new google.auth.OAuth2(
  credentials.oauth_client_id,
  credentials.oauth_client_secret,
  credentials.oauth_redirect_uri
);
authClient.setCredentials({
  refresh_token: credentials.oauth_refresh_token
});

const mailTransport = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: credentials.gmail_account,
    pass: credentials.gmail_password
  }
});

exports.sendRequestEmail = functions.firestore
  .document("requests/{request}")
  .onCreate(async snap => {
    const data = snap.data();

    await mailTransport.sendMail({
      from: `Hackweek PTO <pto@sentry.com>`,
      to: data.manager,
      subject: `New PTO Request!`,
      html: `<h1>Hola Amigo!</h1><br/>${
        data.email
      } just sent a new request for ${data.totalDays} days off, from ${
        data.start
      } to ${
        data.end
      }.<br/><br/>Please go to your <a href="http://localhost:3000/pending-requests">Pending Requests</a> panel to approve or decline it.<br/><br/><b>Gracias!</b>`
    });

    return null;
  });

exports.addCalendarEntry = functions.firestore
  .document("requests/{request}")
  .onUpdate(async change => {
    const data = change.after.data();
    const previousData = change.before.data();

    // If anything else than approval status changed, skip the trigger
    if (data.approved === previousData.approved) return null;

    // If request was declined, skip the trigger
    if (!data.approved) return null;

    await mailTransport.sendMail({
      from: `Hackweek PTO <pto@sentry.com>`,
      to: data.email,
      subject: `Your PTO Request Has Been Approved!`,
      html: `<h1>Hola Amigo!</h1><br/>Your request for PTO from ${
        data.start
      } to ${
        data.end
      } has been approved.<br/><br/>Now grab a beer and celebrate!<br/><br/><b>De Nada!</b>`
    });

    // If request wqs approved, create an entry in the calendar
    await new Promise((resolve, reject) => {
      google.calendar("v3").events.insert(
        {
          auth: authClient,
          calendarId: credentials.calendar_id,
          resource: {
            summary: data.email,
            description: data.description,
            start: {
              date: data.start
            },
            end: {
              date: data.end
            }
          }
        },
        (err, res) => {
          if (err) {
            console.error("Error adding event: " + err.message);
            return reject(err);
          }
          console.log("Request successful");
          return resolve(res);
        }
      );
    });

    return null;
  });
