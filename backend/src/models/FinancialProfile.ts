import mongoose, { Document, Schema } from 'mongoose';

export interface IFinancialProfile extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  monthlyIncome: number;
  payday: number; // Day of month (1-31)
  fixedExpenses: number;
  savingsTarget: number;
  emergencyReserve: number;
  currentLiquidBalance: number;
  discretionaryBudgetOverride?: number;
  createdAt: Date;
  updatedAt: Date;
}

const FinancialProfileSchema = new Schema<IFinancialProfile>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    monthlyIncome: { type: Number, required: true, default: 15000 },
    payday: { type: Number, required: true, default: 1 },
    fixedExpenses: { type: Number, required: true, default: 5000 },
    savingsTarget: { type: Number, required: true, default: 2000 },
    emergencyReserve: { type: Number, required: true, default: 2000 },
    currentLiquidBalance: { type: Number, required: true, default: 8420 },
    discretionaryBudgetOverride: { type: Number },
  },
  { timestamps: true }
);

export const FinancialProfile = mongoose.model<IFinancialProfile>('FinancialProfile', FinancialProfileSchema);
