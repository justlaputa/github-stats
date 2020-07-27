const {Octokit} = require('@octokit/core')

const REPOS = reposString.split(',')
    .map(r => r.trim())
    .filter(r => r.length > 0)

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN })

async function getStats() {
    const pullsArray = await Promise.all(REPOS.map(repo => getPullsForRepo(repo)))

    const pulls = pullsArray.flat()

    const repoStats = analyzeRepos(pulls)
    const reviewerStats = analyzeReviewers(pulls)

    return [repoStats, reviewerStats]
}

async function getPullsForRepo(org, repo) {
    const response = await octokit.request('GET /repos/{org}/{repo}/pulls', {
        org: org,
        repo: repo,
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

function printRepoStats(repoStat) {
    const header = [' ', 'has reviewers', 'no reviewers', 'total']
    console.log(header.join('\t'))

    for (let repo of REPOS) {
        if (!repoStat.has(repo)) continue

        const stat = repoStat.get(repo)
        console.log([repo, stat.hasReviewers, stat.noReviewers, stat.count].join('\t'))
    }
}

function analyzeReviewers(pulls) {
    const reviewerMap = new Map()
    for (let pull of pulls) {
        for (let reviewer of pull.reviewers) {
            if (!reviewerMap.has(reviewer)) {
                reviewerMap.set(reviewer, {total: 0})
            }

            reviewerStat = reviewerMap.get(reviewer)
            if (!reviewerStat[pull.repo]) {
                reviewerStat[pull.repo] = 0
            }
            reviewerStat[pull.repo]++
            reviewerStat.total++
        }
    }

    return reviewerMap
}

function printReviewerStats(reviewerStats) {
    const header = [' ', ...REPOS, 'total']
    console.log(header.join('\t'))

    for (let [reviewer, stat] of reviewerStats) {
        const line = [reviewer]
        for (let repo of REPOS) {
            if (stat[repo]) {
                line.push(stat[repo])
            } else {
                line.push(0)
            }
        }
        line.push(stat.total)

        console.log(line.join('\t'))
    }
}

function printPullsByUser(pulls, user) {
    console.log('pull requests created by %s', user);
    printPullsByFilter(pulls, pull => pull.user === user);
}

function printPullsByReviewer(pulls, user) {
    console.log('pull requests review requested to %s', user);
    printPullsByFilter(pulls, pull => pull.reviewers.includes(user));
}

function printPullsByFilter(pulls, func) {
    const userPulls = pulls.filter(func);

    userPulls.forEach(pull => {
        console.log(`%s\t%s\t[%s]`, pull.repo, pull.url, pull.title);
    });
}