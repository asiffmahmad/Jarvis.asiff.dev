import type { EmailThread, EmailMessage, EmailContact } from "./types";

const mockContacts: Record<string, EmailContact> = {
  me: { name: "Tony Stark", email: "tony@starkindustries.com" },
  pepper: { name: "Pepper Potts", email: "pepper@starkindustries.com", avatarUrl: "https://i.pravatar.cc/150?u=pepper" },
  rhodey: { name: "James Rhodes", email: "rhodey@usaf.mil", avatarUrl: "https://i.pravatar.cc/150?u=rhodey" },
  fury: { name: "Nick Fury", email: "director@shield.gov", avatarUrl: "https://i.pravatar.cc/150?u=fury" },
  peter: { name: "Peter Parker", email: "peter.parker@midtownhigh.edu", avatarUrl: "https://i.pravatar.cc/150?u=peter" },
};

const pastDate = (daysAgo: number, hoursAgo = 0) => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(d.getHours() - hoursAgo);
  return d;
};

const m1: EmailMessage = {
  id: "msg_1",
  threadId: "thread_1",
  from: mockContacts.fury,
  to: [mockContacts.me],
  subject: "Avengers Initiative Update",
  snippet: "We need to discuss the new protocols immediately...",
  bodyPlain: "Stark,\n\nWe need to discuss the new protocols immediately. The council is asking questions about the recent incident in Sokovia. Meet me at the helicarrier tomorrow 0800.\n\n- Fury",
  bodyHtml: "<p>Stark,</p><p>We need to discuss the new protocols immediately. The council is asking questions about the recent incident in Sokovia. Meet me at the helicarrier tomorrow 0800.</p><p>- Fury</p>",
  date: pastDate(0, 2),
  labels: ["INBOX", "UNREAD", "IMPORTANT"],
};

const m2: EmailMessage = {
  id: "msg_2",
  threadId: "thread_2",
  from: mockContacts.pepper,
  to: [mockContacts.me],
  subject: "Q3 Earnings Report Review",
  snippet: "Attached is the final draft of the Q3 earnings report. Please review before the board meeting...",
  bodyPlain: "Tony,\n\nAttached is the final draft of the Q3 earnings report. Please review before the board meeting on Thursday. The R&D expenditures are slightly over budget.\n\nBest,\nPepper",
  bodyHtml: "<p>Tony,</p><p>Attached is the final draft of the Q3 earnings report. Please review before the board meeting on Thursday. The R&D expenditures are slightly over budget.</p><p>Best,<br/>Pepper</p>",
  date: pastDate(1, 4),
  labels: ["INBOX", "IMPORTANT"],
  attachments: [
    { id: "att_1", filename: "Q3_Earnings_Draft_v4.pdf", mimeType: "application/pdf", size: 2450000 }
  ]
};

const m3_1: EmailMessage = {
  id: "msg_3_1",
  threadId: "thread_3",
  from: mockContacts.peter,
  to: [mockContacts.me],
  subject: "Stark Internship Questions",
  snippet: "Mr. Stark! Quick question about the new suit upgrades...",
  bodyPlain: "Mr. Stark!\n\nQuick question about the new suit upgrades. Can we increase the web-shooter capacity by 15%? I've been running out too fast during patrol.\n\nThanks!\nPeter",
  bodyHtml: "<p>Mr. Stark!</p><p>Quick question about the new suit upgrades. Can we increase the web-shooter capacity by 15%? I've been running out too fast during patrol.</p><p>Thanks!<br/>Peter</p>",
  date: pastDate(2, 5),
  labels: ["INBOX"],
};

const m3_2: EmailMessage = {
  id: "msg_3_2",
  threadId: "thread_3",
  from: mockContacts.me,
  to: [mockContacts.peter],
  subject: "Re: Stark Internship Questions",
  snippet: "Kid, I already told you to conserve web fluid...",
  bodyPlain: "Kid, I already told you to conserve web fluid. Stop swinging from every single building. I'll look into a 5% increase. Don't push it.\n\n- TS",
  bodyHtml: "<p>Kid, I already told you to conserve web fluid. Stop swinging from every single building. I'll look into a 5% increase. Don't push it.</p><p>- TS</p>",
  date: pastDate(2, 1),
  labels: ["SENT"],
};

const m3_3: EmailMessage = {
  id: "msg_3_3",
  threadId: "thread_3",
  from: mockContacts.peter,
  to: [mockContacts.me],
  subject: "Re: Re: Stark Internship Questions",
  snippet: "Awesome! 5% is better than nothing! You're the best Mr. Stark!",
  bodyPlain: "Awesome! 5% is better than nothing! You're the best Mr. Stark!",
  bodyHtml: "<p>Awesome! 5% is better than nothing! You're the best Mr. Stark!</p>",
  date: pastDate(1, 10),
  labels: ["INBOX", "UNREAD", "STARRED"],
};

export const MOCK_THREADS: EmailThread[] = [
  {
    id: "thread_1",
    messages: [m1],
    lastMessageDate: m1.date,
    subject: m1.subject,
    participants: [mockContacts.fury, mockContacts.me],
    labels: ["INBOX", "UNREAD", "IMPORTANT"],
    snippet: m1.snippet,
    isUnread: true,
    isStarred: false,
    isImportant: true,
  },
  {
    id: "thread_2",
    messages: [m2],
    lastMessageDate: m2.date,
    subject: m2.subject,
    participants: [mockContacts.pepper, mockContacts.me],
    labels: ["INBOX", "IMPORTANT"],
    snippet: m2.snippet,
    isUnread: false,
    isStarred: false,
    isImportant: true,
  },
  {
    id: "thread_3",
    messages: [m3_1, m3_2, m3_3],
    lastMessageDate: m3_3.date,
    subject: m3_1.subject,
    participants: [mockContacts.peter, mockContacts.me],
    labels: ["INBOX", "UNREAD", "STARRED"],
    snippet: m3_3.snippet,
    isUnread: true,
    isStarred: true,
    isImportant: false,
  }
];

export const MOCK_LABELS = [
  { id: "LABEL_1", name: "Project Ultron", color: "#e11d48" },
  { id: "LABEL_2", name: "Avengers", color: "#2563eb" },
  { id: "LABEL_3", name: "Stark Industries", color: "#16a34a" },
];
