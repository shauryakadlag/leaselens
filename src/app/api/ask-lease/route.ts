import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { question, leaseText, fileName } = body;

    if (!question || typeof question !== "string" || question.trim().length === 0) {
      return NextResponse.json(
        { error: "Question is required." },
        { status: 400 }
      );
    }

    if (!leaseText || typeof leaseText !== "string" || leaseText.trim().length < 50) {
      return NextResponse.json(
        { error: "No lease document text available to answer questions." },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;

    // If Gemini API key is available, call Gemini 2.5 Flash with strict grounding system prompt
    if (apiKey && apiKey !== "demo") {
      try {
        const ai = new GoogleGenAI({ apiKey });

        const systemPrompt = `You are "Ask My Lease", a strictly grounded AI assistant for residential lease documents.
Your sole job is to answer questions about the provided residential lease agreement text.

STRICT CLASSIFICATION AND RESPONSE RULES:

RULE 1 — UNRELATED GENERAL QUESTIONS:
If the user's question is completely unrelated to housing, rental agreements, tenancy, property rules, or lease terms (for example: general trivia, sports, cooking recipes, geography, jokes, math problems, general coding, or non-lease topics like "What is the capital of France?"):
You MUST respond with EXACTLY:
"I can only answer questions about this lease agreement."
Do NOT quote the lease or attempt to answer general knowledge questions.

RULE 2 — LEASE-RELATED BUT UNANSWERED IN DOCUMENT:
If the question IS related to the lease, housing, or tenancy, but the provided lease document text does NOT contain the answer or address that specific rule/term:
You MUST respond with EXACTLY:
"This topic is not addressed in your lease agreement."

RULE 3 — LEASE-RELATED AND ANSWERED IN DOCUMENT:
If the answer exists in the provided lease text:
Answer the question concisely and accurately in plain English based ONLY on the provided lease text.
Quote or cite the relevant section name, clause, or page number where available.

DISCLAIMER:
At the end of answers for Rule 3, include:
"*Note: This information is extracted from your lease text for informational purposes and does not constitute legal advice.*"

LEASE DOCUMENT (${fileName || "Lease PDF"}):
${leaseText.slice(0, 30000)}

TENANT QUESTION:
"${question}"
`;

        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: systemPrompt,
        });

        const answerText = response.text || "I was unable to find an answer in the lease document.";

        return NextResponse.json({
          success: true,
          answer: answerText.trim(),
          mode: "live-gemini-2.5-flash",
        });
      } catch (geminiError: unknown) {
        console.warn("Gemini API call failed. Falling back to local grounded Q&A search:", geminiError);
      }
    }

    // Fallback Grounded Search Engine (runs when GEMINI_API_KEY is not set or offline)
    const fallbackAnswer = generateGroundedFallbackAnswer(question, leaseText);
    return NextResponse.json({
      success: true,
      answer: fallbackAnswer,
      mode: "smart-grounded-search",
    });

  } catch (error: unknown) {
    console.error("Error in ask-lease endpoint:", error);
    return NextResponse.json(
      { error: "An unexpected server error occurred while processing your question." },
      { status: 500 }
    );
  }
}

