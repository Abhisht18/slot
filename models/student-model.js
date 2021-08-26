const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    student: [{
        name: String,
        classes: [String]
    }],
    slot:[{
        class: String,
        start_time: Number,
        reserved: Number
    }],
    booked: [{
        stud_id: String,
        class: String,
        start_time: Number
    }],
    queue:[{
        stud_id: String,
        class: String,
        start_time: Number
    }]
},{ typeKey: '$type' });

const Student = mongoose.model('Student', studentSchema);
module.exports = Student;