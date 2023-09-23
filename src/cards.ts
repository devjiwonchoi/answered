export const basicCard = ({
  username,
  totalCount,
  style,
  rank,
  repoCountsHTML,
}: {
  username: string
  totalCount: number
  style: Function
  rank: string
  repoCountsHTML: string
}) => `
<svg xmlns="http://www.w3.org/2000/svg" width="450" height="195" viewBox="0 0 450 195" fill="none" role="img" aria-labelledby="descId">
  <title id="titleId">@${username}'s Answered GitHub Discussions, Rank: ${rank}</title>
  ${style({ totalCount })}
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
