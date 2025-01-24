
export interface College {
    name: string;                   // Name of the college
    location: string;               // Location of the college
    description: string;            // Brief description of the college
    acceptance_rate?: string;       // Acceptance rate of the college if available
    tuition?: string;              // Tuition cost of the college if available
    enrollment?: string;           // Enrollment of the college(undergraduates) if available
    dorm_percentage?: string;      // Percentage of students who live in dorms of the college if available
    sat_scores?: string;           // SAT scores of the college if available
    programs?: string[];           // List of notable programs or majors
    url?: string;                  // URL of the college website if available
    has_missing_fields: boolean;
}

export interface CollegeFinderInput {
    major?: string;                // Desired major/field of study
    location_preference?: string;   // Preferred location/region
    max_tuition?: number;          // Maximum tuition budget
    min_acceptance_rate?: number;   // Minimum acceptance rate
    max_colleges?: number;         // Number of colleges to find
    search_query?: string;         // Constructed search query
    sat_score?: number;            // average SAT score
}

export interface CollegeFinderState extends CollegeFinderInput {
    search_query: string;          // Constructed search query
    colleges: College[];           // Found colleges matching criteria
    recommendations: string[];     // Specific recommendations for the user
    data_gathering_attempts: number; // Counter for data gathering attempts
}