// random string generator
const generateRandomString = function () {
  const random = Math.random().toString(36).slice(2);
  return random.slice(0, 6);
};

// function to find user from email
const getUserByEmail = (email, database) => {
  for (const user of Object.values(database)) {
    for (const [key, value] of Object.entries(user)) {
      if (key === "email" && value === email) {
        return user.id;
      }
    }
  }
  return null;
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