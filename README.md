#  Movie Recommendation System

A simple **Node.js & Express.js** web application that demonstrates **database integration**, **RESTful CRUD API**, and **server-side request handling**.

Built as part of **Assignment 2 – Part 2: Database Integration and CRUD API**.

---

##  Project Overview

The **Movie Recommendation System** is an Express.js application that demonstrates how a server:

* Connects to a **SQLite database**
* Automatically creates database tables on startup
* Implements a **REST-style CRUD API**
* Handles **GET, POST, PUT, DELETE** requests
* Returns **JSON responses with correct HTTP status codes**
* Applies **server-side validation and error handling**
* Maintains consistent navigation and pages from Part 1

The project uses a **movies** entity as the main data model.

---

##  Team Information

**Group:** SE-2423

**Team Members & Contributions:**

* **Baizakova Erkezhan** 
* **Yerzhan Saniya** 
* **Zhanatay Ismail** 

---

##  Database

**Database used:** SQLite

The database file is created automatically when the server starts.

### Table: `movies`

| Field  | Type    | Description                  |
| ------ | ------- | ---------------------------- |
| id     | INTEGER | Primary Key (Auto Increment) |
| title  | TEXT    | Movie title (required)       |
| genre  | TEXT    | Movie genre (required)       |
| rating | REAL    | Movie rating                 |

---

##  API Routes (CRUD)

| Method | Route             | Description        |
| ------ | ----------------- | ------------------ |
| GET    | `/api/movies`     | Get all movies     |
| GET    | `/api/movies/:id` | Get movie by ID    |
| POST   | `/api/movies`     | Create a new movie |
| PUT    | `/api/movies/:id` | Update a movie     |
| DELETE | `/api/movies/:id` | Delete a movie     |

### Validation Rules

* Invalid `id` → **400 Bad Request**
* Missing required fields → **400 Bad Request**
* Movie not found → **404 Not Found**
* Successful POST → **201 Created**
* Successful GET / PUT / DELETE → **200 OK**

---

## Application Pages (from Part 1)

| Route             | Method | Description             |
| ----------------- | ------ | ----------------------- |
| `/`               | GET    | Home page               |
| `/about`          | GET    | About page              |
| `/contact`        | GET    | Contact form            |
| `/contact`        | POST   | Handles form submission |
| `/search?q=value` | GET    | Query parameter example |
| `/item/:id`       | GET    | Route parameter example |
| `*`               | GET    | 404 – Page Not Found    |

---

## API Test Links (Home Page)

The Home page includes direct API test links for quick testing:

* `/api/movies`
* `/api/movies/1`

---

##  Technologies Used

* **Node.js**
* **Express.js**
* **SQLite**
* **HTML5**
* **CSS3**
* **File System (fs module)**

---

##  Project Structure

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
├── db.js
├── movieModel.js
├── movies.db
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

### Install dependencies

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

##  Testing the API

API endpoints can be tested using:

* Browser (GET requests)
* Postman / Thunder Client

### Example POST request body:

```json
{
  "title": "Inception",
  "genre": "Sci-Fi",
  "rating": 9
}
```

---

##  Learning Objectives

This project demonstrates:

* Database integration with Express
* RESTful API design
* CRUD operations
* Server-side validation
* Proper HTTP status codes
* Separation of concerns (routes, models, database)
* Transition from static routes (Part 1) to real data (Part 2)

---

##  Future Improvements

* Real recommendation logic
* External movie APIs (TMDB, OMDb)
* Authentication & user accounts
* Template engines (EJS)
* Improved UI and responsiveness