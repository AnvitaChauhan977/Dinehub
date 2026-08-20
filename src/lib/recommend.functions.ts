import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const schema = z.object({
  craving: z.string().min(2).max(300),
  menu: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        description: z.string(),
        price: z.number(),
        is_veg: z.boolean(),
        category: z.string(),
      }),
    )
    .max(80),
  history: z.array(z.string()).max(30).optional(),
});

export const recommendDishes = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => schema.parse(data))
  .handler(async ({ data }) => {
    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) {
      return { ids: [] as string[], reason: "AI recommendations are not configured yet." };
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3.5-flash",
        messages: [
          {
            role: "system",
            content:
              "You are DineHub's food concierge. Pick 3 dishes from the provided menu that best match the diner's craving and past orders. Only use ids from the menu. Keep the reason to one warm sentence under 25 words.",
          },
          {
            role: "user",
            content: JSON.stringify({
              craving: data.craving,
              previously_ordered: data.history ?? [],
              menu: data.menu,
            }),
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "suggest",
              description: "Return the recommended dish ids",
              parameters: {
                type: "object",
                properties: {
                  ids: { type: "array", items: { type: "string" }, maxItems: 3 },
                  reason: { type: "string" },
                },
                required: ["ids", "reason"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "suggest" } },
      }),
    });

    if (response.status === 429) {
      return { ids: [] as string[], reason: "Too many requests right now — try again in a moment." };
    }
    if (response.status === 402) {
      return { ids: [] as string[], reason: "AI credits are exhausted. Please top up to continue." };
    }
    if (!response.ok) {
      return { ids: [] as string[], reason: "Couldn't fetch suggestions right now." };
    }

    const payload = (await response.json()) as {
      choices?: { message?: { tool_calls?: { function?: { arguments?: string } }[] } }[];
    };
    const args = payload.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
    if (!args) return { ids: [] as string[], reason: "Couldn't fetch suggestions right now." };

    const parsed = JSON.parse(args) as { ids?: string[]; reason?: string };
    const valid = new Set(data.menu.map((m) => m.id));
    return {
      ids: (parsed.ids ?? []).filter((id) => valid.has(id)).slice(0, 3),
      reason: parsed.reason ?? "",
    };
  });