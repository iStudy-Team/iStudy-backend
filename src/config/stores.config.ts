import ImageKit from 'imagekit';

if (
    !process.env.IMAGEKIT_PUBLIC ||
    !process.env.IMAGEKIT_PRIVATE ||
    !process.env.IMAGEKIT_URL
) {
    throw new Error(
        'ImageKit configuration is missing. Please set IMAGEKIT_PUBLIC, IMAGEKIT_PRIVATE, and IMAGEKIT_URL environment variables.'
    );
}

export const store = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC,
    privateKey: process.env.IMAGEKIT_PRIVATE,
    urlEndpoint: process.env.IMAGEKIT_URL,
});
