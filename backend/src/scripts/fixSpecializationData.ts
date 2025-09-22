import mongoose from 'mongoose';
import { Lawyer } from '../models/Lawyer';
import { LawStudent } from '../models/LawStudent';
import dotenv from 'dotenv';

dotenv.config();

const validSpecializations = [
  "Civil Law", "Criminal Law", "Corporate Law", "Family Law",
  "Intellectual Property", "Real Estate Law", "Tax Law", 
  "Immigration Law", "Labor Law", "Environmental Law"
];

const mapping: { [key: string]: string } = {
  "Criminal": "Criminal Law",
  "Civil": "Civil Law", 
  "Corporate": "Corporate Law",
  "Family": "Family Law",
  "Real Estate": "Real Estate Law",
  "Tax": "Tax Law",
  "Immigration": "Immigration Law",
  "Labor": "Labor Law",
  "Environmental": "Environmental Law"
};

const cleanSpecializationData = (specializations: string[]) => {
  if (!Array.isArray(specializations)) return [];
  
  return specializations.map(spec => {
    if (validSpecializations.includes(spec)) return spec;
    if (mapping[spec]) return mapping[spec];
    return null;
  }).filter(spec => spec !== null) as string[];
};

const fixSpecializationData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL as string);
    console.log('Connected to MongoDB');

    console.log('Fixing Lawyer specializations...');
    const lawyers = await Lawyer.find({});
    let lawyerCount = 0;
    
    for (const lawyer of lawyers) {
      if (lawyer.specialization && lawyer.specialization.length > 0) {
        const cleanedSpecializations = cleanSpecializationData(lawyer.specialization);
        if (JSON.stringify(cleanedSpecializations) !== JSON.stringify(lawyer.specialization)) {
          lawyer.specialization = cleanedSpecializations;
          await lawyer.save();
          lawyerCount++;
          console.log(`Fixed lawyer ${lawyer._id}: ${lawyer.specialization}`);
        }
      }
    }
    
    console.log(`Fixed ${lawyerCount} lawyer records`);

    console.log('Fixing LawStudent areaOfInterest.');
    const students = await LawStudent.find({});
    let studentCount = 0;
    
    for (const student of students) {
      if (student.areaOfInterest && student.areaOfInterest.length > 0) {
        const cleanedInterests = cleanSpecializationData(student.areaOfInterest);
        if (JSON.stringify(cleanedInterests) !== JSON.stringify(student.areaOfInterest)) {
          student.areaOfInterest = cleanedInterests;
          await student.save();
          studentCount++;
          console.log(`Fixed student ${student._id}: ${student.areaOfInterest}`);
        }
      }
    }
    
    console.log(`Fixed ${studentCount} student records`);
    console.log('Specialization data cleanup completed!');
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Error fixing specialization data:', err);
    process.exit(1);
  }
};

fixSpecializationData();
