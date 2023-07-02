const express = require("express");
const app = express();
const PORT = 3000; // default port 3000
//Set ejs as the view engine
//const { getUserByEmail } = require("./helper");
app.set("view engine", "ejs");
const cookieParser = require('cookie-parser');
app.use(cookieParser());
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
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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
    res.status(404).send("URL not found");
  }
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, user: users.find(user => user.id === req.cookies.user_id) };
  res.render("urls_index", templateVars);
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

//Adding a POST Route to Receive the Form Submission
app.post("/urls", (req, res) => {
  const longURL = req.body.longURL;
  const shortURL = generateRandomString();
  //store mapping of short URL to long URL in the database
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls/${shortURL}`);
});

//Adding a GET Route to show the form
app.get("/urls/new", (req, res) => {
  const templateVars = { urls: urlDatabase, user: users.find(user => user.id === req.cookies.user_id) };
  res.render("urls_new", templateVars);
});

//Single URL & shortened form-Redirect Short URLs
app.get("/urls/:id", (req, res) => {
  const templateVars = { urls: urlDatabase, user: users.find(user => user.id === req.cookies.user_id) };
  res.render("urls_show", templateVars);
});
//Updating url
app.get('/urls/:id/edit', (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id];
  res.render('edit', { id: id, longURL: longURL, user: users.find(user => user.id === req.cookies.user_id) });
});

//Login
app.get('/login', (req, res) => {
  const {email, password} = req.body;
  const templateVars = { urls: urlDatabase, user: users.find(user => user.id === req.cookies.user_id) };
  res.render("login", templateVars);
});

//Register GET route handler
app.get("/register", (req, res) => {
  const templateVars = { user: req.cookies.user_id };
  res.render("register", { user: templateVars.user });
});

function getUserByEmail(email, users) {
  return users.find(user => user.email === email);
}
app.post("/register", (req, res) => {
  //const userId = generateRandomString();
  const { email, password } = req.body;
  //const user = users.find((user) => user.email === email);
  const foundUser = getUserByEmail(email, users);
  if (foundUser) {
    return res.status(400).send("Email already registered");
  }
  //create a new user object
  const newUser = {
    id: generateRandomString(),
    email: email,
    password: password,
  };
  users.push(newUser);
  //Set user_id cookie and redirect to URLs page
  res.cookie("user_id", newUser.id);
  res.redirect("/urls");
});

app.post("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  const newLongURL = req.body.longURL;
  urlDatabase[shortURL] = newLongURL;
  res.redirect("/urls");
});

//POST route to delete a URL resource
app.post("/urls/:id/delete", (req, res) => {
  const shortURL = req.params.id;
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const foundUser = getUserByEmail(email, users);
  // Find the user with the provided email
  const user = users.find(user => user.email === email);
  if (!foundUser) {
    return res.status(403).send("User not found");
  }
  // Check if the user exists and the password is correct
  if (foundUser.password !== password) {
    return res.status(403).send("Incorrect password");
  }
  res.cookie('user_id', user.id);
  res.redirect("/urls");
});

//Logout
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/login");
});

//Sending HTML
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

