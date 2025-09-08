import express, { Request, Response } from 'express';
import TelegramLink from '../models/TelegramLink';

const router = express.Router();

// GET /api/telegram-links - Get all telegram links
router.get('/', async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    let query = {};
    if (search) {
      query = {
        $or: [
          { telegram_link: { $regex: search, $options: 'i' } },
          { owner_name: { $regex: search, $options: 'i' } }
        ]
      };
    }

    const telegramLinks = await TelegramLink.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await TelegramLink.countDocuments(query);

    res.json({
      success: true,
      data: telegramLinks,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalItems: total,
        itemsPerPage: limitNum
      }
    });
  } catch (error) {
    console.error('Error fetching telegram links:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch telegram links'
    });
  }
});

// GET /api/telegram-links/owners - Get unique owner names
router.get('/owners', async (req: Request, res: Response) => {
  try {
    const owners = await TelegramLink.distinct('owner_name');
    
    res.json({
      success: true,
      data: owners
    });
  } catch (error) {
    console.error('Error fetching owner names:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch owner names'
    });
  }
});

// GET /api/telegram-links/:id - Get single telegram link
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const telegramLink = await TelegramLink.findById(req.params.id);
    
    if (!telegramLink) {
      return res.status(404).json({
        success: false,
        error: 'Telegram link not found'
      });
    }

    res.json({
      success: true,
      data: telegramLink
    });
  } catch (error) {
    console.error('Error fetching telegram link:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch telegram link'
    });
  }
});

// POST /api/telegram-links - Create new telegram link
router.post('/', async (req: Request, res: Response) => {
  try {
    const { telegram_link, owner_name } = req.body;

    if (!telegram_link || !owner_name) {
      return res.status(400).json({
        success: false,
        error: 'Both telegram_link and owner_name are required'
      });
    }

    // Check if telegram link already exists
    const existingLink = await TelegramLink.findOne({ telegram_link });
    if (existingLink) {
      return res.status(409).json({
        success: false,
        error: 'Telegram link already exists'
      });
    }

    const telegramLink = new TelegramLink({
      telegram_link,
      owner_name
    });

    const savedLink = await telegramLink.save();

    res.status(201).json({
      success: true,
      data: savedLink,
      message: 'Telegram link created successfully'
    });
  } catch (error: any) {
    console.error('Error creating telegram link:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: Object.values(error.errors).map((err: any) => err.message)
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to create telegram link'
    });
  }
});

// PUT /api/telegram-links/:id - Update telegram link
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { telegram_link, owner_name } = req.body;

    if (!telegram_link || !owner_name) {
      return res.status(400).json({
        success: false,
        error: 'Both telegram_link and owner_name are required'
      });
    }

    // Check if telegram link already exists (excluding current record)
    const existingLink = await TelegramLink.findOne({ 
      telegram_link, 
      _id: { $ne: req.params.id } 
    });
    
    if (existingLink) {
      return res.status(409).json({
        success: false,
        error: 'Telegram link already exists'
      });
    }

    const telegramLink = await TelegramLink.findByIdAndUpdate(
      req.params.id,
      { telegram_link, owner_name },
      { new: true, runValidators: true }
    );

    if (!telegramLink) {
      return res.status(404).json({
        success: false,
        error: 'Telegram link not found'
      });
    }

    res.json({
      success: true,
      data: telegramLink,
      message: 'Telegram link updated successfully'
    });
  } catch (error: any) {
    console.error('Error updating telegram link:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: Object.values(error.errors).map((err: any) => err.message)
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to update telegram link'
    });
  }
});

// DELETE /api/telegram-links/:id - Delete telegram link
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const telegramLink = await TelegramLink.findByIdAndDelete(req.params.id);

    if (!telegramLink) {
      return res.status(404).json({
        success: false,
        error: 'Telegram link not found'
      });
    }

    res.json({
      success: true,
      message: 'Telegram link deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting telegram link:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete telegram link'
    });
  }
});

export default router;
