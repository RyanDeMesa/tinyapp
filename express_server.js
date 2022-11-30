const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require("cookie-parser");

app.set("view engine", "ejs");
app.use(cookieParser());

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

// random string generator
const generateRandomString = function () {
  const random = Math.random().toString(36).slice(2);
  return random.slice(0, 6);
};

app.use(express.urlencoded({ extended: true }));

// page for registation
app.get("/register/", (req,res) => {
  const templateVars = {
    username: req.cookies["username"],
  };
  res.render("register", templateVars);
})

// page clears cookies and redirects back to /urls/
app.post("/logout/", (req, res) => {
  const username = req.body.username;
  res.clearCookie("username", username);
  res.redirect("/urls/");
});

// this page saves the username to cookies then redirects back to /urls/
app.post("/login/", (req, res) => {
  const username = req.body.username;
  res.cookie("username", username);
  res.redirect("/urls/");
});

// creates new short url when user submits form with long url then redirects to show page
app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  const shortenedURL = generateRandomString(); // generates random 6 digit code for url inputted
  urlDatabase[shortenedURL] = req.body.longURL; // addeds shortended url to urlDatabase as key and full url as value
  res.redirect(`/urls/${shortenedURL}`); // response is to redirect to /urls/:id
});

//redirects to longURL from shortenedURL
app.get("/u/:id", (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id];
  res.redirect(longURL);
});

// page that shows all urls
app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    username: req.cookies["username"],
  };
  res.render("urls_index", templateVars);
});

// Page that lets you add new urls
app.get("/urls/new", (req, res) => {
  let username = req.cookies["username"]
  const templateVars = {username};
  res.render("urls_new", templateVars);
});

// Shows page for short url
app.get("/urls/:id", (req, res) => {
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
    username: req.cookies["username"],
  };
  res.render("urls_show", templateVars);
});

// page that says hello
app.get("/", (req, res) => {
  res.send("Hello!");
});

// when url is deleted this removes it from urlDatabase and redirects user to /urls page
app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  delete urlDatabase[id];
  res.redirect("/urls");
});

// Redirects back to /url/ which is now updated with new longURL
app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id] = req.body.longURL;
  res.redirect("/urls/");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

// page that shows all data in json form
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// page that just says hello world
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});
