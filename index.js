import express from "express";
import bodyParser from "body-parser";
import mysql from "mysql";
import { dirname } from "path";
import { fileURLToPath } from "url";
const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();
const port = 3000;
var isLoggedin = false;

const conn = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    database: "info"
});

conn.connect((err) => {
    if (err) console.log("Error connecting to database: " + err.stack);
    else console.log("Connected. ID: " + conn.threadId);
});

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use('/public', express.static(__dirname + "/public"));
app.use('/fonts', express.static(__dirname + "/fonts"));
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/main.html');
});

app.get('/signup.html', (req, res) => {
    res.sendFile(__dirname + "/signup.html");
});

app.get('/login.html', (req, res) => {
    res.sendFile(__dirname + '/login.html');
});

app.get('/:name', (req, res) => {
    let catName = req.params.name;
    res.render(__dirname + '/public/views/category.ejs', { category: catName});
})

app.get('/:place', (req, res) => {
    let placeName = req.params.name;
    let placeID = 101;

    let query = "SELECT * FROM treks where place_id = ?";
    conn.query(query, [placeID], (err, results) => {
        if (err) {
            console.log(err.stack);
            res.status(500).send('Internal Server Error');
            return;
        }
        res.render(__dirname + "/public/views/despage.ejs", {desc: results});
    });
});

let placeID = 101;
let trekDescription = "";
let query = "select description from treks where place_id = ?";
conn.query(query, [placeID], (err, rows) => {
if (err) {
    console.log(err.stack);
    res.status(500).send('Internal Server Error');
    return;
    }
if (rows.length > 0) {
    trekDescription = rows[0].description; // Assuming you want the first row's description
    console.log('Fetched trek description from MySQL database:', trekDescription);
}
else {
    let text = rows;
    res.render(__dirname + '/public/views/despage.ejs', { desc: text });
}
})

app.get('/despage', (req, res) => {
    let placeID = 101;
    let query = "select description from treks where place_id = ?";
    conn.query(query, [placeID], (err, rows) => {
        if (err) {
            console.log(err.stack);
            res.status(500).send('Internal Server Error');
            return;
        }
        if (rows.length > 0) {
            const trekDescription = rows[0].description; // Assuming you want the first row's description
            console.log('Fetched trek description from MySQL database:', trekDescription);
            res.render(__dirname + '/public/views/despage.ejs');
            res.locals({trekDescription: trekDescription});
        }
        else {
            let text = rows;
            res.render(__dirname + '/public/views/despage.ejs', { desc: text });
        }
    })
})

app.post("/login", (req, res) => {
    let email = req.body.email;
    let pass = req.body.pass;

    let query = "SELECT * from user where email = ? and password = ?";
    conn.query(query, [email, pass], (err, results) => {
        if (err) {
            res.status(500).send('Error retrieving user from database');
            return;
        }
        if (results.length > 0) {
            res.redirect('/main');
            isLoggedin = true;

        } else {
            res.send("Invalid username or password!");
        }
    });
});

app.post('/signup', (req, res) => {
    let firstname = req.body.firstname;
    let lastname = req.body.lastname;
    let email = req.body.email;
    let pass = req.body.pass;
    let user = req.body.user;
    let mob = req.body.mobno;

    console.log(firstname + " " + lastname);

    const query = "insert into user (firstname, lastname, email, password, usertype, mobile_no) VALUES (?, ?, ?, ?, ?, ?)";
    conn.query(query, [firstname, lastname, email, pass, user, mob], (err, results) => {
        if (err) {
            console.log(err);
            res.send("Error registering user into database! Please try again.");
            return;
        }
        res.send("User registered successfully!");
    });
});

app.get('/main', (req, res) => {
    res.sendFile("./main.html"); 
});

app.listen(port, () => {
    console.log(`Server's now runnning on port ${port}`);
});