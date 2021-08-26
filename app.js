const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const Student = require("./models/student-model.js");

const app = express();

const dbURL = "mongodb://localhost:27017/studentDB";

mongoose.connect(dbURL, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => app.listen(3000))
    .catch(err => console.log(err));

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const maxLim = 10;

app.post("/bookSlot",  async (req, res) => {
    let obj = req.body;
    obj.start_time = _.toNumber(obj.start_time);
    Student.find()
        .then(data => {
            const reqSlot = data.slot.filter(slot => {return(
                slot.class == obj.class && slot.start_time == obj.start_time
            )});
            if(reqSlot.length && reqSlot[0].reserved < maxLim){
                reqSlot[0].reserved +=1
                data.booked.push(obj);
                data.save();
                res.json({success: true, message: "Slot has been booked"})
            }
            else{
                data.slot.push({
                    class: obj.class,
                    start_time: obj.start_time,
                    reserved: 1
                });
                data.booked.push(obj);
                data.save();
                res.json({success: true, message: "Slot has been booked"})
            }
        })
})

