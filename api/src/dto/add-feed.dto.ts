export interface AddFeedDTO{
    guid: string,
    title: string,
    description: string,
    imageUrl: string,
    link: string,
    pubDate: Date,
    source: string,
    twitterHandle?: string,
    Keywords?: string,
    score: string,
    magnitude: string,
    createdAt? : Date
}