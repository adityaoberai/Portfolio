const express = require('express')
const path = require('path');

const app = express()
const port = 3000

app.use(express.static('./');

app.get('/', function(req, res) {
    res.setHeader('Cache-Control', 's-max-age=1, stale-while-revalidate');
    res.sendFile(path.join('index.html'));
});

app.get('/index', function(req, res) {
    res.setHeader('Cache-Control', 's-max-age=1, stale-while-revalidate');
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/about', function(req, res) {
    res.setHeader('Cache-Control', 's-max-age=1, stale-while-revalidate');
    res.sendFile(path.join(__dirname, 'about.html'));
});

app.get('/blogs', function(req, res) {
    res.setHeader('Cache-Control', 's-max-age=1, stale-while-revalidate');
    res.sendFile(path.join(__dirname, 'blogs.html'));
});

app.get('/projects', function(req, res) {
    res.setHeader('Cache-Control', 's-max-age=1, stale-while-revalidate');
    res.sendFile(path.join(__dirname, 'projects.html'));
});

app.get('/contact', function(req, res) {
    res.setHeader('Cache-Control', 's-max-age=1, stale-while-revalidate');
    res.sendFile(path.join(__dirname, 'contact.html'));
});

app.get('/linkedin', function(req, res) {
    res.setHeader('Cache-Control', 's-max-age=1, stale-while-revalidate');
    res.sendFile(path.join(__dirname, 'Socials/linkedin.html'));
});

app.get('/twitter', function(req, res) {
    res.setHeader('Cache-Control', 's-max-age=1, stale-while-revalidate');
    res.sendFile(path.join(__dirname, 'Socials/twitter.html'));
});

app.get('/resume', function(req, res) {
    res.setHeader('Cache-Control', 's-max-age=1, stale-while-revalidate');
    res.sendFile(path.join(__dirname, 'Socials/resume.html'));
});

module.exports = app;