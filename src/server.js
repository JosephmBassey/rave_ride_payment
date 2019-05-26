import express from 'express'
import hbs from 'hbs'
import path from 'path'
import fetch from 'node-fetch'
import session from 'express-session'
import cookieParser from 'cookie-parser'
import flash from 'connect-flash'


const app = express();

require("dotenv").config();


const PORT = process.env.PORT  || 4000

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");
app.use(express.static(path.join(__dirname, "public")));

app.use(express.json())
app.use(
  express.urlencoded({
    extended: false
  })
);

app.use(
  session({
    secret:process.env.SESSION_KEY,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(cookieParser());
app.use(flash());


app.use((req, res, next) => {
  res.locals.success_flash = req.flash("success");
  res.locals.error_flash = req.flash("error");
  next()
})

app.get('/', async (req, res, next) => {
  res.render('index')
});


app.post('/payment', async (req, res) => {
  try {
    const body = {
    amount : req.body.amount,
    customer_email: req.body.email,
    txref: "Hi-Taxi"+Date.now(),
    currency: "NGN",
    country: "NG",
    PBFPubKey: process.env.FLWPUBK_KEY,
    subaccounts: [{id: req.body.rider_ID}],
    redirect_url: "https://rave-webhook.herokuapp.com/receivepayment",
    meta: [
      {
        "metaname": "Hi-Taxi",
        "metavalue": "123949494DC"
      }
    ],
    }
    const URL = `https://ravesandboxapi.flutterwave.com/flwv3-pug/getpaidx/api/v2/hosted/pay`

    const result = await fetch(URL, {
        method: 'post',
        body:    JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' },
    })
    const jsonResponse = await result.json()
    //Redirect to Flutterwave Payment Modal
    res.redirect(jsonResponse.data.link)

  } catch (err) {
      console.log(err)
  }
})



app.listen(PORT , () => {
  console.log(`Server Started on port! ${PORT}`);
});

