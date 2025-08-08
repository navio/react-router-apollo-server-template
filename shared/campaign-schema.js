import { z } from 'zod';
export const baseCampaignSchema = z.object({
    name: z
        .string()
        .min(3, 'Campaign name must be at least 3 characters')
        .max(15, 'Campaign name must not exceed 15 characters')
        .regex(/^[a-zA-Z0-9\s]+$/, 'Campaign name can only contain letters, numbers, and spaces')
        .trim(),
    budget: z
        .number()
        .min(10, 'Budget must be at least $10')
        .max(1000, 'Budget cannot exceed $1000'),
    startDate: z.date(),
    endDate: z.date(),
}).refine((data) => data.endDate > data.startDate, {
    message: 'End date must be after start date',
    path: ['endDate'],
}).refine((data) => {
    const diffTime = Math.abs(data.endDate.getTime() - data.startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 30;
}, {
    message: 'Campaign duration cannot exceed 30 days',
    path: ['endDate'],
});
export const campaignInputSchema = z.object({
    name: z
        .string()
        .min(3, 'Campaign name must be at least 3 characters')
        .max(15, 'Campaign name must not exceed 15 characters')
        .regex(/^[a-zA-Z0-9\s]+$/, 'Campaign name can only contain letters, numbers, and spaces')
        .trim(),
    budget: z
        .string()
        .min(1, 'Budget is required')
        .transform((val) => parseFloat(val))
        .refine((val) => !isNaN(val), 'Budget must be a valid number')
        .refine((val) => val >= 10, 'Budget must be at least $10')
        .refine((val) => val <= 1000, 'Budget cannot exceed $1000'),
    startDate: z
        .string()
        .min(1, 'Start date is required')
        .transform((val) => new Date(val))
        .refine((date) => !isNaN(date.getTime()), 'Invalid start date'),
    endDate: z
        .string()
        .min(1, 'End date is required')
        .transform((val) => new Date(val))
        .refine((date) => !isNaN(date.getTime()), 'Invalid end date'),
}).refine((data) => data.endDate > data.startDate, {
    message: 'End date must be after start date',
    path: ['endDate'],
}).refine((data) => {
    const diffTime = Math.abs(data.endDate.getTime() - data.startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 30;
}, {
    message: 'Campaign duration cannot exceed 30 days',
    path: ['endDate'],
});
export const serverCampaignSchema = baseCampaignSchema.refine((data) => {
    const invalidWords = [
        'spam', 'scam', 'fake', 'fraud', 'phishing', 'malware', 'virus',
        'hack', 'illegal', 'stolen', 'pirated', 'xxx', 'porn', 'adult',
        'casino', 'gambling', 'bet', 'lottery', 'winner', 'congratulations',
        'urgent', 'limited', 'exclusive', 'guaranteed', 'risk-free',
        'miracle', 'amazing', 'incredible', 'unbelievable'
    ];
    const lowerCaseName = data.name.toLowerCase();
    return !invalidWords.some(word => lowerCaseName.includes(word));
}, {
    message: 'Campaign name contains prohibited words',
    path: ['name'],
});
