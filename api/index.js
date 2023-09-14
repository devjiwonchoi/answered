Object.defineProperty(exports, '__esModule', { value: true });

var express = require('express');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var axios = require('axios');
var passport = require('passport');
var passportGithub2 = require('passport-github2');

function _interopDefault (e) { return e && e.__esModule ? e : { default: e }; }

var express__default = /*#__PURE__*/_interopDefault(express);
var session__default = /*#__PURE__*/_interopDefault(session);
var cookieParser__default = /*#__PURE__*/_interopDefault(cookieParser);
var axios__default = /*#__PURE__*/_interopDefault(axios);
var passport__default = /*#__PURE__*/_interopDefault(passport);

const query = `
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
`;
function generateHTMLString({ username, totalCount, countPerRepo }) {
    const repoCounts = Object.entries(countPerRepo).sort((a, b)=>b[1] - a[1]);
    // Generate the HTML for the repo counts
    const repoCountsHTML = repoCounts.map(([repo, count])=>{
        return `<p>${repo}: ${count}</p>`;
    }).join('');
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
</style>`;
    return svg;
}
function handleData(data) {
    const { data: { viewer } } = data;
    const { login, repositoryDiscussionComments: { totalCount, nodes } } = viewer;
    let urls = [];
    const regexForRepo = /github\.com\/([^/]+)\/([^/]+)/;
    const countPerRepo = nodes.reduce((accumulator, node)=>{
        urls = [
            ...urls,
            node.url
        ];
        const match = node.url.match(regexForRepo);
        if (match) {
            const [, owner, repo] = match;
            const fullRepo = `${owner}/${repo}`;
            accumulator[fullRepo] = (accumulator[fullRepo] || 0) + 1;
        }
        return accumulator;
    }, {});
    return {
        username: login,
        totalCount,
        countPerRepo,
        urls
    };
}

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
    try {
        var info = gen[key](arg);
        var value = info.value;
    } catch (error) {
        reject(error);
        return;
    }
    if (info.done) {
        resolve(value);
    } else {
        Promise.resolve(value).then(_next, _throw);
    }
}
function _async_to_generator(fn) {
    return function() {
        var self = this, args = arguments;
        return new Promise(function(resolve, reject) {
            var gen = fn.apply(self, args);
            function _next(value) {
                asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
            }
            function _throw(err) {
                asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
            }
            _next(undefined);
        });
    };
}
const app = express__default.default();
app.use(session__default.default({
    secret: process.env.EXPRESS_SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));
app.use(cookieParser__default.default());
app.use(passport__default.default.initialize());
app.use(passport__default.default.session());
passport__default.default.serializeUser(function(user, done) {
    done(null, user);
});
passport__default.default.deserializeUser(function(obj, done) {
    done(null, obj);
});
passport__default.default.use(new passportGithub2.Strategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: '/api/auth/github/callback'
}, (accessToken, _refreshToken, profile, done)=>{
    profile.accessToken = accessToken;
    done(null, profile);
}));
app.get('/api/auth/github', passport__default.default.authenticate('github', {
    scope: [
        'user:email',
        'repo:public_repo'
    ]
}));
app.get('/api/auth/github/callback', passport__default.default.authenticate('github', {
    failureRedirect: '/'
}), function(req, res) {
    const accessToken = req.user.accessToken;
    res.cookie('accessToken', accessToken);
});
app.get('/api', /*#__PURE__*/ _async_to_generator(function*(req, res) {
    const accessToken = req.cookies.accessToken;
    if (!accessToken) {
        res.redirect('/api/auth/github');
        return;
    }
    try {
        const response = yield axios__default.default.post('https://api.github.com/graphql', {
            query
        }, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });
        const data = handleData(response.data);
        const htmlString = generateHTMLString(data);
        res.setHeader('Cache-Control', 's-max-age=1, stale-while-revalidate');
        res.send(htmlString);
    } catch (error) {
        res.json({
            error
        });
    }
}));
app.listen({
    port: 8000
});

exports.default = app;
