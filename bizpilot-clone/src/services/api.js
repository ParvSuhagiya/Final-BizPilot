const API_BASE_URL = 'http://localhost:5000';

export const checkHealth = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/`);
        return response.ok;
    } catch (error) {
        console.error("Backend health check failed:", error);
        return false;
    }
};

// --- TASKS ---
export const fetchTasks = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/tasks`);
        if (!response.ok) throw new Error('Failed to fetch tasks');
        return await response.json();
    } catch (error) {
        console.error("Error fetching tasks:", error);
        return [];
    }
};

export const addTask = async (taskData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/tasks`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(taskData)
        });
        if (!response.ok) throw new Error('Failed to add task');
        return await response.json();
    } catch (error) {
        console.error("Error adding task:", error);
        throw error;
    }
};

export const updateTask = async (id, taskData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(taskData)
        });
        if (!response.ok) throw new Error('Failed to update task');
        return await response.json();
    } catch (error) {
        console.error("Error updating task:", error);
        throw error;
    }
};

export const deleteTask = async (id) => {
    try {
        const response = await fetch(`${API_BASE_URL}/tasks/${id}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Failed to delete task');
        return await response.json();
    } catch (error) {
        console.error("Error deleting task:", error);
        throw error;
    }
};

// --- TRANSACTIONS ---
export const fetchTransactions = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/transactions`);
        if (!response.ok) throw new Error('Failed to fetch transactions');
        return await response.json();
    } catch (error) {
        console.error("Error fetching transactions:", error);
        return [];
    }
};

export const addTransaction = async (transactionData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/transactions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(transactionData)
        });
        if (!response.ok) throw new Error('Failed to add transaction');
        return await response.json();
    } catch (error) {
        console.error("Error adding transaction:", error);
        throw error;
    }
};

export const updateTransaction = async (id, transactionData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/transactions/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(transactionData)
        });
        if (!response.ok) throw new Error('Failed to update transaction');
        return await response.json();
    } catch (error) {
        console.error("Error updating transaction:", error);
        throw error;
    }
};

export const deleteTransaction = async (id) => {
    try {
        const response = await fetch(`${API_BASE_URL}/transactions/${id}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Failed to delete transaction');
        return await response.json();
    } catch (error) {
        console.error("Error deleting transaction:", error);
        throw error;
    }
};

// --- CLIENTS ---
export const fetchClients = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/clients`);
        if (!response.ok) throw new Error('Failed to fetch clients');
        return await response.json();
    } catch (error) {
        console.error("Error fetching clients:", error);
        return [];
    }
};

export const addClient = async (clientData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/clients`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(clientData)
        });
        if (!response.ok) throw new Error('Failed to add client');
        return await response.json();
    } catch (error) {
        console.error("Error adding client:", error);
        throw error;
    }
};

export const updateClient = async (id, clientData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/clients/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(clientData)
        });
        if (!response.ok) throw new Error('Failed to update client');
        return await response.json();
    } catch (error) {
        console.error("Error updating client:", error);
        throw error;
    }
};

export const deleteClient = async (id) => {
    try {
        const response = await fetch(`${API_BASE_URL}/clients/${id}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Failed to delete client');
        return await response.json();
    } catch (error) {
        console.error("Error deleting client:", error);
        throw error;
    }
};
