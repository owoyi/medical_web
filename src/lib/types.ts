export type Category =
  | "plastic-surgery"
  | "dermatology"
  | "dentistry"
  | "orthopedics"
  | "checkup";

export interface Hospital {
  id: string;
  name: string;
  nameKo: string;
  category: Category;
  city: string;
  district: string;
  rating: number;
  reviewCount: number;
  priceFrom: number;
  image: string;
  description: string;
  descriptionKo: string;
  languages: string[];
  certifications: string[];
  doctors: Doctor[];
  treatments: Treatment[];
  // Compatibility — which support services this hospital works with.
  // Empty array = ALL allowed (backwards compat). Explicit IDs = only those.
  allowedInterpreters?: string[]; // interpreter IDs
  allowedHotels?: string[];
  allowedVehicles?: string[];
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  experience: number;
  avatar: string;
  bio: string;
}

export interface Treatment {
  id: string;
  name: string;
  nameKo: string;
  duration: string;
  price: number;
}

export interface Interpreter {
  id: string;
  name: string;
  language: string;
  flag: string;
  pricePerDay: number;
  rating: number;
  experience: number;
  medical: boolean;
}

export interface Hotel {
  id: string;
  name: string;
  district: string;
  stars: number;
  pricePerNight: number;
  image: string;
  amenities: string[];
}

export interface Vehicle {
  id: string;
  name: string;
  type: "sedan" | "van" | "suv";
  capacity: number;
  pricePerDay: number;
  image: string;
}

export type Role = "user" | "admin" | "hospital_manager" | "interpreter_manager" | "hotel_manager" | "vehicle_manager";

export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  country: string;
  role: Role;
  createdAt: string;
  // For hospital_manager: which hospital IDs they can manage
  managedHospitalIds?: string[];
  // For interpreter/hotel/vehicle manager: which resource IDs
  managedInterpreterIds?: string[];
  managedHotelIds?: string[];
  managedVehicleIds?: string[];
}

export type BookingStatus = "pending" | "confirmed" | "in-progress" | "completed" | "cancelled";

export interface Booking {
  id: string;
  createdAt: string;
  status: BookingStatus;
  userId: string;
  patient: {
    name: string;
    email: string;
    country: string;
    phone: string;
  };
  hospitalId: string;
  hospitalName: string;
  treatmentId: string;
  treatmentName: string;
  date: string;
  interpreterId?: string;
  interpreterName?: string;
  hotelId?: string;
  hotelName?: string;
  vehicleId?: string;
  vehicleName?: string;
  total: number;
}
