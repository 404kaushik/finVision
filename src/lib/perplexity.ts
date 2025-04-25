import axios from 'axios';

const API_KEY = process.env.PERPLEXITY_API_KEY;

export async function getCompanyResearch(companyName: string) {
  try {
    const res = await fetch('/api/research', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ companyName })
    });
  
    if (!res.ok) throw new Error('Failed to fetch research');
    return res.json();
  }catch{}
}
