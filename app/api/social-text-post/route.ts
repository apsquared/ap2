import { AP2_BLUESKY,AP2_TWITTER, PostBridgeUtil } from "@/utils/postbridgeutil";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';
export const maxDuration = 90;

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { caption, scheduledAt } = body;

        if (!caption) {
            return NextResponse.json(
                { error: 'caption are required' },
                { status: 400 }
            );
        }

        const postBridge = new PostBridgeUtil({
            apiKey: ''
        });


        const post = await postBridge.createPost({
            caption,
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