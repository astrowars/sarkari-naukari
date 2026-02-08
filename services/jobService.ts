import { Job, UserProfile, Category } from '../types';

// Age Relaxation Logic
export const getRelaxedMaxAge = (baseMaxAge: number, category: Category | ''): number => {
  if (category === '') return baseMaxAge;
  
  switch (category) {
    case Category.OBC:
      return baseMaxAge + 3;
    case Category.SC:
    case Category.ST:
      return baseMaxAge + 5;
    case Category.GENERAL:
    default:
      return baseMaxAge;
  }
};

export const getJobCategory = (job: Job): string => {
  const name = job.job_name.toLowerCase();
  if (name.includes('ssc')) return 'SSC';
  if (name.includes('bank') || name.includes('sbi') || name.includes('ibps')) return 'Banking';
  if (name.includes('police') || name.includes('army') || name.includes('agniveer') || name.includes('defence')) return 'Defence';
  if (name.includes('teacher') || name.includes('pgt') || name.includes('tgt')) return 'Teaching';
  if (name.includes('rrb') || name.includes('railway')) return 'Railways';
  if (job.state !== 'All India') return 'State Govt';
  return 'Other';
};

export const checkEligibility = (job: Job, user: UserProfile): { isEligible: boolean; reason: string } => {
  // 1. Status Check
  if (job.status !== 'Active') {
    return { isEligible: false, reason: "Job application is closed." };
  }

  // 2. Gender Check
  if (job.gender !== 'All' && job.gender !== user.gender) {
    return { isEligible: false, reason: `Only for ${job.gender} candidates.` };
  }

  // 3. Category Check
  if (job.category !== 'All') {
     if (job.category !== user.category) {
         return { isEligible: false, reason: `Restricted to ${job.category} category.` };
     }
  }

  // 4. Age Check with Relaxation
  if (user.age === '') {
     return { isEligible: false, reason: "Please enter your age." };
  }
  
  const relaxedMaxAge = getRelaxedMaxAge(job.max_age, user.category);
  
  if (user.age < job.min_age) {
    return { isEligible: false, reason: `Minimum age is ${job.min_age}.` };
  }
  
  if (user.age > relaxedMaxAge) {
    let suggestion = "";
    if (user.category === Category.GENERAL || user.category === '') {
        if (user.age <= job.max_age + 3) {
            suggestion = " Check OBC/Reserved category relaxation.";
        } else if (user.age <= job.max_age + 5) {
            suggestion = " Check SC/ST category relaxation.";
        }
    }
    return { isEligible: false, reason: `Over age limit (${relaxedMaxAge} yrs).${suggestion}` };
  }

  // 5. Qualification Check (Hierarchy: PG > Graduate > 12th > 10th)
  const qualHierarchy = [
    '10th Pass', '12th Pass', 'Graduate', 'Post Graduate'
  ];
  
  const userQualIndex = qualHierarchy.indexOf(user.qualification as string);
  const jobQualIndex = qualHierarchy.indexOf(job.qualification);

  if (userQualIndex < jobQualIndex) {
    return { isEligible: false, reason: `Requires ${job.qualification}.` };
  }

  // 6. Stream Check
  // If job requires specific streams and 'Any' is not in the list
  const jobStreams = job.required_streams || ['Any'];
  if (!jobStreams.includes('Any')) {
      if (!user.stream || !jobStreams.includes(user.stream)) {
          return { isEligible: false, reason: `Requires ${jobStreams.join(' or ')} stream.` };
      }
  }

  // 7. State Preference Check
  if (user.statePreference !== '' && job.state !== 'All India' && job.state !== user.statePreference) {
      return { isEligible: false, reason: `Job is for ${job.state} residents/location.` };
  }

  return { isEligible: true, reason: "Eligible" };
};