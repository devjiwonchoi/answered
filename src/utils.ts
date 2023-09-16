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

export function generateSVGString({
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
    .map(([repo, count], index) => {
      const yPosition = 120 + index * 20
      return `<text x="10" y="${yPosition}" font-size="14px">${repo}: ${count}</text>`
    })
    .join('')

  const svgString = `
  <svg width="300" height="200" xmlns="http://www.w3.org/2000/svg">
    <rect x="0" y="0" width="100%" height="100%" fill="#fff"/>
    <g>
        <text x="10" y="30" font-size="18px">Answered GitHub Discussions</text>
        <text x="10" y="60" font-size="14px">Username: @${username}</text>
        <text x="10" y="90" font-size="14px">Total Count: ${totalCount}</text>
        ${repoCountsHTML}
    </g>
  </svg>
`

  return svgString
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
