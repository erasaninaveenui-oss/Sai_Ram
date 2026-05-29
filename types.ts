export interface Student {
  id: string;
  name: string;
  class: string;
  section: string;
  admissionNumber: string;
  fatherName: string;
  phoneNumber: string;
  address: string;
  admissionFee?: number;
  tuitionFee?: number;
  cautionDeposit?: number;
  totalFees?: number;

  // Personal details
  gender?: string;
  dob?: string;
  bloodGroup?: string;
  nationality?: string;
  religion?: string;
  motherTongue?: string;

  // Parent information
  motherName?: string;
  motherPhone?: string;
  fatherOccupation?: string;
  parentEmail?: string;

  // Address breakdown
  street?: string;
  city?: string;
  state?: string;
  pinCode?: string;

  // Transport
  transportMode?: string;
  busRoute?: string;
  pickupPoint?: string;

  // Medical
  allergies?: string;
  medicalConditions?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;

  // Academic data
  prevSchool?: string;
  prevClass?: string;
  prevYear?: string;
  academicRemarks?: string;

  // Improved fee fields
  transportFee?: number;
  activityFee?: number;
  terminalFee?: number;
}

export interface Staff {
  id: string;
  name: string;
  role: string;
  dept: string;
  phoneNumber: string;
  salary: number | string;
}

export interface TimetableEntry {
  id: string;
  class: string;
  section: string;
  day: string;
  period1: string;
  period2: string;
  period3: string;
  period4: string;
  period5: string;
  period6: string;
  period7: string;
  period8: string;
  period9?: string;
}

export interface Visitor {
  id: string;
  name: string;
  reason: string;
  checkIn: string;
  checkOut: string;
}

export interface Expense {
  id: string;
  category: string;
  amount: number | string;
  date: string;
  description: string;
}
