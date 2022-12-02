// random string generator
const generateRandomString = function () {
  const random = Math.random().toString(36).slice(2);
  return random.slice(0, 6);
};

// function to find user from email
const getUserByEmail = (email, userDatabase) => {
  for (let userID in userDatabase) {
    if (userDatabase[userID].email === email) {
      const user = userDatabase[userID];
      return user;
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

module.exports = { generateRandomString, getUserByEmail, urlsForUser }