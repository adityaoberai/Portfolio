const express = require('express')
const path = require('path');

const app = express()
const port = 3000

app.use(express.static('./'));

app.get('/', function(req, res) {
    res.setHeader('Cache-Control', 's-max-age=1, stale-while-revalidate');
    res.sendFile(path.join('index.html'));
});

app.get('/index', function(req, res) {
    res.setHeader('Cache-Control', 's-max-age=1, stale-while-revalidate');
    res.sendFile(path.join('index.html'));
});

app.get('/about', function(req, res) {
    res.setHeader('Cache-Control', 's-max-age=1, stale-while-revalidate');
    res.sendFile(path.join('about.html'));
});

app.get('/blogs', function(req, res) {
    res.setHeader('Cache-Control', 's-max-age=1, stale-while-revalidate');
    res.sendFile(path.join('blogs.html'));
});

app.get('/projects', function(req, res) {
    res.setHeader('Cache-Control', 's-max-age=1, stale-while-revalidate');
    res.sendFile(path.join('projects.html'));
});

app.get('/contact', function(req, res) {
    res.setHeader('Cache-Control', 's-max-age=1, stale-while-revalidate');
    res.sendFile(path.join('contact.html'));
});

app.get('/linkedin', function(req, res) {
    res.setHeader('Cache-Control', 's-max-age=1, stale-while-revalidate');
    res.sendFile(path.join('Socials/linkedin.html'));
});

app.get('/twitter', function(req, res) {
    res.setHeader('Cache-Control', 's-max-age=1, stale-while-revalidate');
    res.sendFile(path.join('Socials/twitter.html'));
});

app.get('/resume', function(req, res) {
    res.setHeader('Cache-Control', 's-max-age=1, stale-while-revalidate');
    res.sendFile(path.join('Socials/resume.html'));
});

module.exports = app;