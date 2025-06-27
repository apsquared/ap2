import { AP2_BLUESKY,AP2_TWITTER, PostBridgeUtil } from "@/utils/postbridgeutil";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';
export const maxDuration = 90;

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { fileUrl, caption, scheduledAt } = body;

        if (!fileUrl || !caption) {
            return NextResponse.json(
                { error: 'fileUrl and caption are required' },
                { status: 400 }
            );
        }

        const postBridge = new PostBridgeUtil({
            apiKey: '3ZTgbYjzw4wED3y8AiQapuNB'
        });

        const media = await postBridge.uploadFileFromUrl(fileUrl, {
            name: 'uploaded-filed.png'
        });
        console.log(media);
        const media_id = media.data.media_id;

        const post = await postBridge.createPost({
            caption,
            media: [media_id],
            social_accounts: [AP2_BLUESKY, AP2_TWITTER],
            scheduled_at: scheduledAt ? new Date(scheduledAt) : new Date(Date.now() + 6 * 60 * 1000)
        });

        return NextResponse.json(post);
    } catch (error) {
        console.error('Error creating social post:', error);
        return NextResponse.json(
            { error: 'Failed to create social post' },
            { status: 500 }
        );
    }
}