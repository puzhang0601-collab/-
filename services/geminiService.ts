
import { GoogleGenAI } from "@google/genai";

const SYSTEM_PROMPT = `你是一位专业的马尔代夫海岛旅游专家。你的任务是将用户输入的原始酒店促销信息，整理成规范、精美、易读的销售话术模板。

输出格式必须严格遵循以下模板（以"酒店："开头）：

酒店：[酒店中文名称] [酒店英文名称]
房型：[例如：2晚泳池沙滩别墅 + 2晚泳池水屋别墅]
接送：[例如：快艇往返接送/内飞快艇/水飞]
餐饮：[例如：含早晚餐 HB / 全餐 FB / 一等全包 AI]

以上打包价含以下礼遇:
• [提取核心打包礼遇，使用圆点符号]
• ...

[酒店名称]住店宾客专享：
[罗列通用型住店礼遇]
...

[酒店名称]亲子特色：
[如果是亲子友好酒店，提取具体针对儿童的优惠政策和设施活动]
...

温馨提示1：【如果对比携程等平台记得留意平台基本都是单房，没包含首都马累往返度假村接送飞机或者快艇】
温馨提示2：【我司提供代订服务和一对一在线服务，套餐包含为酒店自带，酒店有可能调整套餐内容且具有最终解释权】

注意事项：
1. 语言要通顺、吸引人。
2. 关键数字和时间要准确提取。
3. 如果输入内容包含取消政策，请根据需要决定是否放在文末，但主要侧重于展示亮点。
4. 保持排版整洁，使用适当的换行和符号。
5. 补充必要的表情符号，如 🌊, 🏨, 🍱, 🚤, 🧒 等增加亲和力。`;

export const formatHotelScript = async (rawInput: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: rawInput,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        temperature: 0.7,
      },
    });

    return response.text || "未能生成话术，请检查输入内容。";
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("AI 处理失败，请稍后重试。");
  }
};
