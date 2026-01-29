const Bed = require('../models/Bed.model');
const Patient = require('../models/Patient.model'); // Needed to update patient if assigned automatically
const dsaManager = require('../dsa/dsaManager');
const { BED_STATUS } = require('../utils/constants');
const { logActivity } = require('./activity.controller');

// POST /api/beds
exports.addBed = async (req, res) => {
    try {
        const { bedId, wardNumber, type } = req.body;
        const username = req.user ? req.user.username : 'System';

        // 1. Persist to DB
        // If it starts as FREE
        const newBed = new Bed({
            bedId,
            wardNumber,
            type,
            status: BED_STATUS.FREE
        });
        await newBed.save();

        logActivity('ADD_BED', `Added new bed ${bedId} in ward ${wardNumber}`, username, { bedId });

        // 2. Add to DSA Manager
        // This checks if the new bed can satisfy a waiting patient
        const result = dsaManager.addNewBed(newBed.toObject());

        // 3. Handle Side Effects (Automatic Assignment)
        if (result.allocatedPatient) {
            // Patient was waiting and got assigned this new bed
            const { allocatedPatient, bed: updatedBed } = result;

            // Update Patient in DB
            await Patient.findOneAndUpdate(
                { patientId: allocatedPatient.patientId },
                { 
                    status: allocatedPatient.status,
                    assignedBedId: allocatedPatient.assignedBedId 
                }
            );

            // Update Bed in DB (it became OCCUPIED)
            await Bed.findOneAndUpdate(
                { bedId: updatedBed.bedId },
                { status: updatedBed.status }
            );

            logActivity('ADMIT_PATIENT', `Waitlisted patient ${allocatedPatient.name} assigned to new bed ${bedId}`, 'System', { bedId, patientId: allocatedPatient.patientId });

            return res.status(201).json({
                message: 'Bed added and automatically assigned to waiting patient',
                bed: updatedBed,
                assignedPatient: allocatedPatient
            });
        }

        res.status(201).json({ message: 'Bed added successfully', bed: newBed });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET /api/beds
exports.getAllBeds = (req, res) => {
    // Return from Memory for speed (DSA requirement: fetch all beds)
    // Or filter via Query params using Linear Search
    const { wardNumber, status } = req.query;
    
    if (wardNumber || status) {
        const criteria = {};
        if (wardNumber) criteria.wardNumber = wardNumber;
        if (status) criteria.status = status;
        
        const results = dsaManager.searchBeds(criteria);
        return res.json(results);
    }

    res.json(dsaManager.getAllBeds());
};

// PATCH /api/beds/:bedId/status
// Explicitly used for releasing a bed (rendering it FREE)
exports.updateBedStatus = async (req, res) => {
    const { bedId } = req.params;
    const { status } = req.body;
    const username = req.user ? req.user.username : 'System';

    try {
        // We focus on Releasing Logic as per requirements
        if (status === BED_STATUS.FREE) {
            
            // 0. Discharge ANYONE currently assigned to this bed (Clean up ghosts too)
            await Patient.updateMany(
                { assignedBedId: bedId }, 
                { 
                    $set: { 
                        status: 'DISCHARGED', 
                        assignedBedId: `${bedId}_HISTORY_${Date.now()}` 
                    } 
                }
            );

            logActivity('DISCHARGE_PATIENT', `Discharged patient from bed ${bedId}`, username, { bedId });
            
            const result = dsaManager.processBedRelease(bedId);
            
            // 2. Sync DB
            // Update the released bed
            await Bed.findOneAndUpdate({ bedId }, { status: BED_STATUS.FREE });

            if (result.allocatedPatient) {
                // A patient was popped from queue
                const { allocatedPatient, bed: reOccupiedBed } = result;

                 // Update Patient in DB
                 await Patient.findOneAndUpdate(
                    { patientId: allocatedPatient.patientId },
                    { 
                        status: allocatedPatient.status,
                        assignedBedId: allocatedPatient.assignedBedId 
                    }
                );
                
                logActivity('ADMIT_PATIENT', `Queue patient ${allocatedPatient.name} automatically admitted to ${bedId}`, 'System', { bedId, patientId: allocatedPatient.patientId });

                // Update Bed in DB (It was free for a split second, now Occupied)
                await Bed.findOneAndUpdate(
                    { bedId: reOccupiedBed.bedId },
                    { status: reOccupiedBed.status }
                );

                return res.json({ 
                    message: 'Bed released and immediately re-assigned to waiting patient',
                    bed: reOccupiedBed,
                    newPatient: allocatedPatient
                });
            }

            return res.json({ message: 'Bed released and is now FREE', bed: result.bed });

        } else {
             // Just a manual status update (e.g. to Maintenance or Occupied manually)
             // Not strictly part of the "Flow" but good for admin.
             // We'll skipping strictly enforcing DSA for manual implementation to keep it simple,
             // or check standard consistency.
             // For now, let's assume this endpoint is primarily for discharging/releasing.
             res.status(400).json({ message: "Use this endpoint to release (FREE) a bed." });
        }

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
