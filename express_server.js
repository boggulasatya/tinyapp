const express = require("express");
const app = express();
const PORT = 3000; // default port 3000
//Set ejs as the view engine
const bcrypt = require("bcryptjs");
const session = require('express-session');
const cookieSession = require('cookie-session');
const morgan = require('morgan');

const { getUserByEmail } = require("./helper");
app.set("view engine", "ejs");
//app.use(session({secret: 'my-super-key-@786', resave: false,  saveUninitialized: true}));
  
app.use(cookieSession({ name: 'user_id',   keys: ['my-super-secret-key'],  maxAge: 24 * 60 * 60 * 1000}));
  

 

app.use(morgan('dev'));

//const cookieParser = require('cookie-parser');
//app.use(cookieParser());
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
  res.send("Hello!");
});


//Adding Routes
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/u/:id", (req, res) => {
  const shortURL = req.params.id;
  const longURL = urlDatabase[shortURL];
 
  if (longURL) {
    res.redirect(longURL);
  } else {
    return res.status(404).send("URL not found");
  }
});

app.get("/urls", (req, res) => {
  const user = users.find((user) => user.id === req.session.userId);
  if (user) {
    const userURLs = {};
    for (const shortURL in urlDatabase) {
      if (urlDatabase[shortURL].userID === user.id) {
        userURLs[shortURL] = urlDatabase[shortURL].longURL;
      }
    }
    const templateVars = { urls: userURLs, user };
    res.render("urls_index", templateVars);
  } else {
    const templateVars = { message: "You need to be logged in to view URLs." };
    res.render("login", templateVars);
  }
});
//Generate a random string
function generateRandomString() {
  const char = 'abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz0123456789';
  const length = 6;
  let randomString = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * char.length);
    randomString += char[randomIndex];
  }
  return randomString;
}

const urlsForUser = function(id) {
  const userUrls = {};
  for (const url in urlDatabase) {
    if (urlDatabase[url].userID === id) {
      userUrls[url] = urlDatabase[url];
    }
  }
  return userUrls;
};

//Adding a POST Route to Receive the Form Submission
app.post("/urls", (req, res) => {
  const user = users.find((user) => user.id === req.session.userId);
  if (user) {
    const userURLs = urlsForUser(user);
    const templateVars = { urls: userURLs, user };
    res.render("urls_index", templateVars);
  } else {
    const templateVars = { message: "You need to be logged into view URL"};
    res.render("login", templateVars);
  }
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
  if (!userId) {
    res.status(401).send('<h2>Please log in or register to view your URLs.<h2>');
  } else if (!url || url.userID !== userId) {
    res.status(403).send('<h2>This URL does not belong to you.<h2>');
  } else {
    res.render('urls_show', { url });
  }
});


//Updating url
app.get('/urls/:id/edit', (req, res) => {
  const shortURL = req.params.id;
  const user = users.find((user) => user.id === req.session.userId);
  const longURL = urlDatabase[shortURL].longURL;
  res.render('edit', { shortURL, longURL, user });
});

//Login
app.get('/login', (req, res) => {
  const user = users.find(user => user.id === req.session.userId);
  const templateVars = { user };
  
  if (user) {
    res.redirect('/urls');
  } else {
    res.render('login', templateVars);
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

app.post("/register", (req, res) => {
  //const userId = generateRandomString();
  const { email, password } = req.body;
  //const user = users.find((user) => user.email === email);
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
  console.log('newUser', newUser);
  console.log('password', password);
  users.push(newUser);
  //Set user_id cookie and redirect to URLs page
  req.session.userId = newUser.id;
  res.redirect("/urls");
});

app.post("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  const newLongURL = req.body.longURL;
  urlDatabase[shortURL] = newLongURL;
  res.redirect("/urls");
});
app.post("/urls/:id/edit", (req, res) => {
  const userId = req.session.userId;
  const urlId = req.params.id;
  const url = urlDatabase[urlId];
  if (!url) {
    res.status(404).send('<h2>This URL does not exist.<h2>');
  } else if (!userId) {
    res.status(401).send('<h2>Please log in or register to view your URLs.<h2>');
  }  else if (!url || url.userID !== userId) {
    res.status(403).send('<h2>This URL does not belong to you.<h2>');
  } else {
    res.render('urls_show', { url });
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
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const foundUser = getUserByEmail(email, users);
  // Find the user with the provided email
  if (!foundUser) {
    return res.status(403).send("User not found");
  }
  // Check if the user exists and the password is correct
  console.log('foundUser.password', foundUser.password);
  if (bcrypt.compareSync(password, foundUser.password)) {
    //store the user's ID in the session
    req.session.userId = foundUser.id;
    return res.send("Login successful");
  } else {
    return res.status(403).send("Incorrect password");
  }
});

//Logout
app.post("/logout", (req, res) => {
  //req.session.destroy();
  res.redirect("/login");
});

//Sending HTML
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

