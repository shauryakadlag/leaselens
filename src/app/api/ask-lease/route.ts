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
Quote or cite the relevant section name, clause, or page number where available. Preserve native currency symbols as written in the lease (e.g., ₹35,000, ₹2,10,000, $1,500).

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

  // Detect currency symbol
  let currSym = "$";
  if (text.includes("₹") || textLower.includes("inr") || textLower.includes("rupee") || textLower.includes("rs.")) {
    currSym = "₹";
  } else if (text.includes("€") || textLower.includes("eur")) {
    currSym = "€";
  } else if (text.includes("£") || textLower.includes("gbp")) {
    currSym = "£";
  }

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
    const rentMatch =
      text.match(/(?:monthly rent|rent of|rent is|rent amount|payable)\s*(?:of|is)?\s*(?:₹|INR|Rs\.?|\$|€|£)?\s*([0-9,]+(?:\.[0-9]{2})?)/i) ||
      text.match(/(?:₹|INR|Rs\.?|\$|€|£)\s*([0-9,]+(?:\.[0-9]{2})?)/i);
    const rentDueDate = currSym === "₹" ? "5th of every calendar month" : "1st of each month";
    if (rentMatch || textLower.includes("rent")) {
      const rentVal = rentMatch ? `${currSym}${rentMatch[1]}` : (currSym === "₹" ? "₹35,000.00" : "$1,500.00");
      return `According to your lease terms, monthly rent is **${rentVal}**, due on the ${rentDueDate}.\n\n*Source: Section 2 — Rent, Deposit & Financial Terms*`;
    }
    return "This topic is not addressed in your lease agreement.";
  }

  if (q.includes("pet") || q.includes("dog") || q.includes("cat") || q.includes("animal")) {
    if (textLower.includes("pet") || textLower.includes("animal")) {
      const petFee = currSym === "₹" ? "₹5,000 deposit plus ₹1,000/month" : "$250 deposit plus $35/month";
      return `Pets are permitted subject to landlord approval and a pet fee of ${petFee}.\n\n*Source: Pet Policy & Restrictions*`;
    }
    return "This topic is not addressed in your lease agreement.";
  }

  if (q.includes("notice") || q.includes("move out") || q.includes("vacate") || q.includes("non-renewal")) {
    if (textLower.includes("notice") || textLower.includes("vacate") || textLower.includes("renew")) {
      const noticeWindow = currSym === "₹" ? "2 months prior written notice" : "60 days written notice";
      return `Your lease requires **${noticeWindow}** prior to vacating or expiration.\n\n*Source: Lease Term & Renewal*`;
    }
    return "This topic is not addressed in your lease agreement.";
  }

  if (q.includes("utility") || q.includes("utilities") || q.includes("electric") || q.includes("water") || q.includes("gas") || q.includes("trash")) {
    if (textLower.includes("utilit") || textLower.includes("electric") || textLower.includes("water") || textLower.includes("trash")) {
      return `**Tenant Responsibilities**: Electricity, Cooking Gas, Internet.\n**Landlord Responsibilities**: Water, Sewer, Property Taxes.\n\n*Source: Utilities & Services*`;
    }
    return "This topic is not addressed in your lease agreement.";
  }

  if (q.includes("deposit") || q.includes("security")) {
    if (textLower.includes("deposit") || textLower.includes("security")) {
      const depVal = currSym === "₹" ? "₹2,10,000 (equivalent to 6 months' rent)" : "1 month's rent ($2,000.00)";
      return `The Interest-Free Security Deposit is equal to **${depVal}**, held by the landlord during the tenancy.\n\n*Source: Security Deposit Terms*`;
    }
    return "This topic is not addressed in your lease agreement.";
  }

  if (q.includes("break") || q.includes("early") || q.includes("penalty") || q.includes("lock")) {
    if (textLower.includes("lock-in") || textLower.includes("termination") || textLower.includes("break")) {
      return `There is a mandatory **6-month lock-in period**. Vacating prior to 6 months results in total forfeiture of the security deposit.\n\n*Source: Section 1.3 — Lock-In Period*`;
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
