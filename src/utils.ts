export const query = `
query {
  viewer {
    login
    repositoryDiscussionComments(onlyAnswers: true, first:100) {
      totalCount
      nodes {
        url
      }
    }
  }
}
`

export function generateHTMLString({
  username,
  totalCount,
  countPerRepo,
}: {
  username: string
  totalCount: number
  countPerRepo: { [key: string]: number }
}) {
  const repoCounts = Object.entries(countPerRepo).sort((a, b) => b[1] - a[1])

  // Generate the HTML for the repo counts
  const repoCountsHTML = repoCounts
    .map(([repo, count]) => {
      return `<p>${repo}: ${count}</p>`
    })
    .join('')

  const svg = `<div class="github-card">
  <h2>Answered GitHub Discussions</h2>
  <p>Username: @${username}</p>
  <p>Total Count: ${totalCount}</p>
  <div class="repo-counts">
      ${repoCountsHTML}
    </div>
</div>
<style>
.github-card {
  background-color: #fff;
  border: 1px solid #ccc;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 16px;
  width: 300px;
  margin: 20px;
}

.github-card h2 {
  font-size: 18px;
  margin-bottom: 10px;
}

.github-card p {
  font-size: 14px;
  margin: 8px 0;
}
.repo-counts {
    margin-top: 10px;
  }
</style>`

  return svg
}

export function handleData(data: any) {
  const {
    data: { viewer },
  } = data
  const {
    login,
    repositoryDiscussionComments: { totalCount, nodes },
  } = viewer

  let urls: string[] = []

  const regexForRepo = /github\.com\/([^/]+)\/([^/]+)/
  const countPerRepo = nodes.reduce((accumulator: any, node: any) => {
    urls = [...urls, node.url]
    const match = node.url.match(regexForRepo)
    if (match) {
      const [, owner, repo] = match
      const fullRepo = `${owner}/${repo}`
      accumulator[fullRepo] = (accumulator[fullRepo] || 0) + 1
    }
    return accumulator
  }, {})

  return {
    username: login,
    totalCount,
    countPerRepo,
    urls,
  }
}