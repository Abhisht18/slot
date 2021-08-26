const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const Student = require("./models/student-model.js");
const { escapeRegExp } = require("lodash");

const app = express();

const dbURL = "mongodb://localhost:27017/studentDB";

mongoose.connect(dbURL, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => app.listen(3000))
    .catch(err => console.log(err));

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

Student.find()
    .then(data => {
        if(!data.length){
            const stud = new Student;
            stud.save();
        }
    })

const maxLim = 10;

app.post("/bookSlot", async (req, res) => {
    let obj = req.body;
    obj.start_time = _.toNumber(obj.start_time);
    Student.find()
        .then(datas => {
            const data = datas[0];
            const studList = data.booked.filter(booked => {
                return (
                    booked.name == obj.name && booked.class == obj.class && booked.start_time == obj.start_time
                )
            });
            if(studList.length){
                res.json({success: true, message: "Already booked in this slot of this class."})
            }
            const studListt = data.queue.filter(queue => {
                return (
                    queue.name == obj.name && queue.class == obj.class && queue.start_time == obj.start_time
                )
            });
            if(studListt.length){
                res.json({success: false, message: "Already queued in this slot of this class."})
            }
            const reqSlot = data.slot.filter(slot => {
                return (
                    slot.class == obj.class && slot.start_time == obj.start_time
                )
            });
            if (reqSlot.length) {
                if (reqSlot[0].reserved < maxLim) {
                    reqSlot[0].reserved += 1
                    data.booked.push(obj);
                    data.save();
                    res.json({ success: true, message: "Slot has been booked" });
                }
                else {
                    data.queue.push(obj);
                    data.save();
                    res.json({ success: false, message: "Slot has not been booked but added to queue. Keep checking for allocation." });
                }
            }
            else {
                data.slot.push({
                    class: obj.class,
                    start_time: obj.start_time,
                    reserved: 1
                });
                data.booked.push(obj);
                data.save();
                res.json({ success: true, message: "Slot has been booked." });
            }
        })
})

app.post("/cancelSlot", async (req, res) => {
    let obj = req.body;
    obj.start_time = _.toNumber(obj.start_time);
    Student.find()
        .then(datas => {
            const data = datas[0];
            var d = new Date();
            let hr = d.getHours();
            let min = d.getMinutes();
            if (hr > obj.start_time || (obj.start_time - hr == 1 && min > 30)) {
                res.json({ success: false, message: "Slot cannot be cancelled" })
            }
            else {
                let i = data.booked.length;
                while (i--) {
                    if(data.booked[i].name == obj.name && data.booked[i].start_time == obj.start_time && data.booked[i].class == obj.class){
                        data.booked.splice(i, 1);
                        break;
                    }
                }
                let ansObj = {
                    name: "",
                    class: "",
                    start_time: 0
                };
                i = data.queue.length;
                while (i--) {
                    if(data.queue[i].start_time == obj.start_time && data.queue[i].class == obj.class){
                        ansObj = data.queue[i];
                        data.queue.splice(i, 1);
                        break;
                    }
                }
                if(ansObj.name != ""){
                    data.booked.push(ansObj);
                }
                else{
                    j = data.slot.length;
                    while(j--){
                        if(data.slot[j].class == obj.class && data.slot[j].start_time == obj.start_time){
                            data.slot[j].reserved -=1;
                            break;
                        }
                    }
                }
                data.save();
                res.json({success: true, message: "Slot has been cancelled."});
            }
        })
})

