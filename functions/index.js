const functions = require("firebase-functions");
const express = require("express");

const app = express();

app.get("/", (req, res) => {
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Content-Type", "application/json");

    var auth = req.get("Authorization");
    var authType = req.get("ML-Authorization-Type")

    if (auth == null || authType == null) {
        res.status(401).send({"message": "Unauthorized. Please provide valid authorization headers.", "code": 401});
        return;
    }

    validateAuth(auth, authType, function(result) {
        if (result) {
            // check firestore for notes
            // return notes
            res.status(200).send({"message": "OK", "code": 200});
        } else {
            res.status(401).send({"message": "Unauthorized. Invalid response recieved from external OAuth provider.", "code": 401});
        }
    });

    // check firestore for notes
    // return notes
});

function validateAuth(auth, authType, callback) {
    if (authType == "DISCORD") {
        // send request to discord
        // if discord returns 200, return true
        const https = require('https');
        const options = {
            hostname: 'discord.com',
          path: '/api/users/@me',
          headers: {
            "Authorization": 'Bearer ' + auth,
            "User-Agent": "ML (https://memolink.info, 1.0.0)"
          }
        };

        console.log(options)
      
        const req = https.request(options, res => {
          console.log(`statusCode: ${res.statusCode}`);
      
          let data = '';
      
          res.on('data', chunk => {
            data += chunk;
          });
      
          res.on('end', () => {
            if (res.statusCode === 200) {
              callback(true);
            } else {
              callback(false);
            }
          });
        });
      
        req.on('error', error => {
          console.error(error);
          callback(false)
        });
      
        req.end();
      }
    return false;
}

exports.notes = functions.https.onRequest(app);