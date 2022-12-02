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

// function to return object with data for logged user
const urlsForUser = (id, urlDatabase) => {
  let userData = {};
  for (let shortURLS in urlDatabase) {
    if (id === urlDatabase[shortURLS].userID) {
      userData[shortURLS] = urlDatabase[shortURLS].longURL;
    }
  }
  return userData;
};

// objects to hold information
const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};;

const users = {
  userRandomID: {
    id: "aJ48lW",
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

// post to and user info to users obj and redirect to /urls
app.post("/register", (req, res) => {
  const id = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  if (!email || !password) {
    return res.status(400).send('Files cannot be empty!');
  }
  if (getUserByEmail(email)) {
    return res.status(400).send('Email is already linked to an account!');
  }
  users[id] = {
    id,
    email,
    password
  };
  res.cookie("user_id", id);
  res.redirect("/urls");
})

// page for registation
app.get("/register", (req,res) => {
  if (req.cookies.id) {
    return res.redirect("/urls");
  } 
  const templateVars = {
    user: users[req.cookies["user_id"]]
    };
  return res.render("register", templateVars);
});

// login page
app.get("/login", (req, res) => {
  if (req.cookies.id) {
    return res.redirect("/urls");
  } 
  const templateVars = {
    user: users[req.cookies["user_id"]]
    };
  return res.render("login", templateVars);
});

// this page saves the username to cookies then redirects back to /urls/
app.post("/login", (req, res) => {
  if (!getUserByEmail(req.body.email)) {
    return res.status(403).send('Email is not registered!');
  }
  if (getUserByEmail(req.body.email).password !== req.body.password) {
    return res.status(403).send('Password does not match!');
  }
  res.cookie('user_id', getUserByEmail(req.body.email).id);
  res.redirect("urls");
});

// page clears cookies and redirects back to /urls/
app.post("/logout", (req, res) => {
  const val = req.body.users;
  res.clearCookie("user_id", val);
  res.redirect("/login");
});

// creates new short url when user submits form with long url then redirects to show page
app.post("/urls", (req, res) => {
  const user = req.cookies["user_id"];
  if (!user) {
    return res.send("You can only create shortened urls while logged in!");
  }
  const shortenedURL = generateRandomString(); 
  urlDatabase[shortenedURL] = {longURL: req.body.longURL, userID: req.cookies["user_id"]}
  return res.redirect(`/urls/${shortenedURL}`); 
});

// page that shows all urls
app.get("/urls", (req, res) => {
  if (!req.cookies.user_id) {
    res.send("Please login to view you tinyURL's!")
  }
  const filtered = urlsForUser(req.cookies.user_id, urlDatabase)
  const templateVars = {
    urls: filtered,
    user: users[req.cookies.user_id],
  };
  res.render("urls_index", templateVars);
});
// Page that lets you add new urls
app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]],
  };
  if (!req.cookies["user_id"]) {
    return res.redirect("/login")
  }
  res.render("urls_new", templateVars);
})

// opens long url from short url 
app.get("/u/:id", (req, res) => {
  let id = req.params.id;
  const longURL = urlDatabase[id].longURL;
  for (let shortURLs in urlDatabase) {
    if(id === shortURLs) {
      return res.redirect(longURL);
    }
}
return res.send("That url is not in our system!");
});

// Shows page for short url
app.get("/urls/:id", (req, res) => {
  const user = req.cookies.user_id
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id].longURL,
    user: users[req.cookies["user_id"]],
  };
  if (!user) {
    res.send("Login to view this page!")
  }
  if (user !== urlDatabase[req.params.id].userID) {
    res.send("You don't have the correct permissions to view this url!")
  }
  res.render("urls_show", templateVars);
});

// when url is deleted this removes it from urlDatabase and redirects user to /urls page
app.post("/urls/:id/delete", (req, res) => {
  const userID = req.cookies.user_id;
  const requestID = req.params.id;
  if (Object.keys(urlDatabase).indexOf(requestID) < 0) {
    res.send("That tinyURL is not in out database!");
  }
  if (!userID) {
    res.send("Please login to delete tinyURL's");
  }
  if (userID !== urlDatabase[requestID].userID) {
    res.send("You don't have access to that tinyURL!");
  }
  delete urlDatabase[requestID];
  res.redirect("/urls");
});

// Redirects back to /url/ which is now updated with new longURL
app.post("/urls/:id", (req, res) => {
  const userID = req.cookies.user_id;
  const requestID = req.params.id;
  if (Object.keys(urlDatabase).indexOf(requestID) < 0) {
    res.send("That TinyURL is not in our database!");
  }
  if (!userID) {
    res.send("Please login to edit this TinyURL");
  }
  if (userID !== urlDatabase[requestID].userID) {
    res.send("You don't have access to this TinyURL");
  }
  urlDatabase[requestID].longURL = req.body.longURL;
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