/*jshint esversion:6*/
const express = require('express');
const app = express();
const bp = require('body-parser');
const fs = require('fs');
app.use(express.static(__dirname + "/files"));

let file = "/log.txt";
//to log to log.txt
var log = (text)=>{
    let date = new Date();
    text = "\n" + date + "\t - " + text;
    console.log(text);
    fs.appendFileSync(__dirname + file,text);
};

//SHA256 encryption to encrypt Usernames and Password
const crypto = require('crypto');
var encrypt = (pass)=>{
    return crypto.createHash('sha256').update(pass).digest('hex');
};
app.use(bp.urlencoded({ extended: false }));
const PORT = process.env.PORT || 6950;
app.listen(PORT, (req,res) =>{
    log("Server listening at port : "+ PORT);
});


//Serves index.html
app.get("/entrypoint",(req,res)=>{
   res.sendFile(__dirname + "/index.html");
});
//serves signup page
app.get("/signup", (req,res)=>{
    res.sendFile(__dirname + "/signup.html");
});
//serves login page
app.get("/login",(req,res)=>{
    res.sendFile(__dirname + "/login.html");
});


//POST request from Signup page containing username and password    
app.post("/insertData",(req,res)=>{
    fs.readFile(__dirname + "/userData_CX19Z5SDAPPRSCN.json", (err,data)=>{
        if(err) throw err;
        var json = JSON.parse(data);
        var name = encrypt(req.body.Name);
        var pass = encrypt(req.body.Password);

        var object = {name,pass};
        var exist = 0;
        //Checks if said account Exists:
        for(var items in json.users){
            if(json.users[items].name == name){
                log("Account Already Exists");
                //res.write("Account exists");
                //res.redirect(req.protocol + '://' + req.get('host'));
                exist = 1;
                break;
            }
        }
        if(exist == 0){
            json.users.push(object);
            log("New Account Signed UP");
        }
        fs.writeFileSync(__dirname + "/userData_CX19Z5SDAPPRSCN.json",JSON.stringify(json));
    });
    setTimeout(()=>{
        res.redirect(200,"/entrypoint");
    },1000);
});

app.get("/clearConsole",(req,res)=>{
    log("UserStream Data was cleared");
    log((req.protocol + '://' + req.get('host')));
    fs.writeFileSync(__dirname + "/userData_CX19Z5SDAPPRSCN.json","{\"users\":[]}");
});
app.post("/checkData",(req,res)=>{
    res.redirect(req.protocol + '://' + req.get('host') + "/u/" + encrypt(req.body.Name));
    fs.readFile(__dirname + "/userData_CX19Z5SDAPPRSCN.json",(err,data)=>{
        if(err) throw err;
        var json = JSON.parse(data);
        var name = encrypt(req.body.Name);
        var pass = encrypt(req.body.Password);
        for(var items in json.users){
            if(json.users[items].name == name){
                if( json.users[items].pass == pass){
                    log(name+" has logged in");
                    break;
                }
                else{
                    res.sendFile(__dirname + "/index.html");
                    log("Invalid Credentials");

                }
            }
        }
    });
});

app.get("/u/:id",(req,res)=>{
    res.send("Welcome " + req.params.id);
});

