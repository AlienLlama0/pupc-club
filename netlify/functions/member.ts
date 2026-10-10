import type {
  Handler,
  HandlerEvent,
  HandlerResponse,
} from "@netlify/functions";

import {
  initializeApp,
  getApps,
  getApp,
  cert,
} from "firebase-admin/app";

import { getFirestore, Timestamp } from "firebase-admin/firestore";

type SearchType = "student_id" | "email" | "phone_number";

const allowedFields: SearchType[] = [
  "student_id",
  "email",
  "phone_number",
];

interface SearchRequestBody {
  searchType: SearchType;
  value: string;
}

interface MemberDocument {
  pupc_id?: string;
  student_id?: string;
  name?: string;
  email?: string;
  phone_number?: string;
  department?: string;
  created_at?: Timestamp;
}

const firebaseConfig = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
};

const app =
  getApps().length === 0
    ? initializeApp({
        credential: cert(firebaseConfig),
      })
    : getApp();

const db = getFirestore(app);

const jsonResponse = (
  statusCode: number,
  data: Record<string, unknown>
): HandlerResponse => ({
  statusCode,
  headers: {
    "Content-Type": "application/json",
    "Cache-Control": "no-store",
  },
  body: JSON.stringify(data),
});

export const handler: Handler = async (
  event: HandlerEvent
): Promise<HandlerResponse> => {
  if (event.httpMethod !== "POST") {
    return jsonResponse(405, { error: "Method Not Allowed" });
  }

  try {
    if (!event.body) {
      return jsonResponse(400, { error: "Missing request body" });
    }

    let body: SearchRequestBody;

    try {
      body = JSON.parse(event.body) as SearchRequestBody;
    } catch {
      return jsonResponse(400, { error: "Invalid JSON body" });
    }

    const { searchType, value } = body;

    if (
      typeof searchType !== "string" ||
      !allowedFields.includes(searchType as SearchType)
    ) {
      return jsonResponse(400, { error: "Invalid search type" });
    }

    if (
      typeof value !== "string" ||
      !value.trim() ||
      value.length > 254
    ) {
      return jsonResponse(400, { error: "Invalid search value" });
    }

    let queryValue = value.trim();

    if (searchType === "email") {
      queryValue = queryValue.toLowerCase();
    }

    const snapshot = await db
      .collection("members")
      .where(searchType, "==", queryValue)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return jsonResponse(200, { registered: false });
    }

    const data = snapshot.docs[0].data() as MemberDocument;

    // Return only fields approved for public verification.
    return jsonResponse(200, {
      registered: true,
      member: {
        id: data.pupc_id ?? "",
        name: data.name ?? "",
        department: data.department ?? "",
        studentId: data.student_id ?? "",
        status: "Active",
        joinedAt: data.created_at?.toDate().toISOString() ?? "",
      },
    });
  } catch (error) {
    // Keep internal Firebase details out of the client response.
    console.error("Member lookup failed:", error);

    return jsonResponse(500, {
      error: "Unable to verify member right now",
    });
  }
};
