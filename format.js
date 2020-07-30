const stringTable = require('string-table');

function formatRepoStats(statsMap) {
    const rows = [];
    for (let [repoName, value] of statsMap) {
        rows.push({
            repo: repoName,
            'has reviewers': value.hasReviewers,
            'no reviewers': value.noReviewers,
            'total': value.count,
        })
    }

    rows.sort((a, b) => b.total - a.total);

    return stringTable.create(rows);
}

function formatReviewerStats(statsMap) {
    const rows = [];

    for (let [reviewer, value] of statsMap) {
        rows.push(Object.assign({name: reviewer}, value));
    }

    rows.sort((a, b) => b.total - a.total);

    return stringTable.create(rows);
}

module.exports = {
    formatRepoStats,
    formatReviewerStats,
}