const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));

// Home page
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

app.use((req, res) => {
    res.status(404).send('<h2>404 - Page Not Found</h2><p><a href="/">Return Home</a></p>');
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
