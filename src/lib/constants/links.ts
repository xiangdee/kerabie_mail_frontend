const isDev = (process.env.NEXT_PUBLIC_ENVIRONMENT || '').trim().toLowerCase() === 'development';


export const blackblazebucket = 'https://kerabie-mail.s3.eu-central-003.backblazeb2.com';

export const apiLink = isDev ? 'https://api.local:5000' : 'https://kerabie.email';