const ActivityLog = require('../models/ActivityLog.model');

// Helper function to create logs internally
exports.logActivity = async (action, description, performedBy = 'System', metadata = {}) => {
    try {
        await ActivityLog.create({
            action,
            description,
            performedBy,
            metadata
        });
    } catch (error) {
        console.error("Failed to log activity:", error);
    }
};

// API Endpoint to get logs
exports.getLogs = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const logs = await ActivityLog.find()
            .sort({ createdAt: -1 })
            .limit(limit);
        res.json(logs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
