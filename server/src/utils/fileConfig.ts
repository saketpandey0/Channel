import multer from "multer";
import path from 'path';
import prisma from "../db"
import { Request, Response } from "express";




const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = file.mimetype.startsWith('image/') ? 'uploads/images/' : 'uploads/videos/';
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type') as any, false);
    }
  }
});


export default {storage, upload};