const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
    action: {
        type: String,
        required: true,
        enum: ['ADMIT_PATIENT', 'DISCHARGE_PATIENT', 'ADD_BED', 'UPDATE_STATUS', 'USER_SIGNUP', 'USER_LOGIN', 'NURSE_APPROVED', 'OTHER']
    },
    description: {
        type: String,
        required: true
    },
    performedBy: {
        type: String, // Username or 'System'
        default: 'System'
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed // Flexible field for IDs (bedId, patientId, etc.)
    }
}, { timestamps: true });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
