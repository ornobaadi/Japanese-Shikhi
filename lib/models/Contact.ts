import mongoose, { Schema, Document } from 'mongoose';

export interface IContact extends Document {
  phoneNumber?: string;
  email?: string;
  pageLink?: string;
  facebookLink?: string;
  tiktokLink?: string;
  instagramLink?: string;
  youtubeLink?: string;
  whatsappLink?: string;
  updatedAt: Date;
}

const ContactSchema = new Schema({
  phoneNumber: {
    type: String,
    trim: true,
  },
  email: {
    type: String,
    trim: true,
  },
  pageLink: {
    type: String,
    trim: true,
  },
  facebookLink: {
    type: String,
    trim: true,
  },
  tiktokLink: {
    type: String,
    trim: true,
  },
  instagramLink: {
    type: String,
    trim: true,
  },
  youtubeLink: {
    type: String,
    trim: true,
  },
  whatsappLink: {
    type: String,
    trim: true,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Contact || mongoose.model<IContact>('Contact', ContactSchema);
