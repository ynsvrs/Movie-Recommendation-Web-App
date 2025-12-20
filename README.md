

#  Movie Recommendation System

A simple **Node.js & Express.js** web application that demonstrates routing, form handling, and clean UI design.
Built as part of **Assignment 1 – Part 2 (Routing & Forms in Express.js)**.

---

##  Project Overview

The **Movie Recommendation System** is a basic web application designed to help users discover movies based on their preferences such as **genre, mood, or release year**.

This project focuses on:

* Express.js routing (GET & POST)
* Handling form data using `req.body`
* Maintaining a clean folder structure
* Creating a consistent and responsive UI

---

## 👥 Team Information

**Group:** SE-2423

**Team Members:**

* Baizakova Erkezhan
* Yerzhan Saniya
* Zhanatay Ismail

---

##  Features

### Implemented

* Home page with project introduction
* About page with team and project details
* Contact / Recommendation form
* POST request handling using Express
* 404 page for unknown routes
* Consistent navigation across all pages

### Bonus (Optional)

* Client-side form validation
* Save submitted form data into a `.json` file

---

## 🧭 Application Routes

| Route      | Method | Description                   |
| ---------- | ------ | ----------------------------- |
| `/`        | GET    | Home page                     |
| `/about`   | GET    | About the project and team    |
| `/contact` | GET    | Recommendation / contact form |
| `/contact` | POST   | Handles form submission       |
| `*`        | GET    | 404 – Page Not Found          |

---

## 📝 Contact Form

The contact form includes:

* **Name**
* **Email**
* **Message**

Form data is sent using the **POST** method and processed on the server via `req.body`.

---

## 🛠️ Technologies Used

* **Node.js**
* **Express.js**
* **HTML5**
* **CSS3**

---

## 📂 Project Structure

```bash
project-folder/
│
├── public/
│   └── style.css
│
├── views/
│   ├── index.html
│   ├── about.html
│   └── contact.html
│
├── server.js
├── package.json
└── README.md
```

---

## ⚙️ Installation & Run Instructions

Follow these steps to run the project locally:

### 1️⃣ Clone the repository

```bash
git clone <your-repository-url>
cd <project-folder>
```

### 2️⃣ Install dependencies

```bash
npm install
```

### 3️⃣ Start the server

```bash
node server.js
```

### 4️⃣ Open in browser

```
http://localhost:3000
```

You should now see the **Movie Recommendation System** homepage 

---

## Learning Objectives

This project helps to understand:

* How Express handles **GET and POST** requests
* How HTML forms send data to the backend
* How `req.body` works
* How to organize a basic Express project
* How frontend and backend interact

---

## Testing

* GET routes can be tested directly in the browser
* POST requests can be tested via the form or using tools like **Postman**
* `console.log(req.body)` is used for debugging form submissions

---

## Future Roadmap

### Core Features

* Genre-based recommendations
* Mood-based suggestions
* Search by release year
* Personalized recommendations

### UI & UX

* Improved visual design
* Better responsiveness
* Cleaner navigation

### Integrations

* Movie APIs (TMDB / OMDb)
* Live posters, ratings, descriptions
* Dynamic recommendation engine

---
