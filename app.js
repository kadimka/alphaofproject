const express = require('express')
const path = require('path')
const bodyParser = require('body-parser')
const config = require('./config')
const Post = require('./models/post')
const sassMiddleware = require('node-sass-middleware');
const mongoose = require('mongoose')
const routes = require('./routes')
const session = require('express-session')
const MongoStore = require('connect-mongo')(session)




//database
mongoose.Promise = global.Promise
mongoose.set('debug', config.IS_PRODUCTION)
mongoose.connection
    .on('error', error => console.log(error))
    .on('close', () => console.log('database connection closed.'))
    .once('open', () => {
        const info = mongoose.connections[0]
        console.log(`Connected to ${info.host}:${info.port}/${info.name}`)
        //require('./mocks')()
    })
mongoose.connect(config.MONGO_URL, { useNewUrlParser: true })


//express
const app = express()
//session
app.use(
    session({
        secret: config.SESSION_SECRET,
        resave: true,
        saveUninitialized: false,
        store: new MongoStore({
            mongooseConnection  : mongoose.connection
        })
    })
)
//sets and uses
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())
app.use(sassMiddleware({
    src: path.join(__dirname, 'public'),
    dest: path.join(__dirname, 'public'),
    indentedSyntax: true, // true = .sass and false = .scss
    sourceMap: true
}));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads',express.static(path.join(__dirname, config.DESTINATION)))
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


//routers

app.use('/', routes.archive)
app.use('/post', routes.post)
app.use('/api/auth', routes.auth)
app.use('/comment', routes.comment)
app.use('/upload', routes.upload)


app.use((req, res, next) => {
    const err = new Error('Not Found')
    err.status = 404
    next(err)
})

app.use((error, req, res, next) => {
    res.status(error.status || 500)
    res.render('error', {
        message: error.message,
        error: !config.IS_PRODUCTION ? error : {},
        title: 'Oops...'
    })
})

app.listen(config.PORT, () => console.log(`Server listening port ${config.PORT}!`))


 module.exports = app