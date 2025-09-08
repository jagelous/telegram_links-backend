import mongoose, { Document, Schema } from 'mongoose';

export interface ITelegramLink extends Document {
  telegram_link: string;
  owner_name: string;
  createdAt: Date;
  updatedAt: Date;
}

const TelegramLinkSchema: Schema = new Schema({
  telegram_link: {
    type: String,
    required: [true, 'Telegram link is required'],
    trim: true,
    validate: {
      validator: function(v: string) {
        return /^https?:\/\/(t\.me|telegram\.me)\/.+/.test(v);
      },
      message: 'Please provide a valid Telegram link'
    }
  },
  owner_name: {
    type: String,
    required: [true, 'Owner name is required'],
    trim: true,
    minlength: [2, 'Owner name must be at least 2 characters long'],
    maxlength: [100, 'Owner name cannot exceed 100 characters']
  }
}, {
  timestamps: true
});

// Index for better query performance
TelegramLinkSchema.index({ telegram_link: 1 });
TelegramLinkSchema.index({ owner_name: 1 });

export default mongoose.model<ITelegramLink>('TelegramLink', TelegramLinkSchema);
