const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require("cookie-parser");

app.set("view engine", "ejs");
app.use(cookieParser());

// random string generator
const generateRandomString = function () {
  const random = Math.random().toString(36).slice(2);
  return random.slice(0, 6);
};

// function to find user from email
const getUserByEmail = function (email) {
  for (let id in users) {
    if (users[id].email === email) {
      return users[id]
    }
  }
};

// objects to hold information
const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "password123",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "password345",
  },
};

app.use(express.urlencoded({ extended: true }));

// error page for empty email or password 
app.get("/error1", (req, res) => {
  const templatevars = {
    urls: urlDatabase,
    user: users[req.cookies["user_id"]],
  };
  res.render("error1", templatevars)
});

// error page for already registered email 
app.get("/error2", (req, res) => {
  const templatevars = {
    urls: urlDatabase,
    user: users[req.cookies["user_id"]],
  };
  res.render("error2", templatevars)
});

// post to and user info to users obj and redirect to /urls
app.post("/register", (req, res) => {
  const id = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  // checks if email or password is empty and redirects to error page if true
  if (!email || !password) {
    res.redirect("/error1")
    return;
  }
  // checks if email or password is taken and redirects to error page if true
  if (getUserByEmail(email)) {
    res.redirect("/error1")
    return;
  }
  users[id] = {
    id,
    email,
    password
  };
  console.log(users)
  res.cookie("user_id", id);
  res.redirect("/urls");
})

// page for registation
app.get("/register", (req,res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]],
  };
  res.render("register", templateVars);
})

// page clears cookies and redirects back to /urls/
app.post("/logout", (req, res) => {
  const val = req.body.users;
  res.clearCookie("user_id", val);
  res.redirect("/login");
});

// login page
app.get("/login", (req, res) => {
  const templatevars = {
    urls: urlDatabase,
    user: users[req.cookies["user_id"]],
  };
  res.render("login", templatevars)
})

// this page saves the username to cookies then redirects back to /urls/
app.post("/login", (req, res) => {
  const password = req.body.password;
  const email = req.body.email;

  for (let id in users) {
    if (!getUserByEmail(email)) {
      res.redirect("/error2")
    }
    if (users[id].password === password) {
      const val = users[id].id
      res.cookie("user_id", val);
      res.redirect("/urls");
      return;
    }
  }
  res.redirect("/error2")
});

// creates new short url when user submits form with long url then redirects to show page
app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  const shortenedURL = generateRandomString(); // generates random 6 digit code for url inputted
  urlDatabase[shortenedURL] = req.body.longURL; // addeds shortended url to urlDatabase as key and full url as value
  res.redirect(`/urls/${shortenedURL}`); // response is to redirect to /urls/:id
});

// page that shows all urls
app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: users[req.cookies["user_id"]],
  };
  res.render("urls_index", templateVars);
});

// Page that lets you add new urls
app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]],
  };
  res.render("urls_new", templateVars);
});

// Shows page for short url
app.get("/urls/:id", (req, res) => {
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
    user: users[req.cookies["user_id"]],
  };
  res.render("urls_show", templateVars);
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
  res.redirect("/urls");
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
