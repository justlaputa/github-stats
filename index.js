const express = require('express');
const {getStats} = require('./stats')
const {formatRepoStats, formatReviewerStats} = require('./format');
const { repos } = require('./config');
const slack = require('./slack');

const app = express();

app.get('/', async (_, res, next) => {
    try {
        const [repoStats, reviewerStats] = await getStats();

        const text = '```\n' +
        'Repository statistics:\n' + 
        formatRepoStats(repoStats) +
        '\n\n' +
        'Reviewers statistics:\n' + 
        formatReviewerStats(reviewerStats) +
        '\n```';
    
        await slack.sendText(text);

        res.end();

        next();
    } catch(e) {
        console.error(e);
        next(e);
        return;
    }

});

const port = process.env.PORT || 8080;

const server = app.listen(port, () => {
  console.log('listening on port', port);
});

server.setTimeout(60000);