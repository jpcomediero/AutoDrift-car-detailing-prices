import Anthropic from "@anthropic-ai/sdk";

export interface CarRecommendationResult {
  recognized: boolean;
  recommendedSize: string;
  confidence: "high" | "medium" | "low";
  reason: string;
}

export interface AvailableSize {
  name: string;
  examples: string;
}

/**
 * Intelligent local fallback vehicle classifier
 */
function localClassifyVehicle(
  carName: string,
  availableSizes: AvailableSize[]
): CarRecommendationResult {
  const query = carName.toLowerCase().trim();

  // Common vehicle mappings (especially popular in the Philippines & global market)
  const xxlMatches = [
    "hiace", "grandia", "alphard", "commuter", "urvan", "nv350", "staria",
    "starex", "carnival", "super grandia", "transit", "sprinter", "f-150",
    "silverado", "ram 1500", "tundra", "gls", "x7", "escalade", "suburban", "coaster"
  ];

  const xlMatches = [
    "fortuner", "montero", "everest", "hilux", "d-max", "dmax", "navara",
    "ranger", "raptor", "land cruiser", "lc300", "lc200", "prado", "patrol",
    "pajero", "tahoe", "explorer", "strada", "mu-x", "mux", "terra", "rodeo"
  ];

  const largeMatches = [
    "innova", "cr-v", "crv", "rav4", "forester", "tucson", "sportage",
    "cx-5", "cx5", "cx-8", "outlander", "xtrail", "x-trail", "santa fe",
    "sorento", "corolla cross", "hr-v", "hrv", "yaris cross", "kicks",
    "creta", "coolray", "territory", "br-v", "brv", "rush", "xpander", "avanza", "livina"
  ];

  const mediumMatches = [
    "vios", "civic", "city", "altis", "corolla", "mazda 3", "mazda3",
    "almera", "sentra", "accent", "elantra", "forte", "cerato", "camry",
    "accord", "sonata", "optima", "mazda 6", "bmw 3", "bmw 5", "c-class", "e-class"
  ];

  const smallMatches = [
    "wigo", "brio", "mirage", "picanto", "spresso", "s-presso", "celerio",
    "swift", "yaris", "jazz", "fit", "raize", "spark", "mini cooper",
    "beetle", "fiat 500", "i10", "morning"
  ];

  const findSize = (preferredName: string) => {
    const direct = availableSizes.find(
      (s) => s.name.toLowerCase() === preferredName.toLowerCase()
    );
    if (direct) return direct.name;
    return availableSizes[0]?.name || preferredName;
  };

  for (const car of xxlMatches) {
    if (query.includes(car)) {
      return {
        recognized: true,
        recommendedSize: findSize("XXL"),
        confidence: "high",
        reason: `${carName} is a large passenger van or heavy full-size vehicle.`,
      };
    }
  }

  for (const car of xlMatches) {
    if (query.includes(car)) {
      return {
        recognized: true,
        recommendedSize: findSize("XL"),
        confidence: "high",
        reason: `${carName} is a mid-to-full-size SUV or pickup truck.`,
      };
    }
  }

  for (const car of largeMatches) {
    if (query.includes(car)) {
      return {
        recognized: true,
        recommendedSize: findSize("Large"),
        confidence: "high",
        reason: `${carName} is a compact SUV, crossover, or compact MPV.`,
      };
    }
  }

  for (const car of mediumMatches) {
    if (query.includes(car)) {
      return {
        recognized: true,
        recommendedSize: findSize("Medium"),
        confidence: "high",
        reason: `${carName} is standard sedan or mid-size passenger car.`,
      };
    }
  }

  for (const car of smallMatches) {
    if (query.includes(car)) {
      return {
        recognized: true,
        recommendedSize: findSize("Small"),
        confidence: "high",
        reason: `${carName} is a compact hatchback or subcompact city vehicle.`,
      };
    }
  }

  return {
    recognized: false,
    recommendedSize: availableSizes[0]?.name || "Medium",
    confidence: "low",
    reason: "Could not definitively determine the car classification.",
  };
}

/**
 * Recommend vehicle size using Anthropic Claude API with reliable fallback
 */
export async function recommendCarSize(
  carName: string,
  availableSizes: AvailableSize[]
): Promise<CarRecommendationResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey || apiKey.startsWith("sk-ant-placeholder") || apiKey.trim() === "") {
    // If no API key configured, use local intelligent heuristic
    return localClassifyVehicle(carName, availableSizes);
  }

  try {
    const anthropic = new Anthropic({ apiKey });

    const sizeGuideDescriptions = availableSizes
      .map((s) => `- ${s.name}: ${s.examples}`)
      .join("\n");

    const prompt = `You are an expert car detailing size classifier.
A customer stated their vehicle is: "${carName}".

Here are the available size categories and examples for this detailing shop:
${sizeGuideDescriptions}

Task:
Determine which size category best fits this car.
Output ONLY strict valid JSON with no markdown formatting, no code blocks, no preamble, and no explanation outside the JSON:
{
  "recognized": boolean,
  "recommendedSize": string,
  "confidence": "high" | "medium" | "low",
  "reason": string
}

Rules:
1. "recommendedSize" must EXACTLY match one of the size names: ${availableSizes.map((s) => `"${s.name}"`).join(", ")}.
2. If you recognize the car, "recognized" is true and confidence is "high" or "medium".
3. If you do not recognize the car or it is gibberish, set "recognized": false, "recommendedSize": "${availableSizes[0]?.name || "Medium"}", "confidence": "low", and "reason": "Vehicle could not be identified.".
4. Provide a short, friendly explanation in "reason" (e.g., "Toyota Fortuner is a mid-to-full size 7-seater SUV").`;

    const response = await anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 250,
      temperature: 0.1,
      messages: [{ role: "user", content: prompt }],
    });

    const firstBlock = response.content[0];
    if (firstBlock.type === "text") {
      let rawText = firstBlock.text.trim();
      // Remove any markdown code fence if Claude added any
      if (rawText.startsWith("```json")) {
        rawText = rawText.replace(/^```json/, "").replace(/```$/, "").trim();
      } else if (rawText.startsWith("```")) {
        rawText = rawText.replace(/^```/, "").replace(/```$/, "").trim();
      }

      const parsed = JSON.parse(rawText) as CarRecommendationResult;

      // Validate recommendedSize exists in availableSizes
      const matchedSize = availableSizes.find(
        (s) => s.name.toLowerCase() === parsed.recommendedSize?.toLowerCase()
      );

      return {
        recognized: Boolean(parsed.recognized),
        recommendedSize: matchedSize ? matchedSize.name : (availableSizes[0]?.name || "Medium"),
        confidence: parsed.confidence || "medium",
        reason: parsed.reason || `Recommended category: ${matchedSize?.name || "Standard"}`,
      };
    }

    return localClassifyVehicle(carName, availableSizes);
  } catch (error) {
    console.warn("Anthropic API error, using fallback classifier:", error);
    return localClassifyVehicle(carName, availableSizes);
  }
}
