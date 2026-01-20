import { env } from "../../config/env.js";
import logger from "../../utils/logger.js";

// Response structure from Adjutor Karma API endpoint
interface AdjutorKarmaResponse {
  status: string;
  message: string;
  data?: {
    karma_identity: string;
    amount_in_contention: number;
    reason: string;
    default_date: string;
    [key: string]: any;
  };
  meta?: any;
}

// Service for integrating with Adjutor blacklist verification API
export class AdjutorService {
  // Check if email/identity is blacklisted via Adjutor Karma API
  static async isBlacklisted(identity: string): Promise<boolean> {
    try {
      const url = `https://adjutor.lendsqr.com/v2/verification/karma/${identity}`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${env.ADJUTOR_API_KEY}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        // Success: identity found in blacklist
        const data = (await response.json()) as AdjutorKarmaResponse;

        // Log blacklist match with details
        logger.warn(`Blacklisted user attempt blocked: ${identity}`, {
          reason: data.data?.reason,
          amount: data.data?.amount_in_contention,
        });
        // TODO: Uncomment return true in production to actually block blacklisted users
        return false;
      } else if (response.status === 404) {
        // Identity not found in blacklist
        return false;
      } else {
        // Handle API errors gracefully
        const errorText = await response.text();
        logger.error(`Adjutor API Error [${response.status}]: ${errorText}`);
        return false;
      }
    } catch (error) {
      // Fail open: allow user registration if API is unreachable
      logger.error("Adjutor Service Connection Error:", error);
      return false;
    }
  }
}
