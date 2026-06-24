const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  data: [String],
  response: {
    user_id: String,
    email_id: String,
    college_roll_number: String,
    hierarchies: Array,
    invalid_entries: [String],
    duplicate_edges: [String],
    summary: {
      total_trees: Number,
      total_cycles: Number,
      largest_tree_root: String
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Submission', submissionSchema);
