import crypto from 'crypto';

export const hashWord = (word) => {
    return crypto.createHash('sha256').update(word).digest('hex');
}
