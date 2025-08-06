const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Check if a user with the given username already exists
const doesExist = (username) => {
    // Filter the users array for any user with the same username
    let userswithsamename = users.filter((user) => {
        return user.username === username;
    });
    // Return true if any user with the same username is found, otherwise false
    if (userswithsamename.length > 0) {
        return true;
    } else {
        return false;
    }
}

public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  // Check if both username and password are provided
  if (username && password) {
    // Check if the user does not already exist
    if (!doesExist(username)) {
      // Add the new user to the users array
      users.push({ "username": username, "password": password });
      return res.status(200).json({ message: "User successfully registered. Now you can login" });
    } else {
      return res.status(404).json({ message: "User already exists!" });
    }
  }
  // Return error if username or password is missing
  return res.status(404).json({ message: "Unable to register user." });
});

// Get the book list available in the shop
public_users.get('/', function (req, res) {
  res.send(JSON.stringify(books, null, 4));
});

// Get book list with Promise callbacks
public_users.get('/promise', function (req, res) {
  new Promise((resolve, reject) => {
    resolve(books);
  })
  .then((bookData) => {
    res.status(200).json(bookData);
  })
  .catch((err) => {
    res.status(500).json({message: "Error fetching books"});
  });
});


// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  res.send(books[isbn]);
});

// Get book by ISBN with Promise callbacks
public_users.get('/promise/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  
  new Promise((resolve, reject) => {
    if (books[isbn]) {
      resolve(books[isbn]);
    } else {
      reject(new Error("Book not found"));
    }
  })
  .then((book) => {
    res.status(200).json(book);
  })
  .catch((err) => {
    res.status(404).json({message: err.message});
  });
});


// Get book details based on author
public_users.get('/author/:author', function (req, res) {
  const isbnList = Object.keys(books);
  const author = req.params.author;
  const booksByAuthor = [];

  // Step 2: Iterate through all books
  isbnList.forEach((isbn) => {
    const book = books[isbn];

    // Check if the book's author matches the requested author
    if (book.author === author) {
      // Add the book details (including ISBN) to the result array
      booksByAuthor.push({
        isbn: isbn,
        author: author,
        title: book.title,
        reviews: book.reviews
      });
    }
  });

  // Step 3: Send the response
  if (booksByAuthor.length > 0) {
    res.status(200).json(booksByAuthor);
  } else {
    res.status(404).json({ message: `No books found by author '${author}'` });
  }
});

// get by author with promise
public_users.get('/promise/author/:author', function (req, res) {
  const author = req.params.author;
  
  // Create a new Promise
  new Promise((resolve, reject) => {
    // Simulate async operation
    setTimeout(() => {
      try {
        const isbnList = Object.keys(books);
        const booksByAuthor = [];
        
        isbnList.forEach((isbn) => {
          if (books[isbn].author === author) {
            booksByAuthor.push({
              isbn: isbn,
              title: books[isbn].title,
              reviews: books[isbn].reviews
            });
          }
        });
        
        if (booksByAuthor.length > 0) {
          resolve(booksByAuthor);
        } else {
          reject(new Error(`No books found by author '${author}'`));
        }
      } catch (err) {
        reject(err);
      }
    }, 100); // Small delay to simulate async operation
  })
  .then((books) => {
    res.status(200).json({
      success: true,
      count: books.length,
      data: books
    });
  })
  .catch((err) => {
    res.status(404).json({
      success: false,
      message: err.message,
      suggestion: "Check the author name or try a different search term"
    });
  });
});


// Get all books based on title
public_users.get('/title/:title', function (req, res) {
  const isbnList = Object.keys(books);
  const title = req.params.title;
  const booksByTitle = [];

  // Step 2: Iterate through all books
  isbnList.forEach((isbn) => {
    const book = books[isbn];

    // Check if the book's author matches the requested author
    if (book.title === title) {
      // Add the book details (including ISBN) to the result array
      booksByTitle.push({
        isbn: isbn,
        author: book.author,
        title: book.title,
        reviews: book.reviews
      });
    }
  });

  // Step 3: Send the response
  if (booksByTitle.length > 0) {
    res.status(200).json(booksByTitle);
  } else {
    res.status(404).json({ message: `No books found by title '${title}'` });
  }
});

//get by title with promise
public_users.get('/promise/title/:title', function (req, res) {
  const title = req.params.title;
  
  // Create a new Promise
  new Promise((resolve, reject) => {
    // Simulate async operation
    setTimeout(() => {
      try {
        const isbnList = Object.keys(books);
        const booksByTitle = [];
        
        // Search through all books
        isbnList.forEach((isbn) => {
          if (books[isbn].title === title) {
            booksByTitle.push({
              isbn: isbn,
              author: books[isbn].author,
              reviews: books[isbn].reviews
            });
          }
        });
        
        if (booksByTitle.length > 0) {
          resolve({
            count: booksByTitle.length,
            books: booksByTitle
          });
        } else {
          reject(new Error(`No books found with title '${title}'`));
        }
      } catch (err) {
        reject(new Error('Error searching books'));
      }
    }, 100); // Simulate async delay
  })
  .then((result) => {
    res.status(200).json({
      success: true,
      message: `${result.count} book(s) found`,
      data: result.books
    });
  })
  .catch((err) => {
    res.status(404).json({
      success: false,
      message: err.message,
      suggestion: "Check the title spelling or try a different search term"
    });
  });
});




//  Get book review
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  res.send(books[isbn].reviews);
});

module.exports.general = public_users;
