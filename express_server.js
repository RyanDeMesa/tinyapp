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

// error page to prompt user to login
app.get("/error3", (req, res) => {
  const templatevars = {
    urls: urlDatabase,
    user: users[req.cookies["user_id"]],
  };
  res.render("error3", templatevars)
});

// error page for missing url
app.get("/error4", (req, res) => {
  const templatevars = {
    urls: urlDatabase,
    user: users[req.cookies["user_id"]],
  };
  res.render("error4", templatevars)
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
  if (req.cookies["user_id"]) {
    return res.redirect("/urls")
  }
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
  const user = getUserByEmail(email);
  if (user) {
    const userID = user.id;
    res.cookie("user_id", userID);
    return res.redirect("/urls");
  } else {
    res.redirect("error2");
  }
  if (password !== user.password) {
    res.redirect("error2");
  }
});

// creates new short url when user submits form with long url then redirects to show page
app.post("/urls", (req, res) => {
  const user = req.cookies["user_id"];
  if (!user) {
    return res.send("You can only create shortened urls while logged in!");
  }
  console.log(req.body);
  const shortenedURL = generateRandomString(); 
  urlDatabase[shortenedURL] = req.body.longURL; 
  res.redirect(`/urls/${shortenedURL}`); 
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
  const email = req.body.email;
  const password = req.body.password;
  if (!email && !password) {
    res.redirect("/login");
  }
  else {
    const templateVars = { user: undefined };
    res.render("urls_new", templateVars);
  }
});

// opens long url from short url 
app.get("/u/:id", (req, res) => {
  let id = req.params.id;
  const longURL = urlDatabase[id];
  for (let shortURLs in urlDatabase) {
    if(id === shortURLs) {
      return res.redirect(longURL);
    }
}
return res.send("that url is not in our system!");
});

// Shows page for short url
app.get("/urls/:id", (req, res) => {
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
    user: users[req.cookies["user_id"]],
  };
  res.redirect(`/urls/${shortenedURL}`); 
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