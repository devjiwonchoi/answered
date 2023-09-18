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

export function calculateRank(totalCount: number) {
  if (totalCount === 100) {
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

  const test = `
<svg xmlns="http://www.w3.org/2000/svg" width="450" height="195" viewBox="0 0 450 195" fill="none" role="img" aria-labelledby="descId">
  <title id="titleId">@${username}'s Answered GitHub Discussions, Rank: ${rank}</title>
  <style>
    .header {
      font: 600 18px 'Segoe UI', Ubuntu, Sans-Serif;
      fill: #fafafa;
      animation: fadeInAnimation 0.8s ease-in-out forwards;
    }
    @supports(-moz-appearance: auto) {
      /* Selector detects Firefox */
      .header { font-size: 15.5px; }
    }
    .stat {
      font: 600 14px 'Segoe UI', Ubuntu, "Helvetica Neue", Sans-Serif; fill: #d4d4d4;
    }
    @supports(-moz-appearance: auto) {
      /* Selector detects Firefox */
      .stat { font-size:12px; }
    }
    .emphasis {
      font: 600 14px 'Segoe UI', Ubuntu, "Helvetica Neue", Sans-Serif; fill: #fafafa;
    }
    @supports(-moz-appearance: auto) {
      /* Selector detects Firefox */
      .emphasis { font-size:12px; }
    }
    .stagger {
      opacity: 0;
      animation: fadeInAnimation 0.3s ease-in-out forwards;
    }
    .rank-text {
      font: 800 24px 'Segoe UI', Ubuntu, Sans-Serif; fill: #fafafa;
      animation: scaleInAnimation 0.3s ease-in-out forwards;
    }
    .rank-percentile-header {
      font-size: 14px;
    }
    .rank-percentile-text {
      font-size: 16px;
    }
    .not_bold { font-weight: 400 }
    .bold { font-weight: 700 }
    .icon {
      fill: #4c71f2;
      display: none;
    }
    .rank-circle-rim {
      stroke: #d4d4d4;
      fill: none;
      stroke-width: 6;
      opacity: 0.2;
    }
    .rank-circle {
      stroke: #d4d4d4;
      stroke-dasharray: 250;
      fill: none;
      stroke-width: 6;
      stroke-linecap: round;
      opacity: 0.8;
      transform-origin: -10px 8px;
      transform: rotate(-90deg);
      animation: rankAnimation 1s forwards ease-in-out;
    }
    @keyframes rankAnimation {
      from {
        stroke-dashoffset: 0;
      }
      to {
        stroke-dashoffset: ${250 - (250 * totalCount) / 100};
      }
    }
    /* Animations */
    @keyframes scaleInAnimation {
      from {
        transform: translate(-5px, 5px) scale(0);
      }
      to {
        transform: translate(-5px, 5px) scale(1);
      }
    }
    @keyframes fadeInAnimation {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }
  </style>
  <rect data-testid="card-bg" x="0.5" y="0.5" rx="4.5" height="99%" stroke="#e4e2e2" width="449" fill="#171717" stroke-opacity="1"/>
  <g data-testid="card-title" transform="translate(25, 35)">
    <g transform="translate(0, 0)">
      <text x="0" y="0" class="header" data-testid="header">Answered GitHub Discussions</text>
    </g>
  </g>
  <g data-testid="main-card-body" transform="translate(0, 55)">
    <g data-testid="rank-circle" transform="translate(365, 47.5)">
      <circle class="rank-circle-rim" cx="-10" cy="8" r="40"/>
      <circle class="rank-circle" cx="-10" cy="8" r="40"/>
      <g class="rank-text">
        <text x="-5" y="3" alignment-baseline="central" dominant-baseline="central" text-anchor="middle" data-testid="level-rank-icon">
          ${rank}
        </text>
      </g>
    </g>
    <svg x="0" y="0">
      <g transform="translate(0, 0)">
        <g class="stagger" style="animation-delay: 450ms" transform="translate(25, 0)">
          <text class="stat bold" y="12.5">Username:</text>
          <text class="emphasis bold" x="170" y="12.5" data-testid="stars">@${username}</text>
        </g>
      </g>
      <g transform="translate(0, 25)">
        <g class="stagger" style="animation-delay: 450ms" transform="translate(25, 0)">
          <text class="stat bold" y="12.5">Total Count:</text>
          <text class="stat bold" x="170" y="12.5" data-testid="stars">${totalCount}</text>
        </g>
      </g>
      ${repoCountsHTML}
    </svg>
  </g>
</svg>`

  return test
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
