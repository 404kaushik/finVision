import axios from 'axios';

interface WebImage {
  id: string;
  alt: string;
  url: string;
  link: string;
  thumb: string;
}

export async function getWebImages(searchQuery: string): Promise<WebImage[]> {
  try {
    // DuckDuckGo Instant Answer API
    const response = await axios.get('https://api.duckduckgo.com/', {
      params: {
        q: `${searchQuery} images`,
        format: 'json',
        no_html: 1,
        skip_disambig: 1,
        t: 'finance_research_app', // Add a user agent
      }
    });

    console.log('DuckDuckGo API Response:', response.data); // Debug log

    // Check if we have AbstractSource or Image in the response
    let images: WebImage[] = [];

    // Try to get images from AbstractSource
    if (response.data.AbstractSource) {
      images.push({
        id: 'ddg-abstract',
        alt: response.data.Abstract || searchQuery,
        url: response.data.AbstractSource,
        link: response.data.AbstractURL || `https://duckduckgo.com/?q=${encodeURIComponent(searchQuery)}`,
        thumb: response.data.AbstractSource
      });
    }

    // Try to get images from RelatedTopics
    if (response.data.RelatedTopics && Array.isArray(response.data.RelatedTopics)) {
      const relatedImages = response.data.RelatedTopics
        .filter((topic: any) => topic.Image || topic.Icon?.URL)
        .map((topic: any, index: number) => ({
          id: `ddg-related-${index}`,
          alt: topic.Text || searchQuery,
          url: topic.Image || topic.Icon.URL,
          link: topic.FirstURL || `https://duckduckgo.com/?q=${encodeURIComponent(searchQuery)}`,
          thumb: topic.Image || topic.Icon.URL
        }));

      images = [...images, ...relatedImages];
    }

    // If no images found, try to get from Results
    if (images.length === 0 && response.data.Results && Array.isArray(response.data.Results)) {
      const resultImages = response.data.Results
        .filter((result: any) => result.Image)
        .map((result: any, index: number) => ({
          id: `ddg-result-${index}`,
          alt: result.Text || searchQuery,
          url: result.Image,
          link: result.FirstURL || `https://duckduckgo.com/?q=${encodeURIComponent(searchQuery)}`,
          thumb: result.Image
        }));

      images = [...images, ...resultImages];
    }

    // If still no images, try to get from Image
    if (images.length === 0 && response.data.Image) {
      images.push({
        id: 'ddg-main',
        alt: response.data.Heading || searchQuery,
        url: response.data.Image,
        link: response.data.AbstractURL || `https://duckduckgo.com/?q=${encodeURIComponent(searchQuery)}`,
        thumb: response.data.Image
      });
    }

    console.log('Extracted Images:', images); // Debug log

    return images;
  } catch (error) {
    console.error('Error fetching web images:', error);
    if (axios.isAxiosError(error)) {
      console.error('Axios error details:', {
        status: error.response?.status,
        data: error.response?.data,
        headers: error.response?.headers
      });
    }
    return [];
  }
}