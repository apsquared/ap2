import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge'


export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);

    if (!searchParams.get('title')){
      return generateErrorImage("Required Parameter title missing.")
    }

    if (!searchParams.get('image')){
      return generateErrorImage("Required Parameter image missing.")
    }

    const title = searchParams.get('title') as string;
    let desc = searchParams.get('summary') as string;
    const imgurl = searchParams.get('image') as string;
    let fitParam = searchParams.get('fit');
    
    if (!desc || desc=='undefined'){
        desc = ""
    }

    type fitStyle='contain' | 'cover' | 'fill' | 'none' | 'scale-down';

    let fit:fitStyle = 'cover';

    if (fitParam && (fitParam=='cover' || fitParam=='contain')){
        fit = fitParam
    }
    
    return new ImageResponse(
        (
         
            <div 
            style={{
              height: "100%",
              width: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 600,
              color: "white",
              backgroundColor: "black",
              padding:0,
              margin:0,
             }}
          >
            <img
     
              src={imgurl}
              alt=""
              style={{
                width: "100%",
                height: "100%",
                objectFit: `${fit}`,
                objectPosition: "center",
              }}
            />
   
 
            <div style={{
                borderRadius: '6px',
                fontWeight: 600,
                display: 'flex',
                flexDirection: "column",
                color: "white",
                position: "absolute",
                bottom: 110,
                left: 80,
                margin: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                padding: "5px"
            }}> 

            <h1
              style={{
                display:'block',
                fontSize: 70,
                fontFamily: "NYT Cheltenham",
                maxWidth: 900,
                whiteSpace: "pre-wrap",
                letterSpacing: -1,
                margin:0,
                padding:0,

              }}
            >
              {title}
            
            </h1>
            <h2
                style={{
                fontWeight: 600,
                color: "white",
                display:'block',
                fontSize: 40,
                fontFamily: "NYT Cheltenham",
                maxWidth: 900,
                whiteSpace: "pre-wrap",
                letterSpacing: -1,
                margin:0,
                padding:0,
                }}>
                    {desc}
             </h2>

          </div>

          </div> 
          
        ),
        {
          width: 1200,
          height: 630,

        },
      );
    

} 

function generateErrorImage(message:string):ImageResponse{
  return new ImageResponse(
    (
      <div 
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 600,
        color: "white",
        backgroundColor: "black",
        padding:0,
        margin:0,
       }}>
        <h1>{message}</h1>
      </div>
    )
  );
}