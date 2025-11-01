import axios, { AxiosInstance } from 'axios';

export const AP2_BLUESKY="11609"
export const AP2_TWITTER="11494"

export const LV_FACEBOOK="11491"
export const LV_TWITTER="11490"
export const LV_INSTAGRAM="11487"

export const TVF_FACEBOOK="11493"
export const TVF_TWITTER="11492"
export const TVF_INSTAGRAM="11489"
export const TVF_TIKTOK="32284"

export const BARGPT_FACEBOOK="11492"
export const BARGPT_TWITTER="11491"
export const BARGPT_INSTAGRAM="11488"

export const AP2_SOCIAL_ACCOUNTS=[AP2_BLUESKY, AP2_TWITTER]
export const LV_SOCIAL_ACCOUNTS=[LV_FACEBOOK, LV_TWITTER, LV_INSTAGRAM]
export const TVF_SOCIAL_ACCOUNTS=[TVF_FACEBOOK, TVF_TWITTER, TVF_INSTAGRAM]
export const TVF_VIDEO_SOCIAL_ACCOUNTS=[TVF_TIKTOK, TVF_INSTAGRAM]
export const BARGPT_SOCIAL_ACCOUNTS=[BARGPT_FACEBOOK, BARGPT_TWITTER, BARGPT_INSTAGRAM]

interface PostBridgeConfig {
  apiKey: string;
  baseURL?: string;
}

interface PostBridgeResponse<T> {
  data: T;
  status: number;
  message?: string;
}

export class PostBridgeUtil {
  private client: AxiosInstance;
  private apiKey: string;

  constructor(config: PostBridgeConfig) {
    this.apiKey = config.apiKey;
    this.client = axios.create({
      baseURL: config.baseURL || 'https://api.post-bridge.com',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
    });
  }

  // Get all posts
  async getPosts(params?: {
    page?: number;
    limit?: number;
    sort?: string;
    filter?: Record<string, any>;
  }): Promise<PostBridgeResponse<any>> {
    try {
      const response = await this.client.get('/posts', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get a single post by ID
  async getPostById(postId: string): Promise<PostBridgeResponse<any>> {
    try {
      const response = await this.client.get(`/posts/${postId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Create a new post
  async createPost(postData: {
    caption: string;
    media?: string[]; // Array of media_ids
    social_accounts: string[]; // Array of social account IDs
    scheduled_at?: Date;
  }): Promise<PostBridgeResponse<any>> {
    try {
      // If no scheduled_at is provided, schedule for 1 hour from now
      const scheduledAt = postData.scheduled_at || (() => {
        const date = new Date();
        date.setHours(date.getHours() + 1);
        return date;
      })();

      const finalPostData = {
        caption: postData.caption,
        media: postData.media || [],
        social_accounts: postData.social_accounts.map(Number),
        scheduled_at: scheduledAt.toISOString()
      }

      console.log(finalPostData)

      const response = await this.client.post('/v1/posts', finalPostData);

      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }



  // Get social accounts
  async getSocialAccounts(params?: {
    page?: number;
    limit?: number;
    sort?: string;
    filter?: {
      platform?: string;
      status?: string;
      [key: string]: any;
    };
  }): Promise<PostBridgeResponse<any>> {
    try {
      const response = await this.client.get('/v1/social-accounts', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Upload file from URL
  async uploadFileFromUrl(fileUrl: string, options?: {
    name?: string;
    mime_type?: string;
  }): Promise<PostBridgeResponse<any>> {
    try {
      // Step 1: Fetch the file from the URL to get its size and content
      const fileResponse = await fetch(fileUrl);
      const fileArrayBuffer = await fileResponse.arrayBuffer();
      const fileSize = fileArrayBuffer.byteLength;
      
      // Step 2: Request an upload URL
      const mediaResponse = await this.client.post('/v1/media/create-upload-url', {
        name: options?.name || 'uploaded-file.png',
        mime_type: options?.mime_type || 'image/png',
        size_bytes: fileSize
      });
      console.log("File size: " + fileSize);

      const { media_id, upload_url } = mediaResponse.data;

      const fileBuffer = Buffer.from(fileArrayBuffer);

      const fileUploadResponse = await fetch(upload_url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'image/jpeg',
        },
        body: fileBuffer,
      });

      if (!fileUploadResponse) {
        throw new Error(`Failed to upload file: ${upload_url}`);
      }

      const fileUploadResponseJson = await fileUploadResponse.json();

      console.log("File Upload Response: " + fileUploadResponseJson);


      // Return the media data with its ID and status
      return {
        data: {
          media_id: media_id,
          fileResponse: fileUploadResponseJson,
          status: 'OK'
        },
        status: 200
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Error handling helper
  private handleError(error: any): Error {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      throw new Error(`PostBridge API Error: ${error.response.data.message || error.message}`);
    } else if (error.request) {
      // The request was made but no response was received
      throw new Error('No response received from PostBridge API');
    } else {
      // Something happened in setting up the request that triggered an Error
      throw new Error(`Error setting up request: ${error.message}`);
    }
  }
}


/*

data": [
    {
      "id": 11971,
      "platform": "tiktok",
      "username": "LegallyVibing.com"
    },
    {
      "id": 11609,
      "platform": "bluesky",
      "username": "ApSquared"
    },
    {
      "id": 11604,
      "platform": "tiktok",
      "username": "BarGPT"
    },
    {
      "id": 11495,
      "platform": "twitter",
      "username": "BarGPT"
    },
    {
      "id": 11494,
      "platform": "twitter",
      "username": "APSquaredDev"
    },
    {
      "id": 11493,
      "platform": "facebook",
      "username": "TV Food Maps"
    },
    {
      "id": 11492,
      "platform": "facebook",
      "username": "Bar GPT"
    },
    {
      "id": 11491,
      "platform": "facebook",
      "username": "Legally Vibing"
    },
    {
      "id": 11490,
      "platform": "twitter",
      "username": "VibingLegally"
    },
    {
      "id": 11489,
      "platform": "instagram",
      "username": "tvfoodmaps"
    },
    {
      "id": 11488,
      "platform": "instagram",
      "username": "bar_gpt"
    },
    {
      "id": 11487,
      "platform": "instagram",
      "username": "legallyvibing"
    }
  ],

  */

  /*

  {
  "media_id": "93115c00-e1f0-4a2e-a127-a657993dddbf",
  "upload_url": "https://supabase.post-bridge.com/storage/v1/object/upload/sign/post_media/004bfdd1-c7df-413d-a18f-aa449f3ff13c/59b2a0abced0920fef9e8e33.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV85ODQ0ZmQ1My1mZmIzLTQ1NDktYWE5Mi04NDg4MDNmYjlmMjgiLCJhbGciOiJIUzI1NiJ9.eyJvd25lciI6IjAwNGJmZGQxLWM3ZGYtNDEzZC1hMThmLWFhNDQ5ZjNmZjEzYyIsInVybCI6InBvc3RfbWVkaWEvMDA0YmZkZDEtYzdkZi00MTNkLWExOGYtYWE0NDlmM2ZmMTNjLzU5YjJhMGFiY2VkMDkyMGZlZjllOGUzMy5wbmciLCJ1cHNlcnQiOmZhbHNlLCJpYXQiOjE3NDkzMzM5MzcsImV4cCI6MTc0OTM0MTEzN30.tZ_xLEFjAInsQfZfZn5t7r3M0l6WnNiyeVfyBqAlziQ",
  "name": "file.png"
}

  */