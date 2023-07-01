const express = require("express");
const app = express();
const PORT = 3000; // default port 8080
//Set ejs as the view engine
app.set("view engine", "ejs");
const cookieParser = require('cookie-parser');
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));

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
  const templateVars = { urls: urlDatabase, username: req.cookies.username };
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
  const templateVars = { username: req.cookies.username };
  res.render("urls_new", templateVars);
});

//Single URL & shortened form-Redirect Short URLs
app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id], username: req.cookies.username };
  res.render("urls_show", templateVars);
});
//Updating url
app.get('/urls/:id/edit', (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id];
  res.render('edit', { id: id, longURL: longURL, username: req.cookies.username });
});
//Login
app.get('/login', (req, res) => {
  console.log(req.cookies.username);
  const templateVars = { urls: urlDatabase, username: req.cookies.username };
  res.render("login", templateVars);
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

const users = [
  {id: '1', username: 'satya', password: 'password1'}
];
function isValidLogin(username, password) {
  const user = users.find(user => user.username === username);
  return user !== undefined;
}
app.post('/login', (req, res) => {
  const { username, password } = req.body;
 
  if (isValidLogin(username, password)) {
    res.cookie('username', username);
    res.redirect("/urls");
  } else {
    res.send('Invaild username or password');
  }
});
//Logout
app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect("/urls");
});

//Sending HTML
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

