import { PostBridgeUtil, AP2_SOCIAL_ACCOUNTS, BARGPT_SOCIAL_ACCOUNTS, TVF_SOCIAL_ACCOUNTS, LV_SOCIAL_ACCOUNTS } from "@/utils/postbridgeutil";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';
export const maxDuration = 90;

const POSTBRIDGE_API_KEY = process.env.POSTBRIDGE_API_KEY || '';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { fileUrl, caption, scheduledAt, social_account, minDelay } = body;

        if (!social_account) {
            return NextResponse.json(
                { error: 'social_account are required' },
                { status: 400 }
            );
        }

        if (!fileUrl || !caption) {
            return NextResponse.json(
                { error: 'fileUrl and caption are required' },
                { status: 400 }
            );
        }

        let social_accounts: string[] = [];
        
        if (social_account === "AP2") {
            social_accounts = AP2_SOCIAL_ACCOUNTS;
        } else if (social_account === "LV") {
            social_accounts = LV_SOCIAL_ACCOUNTS;
        } else if (social_account === "TVF") {    
            social_accounts = TVF_SOCIAL_ACCOUNTS;
        } else if (social_account === "BARGPT") {
            social_accounts = BARGPT_SOCIAL_ACCOUNTS;
        }

        const postBridge = new PostBridgeUtil({
            apiKey: POSTBRIDGE_API_KEY
        });

        const media = await postBridge.uploadFileFromUrl(fileUrl, {
            name: 'uploaded-filed.png'
        });
        console.log(media);
        const media_id = media.data.media_id;

        const post = await postBridge.createPost({
            caption,
            media: [media_id],
            social_accounts: social_accounts,
            scheduled_at: scheduledAt ? new Date(scheduledAt) : new Date(Date.now() + (minDelay || 6) * 60 * 1000)
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