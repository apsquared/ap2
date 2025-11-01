import { PostBridgeUtil } from "@/utils/postbridgeutil";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic';
export const maxDuration = 90;

const POSTBRIDGE_API_KEY = process.env.POSTBRIDGE_API_KEY || '';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        
        // Optional query parameters
        const page = searchParams.get('page');
        const limit = searchParams.get('limit');
        const sort = searchParams.get('sort');
        const platform = searchParams.get('platform');
        const status = searchParams.get('status');

        const postBridge = new PostBridgeUtil({
            apiKey: POSTBRIDGE_API_KEY
        });

        // Build queryParams object if any query params are provided
        const queryParams: any = {};
        if (page) queryParams.page = parseInt(page);
        if (limit) queryParams.limit = parseInt(limit);
        if (sort) queryParams.sort = sort;
        if (platform || status) {
            queryParams.filter = {};
            if (platform) queryParams.filter.platform = platform;
            if (status) queryParams.filter.status = status;
        }

        const socialAccounts = await postBridge.getSocialAccounts(
            Object.keys(queryParams).length > 0 ? queryParams : undefined
        );

        return NextResponse.json(socialAccounts);
    } catch (error) {
        console.error('Error getting social accounts:', error);
        return NextResponse.json(
            { error: 'Failed to get social accounts' },
            { status: 500 }
        );
    }
}

