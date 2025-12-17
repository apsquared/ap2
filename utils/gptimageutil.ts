import fs from "fs";
import OpenAI, { toFile } from "openai";
import https from "https";
import path from "path";

const openai = new OpenAI();

const quality: "auto" | "high" | "low" | "standard" | "medium" = "high"


export enum ImageShape {
    PORTRAIT = "1024x1536",
    LANDSCAPE = "1536x1024",
    SQUARE = "1024x1024"
}



export const generateImage = async (prompt: string,shape:ImageShape=ImageShape.SQUARE): Promise<Buffer> => {
    const img = await openai.images.generate({
        model: "gpt-image-1.5",
        prompt: prompt,
        n: 1,
        size: shape as any,
        quality: quality,
        moderation: 'low'
      });

      if (!img.data || !img.data[0] || !img.data[0].b64_json) {
        throw new Error("No image data returned from OpenAI");
      }

      const imageBuffer = Buffer.from(img.data[0].b64_json, "base64");
      return imageBuffer;
}

export const generateImageWithInputImages = async (prompt: string, inputImages: string | string[],shape:ImageShape=ImageShape.SQUARE) => {
  const getFilename = (inputPathOrUrl: string): string => {
    try {
      if (inputPathOrUrl.startsWith('https://')) {
        const url = new URL(inputPathOrUrl);
        const pathname = url.pathname;
        return path.basename(pathname) || `image_${Date.now()}.png`;
      } else {
        return path.basename(inputPathOrUrl);
      }
    } catch (e) {
      return `image_${Date.now()}.png`;
    }
  }

  const processInput = (input: string) => {
    return new Promise(async (resolve, reject) => {
      const filename = getFilename(input);
      const mimeType = "image/png";

      if (input.startsWith('https://')) {
        const options = {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
            'Sec-Fetch-Dest': 'image',
            'Sec-Fetch-Mode': 'no-cors',
            'Sec-Fetch-Site': 'cross-site',
            'DNT': '1'
          }
        };

        https.get(input, options, (response) => {
          if (!(response.statusCode && response.statusCode >= 200 && response.statusCode < 300)) {
            return reject(new Error(`Failed to get '${input}', status code: ${response.statusCode} ${response.statusMessage}`));
          }
          const chunks: Uint8Array[] = [];
          response.on('data', (chunk) => chunks.push(chunk));
          response.on('end', async () => {
            try {
              const buffer = Buffer.concat(chunks);
              const fileObject = await toFile(buffer, filename, { type: mimeType });
              resolve(fileObject);
            } catch (err) {
                reject(err);
            }
          });
          response.on('error', reject);
        }).on('error', reject);
      } else {
        try {
            const fileStream = fs.createReadStream(input);
            fileStream.on('error', reject);
            const fileObject = await toFile(fileStream, filename, { type: mimeType });
            resolve(fileObject);
        } catch (err) {
            reject(err);
        }
      }
    });
  };

  console.log("Getting images and preparing files...");
  let imageInputPromises /*: Promise<FileLike>[]*/;

  if (Array.isArray(inputImages)) {
    imageInputPromises = inputImages.map(processInput);
  } else {
    imageInputPromises = [processInput(inputImages)];
  }

  // Type as any[] to simplify due to potential type resolution issues
  const preparedImages: any[] = await Promise.all(imageInputPromises);
  console.log("Prepared image files:", preparedImages.map((f: any) => f?.name || 'unknown'));

  console.log("AI image generation");
  const img = await openai.images.edit({
    image: preparedImages,
    prompt: prompt,
    model: "gpt-image-1.5",
    n: 1,
    quality: quality,
    size: shape as any,
  });
  console.log("AI image generation done");
  if (!img.data || !img.data[0] || !img.data[0].b64_json) {
    throw new Error("No image data returned from OpenAI");
  }

  const imageBuffer = Buffer.from(img.data[0].b64_json as string, "base64");
  return imageBuffer;
}