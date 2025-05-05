// app/api/songs/route.ts
import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { NextResponse } from 'next/server';


//dynamically get the names for all the songs 
export async function GET(req: Request) {
  try {
    const awsRegion = process.env.AWS_REGION;
    const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
    const bucketName = process.env.S3_BUCKET_NAME;

    if (!awsRegion || !accessKeyId || !secretAccessKey || !bucketName) {
      console.error('Missing AWS configuration:', {
        hasRegion: !!awsRegion,
        hasAccessKey: !!accessKeyId,
        hasSecretKey: !!secretAccessKey,
        hasBucket: !!bucketName
      });
      return NextResponse.json(
        { message: "Missing AWS credentials" },
        { status: 500 }
      );
    }
    
    //auth 
    const s3Client = new S3Client({
      region: awsRegion,
      credentials: {
        accessKeyId,
        secretAccessKey
      }
    });

    const params = {
      Bucket: bucketName,
      MaxKeys: 1000
    };

    const command = new ListObjectsV2Command(params);
    const data = await s3Client.send(command);
  
    
    //map data -> song name
    const audioFiles = (data.Contents || [])
      .map(item => item.Key)
      .filter(key => key && /\.(mp3|wav|ogg|flac|m4a)$/i.test(key))
      .sort(); // Optional: Sort alphabetically
    return NextResponse.json(
      {
        songs: audioFiles,
        totalFiles: data.Contents?.length || 0,
        audioFilesCount: audioFiles.length
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching songs from S3:", error);
    return NextResponse.json(
      {
        message: "Error fetching songs from S3",
        error: (error as Error).message
      },
      { status: 500 }
    );
  }
}