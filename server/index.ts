import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { handleUpdateProfile, handleGetLoggedInUser, handleUpdateUser, handleChangePassword } from "./routes/profile";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Map Search API proxy route to avoid CORS issues
  app.get("/api/map/search", async (req, res) => {
    try {
      const { search, size = 8 } = req.query;
      
      if (!search) {
        return res.status(400).json({ error: "Search query is required" });
      }

      const apiUrl = `https://api.ninja-map.dollopinfotech.com/api/map/search?search=${encodeURIComponent(search as string)}&size=${size}`;
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }

      const data = await response.json();
      res.json(data);
      
    } catch (error) {
      console.error("Map search proxy error:", error);
      res.status(500).json({ 
        error: "Failed to fetch search results",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Map Reverse Geocoding API proxy route
  app.get("/api/map/reverse-geocoding", async (req, res) => {
    try {
      const { lat, lon, searchTerm } = req.query;
      
      if (!lat || !lon) {
        return res.status(400).json({ error: "Latitude and longitude are required" });
      }

      // Build the API URL with the correct endpoint
      let apiUrl = `https://api.ninja-map.dollopinfotech.com/api/map/reverse-geocoding?lat=${lat}&lon=${lon}`;
      
      // Add searchTerm if provided
      if (searchTerm) {
        apiUrl += `&searchTerm=${encodeURIComponent(searchTerm as string)}`;
      }
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }

      const data = await response.json();
      res.json(data);
      
    } catch (error) {
      console.error("Reverse geocoding proxy error:", error);
      res.status(500).json({ 
        error: "Failed to fetch reverse geocoding results",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Routing API proxy route to avoid CORS issues
  app.post("/api/map/route", async (req, res) => {
    try {
      const routeRequest = req.body;
      
      if (!routeRequest.from || !routeRequest.to) {
        return res.status(400).json({ error: "From and to locations are required" });
      }

      const apiUrl = "https://api.ninja-map.dollopinfotech.com/api/map/route";
      
      console.log('Forwarding route request to:', apiUrl);
      console.log('Request payload:', JSON.stringify(routeRequest, null, 2));
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(routeRequest)
      });

      const responseText = await response.text();
      
      if (!response.ok) {
        console.error("Routing API error response:", {
          status: response.status,
          statusText: response.statusText,
          body: responseText
        });
        return res.status(response.status).json({ 
          error: "Routing API error",
          message: responseText || `API responded with status: ${response.status}`
        });
      }

      try {
        const data = JSON.parse(responseText);
        res.json(data);
      } catch (parseError) {
        console.error("Failed to parse response:", parseError);
        res.status(500).json({ 
          error: "Failed to parse routing response",
          message: "Invalid JSON response from routing API"
        });
      }
      
    } catch (error) {
      console.error("Routing proxy error:", error);
      res.status(500).json({ 
        error: "Failed to calculate route",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    res.json({ message: "Hello from Express server v2!" });
  });

  app.get("/api/demo", handleDemo);

  // Profile API routes
  app.get("/api/users/get-loggedIn-user", handleGetLoggedInUser);
  app.put("/api/users/profile", handleUpdateProfile);
  app.put("/api/users/update", handleUpdateUser);
  app.post("/api/users/change-password", handleChangePassword);

  return app;
}
