const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const jwt = require("jsonwebtoken");

const express = require("express")
require("dotenv").config();
const app = express()

// const passport = require("./config/google.auth")
const { seq } = require("./config/db")
const {User} = require("./models/UserModel")

app.get("/", (req, res) => {
  res.send("home")
})


const { v4: uuidv4 } = require("uuid");


const passport = require("passport")
var GoogleStrategy = require('passport-google-oauth20').Strategy;
require("dotenv").config();


passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "https://oauth-recipe.onrender.com/auth/google/callback"
},
  async function (accessToken, refreshToken, profile, cb) {
    let name = profile._json.name;
    let email = profile._json.email;
    let verified = profile._json.email_verified;
    if (verified) {
      let user = await User.findOne({where:{email}});
      if (user) {
        return cb(null, user)
      }
      let newUser = await User.build({ name: name, email: email, password: uuidv4() });
      await newUser.save();
      return cb(null, newUser);
    }
    console.log(profile);
    
  }
));


app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] }));



app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login',session: false }),
  function (req, res) {
    let user = req.user;
    console.log("./sd")
    const tosendtoken = jwt.sign(
      { email: user.email },
      process.env.KEY,
      {
        expiresIn: "2h",
      }
    );
    res.redirect(`https://recipes-application-p1ujipuu7-sourabh12321.vercel.app/recipe?token=${tosendtoken}&Name=${user.name}`)

  });







// const passport3 = require("passport");


//github auth




// Serve the index.html file
app.get("/login", (req, res) => {
  res.sendFile(__dirname + "/index.html")
})


// Github OAuth authentication flow


app.get('/auth/github', async (req, res) => {
  const { code } = req.query;

  try {
    const response = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
        scope: "user:email", // Request the user:email scope
      }),
    });

    const data = await response.json();
    const accessToken = data.access_token;

    const userData = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const githubUser = await userData.json();
    console.log(githubUser);
    console.log("hello")

    let email = githubUser.email;
    if (!email) {
      email = `${githubUser.name}@gmail.com`
    }

    const isUserpresent = await User.findOne({where:{email}});
    if (isUserpresent) {
      const tosendtoken = jwt.sign(
        { email: isUserpresent.email },
        process.env.KEY,
        {
          expiresIn: "2h",
        }
      );
      res.redirect(`https://recipes-application-p1ujipuu7-sourabh12321.vercel.app/recipe?token=${tosendtoken}&Name=${isUserpresent.name}`)
    } else {
      const userData = await User.build({ name: githubUser.name, email: email, password: uuidv4() });
      await userData.save();
      const tosendtoken = jwt.sign(
        { email: email },
        process.env.KEY,
        {
          expiresIn: "2h",
        }
      );
      res.redirect(`https://recipes-application-p1ujipuu7-sourabh12321.vercel.app/recipe?token=${tosendtoken}&Name=${githubUser.name}`)
    }

  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});




app.listen(process.env.PORT, async () => {
  try {
      seq.authenticate();
      seq
          .sync()
          .then(() => {
              console.log("Database & tables created!");
          })
          .catch((error) => {
              console.error("Error creating database tables:", error);
          });
      console.log(
          `Server is running on port 2000 and connected to DB`
      );
  } catch (error) {
      console.log(error);
  }
});
