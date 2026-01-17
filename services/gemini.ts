import { GoogleGenAI, Type } from "@google/genai";
import { Teacher, TimetableEntry, SubstitutionSuggestion } from "../types";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API Key not found");
  return new GoogleGenAI({ apiKey });
};

export const generateTimetableAI = async (teachers: Teacher[], classNames: string[]): Promise<TimetableEntry[]> => {
  const ai = getClient();
  
  const teacherContext = teachers.map(t => `${t.name} (ID: ${t.id}) teaches ${t.subjects.join(', ')}`).join('\n');
  const classesContext = classNames.join(', ');
  
  const prompt = `
    Create a Master Academic Year Timetable (Weekly Schedule) for the entire school.
    Classes to schedule: ${classesContext}.
    
    Structure & Timing Rules:
    1. Monday to Thursday: 8 Periods (Period 1 to 8).
    2. Friday: 5 Periods ONLY (Period 1 to 5). Do NOT schedule periods 6, 7, or 8 on Friday.
    3. Period Duration: 35 minutes each.
    4. Break: There is a 15-minute break after Period 5.
    
    Faculty Available:
    ${teacherContext}
    
    Strategic Scheduling Rules:
    1. SUBJECT EXPERTISE: Assign subjects strictly based on teacher qualification.
    2. WORKLOAD BALANCE: Distribute hard subjects (Math, Science) evenly across the week for students.
    3. TEACHER CONFLICTS: A teacher CANNOT be in two classes at the same time. This is a hard constraint.
    4. YEARLY CONSISTENCY: This schedule will be used for the whole academic year, so ensure it is robust and complete.
    5. Return a single flat JSON array containing entries for ALL requested classes.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              day: { type: Type.STRING },
              period: { type: Type.NUMBER },
              subject: { type: Type.STRING },
              teacherId: { type: Type.STRING },
              classId: { type: Type.STRING }
            },
            required: ["day", "period", "subject", "teacherId", "classId"]
          }
        }
      }
    });

    const jsonText = response.text || "[]";
    const entries = JSON.parse(jsonText) as TimetableEntry[];
    return entries;
  } catch (error) {
    console.error("AI Timetable generation failed", error);
    return [];
  }
};

export const suggestSubstitutions = async (
  absentTeacher: Teacher,
  timetable: TimetableEntry[],
  allTeachers: Teacher[]
): Promise<SubstitutionSuggestion[]> => {
  const ai = getClient();

  // Filter timetable for entries involving the absent teacher
  const impactedSlots = timetable.filter(t => t.teacherId === absentTeacher.id);
  
  if (impactedSlots.length === 0) return [];

  const availableTeachers = allTeachers.filter(t => t.id !== absentTeacher.id && !t.isOnLeave);
  
  const prompt = `
    The teacher ${absentTeacher.name} (Subjects: ${absentTeacher.subjects.join(', ')}) is absent.
    They have the following classes scheduled:
    ${JSON.stringify(impactedSlots)}

    Available teachers:
    ${JSON.stringify(availableTeachers.map(t => ({ name: t.name, subjects: t.subjects, id: t.id })))}

    Please suggest a substitution for each impacted slot. 
    Try to match the subject if possible, or assign a relevant subject.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              period: { type: Type.NUMBER },
              day: { type: Type.STRING },
              absentTeacher: { type: Type.STRING },
              suggestedTeacher: { type: Type.STRING },
              reason: { type: Type.STRING }
            }
          }
        }
      }
    });

    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("Substitution suggestion failed", error);
    return [];
  }
};