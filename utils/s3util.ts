
import { S3Client } from "@aws-sdk/client-s3";
import { PutObjectCommand } from "@aws-sdk/client-s3";

import axios  from 'axios'


//CHANGE OR SET THESE
const AWS_KEY = process.env.S3_AWS_ACCESS_KEY_ID as string
const AWS_SECRET = process.env.S3_AWS_SECRET_ACCESS_KEY as string
const BUCKETNAME = 'heybairtender'
export const bucketurlpfx = "https://heybairtender.s3.amazonaws.com/";
export const s3folder = 'legallyvibing';  //reuse this this value



//console.log("KEY "+AWS_KEY+" SECRET "+AWS_SECRET)



const s3Client = new S3Client(
  { 
   region: 'us-east-1',
   credentials:{ 
    accessKeyId:AWS_KEY,
    secretAccessKey:AWS_SECRET} 
  }
  );

export const downloadAndUpload = async (imageUrl: string, key: string) => {

    const resp = await axios.get(imageUrl, {   
      decompress: false,
      // Ref: https://stackoverflow.com/a/61621094/4050261
      responseType: 'arraybuffer',
    });

  console.log("uploading to s3 : "+key ) 

  const params = {
    Bucket: BUCKETNAME,
    Key: key,
    Body: resp.data,
    ContentType: 'image/png',
  };


  const results = await s3Client.send(new PutObjectCommand(params));
  console.log(JSON.stringify(results));
  if (results && results['$metadata']){
    const code:number = results['$metadata'].httpStatusCode as number;
    if (code==200){
      return true;
    }
    console.log("Non 200 response from AWS "+JSON.stringify(results));
  }

  
  return false;
 } ;

export const uploadBuffer = async (buffer: Buffer, key: string) => {
  console.log("uploading to s3 : "+key ) 

  const params = {
    Bucket: BUCKETNAME,
    Key: key,
    Body: buffer,
    ContentType: 'image/png',
  };


  const results = await s3Client.send(new PutObjectCommand(params));
  console.log(JSON.stringify(results));
  if (results && results['$metadata']){
    const code:number = results['$metadata'].httpStatusCode as number;
    if (code==200){
      return true;
    }
    console.log("Non 200 response from AWS "+JSON.stringify(results));
  }
  return false;
} ;