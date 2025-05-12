import axios, { AxiosError } from "axios"

export const getCompanyImages = async (companyName: string) => {
  const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY
  try {
    const res = await axios.get("https://api.unsplash.com/search/photos", {
      params: {
        query: companyName,
        per_page: 5,
      },
      headers: {
        Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
      },
    })

    return res.data.results.map((img: any) => ({
      id: img.id,
      alt: img.alt_description || companyName,
      url: img.urls.regular,
      link: img.links.html,
    }))
  } catch (err: unknown) {
    if (err instanceof AxiosError) {
      console.error("Error fetching images:", err.response?.data || err.message)
    } else {
      console.error("Error fetching images:", err)
    }
    return []
  }
}