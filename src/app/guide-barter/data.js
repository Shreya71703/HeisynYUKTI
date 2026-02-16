// Target career profiles for skill comparison
export const careerProfiles = {
    "Frontend Developer": {
        skills: ["React", "JavaScript", "CSS", "HTML", "TypeScript", "Next.js", "Tailwind CSS", "Redux"],
        color: "#FF885B",
    },
    "Full Stack Developer": {
        skills: ["React", "Node.js", "Express", "MongoDB", "JavaScript", "TypeScript", "SQL", "Docker"],
        color: "#6C63FF",
    },
    "Backend Developer": {
        skills: ["Node.js", "Express", "Python", "Django", "SQL", "MongoDB", "Redis", "Docker"],
        color: "#00C9A7",
    },
    "ML Engineer": {
        skills: ["Python", "TensorFlow", "PyTorch", "Pandas", "NumPy", "Scikit-learn", "SQL", "Docker"],
        color: "#FF6B6B",
    },
    "DevOps Engineer": {
        skills: ["Docker", "Kubernetes", "AWS", "Linux", "CI/CD", "Terraform", "Python", "Bash"],
        color: "#4ECDC4",
    },
    "Mobile Developer": {
        skills: ["React Native", "Flutter", "Dart", "Swift", "Kotlin", "JavaScript", "Firebase", "TypeScript"],
        color: "#FFE66D",
    },
};

// All unique skills across all career profiles (for radar chart)
export const allSkills = [
    "React", "JavaScript", "TypeScript", "CSS", "HTML", "Next.js", "Tailwind CSS", "Redux",
    "Node.js", "Express", "Python", "Django", "SQL", "MongoDB", "Redis", "Docker",
    "TensorFlow", "PyTorch", "Pandas", "NumPy", "Scikit-learn",
    "Kubernetes", "AWS", "Linux", "CI/CD", "Terraform", "Bash",
    "React Native", "Flutter", "Dart", "Swift", "Kotlin", "Firebase",
    "Java", "C++", "C", "Go", "Rust", "PHP", "Ruby", "Vue.js", "Angular",
];

// Preset skill suggestions for search/input
export const skillSuggestions = [
    "React", "Node.js", "Python", "JavaScript", "TypeScript", "Java", "C++",
    "MongoDB", "SQL", "Docker", "AWS", "Git", "Express", "Next.js",
    "TensorFlow", "Flutter", "React Native", "Django", "FastAPI",
    "Tailwind CSS", "Redux", "GraphQL", "Firebase", "Kubernetes",
    "Vue.js", "Angular", "Svelte", "Rust", "Go", "PHP", "Ruby",
    "Machine Learning", "Data Science", "DevOps", "HTML", "CSS",
];
