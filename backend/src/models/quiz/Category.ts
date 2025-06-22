import mongoose, { Schema, Document } from 'mongoose';

export interface ICategory extends Document {
  slug: string;            // "criminal"
  title: string;           // "Criminal Law"
}

const categorySchema = new Schema<ICategory>({
  slug:  { type: String, required: true, unique: true },
  title: { type: String, required: true }
});

export const Category = mongoose.model<ICategory>('Category', categorySchema);
