import { Meeting, Participant } from '../types';

const STORAGE_KEY = 'meeting_app_db';

// Simulate a database delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const getDB = (): Meeting[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

const saveDB = (data: Meeting[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export const createMeeting = async (name: string): Promise<Meeting> => {
  await delay(300);
  const db = getDB();
  const newMeeting: Meeting = {
    id: crypto.randomUUID(),
    name,
    createdAt: new Date().toISOString(),
    participants: []
  };
  db.push(newMeeting);
  saveDB(db);
  return newMeeting;
};

export const getMeeting = async (id: string): Promise<Meeting | undefined> => {
  await delay(100);
  const db = getDB();
  return db.find(m => m.id === id);
};

export const getAllMeetings = async (): Promise<Meeting[]> => {
  await delay(200);
  return getDB().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

export const addParticipant = async (meetingId: string, participant: Omit<Participant, 'id' | 'timestamp'>): Promise<void> => {
  await delay(400);
  const db = getDB();
  const meetingIndex = db.findIndex(m => m.id === meetingId);
  
  if (meetingIndex === -1) {
    throw new Error('Meeting not found');
  }

  const newParticipant: Participant = {
    ...participant,
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString()
  };

  db[meetingIndex].participants.push(newParticipant);
  saveDB(db);
};

export const deleteMeeting = async (meetingId: string): Promise<void> => {
  const db = getDB();
  const newDb = db.filter(m => m.id !== meetingId);
  saveDB(newDb);
}
