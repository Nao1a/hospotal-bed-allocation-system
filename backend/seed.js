require('dotenv').config();
const mongoose = require('mongoose');
const { BED_STATUS, PATIENT_STATUS, BED_TYPES } = require('./utils/constants');
const Bed = require('./models/Bed.model');
const Patient = require('./models/Patient.model');
const User = require('./models/User.model');
const ActivityLog = require('./models/ActivityLog.model');

// Connect Database
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/hospital-bed-allocation');
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

const seedData = async () => {
    await connectDB();

    try {
        console.log('--- Starting Seeding Process ---');

        // 1. Clear existing data
        await Bed.deleteMany({});
        await Patient.deleteMany({});
        await User.deleteMany({});
        await ActivityLog.deleteMany({});
        console.log('✅ Data Cleared (Beds, Patients, Users, Logs)');

        // 2. Seed Users (Admin & Nurse)
        // Note: We use create() to trigger the pre-save hook for password hashing
        await User.create([
            {
                username: 'admin',
                password: 'password123',
                role: 'ADMIN',
                isApproved: true
            },
            {
                username: 'nurse',
                password: 'password123',
                role: 'NURSE',
                nurseId: 'N-1001',
                isApproved: true
            }
        ]);
        console.log('✅ Users Seeded (admin/password123, nurse/password123)');

        // 3. Seed Beds
        // Strategy: 
        // - 20 total beds
        // - Mix of types
        // - Some occupied, some free
        const beds = [];

        // Helper to generate beds
        const createBeds = (type, count, startId, prefix) => {
            for (let i = 0; i < count; i++) {
                beds.push({
                    bedId: `${prefix}-${startId + i}`,
                    wardNumber: `${prefix}-WARD`,
                    type: type,
                    status: BED_STATUS.FREE // Default to free, updated later
                });
            }
        };

        createBeds(BED_TYPES.ICU, 5, 101, 'ICU');      // ICU-101 to ICU-105
        createBeds(BED_TYPES.EMERGENCY, 5, 101, 'EMG'); // EMG-101 to EMG-105
        createBeds(BED_TYPES.GENERAL, 10, 201, 'GEN');  // GEN-201 to GEN-210

        // Insert Beds
        const createdBeds = await Bed.insertMany(beds);
        console.log(`✅ ${createdBeds.length} Beds Seeded`);

        // 4. Seed Patients & Occupy Beds
        // We will admit some patients and put some in Waiting Queue
        
        const patients = [];

        // Helper to create patient
        const createPatient = (id, name, severity, ward, status, bedId = null) => {
            patients.push({
                patientId: `P-${id}`,
                name: name,
                age: 30 + Math.floor(Math.random() * 50),
                severity: severity,
                requiredWard: ward,
                status: status,
                assignedBedId: bedId,
                arrivalTime: new Date()
            });
        };

        // A. Admitted Patients (Occupying beds)
        // ICU Patients
        createPatient(101, 'John Doe', 9, BED_TYPES.ICU, PATIENT_STATUS.ADMITTED, 'ICU-101');
        await Bed.findOneAndUpdate({ bedId: 'ICU-101' }, { status: BED_STATUS.OCCUPIED });

        createPatient(102, 'Jane Smith', 8, BED_TYPES.ICU, PATIENT_STATUS.ADMITTED, 'ICU-102');
        await Bed.findOneAndUpdate({ bedId: 'ICU-102' }, { status: BED_STATUS.OCCUPIED });

        // Emergency Patients
        createPatient(103, 'Mike Ross', 7, BED_TYPES.EMERGENCY, PATIENT_STATUS.ADMITTED, 'EMG-101');
        await Bed.findOneAndUpdate({ bedId: 'EMG-101' }, { status: BED_STATUS.OCCUPIED });

        // General Ward Patients
        createPatient(201, 'Sarah Connor', 4, BED_TYPES.GENERAL, PATIENT_STATUS.ADMITTED, 'GEN-201');
        await Bed.findOneAndUpdate({ bedId: 'GEN-201' }, { status: BED_STATUS.OCCUPIED });

        createPatient(202, 'Kyle Reese', 3, BED_TYPES.GENERAL, PATIENT_STATUS.ADMITTED, 'GEN-202');
        await Bed.findOneAndUpdate({ bedId: 'GEN-202' }, { status: BED_STATUS.OCCUPIED });

        // B. Waiting Patients (For Priority Queue Testing)
        createPatient(301, 'Waiting High Priority', 10, BED_TYPES.ICU, PATIENT_STATUS.WAITING);
        createPatient(302, 'Waiting Med Priority', 6, BED_TYPES.GENERAL, PATIENT_STATUS.WAITING);
        createPatient(303, 'Waiting Low Priority', 2, BED_TYPES.GENERAL, PATIENT_STATUS.WAITING);

        await Patient.insertMany(patients);
        console.log(`✅ ${patients.length} Patients Seeded (${patients.filter(p => p.status === 'ADMITTED').length} Admitted, ${patients.filter(p => p.status === 'WAITING').length} Waiting)`);

        console.log('--- Seeding Completed Successfully ---');
        process.exit();

    } catch (error) {
        console.error(`❌ Seeding Error: ${error}`);
        process.exit(1);
    }
};

seedData();
