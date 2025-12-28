const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

app.use(express.static(path.join(__dirname, 'public')));

// ROUTES Saniya start
//  Home page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// About page
app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'about.html'));
});

// Contact page

app.get('/contact', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'contact.html'));
});

// contact post
app.post('/contact', (req, res) => {
    console.log('Form submission received:');
    console.log(req.body); 

    const filePath = path.join(__dirname, 'submissions.json');
    let submissions = [];

    if (fs.existsSync(filePath)) {
        const fileData = fs.readFileSync(filePath, 'utf8');
        if (fileData) submissions = JSON.parse(fileData);
    }

    submissions.push(req.body);
    fs.writeFileSync(filePath, JSON.stringify(submissions, null, 2));

    res.send(`<h2>Thanks, ${req.body.name}! Your message has been received.</h2>
              <p><a href="/contact">Go back to contact page</a></p>`);
});

// Search page
app.get('/search', (req, res) => {
    const query = req.query.q;
    if (!query) {
        return res.status(400).send('<h2>400 - Missing search query</h2>');
    }
    res.send(`<h2>Search results for: ${query}</h2>`);
});

// Item page
app.get('/item/:id', (req, res) => {
    const id = req.params.id;
    if (!id) {
        return res.status(400).send('<h2>400 - Missing item ID</h2>');
    }
    res.send(`<h2>Item page for ID: ${id}</h2>`);
});

// API info
app.get('/api/info', (req, res) => {
    const info = {
        projectName: "Express Project",
        members: "Saniya777, Erkezhan31, Ismail1769",
        description: "Assignment 2 Part 1 - Server-side Routes"
    };
    res.json(info);
});
// ROUTES Saniya end


app.use((req, res) => {
    res.status(404).send('<h2>404 - Page Not Found</h2><p><a href="/">Return Home</a></p>');
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
