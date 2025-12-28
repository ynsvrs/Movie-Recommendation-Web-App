#  Movie Recommendation System

A simple **Node.js & Express.js** web application that demonstrates **server-side request handling**, routing, middleware usage, and form processing.

Built as part of **Assignment 2 – Part 1: Server-side Request Handling in Express.js**.

---

##  Project Overview

The **Movie Recommendation System** is a basic Express.js application that simulates a future movie recommendation platform.

The goal of this project is **not to build a full recommendation engine**, but to demonstrate how a server:

* Handles **GET and POST** requests
* Works with **query parameters** and **route parameters**
* Processes form data using `req.body`
* Returns **HTML and JSON responses**
* Applies **server-side validation**
* Maintains **consistent navigation** across pages

---

## 👥 Team Information

**Group:** SE-2423

**Team Members & Contributions:**

* **Baizakova Erkezhan** 
* **Yerzhan Saniya** 
* **Zhanatay Ismail** 

---

##  Features

### Core Features (Required)

* Home page with navigation
* About page with team information
* Contact / Recommendation form
* POST request handling using Express
* Saving submitted form data into a `.json` file
* Query parameters (`/search?q=value`)
* Route parameters (`/item/:id`)
* JSON API endpoint (`/api/info`)
* 404 page for unknown routes
* Consistent navigation across all pages
* Basic server-side validation with HTTP **400** status

---

##  Application Routes

| Route             | Method | Description                            |
| ----------------- | ------ | -------------------------------------- |
| `/`               | GET    | Home page                              |
| `/about`          | GET    | About page (team & project info)       |
| `/contact`        | GET    | Recommendation / contact form          |
| `/contact`        | POST   | Handles form submission and saves data |
| `/search?q=value` | GET    | Uses query parameter (`q`)             |
| `/item/:id`       | GET    | Uses route parameter (`id`)            |
| `/api/info`       | GET    | Returns project info in JSON format    |
| `*`               | GET    | 404 – Page Not Found                   |

---

## Contact Form

The contact form includes:

* **Name**
* **Email**
* **Message / Preferences**

Form data is submitted using the **POST** method and processed on the server via `req.body`.
All submissions are saved into a local **JSON file** using the `fs` module.

---

##  Technologies Used

* **Node.js**
* **Express.js**
* **HTML5**
* **CSS3**
* **File System (fs module)**

---

## Project Structure

```bash
project-folder/
│
├── public/
│   ├── style.css
│   └── images/
│
├── views/
│   ├── index.html
│   ├── about.html
│   └── contact.html
│
├── submissions.json
├── server.js
├── package.json
└── README.md
```

---

##  Installation & Run Instructions

### Clone the repository

```bash
git clone <your-repository-url>
cd project-folder
```

###  Install dependencies

```bash
npm install
```

### Start the server

```bash
node server.js
```

### Open in browser

```
http://localhost:3000
```

---

##  Learning Objectives

This project helps to understand:

* How Express handles **server-side routing**
* Difference between **GET and POST** requests
* How query and route parameters work
* How to implement **basic validation**
* How to return **HTML and JSON responses**
* How frontend and backend interact in Express

---

## Testing

* GET routes can be tested directly in the browser
* POST requests can be tested via the contact form
* Query parameters example:

  ```
  /search?q=action
  ```
* Route parameters example:

  ```
  /item/123
  ```
* `console.log(req.body)` is used for debugging form submissions

---

## Future Improvements

* Real movie recommendation logic
* Integration with movie APIs (TMDB / OMDb)
* Dynamic rendering using templates
* User accounts and personalization
* Improved UI and responsiveness

---