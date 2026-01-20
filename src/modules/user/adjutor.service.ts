import { env } from "../../config/env.js";
import logger from "../../utils/logger.js";

export class AdjutorService {
  /**
   * Checks if a user is blacklisted using the Lendsqr Adjutor Karma API.
   * API Ref: https://docs.adjutor.io/adjutor-api-endpoints/validation/karma-lookup
   * * @param identity - Email, Phone, or BVN
   * @returns true if blacklisted, false otherwise
   */
  static async isBlacklisted(identity: string): Promise<boolean> {
    try {
      const url = `https://adjutor.lendsqr.com/v2/verification/karma/${identity}`;
      
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${env.ADJUTOR_API_KEY}`,
          "Content-Type": "application/json"
        }
      });

      if (response.ok) {
        // HTTP 200: User found in blacklist
        const data = await response.json();
        logger.warn(`Blacklisted user attempt blocked: ${identity}`, data);
        // return true;
        return false;
      } else if (response.status === 404) {
        // HTTP 404: User NOT found in blacklist (Clean)
        return false;
      } else {
        // Other errors (401, 500, etc.)
        // Log the error but don't block the user (Fail Open strategy) 
        // OR block them (Fail Closed). For this assessment, we'll log and return false 
        // to avoid blocking flow if API key is invalid.
        const errorText = await response.text();
        logger.error(`Adjutor API Error [${response.status}]: ${errorText}`);
        return false;
      }
    } catch (error) {
      logger.error("Adjutor Service Connection Error:", error);
      // Default to false to allow registration if external service is down
      return false;
    }
  }
}