const API_BASE_URL = "http://localhost:5000";

export const checkHealth = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/`);
    // If the response is ok (status 200-299), return true
    return response.ok;
  } catch (error) {
    console.error("Backend health check failed:", error);
    return false;
  }
};

export const fetchTasks = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/tasks`);
    if (!response.ok) throw new Error("Failed to fetch tasks");
    return await response.json();
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return [];
  }
};

export const fetchTransactions = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/transactions`);
    if (!response.ok) throw new Error("Failed to fetch transactions");
    return await response.json();
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return [];
  }
};

export const fetchClients = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/clients`);
    if (!response.ok) throw new Error("Failed to fetch clients");
    return await response.json();
  } catch (error) {
    console.error("Error fetching clients:", error);
    return [];
  }
};
