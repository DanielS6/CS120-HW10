import { readFileSync } from 'fs';
import { MongoClient } from 'mongodb';

// I don't care about the password being leaked, nothing sensitive
const mongoURI = 'mongodb+srv://danielscherzer:admin@cluster0.3lamrvz.mongodb.net';

const getAllData = () => {
	const contents = readFileSync( './zips.csv', 'utf8' );
	const byPlace = {};

	const lines = contents.trim().split("\n");
	lines.forEach( ( line ) => {
		// extra trim() for \r\n line endings
		const [place, zip] = line.trim().split(',');
		if ( byPlace[place] === undefined ) {
			byPlace[place] = [zip];
			console.log( `New place: ${place} has zip code ${zip}` );
		} else {
			byPlace[place].push(zip);
			console.log( `Updated: ${place} also has zip code ${zip}` );
		}
	} );

	const placeObjs = [];
	Object.keys( byPlace ).forEach( ( key ) => {
		placeObjs.push( {
			"place": key,
			"zips": byPlace[key]
		} );
	} );
	return placeObjs;
};

async function doUpload(data) {
	const client = new MongoClient(mongoURI);
	try {
		await client.connect();
		const placesDb = client.db('places_cs120');
		const placesColl = placesDb.collection('places');

		for (const doc of data) {
			const result = await placesColl.insertOne( doc );
			console.log( `Place ${doc.place} inserted with _id ${result.insertedId}` );
		}
	} finally {
		await client.close();
	}

}

const data = getAllData();
// doUpload(data);