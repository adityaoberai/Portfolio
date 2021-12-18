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

app.get('/pic', function(req, res) {
  res.setHeader('Cache-Control', 's-maxage=1, stale-while-revalidate');
  res.sendFile(path.join(__dirname + '/Assets/img/Personal/Aditya.jpg'));
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

app.get('/polywork', function(req, res) {
  res.setHeader('Cache-Control', 's-maxage=1, stale-while-revalidate');
  res.sendFile(path.join(__dirname + '/Socials/polywork.html'));
});

app.get('/peerlist', function(req, res) {
  res.setHeader('Cache-Control', 's-maxage=1, stale-while-revalidate');
  res.sendFile(path.join(__dirname + '/Socials/peerlist.html'));
});

app.get('/youtube', function(req, res) {
  res.setHeader('Cache-Control', 's-maxage=1, stale-while-revalidate');
  res.sendFile(path.join(__dirname + '/Socials/youtube.html'));
});

app.get('/facebook', function(req, res) {
  res.setHeader('Cache-Control', 's-maxage=1, stale-while-revalidate');
  res.sendFile(path.join(__dirname + '/Socials/facebook.html'));
});

app.get('/devto', function(req, res) {
  res.setHeader('Cache-Control', 's-maxage=1, stale-while-revalidate');
  res.sendFile(path.join(__dirname + '/Socials/devto.html'));
});

app.get('/medium', function(req, res) {
  res.setHeader('Cache-Control', 's-maxage=1, stale-while-revalidate');
  res.sendFile(path.join(__dirname + '/Socials/medium.html'));
});

app.get('/mail', function(req, res) {
  res.setHeader('Cache-Control', 's-maxage=1, stale-while-revalidate');
  res.sendFile(path.join(__dirname + '/Socials/mail.html'));
});

app.get('/email', function(req, res) {
  res.setHeader('Cache-Control', 's-maxage=1, stale-while-revalidate');
  res.sendFile(path.join(__dirname + '/Socials/mail.html'));
});

app.get('/whatsapp', function(req, res) {
  res.setHeader('Cache-Control', 's-maxage=1, stale-while-revalidate');
  res.sendFile(path.join(__dirname + '/Socials/whatsapp.html'));
});

app.get('/call', function(req, res) {
  res.setHeader('Cache-Control', 's-maxage=1, stale-while-revalidate');
  res.sendFile(path.join(__dirname + '/Socials/call.html'));
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
});