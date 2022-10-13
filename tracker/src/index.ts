import axios from 'axios';
import cron from 'cron';

async function main() {
    const job = new cron.CronJob('*/15 * * * *', fetchDelays);
    job.start();

    console.log('Now tracking');
}

async function fetchDelays() {
    const delays: Delay[] = [];
    await axios.get("http://www3.septa.org/hackathon/TrainView/")
    .then((res) => {
        const data = res.data;
        const d = new Date();

        for (const train of data) {
            delays.push({
                amount: train.late,
                datestring: d,
                date: d.toLocaleDateString("en-US")
            });
        }
    });
}

main();