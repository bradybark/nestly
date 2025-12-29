// api/shorten.js
export default async function handler(req, res) {
    const { url } = req.query;

    if (!url) {
        return res.status(400).json({ error: 'URL is required' });
    }

    try {
        // We fetch directly from TinyURL. 
        // Since this code runs on the server, there are no CORS issues.
        const tinyRes = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`);
        
        if (!tinyRes.ok) {
            throw new Error('TinyURL failed');
        }

        const shortUrl = await tinyRes.text();
        
        return res.status(200).json({ shortUrl });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to shorten link' });
    }
}