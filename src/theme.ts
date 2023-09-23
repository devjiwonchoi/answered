export const basicStyle = ({ totalCount }: { totalCount: number }) => `
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
`
