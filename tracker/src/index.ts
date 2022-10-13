import axios from 'axios';
import cron from 'cron';
import { Db, MongoClient } from 'mongodb';
import { DB } from './config';

async function main() {
    console.log('Connecting to db...');
    let mongo: Db;
    await MongoClient.connect(DB.CONNECTION).then((bot) => {
		mongo = bot.db(DB.COLLECTION);
	});
    console.log('Connected');

    console.log('Preparing to track...');
    const job = new cron.CronJob('*/15 * * * *', () => fetchDelays(mongo));
    job.start();

    console.log('Now tracking');
    fetchDelays(mongo);
}

async function fetchDelays(mongo: Db) {
    await axios.get("http://www3.septa.org/hackathon/TrainView/")
    .then(async (res) => {
        const data = res.data;
        const d = new Date();

        for (const train of data) {
            const targetService = await mongo.collection(DB.DATA).findOne({ service: train.trainno });
            const recentDelays = targetService ? targetService.delays : [];
            recentDelays.push({
                amount: train.late,
                datestring: d,
                date: d.toLocaleDateString("en-US")
            });
            if (recentDelays.length > 3000) {
                recentDelays.shift();
            }

            if (!targetService) {
                await mongo.collection(DB.DATA).insertOne({
                    service: train.trainno,
                    delays: recentDelays
                });
            } else {
                await mongo.collection(DB.DATA).findOneAndUpdate(
                    { service: train.trainno },
                    { $set: {
                        delays: recentDelays
                    }}
                );
            }
        }
    });
}

main();