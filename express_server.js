const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

// random string generator
const generateRandomString = function() {
  const random = Math.random().toString(36).slice(2);
  return random.slice(0, 6);
};

app.use(express.urlencoded({ extended: true }));

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

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:id", (req, res) => {
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
  };
  res.render("urls_show", templateVars);
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

// when url is deleted this removes it from urlDatabase and redirects user to /urls page
app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id
  delete urlDatabase[id]
  res.redirect('/urls')
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});
