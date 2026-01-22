import { RequestHandler } from "express";
import path from "path";
import { CustomerStoryResponse } from "@shared/api";




export const handleCreateCustomerStory: RequestHandler = (req, res) => {
  try {
    // Extract form data from request body
    const {
      title,
      description,
      category,
      location,
      authorBio,
      authorEmail,
      authorName,
      organisationName
    } = req.body;

    // Get uploaded file info
    const authorProfilePic = req.file;

    // Basic validation
    if (!title || !description || !category || !location || !authorBio || !authorEmail || !authorName || !organisationName) {
      const response: CustomerStoryResponse = {
        success: false,
        message: "All required fields must be provided",
        http: "BAD_REQUEST",
        statusCode: 400
      };
      return res.status(400).json(response);
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(authorEmail)) {
      const response: CustomerStoryResponse = {
        success: false,
        message: "Invalid email format",
        http: "BAD_REQUEST",
        statusCode: 400
      };
      return res.status(400).json(response);
    }

    // Validate category
    const validCategories = ["BUSINESS", "TRANSPORT", "HEALTHCARE", "PERSONAL", "OTHER"];
    if (!validCategories.includes(category.toUpperCase())) {
      const response: CustomerStoryResponse = {
        success: false,
        message: "Invalid category",
        http: "BAD_REQUEST",
        statusCode: 400
      };
      return res.status(400).json(response);
    }

    // Here you would typically save to database
    // For now, we'll just simulate a successful response
    console.log("Customer Story Submission:", {
      title,
      description,
      category: category.toUpperCase(),
      location,
      authorBio,
      authorEmail,
      authorName,
      organisationName,
      authorProfilePic: authorProfilePic ? {
        filename: authorProfilePic.filename,
        originalname: authorProfilePic.originalname,
        size: authorProfilePic.size,
        mimetype: authorProfilePic.mimetype
      } : null,
      submittedAt: new Date().toISOString()
    });

    const response: CustomerStoryResponse = {
      success: true,
      message: "Customer story submitted successfully! We'll review it and get back to you soon.",
      http: "CREATED",
      statusCode: 201
    };

    res.status(201).json(response);
  } catch (error) {
    console.error("Error creating customer story:", error);
    
    const response: CustomerStoryResponse = {
      success: false,
      message: "Internal server error. Please try again later.",
      http: "INTERNAL_SERVER_ERROR",
      statusCode: 500
    };

    res.status(500).json(response);
  }
};