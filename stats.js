const {Octokit} = require('@octokit/core')
const config = require('./config')

const octokit = new Octokit({ auth: config.token })

async function getStats() {
    const repos = config.repos.map(r => ({
        owner: r.split('/')[0],
        name: r.split('/')[1],
    }));

    const pullsArray = await Promise.all(repos.map(r => getPullsForRepo(r.owner, r.name)))

    const pulls = pullsArray.flat()

    const repoNames = repos.map(r => r.name);

    const repoStats = analyzeRepos(pulls)
    const reviewerStats = analyzeReviewers(repoNames, pulls)

    return [repoStats, reviewerStats]
}

async function getPullsForRepo(owner, repo) {
    const response = await octokit.request('GET /repos/{owner}/{repo}/pulls', {
        owner,
        repo,
    })

    return response.data.map(pull => ({
        title: pull.title,
        repo: repo,
        user: pull.user.login,
        url: pull.html_url,
        reviewers: pull.requested_reviewers.map(r => r.login),
    }));
}

function analyzeRepos(pulls) {
    const repoMap = new Map()
    pulls.forEach(pull => {
        if (!repoMap.has(pull.repo)) {
            repoMap.set(pull.repo, {
                count: 0,
                hasReviewers: 0,
                noReviewers: 0,
                reviewers: 0,
            })
        }

        const repoStat = repoMap.get(pull.repo)

        repoStat.count++
        if (pull.reviewers.length > 0) {
            repoStat.hasReviewers++
            repoStat.reviewers += pull.reviewers.length
        } else {
            repoStat.noReviewers++
        }
    })

    return repoMap
}

function analyzeReviewers(repos, pulls) {
    const reviewerMap = new Map()
    for (let pull of pulls) {
        for (let reviewer of pull.reviewers) {
            if (!reviewerMap.has(reviewer)) {
                reviewerMap.set(reviewer, {total: 0})
            }

            let reviewerStat = reviewerMap.get(reviewer)
            if (!reviewerStat[pull.repo]) {
                reviewerStat[pull.repo] = 0
            }
            reviewerStat[pull.repo]++
            reviewerStat.total++
        }
    }

    for (let [reviewer, stat] of reviewerMap) {
        repos.forEach(repo => {
            if (!stat[repo]) {
                stat[repo] = 0;
            }
        })
    }

    return reviewerMap
}

module.exports = {
    getStats,
}

if (require.main === module) {
    getStats().then(
        console.log,
        console.error
    );
}