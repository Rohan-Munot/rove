import {
  generateChatResponse,
  generateSearchQueries,
} from "@/lib/services/ai-service";

const query =
  "I want to travel to Tokyo, Japan; We are a couple traveling for 2 weeks; we love culture, temples and food. There is no budget preference";

const result = await generateChatResponse([{ role: "user", content: query }]);
console.log(JSON.stringify(result, null, 2));
