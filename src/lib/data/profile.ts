import { site } from './site';

export const identityProfiles = {
	appwrite: 'https://appwrite.io/blog/author/aditya-oberai',
	microsoftMvp: 'https://mvp.microsoft.com/en-US/MVP/profile/4a922093-396f-ed11-81ab-000d3a5600fa',
	sessionize: 'https://sessionize.com/adityaoberai'
};

// The dated figures are from Aditya's Developer Advocate tenure at Appwrite.
export const appwriteCareer = {
	joined: 'September 2021',
	leadSince: 'December 2025',
	advocatePeriod: '2021–2025',
	articles: '100+',
	students: '15,000+',
	hackathonParticipants: '10,000+',
	communityMembers: '100,000+'
};

export const cmxAward = {
	title: 'Best Developer Relations Community Professional of the Year',
	year: 2024,
	url: 'https://www.cmxhub.com/blog/the-2024-cmx-community-industry-awards-winners-are-in'
};

export const microsoftMvpSince = 2022;
export const microsoftInterview =
	'https://techcommunity.microsoft.com/blog/studentdeveloperblog/meet-a-recent-microsoft-learn-student-ambassador-graduate-aditya-oberai/3579478';

export const speakerBio = [
	`${site.name} is the ${site.role} and an avid tech community and hackathon enthusiast. He works on product launches, developer education, and open source communities in India and beyond.`,
	`Aditya has been a Microsoft MVP since ${microsoftMvpSince}. CMX named him ${cmxAward.title} in ${cmxAward.year}. He led the organisation of DevRelCon Bengaluru 2024, the first edition of DevRelCon in India.`
].join('\n\n');
