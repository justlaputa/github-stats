module.exports = {
    repos: process.env.REPOS.split(',').map(r => r.trim()),
    token: process.env.GITHUB_TOKEN,
    slackWebhook: process.env.SLACK_WEBHOOK,
}