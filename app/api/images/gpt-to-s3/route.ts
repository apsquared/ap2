import { generateImage, generateImageWithInputImages, ImageShape } from "@/utils/gptimageutil";
import { bucketurlpfx, s3folder, uploadBuffer } from "@/utils/s3util";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic'
export const maxDuration = 200;

export async function POST(request: NextRequest) {

    let { prompt, imageUrls, shape } = await request.json();

    if (!imageUrls) {
        imageUrls = [];
    }
 
    if (!prompt || !imageUrls || !shape) {
        return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
    }

    let imgBuffer: Buffer;

    console.log("Image URLs: " + imageUrls);
    console.log("Prompt: " + prompt);
    console.log("Shape: " + shape);

    if (imageUrls.length < 1) {
        imgBuffer = await generateImage(prompt, shape as ImageShape);
    }
    else {
        imgBuffer = await generateImageWithInputImages(
            prompt,
            imageUrls,
            shape as ImageShape
        );
    }

    const randomString = Math.random().toString(36).substring(2, 10);
    const key = s3folder + "/" + randomString + ".png";

    const url = await uploadBuffer(imgBuffer, key); 
    const imageurl = bucketurlpfx + key;

    console.log("Image URL: " + imageurl);

    return NextResponse.json({ imageurl });
}