import mongoose, { Document, Schema } from 'mongoose';

export interface ICategory extends Document {
  _id: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId; // null for system defaults
  name: string;
  icon: string;
  color: string;
  type: 'expense' | 'income';
  isDefault: boolean;
  createdAt: Date;
}

const CategorySchema = new Schema<ICategory>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', index: true, default: null },
    name: { type: String, required: true, trim: true },
    icon: { type: String, required: true, default: 'Tag' },
    color: { type: String, default: '#6366f1' },
    type: { type: String, enum: ['expense', 'income'], default: 'expense' },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

CategorySchema.index({ userId: 1, name: 1 });

export const Category = mongoose.model<ICategory>('Category', CategorySchema);
