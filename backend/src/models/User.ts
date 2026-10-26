import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  passwordHash: string;
  currency: string;
  avatarUrl?: string;
  levelTitle?: string;
  theme?: 'dark' | 'light';
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    currency: { type: String, default: 'INR' },
    avatarUrl: { type: String, default: '' },
    levelTitle: { type: String, default: 'Level 2 Money Smart' },
    theme: { type: String, enum: ['dark', 'light'], default: 'dark' },
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>('User', UserSchema);
