import express from 'express';
import { MongoClient } from 'mongodb';

// I don't care about the password being leaked, nothing sensitive
const mongoURI = 'mongodb+srv://danielscherzer:admin@cluster0.3lamrvz.mongodb.net';

const app = express();

// Extract parameters from the POST body
app.use( express.urlencoded( { extended: true } ) );

app.get( '/', function (req, res) {
	res.send(`
<body>
<form method='POST' action='/process'>
<label for='place'>Search for a place by name or zip code</label><br>
<input type='text' id='place' name='place' required>
<button type='submit'>Submit</button>
</form>
</body>
		`);
} );

const doQuery = async ( queryParams ) => {
	const client = new MongoClient(mongoURI);
	try {
		await client.connect();
		const placesDb = client.db('places_cs120');
		const placesColl = placesDb.collection('places');

		const result = await placesColl.findOne( queryParams );
		return result;
	} finally {
		await client.close();
	}
}

app.post( '/process', async function (req, res) {
	if ( req.body === undefined || req.body.place === undefined ) {
		res.send( 'No POST parameter found, did you navigate here directly?' );
		res.statusCode = 400;
		return;
	}
	const searchTerm = req.body.place;
	const isZip = searchTerm[0] >= '0' && searchTerm[0] <= '9';

	const dbQuery = {};
	if ( isZip ) {
		dbQuery.zips = searchTerm;
	} else {
		dbQuery.place = searchTerm;
	}

	const result = await doQuery( dbQuery );

	if ( result === undefined ) {
		const searchBy = isZip ? 'zip code' : 'city name';
		res.send( `No city found for the ${searchBy} '${searchTerm}'` );
		return;
	}

	// I trust all of the data in the database, there isn't going to be a
	// vulnerability from not escaping things here
	let resultHtml = '<h1>' + result.place + '</h1>';
	resultHtml += "\nThe following zip codes are used for " + result.place + ":";
	resultHtml += '<ul>'
		+ result.zips.map( ( z ) => `<li>${z}</li>\n` ).join( '\n' )
		+ '</ul>';
	res.send( resultHtml ); 
} );

app.listen( 3000 );