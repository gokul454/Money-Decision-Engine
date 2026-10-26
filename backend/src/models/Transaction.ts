import mongoose, { Document, Schema } from 'mongoose';

export interface ITransaction extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  type: 'expense' | 'income' | 'transfer';
  amount: number;
  category: string;
  description: string;
  merchant?: string;
  paymentMethod: 'UPI' | 'Card' | 'Cash' | 'NetBanking';
  transactionDate: Date;
  notes?: string;
  isImpulse?: boolean;
  timeOfDay?: string; // e.g. "13:30", "21:45"
  createdAt: Date;
  updatedAt: Date;
}

const TransactionSchema = new Schema<ITransaction>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, enum: ['expense', 'income', 'transfer'], required: true, default: 'expense' },
    amount: { type: Number, required: true },
    category: { type: String, required: true, default: 'Other' },
    description: { type: String, required: true, trim: true },
    merchant: { type: String, trim: true },
    paymentMethod: { type: String, enum: ['UPI', 'Card', 'Cash', 'NetBanking'], default: 'UPI' },
    transactionDate: { type: Date, required: true, default: Date.now, index: true },
    notes: { type: String, default: '' },
    isImpulse: { type: Boolean, default: false },
    timeOfDay: { type: String, default: '' },
  },
  { timestamps: true }
);

TransactionSchema.index({ userId: 1, transactionDate: -1 });
TransactionSchema.index({ userId: 1, category: 1 });
TransactionSchema.index({ userId: 1, type: 1 });

export const Transaction = mongoose.model<ITransaction>('Transaction', TransactionSchema);
