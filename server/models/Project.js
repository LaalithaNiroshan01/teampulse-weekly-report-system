const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Project name is required'],
      unique: true,
      trim: true,
      maxlength: [100, 'Project name cannot exceed 100 characters']
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    color: {
      type: String,
      trim: true,
      default: '#3B82F6' // default blue
    },
    isActive: {
      type: Boolean,
      default: true
    },
    assignedMembers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ]
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Project', projectSchema);
