import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3"; // official s3 sdk

export async function GET(req) {
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
      return new Response(
        JSON.stringify({ message: "Missing AWS credentials" }),
        { status: 500 }
      );
    }

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

    const audioFiles = (data.Contents || [])
      .map(item => item.Key)
      .filter(key => /\.(mp3|wav|ogg|flac|m4a)$/i.test(key));

    return new Response(
      JSON.stringify({
        songs: audioFiles,
        totalFiles: data.Contents?.length || 0,
        audioFilesCount: audioFiles.length
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching songs from S3:", error);
    return new Response(
      JSON.stringify({
        message: "Error fetching songs from S3",
        error: error.message
      }),
      { status: 500 }
    );
  }
}
