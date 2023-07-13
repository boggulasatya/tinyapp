const express = require("express");
const app = express();
const PORT = 3000; // default port 3000
//Set ejs as the view engine
const bcrypt = require("bcryptjs");
const session = require('express-session');
const cookieSession = require('cookie-session');
const morgan = require('morgan');
const  { getUserByEmail, generateRandomString, urlsForUser } = require("./helpers");
app.set("view engine", "ejs");
app.use(cookieSession({ name: 'user_id',   keys: ['my-super-secret-key'],  maxAge: 24 * 60 * 60 * 1000}));
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));

//Users Global object
const users = [
  {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
];

const urlDatabase = {
  b2xVn2: {
    longURL:  "http://www.lighthouselabs.ca",
    userID: "userRandomID",
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "user2RandomID",
  },
};

app.get("/", (req, res) => {
  const user = users.find((user) => user.id === req.session.userId);
  if (user) {
    res.redirect("/urls"); //Redirect to /urls if the user is logged in
  } else {
    res.redirect("/login"); // Redirect to /login if the user is not logged in
  }
});

//Sending HTML
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

//Adding Routes
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//Adding a GET Route to show the form
app.get("/urls/new", (req, res) => {
  const user = users.find(user => user.id === req.session.userId);
  if (user) {
    const templateVars = { user };
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

//Single URL & shortened form-Redirect Short URLs
app.get("/urls/:id", (req, res) => {
  const userId = req.session.userId;
  const urlId = req.params.id;
  const url = urlDatabase[urlId];
  const user = users.find((user) => user.id === req.session.userId);
  if (!userId) {
    res.status(401).send('<h2>Please log in or register to view your URLs.<h2>');
  } else if (!url || url.userID !== userId) {
    res.status(403).send('<h2>This URL does not belong to you.<h2>');
  } else {
    res.render('urls_show', { url, user, longURL: url.longURL, id: urlId});
  }
});


app.get("/urls", (req, res) => {
  const user = users.find((user) => user.id === req.session.userId);
  if (user) {
    const userURLs = urlsForUser(user.id, urlDatabase);
    const templateVars = { urls: userURLs, user};
    res.render("urls_index", templateVars);
  } else {
    const bodyHTML = `
    <h2>Please Login or Register to continue.</h1>
    <a href="/login">Login</a> | <a href="/register">Register</a>`;
   
    res.send(bodyHTML);
  }
});

app.get("/u/:id", (req, res) => {
  const shortURL = req.params.id;
  const url = urlDatabase[shortURL];

  if (url) {
    res.redirect(url.longURL);
  } else {
    return res.status(404).send("URL not found");
  }
});

//Register GET route handler
app.get("/register", (req, res) => {
  const user = users.find(user => user.id === req.session.userId);
  if (user) {
    res.redirect('/urls');
  } else {
    const templateVars = { user };
    res.render('register', templateVars);
  }
});

//Login
app.get('/login', (req, res) => {
  const user = users.find(user => user.id === req.session.userId);

  if (user) {
    res.redirect('/urls');
  } else {
    const templateVars = { user };
    res.render('login', templateVars);
  }
});

//POST route to delete a URL resource
app.post("/urls/:id/delete", (req, res) => {
  const userId = req.session.userId;
  const shortURL = req.params.id;
  const url = urlDatabase[shortURL];
  if (!url) {
    res.status(404).send('<h2>This URL does not exist.<h2>');
  } else if (!userId) {
    res.status(401).send('<h2>Please log in or register to view your URLs.<h2>');
  } else if (url.userID !== userId) {
    res.status(403).send('<h2>This URL does not belong to you.<h2>');
  } else {
    delete urlDatabase[shortURL];
    res.redirect("/urls");
  }
});


app.post("/urls/:id", (req, res) => {
  const userId = req.session.userId;
  const urlId = req.params.id;
  const url = urlDatabase[urlId];
  if (!url) {
    return res.status(404).send("URL not found");
  }
  if (url.userID !== userId) {
    return res.status(403).send("You don't have permission to edit this URL");
  } else {
    urlDatabase[urlId].longURL = req.body.longURL;
    res.redirect('/urls');
  }
});

app.post('/urls/:id/update', (req, res) => {
  const urlId = req.params.id;
  const url = urlDatabase[urlId];
  const userId = req.session.userId;

  if (!url) {
    res.status(404).send('<h2>This URL does not exist.</h2>');
    return;
  }
  const user = users.find((user) => user.id === userId);
  if (url.userID !== user.id) {
    res.status(403).send('<h2>This URL does not belong to you.</h2>');
    return;
  }

  if (req.body.longURL) {
    urlDatabase[urlId].longURL = req.body.longURL;
  }

  res.redirect('/urls');
});



//Adding a POST Route to Receive the Form Submission
app.post("/urls", (req, res) => {
  const userId = req.session.userId;
  const longURL = req.body.longURL;

  if (!userId) {
    res.status(401).send("You need to be logged in to view URLs.");
    return;
  }
  console.log("before longurl check");
  if (longURL === '') {
    res.status(400).send("Long URL is required.");
  } else {
    const shortURL = generateRandomString();
    urlDatabase[shortURL] = {
      longURL: longURL,
      userID: userId
    };

    res.redirect(`/urls`);
  }
});


app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const foundUser = getUserByEmail(email, users);
  // Find the user with the provided email
  if (!foundUser) {
    return res.status(403).send("Email and password are required");
  }

  // Check if the user exists and the password is correct
  if (bcrypt.compareSync(password, foundUser.password)) {
    //store the user's ID in the session
    req.session.userId = foundUser.id;
    res.redirect("/urls");
  } else {
    return res.status(403).send("Incorrect password");
  }
});

//Logout
app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/login');
});

app.post("/register", (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).send("Email and password are required");
  }
  const foundUser = getUserByEmail(email, users);
  if (foundUser) {
    return res.status(400).send("Email already registered");
  }
  //create a new user object
  const hashedPassword = bcrypt.hashSync(password, 10);
  const newUser = {
    id: generateRandomString(),
    email: email,
    password: hashedPassword,
  };
  users.push(newUser);
  //Set user_id cookie and redirect to URLs page
  req.session.userId = newUser.id;
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});