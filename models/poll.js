var mongoose = require('mongoose');
//var voteSchema = new mongoose.Schema({ ip: 'String' });

var submissionSchema = new mongoose.Schema({
	_id:false,
	dni: String
});


var proposalSchema = new mongoose.Schema({
		
 	short_title: String,
 	image: String,
    title: String,
    object: String,
    description: String,
    location: String,
    cost: String,
    checked: Boolean,
    votes: Number, 
    submissions: [submissionSchema]

});

var PollSchema = new mongoose.Schema({
	title: String,
	description: String,
	proposals: [proposalSchema],
	submissions: [submissionSchema],
	publishDate: { startDate: Date, endDate: Date },
	state: Number,
	totalVotes: Number
});

// return the model

module.exports = mongoose.model('polls', PollSchema);
