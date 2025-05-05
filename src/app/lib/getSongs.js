//function to get all songs
export async function getSongs() {
    try {
      const response = await fetch('/api/songs', { 
        cache: 'no-store' // or use revalidation as needed
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch songs');
      }
      
      const data = await response.json();
      return data.songs || [];
    } catch (error) {
      console.error('Error fetching songs:', error);
      return [];
    }
  }
  