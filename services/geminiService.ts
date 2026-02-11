

export const generateEconomicHeadlines = async (topic: string): Promise<string[]> => {
  try {
    const response = await fetch('/api/generate-headlines', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ topic }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch suggestions');
    }

    const data = await response.json();
    return data.headlines || [];
  } catch (error) {
    console.error("Error fetching AI suggestions:", error);
    return ["حدث خطأ في الاتصال بالذكاء الاصطناعي"];
  }
};

