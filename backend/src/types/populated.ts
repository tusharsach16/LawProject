import mongoose from 'mongoose';
import { Iuser } from '../models/User';
import { IAppointment } from '../models/Appointment';

export interface PopulatedUser {
    _id: string;
    name: string;
    email: string;
    profileImageUrl?: string;
}

export interface PopulatedAppointment extends Omit<IAppointment, 'userId' | 'lawyerId'> {
    userId: PopulatedUser;
    lawyerId: PopulatedUser;
}