import requests
import json
import time
import sys

def fetch_places(query, api_key, max_pages=20):
    """
    Fetch places data from Google Places API with pagination support
    
    Args:
        query (str): Search query
        api_key (str): Google API key
        max_pages (int): Maximum number of pages to fetch (default 20)
    
    Returns:
        list: Combined results from all pages
    """
    base_url = "https://maps.googleapis.com/maps/api/place/textsearch/json"
    all_results = []
    page_count = 0
    
    # Initial parameters
    params = {
        "query": query,
        "key": api_key
    }
    
    while page_count < max_pages:
        # Make the request
        response = requests.get(base_url, params=params)
        
        # Check if request was successful
        if response.status_code != 200:
            print(f"Error: API request failed with status code {response.status_code}")
            print(response.text)
            break
        
        # Parse the response
        data = response.json()
        
        # Add results to our collection
        if "results" in data:
            all_results.extend(data["results"])
            print(f"Retrieved page {page_count + 1} with {len(data['results'])} results")
        else:
            print("No results found in response")
        
        # Check if there are more pages
        if "next_page_token" in data and data["next_page_token"]:
            # Update parameters for next page
            params = {
                "key": api_key,
                "pagetoken": data["next_page_token"]
            }
            
            # Google requires a delay before using next_page_token
            print("Waiting for next page token to become valid...")
            time.sleep(2)
            page_count += 1
        else:
            print("No more pages available")
            break
    
    return all_results

def main():
    if len(sys.argv) < 3:
        print("Usage: python script.py 'search query' api_key [output_file] [max_pages]")
        sys.exit(1)
    
    # Get parameters from command line
    query = sys.argv[1]
    api_key = sys.argv[2]
    output_file = sys.argv[3] if len(sys.argv) > 3 else "places_results.json"
    max_pages = int(sys.argv[4]) if len(sys.argv) > 4 else 20
    
    print(f"Searching for: {query}")
    print(f"Max pages to fetch: {max_pages}")
    
    # Fetch all results with pagination
    all_results = fetch_places(query, api_key, max_pages)
    
    # Save results to file
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump({"results": all_results}, f, indent=2)
    
    print(f"Retrieved a total of {len(all_results)} results")
    print(f"Results saved to {output_file}")

if __name__ == "__main__":
    main()
