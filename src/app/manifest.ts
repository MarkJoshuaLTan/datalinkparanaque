import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Data Link Parañaque',
    short_name: 'Data Link PQ',
    description: 'Professional Real Property Land Data Processor for Parañaque City.',
    start_url: '/',
    display: 'standalone',
    background_color: '#f9fafb',
    theme_color: '#22c55e',
    icons: [
      {
        src: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><rect width='24' height='24' rx='6' fill='%2322c55e'/><path d='M12 5c-4.97 0-9 1.34-9 3s4.03 3 9 3 9-1.34 9-3-4.03-3-9-3zM3 8v11c0 1.66 4.03 3 9 3s9-1.34 9-3V8c0 1.66-4.03 3-9 3s-9-1.34-9-3z' fill='white'/></svg>",
        sizes: '192x192',
        type: 'image/svg+xml',
        purpose: 'any'
      },
      {
        src: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><rect width='24' height='24' rx='6' fill='%2322c55e'/><path d='M12 5c-4.97 0-9 1.34-9 3s4.03 3 9 3 9-1.34 9-3-4.03-3-9-3zM3 8v11c0 1.66 4.03 3 9 3s9-1.34 9-3V8c0 1.66-4.03 3-9 3s-9-1.34-9-3z' fill='white'/></svg>",
        sizes: '512x512',
        type: 'image/svg+xml',
        purpose: 'maskable'
      },
    ],
  }
}
