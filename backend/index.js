import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";

// Configure AWS S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const bucketName = process.env.S3_BUCKET_NAME || "revival-records";
  
  try {
    // Optional: Filter by file type using prefix/suffix
    const params = {
      Bucket: bucketName,
      MaxKeys: 1000, // Adjust based on your needs
    };
    
    // Add optional filters
    if (req.query.prefix) {
      params.Prefix = req.query.prefix;
    }
    
    const command = new ListObjectsV2Command(params);
    const data = await s3Client.send(command);
    
    // Extract filenames and filter for audio files
    const audioFiles = data.Contents
      .map(item => item.Key)
      .filter(filename => 
        /\.(mp3|wav|ogg|flac|m4a)$/i.test(filename)
      );
    
    return res.status(200).json({ songs: audioFiles });
  } catch (error) {
    console.error('Error fetching songs from S3:', error);
    return res.status(500).json({ 
      message: 'Error fetching songs',
      error: error.message 
    });
  }
}