import { MetadataRoute } from 'next'

export const dynamic = 'force-static';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'DataLink Parañaque',
    short_name: 'DataLink PQ',
    description: 'Professional Real Property Land Data Processor for Parañaque City.',
    start_url: '/',
    display: 'standalone',
    background_color: '#f9fafb',
    theme_color: '#22c55e',
    icons: [
      {
        src: "/favicon.svg",
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any'
      },
    ],
  }
}
