import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'A Thyme to Heal - Natural Herbal Remedies & Wellness',
    short_name: 'A Thyme to Heal',
    description: 'Your trusted source for natural herbal remedies and wellness solutions',
    start_url: '/',
    display: 'standalone',
    background_color: '#f0e9d2',
    theme_color: '#023020',
    icons: [
      {
        src: '/images/favicon.jpg',
        sizes: 'any',
        type: 'image/jpeg',
      },
    ],
  }
}
