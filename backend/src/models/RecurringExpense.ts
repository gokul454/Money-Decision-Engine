import mongoose, { Document, Schema } from 'mongoose';

export interface IRecurringExpense extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  name: string;
  amount: number;
  frequency: 'monthly' | 'weekly' | 'yearly';
  nextDueDate: Date;
  category: string;
  icon?: string;
  isAutoPaid?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const RecurringExpenseSchema = new Schema<IRecurringExpense>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true },
    amount: { type: Number, required: true },
    frequency: { type: String, enum: ['monthly', 'weekly', 'yearly'], default: 'monthly' },
    nextDueDate: { type: Date, required: true },
    category: { type: String, default: 'Bills & Utilities' },
    icon: { type: String, default: 'FileText' },
    isAutoPaid: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const RecurringExpense = mongoose.model<IRecurringExpense>('RecurringExpense', RecurringExpenseSchema);
