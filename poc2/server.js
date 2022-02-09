// server.js

/**
 * Required External Modules
 */
const express = require("express");
const path = require("path");


/**
 * App Variables
 */
const app = express();
const port = "8001";
const host = '0.0.0.0';


/**
 *  App Configuration
 */
app.use(express.static(path.join(__dirname, "public")));


/**
 * Routes Definitions
 */

//home page
app.get("/", (req, res) => {
	res.sendFile( path.join(__dirname + '/public/index.html') );
});


app.use((req, res, next) => {
  res.status(404).send("Sorry can't find that!");
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});




/**
 * Server Activation
 */


app.listen(port, host, () => {
  console.log(`Listening to requests on http://${host}:${port}`);
});
