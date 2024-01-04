import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { StudyChoice } from "~/interfaces/StudyPlanData";
import SubjectDetails from "../General/SubjectDetails";
import GreenButton from "../General/GreenButton";

interface ChosenSubjectsData {
    code: string;
    name: string;
    courses: DetailedCourse[] | ChosenSubjectsData[];
}

export interface DetailedCourse {
    code: string;
    credit: string;
    name: string;
    planelement: string;
    studyChoice: StudyChoice;
    courseGroupName: string;
}

interface DisplayProps {
    chosenSubjects: ChosenSubjectsData[];
    handleRedirect: (selectedCourses: DetailedCourse[]) => void;
}

const Display: React.FC<DisplayProps> = ({ chosenSubjects, handleRedirect }) => {
    const [selectedPath, setSelectedPath] = useState<(string | null)[]>(Array(chosenSubjects.length).fill(null));
    const [selectedCourses, setSelectedCourses] = useState<DetailedCourse[]>([]);

    // State to track showMore for each group
    const [showMoreMap, setShowMoreMap] = useState<{ [key: string]: boolean }>({});

    useEffect(() => {
        resetSelectedSubjects();
        setShowMoreMap({});

    }, [chosenSubjects]);

    const resetSelectedSubjects = () => {
        setSelectedPath([]);

        // If courses are at the top level, add them to selectedCourses
        const topCourses: DetailedCourse[] = chosenSubjects.filter(isCourse).map(course => course as unknown as DetailedCourse);
        setSelectedCourses(topCourses);
    };

    const isCourse = (subject: DetailedCourse | ChosenSubjectsData): subject is DetailedCourse => 'credit' in subject;

    const handleRadioChange = (subject: DetailedCourse | ChosenSubjectsData, level: number) => {
        setSelectedPath((prevSelectedPath) => {
            const updatedSelectedPath = [...prevSelectedPath];

            // Disselect all radio buttons beneath the current level
            for (let i = level + 1; i < updatedSelectedPath.length; i++) {
                updatedSelectedPath[i] = null;
            }

            // Toggle the radio button for the current level
            updatedSelectedPath[level] = updatedSelectedPath[level] === subject.name ? null : subject.name;

            // Clear selectedCourses if the top-level radio button is deselected
            if (level === 0 && !updatedSelectedPath[level]) {
                setSelectedCourses([]);
            } else if ('courses' in subject && subject.courses) {
                // If there are courses, update the selectedCourses array
                const validCourses = subject.courses.filter(isCourse);
                setSelectedCourses(validCourses);
            }

            // Use the functional form to ensure state consistency
            return [...updatedSelectedPath];
        });
    };

    const renderRadioInput = (subject: DetailedCourse | ChosenSubjectsData, parentIndex: number, index: number, level: number) => {
        const handleClick = () => {
            handleRadioChange(subject as DetailedCourse, level);
        };

        return (
            <div key={index}>
                <label className="flex items-center space-x-2">
                    <input
                        type="radio"
                        name={`radio_${parentIndex}_${index}`}
                        value={subject.name}
                        checked={selectedPath[level] === subject.name}
                        onChange={() => { }} // Add a dummy onChange to satisfy the warning
                        onClick={handleClick}
                        className="w-3 h-3 flex-shrink-0"
                    />
                    <span className="text-lg">{subject.name}</span>
                </label>
                {selectedPath[level] === subject.name && 'courses' in subject && (
                    <div className="ml-4">{renderSubjects(subject.courses, index, level + 1)}</div>
                )}
            </div>
        );
    };

    const renderNextButtons = () => {
        if (selectedCourses.length > 0) {
            const studyChoices: { [code: string]: string } = {};
            selectedCourses.forEach((course) => {
                studyChoices[course.studyChoice.code] = course.studyChoice.name;
            });

            const explanationText = Object.entries(studyChoices)
                .map(([code, name]) => `${code}: ${name}`)
                .join('\n');

            return (
                <div>
                    <GreenButton
                        text={'Symbol Explanation'}
                        onClick={() => alert(explanationText)}
                    />
                    <GreenButton
                        text={'Modify Courses'}
                        onClick={() => handleRedirect(selectedCourses)}
                        className="ml-2"
                    />
                </div>
            );
        }
    };

    const renderSubjects = (subjects: (DetailedCourse | ChosenSubjectsData)[] | undefined, parentIndex: number, level: number) => {
        // Check if subjects is undefined or empty
        if (!subjects || subjects.length === 0) {
            return (
                <p className="text-red-500">No subjects found for this course.</p>
            ); // Display a message when there are no subjects
        }

        // Group subjects by studyChoice.code
        const groupedSubjects: { [key: string]: (DetailedCourse | ChosenSubjectsData)[] } = {};

        subjects.forEach((subject) => {
            const key =
                'courses' in subject && !Object.values(groupedSubjects).flat().includes(subject)
                    ? 'Uncategorized'
                    : (subject as DetailedCourse).courseGroupName;

            if (!groupedSubjects[key]) {
                groupedSubjects[key] = [];
            }
            groupedSubjects[key]?.push(subject);
        });

        // Function to toggle showMore for a specific group
        const toggleShowMore = (group: string) => {
            setShowMoreMap((prev) => ({ ...prev, [group]: !prev[group] }));
        };

        // Render the grouped subjects
        return (
            <div>
                {Object.entries(groupedSubjects).map(([group, groupSubjects], index) => (
                    <div key={index}>
                        {group !== 'Uncategorized' && (
                            <h2 className="text-2xl font-bold mt-2 mb-2">{group}</h2>
                        )}
                        {groupSubjects.map((subject, subIndex) => {
                            const isRadioInput = 'courses' in subject;
                            return (
                                <div key={subIndex}>
                                    {isRadioInput
                                        ? renderRadioInput(subject, parentIndex, subIndex, level)
                                        : <SubjectDetails subject={subject as DetailedCourse} />}
                                </div>
                            );
                        }).slice(0, (showMoreMap[group] || groupSubjects.some(subject => 'courses' in subject)) ? groupSubjects.length : 5)}
                        {groupSubjects.length > 5 && !groupSubjects.some(subject => 'courses' in subject) && (
                            <GreenButton
                                text={showMoreMap[group] ? 'Show Less' : 'Show More'}
                                onClick={() => toggleShowMore(group)}
                            />
                        )}
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="w-full flex flex-col items-left">
            {renderNextButtons()} {/* Render the explanation button once */}
            <div className="pt-4">{renderSubjects(chosenSubjects, -1, 0)}</div>
        </div>
    );
};

export default Display;