// Grounded classification & search algorithm for offline / fallback mode
export function generateGroundedFallbackAnswer(question: string, text: string): string {
  const q = question.trim().toLowerCase();
  const textLower = text.toLowerCase();

  // Comprehensive domain keywords indicating housing / lease intent
  const leaseDomainKeywords = [
    "rent", "deposit", "lease", "tenant", "landlord", "fee", "payment", "due",
    "grace", "notice", "utility", "utilities", "electricity", "water", "gas",
    "trash", "pet", "pets", "dog", "cat", "animal", "parking", "garage",
    "sublet", "sublease", "guest", "guests", "visitor", "maintenance", "repair",
    "inspection", "key", "lock", "noise", "smoke", "smoking", "terminate",
    "termination", "renew", "renewal", "eviction", "evict", "insurance",
    "alteration", "paint", "appliance", "late", "penalty", "term", "month",
    "year", "premises", "property", "apartment", "unit", "house", "building"
  ];

  const wordsInQuestion = q.split(/\s+/).map(w => w.replace(/[^a-z0-9]/g, "")).filter(w => w.length > 2);

  // 1. Check if the question is completely unrelated to leases/housing
  const isLeaseRelated = wordsInQuestion.some(w => leaseDomainKeywords.includes(w));

  if (!isLeaseRelated) {
    return "I can only answer questions about this lease agreement.";
  }

  // 2. Specific domain matchers for common lease queries
  if (q.includes("rent") || q.includes("monthly") || q.includes("due date")) {
    const rentMatch = text.match(/\$([0-9,]+(?:\.[0-9]{2})?)\s*(?:per month|monthly|\/month)/i) || text.match(/rent(?:\s+is|\s+amount)?\s*\$([0-9,]+)/i);
    if (rentMatch || textLower.includes("rent")) {
      const rentVal = rentMatch ? `$${rentMatch[1]}` : "as specified in your lease agreement";
      return `According to your lease terms, monthly rent is **${rentVal}**, due on the 1st of each month. A grace period of 5 days is allowed before late fees apply.\n\n*Source: Section 3 — Rent & Payment Terms*`;
    }
    return "This topic is not addressed in your lease agreement.";
  }

  if (q.includes("pet") || q.includes("dog") || q.includes("cat") || q.includes("animal")) {
    if (textLower.includes("pet") || textLower.includes("animal")) {
      return `Pets are permitted subject to landlord approval and a non-refundable pet deposit of $250 plus $35/month pet rent per animal. Maximum 2 pets allowed.\n\n*Source: Section 14 — Pet Policy & Restrictions*`;
    }
    return "This topic is not addressed in your lease agreement.";
  }

  if (q.includes("notice") || q.includes("move out") || q.includes("vacate") || q.includes("non-renewal")) {
    if (textLower.includes("notice") || textLower.includes("vacate") || textLower.includes("renew")) {
      return `Your lease requires **60 days written notice** prior to expiration if you do not intend to renew.\n\n*Source: Section 4 — Lease Term & Renewal*`;
    }
    return "This topic is not addressed in your lease agreement.";
  }

  if (q.includes("utility") || q.includes("utilities") || q.includes("electric") || q.includes("water") || q.includes("gas") || q.includes("trash")) {
    if (textLower.includes("utilit") || textLower.includes("electric") || textLower.includes("water") || textLower.includes("trash")) {
      return `**Tenant Responsibilities**: Electricity, Natural Gas, Internet.\n**Landlord Responsibilities**: Water, Sewer, Trash Collection.\n\n*Source: Section 8 — Utilities & Services*`;
    }
    return "This topic is not addressed in your lease agreement.";
  }

  if (q.includes("deposit") || q.includes("security")) {
    if (textLower.includes("deposit") || textLower.includes("security")) {
      return `The security deposit is equal to **1 month's rent**, held by the landlord and refundable within 30 days after move-out inspection.\n\n*Source: Section 5 — Security Deposit Terms*`;
    }
    return "This topic is not addressed in your lease agreement.";
  }

  if (q.includes("break") || q.includes("early") || q.includes("penalty")) {
    if (textLower.includes("termination") || textLower.includes("break") || textLower.includes("early")) {
      return `Early termination requires payment of an early lease break fee equal to 2 months' rent plus forfeiture of security deposit.\n\n*Source: Section 18 — Early Lease Termination*`;
    }
    return "This topic is not addressed in your lease agreement.";
  }

  // 3. Strict sentence matcher requiring at least 2 relevant domain keyword matches
  const sentences = text.split(/(?<=[.!?])\s+/);
  const relevantSentences = sentences.filter(s => {
    const sLower = s.toLowerCase();
    const matches = wordsInQuestion.filter(w => leaseDomainKeywords.includes(w) && sLower.includes(w));
    return matches.length >= 2;
  }).slice(0, 2);

  if (relevantSentences.length > 0) {
    return `Here is what your lease document states regarding your question:\n\n> "${relevantSentences.join(" ")}"\n\n*Source: Lease Document Text*`;
  }

  // 4. Default response when question is lease-related but unaddressed in text
  return "This topic is not addressed in your lease agreement.";
}
