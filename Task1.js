function validateApplicant(applicant) {
    if (!applicant || typeof applicant !== 'object') {
        return { valid: false, reason: "Missing applicant record" };
    }
    
    const { name, grade, attendance, isIndigent, hasFailingMark, activities } = applicant;

    if (typeof name !== 'string' || name.trim() === '') {
        return { valid: false, reason: "Invalid or missing name" };
    }
    if (typeof grade !== 'number' || isNaN(grade) || grade < 0 || grade > 100) {
        return { valid: false, reason: "Invalid or missing grade" };
    }
    if (typeof attendance !== 'number' || isNaN(attendance) || attendance < 0 || attendance > 100) {
        return { valid: false, reason: "Invalid or missing attendance percentage" };
    }
    if (typeof isIndigent !== 'boolean') {
        return { valid: false, reason: "Invalid or missing indigent status flag" };
    }
    if (typeof hasFailingMark !== 'boolean') {
        return { valid: false, reason: "Invalid or missing failing mark status flag" };
    }
    if (!Array.isArray(activities)) {
        return { valid: false, reason: "Invalid or missing activities list" };
    }

    return { valid: true };
}

function processScholarshipApplicants(applicants) {
    if (!Array.isArray(applicants)) {
        throw new Error("Input must be an array of applicants.");
    }

    return applicants.map(applicant => {
    
        const validation = validateApplicant(applicant);
        if (!validation.valid) {
            return {
                name: applicant && applicant.name ? applicant.name : "Unknown Applicant",
                status: "Rejected",
                reason: `Data Error: ${validation.reason}`
            };
        }

        const { name, grade, attendance, isIndigent, hasFailingMark, activities } = applicant;


        if (hasFailingMark) {
            return {
                name: name,
                status: "Rejected",
                reason: "Disqualified due to existing failing mark."
            };
        }


        const isHighAcademic = grade >= 85 && attendance >= 90;
        const isNeedBasedEligible = isIndigent && grade >= 80 && attendance >= 85;
        const isExtracurricularEligible = activities.length >= 2 && grade >= 82 && attendance >= 88;

        const isEligible = !hasFailingMark && (isHighAcademic || isNeedBasedEligible || isExtracurricularEligible);

        if (isEligible) {
            const qualifications = [];
            if (isHighAcademic) qualifications.push("High Academic Honors");
            if (isNeedBasedEligible) qualifications.push("Financial Need Criteria");
            if (isExtracurricularEligible) qualifications.push("Active Community/Extracurricular Leadership");

            return {
                name: name,
                status: "Eligible",
                reason: `Qualified via: ${qualifications.join(" | ")}`
            };
        }

    
        const isStandardWaitlist = grade >= 75 && attendance >= 80;
        const isIndigentWaitlist = isIndigent && grade >= 72 && attendance >= 75;

        const isWaitlisted = !hasFailingMark && (isStandardWaitlist || isIndigentWaitlist);

        if (isWaitlisted) {
            return {
                name: name,
                status: "Waitlisted",
                reason: "Meets minimum academic and attendance threshold for reserve list."
            };
        }

        return {
            name: name,
            status: "Rejected",
            reason: "Does not meet minimum scholarship eligibility or waitlist standards."
        };
    });
}


const sampleApplicants = [
    { name: "Alice Smith", grade: 92, attendance: 95, isIndigent: false, hasFailingMark: false, activities: ["Debate Club", "Math Team"] },
    { name: "Bob Jones", grade: 81, attendance: 87, isIndigent: true, hasFailingMark: false, activities: [] },
    { name: "Charlie Brown", grade: 96, attendance: 98, isIndigent: false, hasFailingMark: true, activities: ["Chess Club"] },
    { name: "Diana Prince", grade: 78, attendance: 82, isIndigent: false, hasFailingMark: false, activities: ["Student Council"] },
    { name: "Evan Wright", grade: 83, attendance: 89, isIndigent: false, hasFailingMark: false, activities: ["Robotics", "Volleyball"] },
    { name: "Fiona Gallagher", grade: null, attendance: 90, isIndigent: true, hasFailingMark: false, activities: [] }, // Incomplete
    { name: "George Clark", grade: 70, attendance: 60, isIndigent: false, hasFailingMark: false, activities: [] }
];

console.log("--- SCHOLARSHIP SCREENING RESULTS ---");
console.log(processScholarshipApplicants(sampleApplicants));
