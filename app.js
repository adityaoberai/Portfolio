const express = require('express')
const path = require('path');

const app = express()

app.use(express.static(path.join(__dirname)));
app.use('/Assets', express.static(path.join(__dirname + '/Assets')));

app.get('/', function(req, res) {
  res.setHeader('Cache-Control', 's-maxage=1, stale-while-revalidate');
  res.sendFile(path.join(__dirname + '/index.html'));
});

app.get('/index', function(req, res) {
  res.setHeader('Cache-Control', 's-maxage=1, stale-while-revalidate');
  res.sendFile(path.join(__dirname + '/index.html'));
});

app.get('/about', function(req, res) {
  res.setHeader('Cache-Control', 's-maxage=1, stale-while-revalidate');
  res.sendFile(path.join(__dirname + '/about.html'));
});

app.get('/blogs', function(req, res) {
  res.setHeader('Cache-Control', 's-maxage=1, stale-while-revalidate');
  res.sendFile(path.join(__dirname + '/blogs.html'));
});

app.get('/projects', function(req, res) {
  res.setHeader('Cache-Control', 's-maxage=1, stale-while-revalidate');
  res.sendFile(path.join(__dirname + '/projects.html'));
});

app.get('/contact', function(req, res) {
  res.setHeader('Cache-Control', 's-maxage=1, stale-while-revalidate');
  res.sendFile(path.join(__dirname + '/contact.html'));
});

app.get('/linkedin', function(req, res) {
  res.setHeader('Cache-Control', 's-maxage=1, stale-while-revalidate');
  res.sendFile(path.join(__dirname + '/Socials/linkedin.html'));
});

app.get('/twitter', function(req, res) {
  res.setHeader('Cache-Control', 's-maxage=1, stale-while-revalidate');
  res.sendFile(path.join(__dirname + '/Socials/twitter.html'));
});

app.get('/resume', function(req, res) {
  res.setHeader('Cache-Control', 's-maxage=1, stale-while-revalidate');
  res.sendFile(path.join(__dirname + '/Socials/resume.html'));
});

app.get('/github', function(req, res) {
  res.setHeader('Cache-Control', 's-maxage=1, stale-while-revalidate');
  res.sendFile(path.join(__dirname + '/Socials/github.html'));
});

app.get('/instagram', function(req, res) {
  res.setHeader('Cache-Control', 's-maxage=1, stale-while-revalidate');
  res.sendFile(path.join(__dirname + '/Socials/instagram.html'));
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
});