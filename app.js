const express = require("express")
const session = require("express-session")
const passport = require("passport")
const body = require("body-parser")
const app = express()
const cookieParser = require("cookie-parser")
const userM = require("./dataBase")
app.use(body.urlencoded({ extended: true }))
app.use(express.static(__dirname + "/public"))
app.set("view engine", "ejs")
app.use(express.json())
app.use(cookieParser())
const oneDay = 1000 * 60 * 60 * 24
app.use(
  session({
    secret: "ilovealessiacara",
    saveUninitialized: false,
    cookie: { maxAge: oneDay },
    resave: false,
  })
)
// inisiales passport
app.use(passport.initialize())
app.use(passport.session())
app.use((req, res, next) => {
  console.log(req.session)
  console.log(req.user)
  next()
})

// passport local starategy
passport.use(userM.createStrategy())
passport.serializeUser(userM.serializeUser())
passport.deserializeUser(userM.deserializeUser())
app.get("/", (req, res) => {
  res.render("index")
})

// registring path
app.get("/register", (req, res) => {
  res.render("register", { title: "" })
})
app.post("/register", (req, res) => {
  userM.findOne({ username: req.body.username }, (err, data) => {
    if (err) {
      console.log(err)
    }
    if (data) {
      res.render("register", { title: "the name is taken try again" })
    }
    if (!data) {
      userM.register(
        {
          username: req.body.username,
          email: req.body.email,
        },
        req.body.password,
        (err, registed) => {
          if (err) {
            console.log(err)
          }
          passport.authenticate("local")(req, res, function () {
            res.redirect("/" + registed.username)
          })
        }
      )
    }
  })
})

// login path
app.get("/login", (req, res) => {
  res.render("login", { title: "" })
  console.logMessageEvent
})
app.post("/login", (req, res) => {
  // passport login method
  const user = new userM({
    username: req.body.username,
    password: req.body.password,
  })
  req.login(user, (err) => {
    if (err) {
      console.log(err)
    } else {
      passport.authenticate("local", {
        failureRedirect: "/login",
      })(req, res, function () {
        res.redirect("/" + req.body.username)
      })
    }
  })
})

// new secret path
app.get("/:username/newsecret", (req, res) => {
  res.render("newsecret", { name: req.params.username })
})
app.post("/newsecret", (req, res) => {
  userM.updateOne(
    { username: req.body.username },
    {
      $push: { secrets: [{ secret: req.body.secret, color: req.body.color }] },
    },
    (err, data) => {
      if (err) {
        console.log(err)
      }
      if (data) {
        res.redirect("/" + req.body.username)
      }
    }
  )
})

// logout user
app.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      console.log(err)
    } else {
      res.redirect("/")
    }
  })
})
// entering user account
app.get("/:username", (req, res) => {
  if (req.isAuthenticated()) {
    userM.findOne({ username: req.params.username }, (err, data) => {
      if (err) {
        console.log(err)
      }
      if (!data) {
        res.redirect("/")
      }
      if (data) {
        if (req.session) {
          res.render("secret", { name: data.username, secrets: data.secrets })
        }else{
          res.redirect("/")
        }
      }
    })
  } else {
    res.redirect("/")
  }
})

app.listen(3000, () => {
  console.log("the server is on at port 3000")
})
