import { basicCard } from './cards'
import { basicStyle } from './theme'
import { GITHUB_ACCESS_TOKEN, GITHUB_GRAPHQL_API } from './constants'

export const query = `
  query userInfo($login: String!, $cursor: String) {
    user(login: $login) {
      name
      login
      repositoryDiscussionComments(onlyAnswers: true, first:100, after: $cursor) {
        totalCount
        nodes {
          url
        }
        pageInfo { 
          hasNextPage
          endCursor
        }
      }
    }
  }
`

export function calculateRank(totalCount: number) {
  if (totalCount >= 100) {
    return 'S+'
  } else if (totalCount >= 90) {
    return 'S'
  } else if (totalCount >= 80) {
    return 'S-'
  } else if (totalCount >= 70) {
    return 'A+'
  } else if (totalCount >= 60) {
    return 'A'
  } else if (totalCount >= 50) {
    return 'A-'
  } else if (totalCount >= 40) {
    return 'B+'
  } else if (totalCount >= 30) {
    return 'B'
  } else if (totalCount >= 20) {
    return 'B-'
  } else if (totalCount >= 10) {
    return 'C+'
  } else if (totalCount >= 5) {
    return 'C'
  } else if (totalCount >= 1) {
    return 'C-'
  } else {
    return 'D'
  }
}

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
      const yPosition = (index + 2) * 25
      return `<g transform="translate(0, ${yPosition})">
        <g class="stagger" style="animation-delay: 600ms" transform="translate(25, 0)">
          <text class="emphasis bold" y="12.5">${repo}</text>
          <text class="stat bold" x="170" y="12.5" data-testid="commits">${count}</text>
        </g>
      </g>`
    })
    .join('')

  const rank = calculateRank(totalCount)

  return basicCard({
  username,
  totalCount,
  style: basicStyle,
  rank,
  repoCountsHTML,
})
}

export async function handleData({ data }: { data: Record<string, any> }) {
  const {
    user: {
      login,
      name,
      repositoryDiscussionComments: {
        totalCount,
        nodes,
        pageInfo: { hasNextPage, endCursor },
      },
    },
  } = data

  let urls: string[] = []
  let nodeArray = [...nodes]
  let cursor = endCursor
  let shouldFetch = hasNextPage

  while (shouldFetch) {
    const variables = { login: login as string, cursor }
    const newData = await fetcher({ query, variables })
    const {
      user: {
        repositoryDiscussionComments: {
          nodes,
          pageInfo: { hasNextPage, endCursor },
        },
      },
    } = newData.data

    nodeArray = [...nodeArray, ...nodes]
    cursor = endCursor
    shouldFetch = hasNextPage
  }

  const regexForRepo = /github\.com\/([^/]+)\/([^/]+)/
  const countPerRepo = nodeArray.reduce((accumulator: any, node: any) => {
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
    name,
    username: login,
    totalCount,
    countPerRepo,
    urls,
  }
}

export async function fetcher({
  query,
  variables,
}: {
  query: string
  variables: Record<string, string>
}) {
  const response = await fetch(GITHUB_GRAPHQL_API, {
    headers: {
      Authorization: `Bearer ${GITHUB_ACCESS_TOKEN}`,
    },
    method: 'POST',
    body: JSON.stringify({ query, variables }),
  })

  return await response.json()
}
