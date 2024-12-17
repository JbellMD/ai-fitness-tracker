export const filterDataByDate = (data, filterType) => {
    const now = new Date();
    const startOf = {
      day: new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime(),
      week: new Date(now.setDate(now.getDate() - now.getDay())).getTime(),
      month: new Date(now.getFullYear(), now.getMonth(), 1).getTime(),
      year: new Date(now.getFullYear(), 0, 1).getTime(),
    };
  
    return data.filter((item) => {
      const timestamp = item.timestampNum; // Numeric timestamp
      return timestamp >= startOf[filterType];
    });
  };
  